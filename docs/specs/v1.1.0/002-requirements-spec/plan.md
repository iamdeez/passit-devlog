# Plan: requirements-spec

> Branch: 002-requirements-spec | Date: 2026-06-19 | Spec: [spec.md](./spec.md)

## 사전 검증 (Constitution Gates)

> passit-devlog에 별도 constitution.md가 없으므로 기본 4개 조항을 사용한다.

- [x] **성능 원칙**: 비동기 처리(SNS/SQS) 및 서비스 분리로 API 응답 속도를 독립적으로 유지한다.
- [x] **호환성 원칙**: 각 서비스 API는 Spring Boot 컨트롤러 레이어에서 버전 없이 안정적으로 노출된다.
- [x] **테스트 원칙**: 모든 FR-XXX에 대해 spec.md의 SC-XXX 수용 기준이 정의되어 있다.
- [x] **스펙 범위 원칙**: 이 plan은 이미 구현된 소스코드를 검증·문서화하는 범위로 한정한다. 신규 구현이 필요한 Could 항목은 Out of Scope로 명시되어 있다.

---

## 기술 컨텍스트

- **언어 / 런타임**: Java 17 (Spring Boot 3.x) / React 18
- **DB**: MySQL 8.0 (공용 단일 DB, 스키마 분리)
- **캐시**: Valkey(Redis 호환) — service-account·service-cs 사용
- **파일 스토리지**: AWS S3 / 로컬 LocalStack S3 에뮬레이터
- **메시징**: AWS SNS + SQS (ticket ↔ trade 이벤트 연동)
- **실시간 통신**: WebSocket / STOMP (service-chat)
- **인증**: JWT (Access + Refresh Token Rotation)
- **OAuth**: 카카오 OAuth 2.0 (service-account)
- **이메일**: AWS SES / SMTP (이메일 인증, 비밀번호 재설정)
- **인프라**: AWS EKS (Fargate), Aurora MySQL, Terraform, ArgoCD
- **로컬 스택**: Docker Compose (Nginx, MySQL, LocalStack, Valkey)
- **테스트**: Playwright E2E (frontend/e2e)

---

## MSA 서비스 구성 및 요구사항 매핑

```
[브라우저 / React 18]
       │
       ▼
[Nginx :80] ── CloudFront path routing
       │
       ├── /api/auth/*, /api/users/*      → service-account :8081
       ├── /api/tickets/*                 → service-ticket  :8082
       ├── /api/trades/*, /api/deals/*    → service-trade   :8083
       ├── /api/chat/*, /ws/*             → service-chat    :8084  (WebSocket)
       └── /api/cs/*, /api/notices/*, ... → service-cs      :8085

[MySQL :3307] ←── 공용 DB (스키마별 분리)
[LocalStack :4566] ←── S3 에뮬레이터
[Valkey :6379] ←── 캐시 (account, cs)
[SNS/SQS] ←── 서비스 간 이벤트 연동 (ticket ↔ trade)
```

---

## 서비스별 설계 상세

### service-account (port 8081)

**담당 FR**: FR-001~006, FR-034~035, FR-037~038, FR-039~040

| FR | 구현 컴포넌트 | 비고 |
|---|---|---|
| FR-001 회원가입 | `AuthController.register()` | bcrypt 해싱 |
| FR-002 이메일 인증 | `EmailVerificationService` | Valkey TTL 토큰 |
| FR-003 JWT / RTR | `AuthService.refreshToken()` | Refresh Token 블랙리스트 Valkey 저장 |
| FR-004 카카오 OAuth | `KakaoAuthService` | 콜백 `/api/auth/kakao/callback` |
| FR-005 계정 정보 수정 | `UserController` | S3 프로필 이미지 업로드 |
| FR-006 비밀번호 재설정 | `AuthController.resetPassword()` | SES/SMTP 이메일 발송 |
| FR-034 회원 목록 (Admin) | `UserController.getUsers()` | 관리자 권한 필터링 |
| FR-035 회원 상태 변경 | `UserController.updateStatus()` | ACTIVE/SUSPENDED/BANNED |
| FR-037~038 후기/별점 | `ActivityController` | 거래 완료 후 등록 |
| FR-039~040 알림 발송 | SNS 발행 → SQS 수신 | 비동기 처리 |

