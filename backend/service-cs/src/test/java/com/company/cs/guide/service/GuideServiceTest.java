package com.company.cs.guide.service;

import com.company.cs.guide.domain.Guide;
import com.company.cs.guide.dto.GuideListItemResponse;
import com.company.cs.guide.dto.GuideRequest;
import com.company.cs.guide.dto.GuideResponse;
import com.company.cs.guide.repository.GuideRepository;
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
class GuideServiceTest {

    @Autowired
    private GuideService guideService;

    @Autowired
    private GuideRepository guideRepository;

    @BeforeEach
    void setUp() {
        guideRepository.deleteAll();
    }

    @Test
    @DisplayName("가이드 생성 성공")
    void createGuide() {
        // given
        GuideRequest request = new GuideRequest();
        request.setTitle("가이드 제목");
        request.setContent("가이드 내용");
        request.setVisible(true);
        request.setSortOrder(1);

        // when
        GuideResponse response = guideService.createGuide(request);

        // then
        assertThat(response.getId()).isNotNull();
        assertThat(response.getTitle()).isEqualTo("가이드 제목");
        assertThat(response.getContent()).isEqualTo("가이드 내용");
        assertThat(response.isVisible()).isTrue();
        assertThat(response.getSortOrder()).isEqualTo(1);
    }

    @Test
    @DisplayName("사용자용 가이드 목록 조회 (노출된 것만)")
    void getGuidesForUser() {
        // given
        Guide guide1 = Guide.create("가이드1", "내용1", true, 1);
        guideRepository.save(guide1);

        Guide guide2 = Guide.create("가이드2", "내용2", false, 2);
        guideRepository.save(guide2);

        // when
        List<GuideListItemResponse> responses = guideService.getGuidesForUser();

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getTitle()).isEqualTo("가이드1");
    }

    @Test
    @DisplayName("관리자용 가이드 목록 조회 (전체)")
    void getGuidesForAdmin() {
        // given
        Guide guide1 = Guide.create("가이드1", "내용1", true, 1);
        guideRepository.save(guide1);

        Guide guide2 = Guide.create("가이드2", "내용2", false, 2);
        guideRepository.save(guide2);

        // when
        List<GuideListItemResponse> responses = guideService.getGuidesForAdmin();

        // then
        assertThat(responses).hasSize(2);
    }

    @Test
    @DisplayName("가이드 단건 조회 성공")
    void getGuide() {
        // given
        Guide guide = Guide.create("가이드", "내용", true, 1);
        Guide saved = guideRepository.save(guide);

        // when
        GuideResponse response = guideService.getGuide(saved.getId());

        // then
        assertThat(response.getId()).isEqualTo(saved.getId());
        assertThat(response.getTitle()).isEqualTo("가이드");
    }

    @Test
    @DisplayName("존재하지 않는 가이드 조회 시 예외 발생")
    void getNonExistentGuide() {
        // when & then
        assertThatThrownBy(() -> guideService.getGuide(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("가이드를 찾을 수 없습니다");
    }

    @Test
    @DisplayName("가이드 수정 성공")
    void updateGuide() {
        // given
        Guide guide = Guide.create("원래 제목", "원래 내용", true, 1);
        Guide saved = guideRepository.save(guide);

        GuideRequest request = new GuideRequest();
        request.setTitle("수정된 제목");
        request.setContent("수정된 내용");
        request.setVisible(false);
        request.setSortOrder(2);

        // when
        GuideResponse response = guideService.updateGuide(saved.getId(), request);

        // then
        assertThat(response.getTitle()).isEqualTo("수정된 제목");
        assertThat(response.getContent()).isEqualTo("수정된 내용");
        assertThat(response.isVisible()).isFalse();
        assertThat(response.getSortOrder()).isEqualTo(2);
    }

    @Test
    @DisplayName("가이드 노출 여부 변경 성공")
    void updateVisibility() {
        // given
        Guide guide = Guide.create("가이드", "내용", true, 1);
        Guide saved = guideRepository.save(guide);

        // when
        guideService.updateVisibility(saved.getId(), false);

        // then
        Guide updated = guideRepository.findById(saved.getId()).orElseThrow();
        assertThat(updated.isVisible()).isFalse();
    }

    @Test
    @DisplayName("가이드 삭제 성공")
    void deleteGuide() {
        // given
        Guide guide = Guide.create("가이드", "내용", true, 1);
        Guide saved = guideRepository.save(guide);

        // when
        guideService.deleteGuide(saved.getId());

        // then
        assertThat(guideRepository.findById(saved.getId())).isEmpty();
    }
}
