package com.company.cs.cs.report.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReportStatusUpdateRequest {

    // "PENDING" 또는 "PROCESSED"
    private String status;

    // 테스트용 setter
    public void setStatus(String status) {
        this.status = status;
    }
}