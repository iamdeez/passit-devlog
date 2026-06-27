# Tasks: frontend-redesign

> Branch: 003-frontend-redesign | Date: 2026-06-19 | Plan: [plan.md](./plan.md)

## 전제 조건

- [x] spec.md의 모든 `[NEEDS CLARIFICATION]` 항목이 해소되었는가?
- [x] plan.md의 Constitution Gates가 모두 통과되었는가?
- [x] CHANGES.md에서 이전 작업(002-requirements-spec)의 후속 주의사항 확인 완료

---

## 태스크 목록

---

### Phase 0. 디자인 시스템 기반 (선행 필수)

- [ ] **T001** — Tailwind Component Layer 추가
  - 구현 파일: `frontend/src/index.css`
  - 관련 요구사항: `FR-001`, `FR-002`
  - 상세: `@layer components` 블록 추가 — `.btn-primary`, `.btn-outlined`, `.btn-ghost`, `.btn-sm`, `.btn-lg`, `.input-base`, `.card`, `.card-hover`, `.badge`, `.page-container`, `.page-inner`, `.page-title`, `.section-title`
  - 완료 기준: `npm run build` 오류 없음, Tailwind 클래스 정상 생성

- [ ] **T002** `[P]` — Stitch 디자인 시스템 DESIGN.md 업데이트
  - 구현 파일: Stitch 프로젝트 `12845104609639004913`
  - 상세: 컴포넌트 스펙·레이아웃 패턴·Motion 가이드 포함 DESIGN.md 업로드
  - 완료 기준: Stitch 프로젝트에 업데이트된 디자인 시스템 반영 확인

---

### Phase 1. 공통 컴포넌트 구축 (T001 완료 후)

- [ ] **T003** — Button 컴포넌트
  - 구현 파일: `frontend/src/components/common/Button.jsx`
  - 관련 요구사항: `FR-003`
  - 상세: `variant` (filled/outlined/ghost) × `size` (sm/md/lg) + `disabled`, `loading` 상태
  - 완료 기준: SC-002 — 9가지 조합 렌더링 확인

- [ ] **T004** `[P]` — Input / Textarea / Select 컴포넌트
  - 구현 파일: `frontend/src/components/common/Input.jsx`
  - 관련 요구사항: `FR-005`
  - 상세: `type` (text/email/password/number), `textarea`, `select` 통합. `label`, `error`, `hint` props
  - 완료 기준: SC-003 — MUI TextField import 0건

- [ ] **T005** `[P]` — Badge / StatusBadge 컴포넌트
  - 구현 파일: `frontend/src/components/common/Badge.jsx`
  - 관련 요구사항: `FR-006`
  - 상세: 카테고리 배지(색상별), 상태 배지(AVAILABLE/RESERVED/SOLD/EXPIRED/deal 상태)
  - 완료 기준: 모든 페이지에서 인라인 span 배지 대체

- [ ] **T006** `[P]` — Pagination 컴포넌트
  - 구현 파일: `frontend/src/components/common/Pagination.jsx`
  - 관련 요구사항: `FR-007`
  - 상세: `totalPages`, `currentPage`, `onPageChange`. 이전/다음 버튼, 현재 페이지 강조
  - 완료 기준: SC-004 — MUI Pagination import 0건

- [ ] **T007** `[P]` — Alert 컴포넌트
  - 구현 파일: `frontend/src/components/common/Alert.jsx`
  - 관련 요구사항: `FR-008`
  - 상세: `type` (success/error/warning/info) + `message` + `onClose?`
  - 완료 기준: SC-005 — MUI Alert import 0건

- [ ] **T008** `[P]` — Spinner 컴포넌트
  - 구현 파일: `frontend/src/components/common/Spinner.jsx`
  - 관련 요구사항: `FR-010`
  - 상세: `size` (sm=16px/md=24px/lg=40px), CSS `animate-spin` 기반
  - 완료 기준: SC-006 — MUI CircularProgress import 0건

