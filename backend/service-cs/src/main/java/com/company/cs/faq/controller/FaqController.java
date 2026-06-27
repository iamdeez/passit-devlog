package com.company.cs.faq.controller;

import com.company.cs.faq.dto.FaqRequest;
import com.company.cs.faq.dto.FaqResponse;
import com.company.cs.faq.dto.FaqStatusRequest;
import com.company.cs.faq.service.FaqService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;

    // ===== 사용자용 =====

    // FAQ 목록 (카테고리 선택 가능)
    @GetMapping("/faqs")
    public List<FaqResponse> getFaqs(@RequestParam(required = false) String category) {
        return faqService.getFaqs(category);
    }

    // 단건 조회
    @GetMapping("/faqs/{id}")
    public FaqResponse getFaq(@PathVariable Long id) {
        return faqService.getFaq(id);
    }

    // ===== 관리자용 =====

    // FAQ 생성
    @PostMapping("/admin/faqs")
    @PreAuthorize("hasRole('ADMIN')")
    public FaqResponse createFaq(@RequestBody FaqRequest request) {
        return faqService.createFaq(request);
    }

    // FAQ 수정
    @PutMapping("/admin/faqs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public FaqResponse updateFaq(@PathVariable Long id,
                                 @RequestBody FaqRequest request) {
        return faqService.updateFaq(id, request);
    }

    // FAQ 노출 상태 변경
    @PatchMapping("/admin/faqs/{id}/visible")
    @PreAuthorize("hasRole('ADMIN')")
    public void changeVisible(@PathVariable Long id,
                              @RequestBody FaqStatusRequest request) {
        faqService.changeVisible(id, request.isVisible());
    }

    // FAQ 삭제
    @DeleteMapping("/admin/faqs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteFaq(@PathVariable Long id) {
        faqService.deleteFaq(id);
    }
}