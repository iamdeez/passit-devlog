# Project Context

> 이 문서는 프로젝트의 **현재 상태를 묘사**하는 살아있는 참조 문서다.
> 새로운 spec 설계 전 반드시 읽어 프로젝트 구조·흐름·용어를 숙지한다.
>
> - **갱신 시점**: spec 구현·검증 완료 후, `CHANGES.md` 작성과 같은 시점에 갱신한다.
> - **작성 원칙**: 현재 코드베이스의 사실만 기록한다. 미래 계획이나 설계 의도는 spec.md에 작성한다.
> - **기준 커밋**: 이 문서의 내용은 **§7 갱신 이력의 마지막 commit 기준**이다.

---

## 1. 프로젝트 개요

- **프로젝트명**: PassIt (패스잇)
- **목적**: 공연·스포츠 티켓 P2P 양도 플랫폼 — 판매자·구매자 간 안전한 티켓 거래 지원
- **현재 버전**: v1.1.0 (개발 중)
- **주요 기술 스택**:
  - Frontend: React 18 (JSX/TSX), React Router v7, Tailwind CSS v3, Material You 색상 시스템
  - Backend: Spring Boot MSA (5개 서비스), STOMP/WebSocket 채팅
  - DB/Auth: Supabase (PostgreSQL + Auth)
  - 아이콘: Material Symbols Outlined (HTML `<span>` 방식)
  - 폰트: Inter (본문), Plus Jakarta Sans (헤드라인/디스플레이)

---

## 2. 프로젝트 구조

### 디렉토리 레이아웃

```
passit-devlog/
├── frontend/                  ← React 18 프론트엔드
│   ├── src/
│   │   ├── components/        ← 재사용 컴포넌트
│   │   │   ├── common/        ← 공통 UI 컴포넌트 (Button, Modal, Spinner 등)
│   │   │   ├── admin/         ← 관리자 레이아웃 (AdminLayout.jsx)
│   │   │   ├── Ticket/        ← 티켓 거래 모달 컴포넌트
│   │   │   ├── chat/          ← 채팅 UI 컴포넌트
│   │   │   ├── auth/          ← PrivateRoute 등 인증 관련
│   │   │   ├── LoginForm.js   ← 로그인 폼 (AuthPage에서 사용)
│   │   │   ├── RegisterForm.js
│   │   │   └── ResetPasswordForm.js
│   │   ├── pages/             ← 라우트별 페이지 컴포넌트 (44개)
│   │   │   ├── admin/         ← 관리자 페이지 (15개)
│   │   │   ├── chat/          ← 채팅 페이지
│   │   │   ├── cs/            ← 고객지원 페이지
│   │   │   ├── mypage/        ← 마이페이지
│   │   │   └── trade/         ← 거래 페이지
│   │   ├── contexts/          ← AuthContext, LoadingContext
│   │   ├── services/          ← API 서비스 레이어
│   │   ├── api/               ← API 엔드포인트 모듈
│   │   ├── config/            ← supabaseClient 등 외부 연결 설정
│   │   ├── index.css          ← Tailwind @layer components/utilities 정의
│   │   ├── App.js             ← 라우팅 루트 (ThemeProvider 없음, Tailwind 단독)
│   │   └── tailwind.config.js ← Material You 색상 토큰 정의
├── backend/                   ← Spring Boot MSA 백엔드
│   ├── service-account/       ← 인증·회원 관리
│   ├── service-ticket/        ← 티켓 CRUD·검색
│   ├── service-trade/         ← 거래·결제 흐름
│   ├── service-chat/          ← STOMP 채팅
│   └── service-cs/            ← 고객지원 (FAQ/공지/신고/문의)
└── docs/specs/                ← 스펙 산출물
    ├── v1.0.0/                ← 초기 설계 문서
    └── v1.1.0/                ← 현재 개발 사이클 스펙
        ├── CHANGES.md
        ├── 001-source-integration/
        ├── 002-requirements-spec/
        └── 003-frontend-redesign/
```

### Tailwind CSS 클래스 레이어 (`src/index.css`)