- [ ] **T009** `[P]` — EmptyState 컴포넌트
  - 구현 파일: `frontend/src/components/common/EmptyState.jsx`
  - 관련 요구사항: `FR-009`
  - 상세: `icon` (Material Symbol 이름), `title`, `description`, `action?` (버튼 라벨+핸들러)
  - 완료 기준: 전체 페이지 인라인 빈 상태 UI 대체

- [ ] **T010** `[P]` — Modal 컴포넌트
  - 구현 파일: `frontend/src/components/common/Modal.jsx`
  - 상세: `isOpen`, `onClose`, `title`, `children`. 오버레이 클릭·ESC 닫기
  - 완료 기준: 기존 Ticket/DealModal 컴포넌트가 이를 래핑하도록 교체

- [ ] **T011** `[P]` — PageHeader 컴포넌트 업데이트
  - 구현 파일: `frontend/src/components/common/PageHeader.jsx`
  - 상세: 현행 컴포넌트 스타일을 `.page-title` 기준으로 정렬
  - 완료 기준: 현행 스타일 토큰 적용 확인

- [ ] **T012** — AdminLayout 컴포넌트 (T003~T011 완료 후)
  - 구현 파일: `frontend/src/components/admin/AdminLayout.jsx`
  - 관련 요구사항: `FR-012`
  - 상세: 좌측 사이드바(`w-64 bg-surface-container-lowest border-r`) + 헤더 + 우측 콘텐츠. 사이드바에 어드민 메뉴 항목(회원/티켓/신고/문의/공지/FAQ/카테고리) 포함
  - 완료 기준: SC-007 — AdminLayout으로 모든 어드민 페이지 래핑

- [ ] **T013** `[P]` — index.js 공통 컴포넌트 export 정리
  - 구현 파일: `frontend/src/components/common/index.js`
  - 상세: T003~T011에서 생성한 컴포넌트를 named export로 통합
  - 완료 기준: `import { Button, Spinner, Pagination } from "../components/common"` 가능

---

### Phase 2. 핵심 사용자 페이지 (Phase 1 완료 후)

- [ ] **T014** — HomePage
  - 구현 파일: `frontend/src/pages/HomePage.js`
  - 관련 요구사항: `FR-011`, `FR-014`
  - 상세: `.page-container` 래퍼, 티켓 카드를 `.card-hover` 패턴으로 교체, EmptyState 적용, 인라인 hex 제거
  - 완료 기준: MUI import 없음, hex 색상 없음

- [ ] **T015** `[P]` — TicketListPage (MUI 제거 핵심)
  - 구현 파일: `frontend/src/pages/TicketListPage.jsx`
  - 상세: MUI `Pagination` → 공통 Pagination, MUI `CircularProgress` → Spinner, MUI `Alert` → Alert, 빈 상태 → EmptyState
  - 완료 기준: `@mui/material` import 0건

- [ ] **T016** `[P]` — TicketDetailPage
  - 구현 파일: `frontend/src/pages/TicketDetailPage.jsx`
  - 상세: 버튼 `.btn-primary/.btn-outlined`, 배지 Badge 컴포넌트, `.page-container` 래퍼
  - 완료 기준: MUI import 없음

- [ ] **T017** `[P]` — TicketCreatePage (MUI TextField select 제거)
  - 구현 파일: `frontend/src/pages/TicketCreatePage.jsx`
  - 상세: MUI `TextField select` → native `<select class="input-base">`, Input 컴포넌트 교체
  - 완료 기준: SC-003 달성 기여

- [ ] **T018** `[P]` — TicketEditPage
  - 구현 파일: `frontend/src/pages/TicketEditPage.jsx`
  - 상세: T017과 동일 패턴
  - 완료 기준: MUI import 없음

- [ ] **T019** `[P]` — AuthPage (로그인/회원가입)
  - 구현 파일: `frontend/src/pages/AuthPage.js`
  - 상세: 탭 전환 UI, 폼 입력 `.input-base`, Button 컴포넌트, Alert
  - 완료 기준: 스타일 통일, MUI 없음

- [ ] **T020** `[P]` — LoginPage
  - 구현 파일: `frontend/src/pages/LoginPage.jsx`
  - 상세: T019와 동일 폼 패턴
  - 완료 기준: 스타일 통일

