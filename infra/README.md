# Passit Infra (Terraform)

AWS ECS Fargate 기반 인프라 코드입니다. 실제 `apply` 없이 `validate` / `plan` 수준으로 설계를 검증합니다.

## 모듈 구조

```
infra/
├── modules/
│   ├── network/    ← VPC, Subnet, IGW, NAT Gateway, Security Group
│   ├── data/       ← RDS MySQL 8.0, ElastiCache (Redis)
│   ├── ecs/        ← ECR, ECS Fargate, ALB, Task Definitions
│   └── cdn/        ← S3 (프론트엔드), CloudFront
└── envs/
    └── dev/        ← dev 환경 조합 (모듈 호출)
```

## 아키텍처

```
[CloudFront]
    │
    ├── /* (정적)  →  [S3 Frontend]
    └── /api/*     →  [ALB]
                           │
                    [ECS Fargate Cluster]
                    ├── service-account :8081
                    ├── service-ticket  :8082
                    ├── service-trade   :8083
                    ├── service-chat    :8084
                    └── service-cs      :8085
                           │
                    [RDS MySQL 8.0]  +  [ElastiCache Redis]
```

## 검증 (validate only)

```bash
cd infra/envs/dev
terraform init -backend=false
terraform validate
```

> apply는 실행하지 않습니다. 비용 발생 방지.
