package com.company.cs.faq.service;

import com.company.cs.faq.domain.Faq;
import com.company.cs.faq.dto.FaqRequest;
import com.company.cs.faq.dto.FaqResponse;
import com.company.cs.faq.repository.FaqRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FaqService {

    private final FaqRepository faqRepository;

    // 관리자: FAQ 생성
    public FaqResponse createFaq(FaqRequest request) {
        Faq faq = new Faq(
                request.getCategory(),
                request.getQuestion(),
                request.getAnswer(),
                request.getSortOrder()
        );
        return new FaqResponse(faqRepository.save(faq));
    }

    // 관리자: FAQ 수정
    public FaqResponse updateFaq(Long id, FaqRequest request) {
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("FAQ not found: " + id));

        faq.update(
                request.getCategory(),
                request.getQuestion(),
                request.getAnswer(),
                request.getSortOrder()
        );

        return new FaqResponse(faq);
    }

    // 관리자: FAQ 삭제
    public void deleteFaq(Long id) {
        faqRepository.deleteById(id);
    }

    // 관리자: FAQ 노출 상태 변경
    public void changeVisible(Long id, boolean visible) {
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("FAQ not found: " + id));
        faq.changeVisible(visible);
    }

    // 사용자: 카테고리별 FAQ 조회
    @Transactional(readOnly = true)
    public List<FaqResponse> getFaqs(String category) {
        List<Faq> faqs;
        if (category == null || category.isBlank()) {
            faqs = faqRepository.findByVisibleIsTrueOrderBySortOrderAscCreatedAtDesc();
        } else {
            faqs = faqRepository.findByCategoryAndVisibleIsTrueOrderBySortOrderAscCreatedAtDesc(category);
        }
        return faqs.stream().map(FaqResponse::new).toList();
    }

    // (선택) 단건 조회
    @Transactional(readOnly = true)
    public FaqResponse getFaq(Long id) {
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("FAQ not found: " + id));
        return new FaqResponse(faq);
    }

}