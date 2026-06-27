# Tasks: requirements-spec

> Branch: 002-requirements-spec | Date: 2026-06-19 | Plan: [plan.md](./plan.md)

## 전제 조건

- [x] spec.md의 모든 `[NEEDS CLARIFICATION]` 항목이 해소되었는가? (미결 사항 없음)
- [x] plan.md의 Constitution Gates가 모두 통과(또는 예외 기재)되었는가?
- [x] CHANGES.md에서 이전 작업(001-source-integration)의 "후속 작업 시 주의사항"을 확인했는가?
  - 원본 레포 업데이트 시 수동 재동기화 필요 (`rsync` 방식)
  - `ddl-auto: update` — 로컬 외 환경에서 `none`으로 변경 필요
  - `package-lock.json` 포함 → `npm ci` 가능

---

## 태스크 목록

> [P] 표시: 이전 태스크와 병렬 실행 가능

---

### Phase 1. 백엔드 서비스 검증

#### service-account

- [x] **T001** — 회원가입·이메일 인증·로그인 API 검증
  - 구현 파일: `backend/service-account/src/main/java/com/company/service_account/`
  - 관련 요구사항: `FR-001`, `FR-002`, `FR-003`
  - 상세:
    1. `POST /api/auth/register` → 201 + 이메일 발송 확인
    2. 이메일 인증 토큰으로 `/api/auth/verify` 호출 → 계정 활성화
    3. `POST /api/auth/login` → Access Token + Refresh Token 발급
    4. `POST /api/auth/refresh` → 기존 RT 무효화, 새 토큰 쌍 반환 (RTR)
    5. 동일 이메일 재가입 → 409 반환 확인
  - 완료 기준: SC-001, SC-002, SC-003 통과

- [x] **T002** `[P]` — 카카오 OAuth 로그인 검증
  - 구현 파일: `KakaoAuthService.java`, `KakaoCallbackPage.js`
  - 관련 요구사항: `FR-004`
  - 상세: 카카오 콜백 URL 처리 후 JWT 발급 확인, 신규 사용자 자동 가입 확인
  - 완료 기준: SC-004 통과

- [x] **T003** `[P]` — 계정 정보 수정·비밀번호 재설정 검증
  - 구현 파일: `UserController.java`, `AuthController.java`
  - 관련 요구사항: `FR-005`, `FR-006`
  - 상세:
    1. `PUT /api/users/me` 닉네임·프로필 이미지 수정 → DB 반영 확인
    2. `POST /api/auth/forgot-password` → 이메일 발송 확인
    3. 재설정 링크로 `POST /api/auth/reset-password` → 비밀번호 변경 확인
  - 완료 기준: SC-005, SC-006 통과

- [x] **T004** `[P]` — 관리자 회원 관리 API 검증
  - 구현 파일: `UserController.java` (admin endpoint)
  - 관련 요구사항: `FR-034`, `FR-035`
  - 상세:
    1. `GET /api/admin/users?email=&status=` → 필터링 목록 반환 확인
    2. `PUT /api/admin/users/{id}/status` → SUSPENDED 변경 후 해당 사용자 API 호출 → 403 반환 확인
  - 완료 기준: SC-028, SC-029 통과

- [x] **T005** `[P]` — 후기·별점 API 검증
  - 구현 파일: `ActivityController.java`
  - 관련 요구사항: `FR-037`, `FR-038`
  - 상세:
    1. 거래 COMPLETED 상태에서 `POST /api/activities/reviews` 등록
    2. 중복 리뷰 → 409 확인
    3. `GET /api/activities/me` → 수신 후기·평균 별점 확인
  - 완료 기준: SC-030, SC-031 통과

---

#### service-ticket

- [x] **T006** — 티켓 목록·상세 조회 API 검증
  - 구현 파일: `backend/service-ticket/src/main/java/`
  - 관련 요구사항: `FR-007`, `FR-008`
  - 상세:
    1. `GET /api/tickets?categoryId=&keyword=&status=&page=0&size=20` → 필터·페이징 확인
    2. `GET /api/tickets/{id}` → 이미지 URL·좌석·가격 포함 응답 확인
  - 완료 기준: SC-007, SC-008 통과

