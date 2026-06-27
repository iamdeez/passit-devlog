package com.company.cs.inquiry.repository;

import com.company.cs.inquiry.domain.Inquiry;
import com.company.cs.inquiry.domain.InquiryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    // 내 문의 목록 (사용자 삭제 안 한 것만)
    List<Inquiry> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId);

    // 관리자용 전체 목록 (삭제 안 된 것만)
    List<Inquiry> findByDeletedFalseOrderByCreatedAtDesc();

    // 관리자 - 상태별 목록 (예: PENDING만 보기)
    List<Inquiry> findByStatusAndDeletedFalseOrderByCreatedAtDesc(InquiryStatus status);
}