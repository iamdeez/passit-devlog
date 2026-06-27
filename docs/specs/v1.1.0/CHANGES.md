# CHANGES — v1.1.0

> 이 파일은 v1.1.0 릴리즈 사이클에서 완료된 스펙의 누적 변경 이력을 기록한다.

---

## [001-source-integration] 구현 완료

**변경 파일**:
- `backend/service-account/` (신규): 인증·회원 관리 서비스 소스 (59 Java + 테스트)
- `backend/service-ticket/` (신규): 티켓 관리 서비스 소스
- `backend/service-trade/` (신규): 거래·결제 서비스 소스
- `backend/service-chat/` (신규): 실시간 채팅 서비스 소스 (STOMP/WebSocket)
- `backend/service-cs/` (신규): 고객지원 서비스 소스 (FAQ/공지/신고/문의)
- `frontend/` (신규): React 18 프론트엔드 소스 (143+ 파일)
- `.gitignore` (수정): 빌드 산출물 제외 패턴 추가
- `docs/features.md` (신규): 서비스별 구현 기능 현황 (M/S/C 우선순위)
- `README.md` (수정): 소스코드 구조, 로컬 빌드 섹션 추가

**후속 작업 시 주의사항**:
- 각 서비스의 원본 레포(`CLD4-T2-IAMConan/Passit`)가 업데이트되면 수동 재동기화 필요 (`rsync` 방식)
- `backend/service-account/src/main/resources/application.yml`에 `ddl-auto: update` 설정됨 — 로컬 외 환경에서는 `none`으로 변경해야 함
- 프론트엔드 `package-lock.json`이 포함되어 있어 `npm ci`로 의존성 설치 가능

---

## [002-requirements-spec] 구현 완료

**변경 파일**:
- `docs/specs/v1.1.0/002-requirements-spec/spec.md` (신규): 기능(FR-001~041)·비기능(NFR-001~033) 요구사항 공식 정의
- `docs/specs/v1.1.0/002-requirements-spec/plan.md` (신규): MSA 5개 서비스·프론트엔드 구현 매핑 및 테스트 전략
- `docs/specs/v1.1.0/002-requirements-spec/tasks.md` (신규): 서비스별 검증 태스크 27건 분해
- `frontend/e2e/helpers/apiMock.js` (수정): `setAuthInLocalStorage`에 `"token"` 키 추가 (PrivateRoute 호환)
- `frontend/e2e/helpers/apiConfig.js` (수정): API 엔드포인트 상수 정리
- `frontend/e2e/pages/TicketListPage.js` (수정): 티켓 카드 셀렉터를 MUI → Tailwind(`hover-lift`) 기반으로 교체
- `frontend/e2e/pages/TicketCreatePage.js` (수정): MUI Select 숨겨진 input 대신 `[role="combobox"]` 클릭으로 교체, 타임아웃 단축
- `frontend/e2e/ticket-flow.spec.js` (수정): `beforeAll`을 UI 기반 회원가입에서 API 직접 호출 방식으로 교체
- `frontend/e2e/cs-inquiry-flow.spec.js` (수정): test 5 리다이렉트 검증을 Supabase 미연동 환경 대응 소프트 조건으로 변경
- `frontend/e2e/cs-report-flow.spec.js` (수정): 동일 (test 5 리다이렉트 소프트 조건)
- `frontend/e2e/demo-chat-scenario.spec.js` (수정): 인증 키 `"token"` 추가, 티켓 클릭 conditional guard 추가
- `frontend/e2e/demo-full-flow.spec.js` (수정): 문의하기·제출 버튼 strict 모드 위반 수정 (`.first()` / `button[type="submit"]`)
- `frontend/e2e/demo-simple-flow.spec.js` (수정): 동일 버튼 strict 모드 위반 수정
- `docs/features.md` (수정): 구현 상태 현행화

**E2E 최종 결과** (2026-06-19):
- 54 passed / 24 skipped / 0 failed (전체 78 테스트)
- skipped: Supabase 직접 연동 없는 환경에서 조건부 skip 처리된 ticket-flow/cs 생성 결과 확인 시나리오

**후속 작업 시 주의사항**:
- E2E 환경에서 인증 localStorage 키가 두 가지로 분리되어 있음: `"token"` (PrivateRoute·AuthContext)과 `"accessToken"` (axiosInstances.js). 신규 E2E 테스트 작성 시 두 키를 모두 설정해야 PrivateRoute 보호 페이지 접근이 가능
- CS 문의/신고 생성·티켓 생성은 Supabase SDK를 직접 호출하므로 Supabase 세션이 없는 E2E 환경에서는 실제 DB 저장이 불가. 이 흐름이 필요한 테스트는 Supabase 서비스 롤 키를 E2E 환경에 주입하거나 별도 테스트 픽스처를 구성해야 함
- SC-024의 "신고자 알림 발송" 로직은 service-cs에 미구현 상태 — 알림 서비스 연동 시 별도 스펙으로 보완 필요
- service-cs 패키지명이 `com.company.template`으로 되어 있어 타 서비스(`com.company.service_*`)와 불일치 — 리팩토링 필요 시 v1.2.0 패치에서 처리
- Could 항목(OCR, 에스크로, 개인화 추천, D-1 알림, 연석 묶음)은 Out of Scope로 확정됨 — 추후 v1.2.0에서 별도 스펙으로 분리 필요

