# Spec: passit-devlog

> Version: v1.0.0 | Date: 2026-06-19

## 배경 및 목적

Passit은 공연·스포츠 티켓을 정가로 안전하게 중개하는 MSA 플랫폼이다. 5개의 Spring Boot 마이크로서비스(account, ticket, trade, cs, chat)와 React 프론트엔드로 구성된다.

`passit-devlog`는 이 Passit 프로젝트를 포트폴리오로 공개하기 위한 독립 프로젝트다. 세 가지 산출물을 목표로 한다.

1. **로컬 개발 스택**: Docker Compose로 전체 Passit 서비스를 한 명령에 로컬 실행
2. **기술 블로그 사이트**: 기능별 구현 과정을 문서화한 Astro 정적 블로그
3. **무료 클라우드 데모**: Render + Supabase + Vercel 조합으로 실제 동작하는 데모

---

## 1. 기능 요구사항 (Functional Requirements)

### Phase 1. 로컬 개발 스택

- **FR-001**: 단일 `docker compose up` 명령으로 전체 스택(MySQL + 5개 서비스 + Nginx + Valkey + LocalStack)이 구동되어야 한다
  - 완료 기준: `docker compose up` 후 모든 컨테이너 `healthy` 상태 확인

- **FR-002**: 각 서비스의 헬스체크 엔드포인트(`/api/health`)가 30초 내 정상 응답해야 한다
  - 완료 기준: `curl http://localhost:{port}/api/health` → 200 OK

- **FR-003**: Nginx가 CloudFront 동일한 path pattern으로 각 서비스에 라우팅해야 한다
  - `/api/auth/*`, `/api/users/*` → account-service:8081
  - `/api/tickets/*` → ticket-service:8082
  - `/api/trades/*`, `/api/deals/*` → trade-service:8083
  - `/api/chat/*`, `/ws/*` → chat-service:8084
  - `/api/cs/*`, `/api/notices/*`, `/api/faqs/*`, `/api/inquiries/*` → cs-service:8085
  - 완료 기준: 각 path로의 curl 요청이 올바른 서비스에 도달

- **FR-004**: LocalStack S3가 ticket-service의 이미지 업로드를 처리해야 한다
  - 완료 기준: 로컬에서 티켓 이미지 업로드 시 LocalStack S3에 저장 확인

- **FR-005**: 더미 데이터 SQL이 MySQL 초기화 시 자동으로 주입되어야 한다
  - 완료 기준: 서비스 구동 후 즉시 티켓 목록 조회 가능

- **FR-006**: `.env.example` 파일이 제공되어 환경 변수 설정 가이드 역할을 해야 한다
  - 완료 기준: `.env.example`만 보고 로컬 실행 가능

### Phase 2. 기술 블로그 사이트

- **FR-007**: Astro 기반 정적 블로그 사이트가 구축되어야 한다
  - 완료 기준: `npm run build` 성공, 정적 파일 생성

- **FR-008**: 아래 11개 포스팅이 MDX 형식으로 작성되어야 한다
  1. 프로젝트 개요 & MSA 아키텍처 설계
  2. 티켓 관리 서비스 구현
  3. 실시간 채팅 (WebSocket + STOMP)
  4. 거래 & 결제 플로우
  5. CS 고객지원 서비스
  6. JWT 인증 & 보안
  7. AWS VPC & RDS 아키텍처 설계
  8. Docker & ECS Fargate 컨테이너 배포 전략
  9. S3 + CloudFront 정적 파일 서빙
  10. GitHub Actions CI/CD 파이프라인
  11. 무료 클라우드 마이그레이션 (Render + Supabase + Vercel)
  - 완료 기준: 각 포스팅이 빌드 시 오류 없이 렌더링

- **FR-009**: 블로그가 Vercel에 자동 배포되어야 한다 (GitHub push → Vercel 자동 빌드)
  - 완료 기준: GitHub push 후 vercel.app 도메인에서 접근 가능

### Phase 3. 무료 클라우드 데모