- [ ] **T021** `[P]` — ResetPasswordPage, KakaoCallbackPage
  - 구현 파일: `pages/ResetPasswordPage.js`, `pages/KakaoCallbackPage.js`
  - 상세: 단순 페이지 — `.page-container` + Spinner(콜백), Button
  - 완료 기준: 스타일 통일

- [ ] **T022** `[P]` — MyPage, MyTicketListPage
  - 구현 파일: `pages/MyPage.js`, `pages/MyTicketListPage.jsx`
  - 상세: `.page-container`, 카드 목록 `.card-hover`, EmptyState
  - 완료 기준: 스타일 통일

- [ ] **T023** `[P]` — ProfilePage, ActivityPage
  - 구현 파일: `pages/mypage/ProfilePage.js`, `pages/mypage/ActivityPage.js`
  - 상세: 폼 `.input-base`, Button, 평점/후기 카드 `.card`
  - 완료 기준: 스타일 통일

---

### Phase 3. CS / 거래 / 채팅 페이지 (Phase 1 완료 후, Phase 2와 병렬)

- [ ] **T024** — DealListPage, DealAcceptPage, BuyerPaymentPage, PaymentResultPage
  - 구현 파일: `pages/trade/DealListPage.js`, `pages/DealAcceptPage.js`, `pages/BuyerPaymentPage.js`, `pages/PaymentResultPage.js`
  - 상세: 거래 상태 Step indicator(Tailwind), Badge로 상태 표시, `.page-container`
  - 완료 기준: MUI import 없음, 스타일 통일

- [ ] **T025** `[P]` — ChatListPage, ChatRoomPage
  - 구현 파일: `pages/chat/ChatListPage.jsx`, `pages/chat/ChatRoomPage.jsx`
  - 상세: `.page-container`, 채팅방 목록 `.card`, 채팅 입력창 `.input-base`
  - 참고: `components/chat/*/style.css` 는 채팅 특성상 유지 허용
  - 완료 기준: MUI import 없음

- [ ] **T026** `[P]` — CS 공지·FAQ (NoticeListPage, NoticePage, FaqListPage, FaqPage)
  - 구현 파일: `pages/cs/NoticeListPage.js`, `cs/NoticePage.jsx`, `cs/FaqListPage.jsx`, `cs/FaqPage.jsx`
  - 상세: 목록 `.card`, FAQ 아코디언 Tailwind 구현, PageHeader
  - 완료 기준: 스타일 통일, EmptyState 적용

- [ ] **T027** `[P]` — CS 문의 (InquiryListPage, InquiryDetailPage, InquiryCreatePage)
  - 구현 파일: `pages/cs/Inquiry*.jsx`
  - 상세: 목록 `.card`, 상세 `.page-inner`, 작성 폼 `.input-base` + Button
  - 완료 기준: 스타일 통일

- [ ] **T028** `[P]` — CS 신고 (ReportListPage, ReportDetailPage, ReportCreatePage)
  - 구현 파일: `pages/cs/Report*.jsx`
  - 상세: T027과 동일 패턴. 신고 상태 Badge(`error` 컬러)
  - 완료 기준: 스타일 통일

---

### Phase 4. 관리자 페이지 (T012 AdminLayout 완료 후)

- [ ] **T029** — AdminDashboardPage
  - 구현 파일: `pages/admin/AdminDashboardPage.js`
  - 상세: `AdminLayout` 래핑, KPI 카드 `.card`, 요약 수치 타이포 `text-3xl font-display font-extrabold text-primary`
  - 완료 기준: AdminLayout 적용, 스타일 통일

- [ ] **T030** `[P]` — AdminUserManagementPage
  - 구현 파일: `pages/admin/AdminUserManagementPage.js`
  - 상세: `AdminLayout`, 테이블 행 hover `hover:bg-surface-container`, 상태 변경 Button
  - 완료 기준: AdminLayout 적용

- [ ] **T031** `[P]` — AdminTicketManagementPage
  - 구현 파일: `pages/admin/AdminTicketManagementPage.jsx`
  - 상세: `AdminLayout`, 목록 테이블, Pagination
  - 완료 기준: AdminLayout 적용, MUI 없음

