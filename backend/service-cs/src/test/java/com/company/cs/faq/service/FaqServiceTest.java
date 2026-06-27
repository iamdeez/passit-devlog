package com.company.cs.faq.service;

import com.company.cs.faq.domain.Faq;
import com.company.cs.faq.dto.FaqRequest;
import com.company.cs.faq.dto.FaqResponse;
import com.company.cs.faq.repository.FaqRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class FaqServiceTest {

    @Autowired
    private FaqService faqService;

    @Autowired
    private FaqRepository faqRepository;

    @BeforeEach
    void setUp() {
        faqRepository.deleteAll();
    }

    @Test
    @DisplayName("FAQ 생성 성공")
    void createFaq() {
        // given
        FaqRequest request = new FaqRequest();
        request.setCategory("결제");
        request.setQuestion("결제는 어떻게 하나요?");
        request.setAnswer("결제 페이지에서 결제하실 수 있습니다.");
        request.setSortOrder(1);

        // when
        FaqResponse response = faqService.createFaq(request);

        // then
        assertThat(response.getId()).isNotNull();
        assertThat(response.getCategory()).isEqualTo("결제");
        assertThat(response.getQuestion()).isEqualTo("결제는 어떻게 하나요?");
        assertThat(response.getAnswer()).isEqualTo("결제 페이지에서 결제하실 수 있습니다.");
    }

    @Test
    @DisplayName("FAQ 수정 성공")
    void updateFaq() {
        // given
        Faq faq = new Faq("결제", "질문", "답변", 1);
        Faq saved = faqRepository.save(faq);

        FaqRequest request = new FaqRequest();
        request.setCategory("거래");
        request.setQuestion("수정된 질문");
        request.setAnswer("수정된 답변");
        request.setSortOrder(2);

        // when
        FaqResponse response = faqService.updateFaq(saved.getId(), request);

        // then
        assertThat(response.getCategory()).isEqualTo("거래");
        assertThat(response.getQuestion()).isEqualTo("수정된 질문");
        assertThat(response.getAnswer()).isEqualTo("수정된 답변");
    }

    @Test
    @DisplayName("존재하지 않는 FAQ 수정 시 예외 발생")
    void updateNonExistentFaq() {
        // given
        FaqRequest request = new FaqRequest();
        request.setCategory("결제");
        request.setQuestion("질문");
        request.setAnswer("답변");

        // when & then
        assertThatThrownBy(() -> faqService.updateFaq(999L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("FAQ not found");
    }

    @Test
    @DisplayName("FAQ 노출 상태 변경 성공")
    void changeVisible() {
        // given
        Faq faq = new Faq("결제", "질문", "답변", 1);
        Faq saved = faqRepository.save(faq);
        assertThat(saved.isVisible()).isTrue();

        // when
        faqService.changeVisible(saved.getId(), false);

        // then
        Faq updated = faqRepository.findById(saved.getId()).orElseThrow();
        assertThat(updated.isVisible()).isFalse();
    }

    @Test
    @DisplayName("FAQ 삭제 성공")
    void deleteFaq() {
        // given
        Faq faq = new Faq("결제", "질문", "답변", 1);
        Faq saved = faqRepository.save(faq);

        // when
        faqService.deleteFaq(saved.getId());

        // then
        assertThat(faqRepository.findById(saved.getId())).isEmpty();
    }

    @Test
    @DisplayName("카테고리별 FAQ 조회")
    void getFaqsByCategory() {
        // given
        Faq faq1 = new Faq("결제", "결제 질문", "답변", 1);
        faq1.setVisible(true);
        faqRepository.save(faq1);

        Faq faq2 = new Faq("거래", "거래 질문", "답변", 1);
        faq2.setVisible(true);
        faqRepository.save(faq2);

        // when
        List<FaqResponse> responses = faqService.getFaqs("결제");

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getCategory()).isEqualTo("결제");
    }

    @Test
    @DisplayName("전체 FAQ 조회 (카테고리 없음)")
    void getFaqsWithoutCategory() {
        // given
        Faq faq1 = new Faq("결제", "질문1", "답변", 1);
        faq1.setVisible(true);
        faqRepository.save(faq1);

        Faq faq2 = new Faq("거래", "질문2", "답변", 1);
        faq2.setVisible(true);
        faqRepository.save(faq2);

        // when
        List<FaqResponse> responses = faqService.getFaqs(null);

        // then
        assertThat(responses).hasSize(2);
    }

    @Test
    @DisplayName("FAQ 단건 조회 성공")
    void getFaq() {
        // given
        Faq faq = new Faq("결제", "질문", "답변", 1);
        Faq saved = faqRepository.save(faq);

        // when
        FaqResponse response = faqService.getFaq(saved.getId());

        // then
        assertThat(response.getId()).isEqualTo(saved.getId());
        assertThat(response.getQuestion()).isEqualTo("질문");
    }

    @Test
    @DisplayName("존재하지 않는 FAQ 조회 시 예외 발생")
    void getNonExistentFaq() {
        // when & then
        assertThatThrownBy(() -> faqService.getFaq(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("FAQ not found");
    }
}
