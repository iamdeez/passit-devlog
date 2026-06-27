package com.company.account.dto;

import com.company.account.entity.Activity.ActivityType;
import com.company.account.entity.Activity.DealStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class ActivityRequest {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Create {
        @NotNull(message = "활동 타입은 필수입니다.")
        private ActivityType activityType;

        private Long relatedUserId;
        private Long dealId;

        @Min(value = 1, message = "평점은 1 이상이어야 합니다.")
        @Max(value = 5, message = "평점은 5 이하여야 합니다.")
        private Integer rating;

        private String comment;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateReview {
        @NotNull(message = "거래 ID는 필수입니다.")
        private Long dealId;

        @NotNull(message = "리뷰 대상 사용자는 필수입니다.")
        private Long relatedUserId;

        @NotNull(message = "거래 상태는 필수입니다.")
        private DealStatus dealStatus;

        @NotNull(message = "평점은 필수입니다.")
        @Min(value = 1, message = "평점은 1 이상이어야 합니다.")
        @Max(value = 5, message = "평점은 5 이하여야 합니다.")
        private Integer rating;

        private String comment;
    }
}
