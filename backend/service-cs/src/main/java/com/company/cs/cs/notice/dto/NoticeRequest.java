package com.company.cs.cs.notice.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class NoticeRequest {

    private String title;
    private String content;
    private Long categoryId;

    // 관리자 화면에서 노출/고정 상태까지 함께 설정할 수 있게
    private Boolean visible;
    private Boolean pinned;

    // 테스트용 setter
    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public void setVisible(Boolean visible) {
        this.visible = visible;
    }

    public void setPinned(Boolean pinned) {
        this.pinned = pinned;
    }
}