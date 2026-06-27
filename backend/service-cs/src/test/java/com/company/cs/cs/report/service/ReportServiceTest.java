package com.company.cs.cs.report.service;

import com.company.cs.cs.report.domain.Report;
import com.company.cs.cs.report.domain.ReportStatus;
import com.company.cs.cs.report.dto.ReportRequest;
import com.company.cs.cs.report.dto.ReportResponse;
import com.company.cs.cs.report.dto.ReportStatusUpdateRequest;
import com.company.cs.cs.report.repository.ReportRepository;
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
class ReportServiceTest {

    @Autowired
    private ReportService reportService;

    @Autowired
    private ReportRepository reportRepository;

    @BeforeEach
    void setUp() {
        reportRepository.deleteAll();
    }

    @Test
    @DisplayName("신고 등록 성공")
    void createReport() {
        // given
        ReportRequest request = new ReportRequest();
        request.setUserId(1L);
        request.setTargetType("USER");
        request.setTargetId(2L);
        request.setReason("부적절한 행동");

        // when
        ReportResponse response = reportService.create(request);

        // then
        assertThat(response.getId()).isNotNull();
        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getTargetType()).isEqualTo("USER");
        assertThat(response.getTargetId()).isEqualTo(2L);
        assertThat(response.getReason()).isEqualTo("부적절한 행동");
        assertThat(response.getStatus()).isEqualTo("RECEIVED");
    }

    @Test
    @DisplayName("내 신고 목록 조회")
    void getMyReports() {
        // given
        Report report1 = Report.builder()
                .userId(1L)
                .targetType("USER")
                .targetId(2L)
                .reason("신고1")
                .status(ReportStatus.RECEIVED)
                .build();
        reportRepository.save(report1);

        Report report2 = Report.builder()
                .userId(1L)
                .targetType("TICKET")
                .targetId(3L)
                .reason("신고2")
                .status(ReportStatus.IN_PROGRESS)
                .build();
        reportRepository.save(report2);

        Report report3 = Report.builder()
                .userId(2L)
                .targetType("USER")
                .targetId(1L)
                .reason("다른 사용자 신고")
                .status(ReportStatus.RECEIVED)
                .build();
        reportRepository.save(report3);

        // when
        List<ReportResponse> responses = reportService.getMyReports(1L, null);

        // then
        assertThat(responses).hasSize(2);
    }

    @Test
    @DisplayName("내 신고 목록 조회 (상태별 필터)")
    void getMyReportsByStatus() {
        // given
        Report report1 = Report.builder()
                .userId(1L)
                .targetType("USER")
                .targetId(2L)
                .reason("신고1")
                .status(ReportStatus.RECEIVED)
                .build();
        reportRepository.save(report1);

        Report report2 = Report.builder()
                .userId(1L)
                .targetType("TICKET")
                .targetId(3L)
                .reason("신고2")
                .status(ReportStatus.IN_PROGRESS)
                .build();
        reportRepository.save(report2);

        // when
        List<ReportResponse> responses = reportService.getMyReports(1L, "RECEIVED");

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getStatus()).isEqualTo("RECEIVED");
    }

    @Test
    @DisplayName("신고 단건 조회 성공")
    void getMyReportDetail() {
        // given
        Report report = Report.builder()
                .userId(1L)
                .targetType("USER")
                .targetId(2L)
                .reason("신고 사유")
                .status(ReportStatus.RECEIVED)
                .build();
        Report saved = reportRepository.save(report);

        // when
        ReportResponse response = reportService.getMyReportDetail(saved.getId());

        // then
        assertThat(response.getId()).isEqualTo(saved.getId());
        assertThat(response.getReason()).isEqualTo("신고 사유");
    }

    @Test
    @DisplayName("존재하지 않는 신고 조회 시 예외 발생")
    void getNonExistentReport() {
        // when & then
        assertThatThrownBy(() -> reportService.getMyReportDetail(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("신고를 찾을 수 없습니다");
    }

    @Test
    @DisplayName("신고 상태 변경 성공")
    void updateStatus() {
        // given
        Report report = Report.builder()
                .userId(1L)
                .targetType("USER")
                .targetId(2L)
                .reason("신고")
                .status(ReportStatus.RECEIVED)
                .build();
        Report saved = reportRepository.save(report);

        ReportStatusUpdateRequest request = new ReportStatusUpdateRequest();
        request.setStatus("IN_PROGRESS");

        // when
        ReportResponse response = reportService.updateStatus(saved.getId(), request);

        // then
        assertThat(response.getStatus()).isEqualTo("IN_PROGRESS");
    }

    @Test
    @DisplayName("잘못된 상태 값으로 변경 시 예외 발생")
    void updateStatusWithInvalidValue() {
        // given
        Report report = Report.builder()
                .userId(1L)
                .targetType("USER")
                .targetId(2L)
                .reason("신고")
                .status(ReportStatus.RECEIVED)
                .build();
        Report saved = reportRepository.save(report);

        ReportStatusUpdateRequest request = new ReportStatusUpdateRequest();
        request.setStatus("INVALID_STATUS");

        // when & then
        assertThatThrownBy(() -> reportService.updateStatus(saved.getId(), request))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("신고 삭제 성공")
    void deleteReport() {
        // given
        Report report = Report.builder()
                .userId(1L)
                .targetType("USER")
                .targetId(2L)
                .reason("신고")
                .status(ReportStatus.RECEIVED)
                .build();
        Report saved = reportRepository.save(report);

        // when
        reportService.deleteReport(saved.getId());

        // then
        assertThat(reportRepository.findById(saved.getId())).isEmpty();
    }

    @Test
    @DisplayName("관리자용 신고 목록 조회 (필터 없음)")
    void getReportsForAdmin() {
        // given
        Report report1 = Report.builder()
                .userId(1L)
                .targetType("USER")
                .targetId(2L)
                .reason("신고1")
                .status(ReportStatus.RECEIVED)
                .build();
        reportRepository.save(report1);

        Report report2 = Report.builder()
                .userId(2L)
                .targetType("TICKET")
                .targetId(3L)
                .reason("신고2")
                .status(ReportStatus.IN_PROGRESS)
                .build();
        reportRepository.save(report2);

        // when
        List<ReportResponse> responses = reportService.getReportsForAdmin(null, null, null, null);

        // then
        assertThat(responses).hasSize(2);
    }

    @Test
    @DisplayName("관리자용 신고 목록 조회 (상태 필터)")
    void getReportsForAdminByStatus() {
        // given
        Report report1 = Report.builder()
                .userId(1L)
                .targetType("USER")
                .targetId(2L)
                .reason("신고1")
                .status(ReportStatus.RECEIVED)
                .build();
        reportRepository.save(report1);

        Report report2 = Report.builder()
                .userId(2L)
                .targetType("TICKET")
                .targetId(3L)
                .reason("신고2")
                .status(ReportStatus.IN_PROGRESS)
                .build();
        reportRepository.save(report2);

        // when
        List<ReportResponse> responses = reportService.getReportsForAdmin("RECEIVED", null, null, null);

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getStatus()).isEqualTo("RECEIVED");
    }

    @Test
    @DisplayName("관리자용 신고 목록 조회 (신고자 ID 필터)")
    void getReportsForAdminByReporterId() {
        // given
        Report report1 = Report.builder()
                .userId(1L)
                .targetType("USER")
                .targetId(2L)
                .reason("신고1")
                .status(ReportStatus.RECEIVED)
                .build();
        reportRepository.save(report1);

        Report report2 = Report.builder()
                .userId(2L)
                .targetType("TICKET")
                .targetId(3L)
                .reason("신고2")
                .status(ReportStatus.IN_PROGRESS)
                .build();
        reportRepository.save(report2);

        // when
        List<ReportResponse> responses = reportService.getReportsForAdmin(null, null, 1L, null);

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getUserId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("관리자용 신고 단건 조회 성공")
    void getReportDetailForAdmin() {
        // given
        Report report = Report.builder()
                .userId(1L)
                .targetType("USER")
                .targetId(2L)
                .reason("신고 사유")
                .status(ReportStatus.RECEIVED)
                .build();
        Report saved = reportRepository.save(report);

        // when
        ReportResponse response = reportService.getReportDetailForAdmin(saved.getId());

        // then
        assertThat(response.getId()).isEqualTo(saved.getId());
        assertThat(response.getReason()).isEqualTo("신고 사유");
        assertThat(response.getUserId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("존재하지 않는 신고 관리자 조회 시 예외 발생")
    void getReportDetailForAdminNonExistent() {
        // when & then
        assertThatThrownBy(() -> reportService.getReportDetailForAdmin(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("신고를 찾을 수 없습니다");
    }
}
