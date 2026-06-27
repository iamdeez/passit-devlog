# Plan: frontend-redesign

> Branch: 003-frontend-redesign | Date: 2026-06-19 | Spec: [spec.md](./spec.md)

## 사전 검증 (Constitution Gates)

- [x] 성능 원칙: MUI 제거로 번들 크기 감소 — 저하 없음
- [x] 호환성 원칙: 기능·API·라우팅 변경 없음 — 기존 통합 코드 영향 없음
- [x] 테스트 원칙: SC-001~SC-008 수용 기준이 spec.md에 정의됨
- [x] 스펙 범위 원칙: 디자인/스타일 변경만 포함, 기능 추가 없음

---

## 기술 컨텍스트

- **언어 / 런타임**: React 18, JavaScript (JSX)
- **스타일**: Tailwind CSS v3 + Material You 컬러 토큰 (tailwind.config.js)
- **현재 MUI 사용 목록**:
  - `@mui/material`: Pagination, Alert, CircularProgress, TextField(select), Typography
  - 제거 후 Tailwind 자체 구현으로 교체
- **아이콘**: Material Symbols Outlined (`<span class="material-symbols-outlined">`)
- **폰트**: Plus Jakarta Sans (display), Inter (body/label) — 현행 유지

---

## 사전 영향도 분석

### MUI 사용 현황 (grep 결과)

| 컴포넌트 | 사용 파일 수 | 대체 방법 |
|---|---|---|
| `Pagination` | TicketListPage, AdminList 계열 | `components/common/Pagination.jsx` |
| `Alert` | 다수 페이지 | `components/common/Alert.jsx` |
| `CircularProgress` | TicketListPage, 일부 페이지 | `components/common/Spinner.jsx` |
| `TextField select` | TicketCreatePage, TicketEditPage | native `<select>` + Tailwind |
| `Typography` | 일부 Admin 페이지 | Tailwind 타이포 클래스로 직접 교체 |

### 영향 파일 목록

| 파일 | 변경 유형 | 영향 내용 |
|---|---|---|
| `src/index.css` | 수정 | `@layer components` 블록 추가 |
| `tailwind.config.js` | 유지 | 변경 없음 |
| `components/common/*.jsx` | 신규 (12개) | 공통 컴포넌트 신설 |
| `components/admin/AdminLayout.jsx` | 신규 | 어드민 사이드바 레이아웃 |
| `pages/**/*.jsx/js` (44개) | 수정 | 공통 컴포넌트 교체, MUI import 제거 |

---

## 핵심 설계

### 1. Tailwind Component Layer (`@layer components`)

`src/index.css`에 자주 쓰이는 복합 클래스를 단축 유틸리티로 등록.
페이지 코드가 장황해지는 것을 방지하되, 컴포넌트 외부에서도 사용 가능하도록 CSS 레이어에 정의.

```css
@layer components {
  /* 버튼 */
  .btn-primary   { @apply px-5 py-2.5 bg-primary text-on-primary rounded-xl font-display font-bold text-sm hover:bg-primary-dim active:scale-[0.97] transition-all disabled:opacity-50; }
  .btn-outlined  { @apply px-5 py-2.5 border border-primary text-primary bg-transparent rounded-xl font-display font-bold text-sm hover:bg-primary/10 active:scale-[0.97] transition-all; }
  .btn-ghost     { @apply px-4 py-2 text-primary font-display font-semibold text-sm hover:bg-primary/10 rounded-xl transition-all; }
  .btn-sm        { @apply px-3.5 py-1.5 text-xs; }
  .btn-lg        { @apply px-7 py-3.5 text-base; }

  /* 입력 */
  .input-base    { @apply w-full border border-outline-variant rounded-xl px-4 py-3 text-on-surface bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline; }

  /* 카드 */
  .card          { @apply bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden; }
  .card-hover    { @apply card hover-lift cursor-pointer; }

  /* 배지 */
  .badge         { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium; }

  /* 페이지 컨테이너 */
  .page-container { @apply min-h-screen bg-background pt-16; }
  .page-inner    { @apply max-w-[1280px] mx-auto px-6 py-10 space-y-8; }
  .page-title    { @apply text-2xl font-display font-bold text-on-surface; }
  .section-title { @apply text-lg font-display font-bold text-on-surface; }
}
```

### 2. 공통 컴포넌트 설계

