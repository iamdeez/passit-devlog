# Diff: 003-frontend-redesign

## 커밋 메시지 한 줄 요약

- **KO**: MUI 전면 제거 및 Tailwind CSS / Material You 디자인 시스템으로 프론트엔드 전환
- **EN**: Remove all MUI dependencies and migrate frontend to Tailwind CSS + Material You design system

## 변경 요약

v1.1.0/002 스펙 완료(5e9de04) 이후 작업된 프론트엔드 전면 리디자인 내용이다.

- `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` 완전 제거 (package.json)
- Tailwind `@layer components`로 `.btn-primary`, `.input-base`, `.card` 등 15종 유틸리티 클래스 도입
- MUI `ThemeProvider` / `CssBaseline` 제거 → Tailwind 단독 스타일링으로 전환
- 공통 컴포넌트 전체(`Button`, `Input`, `Modal`, `Badge`, `Spinner` 등) MUI 제거 후 순수 Tailwind 재작성
- 관리자 사이드바 레이아웃 MUI Drawer → `components/admin/AdminLayout.jsx` Tailwind 컴포넌트로 교체
- 44개 페이지 전체 MUI import 0건 달성
- 인라인 hex 색상 0건 달성 (Kakao 브랜드 컬러 `#FEE500` 제외)
- 빌드 번들 크기 대폭 감소 (MUI tree-shaking 한계 해소)

## 변경 파일 및 라인 수

> 기준 커밋: `5e9de04` (test: Playwright E2E 전체 통과 및 002-requirements-spec 검증 완료)

| 파일 | 추가 | 삭제 |
|---|---|---|
| `frontend/package.json` | +1 | -5 |
| `frontend/src/index.css` | +25 | 0 |
| `frontend/src/App.js` | +11 | -117 |
| `frontend/src/components/ErrorBoundary.js` | — | -170 (전면 재작성) |
| `frontend/src/components/LoginForm.js` | +99 | -307 |
| `frontend/src/components/RegisterForm.js` | +258 | -793 |
| `frontend/src/components/ResetPasswordForm.js` | +146 | -567 |
| `frontend/src/components/common/FormField.tsx` | — | -48 (전면 재작성) |
| `frontend/src/components/common/PasswordField.tsx` | — | -127 (전면 재작성) |
| `frontend/src/components/common/OptimizedImage.tsx` | — | -76 (전면 재작성) |
| `frontend/src/components/common/LoadingSpinner.js` | — | -40 (전면 재작성) |
| `frontend/src/components/common/PageHeader.jsx` | +3 | -16 |
| `frontend/src/components/common/index.js` | +5 | -13 |
| `frontend/src/components/auth/PrivateRoute.js` | +2 | -26 |
| `frontend/src/components/Ticket/DealRequestModal.js` | +78 | -219 |
| `frontend/src/components/Ticket/DealAcceptModal.js` | +27 | -71 |
| `frontend/src/components/Ticket/DealCancelModal.js` | +28 | -84 |
| `frontend/src/components/Ticket/DealConfirmModal.js` | +21 | -70 |
| `frontend/src/components/Ticket/DealRejectModal.js` | +31 | -84 |
| `frontend/src/components/Ticket/RequestSuccessModal.js` | +17 | -45 |
| `frontend/src/components/Ticket/LoadingModal.js` | +10 | -24 |
| `frontend/src/components/chat/MessageBubble/SystemActionMessage.jsx` | +1 | -3 |
| `frontend/src/layouts/AdminLayout.js` | **삭제** | -219 |
| `frontend/src/pages/TicketDetailPage.js` | **삭제** | -241 |
| `frontend/src/pages/TicketCreatePage.jsx` | +203 | -824 |
| `frontend/src/pages/TicketListPage.jsx` | +7 | -30 |
| `frontend/src/pages/MyPage.js` | +38 | -140 |
| `frontend/src/pages/chat/ChatPage.jsx` | +1 | -5 |
| `frontend/src/pages/chat/ChatListPage.jsx` | +1 | -2 |
| `frontend/src/pages/mypage/ProfilePage.js` | +47 | -112 |
| `frontend/src/pages/mypage/ActivityPage.js` | +3 | -9 |
| `frontend/src/pages/AuthPage.js` | +1 | -2 |
| `frontend/src/pages/admin/AdminDashboardPage.js` | +4 | -14 |
| `frontend/src/pages/admin/Admin*` (12개 관리자 페이지) | +총 57 | -총 378 |
| `frontend/src/pages/cs/*` (6개 CS 페이지) | +6 | -24 |
| `frontend/src/pages/trade/DealListPage.js` | +1 | -4 |
| **합계 (65개 파일)** | **+1,486** | **-3,800** |

