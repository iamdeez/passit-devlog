package com.company.cs.cs.report.repository;

import com.company.cs.cs.report.domain.Report;
import com.company.cs.cs.report.domain.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    // 내 신고 목록 조회
    List<Report> findByUserId(Long userId);

    // 상태로 필터한 내 신고 목록
    List<Report> findByUserIdAndStatus(Long userId, ReportStatus status);

    // 관리자용: 상태별 전체 조회
    List<Report> findByStatus(ReportStatus status);

    // 관리자용: 상태 + 신고자(userId)로 조회
    List<Report> findByStatusAndUserId(ReportStatus status, Long userId);

    // 관리자용: 상태 + 신고 대상(targetId)로 조회
    List<Report> findByStatusAndTargetId(ReportStatus status, Long targetId);

    // 관리자용: 신고 대상만으로 조회
    List<Report> findByTargetId(Long targetId);
}