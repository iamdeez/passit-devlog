package com.company.account.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;

/**
 * AWS SES를 사용한 이메일 전송 서비스
 * 프로덕션 환경에서 사용
 */
@Slf4j
@Service
@Profile("ses")
@Primary
@RequiredArgsConstructor
public class SesEmailService implements EmailService {

    private final SesClient sesClient;

    @Value("${aws.ses.from-email}")
    private String fromEmail;

    @Value("${aws.ses.from-name:Passit}")
    private String fromName;

    @Override
    public void sendVerificationEmail(String to, String verificationCode) {
        log.info("📧 Sending verification email to: {} via AWS SES", to);

        String subject = "[Passit] 이메일 인증 코드";
        String htmlContent = buildVerificationEmailContent(verificationCode);

        try {
            sendHtmlEmail(to, subject, htmlContent);
            log.info("✅ Verification email sent successfully to: {}", to);
        } catch (SesException e) {
            log.error("❌ Failed to send verification email to: {}", to, e);
            throw new RuntimeException("이메일 전송 실패: " + e.awsErrorDetails().errorMessage());
        }
    }

    @Override
    public void sendWelcomeEmail(String to, String name) {
        log.info("🎉 Sending welcome email to: {} via AWS SES", to);

        String subject = "[Passit] 가입을 환영합니다!";
        String htmlContent = buildWelcomeEmailContent(name);

        try {
            sendHtmlEmail(to, subject, htmlContent);
            log.info("✅ Welcome email sent successfully to: {}", to);
        } catch (SesException e) {
            log.error("❌ Failed to send welcome email to: {}", to, e);
            // 환영 이메일 실패는 치명적이지 않으므로 예외를 던지지 않음
        }
    }

    @Override
    public void sendPasswordResetEmail(String to, String resetToken) {
        log.info("🔐 Sending password reset email to: {} via AWS SES", to);

        String subject = "[Passit] 비밀번호 재설정";
        String htmlContent = """
                <!DOCTYPE html>
                <html>
                <body>
                    <h2>Passit 비밀번호 재설정</h2>
                    <p>아래 토큰을 사용해 비밀번호를 재설정해주세요.</p>
                    <p><strong>%s</strong></p>
                    <p>이 토큰은 30분 동안 유효합니다.</p>
                    <p>본인이 요청하지 않은 경우 이 이메일을 무시해주세요.</p>
                </body>
                </html>
                """.formatted(resetToken);

        try {
            sendHtmlEmail(to, subject, htmlContent);
            log.info("✅ Password reset email sent successfully to: {}", to);
        } catch (SesException e) {
            log.error("❌ Failed to send password reset email to: {}", to, e);
            throw new RuntimeException("이메일 전송 실패: " + e.awsErrorDetails().errorMessage());
        }
    }

    /**
     * HTML 이메일 전송
     */
    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            SendEmailRequest request = SendEmailRequest.builder()
                    .source(String.format("%s <%s>", fromName, fromEmail))
                    .destination(Destination.builder()
                            .toAddresses(to)
                            .build())
                    .message(Message.builder()
                            .subject(Content.builder()
                                    .data(subject)
                                    .charset("UTF-8")
                                    .build())
                            .body(Body.builder()
                                    .html(Content.builder()
                                            .data(htmlContent)
                                            .charset("UTF-8")
                                            .build())
                                    .build())
                            .build())
                    .build();

            SendEmailResponse response = sesClient.sendEmail(request);
            log.debug("SES Message ID: {}", response.messageId());
        } catch (SesException e) {
            log.error("SES Error: {} - {}", e.awsErrorDetails().errorCode(),
                     e.awsErrorDetails().errorMessage());
            throw e;
        }
    }

    /**
     * 이메일 인증 HTML 템플릿
     */
    private String buildVerificationEmailContent(String verificationCode) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background-color: #f9f9f9;
                            border-radius: 10px;
                            padding: 30px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .logo {
                            font-size: 32px;
                            font-weight: bold;
                            color: #4A90E2;
                        }
                        .code-box {
                            background-color: #fff;
                            border: 2px dashed #4A90E2;
                            border-radius: 8px;
                            padding: 20px;
                            text-align: center;
                            margin: 30px 0;
                        }
                        .code {
                            font-size: 36px;
                            font-weight: bold;
                            color: #4A90E2;
                            letter-spacing: 8px;
                        }
                        .message {
                            text-align: center;
                            color: #666;
                            margin: 20px 0;
                        }
                        .warning {
                            background-color: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin-top: 20px;
                            border-radius: 4px;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #ddd;
                            color: #999;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">🎫 Passit</div>
                            <h2>이메일 인증</h2>
                        </div>

                        <p>안녕하세요!</p>
                        <p>Passit 서비스 가입을 위한 이메일 인증 코드입니다.</p>

                        <div class="code-box">
                            <div class="message">인증 코드</div>
                            <div class="code">%s</div>
                        </div>

                        <p class="message">
                            이 코드는 <strong>10분 동안</strong> 유효합니다.<br>
                            앱에서 위 코드를 입력하여 이메일 인증을 완료해주세요.
                        </p>

                        <div class="warning">
                            ⚠️ 본인이 요청하지 않은 경우 이 이메일을 무시해주세요.<br>
                            다른 사람이 실수로 귀하의 이메일을 입력했을 수 있습니다.
                        </div>

                        <div class="footer">
                            <p>이 이메일은 발신 전용입니다.</p>
                            <p>&copy; 2025 Passit. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(verificationCode);
    }

    /**
     * 환영 이메일 HTML 템플릿
     */
    private String buildWelcomeEmailContent(String name) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                            border-radius: 10px;
                            padding: 40px;
                            color: white;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .emoji {
                            font-size: 64px;
                            margin-bottom: 20px;
                        }
                        .title {
                            font-size: 28px;
                            font-weight: bold;
                            margin-bottom: 10px;
                        }
                        .content {
                            background-color: rgba(255,255,255,0.9);
                            color: #333;
                            border-radius: 8px;
                            padding: 30px;
                            margin: 20px 0;
                        }
                        .features {
                            list-style: none;
                            padding: 0;
                        }
                        .features li {
                            padding: 10px 0;
                            border-bottom: 1px solid #eee;
                        }
                        .features li:last-child {
                            border-bottom: none;
                        }
                        .cta {
                            text-align: center;
                            margin-top: 30px;
                        }
                        .button {
                            display: inline-block;
                            background-color: #4A90E2;
                            color: white;
                            padding: 15px 40px;
                            text-decoration: none;
                            border-radius: 25px;
                            font-weight: bold;
                            margin-top: 20px;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            font-size: 12px;
                            opacity: 0.8;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="emoji">🎉</div>
                            <div class="title">환영합니다, %s님!</div>
                        </div>

                        <div class="content">
                            <h3>Passit 가입을 축하드립니다!</h3>
                            <p>이메일 인증이 완료되었습니다.</p>
                            <p>이제 Passit의 모든 서비스를 이용하실 수 있습니다.</p>

                            <ul class="features">
                                <li>✨ 다양한 티켓 예매 서비스</li>
                                <li>💬 실시간 채팅 기능</li>
                                <li>🎫 나만의 티켓 관리</li>
                                <li>🔔 중요한 알림 받기</li>
                            </ul>

                            <div class="cta">
                                <p>지금 바로 시작해보세요!</p>
                            </div>
                        </div>

                        <div class="footer">
                            <p>즐거운 시간 되세요!</p>
                            <p>&copy; 2025 Passit Team</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(name);
    }
}