**보안 설계**:
- JWT 검증: Spring Security Filter Chain
- 역할 분리: `ROLE_USER`, `ROLE_ADMIN` (`@PreAuthorize`)
- Refresh Token: Valkey 저장, RTR 방식으로 재사용 방지

---

### service-ticket (port 8082)

**담당 FR**: FR-007~015

| FR | 구현 컴포넌트 | 비고 |
|---|---|---|
| FR-007 티켓 목록 조회 | `TicketController.getTickets()` | 카테고리·키워드·상태 필터, 페이징 |
| FR-008 티켓 상세 조회 | `TicketController.getTicket()` | S3 이미지 URL 포함 |
| FR-011 티켓 등록 | `TicketController.createTicket()` | Presigned URL → S3 업로드 |
| FR-012 중복 방지 | Service 레이어 검증 | 동일 판매자·좌석·날짜 기준 |
| FR-013 수정·삭제 | `TicketController.updateTicket()` | 본인 여부 검증 |
| FR-014 만료 티켓 삭제 | `TicketController` (admin) | 공연 날짜 경과 기준 |
| FR-015 정가 초과 경고 | Service 레이어 validation | 경고 메시지 반환 |

**외부 연동**:
- S3 이미지 업로드: Presigned URL 방식 (LocalStack 로컬 에뮬레이션)
- 거래 이벤트 수신: SNS→SQS → `TicketEventHandler` (거래 완료 시 티켓 상태 SOLD로 전환)

---

### service-trade (port 8083)

**담당 FR**: FR-016~022

| FR | 구현 컴포넌트 | 비고 |
|---|---|---|
| FR-016 양도 요청 | `DealController.createDeal()` | PENDING 상태로 생성 |
| FR-017 수락/거절 | `DealController.acceptDeal()`, `rejectDeal()` | 채팅 연동 |
| FR-018 결제 | `PaymentsController` | 결제 후 PAID 전환 |
| FR-019 상태 추적 | `DealController.getDeal()` | PENDING→ACCEPTED→PAID→COMPLETED |
| FR-020 강제 완료/취소 | 관리자 API | SNS 알림 발행 |
| FR-021 거래 목록 | `DealController.getDeals()` | 구매자·판매자 역할별 조회 |

**동시성 제어 설계**:
- 동일 티켓에 복수 Deal 생성 방지: DB 유니크 제약 + 낙관적 락(Optimistic Lock)
- 결제 중복 처리 방지: Deal 상태 전이 검증 (ACCEPTED 상태에서만 결제 가능)

**외부 연동**:
- ticket 서비스 이벤트 발행: SNS Topic `ticket-events`
- 거래 완료 시 ticket 서비스에 이벤트 발송: SQS Queue `deal-events`

---

### service-chat (port 8084)

**담당 FR**: FR-023~027

| FR | 구현 컴포넌트 | 비고 |
|---|---|---|
| FR-023 채팅방 생성 | `ChatRoomController.createRoom()` | 구매자→판매자 기준 1:1 |
| FR-024 메시지 송수신 | `WebSocketController` | STOMP over WebSocket |
| FR-024 거래 액션 메시지 | `DealController` (chat) | 시스템 메시지 타입 분리 |
| FR-025 채팅 목록·이력 | `ChatRoomController.getRooms()` | 최신 메시지 포함 |
| FR-026 금칙어 필터링 | `KeywordFilterService` | 계좌번호, 타 메신저 패턴 감지 |
| FR-027 관리자 모니터링 | `AdminRoomStatusController` | 채팅방 상태 OPEN/LOCK |