| 클래스 | 용도 |
|---|---|
| `.btn-primary` | 기본 주요 버튼 (파란색 배경) |
| `.btn-outlined` | 외곽선 버튼 |
| `.btn-ghost` | 투명 배경 버튼 |
| `.btn-sm` / `.btn-lg` | 크기 변형 |
| `.input-base` | 기본 입력 필드 스타일 |
| `.card` / `.card-hover` | 카드 컨테이너 |
| `.badge` | 인라인 배지 |
| `.page-container` | 페이지 래퍼 (pt-16 포함) |
| `.page-inner` | 콘텐츠 최대폭 컨테이너 |
| `.page-title` / `.section-title` | 페이지/섹션 제목 텍스트 |
| `.hover-lift` | 카드 호버 올라오는 효과 (utilities) |

---

## 3. 핵심 모듈 목록

### Frontend 공통 컴포넌트 (`src/components/common/`)

| 컴포넌트 | 파일 | 역할 |
|---|---|---|
| `Button` | `Button.jsx` | variant (filled/outlined/ghost) × size (sm/md/lg) |
| `Input` / `Textarea` / `Select` | `Input.jsx` | 통합 입력 컴포넌트 |
| `Badge` / `StatusBadge` | `Badge.jsx` | 카테고리·상태 배지 |
| `Pagination` | `Pagination.jsx` | 페이지네이션 |
| `Alert` | `Alert.jsx` | 알림 메시지 |
| `Spinner` | `Spinner.jsx` | **named export** — `import { Spinner } from "../common"` |
| `EmptyState` | `EmptyState.jsx` | 빈 목록 안내 |
| `Modal` | `Modal.jsx` | Dialog 대체 모달 (isOpen, onClose, title props) |
| `PageHeader` | `PageHeader.jsx` | 페이지 헤더 (뒤로가기 + 제목) |
| `FormField` | `FormField.tsx` | 레이블 + 입력 + 에러 메시지 통합 |
| `PasswordField` | `PasswordField.tsx` | 비밀번호 입력 + 강도 표시 |
| `OptimizedImage` | `OptimizedImage.tsx` | 이미지 로딩 스켈레톤 |
| `LoadingSpinner` | `LoadingSpinner.js` | 전체 화면 로딩 스피너 |

> **주의**: `Spinner`는 named export다. `import Spinner from "…"` (default) 방식은 오류 발생.
> 반드시 `import { Spinner } from "../../components/common"` 패턴 사용.

### 관리자 레이아웃

- **`AdminLayout.jsx`** (`src/components/admin/AdminLayout.jsx`): Tailwind 기반 사이드바 레이아웃. `<AdminLayout>` 컴포넌트로 모든 관리자 페이지를 감싼다.
- 이전 MUI Drawer 기반 `layouts/AdminLayout.js`는 삭제됨.

### 아이콘 사용 패턴

MUI `@mui/icons-material` 없음. 모든 아이콘은 **Material Symbols Outlined** HTML 방식 사용:
```jsx
<span className="material-symbols-outlined">icon_name</span>
// filled 스타일: style={{ fontVariationSettings: "'FILL' 1" }}
```

### CSS 스피너 패턴 (CircularProgress 대체)

```jsx
// 인라인 스피너
<div className="w-6 h-6 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />

// 공통 Spinner 컴포넌트
import { Spinner } from "../../components/common";
<Spinner size="lg" />
```

---

## 4. 이벤트 및 데이터 흐름

### 인증 흐름

```
AuthPage → LoginForm / RegisterForm / ResetPasswordForm
     ↓
AuthContext (useAuth 훅)
     ↓
authService → Supabase Auth API
     ↓
PrivateRoute — localStorage "token" 키 확인 (PrivateRoute/AuthContext)
              + localStorage "accessToken" 키 (axiosInstances.js)
```

> **주의**: E2E 테스트에서 인증 localStorage 키가 두 가지. 신규 테스트 작성 시 두 키 모두 설정 필요.

### 티켓 거래 흐름

```
TicketListPage → TicketDetailPage(.jsx)
     ↓
DealRequestModal (구매 요청)
     ↓
ChatRoomPage (채팅 + 거래 확인)
     ↓
DealAcceptModal / DealCancelModal / DealRejectModal
     ↓
BuyerPaymentPage → PaymentResultPage
```

### 채팅 흐름

