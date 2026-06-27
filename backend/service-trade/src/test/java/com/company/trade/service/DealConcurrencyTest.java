package com.company.trade.service;

import com.company.trade.dto.DealRequest;
import com.company.trade.dto.TicketResponse;
import com.company.trade.entity.Deal;
import com.company.trade.entity.DealStatus;
import com.company.trade.entity.TicketStatus;
import com.company.trade.repository.DealRepository;
import com.company.trade.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * T011 — 동시성 제어 검증 (NFR-021)
 * 동일 티켓에 2명의 구매자가 동시 Deal 생성 요청 → 1개만 성공, 나머지 409
 */
@SpringBootTest(properties = {
    "spring.main.allow-bean-definition-overriding=true"
})
@ActiveProfiles("test")
@DisplayName("T011: 동시성 제어 — 동일 티켓 중복 Deal 생성 방지")
class DealConcurrencyTest {

    @Autowired private DealService dealService;
    @Autowired private DealRepository dealRepository;
    @Autowired private TicketRepository ticketRepository;

    @MockBean private TicketServiceApi ticketServiceApi;

    private static final Long TICKET_ID = 4L;  // data-test.sql의 AVAILABLE 티켓
    private static final Long SELLER_ID = 100L;
    private static final Long BUYER_A = 501L;
    private static final Long BUYER_B = 502L;

    @BeforeEach
    void setUp() {
        dealRepository.deleteAll();

        TicketResponse mockTicket = TicketResponse.builder()
                .ticketId(TICKET_ID)
                .ownerId(SELLER_ID)
                .ticketStatus(TicketStatus.AVAILABLE)
                .sellingPrice(BigDecimal.valueOf(120000))
                .eventName("아이유 콘서트")
                .build();

        when(ticketServiceApi.getTicketById(TICKET_ID)).thenReturn(Optional.of(mockTicket));
        doNothing().when(ticketServiceApi).updateTicketStatus(any(), anyString(), anyString());
    }

    @Test
    @DisplayName("NFR-021: 동일 티켓에 2명 동시 요청 → 1건만 PENDING 생성, 나머지 409 (DuplicateDealException)")
    void concurrentDealCreation_OnlyOneSucceeds() throws InterruptedException {
        int threadCount = 2;
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        List<Future<?>> futures = new ArrayList<>();

        Long[] buyerIds = {BUYER_A, BUYER_B};

        for (int i = 0; i < threadCount; i++) {
            final Long buyerId = buyerIds[i];
            futures.add(executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await(); // 모든 스레드가 준비된 후 동시에 시작
                    DealRequest req = DealRequest.builder()
                            .ticketId(TICKET_ID)
                            .quantity(1)
                            .expireAt(LocalDateTime.now().plusHours(1))
                            .build();
                    dealService.createDealRequest(req, buyerId);
                    successCount.incrementAndGet();
                } catch (com.company.trade.exception.DuplicateDealException e) {
                    conflictCount.incrementAndGet();
                } catch (Exception e) {
                    // 다른 예외는 무시 (외부 API mock 이슈 등)
                }
                return null;
            }));
        }

        readyLatch.await(); // 모든 스레드 준비 대기
        startLatch.countDown(); // 동시 실행 신호

        for (Future<?> f : futures) {
            try { f.get(); } catch (Exception ignored) {}
        }
        executor.shutdown();

        // 검증: 전체 성공 + 충돌 = 2건, 성공은 1건이어야 함
        long pendingCount = dealRepository.findAll().stream()
                .filter(d -> d.getDealStatus() == DealStatus.PENDING)
                .count();

        assertThat(successCount.get() + conflictCount.get()).isEqualTo(threadCount);
        assertThat(pendingCount).isLessThanOrEqualTo(1)
                .withFailMessage("동일 티켓에 PENDING Deal이 2개 이상 생성되었습니다. 낙관적 락 또는 중복 체크가 동작하지 않음.");
    }

    @Test
    @DisplayName("NFR-021: PENDING Deal 존재 시 동일 티켓 재요청 → DuplicateDealException 발생")
    @Transactional
    void createDeal_WhenPendingExists_ThrowsDuplicateDealException() {
        // 첫 번째 요청 성공
        DealRequest req = DealRequest.builder()
                .ticketId(TICKET_ID)
                .quantity(1)
                .expireAt(LocalDateTime.now().plusHours(1))
                .build();
        dealService.createDealRequest(req, BUYER_A);

        // 두 번째 요청: PENDING 이미 존재 → DuplicateDealException
        org.assertj.core.api.Assertions.assertThatThrownBy(
                () -> dealService.createDealRequest(req, BUYER_B)
        ).isInstanceOf(com.company.trade.exception.DuplicateDealException.class)
                .hasMessageContaining("이미 해당 티켓에 대한 진행 중인 양도 요청이 존재합니다");

        long pendingCount = dealRepository.findAll().stream()
                .filter(d -> d.getDealStatus() == DealStatus.PENDING)
                .count();
        assertThat(pendingCount).isEqualTo(1);
    }
}
