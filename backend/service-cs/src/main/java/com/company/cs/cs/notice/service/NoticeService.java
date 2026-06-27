package com.company.cs.cs.notice.service;

import com.company.cs.cs.notice.domain.Notice;
import com.company.cs.cs.notice.dto.NoticeRequest;
import com.company.cs.cs.notice.dto.NoticeResponse;
import com.company.cs.cs.notice.dto.NoticeStatusRequest;
import com.company.cs.cs.notice.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository noticeRepository;

    // 유저용 목록 (노출 Y만)
    public List<NoticeResponse> getVisibleNotices() {
        return noticeRepository.findByVisibleTrueOrderByPinnedDescCreatedAtDesc()
                .stream()
                .map(NoticeResponse::new)
                .toList();
    }

    // 관리자용 목록 (전체)
    public List<NoticeResponse> getAllNotices() {
        return noticeRepository.findAll()
                .stream()
                .map(NoticeResponse::new)
                .toList();
    }

    // 단건 조회 (공통)
    public NoticeResponse getNotice(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));
        return new NoticeResponse(notice);
    }

    // 생성
    @Transactional
    public void createNotice(NoticeRequest request) {
        Notice notice = Notice.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .categoryId(request.getCategoryId())
                .visible(request.getVisible())
                .pinned(request.getPinned())
                .build();

        noticeRepository.save(notice);
    }

    // 수정 (제목/내용/카테고리)
    @Transactional
    public void updateNotice(Long id, NoticeRequest request) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

        notice.update(
                request.getTitle(),
                request.getContent(),
                request.getCategoryId()
        );
    }

    // 노출/고정 상태 변경
    @Transactional
    public void updateNoticeStatus(Long id, NoticeStatusRequest request) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

        notice.updateStatus(request.getVisible(), request.getPinned());
    }

    // 삭제
    @Transactional
    public void deleteNotice(Long id) {
        noticeRepository.deleteById(id);
    }
}