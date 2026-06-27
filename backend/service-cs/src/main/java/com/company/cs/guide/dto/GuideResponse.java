package com.company.cs.guide.dto;

import com.company.cs.guide.domain.Guide;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class GuideResponse {

    private Long id;
    private String title;
    private String content;
    private boolean visible;
    private int sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static GuideResponse from(Guide guide) {
        return GuideResponse.builder()
                .id(guide.getId())
                .title(guide.getTitle())
                .content(guide.getContent())
                .visible(guide.isVisible())
                .sortOrder(guide.getSortOrder())
                .createdAt(guide.getCreatedAt())
                .updatedAt(guide.getUpdatedAt())
                .build();
    }
}