# passit-devlog

공연·스포츠 티켓 실시간 중개 플랫폼 **Passit**을 포트폴리오 공개용으로 재현한 프로젝트.

## 아키텍처

```
[브라우저]
    │
    ▼
[Nginx :80]          ← CloudFront path routing 로컬 재현
    │
    ├─ /api/auth/*, /api/users/*      → service-account :8081
    ├─ /api/tickets/*                 → service-ticket  :8082
    ├─ /api/trades/*, /api/deals/*    → service-trade   :8083
    ├─ /api/chat/*, /ws/*             → service-chat    :8084  (WebSocket)
    └─ /api/cs/*, /api/notices/*, ... → service-cs      :8085

[MySQL :3307]      ← 공용 DB
[LocalStack :4566] ← S3 에뮬레이터
[Valkey :6379]     ← 캐시 (account, cs)
```

## 빠른 시작 (로컬 개발 스택)

```bash
# 1. 환경 변수 설정
cp local/.env.example local/.env
# GITHUB_TOKEN, GITHUB_ACTOR 입력 (packages:read 권한 PAT 필요)

# 2. GHCR 로그인 & 이미지 pull
cd local && bash setup.sh

# 3. 전체 스택 구동
docker compose up -d
```

> GITHUB PAT 발급: GitHub → Settings → Developer settings → Personal access tokens → `read:packages` 권한 선택

## 소스코드 구조

```
passit-devlog/
├── backend/
│   ├── service-account/   ← 인증·회원 관리 (JWT, 카카오 OAuth, 이메일 인증)
│   ├── service-ticket/    ← 티켓 등록·조회·수정·삭제 (S3 이미지)
│   ├── service-trade/     ← 양도 요청·수락·결제
│   ├── service-chat/      ← WebSocket/STOMP 실시간 채팅
│   └── service-cs/        ← 공지·FAQ·문의·신고 (고객지원)
├── frontend/              ← React 18 (Tailwind CSS, Material You, STOMP)
│   ├── src/pages/         ← 홈·티켓·채팅·마이페이지·관리자
│   └── src/demo/          ← Demo Mode (백엔드 없이 mock 데이터로 동작)
├── local/                 ← Docker Compose 로컬 개발 스택
├── infra/                 ← Terraform IaC (AWS ECS Fargate)
└── deploy/                ← Render·Supabase·Vercel 무료 배포 설정
```

구현 기능 전체 목록 → [`docs/features.md`](./docs/features.md)

## 로컬 빌드 (소스에서 직접 실행)

각 서비스는 Docker Compose 이미지 없이 소스에서 직접 실행할 수 있다.

```bash
# 백엔드 서비스 (Java 17, Gradle 필요)
cd backend/service-account
./gradlew bootRun

# 프론트엔드 (Node 18+ 필요)
cd frontend
npm install && npm start
```

> 환경변수는 각 서비스의 `.env.example`을 참고하여 설정한다.

## 데모

**라이브 데모**: <!-- TODO: 배포된 Vercel demo URL 입력 --> _(준비 중)_

백엔드 없이 mock 데이터로 동작하는 **Demo Mode**로 로컬에서 바로 실행할 수 있다.

```bash
cd frontend
npm install
npm run start:demo   # REACT_APP_DEMO_MODE=true — 로그인·티켓·거래·채팅 mock 데이터로 동작
```

## 기술 스택

| 영역         | 기술                                                      |
| ------------ | --------------------------------------------------------- |
| 백엔드       | Spring Boot 3, MySQL 8 (로컬) / PostgreSQL (배포), Valkey/Redis |
| 프론트엔드   | React 18, Tailwind CSS, Material You, STOMP/WebSocket      |
| 로컬 인프라  | Docker Compose, Nginx, LocalStack                         |
| AWS 아키텍처 | ECS Fargate, RDS, S3, CloudFront (Terraform 코드)         |
| 무료 배포    | Vercel (frontend), Render (backend), Supabase (DB)        |
