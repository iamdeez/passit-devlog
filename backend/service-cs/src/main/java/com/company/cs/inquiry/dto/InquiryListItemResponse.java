package com.company.cs.inquiry.dto;

import com.company.cs.inquiry.domain.Inquiry;
import com.company.cs.inquiry.domain.InquiryStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class InquiryListItemResponse {

    private Long id;
    private String type;
    private String title;
    private InquiryStatus status;
    private LocalDateTime createdAt;

    public static InquiryListItemResponse from(Inquiry inquiry) {
        return InquiryListItemResponse.builder()
                .id(inquiry.getId())
                .type(inquiry.getType())
                .title(inquiry.getTitle())
                .status(inquiry.getStatus())
                .createdAt(inquiry.getCreatedAt())
                .build();
    }
}