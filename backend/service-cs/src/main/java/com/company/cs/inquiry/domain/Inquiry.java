package com.company.cs.inquiry.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cs_inquiry")
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 문의한 사용자 ID (회원 PK)
    @Column(nullable = false)
    private Long userId;

    // 문의 유형 (계정 / 거래 / 결제 / 서비스 이용 등)
    @Column(length = 50)
    private String type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // 첨부 이미지 URL 목록
    @ElementCollection
    @CollectionTable(
            name = "cs_inquiry_image",
            joinColumns = @JoinColumn(name = "inquiry_id")
    )
    @Column(name = "image_url", length = 500)
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    // 답변 상태 (PENDING / ANSWERED)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InquiryStatus status;

    // 관리자 답변 내용
    @Column(columnDefinition = "TEXT")
    private String answerContent;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime answeredAt;

    // 사용자 삭제 여부 (실제 삭제 대신 soft delete)
    @Column(nullable = false)
    private boolean deleted;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = InquiryStatus.PENDING;   // 최초 상태: 답변대기
        }
        this.deleted = false;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // 관리자 답변 등록/수정 시 사용할 메서드
    public void writeAnswer(String answerContent, InquiryStatus status) {
        this.answerContent = answerContent;
        this.status = status;
        if (status == InquiryStatus.ANSWERED) {
            this.answeredAt = LocalDateTime.now();
        } else {
            this.answeredAt = null;
        }
    }

    // 사용자 삭제 (soft delete)
    public void softDelete() {
        this.deleted = true;
    }
}