package com.company.cs.cs.notice.controller;

import com.company.cs.cs.notice.dto.NoticeRequest;
import com.company.cs.cs.notice.dto.NoticeResponse;
import com.company.cs.cs.notice.dto.NoticeStatusRequest;
import com.company.cs.cs.notice.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    // 유저 > 공지 목록 조회 (노출 Y만)
    @GetMapping("/notices")
    public List<NoticeResponse> getVisibleNotices() {
        return noticeService.getVisibleNotices();
    }

    // 관리자 > 전체 공지 목록 조회
    @GetMapping("/admin/notices")
    @PreAuthorize("hasRole('ADMIN')")
    public List<NoticeResponse> getAllNotices() {
        return noticeService.getAllNotices();
    }

    // 공지 상세 조회 (유저/관리자 공통 사용)
    @GetMapping("/notices/{noticeId}")
    public NoticeResponse getNotice(@PathVariable Long noticeId) {
        return noticeService.getNotice(noticeId);
    }

    // 공지 생성 (관리자)
    @PostMapping("/admin/notices")
    @PreAuthorize("hasRole('ADMIN')")
    public void createNotice(@RequestBody NoticeRequest request) {
        noticeService.createNotice(request);
    }

    // 공지 수정 (관리자)
    @PutMapping("/admin/notices/{noticeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public void updateNotice(@PathVariable Long noticeId,
                             @RequestBody NoticeRequest request) {
        noticeService.updateNotice(noticeId, request);
    }

    // 공지 노출/고정 상태 변경 (관리자)
    @PatchMapping("/admin/notices/{noticeId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public void updateNoticeStatus(@PathVariable Long noticeId,
                                   @RequestBody NoticeStatusRequest request) {
        noticeService.updateNoticeStatus(noticeId, request);
    }

    // 공지 삭제 (관리자)
    @DeleteMapping("/admin/notices/{noticeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteNotice(@PathVariable Long noticeId) {
        noticeService.deleteNotice(noticeId);
    }
}