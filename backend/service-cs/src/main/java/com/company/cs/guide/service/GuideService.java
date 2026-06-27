package com.company.cs.guide.service;

import com.company.cs.guide.domain.Guide;
import com.company.cs.guide.dto.GuideListItemResponse;
import com.company.cs.guide.dto.GuideRequest;
import com.company.cs.guide.dto.GuideResponse;
import com.company.cs.guide.repository.GuideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GuideService {

    private final GuideRepository guideRepository;

    // *** 사용자용 목록 ***
    public List<GuideListItemResponse> getGuidesForUser() {
        return guideRepository.findByVisibleTrueOrderBySortOrderAscCreatedAtAsc()
                .stream()
                .map(GuideListItemResponse::from)
                .toList();
    }

    // *** 관리자용 목록 ***
    public List<GuideListItemResponse> getGuidesForAdmin() {
        return guideRepository.findAllByOrderBySortOrderAscCreatedAtAsc()
                .stream()
                .map(GuideListItemResponse::from)
                .toList();
    }

    // 단건 조회
    public GuideResponse getGuide(Long id) {
        Guide guide = guideRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("가이드를 찾을 수 없습니다."));
        return GuideResponse.from(guide);
    }

    // 생성
    @Transactional
    public GuideResponse createGuide(GuideRequest request) {
        Guide guide = Guide.create(
                request.getTitle(),
                request.getContent(),
                request.getVisible(),
                request.getSortOrder()
        );
        return GuideResponse.from(guideRepository.save(guide));
    }

    // 전체 수정
    @Transactional
    public GuideResponse updateGuide(Long id, GuideRequest request) {
        Guide guide = guideRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("가이드를 찾을 수 없습니다."));

        guide.update(
                request.getTitle(),
                request.getContent(),
                request.getVisible(),
                request.getSortOrder()
        );

        return GuideResponse.from(guide);
    }

    // 노출 여부 변경
    @Transactional
    public void updateVisibility(Long id, boolean visible) {
        Guide guide = guideRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("가이드를 찾을 수 없습니다."));

        guide.updateVisibility(visible);
    }

    // 삭제
    @Transactional
    public void deleteGuide(Long id) {
        guideRepository.deleteById(id);
    }
}