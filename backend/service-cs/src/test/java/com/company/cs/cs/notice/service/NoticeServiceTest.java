package com.company.cs.cs.notice.service;

import com.company.cs.cs.notice.domain.Notice;
import com.company.cs.cs.notice.dto.NoticeRequest;
import com.company.cs.cs.notice.dto.NoticeResponse;
import com.company.cs.cs.notice.dto.NoticeStatusRequest;
import com.company.cs.cs.notice.repository.NoticeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class NoticeServiceTest {

    @Autowired
    private NoticeService noticeService;

    @Autowired
    private NoticeRepository noticeRepository;

    @BeforeEach
    void setUp() {
        noticeRepository.deleteAll();
    }

    @Test
    @DisplayName("공지사항 생성 성공")
    void createNotice() {
        // given
        NoticeRequest request = new NoticeRequest();
        request.setTitle("공지사항 제목");
        request.setContent("공지사항 내용");
        request.setCategoryId(1L);
        request.setVisible(true);
        request.setPinned(false);

        // when
        noticeService.createNotice(request);

        // then
        List<Notice> notices = noticeRepository.findAll();
        assertThat(notices).hasSize(1);
        assertThat(notices.get(0).getTitle()).isEqualTo("공지사항 제목");
        assertThat(notices.get(0).getContent()).isEqualTo("공지사항 내용");
        assertThat(notices.get(0).getCategoryId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("노출된 공지사항 목록 조회")
    void getVisibleNotices() {
        // given
        Notice notice1 = Notice.builder()
                .title("공지1")
                .content("내용1")
                .categoryId(1L)
                .visible(true)
                .pinned(false)
                .build();
        noticeRepository.save(notice1);

        Notice notice2 = Notice.builder()
                .title("공지2")
                .content("내용2")
                .categoryId(1L)
                .visible(false)
                .pinned(false)
                .build();
        noticeRepository.save(notice2);

        // when
        List<NoticeResponse> responses = noticeService.getVisibleNotices();

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getTitle()).isEqualTo("공지1");
    }

    @Test
    @DisplayName("공지사항 단건 조회 성공")
    void getNotice() {
        // given
        Notice notice = Notice.builder()
                .title("공지사항")
                .content("내용")
                .categoryId(1L)
                .visible(true)
                .pinned(false)
                .build();
        Notice saved = noticeRepository.save(notice);

        // when
        NoticeResponse response = noticeService.getNotice(saved.getId());

        // then
        assertThat(response.getId()).isEqualTo(saved.getId());
        assertThat(response.getTitle()).isEqualTo("공지사항");
    }

    @Test
    @DisplayName("존재하지 않는 공지사항 조회 시 예외 발생")
    void getNonExistentNotice() {
        // when & then
        assertThatThrownBy(() -> noticeService.getNotice(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("공지사항을 찾을 수 없습니다");
    }

    @Test
    @DisplayName("공지사항 수정 성공")
    void updateNotice() {
        // given
        Notice notice = Notice.builder()
                .title("원래 제목")
                .content("원래 내용")
                .categoryId(1L)
                .visible(true)
                .pinned(false)
                .build();
        Notice saved = noticeRepository.save(notice);

        NoticeRequest request = new NoticeRequest();
        request.setTitle("수정된 제목");
        request.setContent("수정된 내용");
        request.setCategoryId(2L);

        // when
        noticeService.updateNotice(saved.getId(), request);

        // then
        Notice updated = noticeRepository.findById(saved.getId()).orElseThrow();
        assertThat(updated.getTitle()).isEqualTo("수정된 제목");
        assertThat(updated.getContent()).isEqualTo("수정된 내용");
        assertThat(updated.getCategoryId()).isEqualTo(2L);
    }

    @Test
    @DisplayName("공지사항 상태 변경 성공")
    void updateNoticeStatus() {
        // given
        Notice notice = Notice.builder()
                .title("공지사항")
                .content("내용")
                .categoryId(1L)
                .visible(true)
                .pinned(false)
                .build();
        Notice saved = noticeRepository.save(notice);

        NoticeStatusRequest request = new NoticeStatusRequest();
        request.setVisible(false);
        request.setPinned(true);

        // when
        noticeService.updateNoticeStatus(saved.getId(), request);

        // then
        Notice updated = noticeRepository.findById(saved.getId()).orElseThrow();
        assertThat(updated.getVisible()).isFalse();
        assertThat(updated.getPinned()).isTrue();
    }

    @Test
    @DisplayName("공지사항 삭제 성공")
    void deleteNotice() {
        // given
        Notice notice = Notice.builder()
                .title("공지사항")
                .content("내용")
                .categoryId(1L)
                .visible(true)
                .pinned(false)
                .build();
        Notice saved = noticeRepository.save(notice);

        // when
        noticeService.deleteNotice(saved.getId());

        // then
        assertThat(noticeRepository.findById(saved.getId())).isEmpty();
    }
}
