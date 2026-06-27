# Plan: passit-devlog

> Version: v1.0.0 | Date: 2026-06-19 | Spec: [spec.md](./spec.md)

---

## 1. 아키텍처

### 로컬 개발 스택 전체 구성

```
[브라우저 / curl]
        │
        ▼
  [Nginx :80]          ← CloudFront path routing 동일하게 재현
        │
        ├─ /api/auth/*, /api/users/*      → service-account :8081
        │                                         │
        │                                    [Valkey :6379]
        │
        ├─ /api/tickets/*                 → service-ticket  :8082
        │
        ├─ /api/trades/*, /api/deals/*    → service-trade   :8083
        │
        ├─ /api/chat/*, /ws/*             → service-chat    :8084
        │                                    (WebSocket upgrade)
        │
        └─ /api/cs/*, /api/notices/*,
           /api/faqs/*, /api/inquiries/*  → service-cs      :8085
                                                  │
                                             [Valkey :6379]

[MySQL :3307]        ← 5개 서비스 공용 DB (passit_db)
[LocalStack :4566]   ← S3 에뮬레이터 (티켓 이미지 업로드)
```

### 레이어 간 의존 방향

```
Nginx
  └─ depends on: 5 services (healthy)
5 services
  └─ depends on: MySQL (healthy)
service-account, service-cs
  └─ depends on: Valkey (healthy)
LocalStack
  └─ 독립 (service-ticket이 연결, healthcheck 불필요)
```

### 외부 의존성

| 의존성 | 버전 | 역할 |
|---|---|---|
| GHCR 이미지 | `ghcr.io/cld4-t2-iamconan/service-*:latest` | 5개 서비스 컨테이너 |
| GitHub PAT | packages:read 권한 | GHCR private 이미지 pull |
| MySQL | 8.0 | 공용 DB |
| Valkey | 7.2-alpine | account/cs 서비스 캐시 |
| LocalStack | latest | S3 에뮬레이터 |
| Nginx | alpine | API Gateway |

---

## 2. 폴더 구조

```
passit-devlog/
│
├── local/                       ← Phase 1: 로컬 개발 스택
│   ├── docker-compose.yml       ← 전체 스택 오케스트레이션
│   ├── .env.example             ← 환경 변수 가이드
│   ├── .env                     ← 실제 값 (gitignore)
│   ├── setup.sh                 ← GHCR 로그인 + pull 헬퍼
│   ├── nginx/
│   │   └── nginx.conf           ← path routing + WebSocket proxy
│   ├── localstack/
│   │   └── init-s3.sh           ← passit-bucket 생성
│   └── mysql/
│       └── init/                ← Passit init SQL 복사 (14개)
│
├── blog/                        ← 기술 블로그 (수동 작성 — 자동화 범위 외)
│
├── infra/                       ← Phase 2: Terraform (plan level)
│   ├── modules/
│   │   ├── network/             ← VPC, Subnet, IGW, NAT, SG
│   │   ├── data/                ← RDS MySQL, ElastiCache
│   │   ├── ecs/                 ← ECR, ECS Fargate, ALB
│   │   └── cdn/                 ← S3, CloudFront
│   ├── envs/
│   │   └── dev/
│   │       ├── main.tf
│   │       ├── variables.tf
│   │       └── outputs.tf
│   └── README.md
│
├── deploy/                      ← Phase 4: 무료 클라우드 배포
│   ├── supabase/
│   │   └── migrations/
│   │       └── 001_init_schema.sql   ← MySQL → PostgreSQL 변환
│   └── render/
│       └── render.yaml              ← account + ticket 서비스 정의
│
├── docs-internal/               ← 설계 문서 (이 폴더)
├── .gitignore
└── README.md
```

---

## 3. 핵심 기술 결정

| 항목 | 선택 | 이유 | 대안 |
|---|---|---|---|
| 로컬 오케스트레이션 | Docker Compose v2 | 이미 Passit에서 사용 중, 이미지 GHCR 존재 | Kubernetes(로컬 과도) |
| API 게이트웨이 | Nginx alpine | 경량, WebSocket proxy 지원, CloudFront 행동 재현 | Traefik(설정 복잡) |
| S3 에뮬레이터 | LocalStack | AWS SDK 코드 그대로 테스트 가능 | MinIO(S3 호환이나 LocalStack이 더 밀착) |
| IaC | Terraform | 기존 Passit infra와 동일 툴체인, validate만으로 포트폴리오 근거 확보 | AWS CDK(학습 곡선 높음) |
| 무료 DB | Supabase | PostgreSQL 무료, 대시보드 UI 제공 | PlanetScale(MySQL이나 유료화), Neon |
| 무료 백엔드 | Render | Docker 이미지 직접 배포 가능, 무료 티어 존재 | Railway(유료 전환됨), Fly.io |
| 프론트엔드 배포 | Vercel | CRA 프로젝트 지원, GitHub 연동 자동 배포 | Netlify |

