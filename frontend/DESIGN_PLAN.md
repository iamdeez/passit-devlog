# PASSIT 프론트엔드 디자인 반영 계획

> Stitch 프로젝트 `3229962285669901564` (PASSIT — 티켓 안전거래 플랫폼) 시안을
> 기존 React 프론트엔드 41개 페이지에 반영하기 위한 매핑 및 구현 계획서.
>
> 디자인 시스템: Plus Jakarta Sans (헤딩) / Inter (본문) / Public Sans (레이블)
> Primary Color: `#515d8c` · Roundness: ROUND_EIGHT · Mode: LIGHT

---

## 목차

- [1. Stitch 시안 ↔ 프론트엔드 파일 매핑](#1-stitch-시안--프론트엔드-파일-매핑)
  - [1-1. 사용자 페이지](#1-1-사용자-페이지)
  - [1-2. 관리자 페이지](#1-2-관리자-페이지)
- [2. Gap 분석 — 신규 생성 필요 페이지](#2-gap-분석--신규-생성-필요-페이지)
- [3. 구현 계획](#3-구현-계획)
  - [Phase 1. 핵심 사용자 흐름](#phase-1-핵심-사용자-흐름-티켓-거래)
  - [Phase 2. 마이페이지 & 고객센터](#phase-2-마이페이지--고객센터)
  - [Phase 3. 신규 페이지 생성](#phase-3-신규-페이지-생성)
  - [Phase 4. 관리자 페이지](#phase-4-관리자-페이지)
- [4. 공통 디자인 시스템 적용](#4-공통-디자인-시스템-적용)

---

## 1. Stitch 시안 ↔ 프론트엔드 파일 매핑

### 1-1. 사용자 페이지

| Stitch 시안 | Stitch 스크린 ID | 프론트엔드 파일 | 비고 |
|---|---|---|---|
| PASSIT 홈 화면 (신규) ⭐ | `87e77d44daa0411684a81d8527df2f16` | `pages/HomePage.js` | **최신 시안** 반영 대상 |
| PASSIT 홈 화면 | `2cb80e143c1744fab365664d70771667` | `pages/HomePage.js` | 이전 버전, 신규 시안으로 대체 |
| PASSIT 로그인/회원가입 | `909474c4271c4e00a78ebaf933db878e` | `pages/AuthPage.js` | |
| PASSIT 카카오 로그인 처리 중 | `f055da88025b44229cf05b71920ff5bd` | `pages/KakaoCallbackPage.js` | |
| PASSIT 비밀번호 재설정 페이지 | `6fd30c3a854347c9b7fc53bc9b10fe49` | `pages/ResetPasswordPage.js` | |
| PASSIT 티켓 목록 페이지 | `7aa519535e394cba999cd0dba8972a6b` | `pages/TicketListPage.jsx` | |
| PASSIT 티켓 검색 결과 | `2cc1bc5fcd2245c79a98af14f35ccd24` | `pages/TicketListPage.jsx` | 검색 모드 처리, 별도 파일 없음 |
| PASSIT 티켓 상세 페이지 | `c0b903952ea44a62b6c9e469593f7106` | `pages/TicketDetailPage.jsx` | |
| PASSIT 티켓 상세 (BTS) | `9a99a88ec43649d9a1f67d4fe9dc4056` | `pages/TicketDetailPage.jsx` | BTS 샘플 데이터용, 동일 컴포넌트 |
| PASSIT 티켓 등록 페이지 | `737241e7e38e4ddab48e199d5af6185e` | `pages/TicketCreatePage.jsx` | |
| PASSIT 티켓 수정 페이지 | `0152727fe3f74bb7b819c0f86e3a5c23` | `pages/TicketEditPage.jsx` | |
| PASSIT 결제 페이지 | `c36718405a1743fdaed03b20a8731174` | `pages/BuyerPaymentPage.js` | |
| PASSIT 결제 완료 페이지 | `4ec537f8220642baa6d034bb05a58b88` | `pages/PaymentResultPage.js` | |
| PASSIT 거래 진행 페이지 | `2a57ffcb586e43ac854619e968316b61` | `pages/DealAcceptPage.js` | |
| PASSIT 내 거래 목록 | `635c6d9a73fb4371a2fcba9d71cd7a87` | `pages/trade/DealListPage.js` | |
| PASSIT 안전거래 채팅방 | `8a8d81ddcec54f69bd84428631701172` | `pages/chat/ChatRoomPage.jsx` | |
| PASSIT 마이페이지 | `08daa040e1fc4f3a8902591c53c3e928` | `pages/mypage/ProfilePage.js` | 마이페이지 허브 역할 |
| PASSIT 프로필 수정 페이지 | `29fd6d2998b04beab2efd2ad15ee6f63` | `pages/mypage/ProfilePage.js` | 조건부 편집 모드 또는 분리 |
| PASSIT 찜 목록 페이지 | `62d62a5f01024386a3b712e3ba5778f9` | `pages/MyTicketListPage.jsx` | |
| PASSIT 구매 내역 페이지 | `468db458d2d144c5b55deb78856e52c9` | `pages/mypage/ActivityPage.js` | 시안 2개 중 최신 채택 |
| PASSIT 구매 내역 페이지 (2) | `7809e7637ec54c9cbd33e4c3b109396b` | `pages/mypage/ActivityPage.js` | 위와 동일 파일, 최신 시안 기준 |
| PASSIT 활동 내역 | `1831fce1591f41e0aed7f9744eddd1a4` | `pages/mypage/ActivityPage.js` | 탭으로 구매내역/활동내역 통합 |
| PASSIT 알림 목록 페이지 ⚠️ | `4c55ee964fb444f6aefd2dcadd98cbf9` | **없음** | **신규 생성 필요** |
| PASSIT 공지사항 목록 | `8ebcac0338b2473faa5ddc6a99b0a457` | `pages/cs/NoticeListPage.js` | |
| PASSIT 공지사항 상세 | `e172e7047e314eef8863dfc5968f9ff1` | `pages/cs/NoticePage.jsx` | |
| PASSIT 자주 묻는 질문 FAQ (1) | `16a1754ed1f448ce8fe055a1f9d5882c` | `pages/cs/FaqListPage.jsx` | 시안 3개 중 최신 채택 |
| PASSIT 자주 묻는 질문 FAQ (2) | `ef6813a559dc4375b1b2608d2ee1de22` | `pages/cs/FaqListPage.jsx` | |
| PASSIT 자주 묻는 질문 FAQ (3) | `2daffdd8e107485c92d7214d1ee6e53e` | `pages/cs/FaqPage.jsx` | FAQ 상세 |
| PASSIT 1:1 문의 내역 | `b781e73d714c4ff1bec8987f0be2fdad` | `pages/cs/InquiryListPage.jsx` | |
| PASSIT 1:1 문의 작성 페이지 | `e5f2b5f79602440195bb088da6ee795d` | `pages/cs/InquiryCreatePage.jsx` | |
| PASSIT 1:1 문의 상세 페이지 | `93115ad3a9a74bd0862f5b4f9e2cd90a` | `pages/cs/InquiryDetailPage.jsx` | |
| PASSIT 신고 접수 페이지 | `8e342a94d347443cb632c79c20643da3` | `pages/cs/ReportCreatePage.jsx` | |

> `pages/chat/ChatListPage.jsx`, `pages/cs/ReportDetailPage.jsx`, `pages/cs/ReportListPage.jsx`는
> Stitch에 대응 시안 없음 → 기존 코드 유지

---

### 1-2. 관리자 페이지

| Stitch 시안 | Stitch 스크린 ID | 프론트엔드 파일 | 비고 |
|---|---|---|---|
| PASSIT 관리자 대시보드 | `d74b29e6a3e44d5fbe9f4a470a1812b4` | `pages/admin/AdminDashboardPage.js` | |
| PASSIT 관리자 회원 관리 | `dfa3683ba5124ca4bae0210d68f1d140` | `pages/admin/AdminUserManagementPage.js` | |
| PASSIT 관리자 회원 상세 페이지 ⚠️ | `dcbe1bb7c2ce419bb34a40ca961a2da1` | **없음** | **신규 생성 필요** |
| PASSIT 관리자 티켓 관리 | `033e7f6b87a84ed19586ea7cf54cc74c` | `pages/admin/AdminTicketManagementPage.jsx` | |
| PASSIT 관리자 거래 관리 ⚠️ | `dcc328cb60a74d6d9c1422cf548ec796` | **없음** | **신규 생성 필요** |
| PASSIT 관리자 문의 관리 목록 | `76f2cf9c174a48aca1370d45b2b2290e` | `pages/admin/AdminInquiryListPage.jsx` | |
| PASSIT 관리자 문의 상세 및 답변 작성 | `f29fd4cbb9ba4b10981c7b5df148912a` | `pages/admin/AdminInquiryDetailPage.jsx` | |
| PASSIT 관리자 신고 관리 목록 | `fc638ccac0554100ae614c61df290ca8` | `pages/admin/AdminReportListPage.jsx` | |
| PASSIT 관리자 신고 상세 페이지 | `3e41c677bd084646888e1d83e4cf010f` | `pages/admin/AdminReportDetailPage.jsx` | |
| PASSIT 관리자 공지사항 관리 | `cc94cacc0a2a4485b02fe84d81c8d4be` | `pages/admin/AdminNoticeListPage.jsx` | |
| PASSIT 관리자 공지사항 작성/편집 | `c03d67a336264d1b91ec5972e5fb275c` | `pages/admin/AdminNoticeCreatePage.jsx` / `AdminNoticeEditPage.jsx` | |
| PASSIT 관리자 FAQ 관리 목록 | `de2ab282a1dc4e079ca0a5949c54a6bf` | `pages/admin/AdminFaqListPage.jsx` | |
| PASSIT 관리자 FAQ 작성/편집 | `f0a7339e53be47888c2b8cd9f197b1b0` | `pages/admin/AdminFaqCreatePage.jsx` / `AdminFaqEditPage.jsx` | |
| PASSIT 관리자 카테고리 관리 | `0cd183a9ab1448209bd4ec06678fe624` | `pages/admin/AdminCategoryManagementPage.js` | |

---

## 2. Gap 분석 — 신규 생성 필요 페이지

Stitch 시안은 존재하지만 대응하는 프론트엔드 파일이 없는 3개 페이지.

| 생성할 파일 | Stitch 스크린 ID | 우선순위 |
|---|---|---|
| `pages/NotificationPage.jsx` | `4c55ee964fb444f6aefd2dcadd98cbf9` | Phase 3 |
| `pages/admin/AdminUserDetailPage.jsx` | `dcbe1bb7c2ce419bb34a40ca961a2da1` | Phase 3 |
| `pages/admin/AdminTradeManagementPage.jsx` | `dcc328cb60a74d6d9c1422cf548ec796` | Phase 4 |

---

## 3. 구현 계획

### Phase 1. 핵심 사용자 흐름 (티켓 거래)

> 유저가 가장 많이 사용하는 핵심 플로우. 먼저 반영하면 서비스 완성도가 즉시 체감됨.

- [x] **1-1** `pages/HomePage.js`
  - Stitch: `87e77d44daa0411684a81d8527df2f16` (신규 홈 시안)
  - 변경: 에스크로 보호 거래 히어로, 수평 스크롤 카테고리 탭("전체" 추가), 최근 등록 티켓 섹션 추가, 기존 Trust 섹션 제거

- [x] **1-1a** `components/BottomNav.jsx` ← **신규 생성**
  - 홈/티켓/거래/채팅/마이 5탭 모바일 하단 내비게이션

- [x] **1-2** `pages/TicketListPage.jsx`
  - 변경: 모바일 BottomNav 여백 적용 (`pb-16 md:pb-0`)

- [x] **1-3** `pages/TicketDetailPage.jsx`
  - 변경: 모바일 BottomNav 여백 적용 (`pb-16 md:pb-0`)

- [x] **1-4** `pages/TicketCreatePage.jsx` / `TicketEditPage.jsx`
  - Stitch: `737241e7e38e4ddab48e199d5af6185e` / `0152727fe3f74bb7b819c0f86e3a5c23`
  - 작업: 폼 레이아웃, 이미지 업로드 UI, 카테고리 선택 탭 (적용 완료)

- [x] **1-5** `pages/BuyerPaymentPage.js` / `pages/DealAcceptPage.js`
  - 변경: 모바일 BottomNav 여백 적용 (`pb-20 md:pb-10`)

- [x] **1-6** `pages/trade/DealListPage.js`
  - 변경: 모바일 BottomNav 여백 적용 (`pb-16 md:pb-0`)

---

### Phase 2. 마이페이지 & 고객센터

- [x] **2-1** `pages/AuthPage.js` / `pages/ResetPasswordPage.js`
  - 변경: BottomNav를 `/reset-password` 경로에서도 숨김 처리 (full-screen auth 페이지)

- [x] **2-2** `layouts/MyPageLayout.js` + `pages/mypage/ProfilePage.js`
  - 변경: MyPageLayout에 `pb-16 md:pb-0` 추가, 사이드바에 프로필 카드 + CS 링크 + 로그아웃 버튼 통합
  - 변경: ProfilePage 상단에 모바일 전용 프로필 요약 카드 추가

- [x] **2-3** `pages/mypage/ActivityPage.js`
  - 변경: MyPageLayout `pb-16 md:pb-0`으로 커버됨

- [x] **2-4** `pages/MyTicketListPage.jsx`
  - 변경: MyPageLayout `pb-16 md:pb-0`으로 커버됨

- [x] **2-5** `pages/chat/ChatRoomPage.jsx`
  - 변경: BottomNav를 `/chat/:id` 경로에서 숨김 처리 (채팅 입력창 충돌 방지)

- [x] **2-6** `pages/cs/NoticeListPage.js` / `cs/NoticePage.jsx`
  - 변경: 모바일 BottomNav 여백 적용 (`pb-16 md:pb-0`)

- [x] **2-7** `pages/cs/FaqListPage.jsx` / `cs/FaqPage.jsx`
  - 변경: 모바일 BottomNav 여백 적용 (`pb-16 md:pb-0`)

- [x] **2-8** `pages/cs/InquiryListPage.jsx` / `InquiryCreatePage.jsx` / `InquiryDetailPage.jsx`
  - 변경: 모바일 BottomNav 여백 적용 (`pb-16 md:pb-0`)

- [x] **2-9** `pages/cs/ReportCreatePage.jsx` / `ReportListPage.jsx` / `ReportDetailPage.jsx`
  - 변경: 모바일 BottomNav 여백 적용 (`pb-16 md:pb-0`)

---

### Phase 3. 신규 페이지 생성

- [x] **3-1** `pages/NotificationPage.jsx` ← **신규 생성**
  - Stitch: `4c55ee964fb444f6aefd2dcadd98cbf9`
  - 변경: 전체/안읽음 탭, 알림 타입별 색상 아이콘, 읽음 처리, `/notifications` 라우트 등록

- [x] **3-2** `pages/admin/AdminUserDetailPage.jsx` ← **신규 생성**
  - Stitch: `dcbe1bb7c2ce419bb34a40ca961a2da1`
  - 변경: 프로필 카드, 기본 정보/거래 통계 패널, 계정 정지/활성화/삭제 액션, `/admin/users/:userId` 라우트 등록
  - 변경: AdminUserManagementPage에 "상세" 버튼 → `/admin/users/:userId` 링크 추가

- [x] **3-3** `pages/admin/AdminTradeManagementPage.jsx` ← **신규 생성**
  - Stitch: `dcc328cb60a74d6d9c1422cf548ec796`
  - 변경: 통계 4카드, 검색+탭 필터(전체/진행중/완료/취소), 거래 목록 테이블, 페이지네이션, 상세 모달
  - 변경: AdminLayout 사이드바에 "거래 관리" 항목 추가, `/admin/trades` 라우트 등록

---

### Phase 4. 관리자 페이지

- [x] **4-1** `pages/admin/AdminDashboardPage.js`
  - Stitch: `d74b29e6a3e44d5fbe9f4a470a1812b4`
  - 작업: 그라디언트 배너, 빠른 메뉴 4카드, 통계 카드 리스타일

- [x] **4-2** `pages/admin/AdminUserManagementPage.js`
  - Stitch: `dfa3683ba5124ca4bae0210d68f1d140`
  - 작업: 회원 수 표시 헤더, 상태 탭 필터(드롭다운→탭 버튼)

- [x] **4-3** `pages/admin/AdminTicketManagementPage.jsx`
  - Stitch: `033e7f6b87a84ed19586ea7cf54cc74c`
  - 작업: 통계 4카드(fetchStats), 상태 탭 필터, 상태 배지 아이콘, 빈 상태 UI, 페이지네이션 스타일

- [x] **4-4** `pages/admin/AdminInquiryListPage.jsx`
  - Stitch: `76f2cf9c174a48aca1370d45b2b2290e`
  - 작업: 통계 2카드(URGENT 배지), 탭 필터(미답변 카운트 배지), 카테고리 태그, 그리드 행

- [x] **4-5** `pages/admin/AdminReportListPage.jsx`
  - Stitch: `fc638ccac0554100ae614c61df290ca8`
  - 작업: 통계 3카드, 탭 필터(처리대기 카운트 배지), 카드형 목록, 타입 아이콘, 상태 배지, 처리하기/내역보기 버튼

- [x] **4-5a** `pages/admin/AdminReportDetailPage.jsx`
  - Stitch: `3e41c677bd084646888e1d83e4cf010f`
  - 작업: 신고 ID/상태 헤더, 당사자 2카드, 상세내용/처리이력 섹션, 처리상태+조치+메모 입력 폼

- [x] **4-4a** `pages/admin/AdminInquiryDetailPage.jsx`
  - Stitch: `f29fd4cbb9ba4b10981c7b5df148912a`
  - 작업: 카테고리/제목/작성자 헤더, 기존 답변 표시 카드, 빠른 템플릿 버튼, 2000자 텍스트에리어, 답변 등록 버튼

- [x] **4-6** `pages/admin/AdminNoticeListPage.jsx` / `AdminNoticeCreatePage.jsx` / `AdminNoticeEditPage.jsx`
  - Stitch: `cc94cacc0a2a4485b02fe84d81c8d4be` / `c03d67a336264d1b91ec5972e5fb275c`
  - 작업: 고정 공지 별도 섹션, 노출/비공개 배지, Toggle 컴포넌트(상단 고정/즉시 발행), 서식 툴바, 임시저장

- [x] **4-7** `pages/admin/AdminFaqListPage.jsx` / `AdminFaqCreatePage.jsx` / `AdminFaqEditPage.jsx`
  - Stitch: `de2ab282a1dc4e079ca0a5949c54a6bf` / `f0a7339e53be47888c2b8cd9f197b1b0`
  - 작업: 통계 3카드(전체/노출/숨김), 카테고리 탭, 아코디언 목록(답변 펼침), 카테고리 필 선택

- [x] **4-8** `pages/admin/AdminCategoryManagementPage.js`
  - Stitch: `0cd183a9ab1448209bd4ec06678fe624`
  - 작업: 플랫 목록(아이콘 원+이름+티켓수+편집/삭제), 인라인 수정(아이콘 그리드+이름 입력), 하단 추가 폼(아이콘 6종 선택+이름)

---

## 4. 공통 디자인 시스템 적용

모든 Phase 작업 전 공통 적용 사항.

### 타이포그래피

```css
/* 헤딩 */
font-family: 'Plus Jakarta Sans', sans-serif;

/* 본문 */
font-family: 'Inter', sans-serif;

/* 레이블/버튼 */
font-family: 'Public Sans', sans-serif;
```

### 컬러 팔레트

| 역할 | 값 |
|---|---|
| Primary | `#515d8c` |
| Primary Light | `#6b79a8` |
| Primary Dark | `#3a4269` |
| Background | `#ffffff` |
| Surface | `#f8f9fa` |
| Border | `#e2e8f0` |
| Text Primary | `#1a202c` |
| Text Secondary | `#718096` |

### 공통 컴포넌트 우선 정비

1. `components/common/Button` — Primary / Secondary / Ghost 3종
2. `components/common/Card` — 티켓 카드 컴포넌트
3. `components/common/Badge` — 안전거래 배지, 상태 배지
4. `components/layout/Header` — 상단 네비게이션 (로고, 검색, 알림, 마이페이지)
5. `components/layout/BottomNav` — 모바일 하단 탭 바

> 공통 컴포넌트 정비 후 각 Phase 페이지에 적용하면 일관성을 유지할 수 있음.