- **FR-010**: 프론트엔드 demo mode(`REACT_APP_API_MODE=mock`)가 Vercel에 배포되어야 한다
  - 완료 기준: Vercel URL에서 mock 데이터로 UI 동작 확인
  - 비고: 백엔드 없이 UI/UX 시연 가능한 zero-cost 첫 단계

- **FR-011**: Supabase PostgreSQL로 마이그레이션된 스키마가 Render 서비스와 연결되어야 한다
  - 완료 기준: account-service, ticket-service Render 배포 후 회원가입/티켓 조회 동작

- **FR-012**: Render에 핵심 서비스 2개 이상(account, ticket)이 배포되어야 한다
  - 완료 기준: Render URL에서 API 호출 성공, 프론트엔드 실 API 모드 동작

---

## 2. 비기능 요구사항 (Non-Functional Requirements)

- **NFR-001**: 로컬 스택 초기 구동 시간 5분 이내 — 이미지 pull 완료 후 `docker compose up`에서 전 서비스 healthy까지
- **NFR-002**: 블로그 Lighthouse 성능 점수 90 이상 — Astro 정적 빌드 기본 성능 활용
- **NFR-003**: 민감 정보 미노출 — `.env` 파일은 `.gitignore` 처리, 실 API Key는 코드에 하드코딩 금지
- **NFR-004**: Mac(ARM) 및 Linux(AMD64) 호환 — GHCR 이미지에 `platform: linux/amd64` 명시, Rosetta 의존 없이 동작
- **NFR-005**: Terraform 코드 `terraform validate` 통과 — 실제 apply 없이 문법·구조 검증

---

## 3. 데이터 모델

로컬 스택 기준. Passit 기존 스키마를 그대로 사용한다.

```
MySQL 단일 DB: passit_db
  ├── users              (account-service 관리)
  ├── tickets            (ticket-service 관리)
  ├── deals              (trade-service 관리)
  ├── payments           (trade-service 관리)
  ├── chat_rooms         (chat-service 관리)
  ├── chat_messages      (chat-service 관리)
  ├── chat_members       (chat-service 관리)
  ├── inquiries          (cs-service 관리)
  ├── notices            (cs-service 관리)
  ├── faqs               (cs-service 관리)
  └── categories         (cs-service 관리)

LocalStack S3
  └── passit-bucket/
        └── tickets/{ticketId}/images/   (티켓 이미지)

Valkey (Redis-compatible)
  └── cs-service 캐시 (카테고리, 공지)
```

---

## 4. 서비스 구성 명세

### 로컬 포트 매핑

| 컨테이너 | 호스트 포트 | 컨테이너 포트 | 역할 |
|---|---|---|---|
| nginx | 80 | 80 | API Gateway (CloudFront 역할) |
| frontend | 3000 | 3000 | React 개발 서버 (선택) |
| mysql | 3307 | 3306 | 공용 DB |
| localstack | 4566 | 4566 | S3 에뮬레이터 |
| valkey | 6379 | 6379 | CS/Chat 캐시 |
| service-account | 8081 | 8081 | 인증·회원 관리 |
| service-ticket | 8082 | 8082 | 티켓 관리 |
| service-trade | 8083 | 8083 | 거래·결제 |
| service-chat | 8084 | 8084 | 채팅 |
| service-cs | 8085 | 8085 | 고객지원 |

### 사용 이미지

| 서비스 | 이미지 |
|---|---|
| service-account | `ghcr.io/cld4-t2-iamconan/service-account:latest` |
| service-ticket | `ghcr.io/cld4-t2-iamconan/service-ticket:latest` |
| service-trade | `ghcr.io/cld4-t2-iamconan/service-trade:latest` |
| service-chat | `ghcr.io/cld4-t2-iamconan/service-chat:latest` |
| service-cs | `ghcr.io/cld4-t2-iamconan/service-cs:latest` |

### Nginx 라우팅 규칙 (CloudFront Path Pattern 동일하게)

