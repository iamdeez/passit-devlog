package com.company.ticketservice.controller;

import com.company.ticketservice.config.TestConfig;
import com.company.ticketservice.entity.Ticket;
import com.company.ticketservice.entity.TicketStatus;
import com.company.ticketservice.entity.TradeType;
import com.company.ticketservice.repository.TicketRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestConfig.class)
@Transactional
@DisplayName("TicketController 통합 테스트")
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TicketRepository ticketRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private Long testUserId;
    private Ticket testTicket;
    private LocalDateTime futureDate;

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    /**
     * 테스트용 JWT 토큰 생성
     */
    private String createTestToken(Long userId) {
        return createTestToken(userId, "USER");
    }

    private String createTestToken(Long userId, String role) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + 3600000); // 1시간 후

        return Jwts.builder()
                .setSubject(userId.toString())
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key)
                .compact();
    }

    @BeforeEach
    void setUp() {
        // 테스트 사용자 ID
        testUserId = 1L;
        futureDate = LocalDateTime.now().plusDays(30).withNano(0);
        
        // 테스트 티켓 생성
        testTicket = Ticket.builder()
                .eventName("테스트 콘서트")
                .eventDate(futureDate)
                .eventLocation("올림픽공원")
                .ownerId(testUserId)
                .ticketStatus(TicketStatus.AVAILABLE)
                .originalPrice(new BigDecimal("100000"))
                .sellingPrice(new BigDecimal("95000"))
                .seatInfo("VIP석 1번")
                .ticketType("일반")
                .categoryId(1L)
                .image1("https://cdn.passit.test/tickets/test-1.png")
                .image2("https://cdn.passit.test/tickets/test-2.png")
                .description("테스트 티켓입니다")
                .tradeType(TradeType.DELIVERY)
                .build();
        
        ticketRepository.save(testTicket);
    }

    private MockMultipartFile ticketImage(String filename) {
        return new MockMultipartFile(
                "image1",
                filename,
                "image/png",
                "ticket-image".getBytes(StandardCharsets.UTF_8)
        );
    }

    private String formattedFutureDate() {
        return futureDate.format(DATE_TIME_FORMATTER);
    }

    @Test
    @DisplayName("티켓 리스트 조회 성공 (인증 불필요)")
    void getTickets_Success() throws Exception {
        // when & then
        mockMvc.perform(get("/api/tickets")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.page").value(0))
                .andExpect(jsonPath("$.data.size").value(20))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    @DisplayName("티켓 상세 조회 성공 (인증 불필요)")
    void getTicketDetail_Success() throws Exception {
        // given
        Long ticketId = testTicket.getTicketId();

        // when & then
        mockMvc.perform(get("/api/tickets/{ticketId}", ticketId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.ticketId").value(ticketId))
                .andExpect(jsonPath("$.data.eventName").value("테스트 콘서트"))
                .andExpect(jsonPath("$.data.image1").value("https://cdn.passit.test/tickets/test-1.png"))
                .andExpect(jsonPath("$.data.seatInfo").value("VIP석 1번"))
                .andExpect(jsonPath("$.data.sellingPrice").value(95000));
    }

    @Test
    @DisplayName("티켓 상세 조회 실패 - 존재하지 않는 티켓")
    void getTicketDetail_Fail_NotFound() throws Exception {
        // when & then
        mockMvc.perform(get("/api/tickets/99999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("티켓 검색 - 이벤트명 필터링")
    void getTickets_WithEventNameFilter() throws Exception {
        // when & then
        mockMvc.perform(get("/api/tickets")
                        .param("keyword", "테스트")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].eventName").value("테스트 콘서트"));
    }

    @Test
    @DisplayName("티켓 검색 - 상태 필터링")
    void getTickets_WithStatusFilter() throws Exception {
        // when & then
        mockMvc.perform(get("/api/tickets")
                        .param("status", "AVAILABLE")
                        .param("categoryId", "1")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].ticketStatus").value("AVAILABLE"))
                .andExpect(jsonPath("$.data.content[0].categoryId").value(1));
    }

    @Test
    @DisplayName("티켓 검색 - 정렬")
    void getTickets_WithSorting() throws Exception {
        // when & then
        mockMvc.perform(get("/api/tickets")
                        .param("sortBy", "eventDate")
                        .param("sortDirection", "ASC")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("판매자 본인 티켓 조회 성공 (인증 필요)")
    void getMyTickets_Success() throws Exception {
        // given
        String token = createTestToken(testUserId);

        // when & then
        mockMvc.perform(get("/api/sellers/tickets")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("판매자 본인 티켓 조회 실패 - 인증 없음")
    void getMyTickets_Fail_Unauthorized() throws Exception {
        // when & then
        mockMvc.perform(get("/api/sellers/tickets"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("티켓 등록 성공 - /api/tickets alias 및 이미지 URL 반환")
    void createTicket_Success_WithPublicAlias() throws Exception {
        // given
        String token = createTestToken(testUserId);

        // when & then
        mockMvc.perform(multipart("/api/tickets")
                        .file(ticketImage("ticket.png"))
                        .param("eventName", "신규 콘서트")
                        .param("eventDate", futureDate.plusDays(1).format(DATE_TIME_FORMATTER))
                        .param("eventLocation", "잠실실내체육관")
                        .param("originalPrice", "150000")
                        .param("sellingPrice", "140000")
                        .param("seatInfo", "R석 12번")
                        .param("ticketType", "일반")
                        .param("categoryId", "1")
                        .param("tradeType", "DELIVERY")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.eventName").value("신규 콘서트"))
                .andExpect(jsonPath("$.data.ownerId").value(testUserId))
                .andExpect(jsonPath("$.data.image1").value(org.hamcrest.Matchers.startsWith("http://localhost:8082/uploads/")));
    }

    @Test
    @DisplayName("티켓 등록 실패 - 동일 판매자 좌석 날짜 중복")
    void createTicket_Fail_DuplicateSeatAndDate() throws Exception {
        // given
        String token = createTestToken(testUserId);

        // when & then
        mockMvc.perform(multipart("/api/tickets")
                        .file(ticketImage("duplicate.png"))
                        .param("eventName", "중복 콘서트")
                        .param("eventDate", formattedFutureDate())
                        .param("eventLocation", "올림픽공원")
                        .param("originalPrice", "100000")
                        .param("sellingPrice", "95000")
                        .param("seatInfo", "VIP석 1번")
                        .param("ticketType", "일반")
                        .param("categoryId", "1")
                        .param("tradeType", "DELIVERY")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("티켓 등록 실패 - 정가 초과 경고 응답")
    void createTicket_Fail_SellingPriceExceedsOriginalWarning() throws Exception {
        // given
        String token = createTestToken(testUserId);

        // when & then
        mockMvc.perform(multipart("/api/tickets")
                        .file(ticketImage("over-price.png"))
                        .param("eventName", "정가 초과 콘서트")
                        .param("eventDate", futureDate.plusDays(2).format(DATE_TIME_FORMATTER))
                        .param("eventLocation", "고척스카이돔")
                        .param("originalPrice", "100000")
                        .param("sellingPrice", "120000")
                        .param("seatInfo", "A석 3번")
                        .param("ticketType", "일반")
                        .param("categoryId", "1")
                        .param("tradeType", "DELIVERY")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value(org.hamcrest.Matchers.containsString("경고")))
                .andExpect(jsonPath("$.error").value(org.hamcrest.Matchers.containsString("정가")));
    }

    @Test
    @DisplayName("본인 티켓 수정 성공 - /api/tickets/{id} alias")
    void updateTicket_Success_WithPublicAlias() throws Exception {
        // given
        String token = createTestToken(testUserId);
        Long ticketId = testTicket.getTicketId();

        // when & then
        mockMvc.perform(multipart("/api/tickets/{ticketId}", ticketId)
                        .file(ticketImage("updated.png"))
                        .param("eventName", "수정된 콘서트")
                        .param("sellingPrice", "90000")
                        .header("Authorization", "Bearer " + token)
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.eventName").value("수정된 콘서트"))
                .andExpect(jsonPath("$.data.sellingPrice").value(90000))
                .andExpect(jsonPath("$.data.image1").value(org.hamcrest.Matchers.startsWith("http://localhost:8082/uploads/")));
    }

    @Test
    @DisplayName("본인 티켓 삭제 성공 - /api/tickets/{id} alias")
    void deleteTicket_Success_WithPublicAlias() throws Exception {
        // given
        String token = createTestToken(testUserId);
        Long ticketId = testTicket.getTicketId();

        // when & then
        mockMvc.perform(delete("/api/tickets/{ticketId}", ticketId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("타인 티켓 수정 실패 - 403")
    void updateTicket_Fail_ForbiddenForOtherUser() throws Exception {
        // given
        String token = createTestToken(2L);
        Long ticketId = testTicket.getTicketId();

        // when & then
        mockMvc.perform(multipart("/api/tickets/{ticketId}", ticketId)
                        .param("eventName", "타인 수정 시도")
                        .header("Authorization", "Bearer " + token)
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        }))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("타인 티켓 삭제 실패 - 403")
    void deleteTicket_Fail_ForbiddenForOtherUser() throws Exception {
        // given
        String token = createTestToken(2L);
        Long ticketId = testTicket.getTicketId();

        // when & then
        mockMvc.perform(delete("/api/tickets/{ticketId}", ticketId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("관리자 만료 티켓 처리 성공")
    void expireTickets_Success_Admin() throws Exception {
        // given
        Ticket expiredTarget = Ticket.builder()
                .eventName("지난 공연")
                .eventDate(LocalDateTime.now().minusDays(1))
                .eventLocation("지난 공연장")
                .ownerId(testUserId)
                .ticketStatus(TicketStatus.AVAILABLE)
                .originalPrice(new BigDecimal("70000"))
                .sellingPrice(new BigDecimal("65000"))
                .seatInfo("B석 7번")
                .ticketType("일반")
                .categoryId(1L)
                .description("만료 처리 대상")
                .tradeType(TradeType.DELIVERY)
                .build();
        ticketRepository.saveAndFlush(expiredTarget);

        String adminToken = createTestToken(99L, "ADMIN");

        // when & then
        mockMvc.perform(post("/api/admin/tickets/expire")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.expiredCount").value(1));

        mockMvc.perform(get("/api/tickets/{ticketId}", expiredTarget.getTicketId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.ticketStatus").value("EXPIRED"));
    }

    @Test
    @DisplayName("관리자 만료 티켓 처리 실패 - 일반 사용자 403")
    void expireTickets_Fail_UserForbidden() throws Exception {
        // given
        String token = createTestToken(testUserId);

        // when & then
        mockMvc.perform(post("/api/admin/tickets/expire")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("티켓 상태 변경 성공 (인증 필요)")
    void updateTicketStatus_Success() throws Exception {
        // given
        String token = createTestToken(testUserId);
        Long ticketId = testTicket.getTicketId();

        // when & then
        mockMvc.perform(put("/api/tickets/{ticketId}/status/{newStatus}", ticketId, "RESERVED")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("티켓 상태 변경 실패 - 인증 없음")
    void updateTicketStatus_Fail_Unauthorized() throws Exception {
        // given
        Long ticketId = testTicket.getTicketId();

        // when & then
        mockMvc.perform(put("/api/tickets/{ticketId}/status/{newStatus}", ticketId, "RESERVED"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("시드 데이터 생성 성공 (인증 불필요)")
    void seedTickets_Success() throws Exception {
        // when & then
        mockMvc.perform(post("/api/admin/tickets/seed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
