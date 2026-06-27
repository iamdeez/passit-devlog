package com.company.cs.guide.controller;

import com.company.cs.guide.dto.GuideListItemResponse;
import com.company.cs.guide.dto.GuideRequest;
import com.company.cs.guide.dto.GuideResponse;
import com.company.cs.guide.dto.GuideVisibilityRequest;
import com.company.cs.guide.service.GuideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class GuideController {

    private final GuideService guideService;

    // =========================
    // 사용자용 목록
    // =========================
    @GetMapping("/guides")
    public List<GuideListItemResponse> getGuidesForUser() {
        return guideService.getGuidesForUser();
    }

    // =========================
    // 관리자용 목록
    // =========================
    @GetMapping("/admin/guides")
    public List<GuideListItemResponse> getGuidesForAdmin() {
        return guideService.getGuidesForAdmin();
    }

    // =========================
    // 단건 조회 (관리자 기준)
    // =========================
    @GetMapping("/admin/guides/{guideId}")
    public GuideResponse getGuide(@PathVariable Long guideId) {
        return guideService.getGuide(guideId);
    }

    // =========================
    // 생성
    // =========================
    @PostMapping("/admin/guides")
    public GuideResponse createGuide(@Valid @RequestBody GuideRequest request) {
        return guideService.createGuide(request);
    }

    // =========================
    // 전체 수정
    // =========================
    @PutMapping("/admin/guides/{guideId}")
    public GuideResponse updateGuide(
            @PathVariable Long guideId,
            @Valid @RequestBody GuideRequest request
    ) {
        return guideService.updateGuide(guideId, request);
    }

    // =========================
    // 노출 여부만 변경
    // =========================
    @PatchMapping("/admin/guides/{guideId}/visibility")
    public void changeVisibility(
            @PathVariable Long guideId,
            @Valid @RequestBody GuideVisibilityRequest request
    ) {
        guideService.updateVisibility(guideId, request.getVisible());
    }

    // =========================
    // 삭제
    // =========================
    @DeleteMapping("/admin/guides/{guideId}")
    public ResponseEntity<String> deleteGuide(@PathVariable Long guideId) {
        guideService.deleteGuide(guideId);
        return ResponseEntity.ok("삭제되었습니다.");
    }
}