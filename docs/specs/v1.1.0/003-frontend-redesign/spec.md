# Spec: frontend-redesign

> Branch: 003-frontend-redesign | Date: 2026-06-19 | Version: v1.1.0

## 배경 및 목적

Passit 프론트엔드는 Material You(Tailwind) 기반 디자인 시스템을 사용하고 있으나,
MUI 컴포넌트(Pagination, Alert, CircularProgress, TextField select 등)가 혼재되어
페이지마다 버튼·카드·폼·상태 표시 방식이 불일치한다.

**해결할 문제:**
- 버튼 스타일이 페이지마다 다름 (MUI Button vs Tailwind px-5 버튼)
- 카드 radius/shadow가 통일되지 않음
- 폼 입력 필드가 페이지에 따라 MUI TextField 또는 Tailwind input
- 로딩/에러/빈 상태 UI가 페이지마다 다른 컴포넌트
- 관리자 페이지 레이아웃이 일반 페이지와 완전히 분리된 스타일

**목표:** 전체 44개 페이지를 단일 Tailwind 토큰 기반 디자인 시스템으로 통일.

---

## 사용자 스토리

- **US-001**: 사용자로서, 모든 페이지에서 동일한 버튼·카드·폼 스타일을 보고 싶다.
- **US-002**: 사용자로서, 어느 페이지에서든 일관된 로딩·에러·빈 상태를 경험하고 싶다.
- **US-003**: 관리자로서, 어드민 페이지에서도 일반 페이지와 동일한 디자인 언어를 경험하고 싶다.
- **US-004**: 개발자로서, 공통 컴포넌트를 재사용하여 유지보수 비용을 낮추고 싶다.

---

## 기능 요구사항

### 디자인 토큰 통일
- **FR-001**: 모든 색상 사용은 Tailwind 토큰(`text-primary`, `bg-surface-container` 등)으로만 한다. 인라인 hex 값 금지.
- **FR-002**: 폰트는 헤드라인 `font-display`(Plus Jakarta Sans), 본문 `font-sans`(Inter) 두 가지만 사용한다.

### 공통 컴포넌트
- **FR-003**: Button 컴포넌트 3가지 variant(filled/outlined/ghost) + 3가지 size(sm/md/lg)를 구현한다.
- **FR-004**: Card 컴포넌트의 `rounded-2xl border border-outline-variant/30 shadow-sm` 패턴을 표준으로 정의한다.
- **FR-005**: Input/Textarea/Select 공통 스타일을 정의하고 MUI TextField를 대체한다.
- **FR-006**: Badge/Chip 컴포넌트로 카테고리·상태 표시를 통일한다.
- **FR-007**: Pagination 컴포넌트를 MUI에서 Tailwind 기반으로 교체한다.
- **FR-008**: Alert/Toast 컴포넌트를 MUI에서 Tailwind 기반으로 교체한다.
- **FR-009**: EmptyState 컴포넌트를 공통화한다 (아이콘 + 제목 + 설명 + 선택적 CTA 버튼).
- **FR-010**: Spinner(로딩) 컴포넌트를 MUI CircularProgress에서 Tailwind 기반으로 교체한다.

### 페이지 레이아웃 통일
- **FR-011**: 모든 일반 페이지는 `max-w-[1280px] mx-auto px-6 py-10` 컨테이너를 사용한다.
- **FR-012**: 관리자 페이지는 `AdminLayout` 컴포넌트(사이드바 + 콘텐츠 영역)를 사용한다.
- **FR-013**: NavBar 스타일을 현행 유지하되, 드롭다운·모바일 메뉴의 불일치를 정리한다.

### 페이지별 적용
- **FR-014**: 핵심 사용자 페이지(홈·티켓·인증·마이페이지·채팅·거래) 11개에 적용한다.
- **FR-015**: CS 페이지(공지·FAQ·문의·신고) 10개에 적용한다.
- **FR-016**: 관리자 페이지 15개에 적용한다.