```
ChatListPage → ChatRoomPage
     ↓
STOMP WebSocket (SockJS)
     ↓
service-chat (Spring Boot)
     ↓
SystemActionMessage (거래 관련 시스템 메시지)
```

---

## 5. 도메인 모델

### 핵심 엔티티

| 엔티티 | 설명 | 주요 속성 |
|---|---|---|
| `Ticket` | 양도 대상 티켓 | `ticketId`, `eventName`, `eventDate`, `seatInfo`, `sellingPrice`, `ticket_status` |
| `Trade` (Deal) | 거래 요청 | `dealId`, `ticketId`, `buyerId`, `sellerId`, `status`, `quantity` |
| `ChatRoom` | 거래 채팅방 | `roomId`, `ticketId`, `buyerId`, `sellerId` |
| `Profile` | 사용자 프로필 | `id`, `nickname`, `email`, `role` |
| `Inquiry` | 고객 문의 | `id`, `title`, `content`, `status`, `user_id` |
| `Report` | 신고 | `id`, `target_type`, `reason`, `status` |

### 티켓 상태

| 상태 | 의미 |
|---|---|
| `AVAILABLE` | 판매중 |
| `RESERVED` | 예약중 (거래 진행 중) |
| `SOLD` | 판매완료 |
| `CLOSED` | 마감 |

### 거래(Deal) 상태

| 상태 | 의미 |
|---|---|
| `REQUESTED` | 구매 요청됨 |
| `ACCEPTED` | 판매자 수락 |
| `REJECTED` | 판매자 거절 |
| `CANCELLED` | 취소됨 |
| `COMPLETED` | 거래 완료 |

---

## 6. 도메인 용어 사전

| 용어 | 정의 | 사용 금지 동의어 |
|---|---|---|
| 티켓 | 양도 대상 공연/스포츠 티켓 | 상품, 아이템 |
| 양도 | P2P 티켓 거래 | 판매, 거래 (단독 사용 시) |
| 거래(Deal) | 특정 티켓의 양도 요청·진행 단위 | 오더, 주문 |
| 구매자(Buyer) | 양도 받는 사람 | 수신자 |
| 판매자(Seller) | 티켓을 양도하는 사람 | 발신자 |
| 채팅방(ChatRoom) | 특정 거래 건의 1:1 대화 공간 | 메신저, 채널 |
| 좌석정보(seatInfo) | 구역·열·번호 등 자리 정보 | 시트, 위치 |
| 관리자(Admin) | `role=admin`인 사용자 | 운영자 |

---

## 7. 알려진 제약 및 기술 부채

| 항목 | 내용 | 영향 범위 | 관련 spec |
|---|---|---|---|
| package-lock.json MUI 잔류 | `package.json`에서 MUI 제거했으나 lockfile에 남아 있을 수 있음. `npm install` 또는 `npm ci`로 lockfile 동기화 권장 | `frontend/node_modules` | 003-frontend-redesign |
| StatCard 동적 색상 | `AdminDashboardPage`의 `StatCard`는 stat category별 semantic 색상을 hex inline style(`#6366f1`, `#0ea5e9` 등)로 유지. Tailwind JIT 동적 클래스를 우회하기 위해 inline style 사용 | `AdminDashboardPage.js` | 003-frontend-redesign |
| E2E 인증 키 이중화 | localStorage 인증 키 `"token"` (PrivateRoute/AuthContext)과 `"accessToken"` (axiosInstances.js) 두 가지 공존. E2E 테스트 작성 시 두 키 모두 설정 필요 | E2E 테스트, PrivateRoute | 002-requirements-spec |
| Supabase SDK CS/티켓 생성 | 고객지원·티켓 생성이 Supabase SDK 직접 호출이므로 서비스 롤 키 없는 E2E 환경에서 실제 DB 저장 불가 | CS/티켓 E2E 테스트 | 002-requirements-spec |

---

## 8. 갱신 이력

> **활용법**: `git diff <commit> -- frontend/src/` 로 해당 시점 이후 변경된 프론트엔드 코드를 확인할 수 있다.

| 날짜 | commit | 갱신 내용 | 관련 spec |
|---|---|---|---|
| 2026-06-20 | `5e9de04` | 최초 작성. 003-frontend-redesign 완료 시점 현재 상태 반영 (MUI 제거, Tailwind 전환 완료) | 003-frontend-redesign |
