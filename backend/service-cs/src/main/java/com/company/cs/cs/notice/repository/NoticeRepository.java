package com.company.cs.cs.notice.repository;

import com.company.cs.cs.notice.domain.Notice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    // 유저용: visible = true 인 공지만
    List<Notice> findByVisibleTrueOrderByPinnedDescCreatedAtDesc();
}