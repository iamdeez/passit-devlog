package com.company.cs.guide.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "cs_guide")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Guide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Column(nullable = false)
    private boolean visible;

    @Column(nullable = false)
    private int sortOrder;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public static Guide create(String title, String content, boolean visible, int sortOrder) {
        Guide guide = new Guide();
        guide.title = title;
        guide.content = content;
        guide.visible = visible;
        guide.sortOrder = sortOrder;
        guide.createdAt = LocalDateTime.now();
        return guide;
    }

    public void update(String title, String content, boolean visible, int sortOrder) {
        this.title = title;
        this.content = content;
        this.visible = visible;
        this.sortOrder = sortOrder;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateVisibility(boolean visible) {
        this.visible = visible;
        this.updatedAt = LocalDateTime.now();
    }
}