**WebSocket 설계**:
- 엔드포인트: `/ws` (SockJS fallback 지원)
- STOMP 토픽: `/topic/room/{roomId}` (메시지), `/user/queue/notification` (알림)
- 인증: STOMP CONNECT 헤더에 JWT 포함 → Spring Security 검증

**채팅방 상태 관리**:
- OPEN: 정상 채팅 가능
- LOCK: 거래 진행 중 (수락 이후)
- 거절/완료 시 채팅방 아카이브 처리

---

### service-cs (port 8085)

**담당 FR**: FR-028~033, FR-036

| FR | 구현 컴포넌트 | 비고 |
|---|---|---|
| FR-028 신고 접수 | `ReportController.createReport()` | 신고 유형 분류 |
| FR-029 신고 처리 | `ReportController` (admin) | 경고/정지/무효 처리 후 account 서비스 연동 |
| FR-030 문의 등록/조회 | `InquiryUserController` | 첨부파일 S3 업로드 지원 |
| FR-031 문의 답변 | `InquiryAdminController` | status ANSWERED 전환 + 알림 |
| FR-032 공지사항 CRUD | `NoticeController` | 관리자 전용 생성·수정·삭제 |
| FR-033 FAQ CRUD | `FaqController` | 카테고리별 분류 |
| FR-036 카테고리 관리 | `CategoryController` | 대·중·소 트리 구조 |

---

### Frontend (React 18)

**담당 FR**: 모든 FR의 화면 구현

| 화면 | 관련 FR | 주요 컴포넌트 |
|---|---|---|
| 메인 (홈) | FR-007, FR-009 | `HomePage.js` — 카테고리 탐색, 인기 티켓 |
| 로그인/회원가입 | FR-001~004 | `AuthPage.js`, `LoginForm`, `RegisterForm` |
| 비밀번호 재설정 | FR-006 | `ResetPasswordPage.js` |
| 티켓 목록 | FR-007 | `TicketListPage.jsx` |
| 티켓 상세 | FR-008 | `TicketDetailPage.jsx` |
| 티켓 등록 | FR-011 | `TicketCreatePage.jsx` |
| 마이페이지 | FR-005, FR-021, FR-037~038 | `MyPage.js`, `MyTicketListPage.jsx` |
| 채팅 목록 | FR-025 | `ChatRoomPage.jsx` |
| 채팅방 | FR-023~024, FR-026 | `ChatRoom/index.jsx`, `MessageBubble` |
| 거래 목록 | FR-021 | `DealListPage.jsx` |
| 결제 | FR-018 | `BuyerPaymentPage.js`, `DealAcceptPage.js` |
| 공지사항 | FR-032 | `NoticePage.jsx`, `NoticeListPage.js` |
| FAQ | FR-033 | `FaqListPage.jsx`, `FaqPage.jsx` |
| 문의 | FR-030~031 | `InquiryCreatePage.jsx`, `InquiryListPage.jsx` |
| 신고 | FR-028 | `ReportCreatePage.jsx` |
| 관리자 - 회원 | FR-034~035 | `AdminUserManagementPage.js` |
| 관리자 - 티켓 | FR-014 | `AdminTicketManagementPage.jsx` |
| 관리자 - 신고 | FR-029 | `AdminReportListPage.jsx`, `AdminReportDetailPage.jsx` |
| 관리자 - 문의 | FR-031 | `AdminInquiryListPage.jsx`, `AdminInquiryDetailPage.jsx` |
| 관리자 - 공지 | FR-032 | `AdminNoticeListPage.jsx` |
| 관리자 - FAQ | FR-033 | `AdminFaqListPage.jsx` |
| 관리자 - 카테고리 | FR-036 | `AdminCategoryManagementPage.js` |
| 관리자 - 대시보드 | US-A14 | `AdminDashboardPage.js` |

---

## 인터페이스 계약

### 서비스 간 이벤트

