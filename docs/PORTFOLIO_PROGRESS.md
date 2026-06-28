# Passit 포트폴리오 제작 — 진행 현황 & 남은 할 일

> 포트폴리오 공개를 위한 작업 추적 문서. 다음 작업 시작 전 이 문서를 먼저 확인한다.
> 최종 갱신: 2026-06-28

## 목차

- [1. 한눈에 보기](#1-한눈에-보기)
- [2. 완료된 작업](#2-완료된-작업)
  - [2-1. 보안 (시크릿 제거)](#2-1-보안-시크릿-제거)
  - [2-2. 프론트엔드 앱 프레임 리디자인](#2-2-프론트엔드-앱-프레임-리디자인)
  - [2-3. 백엔드 기술 부채 정리](#2-3-백엔드-기술-부채-정리)
  - [2-4. 라이브 데모 배포](#2-4-라이브-데모-배포)
  - [2-5. 데모 데이터 & 계정](#2-5-데모-데이터--계정)
  - [2-6. 문서 현행화](#2-6-문서-현행화)
- [3. 남은 할 일](#3-남은-할-일)
  - [3-1. 🔴 즉시 (공개 차단)](#3-1--즉시-공개-차단)
  - [3-2. 🟡 포트폴리오 산출물](#3-2--포트폴리오-산출물)
  - [3-3. 🟠 품질·완성도](#3-3--품질완성도)
- [4. 현재 상태 메모](#4-현재-상태-메모)
- [5. 주요 레퍼런스](#5-주요-레퍼런스)

---

## 1. 한눈에 보기

- **프로젝트**: Passit — 공연·스포츠 티켓 정가 양도 플랫폼 (Spring Boot MSA 5개 + React 18)
- **라이브 데모**: https://passit-demo.vercel.app (Demo Mode, 백엔드 없이 mock 동작)
- **저장소**: github.com/iamdeez/passit-devlog (squash 공개 히스토리)
- **상태**: 코드·데모는 거의 완성. **남은 핵심 = 자격증명 재발급 + 미커밋 변경 커밋 + 포트폴리오 문서/스크린샷 제작.**

---

## 2. 완료된 작업

### 2-1. 보안 (시크릿 제거)

- `deploy/render/render.yaml`: 운영 시크릿 13개 → `sync: false` (Render 대시보드 입력 방식)
- `backend/service-account/application.yml`: 카카오 키 → placeholder
- `backend/service-ticket`·`service-cs/application.yml`: JWT 평문 → `${JWT_SECRET:...}` env 참조
- 과거 시크릿이 박힌 히스토리를 **orphan squash로 새 히스토리 생성** 후 force-push (커밋 `8200f5c`)

### 2-2. 프론트엔드 앱 프레임 리디자인

- 사용자 화면 전체를 **모바일 앱 프레임(max-w-md, 가운데 정렬)**으로 통일 — 데스크톱에서도 폰 앱처럼 보임
- `App.js` `AppShell`: 관리자(/admin) 제외하고 프레임 적용
- `NavBar`: 앱 바 + 햄버거 드로어(기존 미연결 드로어 활성화), `BottomNav`: 항상 표시
- `MyPageLayout`·`ChatLayout`: 강제 모바일(사이드바/2패널 → 단일 컬럼)
- 페이지별 고정 헤더/하단바 28개 파일을 `inset-x-0 mx-auto max-w-md`로 중앙 고정
- **상태: 워킹트리 미커밋** (아래 3-1 참조)

### 2-3. 백엔드 기술 부채 정리 (커밋됨)

- **service-cs 패키지 리네이밍**: `com.company.template` → `com.company.cs` (65개 테스트 통과)
- `DealEventListener` 완성: `deal.confirmed` 수신 시 `TicketService.markTicketAsUsed()` (멱등)
- `SecurityConfig`: `/api/users/search` → `hasRole("ADMIN")`
- Dockerfile EXPOSE 포트 정정(ticket 8082·chat 8084·trade 8083)
- `service-ticket/.env.example` 생성, `service-cs/README.md` 실제 서비스 문서로 교체

### 2-4. 라이브 데모 배포

- Vercel 프로젝트 `deez-s-projects/passit-demo`, 별칭 `passit-demo.vercel.app`
- **중요**: env 인라인 문제로 `vercel.json`의 `buildCommand`를 `npm run build:demo`로 고정해야 demo 모드가 켜진다. `build:demo`에는 `CI=false` 필수(Vercel은 CI=true라 경고를 에러 처리)

### 2-5. 데모 데이터 & 계정

- `src/demo/demoData.js`: 티켓 22개(5개 카테고리·상태/가격/지역 다양), 거래 5건(요청/수락/완료/거절/판매자 수신), 채팅 3개, 회원 9명, 카테고리·문의·신고 시드
- 데모 로그인 분기(`AuthContext`) + 로그인 화면 원클릭 체험 버튼(`LoginForm`)
- 관리자 데모 연결: `adminService`·`categoryService`·`AdminDashboard` 데모 분기
- **데모 계정**: `demo@passit.app`(구매자) / `admin@passit.app`(관리자) — 비밀번호 무관, 이메일에 `admin` 포함 시 관리자
- 카테고리 ID는 앱 규칙(1=뮤지컬 2=연극 3=콘서트 4=스포츠 5=전시 6=클래식 7=기타)에 정합
- **상태: 워킹트리 미커밋**

### 2-6. 문서 현행화

- `README.md`: MUI→Tailwind/Material You, DB 로컬/배포 구분, 데모 URL·`start:demo` 안내 (커밋됨)
- `.claude/context.md` §7: service-cs 패키지 부채 항목 제거 (커밋됨)

---

## 3. 남은 할 일

### 3-1. 🔴 즉시 (공개 차단)

- [ ] **노출됐던 자격증명 재발급/무효화** — 카카오 client-secret, Gmail 앱 비밀번호, Supabase DB 비번, Upstash Redis 비번, JWT 시크릿. 과거 히스토리/캐시에 남을 수 있으므로 **값 자체를 죽여야** 안전. (GitHub PAT `local/.env`도 권장)
- [ ] **미커밋 변경 커밋** — 현재 워킹트리에 프론트 ~47개 파일(앱 프레임 리디자인 + 데모 데이터 + 데모 서비스 분기)이 미커밋. 라이브엔 반영됐지만 git엔 미반영. 권장 커밋 분할:
  - `feat: 사용자 화면 모바일 앱 프레임(가운데 정렬) 적용`
  - `feat: 데모 데이터 보강 + 데모 로그인/계정`
  - `fix: 전 서비스 데모 분기 연결 + Vercel demo 빌드 고정(build:demo)`

> **해결된 주요 버그 (2026-06-28)**: 데모에서 티켓이 안 보이던 원인 = **dual-service 구조**. 페이지가 실제로 쓰는 `api/services/ticketService.js`(Supabase 직접 호출)에 데모 분기가 없어, 데모 모드여도 실 백엔드로 직행 → 빈 결과. **`isDemoMode()`는 정상 동작했음**(원인은 env 아님). `ticketService`·`tradeService`·`noticeService`·`faqService`·`inquiryService`·`adminService`·`categoryService`에 데모 분기를 추가하여 해결. Playwright로 홈·티켓·거래·채팅·마이·FAQ·공지·문의 전 페이지 데이터 표시 + 백엔드 호출 0 검증 완료.
>
> **교훈**: 서비스가 `services/`와 `api/services/`에 중복 존재하며 페이지마다 다른 쪽을 import한다. 데모/기능 추가 시 **페이지가 실제로 import 하는 파일**을 확인할 것. 응답 shape도 페이지마다 제각각(`res.data.data`, `raw.content` 등)이라 데모 분기는 소비 측 shape에 맞춰야 한다.

### 3-2. 🟡 포트폴리오 산출물

- [ ] **포트폴리오 본문 작성** — 프로젝트 소개, 해결한 문제, 아키텍처 다이어그램, 기술 스택, 맡은 역할, 트러블슈팅/배운 점, 링크(데모·GitHub)
- [ ] **스크린샷/GIF** — 홈·티켓 상세·채팅 거래 플로우·관리자 대시보드. 데스크톱 앱 프레임 + 모바일 모두
- [ ] **데모 시연 시나리오** — "[구매자로 둘러보기] → 티켓 탐색 → 거래 → 채팅" 흐름을 README/포트폴리오에 캡션으로

### 3-3. 🟠 품질·완성도

- [ ] **렌더 시각 QA** — 앱 프레임 리디자인을 실제 브라우저(데스크톱/모바일)에서 페이지별로 점검. (지금까지 빌드·HTTP만 검증, 렌더는 미확인)
- [ ] 관리자 데모 빈 화면 잔여 점검 — `AdminTradeManagement` 등 tradeService 의존 페이지의 데모 커버리지 확인
- [ ] (선택) 데모 커스텀 도메인 연결 (Vercel Settings → Domains)
- [ ] (선택) `docs/features.md` 미구현 항목 정리 — 키워드 필터 관리자 UI, 월별 통계 등은 "향후 과제"로 명시
- [ ] (선택) ESLint 경고 정리(no-unused-vars, a11y 등 비차단성)

---

## 4. 현재 상태 메모

- **데모 배포 = 워킹트리 기준**(git 아님). Vercel은 로컬 파일을 업로드하므로 미커밋 상태도 배포된다.
- **demo 모드 진단**: 배포 번들에서 `isDemoMode`가 `false`면 실제 백엔드를 호출해 데이터가 0이 된다. `vercel.json` buildCommand가 `npm run build:demo`인지 항상 확인.
- 데모 데이터 변경 후 검증: `node --input-type=module -e "import {demoTickets} from './src/demo/demoData.js'; ..."` (단, 서비스 파일은 확장자 없는 import라 node 직접 실행 불가 — 데이터 파일만 가능)
- 캐시 주의: 데모 재배포 후 브라우저 강력 새로고침(⌘+Shift+R) 필요.

---

## 5. 주요 레퍼런스

| 항목 | 위치 |
|---|---|
| 데모 데이터 | `frontend/src/demo/demoData.js` |
| 데모 로그인 분기 | `frontend/src/contexts/AuthContext.js`, `components/LoginForm.js` |
| 앱 프레임 셸 | `frontend/src/App.js` (`AppShell`) |
| Vercel 빌드 설정 | `frontend/vercel.json` (`buildCommand: npm run build:demo`) |
| 배포 시크릿 처리 | `deploy/render/render.yaml` (`sync: false`) |
| 프로젝트 구조·도메인 | `.claude/context.md` |
| 구현 기능 목록 | `docs/features.md` |