- [x] **T007** `[P]` — 티켓 등록·중복 방지·수정·삭제 검증
  - 구현 파일: `TicketController.java`, `TicketService.java`
  - 관련 요구사항: `FR-011`, `FR-012`, `FR-013`
  - 상세:
    1. `POST /api/tickets` (이미지 Presigned URL 방식) → 등록 성공, S3 URL 포함 확인
    2. 동일 판매자·좌석·날짜로 재등록 → 400 확인
    3. 본인 티켓 `PUT /api/tickets/{id}` 수정, `DELETE` 삭제 확인
    4. 타인 티켓 수정/삭제 → 403 확인
  - 완료 기준: SC-009, SC-010, SC-011 통과

- [x] **T008** `[P]` — 만료 티켓 삭제·정가 초과 경고 검증
  - 구현 파일: `TicketController.java` (admin), `TicketService.java`
  - 관련 요구사항: `FR-014`, `FR-015`
  - 상세:
    1. 관리자 API로 만료 티켓 삭제 처리 → 상태 변경 확인
    2. 정가 초과 가격 등록 시도 → 경고 응답 확인
  - 완료 기준: SC-012 통과

---

#### service-trade

- [x] **T009** — 양도 요청 ~ 완료 전체 흐름 검증
  - 구현 파일: `backend/service-trade/src/main/java/`
  - 관련 요구사항: `FR-016`, `FR-017`, `FR-018`, `FR-019`
  - 상세:
    1. `POST /api/deals` (구매자) → PENDING Deal 생성
    2. `PUT /api/deals/{id}/accept` (판매자) → ACCEPTED 전환
    3. `PUT /api/deals/{id}/reject` (판매자) → REJECTED 전환
    4. `POST /api/payments/{dealId}` (구매자) → PAID 전환
    5. 각 단계별 상태 조회 `GET /api/deals/{id}` 확인
  - 완료 기준: SC-013, SC-014, SC-015, SC-016 통과

- [x] **T010** `[P]` — 관리자 강제 완료/취소 & 목록 조회 검증
  - 구현 파일: `DealController.java` (admin)
  - 관련 요구사항: `FR-020`, `FR-021`
  - 상세:
    1. `PUT /api/admin/deals/{id}/complete` → COMPLETED 전환, 양측 알림 발송 확인
    2. `PUT /api/admin/deals/{id}/cancel` → CANCELLED 전환
    3. `GET /api/deals?role=buyer&status=PAID` 등 필터 조회
  - 완료 기준: SC-017, SC-018 통과

- [x] **T011** `[P]` — 동시성 제어 검증
  - 관련 요구사항: `NFR-021`
  - 상세: 동일 티켓에 2명의 구매자가 동시 Deal 생성 요청 → 1개만 성공, 나머지 409 확인 (낙관적 락 동작 확인)
  - 완료 기준: 동시 요청 테스트 시 1건만 PENDING 생성

---

#### service-chat

- [x] **T012** — 채팅방 생성 & WebSocket 메시지 송수신 검증
  - 구현 파일: `backend/service-chat/src/main/java/`
  - 관련 요구사항: `FR-023`, `FR-024`, `FR-025`
  - 상세:
    1. `POST /api/chat/rooms` → Room ID 반환
    2. WebSocket `/ws` 연결 (JWT 헤더 포함)
    3. STOMP subscribe `/topic/room/{roomId}`, send 메시지 → 수신 확인
    4. `GET /api/chat/rooms` → 최신 메시지·읽음 여부 포함 목록 반환 확인
  - 완료 기준: SC-019, SC-020, SC-022 통과

- [x] **T013** `[P]` — 채팅 내 양도 요청 액션 메시지 검증
  - 구현 파일: `DealController.java` (chat 서비스 내)
  - 관련 요구사항: `FR-024`
  - 상세:
    1. 채팅방에서 양도 요청 메시지 발송 → 시스템 메시지 타입 `DEAL_REQUEST` 수신 확인
    2. 판매자 채팅창에서 수락 버튼 클릭 → Deal 상태 ACCEPTED 전환 확인
  - 완료 기준: SC-021 통과

