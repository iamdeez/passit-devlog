package com.company.cs.inquiry.controller;

import com.company.cs.inquiry.domain.InquiryStatus;
import com.company.cs.inquiry.dto.InquiryAnswerRequest;
import com.company.cs.inquiry.dto.InquiryDetailResponse;
import com.company.cs.inquiry.dto.InquiryListItemResponse;
import com.company.cs.inquiry.service.InquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/cs")
@PreAuthorize("hasRole('ADMIN')")
public class InquiryAdminController {

    private final InquiryService inquiryService;

    /**
     * 문의 목록 조회(관리자)
     * GET /admin/cs/inquiries?status=PENDING
     */
    @GetMapping("/inquiries")
    public List<InquiryListItemResponse> getInquiriesForAdmin(
            @RequestParam(required = false) InquiryStatus status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        // 지금은 status만 필터링, 나머지 파라미터는 추후 확장용
        return inquiryService.getAllForAdmin(status);
    }

    /**
     * 문의 상세 조회(관리자)
     * GET /admin/cs/inquiries/{inquiry_id}
     */
    @GetMapping("/inquiries/{inquiryId}")
    public InquiryDetailResponse getInquiryDetail(@PathVariable Long inquiryId) {
        return inquiryService.getDetailForAdmin(inquiryId);
    }

    /**
     * 문의 답변 등록/수정 + 상태 변경(관리자)
     * PATCH /admin/cs/inquiries/{inquiry_id}/answer
     */
    @PatchMapping("/inquiries/{inquiryId}/answer")
    public InquiryDetailResponse answerInquiry(
            @PathVariable Long inquiryId,
            @Valid @RequestBody InquiryAnswerRequest request
    ) {
        return inquiryService.answer(inquiryId, request);
    }
}