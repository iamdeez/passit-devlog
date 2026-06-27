package com.company.cs.inquiry.dto;

import com.company.cs.inquiry.domain.InquiryStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InquiryAnswerRequest {

    @NotBlank
    private String answerContent;   // 답변 내용

    @NotNull
    private InquiryStatus status;   // ANSWERED / PENDING
}