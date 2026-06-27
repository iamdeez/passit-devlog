# Tasks: passit-devlog

> Version: v1.0.0 | Date: 2026-06-19 | Plan: [plan.md](./plan.md)

---

## 전제 조건

- [x] spec.md의 모든 `[NEEDS CLARIFICATION]` 항목이 해소되었는가?
- [x] plan.md의 기술 결정이 모두 확정되었는가?
- [ ] GITHUB_TOKEN (packages:read)이 발급되어 있는가?
- [ ] Docker Desktop이 실행 중인가?

---

## Phase 1. 프로젝트 기반 설정

- [x] **T001** — 루트 .gitignore + README 뼈대
  - 파일: `.gitignore`, `README.md`
  - 설명: `.gitignore`에 `local/.env`, `blog/node_modules/`, `blog/dist/`, `infra/**/.terraform/`, `infra/**/terraform.tfstate*` 추가. README는 제목·소개·빠른 시작 섹션 뼈대만 작성 (내용은 Phase 완료 후 채움)
  - 완료 기준: `git status`에 `.env`가 tracked로 잡히지 않음

---

## Phase 2. 로컬 개발 스택

- [x] **T002** — MySQL init SQL 준비
  - 파일: `local/mysql/init/` (14개 SQL 파일)
  - 설명: Passit `common/init/` 폴더의 SQL 14개를 `local/mysql/init/`으로 복사. `99-insert-dummy-data.sql`의 `INSERT INTO` 구문을 `INSERT IGNORE INTO`로 일괄 변환하여 MySQL 재시작 시 중복 에러 방지
  - 완료 기준: SQL 파일 14개 존재, `INSERT IGNORE` 적용 확인

- [x] **T003** — .env.example 작성
  - 파일: `local/.env.example`
  - 설명: 아래 항목을 주석과 함께 작성. 필수/선택 구분 명시.
    ```
    # GHCR 인증 (필수 - packages:read 권한 PAT)
    GITHUB_TOKEN=
    GITHUB_ACTOR=
    # DB 설정
    MYSQL_ROOT_PASSWORD=rootpassword
    MYSQL_USER=passit_user
    MYSQL_PASSWORD=passit_password
    DB_NAME=passit_db
    MYSQL_PORT=3307
    # 서비스 포트 (충돌 시 변경)
    ACCOUNT_PORT=8081
    TICKET_PORT=8082
    TRADE_PORT=8083
    CHAT_PORT=8084
    CS_PORT=8085
    # 프론트엔드
    FRONTEND_URL=http://localhost:3000
    # Admin 계정
    ADMIN_EMAIL=admin@passit.com
    ADMIN_PASSWORD=admin123!
    ADMIN_NAME=관리자
    ADMIN_NICKNAME=admin
    # 이메일 (선택 - 생략 시 이메일 발송 기능 비활성)
    MAIL_USERNAME=
    MAIL_PASSWORD=
    # Kakao OAuth (선택 - 생략 시 이메일 로그인만 동작)
    KAKAO_REST_API_KEY=
    KAKAO_CLIENT_SECRET=
    KAKAO_REDIRECT_URI=http://localhost:8081/api/auth/kakao/callback
    # AWS LocalStack
    AWS_ACCESS_KEY_ID=test
    AWS_SECRET_ACCESS_KEY=test
    AWS_REGION=ap-northeast-2
    AWS_S3_ENDPOINT=http://localstack:4566
    S3_BUCKET=passit-bucket
    ```
  - 완료 기준: 파일 존재, 모든 변수에 주석 포함

