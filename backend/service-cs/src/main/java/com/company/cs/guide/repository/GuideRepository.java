package com.company.cs.guide.repository;

import com.company.cs.guide.domain.Guide;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GuideRepository extends JpaRepository<Guide, Long> {

    // 사용자용: 노출 중인 가이드만
    List<Guide> findByVisibleTrueOrderBySortOrderAscCreatedAtAsc();

    // 관리자용: 전체
    List<Guide> findAllByOrderBySortOrderAscCreatedAtAsc();
}