| 발행 서비스 | 이벤트 | 수신 서비스 | 처리 내용 |
|---|---|---|---|
| service-trade | `DealAcceptedEvent` | service-chat | 채팅방 LOCK 상태 전환 |
| service-trade | `DealCompletedEvent` | service-ticket | 티켓 상태 SOLD 전환 |
| service-trade | `DealRejectedEvent` | service-chat | 채팅방 아카이브 |
| service-account | `UserSuspendedEvent` | service-chat | 채팅방 강제 종료 |

### 공통 API 패턴

```
- 인증 필요: Authorization: Bearer {access_token}
- 페이징: ?page=0&size=20 (Spring Pageable)
- 에러 응답: { "code": "ERROR_CODE", "message": "..." }
- 성공 응답: { "success": true, "data": {...} }
```

---

## 사전 영향도 분석 결과

### 영향 파일 목록

이미 001-source-integration으로 모든 소스가 이관된 상태이므로,
본 스펙에서의 영향은 **문서 추가** 및 **검증 작업**에 한정된다.

| 파일 | 변경 유형 | 내용 |
|---|---|---|
| `docs/specs/v1.1.0/002-requirements-spec/spec.md` | 신규 | 요구사항 정의 |
| `docs/specs/v1.1.0/002-requirements-spec/plan.md` | 신규 | 기술 구현 매핑 |
| `docs/specs/v1.1.0/002-requirements-spec/tasks.md` | 신규 | 태스크 분해 |
| `docs/specs/v1.1.0/CHANGES.md` | 수정 | 002 완료 기록 |

---

## 테스트 전략

| SC 식별자 | 테스트 유형 | 시나리오 | 기대 결과 |
|---|---|---|---|
| SC-001~003 | 통합 (E2E) | 회원가입 → 이메일 인증 → 로그인 → 토큰 갱신 | JWT 발급, RTR 동작 |
| SC-007~008 | 통합 (E2E) | 카테고리 선택 → 목록 조회 → 상세 진입 | 필터링 결과, 이미지 URL |
| SC-009~012 | API 검증 | 티켓 등록 → 중복 등록 시도 → 수정 → 삭제 | 각 단계 상태 코드 확인 |
| SC-013~018 | E2E | 양도 요청 → 수락 → 결제 → 완료 | 전체 Deal 상태 전이 |
| SC-019~022 | E2E | 채팅방 생성 → 메시지 송수신 → 양도 요청 | WebSocket 실시간 전달 |
| SC-023~027 | API 검증 | 신고·문의 접수 → 관리자 처리 → 상태 변경 | status 전환 확인 |
| SC-028~029 | API 검증 | 관리자 회원 목록 조회 → 상태 변경 | 필터, 상태 반영 |
| SC-030~031 | API 검증 | 거래 완료 후 리뷰 등록 → 중복 리뷰 시도 | 409 반환 |

**E2E 테스트 도구**: Playwright (`frontend/e2e/`)

기존 E2E 스펙:
- `chat-flow.spec.js` — SC-019~022
- `deal-flow.spec.js` — SC-013~018
- `cs-inquiry-flow.spec.js` — SC-025
- `cs-report-flow.spec.js` — SC-023

---

## 기타 고려사항

### 로컬 개발 환경 설정

로컬에서는 `local/docker-compose.yml`을 통해 전체 스택 구동:

```bash
cd local
cp .env.example .env          # GITHUB_TOKEN, GITHUB_ACTOR 입력
bash setup.sh                  # GHCR 로그인 및 이미지 pull
docker compose up -d           # 전체 스택 구동
```

환경 변수 관리:
- 로컬: `local/.env` (git 제외)
- Dev/Prod: AWS Secret Manager

### 알려진 구현 한계

- `service-account`의 `ddl-auto: update` 설정 — 로컬 외 환경에서는 `none`으로 변경 필요
- SNS/SQS 이벤트 구독은 application-prod.yml에 AWS 설정이 존재하나, 로컬에서는 LocalStack 미사용 (직접 DB 연동)
- 프론트엔드 빌드 시 `REACT_APP_API_BASE_URL` 환경변수로 API 엔드포인트를 지정해야 함
