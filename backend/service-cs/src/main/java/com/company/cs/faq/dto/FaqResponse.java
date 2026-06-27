package com.company.cs.faq.dto;

import com.company.cs.faq.domain.Faq;

import java.time.LocalDateTime;

public class FaqResponse {

    private Long id;
    private String category;
    private String question;
    private String answer;
    private boolean visible;
    private Integer sortOrder;
    private LocalDateTime createdAt;

    public FaqResponse(Faq faq) {
        this.id = faq.getId();
        this.category = faq.getCategory();
        this.question = faq.getQuestion();
        this.answer = faq.getAnswer();
        this.visible = faq.isVisible();
        this.sortOrder = faq.getSortOrder();
        this.createdAt = faq.getCreatedAt();
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
}