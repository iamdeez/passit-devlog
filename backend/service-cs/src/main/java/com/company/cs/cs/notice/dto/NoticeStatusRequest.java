package com.company.cs.cs.notice.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NoticeStatusRequest {

    private Boolean visible;
    private Boolean pinned;

    // 테스트용 setter
    public void setVisible(Boolean visible) {
        this.visible = visible;
    }

    public void setPinned(Boolean pinned) {
        this.pinned = pinned;
    }
}