- [x] **T014** `[P]` — 금칙어 필터링 검증
  - 구현 파일: `KeywordFilterService.java`
  - 관련 요구사항: `FR-026`, `NFR-005`
  - 상세: "계좌번호", "카카오톡", "텔레그램" 등 키워드 포함 메시지 발송 → 블라인드 처리(500ms 이내) 확인
  - 완료 기준: 금칙어 포함 메시지가 수신 측에 블라인드로 전달됨

---

#### service-cs

- [x] **T015** — 신고 접수 & 관리자 처리 검증
  - 구현 파일: `backend/service-cs/src/main/java/`
  - 관련 요구사항: `FR-028`, `FR-029`
  - 상세:
    1. `POST /api/cs/reports` → Report ID 반환, 관리자 목록 노출 확인
    2. 관리자 `PUT /api/admin/cs/reports/{id}/process` (경고/정지/무효) → status 변경, 신고자 알림 확인
  - 완료 기준: SC-023, SC-024 통과

- [x] **T016** `[P]` — 문의 등록 & 답변 검증
  - 구현 파일: `InquiryUserController.java`, `InquiryAdminController.java`
  - 관련 요구사항: `FR-030`, `FR-031`
  - 상세:
    1. 사용자 `POST /api/cs/inquiries` → PENDING 상태, 목록 조회 확인
    2. 관리자 `PUT /api/admin/cs/inquiries/{id}/answer` → ANSWERED 전환 확인
  - 완료 기준: SC-025, SC-026 통과

- [x] **T017** `[P]` — 공지사항·FAQ CRUD 검증
  - 구현 파일: `NoticeController.java`, `FaqController.java`
  - 관련 요구사항: `FR-032`, `FR-033`
  - 상세:
    1. 관리자 공지 생성 `POST /api/admin/cs/notices` → 사용자 목록 즉시 노출 확인
    2. FAQ 생성·카테고리 분류·수정·삭제 확인
  - 완료 기준: SC-027 통과

- [x] **T018** `[P]` — 카테고리 관리 검증
  - 구현 파일: `CategoryController.java`
  - 관련 요구사항: `FR-036`
  - 상세: 대·중·소 카테고리 생성·수정·삭제 → 트리 구조 반환 확인, 중복명 방지, 사용 중 카테고리 삭제 방지 확인
  - 완료 기준: 카테고리 CRUD 전 케이스 정상 동작

---

### Phase 2. 프론트엔드 검증

- [x] **T019** — 화면 흐름 검증: 판매자 플로우
  - 구현 파일: `frontend/src/pages/`
  - 관련 요구사항: US-S01 ~ US-S08 관련 화면
  - 상세:
    1. 홈(`HomePage.js`) → 회원가입(`AuthPage.js`) → 이메일 인증
    2. 티켓 등록(`TicketCreatePage.jsx`) → S3 이미지 업로드 → 등록 완료
    3. 마이페이지(`MyTicketListPage.jsx`)에서 등록 티켓 확인
    4. 채팅창에서 구매자 양도 요청 수락/거절 버튼 동작 확인
  - 완료 기준: 판매자 시나리오 1 화면 흐름 오류 없음

- [x] **T020** `[P]` — 화면 흐름 검증: 구매자 플로우
  - 구현 파일: `frontend/src/pages/`
  - 관련 요구사항: US-B01~US-B16 관련 화면
  - 상세:
    1. 로그인 → 티켓 목록(`TicketListPage.jsx`) → 상세(`TicketDetailPage.jsx`)
    2. 채팅 개설 → 양도 요청 메시지 발송
    3. 결제(`BuyerPaymentPage.js`, `DealAcceptPage.js`) → 완료
    4. 거래 목록(`DealListPage.jsx`) 상태 확인
    5. 마이페이지에서 구매 내역 확인
  - 완료 기준: 구매자 시나리오 1 화면 흐름 오류 없음

- [x] **T021** `[P]` — 화면 흐름 검증: 관리자 플로우
  - 구현 파일: `frontend/src/pages/admin/`
  - 관련 요구사항: US-A01~US-A13 관련 화면
  - 상세:
    1. 관리자 로그인 → 대시보드(`AdminDashboardPage.js`)
    2. 회원 관리(`AdminUserManagementPage.js`) → 상태 변경
    3. 신고 관리(`AdminReportListPage.jsx`, `AdminReportDetailPage.jsx`) → 처리
    4. 문의 관리(`AdminInquiryListPage.jsx`, `AdminInquiryDetailPage.jsx`) → 답변
    5. 카테고리 관리(`AdminCategoryManagementPage.js`) → 트리 확인
    6. 공지 관리 / FAQ 관리 → CRUD 확인
  - 완료 기준: 관리자 시나리오 1~6 화면 흐름 오류 없음

