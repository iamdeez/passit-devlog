package com.company.cs.cs.report.controller;

import com.company.cs.cs.report.dto.ReportRequest;
import com.company.cs.cs.report.dto.ReportResponse;
import com.company.cs.cs.report.dto.ReportStatusUpdateRequest;
import com.company.cs.cs.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping
public class ReportController {

    private final ReportService reportService;

    // 신고 등록 (회원/티켓에 대한 신고)
    // POST /reports
    @PostMapping("/reports")
    public ReportResponse createReport(@RequestBody ReportRequest request) {
        return reportService.create(request);
    }

    // 내 신고 목록 조회
    // GET /reports/my?status=RECEIVED
    @GetMapping("/reports/my")
    public List<ReportResponse> getMyReports(
            @RequestParam Long userId,       // 지금은 임시로 userId 받기
            @RequestParam(required = false) String status
    ) {
        return reportService.getMyReports(userId, status);
    }

    // 내 신고 상세 조회
    // GET /reports/{report_id}
    @GetMapping("/reports/{reportId}")
    public ReportResponse getMyReportDetail(@PathVariable Long reportId) {
        return reportService.getMyReportDetail(reportId);
    }

    // 관리자 - 신고 목록 조회 (필터)
    // GET /admin/reports?status=...&categoryId=...&reporterId=...&targetUserId=...
    @GetMapping("/admin/reports")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ReportResponse> getReportsForAdmin(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long reporterId,
            @RequestParam(required = false) Long targetUserId
    ) {
        return reportService.getReportsForAdmin(status, categoryId, reporterId, targetUserId);
    }

    // 관리자 - 신고 단일 상세 조회
    // GET /admin/reports/{report_id}
    @GetMapping("/admin/reports/{reportId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ReportResponse getReportDetailForAdmin(@PathVariable Long reportId) {
        return reportService.getReportDetailForAdmin(reportId);
    }

    // 관리자 - 신고 상태 변경
    // PATCH /admin/reports/{report_id}/status
    @PatchMapping("/admin/reports/{reportId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ReportResponse updateStatus(
            @PathVariable Long reportId,
            @RequestBody ReportStatusUpdateRequest request
    ) {
        return reportService.updateStatus(reportId, request);
    }
    // 관리자 - 신고 삭제
    @DeleteMapping("/admin/reports/{reportId}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteReport(@PathVariable Long reportId) {
        reportService.deleteReport(reportId);
    }
}