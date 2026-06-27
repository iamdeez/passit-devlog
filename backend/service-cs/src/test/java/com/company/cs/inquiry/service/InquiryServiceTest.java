package com.company.cs.inquiry.service;

import com.company.cs.inquiry.domain.Inquiry;
import com.company.cs.inquiry.domain.InquiryStatus;
import com.company.cs.inquiry.dto.InquiryAnswerRequest;
import com.company.cs.inquiry.dto.InquiryCreateRequest;
import com.company.cs.inquiry.dto.InquiryDetailResponse;
import com.company.cs.inquiry.dto.InquiryListItemResponse;
import com.company.cs.inquiry.repository.InquiryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class InquiryServiceTest {

    @Autowired
    private InquiryService inquiryService;

    @Autowired
    private InquiryRepository inquiryRepository;

    @BeforeEach
    void setUp() {
        inquiryRepository.deleteAll();
    }

    @Test
    @DisplayName("문의 등록 성공")
    void createInquiry() {
        // given
        InquiryCreateRequest request = new InquiryCreateRequest();
        request.setType("계정");
        request.setTitle("문의 제목");
        request.setContent("문의 내용");
        request.setImageUrls(Arrays.asList("http://example.com/image1.jpg"));

        // when
        InquiryDetailResponse response = inquiryService.create(1L, request);

        // then
        assertThat(response.getId()).isNotNull();
        assertThat(response.getType()).isEqualTo("계정");
        assertThat(response.getTitle()).isEqualTo("문의 제목");
        assertThat(response.getContent()).isEqualTo("문의 내용");
        assertThat(response.getStatus()).isEqualTo(InquiryStatus.PENDING);
        assertThat(response.getImageUrls()).hasSize(1);
    }

    @Test
    @DisplayName("내 문의 목록 조회")
    void getMyInquiries() {
        // given
        Inquiry inquiry1 = Inquiry.builder()
                .userId(1L)
                .type("계정")
                .title("문의1")
                .content("내용1")
                .status(InquiryStatus.PENDING)
                .deleted(false)
                .build();
        inquiryRepository.save(inquiry1);

        Inquiry inquiry2 = Inquiry.builder()
                .userId(1L)
                .type("거래")
                .title("문의2")
                .content("내용2")
                .status(InquiryStatus.ANSWERED)
                .deleted(false)
                .build();
        inquiryRepository.save(inquiry2);

        Inquiry inquiry3 = Inquiry.builder()
                .userId(2L)
                .type("계정")
                .title("다른 사용자 문의")
                .content("내용")
                .status(InquiryStatus.PENDING)
                .deleted(false)
                .build();
        inquiryRepository.save(inquiry3);

        // when
        List<InquiryListItemResponse> responses = inquiryService.getMyInquiries(1L);

        // then
        assertThat(responses).hasSize(2);
        assertThat(responses).extracting("title").containsExactlyInAnyOrder("문의1", "문의2");
    }

    @Test
    @DisplayName("문의 삭제 성공 (답변 전)")
    void deleteMyInquiry() {
        // given
        Inquiry inquiry = Inquiry.builder()
                .userId(1L)
                .type("계정")
                .title("문의")
                .content("내용")
                .status(InquiryStatus.PENDING)
                .deleted(false)
                .build();
        Inquiry saved = inquiryRepository.save(inquiry);

        // when
        inquiryService.deleteMyInquiry(1L, saved.getId());

        // then
        Inquiry deleted = inquiryRepository.findById(saved.getId()).orElseThrow();
        assertThat(deleted.isDeleted()).isTrue();
    }

    @Test
    @DisplayName("답변 완료된 문의 삭제 시 예외 발생")
    void deleteAnsweredInquiry() {
        // given
        Inquiry inquiry = Inquiry.builder()
                .userId(1L)
                .type("계정")
                .title("문의")
                .content("내용")
                .status(InquiryStatus.ANSWERED)
                .deleted(false)
                .build();
        Inquiry saved = inquiryRepository.save(inquiry);

        // when & then
        assertThatThrownBy(() -> inquiryService.deleteMyInquiry(1L, saved.getId()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("답변 완료된 문의는 삭제할 수 없습니다");
    }

    @Test
    @DisplayName("다른 사용자의 문의 삭제 시 예외 발생")
    void deleteOtherUserInquiry() {
        // given
        Inquiry inquiry = Inquiry.builder()
                .userId(1L)
                .type("계정")
                .title("문의")
                .content("내용")
                .status(InquiryStatus.PENDING)
                .deleted(false)
                .build();
        Inquiry saved = inquiryRepository.save(inquiry);

        // when & then
        assertThatThrownBy(() -> inquiryService.deleteMyInquiry(2L, saved.getId()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("본인 문의만 삭제할 수 있습니다");
    }

    @Test
    @DisplayName("관리자용 문의 목록 조회 (전체)")
    void getAllForAdmin() {
        // given
        Inquiry inquiry1 = Inquiry.builder()
                .userId(1L)
                .type("계정")
                .title("문의1")
                .content("내용1")
                .status(InquiryStatus.PENDING)
                .deleted(false)
                .build();
        inquiryRepository.save(inquiry1);

        Inquiry inquiry2 = Inquiry.builder()
                .userId(2L)
                .type("거래")
                .title("문의2")
                .content("내용2")
                .status(InquiryStatus.ANSWERED)
                .deleted(false)
                .build();
        inquiryRepository.save(inquiry2);

        // when
        List<InquiryListItemResponse> responses = inquiryService.getAllForAdmin(null);

        // then
        assertThat(responses).hasSize(2);
    }

    @Test
    @DisplayName("관리자용 문의 목록 조회 (상태별 필터)")
    void getAllForAdminByStatus() {
        // given
        Inquiry inquiry1 = Inquiry.builder()
                .userId(1L)
                .type("계정")
                .title("문의1")
                .content("내용1")
                .status(InquiryStatus.PENDING)
                .deleted(false)
                .build();
        inquiryRepository.save(inquiry1);

        Inquiry inquiry2 = Inquiry.builder()
                .userId(2L)
                .type("거래")
                .title("문의2")
                .content("내용2")
                .status(InquiryStatus.ANSWERED)
                .deleted(false)
                .build();
        inquiryRepository.save(inquiry2);

        // when
        List<InquiryListItemResponse> responses = inquiryService.getAllForAdmin(InquiryStatus.PENDING);

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getStatus()).isEqualTo(InquiryStatus.PENDING);
    }

    @Test
    @DisplayName("문의 답변 등록 성공")
    void answerInquiry() {
        // given
        Inquiry inquiry = Inquiry.builder()
                .userId(1L)
                .type("계정")
                .title("문의")
                .content("내용")
                .status(InquiryStatus.PENDING)
                .deleted(false)
                .build();
        Inquiry saved = inquiryRepository.save(inquiry);

        InquiryAnswerRequest request = new InquiryAnswerRequest();
        request.setAnswerContent("답변 내용입니다");
        request.setStatus(InquiryStatus.ANSWERED);

        // when
        InquiryDetailResponse response = inquiryService.answer(saved.getId(), request);

        // then
        assertThat(response.getAnswerContent()).isEqualTo("답변 내용입니다");
        assertThat(response.getStatus()).isEqualTo(InquiryStatus.ANSWERED);
        assertThat(response.getAnsweredAt()).isNotNull();
    }

    @Test
    @DisplayName("존재하지 않는 문의 답변 시 예외 발생")
    void answerNonExistentInquiry() {
        // given
        InquiryAnswerRequest request = new InquiryAnswerRequest();
        request.setAnswerContent("답변");
        request.setStatus(InquiryStatus.ANSWERED);

        // when & then
        assertThatThrownBy(() -> inquiryService.answer(999L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("문의가 존재하지 않습니다");
    }
}
