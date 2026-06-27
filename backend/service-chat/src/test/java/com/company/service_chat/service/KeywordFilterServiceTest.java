package com.company.service_chat.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("KeywordFilterService 단위 테스트")
class KeywordFilterServiceTest {

    private KeywordFilterService keywordFilterService;

    @BeforeEach
    void setUp() {
        keywordFilterService = new KeywordFilterService();
    }

    @Test
    @DisplayName("금칙어 포함 메시지 - 감지 성공 (계좌번호)")
    void containsForbiddenKeyword_AccountNumber() {
        assertThat(keywordFilterService.containsForbiddenKeyword("제 계좌번호 알려드릴게요")).isTrue();
    }

    @Test
    @DisplayName("금칙어 포함 메시지 - 감지 성공 (카카오톡)")
    void containsForbiddenKeyword_Kakao() {
        assertThat(keywordFilterService.containsForbiddenKeyword("카카오톡으로 연락주세요")).isTrue();
    }

    @Test
    @DisplayName("금칙어 포함 메시지 - 감지 성공 (텔레그램)")
    void containsForbiddenKeyword_Telegram() {
        assertThat(keywordFilterService.containsForbiddenKeyword("텔레그램 아이디 드릴게요")).isTrue();
    }

    @Test
    @DisplayName("금칙어 포함 메시지 - 대소문자 구분 없이 감지")
    void containsForbiddenKeyword_CaseInsensitive() {
        assertThat(keywordFilterService.containsForbiddenKeyword("KAKAO로 연락해요")).isTrue();
        assertThat(keywordFilterService.containsForbiddenKeyword("Telegram 추가해주세요")).isTrue();
    }

    @Test
    @DisplayName("일반 메시지 - 금칙어 없음")
    void containsForbiddenKeyword_NormalMessage() {
        assertThat(keywordFilterService.containsForbiddenKeyword("안녕하세요, 티켓 구매 희망합니다")).isFalse();
    }

    @Test
    @DisplayName("null 메시지 - false 반환")
    void containsForbiddenKeyword_NullContent() {
        assertThat(keywordFilterService.containsForbiddenKeyword(null)).isFalse();
    }

    @Test
    @DisplayName("빈 메시지 - false 반환")
    void containsForbiddenKeyword_EmptyContent() {
        assertThat(keywordFilterService.containsForbiddenKeyword("")).isFalse();
        assertThat(keywordFilterService.containsForbiddenKeyword("   ")).isFalse();
    }

    @Test
    @DisplayName("블라인드 처리 문구 반환")
    void getBlindedContent_ReturnExpected() {
        assertThat(keywordFilterService.getBlindedContent()).isEqualTo("[차단된 메시지입니다]");
    }
}