---

## 비기능 요구사항

- **NFR-001**: MUI import(`@mui/material`)가 제거된 페이지는 번들 크기 감소가 확인되어야 한다.
- **NFR-002**: 기존 기능(라우팅, API 호출, 상태 관리)은 변경하지 않는다.
- **NFR-003**: 반응형(모바일 375px ~ 데스크톱 1280px+)이 유지되어야 한다.

---

## 수용 기준

- **SC-001** (`FR-001`~`FR-002`): 모든 페이지에서 hex 인라인 색상이 0건이다.
- **SC-002** (`FR-003`): Button 컴포넌트가 3 variant × 3 size = 9가지 조합을 렌더링한다.
- **SC-003** (`FR-005`~`FR-006`): MUI TextField/Select import가 0건이다.
- **SC-004** (`FR-007`): MUI Pagination import가 0건이다.
- **SC-005** (`FR-008`): MUI Alert import가 0건이다.
- **SC-006** (`FR-010`): MUI CircularProgress import가 0건이다.
- **SC-007** (`FR-011`~`FR-012`): 전체 44개 페이지의 최상위 래퍼가 표준 컨테이너 패턴을 따른다.
- **SC-008** (`FR-014`~`FR-016`): 전체 44개 페이지에 공통 컴포넌트가 적용된다.

---

## 수정 대상 페이지 전체 목록

### 사용자 페이지 (11개)
| # | 파일 | 비고 |
|---|---|---|
| 1 | `pages/HomePage.js` | 히어로 섹션, 티켓 그리드 |
| 2 | `pages/AuthPage.js` | 로그인/회원가입 통합 탭 |
| 3 | `pages/LoginPage.jsx` | 독립 로그인 폼 |
| 4 | `pages/ResetPasswordPage.js` | 비밀번호 재설정 |
| 5 | `pages/KakaoCallbackPage.js` | OAuth 콜백 로딩 화면 |
| 6 | `pages/TicketListPage.jsx` | 검색·필터·그리드 — MUI Pagination 포함 |
| 7 | `pages/TicketDetailPage.jsx` | 상세 정보·즐겨찾기·CTA |
| 8 | `pages/TicketCreatePage.jsx` | 폼 — MUI TextField select 포함 |
| 9 | `pages/TicketEditPage.jsx` | 수정 폼 |
| 10 | `pages/MyPage.js` | 마이페이지 허브 |
| 11 | `pages/MyTicketListPage.jsx` | 내 티켓 목록 |

### 마이페이지 (2개)
| # | 파일 | 비고 |
|---|---|---|
| 12 | `pages/mypage/ProfilePage.js` | 프로필 수정 폼 |
| 13 | `pages/mypage/ActivityPage.js` | 활동 이력·후기 |

### 거래/결제 (4개)
| # | 파일 | 비고 |
|---|---|---|
| 14 | `pages/trade/DealListPage.js` | 거래 목록 (상태 필터) |
| 15 | `pages/DealAcceptPage.js` | 거래 수락 확인 |
| 16 | `pages/BuyerPaymentPage.js` | 결제 진행 |
| 17 | `pages/PaymentResultPage.js` | 결제 완료/실패 |

### 채팅 (2개)
| # | 파일 | 비고 |
|---|---|---|
| 18 | `pages/chat/ChatListPage.jsx` | 채팅방 목록 |
| 19 | `pages/chat/ChatRoomPage.jsx` | 채팅 메시지 뷰 |

