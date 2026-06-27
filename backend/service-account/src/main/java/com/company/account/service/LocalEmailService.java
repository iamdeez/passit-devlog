package com.company.account.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/**
 * 로컬 개발 환경용 이메일 서비스
 * 실제 이메일을 전송하지 않고 콘솔에 출력
 */
@Slf4j
@Service
@Profile("!smtp")
public class LocalEmailService implements EmailService {

    @Override
    public void sendVerificationEmail(String to, String verificationCode) {
        log.info("===================================================");
        log.info("📧 [이메일 인증 코드 전송]");
        log.info("수신자: {}", to);
        log.info("인증 코드: {}", verificationCode);
        log.info("유효 시간: 10분");
        log.info("===================================================");

        // 실제 이메일 내용 (나중에 템플릿으로 분리 가능)
        String emailContent = String.format("""

                안녕하세요!

                Passit 서비스 이메일 인증 코드입니다.

                인증 코드: %s

                이 코드는 10분 동안 유효합니다.
                본인이 요청하지 않은 경우 이 이메일을 무시해주세요.

                감사합니다.
                Passit 팀
                """, verificationCode);

        log.debug("이메일 내용:\n{}", emailContent);
    }

    @Override
    public void sendWelcomeEmail(String to, String name) {
        log.info("===================================================");
        log.info("🎉 [환영 이메일 전송]");
        log.info("수신자: {}", to);
        log.info("이름: {}", name);
        log.info("===================================================");

        String emailContent = String.format("""

                안녕하세요, %s님!

                Passit 서비스에 가입해주셔서 감사합니다.

                이메일 인증이 완료되었습니다.
                이제 모든 서비스를 이용하실 수 있습니다.

                즐거운 시간 되세요!

                Passit 팀
                """, name);

        log.debug("이메일 내용:\n{}", emailContent);
    }

    @Override
    public void sendPasswordResetEmail(String to, String resetToken) {
        log.info("===================================================");
        log.info("🔐 [비밀번호 재설정 이메일 전송]");
        log.info("수신자: {}", to);
        log.info("재설정 토큰: {}", resetToken);
        log.info("유효 시간: 30분");
        log.info("===================================================");

        String emailContent = String.format("""

                안녕하세요!

                Passit 서비스 비밀번호 재설정 토큰입니다.

                재설정 토큰: %s

                이 토큰은 30분 동안 유효합니다.
                본인이 요청하지 않은 경우 이 이메일을 무시해주세요.

                감사합니다.
                Passit 팀
                """, resetToken);

        log.debug("이메일 내용:\n{}", emailContent);
    }
}
