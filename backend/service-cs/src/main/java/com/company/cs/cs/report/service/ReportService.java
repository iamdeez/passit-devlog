package com.company.cs.cs.report.service;

import com.company.cs.cs.report.domain.Report;
import com.company.cs.cs.report.domain.ReportStatus;
import com.company.cs.cs.report.dto.ReportRequest;
import com.company.cs.cs.report.dto.ReportResponse;
import com.company.cs.cs.report.dto.ReportStatusUpdateRequest;
import com.company.cs.cs.report.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final ReportRepository reportRepository;

    // 신고 등록
    @Transactional
    public ReportResponse create(ReportRequest request) {
        Report report = Report.builder()
                .userId(request.getUserId())
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .reason(request.getReason())
                .status(ReportStatus.RECEIVED)  // 초기 상태
                .build();

        Report saved = reportRepository.save(report);
        return ReportResponse.from(saved);
    }

    // 내 신고 목록 조회 (status 필터)
    public List<ReportResponse> getMyReports(Long userId, String status) {
        List<Report> result;

        if (status == null || status.isBlank()) {
            result = reportRepository.findByUserId(userId);
        } else {
            ReportStatus reportStatus = ReportStatus.valueOf(status);
            result = reportRepository.findByUserIdAndStatus(userId, reportStatus);
        }

        return result.stream()
                .map(ReportResponse::from)
                .toList();
    }

    // 내 신고 단건 상세 조회
    public ReportResponse getMyReportDetail(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("신고를 찾을 수 없습니다. id=" + reportId));

        return ReportResponse.from(report);
    }

    // 관리자용 신고 목록 조회 (필터: status, category_id, reporter_id, target_user_id)
    public List<ReportResponse> getReportsForAdmin(
            String status,
            Long categoryId,
            Long reporterId,
            Long targetUserId
    ) {

        List<Report> result = reportRepository.findAll();

        // Apply filters
        return result.stream()
                .filter(r -> status == null || status.isBlank() || r.getStatus() == ReportStatus.valueOf(status))
                .filter(r -> reporterId == null || r.getUserId().equals(reporterId))
                .filter(r -> targetUserId == null || r.getTargetId().equals(targetUserId))
                // Note: categoryId filtering requires adding category field to Report entity
                // Skipping for now as Report doesn't have categoryId field
                .map(ReportResponse::from)
                .toList();
    }

    // 관리자용 단일 신고 상세 조회
    public ReportResponse getReportDetailForAdmin(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("신고를 찾을 수 없습니다. id=" + reportId));

        return ReportResponse.from(report);
    }

    // 신고 상태 변경 (관리자)
    @Transactional
    public ReportResponse updateStatus(Long reportId, ReportStatusUpdateRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("신고를 찾을 수 없습니다. id=" + reportId));

        ReportStatus newStatus = ReportStatus.valueOf(request.getStatus());
        report.updateStatus(newStatus);

        return ReportResponse.from(report);
    }
    public void deleteReport(Long id) {
        reportRepository.deleteById(id);
    }
}