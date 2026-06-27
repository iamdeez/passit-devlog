package com.company.cs.cs.report.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 신고한 사용자 ID
    @Column(nullable = false)
    private Long userId;

    // 신고 대상 타입 (예: USER, TICKET 등)
    @Column(nullable = false, length = 50)
    private String targetType;

    // 신고 대상 ID (유저 ID 또는 티켓 ID 등)
    @Column(nullable = false)
    private Long targetId;

    // 신고 사유
    @Column(nullable = false, length = 1000)
    private String reason;

    // 신고 상태
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportStatus status;

    // 생성 시각
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Builder
    private Report(Long userId,
                   String targetType,
                   Long targetId,
                   String reason,
                   ReportStatus status,
                   LocalDateTime createdAt) {
        this.userId = userId;
        this.targetType = targetType;
        this.targetId = targetId;
        this.reason = reason;
        this.status = status;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public void updateStatus(ReportStatus status) {
        this.status = status;
    }
}