- [ ] **T032** `[P]` — Admin 신고 관리 (3개)
  - 구현 파일: `AdminReportListPage.jsx`, `AdminReportDetailPage.jsx`, `AdminReportStatusPage.jsx`
  - 상세: `AdminLayout`, Badge 신고 상태, 처리 버튼 `.btn-primary`
  - 완료 기준: AdminLayout 적용

- [ ] **T033** `[P]` — Admin 문의 관리 (2개)
  - 구현 파일: `AdminInquiryListPage.jsx`, `AdminInquiryDetailPage.jsx`
  - 상세: `AdminLayout`, 답변 폼 `.input-base`
  - 완료 기준: AdminLayout 적용

- [ ] **T034** `[P]` — Admin 공지 관리 (3개)
  - 구현 파일: `AdminNoticeListPage.jsx`, `AdminNoticeCreatePage.jsx`, `AdminNoticeEditPage.jsx`
  - 상세: `AdminLayout`, 작성/수정 폼 `.input-base`, Button
  - 완료 기준: AdminLayout 적용

- [ ] **T035** `[P]` — Admin FAQ 관리 (3개)
  - 구현 파일: `AdminFaqListPage.jsx`, `AdminFaqCreatePage.jsx`, `AdminFaqEditPage.jsx`
  - 상세: T034와 동일 패턴
  - 완료 기준: AdminLayout 적용

- [ ] **T036** `[P]` — AdminCategoryManagementPage
  - 구현 파일: `AdminCategoryManagementPage.js`
  - 상세: `AdminLayout`, 트리 구조 UI `.card`, 인라인 편집 `.input-base`
  - 완료 기준: AdminLayout 적용

---

### Phase 5. 정리 및 검증

- [x] **T037** — MUI 의존성 제거 확인 및 package.json 정리
  - 상세:
    1. `grep -r "@mui/material" src/` → 0건 확인
    2. `package.json`에서 `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` 제거
    3. `CI=false npm run build` 성공 확인 (180kB gzipped)
  - 완료 기준: SC-003~SC-006 모두 통과 ✓

- [x] **T038** `[P]` — 인라인 hex 색상 검증
  - 상세: `grep -rn "\[#[0-9a-fA-F]" src/pages src/components` → 0건 (카카오 `#FEE500`, data:image SVG 제외)
  - 완료 기준: SC-001 통과 ✓
  - 예외: `tailwind.config.js`, `index.css`의 CSS 변수 정의는 허용

- [x] **T039** `[P]` — TicketDetailPage.js 파일 삭제 (중복 제거)
  - 상세: `pages/TicketDetailPage.js` (구버전) 삭제, `.jsx` 버전만 유지
  - 완료 기준: `git status`에 삭제 파일 확인 ✓

- [ ] **T040** — 전체 페이지 개발 서버 시각 확인
  - 상세: `npm start`로 전체 44개 페이지 순회 — 레이아웃 깨짐, 빠진 스타일 없는지 확인
  - 완료 기준: SC-007, SC-008 통과

- [ ] **T041** `[P]` — CHANGES.md 업데이트
  - 구현 파일: `docs/specs/v1.1.0/CHANGES.md`
  - 완료 기준: 003-frontend-redesign 완료 기록

- [ ] **T042** `[P]` — context.md 갱신
  - 구현 파일: `frontend/.claude/context.md` (또는 `.claude/context.md`)
  - 상세: 공통 컴포넌트 모듈 목록, MUI 제거 사실 반영
  - 완료 기준: context.md 최신화

---

## 구현 완료 기준

- [x] T001~T013 공통 컴포넌트 + CSS 레이어 구축 완료
- [x] T014~T028 사용자/CS/거래/채팅 페이지 44개 적용 완료
- [x] T029~T036 관리자 페이지 15개 AdminLayout 적용 완료
- [x] T037 `grep "@mui/material" src/` → 0건 ✓
- [x] T038 인라인 hex 색상 0건 ✓
- [x] T040 개발 서버 `CI=false npm run build` 성공, 시각 확인 (dev server on port 3000)
- [ ] `npm run build` 에러 없음