#### Button (`components/common/Button.jsx`)
```jsx
// Props: variant="filled|outlined|ghost", size="sm|md|lg", children, ...rest
export function Button({ variant = "filled", size = "md", children, className = "", ...rest }) {
  const base = "font-display font-bold rounded-xl transition-all active:scale-[0.97] disabled:opacity-50";
  const variants = {
    filled:   "bg-primary text-on-primary hover:bg-primary-dim",
    outlined: "border border-primary text-primary hover:bg-primary/10",
    ghost:    "text-primary hover:bg-primary/10",
  };
  const sizes = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>{children}</button>;
}
```

#### Pagination (`components/common/Pagination.jsx`)
MUI `<Pagination>` 완전 대체. `totalPages`, `currentPage`, `onPageChange` props.

#### Alert (`components/common/Alert.jsx`)
MUI `<Alert severity="...">` 대체. `type="success|error|warning|info"` props.

#### Spinner (`components/common/Spinner.jsx`)
MUI `<CircularProgress>` 대체. CSS `animate-spin` 기반.

#### EmptyState (`components/common/EmptyState.jsx`)
`icon`, `title`, `description`, `action` props.

#### AdminLayout (`components/admin/AdminLayout.jsx`)
좌측 고정 사이드바(w-64) + 우측 콘텐츠 영역. 현재 Admin 페이지들이 각자 레이아웃을 인라인으로 정의하는 것을 통일.

### 3. 페이지 적용 패턴

모든 페이지는 아래 패턴을 따른다:

```jsx
export default function SomePage() {
  return (
    <div className="page-container">
      <div className="page-inner">
        <div className="flex items-center justify-between">
          <h1 className="page-title">페이지 제목</h1>
          {/* 우측 CTA */}
        </div>
        {/* 콘텐츠 */}
      </div>
    </div>
  );
}
```

Admin 페이지:
```jsx
export default function AdminSomePage() {
  return (
    <AdminLayout title="페이지 제목">
      {/* 콘텐츠 */}
    </AdminLayout>
  );
}
```

---

## 인터페이스 계약

### 공통 컴포넌트 Props 계약

| 컴포넌트 | 핵심 Props | 기존 대체 대상 |
|---|---|---|
| `Button` | `variant`, `size`, `onClick`, `disabled` | MUI Button, 인라인 button 클래스 |
| `Pagination` | `totalPages`, `currentPage`, `onPageChange` | MUI Pagination |
| `Alert` | `type`, `message`, `onClose?` | MUI Alert |
| `Spinner` | `size?`, `className?` | MUI CircularProgress |
| `EmptyState` | `icon`, `title`, `description`, `action?` | 각 페이지 인라인 빈 상태 |
| `Badge` | `color?`, `children` | 각 페이지 인라인 span |
| `AdminLayout` | `title`, `children` | 각 Admin 페이지 인라인 레이아웃 |

---

## 테스트 전략

| SC 식별자 | 테스트 유형 | 시나리오 요약 | 검증 방법 |
|---|---|---|---|
| SC-001 | 정적 코드 검증 | hex 인라인 색상 0건 | `grep -r "#[0-9a-f]\{6\}" src/pages src/components` → 0건 |
| SC-002 | 시각 확인 | Button 9가지 조합 렌더링 | 개발 서버에서 확인 |
| SC-003 | 정적 코드 검증 | MUI TextField/Select 0건 | `grep -r "TextField\|from '@mui'" src/` → 0건 |
| SC-004 | 정적 코드 검증 | MUI Pagination 0건 | `grep -r "Pagination" src/` → 0건 |
| SC-005 | 정적 코드 검증 | MUI Alert 0건 | `grep -r "Alert.*@mui" src/` → 0건 |
| SC-006 | 정적 코드 검증 | MUI CircularProgress 0건 | `grep -r "CircularProgress" src/` → 0건 |
| SC-007 | 정적 코드 검증 | 44개 페이지 래퍼 패턴 확인 | `page-container` 또는 `AdminLayout` 사용 확인 |
| SC-008 | 시각 확인 | 전체 44페이지 공통 컴포넌트 적용 | 개발 서버 순회 확인 |

---

## 기타 고려사항

- **MUI 완전 제거 시기**: 모든 페이지에서 import가 제거된 후 `package.json`에서 `@mui/material` 의존성 삭제
- **채팅 CSS 파일**: `components/chat/*/style.css` 파일은 별도로 검토 — 채팅 UI 특성상 일부 커스텀 CSS 유지 허용
- **기존 `PageHeader.jsx`**: 이미 존재하는 컴포넌트 — 스타일 일치 여부 확인 후 필요 시 업데이트
- **TicketDetailPage.js vs .jsx**: 두 파일이 존재함 — `.jsx` 버전을 기준으로 통일, `.js`는 삭제 필요
