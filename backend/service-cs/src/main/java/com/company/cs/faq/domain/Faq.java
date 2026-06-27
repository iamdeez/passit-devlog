package com.company.cs.faq.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "faq")
public class Faq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 카테고리 (결제, 거래, 계정 등)
    @Column(length = 50, nullable = false)
    private String category;

    // 질문
    @Column(nullable = false, length = 200)
    private String question;

    // 답변
    @Lob
    @Column(columnDefinition = "TEXT")
    private String answer;

    // 노출 여부
    @Column(nullable = false)
    private boolean visible = true;

    // 정렬 순서(선택)
    private Integer sortOrder;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ===== 기본 생성자 & getter/setter =====

    protected Faq() {}

    public Faq(String category, String question, String answer, Integer sortOrder) {
        this.category = category;
        this.question = question;
        this.answer = answer;
        this.sortOrder = sortOrder;
        this.visible = true;
    }

    public Long getId() {
        return id;
    }

    public String getCategory() {
        return category;
    }

    public String getQuestion() {
        return question;
    }

    public String getAnswer() {
        return answer;
    }

    public boolean isVisible() {
        return visible;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void update(String category, String question, String answer, Integer sortOrder) {
        this.category = category;
        this.question = question;
        this.answer = answer;
        this.sortOrder = sortOrder;
    }

    public void changeVisible(boolean visible) {
        this.visible = visible;
    }
    public void setVisible(boolean visible) {
        this.visible = visible;
    }
}