- [x] **T004** — docker-compose.yml 작성
  - 파일: `local/docker-compose.yml`
  - 설명: 아래 서비스를 하나의 compose 파일에 정의
    - `mysql`: image mysql:8.0, init SQL 볼륨 마운트, healthcheck
    - `valkey`: image valkey/valkey:7.2-alpine, healthcheck (ping)
    - `localstack`: image localstack/localstack, `SERVICES=s3`, init 스크립트 볼륨, healthcheck
    - `service-account`: GHCR 이미지, `platform: linux/amd64`, DB + Valkey + S3 env, depends_on mysql+valkey (healthy)
    - `service-ticket`: GHCR 이미지, `platform: linux/amd64`, DB + S3 env, depends_on mysql (healthy)
    - `service-trade`: GHCR 이미지, `platform: linux/amd64`, DB env, depends_on mysql (healthy)
    - `service-chat`: GHCR 이미지, `platform: linux/amd64`, DB env, depends_on mysql (healthy)
    - `service-cs`: GHCR 이미지, `platform: linux/amd64`, DB + Valkey env, depends_on mysql+valkey (healthy)
    - `nginx`: image nginx:alpine, conf 볼륨 마운트, port 80:80, depends_on 5 services
    - 모든 서비스에 `healthcheck` 설정 (Spring Boot: `curl -f http://localhost:{port}/api/health`)
    - 공통 네트워크 `passit-network` 정의
    - env_file: `.env`
  - 완료 기준: `docker compose config` 오류 없음

- [x] **T005** — nginx.conf 작성
  - 파일: `local/nginx/nginx.conf`
  - 설명: 아래 라우팅 규칙 구현
    - `location /api/auth/` → `proxy_pass http://service-account:8081`
    - `location /api/users/` → `proxy_pass http://service-account:8081`
    - `location /api/tickets/` → `proxy_pass http://service-ticket:8082`
    - `location /api/trades/` → `proxy_pass http://service-trade:8083`
    - `location /api/deals/` → `proxy_pass http://service-trade:8083`
    - `location /api/chat/` → `proxy_pass http://service-chat:8084`
    - `location /ws/` → WebSocket proxy (Upgrade + Connection 헤더, read_timeout 3600s)
    - `location /api/cs/` → `proxy_pass http://service-cs:8085`
    - `location /api/notices/` → `proxy_pass http://service-cs:8085`
    - `location /api/faqs/` → `proxy_pass http://service-cs:8085`
    - `location /api/inquiries/` → `proxy_pass http://service-cs:8085`
    - 공통: `proxy_set_header Host`, `X-Real-IP`, `X-Forwarded-For`
    - CORS 헤더: `Access-Control-Allow-Origin *` (로컬 전용)
  - 완료 기준: `nginx -t` 통과 (컨테이너 내에서)

- [x] **T006** — LocalStack S3 초기화 스크립트
  - 파일: `local/localstack/init-s3.sh`
  - 설명: LocalStack 기동 시 자동 실행되는 초기화 스크립트. `passit-bucket` S3 버킷 생성.
    ```bash
    #!/bin/bash
    awslocal s3 mb s3://passit-bucket
    awslocal s3api put-bucket-cors --bucket passit-bucket --cors-configuration '{...}'
    ```
  - 완료 기준: 스크립트 실행 후 `awslocal s3 ls` 결과에 `passit-bucket` 포함

- [x] **T007** — GHCR 로그인 헬퍼 스크립트
  - 파일: `local/setup.sh`
  - 설명: `.env`에서 `GITHUB_TOKEN`, `GITHUB_ACTOR`를 읽어 `docker login ghcr.io` 실행 후 `docker compose pull`까지 수행. 실패 시 안내 메시지 출력.
    ```bash
    #!/bin/bash
    set -e
    source .env
    echo "${GITHUB_TOKEN}" | docker login ghcr.io -u "${GITHUB_ACTOR}" --password-stdin
    docker compose pull
    echo "✅ Images pulled. Run: docker compose up -d"
    ```
  - 완료 기준: 스크립트 실행 후 이미지 pull 성공

- [x] **T008** — 로컬 스택 구동 검증
  - 파일: 없음 (실행 검증)
  - 설명: `docker compose up -d` 후 전 서비스 `healthy` 상태 확인. 헬스체크 명령 실행.
    ```bash
    # 상태 확인
    docker compose ps
    # 헬스체크
    curl http://localhost/api/auth/health
    curl http://localhost/api/tickets/health (또는 /api/health)
    # S3 확인
    aws --endpoint-url=http://localhost:4566 s3 ls
    ```
  - 완료 기준: 모든 컨테이너 healthy, 헬스체크 200 OK

---

## Phase 3. Terraform 인프라 코드

> [P] 표시 태스크는 T023과 병렬 작성 가능

