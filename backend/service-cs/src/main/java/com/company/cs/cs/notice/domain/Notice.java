package com.company.cs.cs.notice.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notice")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "is_visible", nullable = false)
    private Boolean visible;   // 노출 여부

    @Column(name = "is_pinned", nullable = false)
    private Boolean pinned;    // 상단 고정 여부

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;


    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (visible == null) visible = true;   // 기본 노출
        if (pinned == null) pinned = false;    // 기본 비고정
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // 기본 정보 수정 (제목 / 내용 / 카테고리)
    public void update(String title, String content, Long categoryId) {
        this.title = title;
        this.content = content;
        this.categoryId = categoryId;
        this.updatedAt = LocalDateTime.now();
    }

    // 상태만 변경 (노출/고정)
    public void updateStatus(Boolean visible, Boolean pinned) {
        if (visible != null) {
            this.visible = visible;
        }
        if (pinned != null) {
            this.pinned = pinned;
        }
        this.updatedAt = LocalDateTime.now();
    }
}