- [x] **T022** `[P]` — 로딩·에러 UX 검증
  - 관련 요구사항: `NFR-028`, `NFR-029`
  - 상세:
    1. 느린 네트워크 조건에서 Skeleton UI 또는 로딩 스피너 노출 확인
    2. 네트워크 오류 시 사용자 친화적 에러 메시지 표시 확인 (`ErrorBoundary.js`)
    3. 401/403 응답 시 로그인 페이지 리다이렉트 확인 (`AuthContext.js`)
  - 완료 기준: 에러 케이스 화면에서 앱 크래시 없이 메시지 표시

---

### Phase 3. E2E 테스트 실행

- [x] **T023** — Playwright E2E 테스트 실행 및 통과 확인
  - 구현 파일: `frontend/e2e/`
  - 관련 요구사항: SC-013~022 (deal-flow, chat-flow, cs 시나리오)
  - 상세:
    1. 로컬 스택(`docker compose up -d`) 구동 확인
    2. `npm run test:e2e` 실행
    3. `chat-flow.spec.js`, `deal-flow.spec.js`, `cs-inquiry-flow.spec.js`, `cs-report-flow.spec.js` 전체 통과 확인
  - 완료 기준: 모든 E2E 테스트 PASS (실패 케이스 0건)

---

### Phase 4. 로컬 환경 설정 검증

- [x] **T024** — 로컬 Docker Compose 전체 스택 구동 검증
  - 구현 파일: `local/docker-compose.yml`, `local/setup.sh`
  - 관련 요구사항: `NFR-031` (개발 환경 분리)
  - 상세:
    1. `local/.env.example` → `.env` 복사 후 토큰 설정
    2. `bash setup.sh` → GHCR 이미지 pull 성공
    3. `docker compose up -d` → 전체 서비스 healthy 상태 확인
    4. `http://localhost` → 프론트엔드 정상 접근 확인
    5. 각 서비스 health endpoint 응답 확인 (`:8081/actuator/health` ~ `:8085/actuator/health`)
  - 완료 기준: 6개 컨테이너(Nginx, MySQL, LocalStack, Valkey, 5개 서비스 또는 이미지) 모두 정상 기동

- [x] **T025** `[P]` — LocalStack S3 에뮬레이터 연동 검증
  - 구현 파일: `local/localstack/init-s3.sh`
  - 관련 요구사항: `FR-011` (이미지 업로드)
  - 상세: 티켓 이미지 업로드 시 LocalStack S3에 파일 저장, Presigned URL로 접근 가능 확인
  - 완료 기준: S3 업로드 → URL 반환 → 이미지 표시까지 정상 동작

---

### Phase 5. 문서 마무리

- [x] **T026** — CHANGES.md 업데이트
  - 구현 파일: `docs/specs/v1.1.0/CHANGES.md`
  - 상세: 002-requirements-spec 완료 기록 추가 (변경 파일, 후속 작업 주의사항)
  - 완료 기준: CHANGES.md에 002 섹션 추가 완료

- [x] **T027** `[P]` — features.md 업데이트
  - 구현 파일: `docs/features.md`
  - 상세: 검증 과정에서 발견된 미구현·불일치 항목 반영
  - 완료 기준: 실제 구현 상태와 features.md 내용 일치

---

## 구현 완료 기준

- [x] T001~T018 모든 백엔드 API 검증 태스크의 체크박스가 완료 처리되었다.
- [x] T019~T022 프론트엔드 화면 흐름 검증이 완료되었다.
- [x] T023 Playwright E2E 테스트가 전체 PASS를 반환한다. (54 passed / 24 skipped / 0 failed)
- [x] T024~T025 로컬 Docker Compose 스택이 정상 구동된다.
- [x] T026~T027 문서 업데이트가 완료되었다.
- [x] `git status`에 의도치 않은 파일이 없다. (debug-*.png는 기존 추적 파일, .claude/는 AI 메모리 디렉토리)
