package com.company.trade.service;

import com.company.sns.SnsEventPublisher;
import com.company.trade.dto.DealRequest;
import com.company.trade.dto.DealResponse;
import com.company.trade.dto.TicketResponse;
import com.company.trade.entity.Deal;
import com.company.trade.entity.DealStatus;
import com.company.trade.entity.Payments;
import com.company.trade.entity.PaymentsStatus;
import com.company.trade.entity.TicketStatus;
import com.company.trade.exception.DuplicateDealException;
import com.company.trade.entity.Ticket;
import com.company.trade.repository.DealRepository;
import com.company.trade.repository.PaymentsRepository;
import com.company.trade.repository.TicketRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * T009 — 양도 요청 ~ 완료 전체 흐름 검증 (SC-013, SC-014, SC-015, SC-016)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("T009: Deal 전체 상태 흐름 단위 테스트")
class DealFlowUnitTest {

    @Mock private TicketServiceApi ticketServiceApi;
    @Mock private DealRepository dealRepository;
    @Mock private PaymentsRepository paymentsRepository;
    @Mock private TicketRepository ticketRepository;
    @Mock private PaymentsService paymentsService;
    @Mock private SnsEventPublisher eventPublisher;
    @Mock private ServletRequestAttributes servletRequestAttributes;
    @Mock private HttpServletRequest httpServletRequest;

    @InjectMocks private DealService dealService;

    private final Long TICKET_ID = 1L;
    private final Long BUYER_ID = 100L;
    private final Long SELLER_ID = 200L;
    private final Long DEAL_ID = 10L;

    private TicketResponse availableTicket;
    private Deal pendingDeal;

    @BeforeEach
    void setUp() {
        availableTicket = TicketResponse.builder()
                .ticketId(TICKET_ID)
                .ownerId(SELLER_ID)
                .ticketStatus(TicketStatus.AVAILABLE)
                .sellingPrice(BigDecimal.valueOf(50000))
                .eventName("테스트 콘서트")
                .build();

        pendingDeal = Deal.builder()
                .dealId(DEAL_ID)
                .ticketId(TICKET_ID)
                .buyerId(BUYER_ID)
                .sellerId(SELLER_ID)
                .quantity(1)
                .dealStatus(DealStatus.PENDING)
                .dealAt(LocalDateTime.now())
                .expireAt(LocalDateTime.now().plusHours(1))
                .build();

        RequestContextHolder.setRequestAttributes(servletRequestAttributes);
        lenient().when(servletRequestAttributes.getRequest()).thenReturn(httpServletRequest);
        lenient().when(httpServletRequest.getHeader(anyString())).thenReturn("Bearer test-token");

        lenient().when(ticketRepository.findByIdWithPessimisticLock(any())).thenReturn(Optional.empty());
        lenient().when(dealRepository.existsByTicketIdAndDealStatus(any(), any())).thenReturn(false);
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.resetRequestAttributes();
    }

    // SC-013: 구매자가 티켓 ID로 양도 요청 시 Deal이 생성되고 PENDING 상태로 반환
    @Test
    @DisplayName("SC-013: 구매자가 양도 요청 시 PENDING Deal 생성")
    void createDeal_SC013_PendingDealCreated() {
        when(ticketServiceApi.getTicketById(TICKET_ID)).thenReturn(Optional.of(availableTicket));
        doNothing().when(ticketServiceApi).updateTicketStatus(any(), anyString(), anyString());
        when(dealRepository.existsByTicketIdAndDealStatus(TICKET_ID, DealStatus.PENDING)).thenReturn(false);
        when(dealRepository.save(any(Deal.class))).thenReturn(pendingDeal);

        DealRequest request = DealRequest.builder()
                .ticketId(TICKET_ID)
                .quantity(1)
                .expireAt(LocalDateTime.now().plusHours(1))
                .build();

        DealResponse response = dealService.createDealRequest(request, BUYER_ID);

        assertThat(response.getDealId()).isEqualTo(DEAL_ID);
        assertThat(response.getDealStatus()).isEqualTo(DealStatus.PENDING);
        assertThat(response.getBuyerId()).isEqualTo(BUYER_ID);
        assertThat(response.getSellerId()).isEqualTo(SELLER_ID);
        verify(dealRepository).save(any(Deal.class));
    }

    // SC-014: 판매자가 수락 시 ACCEPTED, 거절 시 REJECTED 전환
    @Test
    @DisplayName("SC-014: 판매자 수락 → ACCEPTED 전환")
    void acceptDeal_SC014_StatusBecomesAccepted() {
        Payments createdPayment = Payments.builder()
                .paymentStatus(PaymentsStatus.PENDING)
                .dealId(DEAL_ID)
                .buyerId(BUYER_ID)
                .sellerId(SELLER_ID)
                .price(BigDecimal.valueOf(50000))
                .build();

        when(dealRepository.findById(DEAL_ID)).thenReturn(Optional.of(pendingDeal));
        when(ticketServiceApi.getTicketById(TICKET_ID)).thenReturn(Optional.of(availableTicket));
        when(paymentsService.createPayment(any(), any())).thenReturn(createdPayment);
        when(dealRepository.save(any())).thenReturn(pendingDeal);

        dealService.acceptDeal(DEAL_ID, SELLER_ID);

        assertThat(pendingDeal.getDealStatus()).isEqualTo(DealStatus.ACCEPTED);
    }

