package com.company.cs.cs.notice.dto;

import com.company.cs.cs.notice.domain.Notice;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class NoticeResponse {

    private Long id;
    private String title;
    private String content;
    private Long categoryId;
    private Boolean visible;
    private Boolean pinned;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public NoticeResponse(Notice notice) {
        this.id = notice.getId();
        this.title = notice.getTitle();
        this.content = notice.getContent();
        this.categoryId = notice.getCategoryId();
        this.visible = notice.getVisible();
        this.pinned = notice.getPinned();
        this.createdAt = notice.getCreatedAt();
        this.updatedAt = notice.getUpdatedAt();
    }
}