### CS (10개)
| # | 파일 | 비고 |
|---|---|---|
| 20 | `pages/cs/NoticeListPage.js` | 공지사항 목록 |
| 21 | `pages/cs/NoticePage.jsx` | 공지 상세 |
| 22 | `pages/cs/FaqListPage.jsx` | FAQ 목록 + 아코디언 |
| 23 | `pages/cs/FaqPage.jsx` | FAQ 상세 |
| 24 | `pages/cs/InquiryListPage.jsx` | 문의 목록 |
| 25 | `pages/cs/InquiryDetailPage.jsx` | 문의 상세 |
| 26 | `pages/cs/InquiryCreatePage.jsx` | 문의 작성 — MUI 혼용 |
| 27 | `pages/cs/ReportListPage.jsx` | 신고 목록 |
| 28 | `pages/cs/ReportDetailPage.jsx` | 신고 상세 |
| 29 | `pages/cs/ReportCreatePage.jsx` | 신고 작성 |

### 관리자 (15개)
| # | 파일 | 비고 |
|---|---|---|
| 30 | `pages/admin/AdminDashboardPage.js` | 대시보드 KPI 카드 |
| 31 | `pages/admin/AdminUserManagementPage.js` | 회원 목록·상태 변경 |
| 32 | `pages/admin/AdminTicketManagementPage.jsx` | 티켓 관리 |
| 33 | `pages/admin/AdminReportListPage.jsx` | 신고 목록 |
| 34 | `pages/admin/AdminReportDetailPage.jsx` | 신고 상세·처리 |
| 35 | `pages/admin/AdminReportStatusPage.jsx` | 신고 처리 상태 |
| 36 | `pages/admin/AdminInquiryListPage.jsx` | 문의 목록 |
| 37 | `pages/admin/AdminInquiryDetailPage.jsx` | 문의 상세·답변 |
| 38 | `pages/admin/AdminNoticeListPage.jsx` | 공지 목록 |
| 39 | `pages/admin/AdminNoticeCreatePage.jsx` | 공지 작성 |
| 40 | `pages/admin/AdminNoticeEditPage.jsx` | 공지 수정 |
| 41 | `pages/admin/AdminFaqListPage.jsx` | FAQ 목록 |
| 42 | `pages/admin/AdminFaqCreatePage.jsx` | FAQ 작성 |
| 43 | `pages/admin/AdminFaqEditPage.jsx` | FAQ 수정 |
| 44 | `pages/admin/AdminCategoryManagementPage.js` | 카테고리 트리 관리 |

### 공통 컴포넌트 (신규/개편, 12개)
| # | 파일 | 비고 |
|---|---|---|
| 45 | `components/NavBar.jsx` | 업데이트 (현행 유지 + 정리) |
| 46 | `components/common/Button.jsx` | 신규 |
| 47 | `components/common/Input.jsx` | 신규 |
| 48 | `components/common/Badge.jsx` | 신규 |
| 49 | `components/common/Spinner.jsx` | 신규 (MUI CircularProgress 대체) |
| 50 | `components/common/Pagination.jsx` | 신규 (MUI Pagination 대체) |
| 51 | `components/common/Alert.jsx` | 신규 (MUI Alert 대체) |
| 52 | `components/common/EmptyState.jsx` | 신규 |
| 53 | `components/common/Modal.jsx` | 신규 |
| 54 | `components/common/PageHeader.jsx` | 업데이트 (현행 존재) |
| 55 | `components/admin/AdminLayout.jsx` | 신규 |
| 56 | `src/index.css` | 컴포넌트 레이어(@layer components) 추가 |

> **총 56개 파일** (페이지 44개 + 공통 컴포넌트 12개)

---

## 범위 외 (Out of Scope)

- 기능 추가 또는 API 연동 변경
- 라우팅 구조 변경
- 애니메이션 라이브러리 교체
- 다크모드 지원 (별도 스펙)
- `tailwind.config.js` 색상 토큰 변경 (현행 Material You 팔레트 유지)

---

## 미결 사항

없음. 방향 확정:
- 컬러 팔레트: 현행 유지 (primary #1d4ed8, secondary #742fe5)
- MUI 제거 범위: 전체 (일부 남기지 않음)
- 적용 범위: 전체 44페이지 동시 진행
