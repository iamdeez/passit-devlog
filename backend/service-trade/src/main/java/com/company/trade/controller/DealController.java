package com.company.trade.controller;


import com.company.trade.dto.*;
import com.company.trade.entity.DealStatus;
import com.company.trade.exception.DuplicateDealException;
import com.company.trade.service.DealService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.company.trade.dto.DealRejectRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.List;


@Slf4j
@RestController
@RequestMapping("/api/deals")
@RequiredArgsConstructor
public class DealController {

    private final DealService dealService;

    /**
     * [POST] 구매자가 특정 티켓에 대한 양도 요청을 생성합니다.
     * URI: POST /api/deals/request
     */

    @PostMapping("/request")
    public ResponseEntity<?> createDealRequest(
            @RequestBody DealRequest request
    ) {
        // (1) 실제 환경에서는 인증된 사용자 정보를 가져와야 합니다
        Long buyerId = request.getBuyerId();
        
        // 디버깅: 요청 데이터 로깅
        log.info("[DEAL-REQUEST] 받은 요청 데이터 - ticketId: {}, buyerId: {}, quantity: {}, expireAt: {}", 
                request.getTicketId(), buyerId, request.getQuantity(), request.getExpireAt());

        try {
            // 2. 서비스 호출
            DealResponse response = dealService.createDealRequest(request, buyerId);

            // 3. 201 Created 응답 반환
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (DuplicateDealException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("거래 요청 중 서버 오류가 발생했습니다.");
        }
    }

    // SC-016: GET /api/deals/{id} — deal 상태 단건 조회 (detail 별칭)
    @GetMapping("/{dealId}")
    public ResponseEntity<ApiResponse<DealDetailResponse>> getDeal(@PathVariable Long dealId) {
        return getDealDetail(dealId);
    }

    // SC-018: GET /api/deals?userId=&role=buyer|seller&status= — 거래 목록 필터 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<DealResponse>>> getDeals(
            @RequestParam Long userId,
            @RequestParam String role,
            @RequestParam(required = false) String status
    ) {
        try {
            DealStatus dealStatus = (status != null && !status.isBlank())
                    ? DealStatus.valueOf(status.toUpperCase()) : null;
            List<DealResponse> deals = dealService.getDeals(userId, role, dealStatus);
            return ResponseEntity.ok(ApiResponse.success(deals));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("거래 목록 조회 중 서버 오류가 발생했습니다."));
        }
    }


    @GetMapping("/{dealId}/detail")
    public ResponseEntity<ApiResponse<DealDetailResponse>> getDealDetail(
            @PathVariable Long dealId
    ) {
        try {
            // 1. Service에 상세 정보 조회 위임
            DealDetailResponse dealDetail = dealService.getDealDetail(dealId);

            // 2. 성공 응답 반환
            return ResponseEntity.ok(ApiResponse.success(dealDetail));

        } catch (EntityNotFoundException e) {
            // 거래 ID를 찾을 수 없는 경우
            return ResponseEntity
                    .status(404)
                    .body(ApiResponse.error("거래 ID " + dealId + "번을 찾을 수 없습니다."));

        } catch (Exception e) {
            // 기타 서버 내부 오류
            log.error("[DEAL-DETAIL-ERROR] 거래 상세 조회 중 오류 발생: dealId={}", dealId, e);
            return ResponseEntity
                    .status(500)
                    .body(ApiResponse.error("거래 상세 조회 중 서버 오류가 발생했습니다."));
        }
    }

    @PutMapping("/{dealId}/reject")
    public ResponseEntity<String> rejectDealRequest(
            @PathVariable Long dealId,
            @RequestBody DealRejectRequest request // 요청 본문(cancelReason)을 받습니다.
            // 🚨 2. Principal 매개변수 제거
    ) {

        // 1. 요청 본문에서 현재 사용자 ID 추출 (이 ID가 거래의 SellerID와 일치해야 함)
        Long sellerId = request.getCurrentUserId();

        // 2. 거절 사유 추출
        String cancelReason = request.getCancelReason();

        try {
            // 3. 서비스 호출: dealId, sellerId (권한 검증용), cancelReason을 전달합니다.
            dealService.rejectDeal(dealId, sellerId, cancelReason);

            // 4. 200 OK 응답 반환
            return ResponseEntity.ok("양도 요청이 성공적으로 거절되었습니다.");

        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            // 판매자 ID 불일치 또는 거래 상태 오류
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("거래 거절 중 서버 오류가 발생했습니다.");
        }
    }

    @PutMapping("/{dealId}/accept")
    public ResponseEntity<?> acceptDealRequest(
            @PathVariable Long dealId,
            @RequestBody DealRejectRequest request // 🚨 DealRejectRequest DTO를 받습니다.
    ) {

        // 1. 요청 본문에서 현재 사용자 ID 추출 (판매자 ID)
        Long sellerId = request.getCurrentUserId();

        // 🚨 [필수 로그] 서비스 호출 전 ID 확인 로그 추가
        log.info("[CONTROLLER] Accept Request. Deal ID: {}, Seller ID from Body: {}", dealId, sellerId);


        try {
            // 2. 서비스 호출
            // ⚠️ sellerId가 null이거나 0일 경우, 서비스 로직 시작 전에 예외 처리가 필요할 수 있습니다.
            if (sellerId == null || sellerId <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("판매자 ID가 유효하지 않습니다.");
            }

            dealService.acceptDeal(dealId, sellerId);

            // 3. 200 OK 응답 반환
            return ResponseEntity.ok("양도 요청이 성공적으로 수락되었습니다.");

        } catch (EntityNotFoundException e) {
            log.warn("[CLIENT_ERROR] Deal ID {} 조회 실패: {}", dealId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            // 거래 상태가 PENDING이 아니거나, 판매자 ID가 일치하지 않을 때 등 비즈니스 로직 오류
            log.warn("[BUSINESS_ERROR] Deal ID {} 비즈니스 규칙 위반: {}", dealId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("[SERVER_ERROR] Deal ID {} 수락 중 예상치 못한 오류 발생.", dealId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("거래 수락 중 서버 오류가 발생했습니다.");
        }
    }

    /**
     * [PUT] 특정 거래(Deal)의 상태를 지정된 새 상태로 변경합니다.
     * URL: PUT /deals/{dealId}/status/{newStatus}
     * * @param dealId 변경할 거래의 ID
     * @param newStatus 변경할 목표 상태 (예: ACCEPTED, REJECTED, PAID 등)
     * @return 변경된 거래의 응답 DTO (DealResponse)
     */
    @PutMapping("/{dealId}/status/{newStatus}")
    public ResponseEntity<?> updateDealStatus(
            @PathVariable Long dealId,
            @PathVariable String newStatus
    ) {
        try {
            // 1. 서비스에 상태 변경 요청을 위임
            DealResponse updatedDeal = dealService.updateDealStatus(dealId, newStatus);

            // 2. 성공 시 200 OK와 함께 변경된 거래 정보 반환
            // ⚠️ ApiResponse 클래스를 사용한다고 가정합니다.
            // return ResponseEntity.ok(ApiResponse.success(updatedDeal));
            return ResponseEntity.ok(updatedDeal); // 간단하게 DTO만 반환하도록 작성했습니다.

        } catch (IllegalArgumentException e) {
            // newStatus가 유효하지 않은 DealStatus Enum 값일 경우
            return ResponseEntity.badRequest().body("유효하지 않은 거래 상태: " + newStatus);
        } catch (EntityNotFoundException e) {
            // 거래 ID를 찾을 수 없는 경우
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            // 현재 상태에서 목표 상태로 변경할 수 없는 경우 (비즈니스 상태 전이 규칙 위반)
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // 기타 서버 내부 오류
            return ResponseEntity.internalServerError().body("거래 상태 변경 중 서버 오류 발생.");
        }
    }

    @PutMapping("/{dealId}/cancel")
    public ResponseEntity<?> cancelDeal(
            @PathVariable Long dealId,
            @RequestParam Long buyerId) {

        try {
            dealService.cancelDeal(dealId, buyerId);

            return ResponseEntity.ok().body("거래가 성공적으로 취소되었습니다.");

        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            // 권한 오류나 상태 오류 (예: 이미 취소된 거래)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("거래 취소 중 예상치 못한 오류가 발생했습니다: " + e.getMessage());
        }
    }


    /**
     * PUT /api/deals/{dealId}/confirm
     * 구매자가 결제를 최종 확정하고 거래를 완료 상태로 변경하는 API
     */
    @PutMapping("/{dealId}/confirm")
    public ResponseEntity<ApiResponse<Void>> confirmDeal(
            @PathVariable Long dealId,
            @RequestBody ConfirmDealRequest request
    ) {
        try {
            // 사용자 ID와 Deal ID를 서비스로 전달
            dealService.confirmDeal(dealId, request.getCurrentUserId());

            return ResponseEntity.ok(ApiResponse.success(null));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail(e.getMessage()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("거래 확정 처리 중 서버 오류가 발생했습니다."));
        }
    }

    // ======================================================
    // SC-017: 관리자 강제 완료/취소 엔드포인트
    // ======================================================

    @PutMapping("/admin/{dealId}/complete")
    public ResponseEntity<ApiResponse<Void>> adminCompleteDeal(@PathVariable Long dealId) {
        try {
            dealService.adminCompleteDeal(dealId);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("관리자 강제 완료 처리 중 서버 오류가 발생했습니다."));
        }
    }

    @PutMapping("/admin/{dealId}/cancel")
    public ResponseEntity<ApiResponse<Void>> adminCancelDeal(@PathVariable Long dealId) {
        try {
            dealService.adminCancelDeal(dealId);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("관리자 강제 취소 처리 중 서버 오류가 발생했습니다."));
        }
    }

}