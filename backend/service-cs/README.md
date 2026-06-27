# service-cs — 고객지원 서비스

Passit 플랫폼의 고객지원(Customer Support) 마이크로서비스. 공지사항·FAQ·이용가이드·1:1 문의·신고 접수를 담당한다. (port `8085`)

## 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [API 엔드포인트](#api-엔드포인트)
- [로컬 실행](#로컬-실행)
- [환경 변수](#환경-변수)
- [알려진 부채](#알려진-부채)

## 주요 기능

| 도메인 | 기능 | 담당 컨트롤러 |
|---|---|---|
| 공지사항 | 목록·상세 조회 / CRUD(관리자) | `NoticeController` |
| FAQ | 목록·상세 조회 / CRUD(관리자) | `FaqController` |
| 이용가이드 | 가이드 조회·관리(관리자) | `GuideController` |
| 1:1 문의 | 등록·조회(사용자) / 답변(관리자) | `InquiryUserController`, `InquiryAdminController` |
| 신고 | 접수(사용자) / 목록·처리(관리자) | `ReportController` |
| CS 카테고리 | 카테고리 관리(관리자) | `CategoryController` |

## 기술 스택

- **Java** 17 · **Spring Boot** 3.2.x · **Spring Data JPA** · **Spring Validation**
- **PostgreSQL** (배포: Supabase) / 로컬: PostgreSQL
- **Gradle** 8.5 · **Docker**
- JWT 기반 인증 (전 서비스 공통 시크릿으로 토큰 검증)

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/actuator/health` | 헬스 체크 |
| GET | `/api/notices` | 공지사항 목록 |
| GET | `/api/cs/faqs` | FAQ 목록 |
| POST | `/api/cs/inquiries` | 1:1 문의 등록 |
| POST | `/api/cs/reports` | 신고 접수 |

> 관리자 엔드포인트(`/api/admin/cs/**`)는 `role=admin` 토큰을 요구한다.

## 로컬 실행

```bash
# 1) 환경 변수 설정
cp .env.example .env   # DB·JWT 값 입력

# 2) 실행
./gradlew bootRun
```

또는 루트 `local/` 의 Docker Compose 스택으로 전체 서비스와 함께 구동할 수 있다.

## 환경 변수

`.env.example` 참고. 주요 변수:

| 변수 | 설명 | 비고 |
|---|---|---|
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | PostgreSQL 연결 정보 | 로컬 기본값 제공 |
| `JWT_SECRET` | 서비스 간 토큰 검증 시크릿 | **전 서비스 동일 값**, 운영은 env 주입 |
| `SPRING_PROFILES_ACTIVE` | 프로파일 | `dev` / `prod` |

## 알려진 부채

- 자바 패키지명이 `com.company.template`로 남아 있다(템플릿에서 분기 시점의 잔재). 타 서비스(`com.company.account` 등)와 일관되도록 `com.company.cs`로 리네이밍 예정. — 관련: `.claude/context.md §7`