- [x] **T023** — network 모듈
  - 파일: `infra/modules/network/main.tf`, `variables.tf`, `outputs.tf`
  - 설명: VPC (10.0.0.0/16), public subnet × 2 (AZ a/c), private subnet × 2, IGW, NAT Gateway, 라우팅 테이블, SG (ALB, ECS, RDS, Bastion)
  - 완료 기준: `terraform validate` 통과

- [x] **T024** — data 모듈 `[P]`
  - 파일: `infra/modules/data/main.tf`, `variables.tf`, `outputs.tf`
  - 설명: RDS MySQL 8.0 (db.t3.micro, Multi-AZ=false, 프리티어 대상), DB Subnet Group, ElastiCache Valkey (cache.t3.micro), Cache Subnet Group
  - 완료 기준: `terraform validate` 통과

- [x] **T025** — ecs 모듈 `[P]`
  - 파일: `infra/modules/ecs/main.tf`, `variables.tf`, `outputs.tf`
  - 설명: ECR 레포지토리 5개, ECS Cluster, 5개 서비스의 Task Definition (Fargate, 0.25vCPU/0.5GB), ECS Service, ALB + Target Group + Listener, CloudWatch Logs
  - 완료 기준: `terraform validate` 통과

- [x] **T026** — cdn 모듈 `[P]`
  - 파일: `infra/modules/cdn/main.tf`, `variables.tf`, `outputs.tf`
  - 설명: S3 버킷 (정적 파일용), OAC, CloudFront Distribution (S3 origin + ALB origin), Path Pattern 라우팅 (spec.md §4 라우팅 규칙과 동일)
  - 완료 기준: `terraform validate` 통과

- [x] **T027** — dev 환경 main.tf 조합
  - 파일: `infra/envs/dev/main.tf`, `variables.tf`, `outputs.tf`
  - 설명: network → data → ecs → cdn 순서로 모듈 호출. 각 모듈의 output을 다음 모듈의 input으로 전달. `backend "local" {}` 설정 (apply 안 하므로 로컬 state)
  - 완료 기준: `terraform init -backend=false && terraform validate` 통과

---

## Phase 4. 무료 클라우드 배포

- [x] **T028** — MySQL → PostgreSQL 마이그레이션 SQL
  - 파일: `deploy/supabase/migrations/001_init_schema.sql`
  - 설명: `local/mysql/init/` SQL 파일들을 PostgreSQL 문법으로 변환
    - `AUTO_INCREMENT` → `SERIAL`
    - 백틱 식별자 → 쌍따옴표
    - `TINYINT(1)` → `BOOLEAN`
    - `ENGINE=InnoDB` 등 MySQL 전용 옵션 제거
    - `INSERT IGNORE` → `INSERT ... ON CONFLICT DO NOTHING`
  - 완료 기준: Supabase SQL Editor에서 실행 시 오류 없음

- [x] **T029** — render.yaml 작성
  - 파일: `deploy/render/render.yaml`
  - 설명: account-service, ticket-service 2개 Web Service 정의. GHCR 이미지 사용, 환경변수 목록 (Supabase DB URL 포함), `plan: free` 설정.
  - 완료 기준: 파일 문법 정상, Render 대시보드에서 import 가능

- [x] **T030** — 프론트엔드 Vercel demo mode 배포
  - 파일: Passit `frontend/` 프로젝트의 Vercel 설정 (passit-devlog repo 외부)
  - 설명: Vercel에 Passit frontend를 연결. 환경변수 `REACT_APP_API_MODE=mock`, `REACT_APP_DEMO_MODE=true` 설정하여 mock 데이터로 동작하는 demo 배포.
  - 완료 기준: Vercel URL에서 UI 동작, 티켓 목록 mock 데이터 표시

---

## 구현 완료 기준

- [ ] 모든 Task 체크박스가 완료되었다.
- [ ] `docker compose up` 후 전 서비스 healthy 상태이다.
- [ ] `curl http://localhost/api/auth/health` → 200 OK
- [ ] `cd infra/envs/dev && terraform validate` 통과한다.
- [ ] Vercel demo mode URL에서 Passit UI가 동작한다.
- [ ] `git status`에 `.env` 파일이 tracked로 잡히지 않는다.
