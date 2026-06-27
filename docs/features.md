# Passit — 구현 기능 목록

> 우선순위: **M** = Must (MVP 필수) | **S** = Should | **C** = Could (선택)

---

## 🔐 service-account — 인증·계정 관리 (port 8081)

| 기능 | 우선순위 | 구현 |
|---|---|---|
| 이메일 회원가입 | M | ✅ `AuthController.register()` |
| 이메일 로그인 + JWT 발급 | M | ✅ `AuthController.login()` |
| Refresh Token Rotation | M | ✅ `AuthService.refreshToken()` |
| 카카오 OAuth 로그인 | S | ✅ `KakaoAuthService` |
| 이메일 인증 (중복 가입 방지) | S | ✅ `EmailVerificationService` |
| 회원 정보 조회 · 수정 | M | ✅ `UserController` |
| 회원 상태 변경 (관리자) | M | ✅ `UserController.updateStatus()` |
| 활동 이력 조회 (후기/별점) | S | ✅ `ActivityController` |
| 비밀번호 재설정 | M | ✅ `AuthController.resetPassword()` |
| 이메일 발송 (AWS SES / SMTP) | S | ✅ `SesEmailService`, `SmtpEmailService` |

---

## 🎫 service-ticket — 티켓 관리 (port 8082)

| 기능 | 우선순위 | 구현 |
|---|---|---|
| 티켓 목록 조회 (페이징, 카테고리 필터) | M | ✅ `TicketController.getTickets()` |
| 티켓 상세 조회 | M | ✅ `TicketController.getTicket()` |
| 티켓 등록 (이미지 S3 업로드 포함) | M | ✅ `TicketController.createTicket()` |
| 티켓 수정 | M | ✅ `TicketController.updateTicket()` |
| 티켓 삭제 | M | ✅ `TicketController.deleteTicket()` |
| 중복 등록 방지 (판매자 티켓 중복 검증) | M | ✅ Service 레이어 |
| 만료 티켓 처리 (관리자) | M | ✅ `TicketController` (admin) |
| 관심 티켓 저장 (즐겨찾기) | S | ✅ `FavoriteService`, `TicketDetailPage` 즐겨찾기 버튼 |

---

## 💰 service-trade — 거래·결제 (port 8083)

| 기능 | 우선순위 | 구현 |
|---|---|---|
| 양도 요청 (Deal 생성) | M | ✅ `DealController.createDeal()` |
| 양도 수락 / 거절 | M | ✅ `DealController.acceptDeal()`, `rejectDeal()` |
| 결제 처리 | C | ✅ `PaymentsController` |
| 거래 상태 조회 | M | ✅ `DealController.getDeal()` |
| 거래 강제 완료 / 취소 (관리자) | M | ✅ `TicketController` in trade |
| 거래 목록 조회 (구매자·판매자) | M | ✅ `DealController.getDeals()` |

---

## 💬 service-chat — 실시간 채팅 (port 8084)

| 기능 | 우선순위 | 구현 |
|---|---|---|
| 채팅방 생성 | M | ✅ `ChatRoomController.createRoom()` |
| WebSocket/STOMP 메시지 송수신 | M | ✅ `WebSocketController` |
| 채팅 내 양도 요청 | M | ✅ `DealController` (chat) |
| 채팅 내 양도 수락 / 거절 | M | ✅ `DealController` (chat) |
| 채팅방 상태 관리 (OPEN/LOCK) | M | ✅ `RoomStatusController` |
| 채팅 목록 조회 | M | ✅ `ChatRoomController.getRooms()` |
| 관리자 채팅 모니터링 | C | ✅ `AdminRoomStatusController` |

---

## 📋 service-cs — 고객지원 (port 8085)

| 기능 | 우선순위 | 구현 |
|---|---|---|
| 공지사항 목록 · 상세 조회 | M | ✅ `NoticeController` |
| 공지사항 CRUD (관리자) | M | ✅ `NoticeController` (admin) |
| FAQ 목록 · 상세 조회 | S | ✅ `FaqController` |
| FAQ CRUD (관리자) | S | ✅ `FaqController` (admin) |
| 이용 가이드 (관리자) | S | ✅ `GuideController` |
| 1:1 문의 등록 (사용자) | S | ✅ `InquiryUserController.createInquiry()` |
| 문의 목록 · 상세 조회 (사용자) | S | ✅ `InquiryUserController` |
| 문의 목록 · 답변 (관리자) | S | ✅ `InquiryAdminController` |
| 신고 접수 (사용자) | M | ✅ `ReportController.createReport()` |
| 신고 목록 · 처리 (관리자) | M | ✅ `ReportController` (admin) |
| CS 카테고리 관리 (관리자) | S | ✅ `CategoryController` |

---

## 🖥 frontend — React 18

| 화면 / 기능 | 우선순위 | 구현 |
|---|---|---|
| 홈 화면 (티켓 목록, 카테고리 탐색) | M | ✅ `HomePage`, `TicketListPage` |
| 티켓 상세 | M | ✅ `TicketDetailPage` |
| 티켓 등록 · 수정 | M | ✅ `TicketCreatePage`, `TicketEditPage` |
| 내 티켓 목록 (마이페이지) | M | ✅ `MyTicketListPage` |
| 채팅 목록 · 채팅방 | M | ✅ `ChatListPage`, `ChatRoomPage` |
| 채팅 내 양도 요청 · 수락 플로우 | M | ✅ `ChatRoom` (WebSocket/STOMP) |
| 구매자 결제 페이지 | C | ✅ `BuyerPaymentPage` |
| 거래 수락 / 결과 페이지 | M | ✅ `DealAcceptPage`, `PaymentResultPage` |
| 거래 목록 (마이페이지) | M | ✅ `DealListPage` |
| 마이페이지 프로필 · 활동 이력 | S | ✅ `ProfilePage`, `ActivityPage` |
| 공지사항 · FAQ · 문의 · 신고 | S | ✅ `cs/` 페이지 전체 |
| 관리자 대시보드 | M | ✅ `AdminDashboardPage` |
| 관리자 회원 관리 | M | ✅ `AdminUserManagementPage` |
| 관리자 티켓 관리 | M | ✅ `AdminTicketManagementPage` |
| 관리자 신고 관리 | M | ✅ `AdminReport*Page` |
| 관리자 공지 · FAQ · 문의 관리 | M | ✅ `AdminNotice*`, `AdminFaq*`, `AdminInquiry*` |
| 관리자 카테고리 관리 | S | ✅ `AdminCategoryManagementPage` |
| 카카오 OAuth 콜백 | S | ✅ `KakaoCallbackPage` |
| Demo Mode (mock 데이터, 백엔드 없이 동작) | — | ✅ `src/demo/` |

---

## 미구현 기능 (Should / Could)

| 기능 | 우선순위 | 비고 |
|---|---|---|
| 구매 이력 기반 티켓 추천 | C | 별도 추천 엔진 필요 |
| OCR 티켓 자동 인식 | C | 외부 OCR 서비스 연동 필요 |
| D-1 공연 리마인드 알림 | C | 배치/스케줄러 구현 필요 |
| 에스크로 실 결제 연동 | C | PG사 연동 필요 |
| 채팅 위험 키워드 필터 관리자 설정 UI | S | 백엔드 `KeywordFilterService` 구현 완료, 관리자 설정 UI 미구현 |
| 월별 거래 통계 대시보드 | S | 집계 쿼리 구현 필요 |
