package com.company.cs.inquiry.dto;

import com.company.cs.inquiry.domain.Inquiry;
import com.company.cs.inquiry.domain.InquiryStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class InquiryDetailResponse {

    private Long id;
    private Long userId;
    private String type;
    private String title;
    private String content;
    private List<String> imageUrls;
    private InquiryStatus status;
    private String answerContent;
    private LocalDateTime createdAt;
    private LocalDateTime answeredAt;

    public static InquiryDetailResponse from(Inquiry inquiry) {
        return InquiryDetailResponse.builder()
                .id(inquiry.getId())
                .userId(inquiry.getUserId())
                .type(inquiry.getType())
                .title(inquiry.getTitle())
                .content(inquiry.getContent())
                .imageUrls(inquiry.getImageUrls())
                .status(inquiry.getStatus())
                .answerContent(inquiry.getAnswerContent())
                .createdAt(inquiry.getCreatedAt())
                .answeredAt(inquiry.getAnsweredAt())
                .build();
    }
}