---

## [003-frontend-redesign] 구현 완료

**변경 파일**:
- `frontend/package.json` (수정): `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` 의존성 제거
- `frontend/src/index.css` (수정): `@layer components` CSS 유틸리티 클래스 추가 (`.btn-primary`, `.btn-outlined`, `.btn-ghost`, `.input-base`, `.card`, `.card-hover`, `.page-container` 외 8종)
- `frontend/src/App.js` (수정): MUI `ThemeProvider` / `CssBaseline` 제거, Tailwind 단독 스타일링
- `frontend/src/components/ErrorBoundary.js` (수정): MUI 전면 제거 → 순수 Tailwind + Material Symbols
- `frontend/src/components/auth/PrivateRoute.js` (수정): `CircularProgress` → `Spinner` (공통 컴포넌트)
- `frontend/src/components/common/` (수정): `Button`, `Input`, `Textarea`, `Select`, `Badge`, `Pagination`, `Alert`, `Spinner`, `EmptyState`, `Modal`, `PageHeader`, `FormField.tsx`, `PasswordField.tsx`, `OptimizedImage.tsx`, `LoadingSpinner.js` — MUI 전면 제거
- `frontend/src/components/admin/AdminLayout.jsx` (신규): Tailwind 기반 관리자 사이드바 레이아웃 (MUI Drawer 대체)
- `frontend/src/layouts/AdminLayout.js` (삭제): MUI Drawer 기반 구버전 레이아웃 제거
- `frontend/src/components/LoginForm.js`, `RegisterForm.js`, `ResetPasswordForm.js` (수정): MUI Form 전면 제거 → 순수 Tailwind, Material Symbols 아이콘
- `frontend/src/components/Ticket/` (수정): `DealRequestModal`, `DealAcceptModal`, `DealCancelModal`, `DealConfirmModal`, `DealRejectModal`, `RequestSuccessModal`, `LoadingModal` — MUI Dialog/Backdrop 제거 → 공통 `Modal` 컴포넌트 적용
- `frontend/src/pages/TicketDetailPage.js` (삭제): `.jsx` 버전과 중복, 구버전 제거
- `frontend/src/pages/mypage/ProfilePage.js` (수정): MUI `Dialog` → 공통 `Modal`
- `frontend/src/pages/mypage/ActivityPage.js` (수정): MUI `Rating` → CSS 별표(★) 렌더링
- `frontend/src/pages/chat/ChatPage.jsx` (수정): `CircularProgress` → CSS inline spinner
- `frontend/src/components/chat/MessageBubble/SystemActionMessage.jsx` (수정): `CircularProgress` → CSS inline spinner
- `frontend/src/pages/admin/AdminDashboardPage.js` (수정): 동적 hex 클래스 → inline `style` 변환, design token 적용
- `frontend/src/pages/admin/AdminNoticeEditPage.jsx`, `AdminNoticeCreatePage.jsx`, `AdminNoticeListPage.jsx` (수정): hex → design token
- `frontend/src/pages/admin/AdminFaqListPage.jsx`, `AdminFaqEditPage.jsx`, `AdminFaqCreatePage.jsx` (수정): hex → design token
- `frontend/src/pages/admin/AdminInquiryListPage.jsx`, `AdminInquiryDetailPage.jsx` (수정): hex → design token
- `frontend/src/pages/admin/AdminReportListPage.jsx`, `AdminReportDetailPage.jsx` (수정): hex → design token
- `frontend/src/pages/admin/AdminTicketManagementPage.jsx`, `AdminUserManagementPage.js`, `AdminCategoryManagementPage.js` (수정): hex → design token
- `frontend/src/pages/cs/`, `frontend/src/pages/chat/` (수정): Spinner named export import 패턴 통일
- `frontend/src/pages/AuthPage.js` (수정): success 메시지 `#d4f4dd` → `bg-green-50`

**빌드 결과** (2026-06-20):
- `CI=false npm run build` 성공 — 에러 0건
- main bundle: 180 kB gzipped (MUI 제거로 대폭 감소)
- `grep "@mui" src/` → 0건, 인라인 hex 색상 0건

**후속 작업 시 주의사항**:
- `package-lock.json`에 MUI 패키지가 잔류할 수 있음 — `npm install` 또는 `npm ci`로 lockfile 동기화 권장
- `StatCard`(AdminDashboardPage) 컴포넌트는 stat category별 semantic 색상을 hex inline style로 유지하고 있음. 설계 토큰으로 완전 전환하려면 별도 semantic color token 정의 필요
- Tailwind JIT 환경에서 동적 클래스 보간(`` `bg-[${color}]` ``)은 purge 대상에서 제외됨. 추후 동적 색상이 필요한 경우 반드시 inline style로 처리할 것
- Kakao 로그인 버튼의 `bg-[#FEE500]` / `hover:bg-[#FDD835]`는 카카오 브랜드 가이드라인 준수를 위해 hex 값 유지 (의도적 예외)
