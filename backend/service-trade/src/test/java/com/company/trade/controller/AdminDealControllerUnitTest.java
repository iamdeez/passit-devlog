package com.company.trade.controller;

import com.company.trade.dto.ApiResponse;
import com.company.trade.dto.DealResponse;
import com.company.trade.entity.DealStatus;
import com.company.trade.service.DealService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * T010 — 관리자 강제 완료/취소 & 목록 조회 검증 (SC-017, SC-018)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("T010: 관리자 Deal 엔드포인트 단위 테스트")
class AdminDealControllerUnitTest {

    @Mock private DealService dealService;

    @InjectMocks private DealController dealController;

    private final Long DEAL_ID = 1L;
    private final Long USER_ID = 100L;

    private DealResponse sampleDealResponse;

    @BeforeEach
    void setUp() {
        sampleDealResponse = DealResponse.builder()
                .dealId(DEAL_ID)
                .ticketId(1L)
                .buyerId(USER_ID)
                .sellerId(200L)
                .quantity(1)
                .dealAt(LocalDateTime.now())
                .dealStatus(DealStatus.PAID)
                .build();
    }

    // SC-017: 관리자 강제 완료
    @Test
    @DisplayName("SC-017: 관리자 강제 완료 API → 200 OK")
    void adminCompleteDeal_SC017_Returns200() {
        doNothing().when(dealService).adminCompleteDeal(DEAL_ID);

        ResponseEntity<ApiResponse<Void>> response = dealController.adminCompleteDeal(DEAL_ID);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        verify(dealService).adminCompleteDeal(DEAL_ID);
    }

    // SC-017: 관리자 강제 취소
    @Test
    @DisplayName("SC-017: 관리자 강제 취소 API → 200 OK")
    void adminCancelDeal_SC017_Returns200() {
        doNothing().when(dealService).adminCancelDeal(DEAL_ID);

        ResponseEntity<ApiResponse<Void>> response = dealController.adminCancelDeal(DEAL_ID);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        verify(dealService).adminCancelDeal(DEAL_ID);
    }

    @Test
    @DisplayName("SC-017: 이미 종료된 거래 강제 완료 시도 → 400 Bad Request")
    void adminCompleteDeal_Fail_AlreadyClosed() {
        doThrow(new IllegalArgumentException("이미 종료된 거래입니다."))
                .when(dealService).adminCompleteDeal(DEAL_ID);

        ResponseEntity<ApiResponse<Void>> response = dealController.adminCompleteDeal(DEAL_ID);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    // SC-018: 구매자 역할로 상태 필터 목록 조회
    @Test
    @DisplayName("SC-018: 구매자 role=buyer&status=PAID 목록 조회 → 200 + 목록 반환")
    void getDeals_SC018_BuyerPaidFilter() {
        when(dealService.getDeals(USER_ID, "buyer", DealStatus.PAID))
                .thenReturn(List.of(sampleDealResponse));

        ResponseEntity<ApiResponse<List<DealResponse>>> response =
                dealController.getDeals(USER_ID, "buyer", "PAID");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).hasSize(1);
        assertThat(response.getBody().getData().get(0).getDealStatus()).isEqualTo(DealStatus.PAID);
        verify(dealService).getDeals(USER_ID, "buyer", DealStatus.PAID);
    }

    // SC-018: 판매자 역할로 상태 필터 없이 목록 조회
    @Test
    @DisplayName("SC-018: 판매자 role=seller 전체 목록 조회 → 200 + 목록 반환")
    void getDeals_SC018_SellerAllDeals() {
        when(dealService.getDeals(200L, "seller", null))
                .thenReturn(List.of(sampleDealResponse));

        ResponseEntity<ApiResponse<List<DealResponse>>> response =
                dealController.getDeals(200L, "seller", null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getData()).hasSize(1);
        verify(dealService).getDeals(200L, "seller", null);
    }

    @Test
    @DisplayName("SC-018: 잘못된 role 값 → 400 Bad Request")
    void getDeals_Fail_InvalidRole() {
        when(dealService.getDeals(USER_ID, "admin", null))
                .thenThrow(new IllegalArgumentException("role은 buyer 또는 seller여야 합니다."));

        ResponseEntity<ApiResponse<List<DealResponse>>> response =
                dealController.getDeals(USER_ID, "admin", null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("SC-018: 잘못된 status 값 → 400 Bad Request")
    void getDeals_Fail_InvalidStatus() {
        ResponseEntity<ApiResponse<List<DealResponse>>> response =
                dealController.getDeals(USER_ID, "buyer", "INVALID_STATUS");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
}
