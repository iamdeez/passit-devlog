# Spec: source-integration

> Branch: 001-source-integration | Date: 2026-06-19 | Version: v1.1.0

---

## 배경 및 목적

v1.0.0에서는 Passit 플랫폼의 **운영 인프라**(Docker Compose 로컬 스택, Terraform IaC, Render/Supabase/Vercel 배포 설정)를 passit-devlog 레포지토리에 구성했다.

그러나 백엔드 5개 서비스(Spring Boot)와 프론트엔드(React)의 실제 **애플리케이션 소스코드**는 팀 레포지토리(`CLD4-T2-IAMConan/Passit`)에만 존재하며, 포트폴리오 레포지토리에 포함되어 있지 않다.

이 스펙은 애플리케이션 소스코드를 passit-devlog에 통합하여 **인프라 코드와 애플리케이션 코드가 한 곳에서 확인 가능한 자기 완결형 포트폴리오**를 완성하는 것을 목적으로 한다.

---

## 사용자 스토리 (User Stories)

- **US-001**: 포트폴리오 열람자로서, 인프라 코드와 애플리케이션 코드를 한 레포지토리에서 확인하고 싶다.
- **US-002**: 포트폴리오 열람자로서, 각 마이크로서비스가 어떤 기능을 구현하는지 파악하고 싶다.
- **US-003**: 개발자(나)로서, 로컬에서 소스코드를 바로 빌드·실행할 수 있어야 한다.
- **US-004**: 포트폴리오 열람자로서, 실제 구현된 기능과 요구사항의 대응 관계를 확인하고 싶다.

---

## 기능 요구사항 (Functional Requirements)

### 소스코드 통합 (FR-001 ~ FR-007)

- **FR-001**: `backend/service-account` 디렉토리에 account 서비스 소스코드가 포함된다.
- **FR-002**: `backend/service-ticket` 디렉토리에 ticket 서비스 소스코드가 포함된다.
- **FR-003**: `backend/service-trade` 디렉토리에 trade 서비스 소스코드가 포함된다.
- **FR-004**: `backend/service-chat` 디렉토리에 chat 서비스 소스코드가 포함된다.
- **FR-005**: `backend/service-cs` 디렉토리에 cs 서비스 소스코드가 포함된다.
- **FR-006**: `frontend/` 디렉토리에 React 프론트엔드 소스코드가 포함된다.
- **FR-007**: 각 서비스의 빌드 산출물(`.class`, `build/`, `node_modules/`, `.gradle/`)은 추적되지 않는다.

### 구현 기능 문서화 (FR-008)

- **FR-008**: `docs/features.md`에 각 서비스별 구현 기능 목록과 요구사항 대응 현황이 기록된다.

---

## 구현 기능 현황 (Implemented Features)

아래는 소스코드에서 확인된 **구현 완료** 기능 목록이다. 요구사항 우선순위(M/S/C)는 [기능적 요구사항 문서](../../../../docs-internal/requirements.md) 기준이다.

### 🔐 service-account — 인증 · 계정 관리

| 기능 | 우선순위 | Controller / Service |
|---|---|---|
| 이메일 회원가입 / 로그인 | M | `AuthController`, `AuthService` |
| JWT 발급 · Refresh Token Rotation | M | `AuthService` |
| 카카오 OAuth 로그인 | S | `KakaoAuthService` |
| 이메일 인증 (중복 가입 방지) | S | `EmailVerificationService` |
| 회원 정보 조회 · 수정 | M | `UserController`, `UserService` |
| 활동 이력 조회 | S | `ActivityController`, `ActivityService` |
| 비밀번호 재설정 | M | `AuthService` |

### 🎫 service-ticket — 티켓 관리

| 기능 | 우선순위 | Controller / Service |
|---|---|---|
| 티켓 목록 조회 (카테고리·검색 필터) | M | `TicketController` |
| 티켓 상세 조회 | M | `TicketController` |
| 티켓 등록 (이미지 업로드 포함) | M | `TicketController` |
| 티켓 수정 · 삭제 | M | `TicketController` |
| 중복 등록 방지 | M | Service 레이어 |