```
location /api/auth/       → http://service-account:8081
location /api/users/      → http://service-account:8081
location /api/tickets/    → http://service-ticket:8082
location /api/trades/     → http://service-trade:8083
location /api/deals/      → http://service-trade:8083
location /api/chat/       → http://service-chat:8084
location /ws/             → http://service-chat:8084 (WebSocket upgrade)
location /api/cs/         → http://service-cs:8085
location /api/notices/    → http://service-cs:8085
location /api/faqs/       → http://service-cs:8085
location /api/inquiries/  → http://service-cs:8085
```

---

## 5. 입력 검증 규칙

### `.env` 필수 항목

```
- MYSQL_ROOT_PASSWORD: 필수, 8자 이상
- MYSQL_USER: 필수, 기본값 passit_user
- MYSQL_PASSWORD: 필수, 기본값 passit_password
- MAIL_USERNAME: account-service SMTP 사용 시 필수
- MAIL_PASSWORD: account-service SMTP 사용 시 필수
- KAKAO_REST_API_KEY: Kakao 로그인 사용 시 필수 (로컬 테스트 시 생략 가능)
- FRONTEND_URL: 기본값 http://localhost:3000
- ADMIN_EMAIL: 기본값 admin@passit.com
- ADMIN_PASSWORD: 기본값 admin123!
```

---

## 6. 예외 처리 규칙

| 케이스 | 처리 방식 |
|---|---|
| GHCR 이미지 pull 실패 | `docker compose pull` 선행 안내 문서 제공, GHCR 로그인 가이드 포함 |
| MySQL healthcheck 미통과 | depends_on condition: service_healthy로 서비스 기동 대기 |
| Kakao OAuth 미설정 | account-service가 이메일 로그인만으로도 동작하도록 env 미설정 허용 |
| LocalStack 미구동 시 S3 업로드 | ticket-service에서 에러 반환 (로컬 기능 검증 시에만 필요) |
| Render 무료 티어 슬립 | 첫 요청 응답 지연 안내 문구를 블로그/데모 페이지에 명시 |

---

## 7. 엣지 케이스

- **Mac ARM(M1/M2)**: GHCR 이미지가 `linux/amd64`만 지원하는 경우 → `platform: linux/amd64` 명시로 Rosetta 2 사용
- **포트 충돌**: 3307, 4566 등 이미 사용 중인 경우 → `.env`에서 포트 변경 가능하도록 변수화
- **더미 데이터 중복 삽입**: MySQL 재시작 시 init SQL 재실행 → `INSERT IGNORE` 또는 idempotent SQL 사용
- **WebSocket 프록시**: Nginx에서 WebSocket upgrade 헤더 누락 시 채팅 연결 실패 → `Upgrade`, `Connection` 헤더 명시
- **프론트엔드 CORS**: Nginx 통한 API 호출 시 CORS 오류 → Nginx에서 CORS 헤더 추가 또는 서비스단 허용 설정
- **Valkey 연결 실패**: cs-service 기동 전 Valkey 준비 안 됨 → `depends_on: valkey: condition: service_healthy`

---

## 범위 외 (Out of Scope)

- AWS 실계정 배포 (`terraform apply`) — 비용 발생, 범위 제외
- EKS / ArgoCD 구성 — 기존 Passit infra 재현 아님, ECS 아키텍처 문서로 대체
- CI/CD 파이프라인 실제 구축 — 블로그 포스팅으로 설명만

---

## 미결 사항 (Open Questions)

없음. 모든 항목 해소됨.

## 결정 사항 (Decisions)

- **GHCR 접근**: 이미지가 private으로 확인됨. `GITHUB_TOKEN` (packages:read 권한)을 `.env`에 추가하고 `docker login ghcr.io`로 인증 후 pull. README에 PAT 발급 방법 안내 포함.

- **Phase 3 DB 전략**: MySQL → PostgreSQL 마이그레이션 스크립트를 작성하여 Supabase에 적용. account, ticket 서비스를 Render에 배포하여 실 API 동작하는 데모 구성.