    @Test
    @DisplayName("SC-014: 판매자 거절 → REJECTED 전환")
    void rejectDeal_SC014_StatusBecomesRejected() {
        when(dealRepository.findById(DEAL_ID)).thenReturn(Optional.of(pendingDeal));
        doNothing().when(ticketServiceApi).updateTicketStatus(any(), anyString(), anyString());
        when(dealRepository.save(any())).thenReturn(pendingDeal);

        dealService.rejectDeal(DEAL_ID, SELLER_ID, "개인 사정");

        assertThat(pendingDeal.getDealStatus()).isEqualTo(DealStatus.REJECTED);
        assertThat(pendingDeal.getCancelReason()).isEqualTo("개인 사정");
    }

    // SC-015: 결제 API 호출 성공 시 Deal 상태가 PAID로 변경 (updateDealStatus 통해 검증)
    @Test
    @DisplayName("SC-015: ACCEPTED → PAID 상태 전환")
    void updateDealStatus_SC015_AcceptedToPaid() {
        Deal acceptedDeal = Deal.builder()
                .dealId(DEAL_ID)
                .ticketId(TICKET_ID)
                .buyerId(BUYER_ID)
                .sellerId(SELLER_ID)
                .quantity(1)
                .dealStatus(DealStatus.ACCEPTED)
                .dealAt(LocalDateTime.now())
                .expireAt(LocalDateTime.now().plusHours(1))
                .build();

        when(dealRepository.findById(DEAL_ID)).thenReturn(Optional.of(acceptedDeal));

        DealResponse response = dealService.updateDealStatus(DEAL_ID, "PAID");

        assertThat(acceptedDeal.getDealStatus()).isEqualTo(DealStatus.PAID);
    }

    // SC-016: 거래 상태 이력(PENDING→ACCEPTED→PAID→COMPLETED) API 조회 가능
    @Test
    @DisplayName("SC-016: PAID → COMPLETED 구매 확정 전환")
    void confirmDeal_SC016_PaidToCompleted() {
        TicketResponse soldTicket = TicketResponse.builder()
                .ticketId(TICKET_ID)
                .ownerId(SELLER_ID)
                .ticketStatus(TicketStatus.SOLD)
                .sellingPrice(BigDecimal.valueOf(50000))
                .build();

        Deal paidDeal = Deal.builder()
                .dealId(DEAL_ID)
                .ticketId(TICKET_ID)
                .buyerId(BUYER_ID)
                .sellerId(SELLER_ID)
                .quantity(1)
                .dealStatus(DealStatus.PAID)
                .dealAt(LocalDateTime.now())
                .expireAt(LocalDateTime.now().plusHours(1))
                .build();

        Payments paidPayment = Payments.builder()
                .paymentStatus(PaymentsStatus.PAID)
                .dealId(DEAL_ID)
                .build();

        when(dealRepository.findById(DEAL_ID)).thenReturn(Optional.of(paidDeal));
        when(paymentsRepository.findByDealId(DEAL_ID)).thenReturn(Optional.of(paidPayment));
        when(ticketServiceApi.getTicketById(TICKET_ID)).thenReturn(Optional.of(soldTicket));
        doNothing().when(ticketServiceApi).updateTicketStatus(any(), anyString(), anyString());
        when(dealRepository.save(any())).thenReturn(paidDeal);

        dealService.confirmDeal(DEAL_ID, BUYER_ID);

        assertThat(paidDeal.getDealStatus()).isEqualTo(DealStatus.COMPLETED);
    }

    @Test
    @DisplayName("SC-016: 거래 상세 조회로 상태 확인 가능")
    void getDealDetail_SC016_StatusQueryable() {
        when(dealRepository.findById(DEAL_ID)).thenReturn(Optional.of(pendingDeal));
        when(ticketServiceApi.getTicketById(TICKET_ID)).thenReturn(Optional.of(availableTicket));

        var detail = dealService.getDealDetail(DEAL_ID);

        assertThat(detail).isNotNull();
        assertThat(detail.getDealId()).isEqualTo(DEAL_ID);
        assertThat(detail.getDealStatus()).isEqualTo(DealStatus.PENDING);
    }

    @Test
    @DisplayName("실패: 타인이 판매자로 수락 시도 → 예외 발생")
    void acceptDeal_Fail_WrongSeller() {
        when(dealRepository.findById(DEAL_ID)).thenReturn(Optional.of(pendingDeal));

        assertThatThrownBy(() -> dealService.acceptDeal(DEAL_ID, 999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("권한");
    }

    @Test
    @DisplayName("실패: 존재하지 않는 Deal 조회 시도")
    void getDealDetail_Fail_NotFound() {
        when(dealRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> dealService.getDealDetail(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("찾을 수 없습니다");
    }
}