### 💰 service-trade — 거래 · 결제

| 기능 | 우선순위 | Controller / Service |
|---|---|---|
| 양도 요청 (Deal 생성) | M | `DealController` |
| 양도 수락 / 거절 | M | `DealController` |
| 결제 처리 (에스크로 기반) | C | `PaymentsController` |
| 거래 상태 관리 (PENDING→PAID) | M | `DealController` |
| 거래 강제 완료 / 취소 (관리자) | M | `TicketController` in trade |

### 💬 service-chat — 실시간 채팅

| 기능 | 우선순위 | Controller / Service |
|---|---|---|
| WebSocket 채팅방 생성 · 입장 | M | `ChatRoomController` |
| 실시간 메시지 송수신 (STOMP) | M | `WebSocketController` |
| 채팅 내 양도 요청 · 수락 플로우 | M | `DealController` (chat) |
| 채팅방 상태 관리 (OPEN/LOCK) | M | `RoomStatusController` |
| 관리자 채팅 모니터링 | C | `AdminRoomStatusController` |

### 📋 service-cs — 고객지원

| 기능 | 우선순위 | Controller / Service |
|---|---|---|
| 공지사항 CRUD (관리자) | M | `NoticeController` |
| FAQ CRUD (관리자) | S | `FaqController` |
| 이용 가이드 (관리자) | S | `GuideController` |
| 1:1 문의 등록 (사용자) | S | `InquiryUserController` |
| 문의 목록 · 답변 (관리자) | S | `InquiryAdminController` |
| 신고 접수 · 처리 | M | `ReportController` |
| CS 카테고리 관리 | S | `CategoryController` |

### 🖥 frontend — React

| 페이지 / 기능 | 우선순위 |
|---|---|
| 홈 화면 (티켓 목록, 카테고리 탐색) | M |
| 티켓 상세 · 등록 · 수정 | M |
| 판매자 채팅 → 양도 요청 플로우 | M |
| 결제 페이지 (`BuyerPaymentPage`) | C |
| 거래 수락 페이지 (`DealAcceptPage`) | M |
| 마이페이지 (프로필, 활동 이력) | S |
| 관리자 대시보드 (회원·티켓·신고·FAQ 관리) | M |
| 공지사항 · CS 페이지 | M |
| Demo Mode (mock 데이터, 백엔드 없이 동작) | - |

---

## 비기능 요구사항 (Non-Functional Requirements)

- **NFR-001**: 빌드 산출물이 git에 추가되어 레포지토리 크기가 비정상적으로 커지지 않는다.
- **NFR-002**: 민감 정보(`.env`, 실제 JWT 시크릿, DB 자격증명)가 소스코드에 하드코딩되어 있지 않다.
- **NFR-003**: 각 서비스는 `application.properties` / `application.yml`에서 환경변수로 설정을 주입받는다.

---

## 수용 기준 (Acceptance Criteria)

- **SC-001** (`FR-001~006`): `git ls-files backend/ frontend/` 실행 시 각 서비스의 Java/JavaScript 소스 파일이 추적된다.
- **SC-002** (`FR-007`): `git ls-files backend/` 결과에 `*.class`, `build/`, `.gradle/` 경로가 포함되지 않는다.
- **SC-003** (`FR-007`): `git ls-files frontend/` 결과에 `node_modules/` 경로가 포함되지 않는다.
- **SC-004** (`FR-008`): `docs/features.md` 파일이 존재하며 서비스별 기능 목록이 기술되어 있다.
- **SC-005** (`NFR-002`): `grep -r "secret\|password\|token" backend/ --include="*.properties" --include="*.yml"` 결과에 실제 값이 없고 `${...}` 환경변수 참조만 있다.

---

## 범위 외 (Out of Scope)

- 소스코드 기능 추가 · 버그 수정 (소스코드는 현재 구현 상태 그대로 통합)
- 로컬 빌드 자동화 스크립트 (Docker Compose 이미지 사용이 기본)
- 테스트 코드 실행 검증 (포트폴리오 표시 목적, CI 파이프라인 미포함)

---

## 미결 사항 (Open Questions)

없음.
