package com.company.cs.inquiry.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class InquiryCreateRequest {

    @NotBlank
    private String type;      // 문의 유형 (계정/거래/결제/서비스 이용 등)

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    // 첨부 이미지 URL 목록 (없으면 null 또는 빈 리스트)
    private List<String> imageUrls;
}