## Diff (주요 변경 파일)

### frontend/package.json

```diff
-    "@emotion/react": "^11.14.0",
-    "@emotion/styled": "^11.14.1",
-    "@mui/icons-material": "^7.3.6",
-    "@mui/material": "^7.3.6",
-    "@stomp/stompjs": "^7.2.1",
+"@stomp/stompjs": "^7.2.1",
```

### frontend/src/index.css (@layer components 추가)

```diff
+@layer components {
+  /* ── 버튼 ── */
+  .btn-primary  { @apply inline-flex items-center justify-center px-5 py-2.5 bg-primary text-on-primary rounded-xl font-display font-bold text-sm hover:bg-primary-dim active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed; }
+  .btn-outlined { @apply inline-flex items-center justify-center px-5 py-2.5 border border-primary text-primary bg-transparent rounded-xl font-display font-bold text-sm hover:bg-primary/10 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed; }
+  .btn-ghost    { @apply inline-flex items-center justify-center px-4 py-2 text-primary font-display font-semibold text-sm hover:bg-primary/10 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed; }
+  .btn-sm       { @apply px-3.5 py-1.5 text-xs; }
+  .btn-lg       { @apply px-7 py-3.5 text-base; }
+  .input-base { @apply w-full border border-outline-variant rounded-xl px-4 py-3 text-on-surface bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline; }
+  .card       { @apply bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden; }
+  .card-hover { @apply card hover-lift cursor-pointer; }
+  .badge { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium; }
+  .page-container { @apply min-h-screen bg-background pt-16; }
+  .page-inner     { @apply max-w-[1280px] mx-auto px-6 py-10 space-y-8; }
+  .page-title     { @apply text-2xl font-display font-bold text-on-surface; }
+  .section-title  { @apply text-lg font-display font-bold text-on-surface; }
+}
```

### frontend/src/App.js (MUI ThemeProvider 제거)

```diff
-import { ThemeProvider, createTheme } from "@mui/material/styles";
-import CssBaseline from "@mui/material/CssBaseline";

-const theme = createTheme({
-  palette: { primary: { main: "#1d4ed8", ... }, ... },
-  typography: { ... },
-  components: { MuiButton: { ... }, MuiTextField: { ... }, ... },
-});

 function App() {
   return (
     <ErrorBoundary>
-      <ThemeProvider theme={theme}>
-        <CssBaseline />
       <LoadingProvider>
         ...
       </LoadingProvider>
-      </ThemeProvider>
     </ErrorBoundary>
   );
 }
```

### frontend/src/layouts/AdminLayout.js → 삭제 (MUI Drawer 기반)

```diff
-import { Drawer, List, ListItem, ... } from "@mui/material";
-const AdminLayout = ({ children }) => {
-  return (
-    <Box sx={{ display: "flex" }}>
-      <Drawer variant="permanent" sx={{ ... }}>
-        <List>...</List>
-      </Drawer>
-      <Box component="main" sx={{ ... }}>
-        {children}
-      </Box>
-    </Box>
-  );
-};
```

대체: `frontend/src/components/admin/AdminLayout.jsx` (Tailwind 기반)

### 전체 diff 확인 방법

```bash
git diff 5e9de04 -- frontend/src/ frontend/package.json
```
