package com.company.serviceaccount.service;

import com.company.account.dto.AuthRequest;
import com.company.account.dto.AuthResponse;
import com.company.account.dto.KakaoUserInfo;
import com.company.account.entity.PasswordResetToken;
import com.company.account.entity.User;
import com.company.account.exception.DuplicateResourceException;
import com.company.account.repository.PasswordResetTokenRepository;
import com.company.account.repository.UserRepository;
import com.company.account.security.JwtTokenProvider;
import com.company.account.service.AuthService;
import com.company.account.service.CacheInvalidationService;
import com.company.account.service.EmailService;
import com.company.account.service.EmailVerificationService;
import com.company.account.service.KakaoAuthService;
import com.company.account.util.CacheKeyGenerator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.*;

/**
 * AuthService 단위 테스트
 *
 * 테스트 범위:
 * - 회원가입 (signUp)
 * - 로그인 (login)
 * - 로그아웃 (logout)
 * - Access Token 갱신 (refreshAccessToken)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService 단위 테스트")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private EmailVerificationService emailVerificationService;

    @Mock
    private EmailService emailService;

    @Mock
    private KakaoAuthService kakaoAuthService;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private CacheKeyGenerator cacheKeyGenerator;

    @Mock
    private CacheInvalidationService cacheInvalidationService;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("회원가입 - 성공")
    void signUp_success() {
        // Arrange
        AuthRequest.SignUp request = AuthRequest.SignUp.builder()
            .email("test@example.com")
            .password("Password123!")
            .name("테스터")
            .nickname("tester")
            .build();

        given(userRepository.existsByEmail(request.getEmail())).willReturn(false);
        given(userRepository.existsByNickname(request.getNickname())).willReturn(false);
        given(passwordEncoder.encode(request.getPassword())).willReturn("encodedPassword");

        User savedUser = User.builder()
            .userId(1L)
            .email(request.getEmail())
            .password("encodedPassword")
            .name(request.getName())
            .nickname(request.getNickname())
            .emailVerified(false)
            .role(User.UserRole.USER)
            .build();

        given(userRepository.save(any(User.class))).willReturn(savedUser);

        // Act
        User result = authService.signUp(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        assertThat(result.getName()).isEqualTo("테스터");
        assertThat(result.getNickname()).isEqualTo("tester");
        assertThat(result.getEmailVerified()).isFalse();

        verify(userRepository, times(1)).existsByEmail(request.getEmail());
        verify(userRepository, times(1)).existsByNickname(request.getNickname());
        verify(passwordEncoder, times(1)).encode(request.getPassword());
        verify(userRepository, times(1)).save(any(User.class));
        verify(emailVerificationService, times(1)).sendVerificationCode(request.getEmail());
    }

    @Test
    @DisplayName("회원가입 - 중복된 이메일로 인한 실패")
    void signUp_duplicateEmail_throwsException() {
        // Arrange
        AuthRequest.SignUp request = AuthRequest.SignUp.builder()
            .email("duplicate@example.com")
            .password("Password123!")
            .name("테스터")
            .build();

        given(userRepository.existsByEmail(request.getEmail())).willReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.signUp(request))
            .isInstanceOf(DuplicateResourceException.class)
            .hasMessageContaining("이미 존재하는 이메일");

        verify(userRepository, times(1)).existsByEmail(request.getEmail());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("회원가입 - 중복된 닉네임으로 인한 실패")
    void signUp_duplicateNickname_throwsException() {
        // Arrange
        AuthRequest.SignUp request = AuthRequest.SignUp.builder()
            .email("test@example.com")
            .password("Password123!")
            .name("테스터")
            .nickname("duplicate")
            .build();

        given(userRepository.existsByEmail(request.getEmail())).willReturn(false);
        given(userRepository.existsByNickname(request.getNickname())).willReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.signUp(request))
            .isInstanceOf(DuplicateResourceException.class)
            .hasMessageContaining("이미 존재하는 닉네임");

        verify(userRepository, times(1)).existsByEmail(request.getEmail());
        verify(userRepository, times(1)).existsByNickname(request.getNickname());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("로그인 - 성공")
    void login_success() {
        // Arrange
        AuthRequest.Login request = AuthRequest.Login.builder()
            .email("test@example.com")
            .password("Password123!")
            .build();

        User user = User.builder()
            .userId(1L)
            .email(request.getEmail())
            .password("encodedPassword")
            .name("테스터")
            .role(User.UserRole.USER)
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build();

        given(userRepository.findByEmail(request.getEmail())).willReturn(Optional.of(user));
        given(passwordEncoder.matches(request.getPassword(), user.getPassword())).willReturn(true);
        given(jwtTokenProvider.createAccessToken(anyLong(), anyString(), anyString()))
            .willReturn("accessToken");
        given(jwtTokenProvider.createRefreshToken(anyLong())).willReturn("refreshToken");
        given(userRepository.save(any(User.class))).willReturn(user);
        
        // Redis Mock 설정
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(cacheKeyGenerator.refreshTokenKey(anyLong())).willReturn("auth:refresh:1");

        // Act
        AuthResponse.LoginResponse result = authService.login(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        assertThat(result.getAccessToken()).isEqualTo("accessToken");
        assertThat(result.getRefreshToken()).isEqualTo("refreshToken");

        verify(userRepository, times(1)).findByEmail(request.getEmail());
        verify(passwordEncoder, times(1)).matches(request.getPassword(), user.getPassword());
        verify(jwtTokenProvider, times(1)).createAccessToken(anyLong(), anyString(), anyString());
        verify(jwtTokenProvider, times(1)).createRefreshToken(anyLong());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("로그인 - 이메일 미인증 계정으로 인한 실패")
    void login_unverifiedEmail_throwsException() {
        // Arrange
        AuthRequest.Login request = AuthRequest.Login.builder()
            .email("test@example.com")
            .password("Password123!")
            .build();

        User user = User.builder()
            .userId(1L)
            .email(request.getEmail())
            .password("encodedPassword")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(false)
            .build();

        given(userRepository.findByEmail(request.getEmail())).willReturn(Optional.of(user));
        given(passwordEncoder.matches(request.getPassword(), user.getPassword())).willReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("이메일 인증이 필요합니다");

        verify(userRepository, times(1)).findByEmail(request.getEmail());
        verify(passwordEncoder, times(1)).matches(request.getPassword(), user.getPassword());
        verify(jwtTokenProvider, never()).createAccessToken(anyLong(), anyString(), anyString());
    }

    @Test
    @DisplayName("로그인 - 존재하지 않는 이메일로 인한 실패")
    void login_nonexistentEmail_throwsException() {
        // Arrange
        AuthRequest.Login request = AuthRequest.Login.builder()
            .email("notfound@example.com")
            .password("Password123!")
            .build();

        given(userRepository.findByEmail(request.getEmail())).willReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("이메일 또는 비밀번호가 올바르지 않습니다");

        verify(userRepository, times(1)).findByEmail(request.getEmail());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("로그인 - 잘못된 비밀번호로 인한 실패")
    void login_wrongPassword_throwsException() {
        // Arrange
        AuthRequest.Login request = AuthRequest.Login.builder()
            .email("test@example.com")
            .password("WrongPassword123!")
            .build();

        User user = User.builder()
            .userId(1L)
            .email(request.getEmail())
            .password("encodedPassword")
            .status(User.UserStatus.ACTIVE)
            .build();

        given(userRepository.findByEmail(request.getEmail())).willReturn(Optional.of(user));
        given(passwordEncoder.matches(request.getPassword(), user.getPassword())).willReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("이메일 또는 비밀번호가 올바르지 않습니다");

        verify(userRepository, times(1)).findByEmail(request.getEmail());
        verify(passwordEncoder, times(1)).matches(request.getPassword(), user.getPassword());
        verify(jwtTokenProvider, never()).createAccessToken(anyLong(), anyString(), anyString());
    }

    @Test
    @DisplayName("로그인 - 삭제된 계정으로 인한 실패")
    void login_deletedAccount_throwsException() {
        // Arrange
        AuthRequest.Login request = AuthRequest.Login.builder()
            .email("test@example.com")
            .password("Password123!")
            .build();

        User user = User.builder()
            .userId(1L)
            .email(request.getEmail())
            .password("encodedPassword")
            .status(User.UserStatus.DELETED)
            .emailVerified(true)
            .build();

        given(userRepository.findByEmail(request.getEmail())).willReturn(Optional.of(user));
        given(passwordEncoder.matches(request.getPassword(), user.getPassword())).willReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("삭제된 계정입니다");

        verify(userRepository, times(1)).findByEmail(request.getEmail());
        verify(passwordEncoder, times(1)).matches(request.getPassword(), user.getPassword());
    }

    @Test
    @DisplayName("로그인 - 정지된 계정으로 인한 실패")
    void login_suspendedAccount_throwsException() {
        // Arrange
        AuthRequest.Login request = AuthRequest.Login.builder()
            .email("test@example.com")
            .password("Password123!")
            .build();

        User user = User.builder()
            .userId(1L)
            .email(request.getEmail())
            .password("encodedPassword")
            .status(User.UserStatus.SUSPENDED)
            .emailVerified(true)
            .build();

        given(userRepository.findByEmail(request.getEmail())).willReturn(Optional.of(user));
        given(passwordEncoder.matches(request.getPassword(), user.getPassword())).willReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("정지된 계정입니다");

        verify(userRepository, times(1)).findByEmail(request.getEmail());
        verify(passwordEncoder, times(1)).matches(request.getPassword(), user.getPassword());
    }

    @Test
    @DisplayName("로그아웃 - 성공")
    void logout_success() {
        // Arrange
        Long userId = 1L;
        User user = User.builder()
            .userId(userId)
            .email("test@example.com")
            .refreshToken("refreshToken")
            .build();

        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(userRepository.save(any(User.class))).willReturn(user);
        
        // CacheInvalidationService는 Mock이므로 doNothing()으로 설정
        doNothing().when(cacheInvalidationService).invalidateRefreshTokenCache(userId);

        // Act
        authService.logout(userId);

        // Assert
        verify(userRepository, times(1)).findById(userId);
        verify(userRepository, times(1)).save(argThat(u -> u.getRefreshToken() == null));
        verify(cacheInvalidationService, times(1)).invalidateRefreshTokenCache(userId);
    }

    @Test
    @DisplayName("로그아웃 - 존재하지 않는 사용자로 인한 실패")
    void logout_nonexistentUser_throwsException() {
        // Arrange
        Long userId = 999L;
        given(userRepository.findById(userId)).willReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.logout(userId))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("사용자를 찾을 수 없습니다");

        verify(userRepository, times(1)).findById(userId);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Access Token 갱신 - 성공")
    void refreshAccessToken_success() {
        // Arrange
        String refreshToken = "validRefreshToken";
        Long userId = 1L;
        User user = User.builder()
            .userId(userId)
            .email("test@example.com")
            .role(User.UserRole.USER)
            .refreshToken(refreshToken)
            .build();

        given(jwtTokenProvider.validateToken(refreshToken)).willReturn(true);
        given(jwtTokenProvider.getUserIdFromToken(refreshToken)).willReturn(userId);
        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(jwtTokenProvider.createAccessToken(anyLong(), anyString(), anyString()))
            .willReturn("newAccessToken");
        given(jwtTokenProvider.createRefreshToken(userId)).willReturn("newRefreshToken");
        given(userRepository.save(any(User.class))).willReturn(user);
        
        // Redis Mock 설정 (캐시 미스 시뮬레이션)
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(valueOperations.get(anyString())).willReturn(null); // 캐시 미스
        given(cacheKeyGenerator.refreshTokenKey(userId)).willReturn("auth:refresh:1");

        // Act
        AuthResponse.TokenResponse result = authService.refreshAccessToken(refreshToken);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getAccessToken()).isEqualTo("newAccessToken");
        assertThat(result.getRefreshToken()).isEqualTo("newRefreshToken");

        verify(jwtTokenProvider, times(1)).validateToken(refreshToken);
        verify(jwtTokenProvider, times(1)).getUserIdFromToken(refreshToken);
        verify(userRepository, times(1)).findById(userId);
        verify(jwtTokenProvider, times(1)).createAccessToken(anyLong(), anyString(), anyString());
        verify(jwtTokenProvider, times(1)).createRefreshToken(userId);
        verify(userRepository, times(1)).save(argThat(u -> "newRefreshToken".equals(u.getRefreshToken())));
    }

    @Test
    @DisplayName("비밀번호 재설정 - 이메일 발송 후 토큰으로 비밀번호 변경")
    void forgotAndResetPassword_success() {
        // Arrange
        String email = "reset@example.com";
        User user = User.builder()
            .userId(20L)
            .email(email)
            .password("oldEncodedPassword")
            .status(User.UserStatus.ACTIVE)
            .build();
        PasswordResetToken resetToken = PasswordResetToken.builder()
            .email(email)
            .token("reset-token")
            .expiresAt(LocalDateTime.now().plusMinutes(30))
            .used(false)
            .build();

        given(userRepository.findByEmail(email)).willReturn(Optional.of(user));
        given(passwordResetTokenRepository.save(any(PasswordResetToken.class)))
            .willAnswer(invocation -> invocation.getArgument(0));

        AuthRequest.ForgotPassword forgotRequest = AuthRequest.ForgotPassword.builder()
            .email(email)
            .build();

        // Act
        authService.forgotPassword(forgotRequest);

        // Assert
        verify(passwordResetTokenRepository, times(1)).save(any(PasswordResetToken.class));
        verify(emailService, times(1)).sendPasswordResetEmail(eq(email), anyString());

        // Arrange reset
        given(passwordResetTokenRepository.findByTokenAndUsedFalse("reset-token"))
            .willReturn(Optional.of(resetToken));
        given(passwordEncoder.encode("NewPassword123!")).willReturn("newEncodedPassword");
        given(userRepository.save(user)).willReturn(user);

        AuthRequest.ResetPassword resetRequest = AuthRequest.ResetPassword.builder()
            .token("reset-token")
            .newPassword("NewPassword123!")
            .build();

        // Act
        authService.resetPassword(resetRequest);

        // Assert
        assertThat(user.getPassword()).isEqualTo("newEncodedPassword");
        assertThat(user.getRefreshToken()).isNull();
        assertThat(resetToken.getUsed()).isTrue();
        assertThat(resetToken.getUsedAt()).isNotNull();
        verify(cacheInvalidationService, times(1)).invalidateRefreshTokenCache(20L);
    }

    @Test
    @DisplayName("카카오 로그인 - 신규 사용자 자동 가입 및 JWT 발급")
    void loginWithKakao_newUser_success() {
        // Arrange
        String code = "kakao-auth-code";
        KakaoUserInfo kakaoUserInfo = KakaoUserInfo.builder()
            .id(12345L)
            .kakaoAccount(KakaoUserInfo.KakaoAccount.builder()
                .email("kakao@example.com")
                .profile(KakaoUserInfo.Profile.builder()
                    .nickname("카카오테스터")
                    .profileImageUrl("https://example.com/profile.png")
                    .build())
                .build())
            .build();

        User savedUser = User.builder()
            .userId(10L)
            .email("kakao@example.com")
            .password("encodedPassword")
            .name("카카오테스터")
            .nickname("카카오테스터")
            .provider(User.SocialProvider.KAKAO)
            .profileImageUrl("https://example.com/profile.png")
            .role(User.UserRole.USER)
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build();

        given(kakaoAuthService.getAccessToken(code)).willReturn("kakao-access-token");
        given(kakaoAuthService.getUserInfo("kakao-access-token")).willReturn(kakaoUserInfo);
        given(userRepository.findByEmail("kakao@example.com")).willReturn(Optional.empty());
        given(userRepository.existsByNickname("카카오테스터")).willReturn(false);
        given(passwordEncoder.encode(anyString())).willReturn("encodedPassword");
        given(userRepository.save(any(User.class))).willReturn(savedUser);
        given(jwtTokenProvider.createAccessToken(10L, "kakao@example.com", "USER"))
            .willReturn("jwt-access-token");
        given(jwtTokenProvider.createRefreshToken(10L)).willReturn("jwt-refresh-token");
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(cacheKeyGenerator.refreshTokenKey(10L)).willReturn("auth:refresh:10");

        // Act
        AuthResponse.LoginResponse result = authService.loginWithKakao(code);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("kakao@example.com");
        assertThat(result.getProvider()).isEqualTo("KAKAO");
        assertThat(result.getAccessToken()).isEqualTo("jwt-access-token");
        assertThat(result.getRefreshToken()).isEqualTo("jwt-refresh-token");

        verify(userRepository, times(1)).findByEmail("kakao@example.com");
        verify(userRepository, times(2)).save(any(User.class));
        verify(jwtTokenProvider, times(1)).createAccessToken(10L, "kakao@example.com", "USER");
        verify(jwtTokenProvider, times(1)).createRefreshToken(10L);
    }

    @Test
    @DisplayName("카카오 로그인 - 기존 사용자 카카오 연동 및 JWT 발급")
    void loginWithKakao_existingUser_success() {
        // Arrange
        String code = "kakao-auth-code";
        KakaoUserInfo kakaoUserInfo = KakaoUserInfo.builder()
            .id(12345L)
            .kakaoAccount(KakaoUserInfo.KakaoAccount.builder()
                .email("existing@example.com")
                .profile(KakaoUserInfo.Profile.builder()
                    .nickname("기존사용자")
                    .profileImageUrl("https://example.com/profile.png")
                    .build())
                .build())
            .build();

        User existingUser = User.builder()
            .userId(11L)
            .email("existing@example.com")
            .password("encodedPassword")
            .name("기존사용자")
            .nickname("existing")
            .role(User.UserRole.USER)
            .status(User.UserStatus.ACTIVE)
            .emailVerified(false)
            .build();

        given(kakaoAuthService.getAccessToken(code)).willReturn("kakao-access-token");
        given(kakaoAuthService.getUserInfo("kakao-access-token")).willReturn(kakaoUserInfo);
        given(userRepository.findByEmail("existing@example.com")).willReturn(Optional.of(existingUser));
        given(userRepository.save(any(User.class))).willAnswer(invocation -> invocation.getArgument(0));
        given(jwtTokenProvider.createAccessToken(11L, "existing@example.com", "USER"))
            .willReturn("jwt-access-token");
        given(jwtTokenProvider.createRefreshToken(11L)).willReturn("jwt-refresh-token");
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(cacheKeyGenerator.refreshTokenKey(11L)).willReturn("auth:refresh:11");

        // Act
        AuthResponse.LoginResponse result = authService.loginWithKakao(code);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("existing@example.com");
        assertThat(result.getProvider()).isEqualTo("KAKAO");
        assertThat(existingUser.getEmailVerified()).isTrue();
        assertThat(existingUser.getProvider()).isEqualTo(User.SocialProvider.KAKAO);

        verify(userRepository, times(1)).findByEmail("existing@example.com");
        verify(userRepository, times(1)).save(existingUser);
        verify(jwtTokenProvider, times(1)).createAccessToken(11L, "existing@example.com", "USER");
        verify(jwtTokenProvider, times(1)).createRefreshToken(11L);
    }

    @Test
    @DisplayName("Access Token 갱신 - 유효하지 않은 Refresh Token으로 인한 실패")
    void refreshAccessToken_invalidToken_throwsException() {
        // Arrange
        String invalidToken = "invalidToken";
        given(jwtTokenProvider.validateToken(invalidToken)).willReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshAccessToken(invalidToken))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("유효하지 않은 Refresh Token");

        verify(jwtTokenProvider, times(1)).validateToken(invalidToken);
        verify(jwtTokenProvider, never()).getUserIdFromToken(anyString());
    }

    @Test
    @DisplayName("Access Token 갱신 - 저장된 Refresh Token과 불일치로 인한 실패")
    void refreshAccessToken_tokenMismatch_throwsException() {
        // Arrange
        String refreshToken = "validRefreshToken";
        Long userId = 1L;
        User user = User.builder()
            .userId(userId)
            .email("test@example.com")
            .refreshToken("differentRefreshToken")  // 다른 토큰
            .build();

        given(jwtTokenProvider.validateToken(refreshToken)).willReturn(true);
        given(jwtTokenProvider.getUserIdFromToken(refreshToken)).willReturn(userId);
        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        
        // Redis Mock 설정 (캐시 미스 시뮬레이션)
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(valueOperations.get(anyString())).willReturn(null); // 캐시 미스
        given(cacheKeyGenerator.refreshTokenKey(userId)).willReturn("auth:refresh:1");

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshAccessToken(refreshToken))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("유효하지 않은 Refresh Token");

        verify(jwtTokenProvider, times(1)).validateToken(refreshToken);
        verify(jwtTokenProvider, times(1)).getUserIdFromToken(refreshToken);
        verify(userRepository, times(1)).findById(userId);
        verify(jwtTokenProvider, never()).createAccessToken(anyLong(), anyString(), anyString());
    }
}
