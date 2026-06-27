package com.company.cs.guide.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class GuideRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    @NotNull
    private Boolean visible;

    @NotNull
    private Integer sortOrder;

    // 테스트용 setter
    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setVisible(Boolean visible) {
        this.visible = visible;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}