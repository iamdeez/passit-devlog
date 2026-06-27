package com.company.cs.faq.repository;

import com.company.cs.faq.domain.Faq;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FaqRepository extends JpaRepository<Faq, Long> {

    // 카테고리 + 노출 여부로 조회 (사용자 화면용)
    List<Faq> findByCategoryAndVisibleIsTrueOrderBySortOrderAscCreatedAtDesc(String category);

    // 전체 노출 FAQ
    List<Faq> findByVisibleIsTrueOrderBySortOrderAscCreatedAtDesc();

}