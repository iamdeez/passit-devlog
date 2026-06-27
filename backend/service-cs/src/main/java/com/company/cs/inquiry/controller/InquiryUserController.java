package com.company.cs.inquiry.controller;

import com.company.cs.inquiry.dto.InquiryCreateRequest;
import com.company.cs.inquiry.dto.InquiryDetailResponse;
import com.company.cs.inquiry.dto.InquiryListItemResponse;
import com.company.cs.inquiry.service.InquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cs")
public class InquiryUserController {

    private final InquiryService inquiryService;

    // TODO: 나중에 Security 붙으면 인증 정보에서 userId 가져오면 됨
    private Long getCurrentUserId() {
        return 1L; // 지금은 테스트용 하드코딩
    }

    /**
     * 문의 등록
     * POST /cs/inquiries
     */
    @PostMapping("/inquiries")
    public InquiryDetailResponse createInquiry(
            @Valid @RequestBody InquiryCreateRequest request
    ) {
        Long userId = getCurrentUserId();
        return inquiryService.create(userId, request);
    }

    /**
     * 내 문의 목록 조회
     * GET /cs/inquiries
     *
     * status / startDate / endDate / keyword 파라미터는
     * 일단 받기만 하고, 지금은 서비스에서 안 씀(나중 확장용)
     */
    @GetMapping("/inquiries")
    public List<InquiryListItemResponse> getMyInquiries(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String keyword
    ) {
        Long userId = getCurrentUserId();
        return inquiryService.getMyInquiries(userId);
    }

    /**
     * 내 문의 상세 조회
     * GET /cs/inquiries/{inquiry_id}
     */
    @GetMapping("/inquiries/{inquiryId}")
    public InquiryDetailResponse getMyInquiryDetail(@PathVariable Long inquiryId) {
        Long userId = getCurrentUserId();
        return inquiryService.getMyInquiryDetail(userId, inquiryId);
    }

    /**
     * 문의 삭제 (사용자)
     * DELETE /cs/inquiries/{inquiry_id}
     */
    @DeleteMapping("/inquiries/{inquiryId}")
    public void deleteMyInquiry(@PathVariable Long inquiryId) {
        Long userId = getCurrentUserId();
        inquiryService.deleteMyInquiry(userId, inquiryId);
    }
}