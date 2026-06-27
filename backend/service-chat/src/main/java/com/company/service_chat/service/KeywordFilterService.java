package com.company.service_chat.service;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class KeywordFilterService {

    // 금칙어 목록 (계좌 유도, 외부 메신저 유도 키워드)
    private static final List<String> FORBIDDEN_KEYWORDS = List.of(
            "계좌번호", "계좌 번호", "카카오톡", "카톡", "텔레그램",
            "입금", "송금", "직거래", "외부결제", "네이버페이",
            "토스", "kakao", "telegram", "kakaobank"
    );

    private static final String BLINDED_CONTENT = "[차단된 메시지입니다]";

    /**
     * 메시지에 금칙어가 포함되어 있으면 true를 반환한다.
     * 대소문자 구분 없이 비교한다.
     */
    public boolean containsForbiddenKeyword(String content) {
        if (content == null || content.isBlank()) {
            return false;
        }
        String lowerContent = content.toLowerCase();
        return FORBIDDEN_KEYWORDS.stream()
                .anyMatch(keyword -> lowerContent.contains(keyword.toLowerCase()));
    }

    public String getBlindedContent() {
        return BLINDED_CONTENT;
    }
}
