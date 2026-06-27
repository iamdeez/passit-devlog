package com.company.cs.cs.report.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReportRequest {

    private Long userId;
    private String targetType;
    private Long targetId;
    private String reason;

    // 테스트용 setter
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}