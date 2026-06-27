package com.company.account.service;

import com.company.account.dto.ActivityRequest;
import com.company.account.dto.ActivityResponse;
import com.company.account.entity.Activity;
import com.company.account.entity.Activity.ActivityType;
import com.company.account.entity.Activity.DealStatus;
import com.company.account.exception.DuplicateResourceException;
import com.company.account.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;

    /**
     * 활동 내역 생성
     */
    @Transactional
    public ActivityResponse createActivity(Long userId, ActivityRequest.Create request) {
        log.info("Creating activity for user ID: {}, type: {}", userId, request.getActivityType());

        Activity activity = Activity.builder()
                .userId(userId)
                .relatedUserId(request.getRelatedUserId())
                .dealId(request.getDealId())
                .activityType(request.getActivityType())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Activity savedActivity = activityRepository.save(activity);
        return ActivityResponse.fromEntity(savedActivity);
    }

    /**
     * 거래 완료 건에 대한 후기 생성
     */
    @Transactional
    public ActivityResponse createReview(Long userId, ActivityRequest.CreateReview request) {
        log.info("Creating review for user ID: {}, deal ID: {}", userId, request.getDealId());

        if (request.getDealStatus() != DealStatus.COMPLETED) {
            throw new IllegalArgumentException("완료된 거래에만 후기를 등록할 수 있습니다");
        }

        if (activityRepository.existsByDealIdAndUserIdAndActivityType(
                request.getDealId(), userId, ActivityType.REVIEW)) {
            throw new DuplicateResourceException("이미 해당 거래에 대한 후기를 등록했습니다");
        }

        Activity activity = Activity.builder()
                .userId(userId)
                .relatedUserId(request.getRelatedUserId())
                .dealId(request.getDealId())
                .activityType(ActivityType.REVIEW)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Activity savedActivity = activityRepository.save(activity);
        return ActivityResponse.fromEntity(savedActivity);
    }

    /**
     * 내 활동 내역 조회 (페이지네이션)
     */
    @Transactional(readOnly = true)
    public Page<ActivityResponse> getMyActivities(Long userId, int page, int size, ActivityType activityType) {
        log.info("Getting activities for user ID: {}, page: {}, size: {}, type: {}", 
                userId, page, size, activityType);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Activity> activities;
        if (activityType == ActivityType.REVIEW) {
            activities = activityRepository.findByRelatedUserIdAndActivityTypeOrderByCreatedAtDesc(
                    userId, activityType, pageable);
        } else if (activityType != null) {
            activities = activityRepository.findByUserIdAndActivityTypeOrderByCreatedAtDesc(
                    userId, activityType, pageable);
        } else {
            activities = activityRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }

        return activities.map(ActivityResponse::fromEntity);
    }

    /**
     * 최근 활동 내역 조회 (최대 10개)
     */
    @Transactional(readOnly = true)
    public List<ActivityResponse> getRecentActivities(Long userId) {
        log.info("Getting recent activities for user ID: {}", userId);

        List<Activity> activities = activityRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId);
        return activities.stream()
                .map(ActivityResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 활동 내역 통계
     */
    @Transactional(readOnly = true)
    public ActivityStats getActivityStats(Long userId) {
        log.info("Getting activity stats for user ID: {}", userId);

        long totalCount = activityRepository.countByUserId(userId);
        long purchaseCount = activityRepository.countByUserIdAndActivityType(userId, ActivityType.PURCHASE);
        long saleCount = activityRepository.countByUserIdAndActivityType(userId, ActivityType.SALE);
        long likeCount = activityRepository.countByUserIdAndActivityType(userId, ActivityType.LIKE);
        long reviewCount = activityRepository.countByUserIdAndActivityType(userId, ActivityType.REVIEW);
        long receivedReviewCount = activityRepository.countByRelatedUserIdAndActivityType(userId, ActivityType.REVIEW);
        Double averageRating = activityRepository.averageRatingByRelatedUserIdAndActivityType(
                userId, ActivityType.REVIEW);

        return ActivityStats.builder()
                .totalCount(totalCount)
                .purchaseCount(purchaseCount)
                .saleCount(saleCount)
                .likeCount(likeCount)
                .reviewCount(reviewCount)
                .receivedReviewCount(receivedReviewCount)
                .averageRating(averageRating != null ? averageRating : 0.0)
                .build();
    }

    @lombok.Data
    @lombok.Builder
    public static class ActivityStats {
        private long totalCount;
        private long purchaseCount;
        private long saleCount;
        private long likeCount;
        private long reviewCount;
        private long receivedReviewCount;
        private double averageRating;
    }
}
