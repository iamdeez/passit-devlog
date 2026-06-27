# Plan: source-integration

> Branch: 001-source-integration | Date: 2026-06-19 | Spec: [spec.md](./spec.md)

---

## 사전 검증 (Constitution Gates)

> `{project}/.claude/constitution.md`가 존재하지 않으므로 기본 4개 조항을 사용한다.

- [x] **성능 원칙**: 소스코드 복사는 런타임 성능에 영향을 주지 않는다.
- [x] **호환성 원칙**: 기존 `local/`, `infra/`, `deploy/` 구조를 변경하지 않는다.
- [x] **테스트 원칙**: SC-001~005 수용 기준이 spec.md에 정의되어 있다.
- [x] **스펙 범위 원칙**: 소스코드 기능 추가·수정 없이 현재 상태 그대로 통합한다.

---

## 기술 컨텍스트

- **소스 위치**: `/Users/krystal/workspace/Passit/` (팀 레포 `CLD4-T2-IAMConan/Passit`)
- **통합 방식**: 직접 복사 (git submodule 아님) — 포트폴리오 자기 완결성 우선
- **백엔드**: Java 17, Spring Boot 3, Gradle
- **프론트엔드**: Node 18+, React 18, Create React App
- **빌드 산출물 제외**: `.gitignore` 업데이트로 처리

---

## 사전 영향도 분석

### 영향 파일 목록

| 파일 / 디렉토리 | 변경 유형 | 내용 |
|---|---|---|
| `backend/service-account/` | 신규 | account 서비스 소스 전체 |
| `backend/service-ticket/` | 신규 | ticket 서비스 소스 전체 |
| `backend/service-trade/` | 신규 | trade 서비스 소스 전체 |
| `backend/service-chat/` | 신규 | chat 서비스 소스 전체 |
| `backend/service-cs/` | 신규 | cs 서비스 소스 전체 |
| `frontend/` | 신규 | React 프론트엔드 소스 전체 |
| `.gitignore` | 수정 | 빌드 산출물 제외 패턴 추가 |
| `docs/features.md` | 신규 | 서비스별 구현 기능 요약 |
| `README.md` | 수정 | 소스코드 디렉토리 구조 섹션 추가 |

---

## 핵심 설계

### 디렉토리 구조

```
passit-devlog/
├── backend/
│   ├── service-account/      ← 인증·계정 (port 8081)
│   │   ├── src/
│   │   ├── build.gradle
│   │   └── ...
│   ├── service-ticket/       ← 티켓 관리 (port 8082)
│   ├── service-trade/        ← 거래·결제 (port 8083)
│   ├── service-chat/         ← 실시간 채팅 (port 8084)
│   └── service-cs/           ← 고객지원 (port 8085)
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vercel.json
├── local/                    ← Docker Compose 로컬 스택 (v1.0.0)
├── infra/                    ← Terraform IaC (v1.0.0)
├── deploy/                   ← Render·Supabase·Vercel 설정 (v1.0.0)
└── docs/
    ├── features.md           ← 구현 기능 요약 (신규)
    └── specs/
        └── v1.1.0/
```

### 복사 제외 항목

소스를 복사할 때 아래 항목을 **제외**한다.

| 항목 | 이유 |
|---|---|
| `build/` | Gradle 빌드 산출물 |
| `.gradle/` | Gradle 캐시 |
| `bin/` | IDE 컴파일 산출물 |
| `out/` | IDE 컴파일 산출물 |
| `*.class` | 컴파일된 바이너리 |
| `node_modules/` | npm 의존성 |
| `frontend/build/` | React 빌드 산출물 |
| `frontend/.astro/` | (해당 시) Astro 산출물 |
| `*.env` | 실제 환경변수 파일 |
| `playwright-report/` | E2E 테스트 결과 |
| `test-results/` | 테스트 결과 |

### .gitignore 추가 패턴

```gitignore
# Backend build artifacts
backend/**/build/
backend/**/.gradle/
backend/**/bin/
backend/**/out/
backend/**/*.class
backend/**/.env

# Frontend build artifacts  
frontend/node_modules/
frontend/build/
frontend/.env.local
frontend/.env.development.local
frontend/.env.test.local
frontend/.env.production.local
frontend/playwright-report/
frontend/test-results/
```

---

## 인터페이스 계약

이 통합은 기존 인터페이스를 변경하지 않는다.

- `local/docker-compose.yml`이 참조하는 GHCR 이미지 태그는 변경되지 않는다.
- `infra/` Terraform 코드는 변경되지 않는다.
- `deploy/render/render.yaml`의 이미지 경로는 변경되지 않는다.

소스코드와 Docker Compose 이미지는 **독립적**이다. 로컬 개발 스택은 GHCR 이미지를 사용하고, 소스코드는 직접 빌드 또는 포트폴리오 열람 용도로 구분된다.

---

## 테스트 전략

| SC 식별자 | 테스트 유형 | 시나리오 | 입력 | 기대 결과 |
|---|---|---|---|---|
| SC-001 | Shell 검증 | 소스 파일 추적 확인 | `git ls-files backend/ frontend/` | `.java`, `.js`, `.jsx` 파일 목록 출력 |
| SC-002 | Shell 검증 | 빌드 산출물 미추적 확인 | `git ls-files backend/ \| grep "build/"` | 출력 없음 (0건) |
| SC-003 | Shell 검증 | node_modules 미추적 확인 | `git ls-files frontend/ \| grep "node_modules"` | 출력 없음 (0건) |
| SC-004 | 파일 존재 확인 | features.md 생성 확인 | `ls docs/features.md` | 파일 존재 |
| SC-005 | 보안 검증 | 하드코딩 시크릿 없음 | `grep -rn "password\s*=" backend/ --include="*.yml"` | `${...}` 패턴만 출력 |

---

## 기타 고려사항

### 소스코드 복사 방식 결정 근거

| 방식 | 장점 | 단점 | 결정 |
|---|---|---|---|
| **직접 복사** | 자기 완결형, 원본 레포 접근 불필요 | 원본과 동기화 필요 | ✅ 채택 |
| git submodule | 원본 히스토리 유지 | 열람자가 submodule init 필요, 팀 레포 공개 여부 의존 | ❌ |
| git subtree | 히스토리 일부 유입 | 복잡한 관리, 불필요한 히스토리 | ❌ |

포트폴리오 목적상 **열람자가 별도 설정 없이 코드를 볼 수 있는 것**이 우선이므로 직접 복사를 선택한다.

### 민감 정보 사전 검증

복사 전 아래를 확인한다.
- `application.yml`의 모든 설정값이 `${ENV_VAR:default}` 형태인지 확인 (확인 완료: 환경변수만 사용)
- `*.env` 파일이 각 서비스 `.gitignore`에 포함되어 있거나 존재하지 않는지 확인