---

## 4. 주요 설계 결정 상세

### 4-1. Nginx WebSocket 프록시

STOMP over WebSocket을 프록시하려면 `Upgrade`, `Connection` 헤더 전달이 필수다.

```nginx
location /ws/ {
    proxy_pass http://service-chat:8084;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 3600s;
}
```

### 4-2. Valkey 통합 (account + cs 공유)

개별 서비스 docker-compose에서는 Valkey를 각각 띄웠으나, 통합 스택에서는 Valkey 1개를 공유한다. 포트 충돌을 피하기 위해 컨테이너 내부 통신(6379)만 사용하고 호스트 포트는 6379로 단일 노출한다.

### 4-3. GHCR 인증 흐름

`setup.sh`이 `GITHUB_TOKEN`을 읽어 `docker login`을 수행한 후 `docker compose pull`을 실행한다. `docker compose up` 전에 반드시 실행해야 한다.

```bash
# setup.sh
echo "${GITHUB_TOKEN}" | docker login ghcr.io -u "${GITHUB_ACTOR}" --password-stdin
docker compose pull
```

### 4-4. MySQL init SQL idempotent 처리

Passit의 `99-insert-dummy-data.sql`에서 `INSERT` 구문을 `INSERT IGNORE`로 변환하여 MySQL 볼륨이 유지된 상태로 재시작해도 중복 오류가 나지 않도록 한다.

### 4-5. Terraform 모듈 구조 (ECS 기반, EKS 아님)

기존 Passit infra는 EKS를 사용하지만, 포트폴리오 블로그용 인프라 코드는 비용이 적고 이해하기 쉬운 ECS Fargate 기반으로 설계한다.

```
network → data → ecs → cdn
(의존성 방향: 오른쪽이 왼쪽 output 참조)
```

### 4-6. MySQL → PostgreSQL 마이그레이션 전략

Passit 스키마는 MySQL 방언을 사용하므로 Supabase(PostgreSQL) 적용 전 변환이 필요하다.

| 변환 항목 | MySQL | PostgreSQL |
|---|---|---|
| 자동 증가 | `AUTO_INCREMENT` | `SERIAL` 또는 `GENERATED ALWAYS AS IDENTITY` |
| 문자열 타입 | `VARCHAR`, `TEXT` | 동일 (호환) |
| 불리언 | `TINYINT(1)` | `BOOLEAN` |
| 현재 시간 | `NOW()` | `NOW()` (동일) |
| 백틱 식별자 | `` `column` `` | `"column"` |

---

## 5. 테스트 전략

### Phase 1 (로컬 스택) 검증

```bash
# 전체 스택 기동
./local/setup.sh
docker compose -f local/docker-compose.yml up -d

# 헬스체크
curl http://localhost/api/auth/health       # → account via Nginx
curl http://localhost:8081/api/health       # → account 직접
curl http://localhost:8082/api/health       # → ticket
curl http://localhost:8083/api/health       # → trade
curl http://localhost:8084/api/health       # → chat
curl http://localhost:8085/api/health       # → cs

# WebSocket (wscat 사용)
wscat -c ws://localhost/ws/chat

# S3 업로드 확인
aws --endpoint-url=http://localhost:4566 s3 ls s3://passit-bucket/
```

### Phase 2 (Terraform) 검증

```bash
cd infra/envs/dev
terraform init -backend=false
terraform validate
terraform plan -var-file=../../vars/dev.tfvars  # 실제 apply 없음
```

---

## 6. .gitignore 및 보안 전략

```gitignore
# 환경 변수 (민감 정보)
local/.env
deploy/**/.env

# 빌드 산출물
blog/dist/
blog/.astro/
blog/node_modules/

# Terraform state (apply 안 하므로 없지만 예방)
infra/**/.terraform/
infra/**/terraform.tfstate*
infra/**/*.tfvars   ← 실제 값이 들어가면 gitignore
```

---

## 7. README 작성 기준

루트 README는 다음 순서로 작성한다.

1. 프로젝트 소개 (1-2 문장)
2. 아키텍처 다이어그램 (텍스트)
3. 빠른 시작 (local/ 실행 3단계)
4. 블로그 링크 (수동 작성 완료 후 채움)
5. 데모 링크
6. 기술 스택 뱃지
