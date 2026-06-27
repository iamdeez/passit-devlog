# Tasks: source-integration

> Branch: 001-source-integration | Date: 2026-06-19 | Plan: [plan.md](./plan.md)

---

## 전제 조건

- [x] spec.md의 모든 `[NEEDS CLARIFICATION]` 항목이 해소되었는가?
- [x] plan.md의 Constitution Gates가 모두 통과되었는가?
- [x] `/Users/krystal/workspace/Passit/` 디렉토리에 소스코드가 존재하는가?

---

## 태스크 목록

### Phase 1. 기반 설정

- [x] **T031** — .gitignore 업데이트 및 backend/ frontend/ 디렉토리 생성
  - 구현 파일: `.gitignore`, `backend/.gitkeep`
  - 관련 요구사항: `FR-007`, `NFR-001`
  - 상세:
    1. `.gitignore`에 빌드 산출물 제외 패턴 추가 (`backend/**/build/`, `backend/**/.gradle/`, `backend/**/bin/`, `backend/**/out/`, `frontend/node_modules/`, `frontend/build/` 등)
    2. `backend/` 디렉토리 생성 (git 추적용 `.gitkeep` 임시 파일)
  - 완료 기준: `.gitignore`에 패턴이 추가되고 `backend/` 디렉토리가 존재한다.

---

### Phase 2. 백엔드 소스코드 복사

> 각 태스크는 독립적으로 실행 가능하다 `[P]`.

- [x] **T032** `[P]` — service-account 복사
  - 구현 파일: `backend/service-account/`
  - 관련 요구사항: `FR-001`
  - 상세:
    - 소스: `/Users/krystal/workspace/Passit/service-account/`
    - 대상: `backend/service-account/`
    - 제외: `build/`, `.gradle/`, `bin/`, `out/`, `*.class`
    - 포함 확인: `src/`, `build.gradle`, `settings.gradle`, `Dockerfile`
  - 완료 기준: `backend/service-account/src/` 디렉토리가 존재하고 `.java` 파일이 추적된다.

- [x] **T033** `[P]` — service-ticket 복사
  - 구현 파일: `backend/service-ticket/`
  - 관련 요구사항: `FR-002`
  - 상세: 소스 `/Users/krystal/workspace/Passit/service-ticket/` → `backend/service-ticket/`, 제외 패턴 동일
  - 완료 기준: `backend/service-ticket/src/` 디렉토리가 존재하고 `.java` 파일이 추적된다.

- [x] **T034** `[P]` — service-trade 복사
  - 구현 파일: `backend/service-trade/`
  - 관련 요구사항: `FR-003`
  - 상세: 소스 `/Users/krystal/workspace/Passit/service-trade/` → `backend/service-trade/`, 제외 패턴 동일
  - 완료 기준: `backend/service-trade/src/` 디렉토리가 존재하고 `.java` 파일이 추적된다.

- [x] **T035** `[P]` — service-chat 복사
  - 구현 파일: `backend/service-chat/`
  - 관련 요구사항: `FR-004`
  - 상세: 소스 `/Users/krystal/workspace/Passit/service-chat/` → `backend/service-chat/`, 제외 패턴 동일
  - 완료 기준: `backend/service-chat/src/` 디렉토리가 존재하고 `.java` 파일이 추적된다.

- [x] **T036** `[P]` — service-cs 복사
  - 구현 파일: `backend/service-cs/`
  - 관련 요구사항: `FR-005`
  - 상세: 소스 `/Users/krystal/workspace/Passit/service-cs/` → `backend/service-cs/`, 제외 패턴 동일
  - 완료 기준: `backend/service-cs/src/` 디렉토리가 존재하고 `.java` 파일이 추적된다.

---

### Phase 3. 프론트엔드 소스코드 복사

- [x] **T037** — frontend 복사
  - 구현 파일: `frontend/`
  - 관련 요구사항: `FR-006`, `FR-007`
  - 상세:
    - 소스: `/Users/krystal/workspace/Passit/frontend/`
    - 대상: `frontend/`
    - 제외: `node_modules/`, `build/`, `playwright-report/`, `test-results/`, `.env.local`, `.env.*.local`
    - 포함 확인: `src/`, `public/`, `package.json`, `vercel.json`, `playwright.config.js`
  - 완료 기준: `frontend/src/` 디렉토리가 존재하고 `.js`/`.jsx` 파일이 추적된다. `node_modules/`는 추적되지 않는다.

---

### Phase 4. 문서화 및 마무리

- [x] **T038** — features.md 작성
  - 구현 파일: `docs/features.md`
  - 관련 요구사항: `FR-008`
  - 상세: 서비스별 구현 기능 목록을 요구사항 우선순위(M/S/C)와 함께 정리. spec.md의 "구현 기능 현황" 테이블을 기반으로 작성.
  - 완료 기준: `docs/features.md`가 존재하고 5개 서비스 + 프론트엔드 기능이 기술된다.

- [x] **T039** — README.md 업데이트
  - 구현 파일: `README.md`
  - 상세:
    - "소스코드 구조" 섹션 추가 (backend/service-*/src, frontend/src 역할 설명)
    - "로컬 빌드" 섹션 추가 (각 서비스 `./gradlew bootRun`, 프론트 `npm start`)
    - 기존 "빠른 시작" 섹션은 유지
  - 완료 기준: README에 소스코드 디렉토리 구조와 빌드 방법이 포함된다.

- [x] **T040** — 수용 기준 검증
  - 구현 파일: 없음 (검증만)
  - 상세:
    ```bash
    # SC-001: 소스 파일 추적 확인
    git ls-files backend/ | grep "\.java" | wc -l   # 0 이상
    git ls-files frontend/ | grep "\.jsx\?" | wc -l  # 0 이상

    # SC-002: 빌드 산출물 미추적
    git ls-files backend/ | grep "build/"           # 출력 없음

    # SC-003: node_modules 미추적
    git ls-files frontend/ | grep "node_modules"    # 출력 없음

    # SC-004: features.md 존재
    ls docs/features.md

    # SC-005: 하드코딩 시크릿 없음
    grep -rn "password\s*=\s*[^$]" backend/ --include="*.yml" --include="*.properties"
    ```
  - 완료 기준: 모든 SC가 기대값을 충족한다.

---

## 구현 완료 기준

- [x] 모든 태스크 체크박스가 완료 처리되었다.
- [x] `git ls-files backend/ frontend/` 실행 시 소스 파일이 추적된다.
- [x] `git ls-files backend/ | grep "build/"` 결과가 0건이다.
- [x] `git ls-files frontend/ | grep "node_modules"` 결과가 0건이다.
- [x] `docs/features.md`가 존재한다.
- [x] `git status`에 의도치 않은 파일이 없다.
