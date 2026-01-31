# 프로젝트 TODO 리스트

**작성일**: 2026-01-22
**마지막 업데이트**: 2026-01-31 (v1.5.0 - Phase 6 AI 챗봇 완료)
**기준 문서**: PROJECT_ANALYSIS_REPORT.md v2.2.0
**프로젝트**: paytools.work (급여 계산기)

---

## 📊 진행 상황 요약

| 단계 | 태스크 수 | 완료 | 진행률 | 비고 |
|------|-----------|------|--------|------|
| Phase 2 (핵심) | 4 | 4 | 100% | Python |
| Phase 2.5 (계산 재설계) | 5 | 5 | 100% | Python |
| Phase 3.0 (긴급 버그) | 2 | 2 | 100% | Python |
| Phase 3.1 (역산) | 1 | 1 | 100% | Python |
| Phase S1 (Spring 초기설정) | 3 | 3 | 100% | ✅ 완료 |
| Phase S2 (도메인 전환) | 4 | 4 | 100% | ✅ 완료 |
| **Phase S3 (API 전환+검증)** | **3** | **3** | **100%** | **✅ 완료** |
| **Phase 3.5 (근무자 등록)** | **5** | **4** | **80%** | **✅ 대부분 완료** |
| **Phase 3.6 (급여 고도화)** | **4** | **4** | **100%** | **✅ 완료** |
| **Phase 3.7 (시뮬레이션)** | **2** | **2** | **100%** | **✅ 완료** |
| **Phase 3.8 (기존 고급)** | **3** | **3** | **100%** | **✅ 완료** |
| **Phase 4 (마케팅)** | **4** | **4** | **100%** | **✅ 완료** |
| **Phase 5 (급여대장)** | **3** | **2** | **67%** | **✅ 핵심 완료** |
| **Phase 6 (AI 챗봇)** | **6** | **6** | **100%** | **✅ 완료** |
| **Phase 7 (요금제+결제)** | **6** | **0** | **0%** | Polar + Resend |
| **전체** | **57** | **44** | **77%** | |

---

## Phase 2: 핵심 기능 완성 (P1)

> 목표: 사용자 경험 개선

### 2.1 FullCalendar 통합
- **상태**: ✅ 완료 (2026-01-22)
- **우선순위**: 높음
- **예상 작업량**: 2일
- **설명**:
  - ShiftCalendar.tsx 구현 ✅
  - 시각적 캘린더 뷰 ✅
  - 날짜 클릭으로 시프트 추가/수정/삭제 ✅
  - ShiftModal.tsx 모달 컴포넌트 ✅
- **관련 파일**:
  - `frontend/src/components/ShiftInput/ShiftCalendar.tsx` ✅
  - `frontend/src/components/ShiftInput/ShiftModal.tsx` ✅

### 2.2 시프트 템플릿 기능
- **상태**: ✅ 완료 (이전 구현)
- **우선순위**: 높음
- **예상 작업량**: 1일
- **설명**:
  - 풀타임 주4/5/6 프리셋 ✅
  - 오전/오후/야간조 프리셋 ✅
  - 사용자 정의 템플릿 저장 (미구현)
- **관련 파일**:
  - `frontend/src/components/ShiftInput/ShiftInput.tsx` (SHIFT_PRESETS 상수)

### 2.3 경고 시스템 강화
- **상태**: ✅ 완료 (2026-01-23)
- **우선순위**: 높음
- **예상 작업량**: 1일
- **설명**:
  - 최저임금 미달 경고: "노동청 신고 가능 사항" ✅
  - 주 52시간 위반 경고: "연장근로 과다" ✅
  - 포괄임금제 오용 주의 ✅
  - 경고 수준별 UI (critical/warning/info) ✅
- **관련 파일**:
  - `backend/app/domain/services/warning_generator.py` ✅ (신규)
  - `frontend/src/components/ResultDisplay/WarningAlert.tsx` ✅ (수정)

### 2.4 법정 요율 JSON 관리
- **상태**: ✅ 완료 (2026-01-23)
- **우선순위**: 높음
- **예상 작업량**: 1일
- **설명**:
  - 연도별 버전 관리 (2025, 2026) ✅
  - 최저임금, 보험료율 중앙 관리 ✅
  - Admin API 구현 (CRUD) ✅
  - 요율 로더 서비스 (캐싱) ✅
- **관련 파일**:
  - `backend/app/core/legal_rates.json` ✅ (신규)
  - `backend/app/core/legal_rates_loader.py` ✅ (신규)
  - `backend/app/api/routers/admin.py` ✅ (신규)

---

## Phase 2.5: 월간 시프트 기반 급여 계산 재설계 (P1)

> 목표: 구체적 월간 시프트 기반 정확한 급여 계산

### 2.5.1 월급제/시급제 분기 로직
- **상태**: ✅ 완료 (2026-01-23)
- **우선순위**: 높음
- **설명**:
  - 월급제: 월급 고정 - 결근 공제
  - 시급제: 시급 × 실제 근무시간
  - SalaryCalculator 오케스트레이터 분기 구현
- **관련 파일**:
  - `backend/app/domain/services/salary_calculator.py` ✅ (수정)
  - `backend/app/api/schemas/salary.py` ✅ (wage_type, hourly_wage 필드 추가)
  - `frontend/src/types/salary.ts` ✅ (WageType, AbsencePolicy 타입)
  - `frontend/src/components/forms/SalaryForm.tsx` ✅ (급여 형태 선택 UI)

### 2.5.2 결근 공제 계산 서비스
- **상태**: ✅ 완료 (2026-01-23)
- **우선순위**: 높음
- **설명**:
  - AbsenceCalculator 신규 구현
  - 3가지 결근 정책: STRICT (일급 공제 + 주휴 미지급), MODERATE (주휴만 미지급), LENIENT (공제 없음)
  - 소정근로일수 계산 (5인 이상: 공휴일 제외 / 5인 미만: 공휴일 포함)
- **관련 파일**:
  - `backend/app/domain/services/absence_calculator.py` ✅ (신규)
  - `frontend/src/components/forms/SalaryForm.tsx` ✅ (결근 정책 선택 UI)

### 2.5.3 주별 개근 체크 로직 수정
- **상태**: ✅ 완료 (2026-01-23)
- **우선순위**: 높음
- **설명**:
  - 주별 개근 → 해당 주 주휴수당 지급 (기존: 월 단위 일괄)
  - 부분 주 완화: 월 경계에 걸친 주는 가능한 근무일 기준 판단
  - 버그 수정: min_date/max_date를 월 전체 범위로 확장
- **관련 파일**:
  - `backend/app/domain/services/weekly_holiday_pay_calculator.py` ✅ (수정)
  - `backend/app/tests/unit/test_weekly_holiday_pay_calculator.py` ✅ (테스트 기댓값 수정)

### 2.5.4 캘린더 중심 UI 완성
- **상태**: ✅ 완료 (2026-01-23)
- **우선순위**: 높음
- **설명**:
  - 월 선택 드롭다운 + 월간 템플릿 채우기 버튼
  - FullCalendar 연동 (날짜 클릭 시 시프트 추가/수정/삭제)
  - 프리셋: 풀타임 주4/5/6, 오전/오후/야간조
- **관련 파일**:
  - `frontend/src/components/ShiftInput/ShiftInput.tsx` ✅ (월 선택, 템플릿)
  - `frontend/src/components/ShiftInput/ShiftCalendar.tsx` ✅ (FullCalendar)
  - `frontend/src/components/ShiftInput/ShiftModal.tsx` ✅ (시프트 모달)

### 2.5.5 근무 요약 및 결과 표시
- **상태**: ✅ 완료 (2026-01-23)
- **우선순위**: 높음
- **설명**:
  - WorkSummary 컴포넌트: 출근일/결근일/총 시간/시간별 상세
  - Home.tsx에 새 상태 연결 (wageType, hourlyWage, calculationMonth, absencePolicy)
- **관련 파일**:
  - `frontend/src/components/ResultDisplay/WorkSummary.tsx` ✅ (신규)
  - `frontend/src/pages/Home.tsx` ✅ (상태 연결)
  - `backend/app/api/routers/salary.py` ✅ (WorkSummary 응답 포함)

---

## Phase 3.0: 긴급 버그 수정 (P0) ✅ 완료

> 목표: 법적 정확성 확보

### 3.0.1 최저시급 오류 수정
- **상태**: ✅ 완료 (2026-01-24)
- **우선순위**: 긴급
- **설명**:
  - 전체 사이트 최저시급 10,030원 → **10,320원** 수정 (2026년 확정)
  - 월 환산액: 10,320 × 209 = 2,156,880원 / 10,320 × 174 = 1,795,680원
  - 관련 모든 계산 예시값 재계산 완료
- **수정 파일** (7개):
  - `frontend/src/pages/Guide/GuidePage.tsx` ✅
  - `frontend/src/pages/FAQ.tsx` ✅
  - `frontend/src/pages/Legal.tsx` ✅
  - `frontend/src/pages/Examples/ExamplesPage.tsx` ✅
  - `frontend/src/pages/Examples/ParttimeExample.tsx` ✅
  - `frontend/src/pages/Examples/FulltimeExample.tsx` ✅
  - `frontend/src/data/blogPosts.ts` ✅
- **커밋**: `73f1649` (2026-01-24)

### 3.0.2 월 소정근로시간 동적 계산
- **상태**: ✅ 완료 (2026-01-24)
- **우선순위**: 긴급
- **설명**:
  - 이전: `MONTHLY_REGULAR_HOURS = Decimal('174')` 고정
  - 수정: `min(주 소정근로시간, 40) × 4.345` 동적 계산
  - 209시간 방식: `min(주근로, 40) × 4.345 + (주근로÷40×8) × 4.345`
  - 두 방식 모두 지원 (174시간 방식 / 209시간 방식)
  - 프론트엔드: HoursMode 선택 UI + 자동 계산 표시
- **수정 파일**:
  - `backend/app/domain/services/salary_calculator.py` ✅ (동적 계산 로직)
  - `backend/app/api/schemas/salary.py` ✅ (hours_mode 필드)
  - `frontend/src/types/salary.ts` ✅ (HoursMode 타입)
  - `frontend/src/components/forms/SalaryForm.tsx` ✅ (시간 방식 선택 UI)
- **커밋**: `fe9936e` (2026-01-24)

---

## Phase 3.1: 역산 기능 (P2) ✅ 완료

### 3.1.1 역산 계산기 (Net → Gross)
- **상태**: ✅ 완료 (2026-01-23)
- **설명**: 실수령액 입력 시 세전 금액 계산 (이진 탐색)
- **관련 파일**:
  - `backend/app/domain/services/reverse_calculator.py` ✅
  - `frontend/src/pages/ReverseCalculator.tsx` ✅

---

## Phase S: Spring Boot 전환 (P0 - 아키텍처 전환)

> **목표**: Python(FastAPI) → Kotlin(Spring Boot) 점진적 전환
> **방향**: 급여계산/유저관리 = Spring, AI 챗봇 = Python 마이크로서비스
> **기술 스택**: Kotlin + Spring Boot 3 + Gradle + JPA + Flyway + PostgreSQL(pgvector)

### 전환 아키텍처 (3단계)

```
[1단계: 게이트웨이]
  React → Spring Boot (인증/라우팅) → Python (기존 계산 프록시)

[2단계: 도메인 전환]
  React → Spring Boot (인증 + 급여계산) → Python (점진적 축소)

[3단계: AI 서비스 분리]
  React → Spring Boot (전체 API) ←→ Python AI Service (RAG/챗봇 전용)
```

### 멀티모듈 구조

```
backend-spring/
├── api/             # Controller, DTO, GlobalExceptionHandler
├── domain/          # Entity, VO, Service (외부 의존성 없음)
├── infrastructure/  # JPA Repository, External API, Redis
└── common/          # 공통 유틸, 예외 정의
```

---

### S1. 프로젝트 초기 설정 + 인증 게이트웨이 ✅ 완료 (2026-01-25)

#### S1.1 Spring Boot 프로젝트 생성
- **상태**: ✅ 완료 (2026-01-25)
- **우선순위**: 긴급
- **설명**:
  - Spring Initializr: Kotlin + Gradle (Kotlin DSL)
  - 의존성: Spring Web, Spring Security, Spring Data JPA, Flyway, PostgreSQL
  - 멀티모듈 구조: api / domain / infrastructure / common
  - application.yml 프로파일: local, dev, prod
  - Docker Compose: PostgreSQL 15 + pgvector 확장
- **산출물**:
  - `backend-spring/build.gradle.kts` (루트) ✅
  - `backend-spring/settings.gradle.kts` ✅
  - `backend-spring/api/`, `domain/`, `infrastructure/`, `common/` ✅
  - `backend-spring/docker-compose.yml` (PostgreSQL + Redis + pgvector) ✅
  - `backend-spring/README.md` ✅

#### S1.2 Spring Security + JWT 인증
- **상태**: ✅ 완료 (2026-01-25)
- **우선순위**: 긴급
- **설명**:
  - JWT 발급/검증 필터 (기존 Python JWT 호환)
  - User 엔티티 + JPA Repository
  - 로그인/회원가입 API (`/api/v1/auth/login`, `/register`)
  - Flyway 마이그레이션: V1__init_user.sql
- **관련 파일**:
  - `infrastructure/security/JwtTokenProvider.kt` ✅
  - `infrastructure/security/JwtAuthenticationFilter.kt` ✅
  - `infrastructure/security/SecurityConfig.kt` ✅
  - `domain/entity/User.kt` ✅
  - `infrastructure/repository/UserRepository.kt` ✅
  - `api/service/AuthService.kt` ✅
  - `api/controller/AuthController.kt` ✅

#### S1.3 Python 프록시 설정
- **상태**: ✅ 완료 (2026-01-25)
- **우선순위**: 긴급
- **설명**:
  - WebClient로 기존 Python 서버 요청 전달
  - 인증된 요청만 프록시 (JWT 검증 후)
  - `/api/v1/salary/**`, `/api/v1/insurance/**` → Python 프록시
  - 헬스체크 + 폴백 처리
- **관련 파일**:
  - `infrastructure/proxy/PythonProxyService.kt` ✅
  - `api/controller/ProxyController.kt` ✅

---

### S2. 핵심 도메인 전환 (Kotlin 재작성)

#### S2.1 Value Objects 전환
- **상태**: ✅ 완료 (2026-01-25)
- **우선순위**: 높음
- **설명**:
  - Money: `BigDecimal` 기반, `RoundingMode.HALF_UP`, 원 단위 반올림 ✅
  - WorkingHours: 분 단위 저장, 시간 변환 메서드 ✅
  - Kotlin `data class` 활용 ✅
- **관련 파일**:
  - `backend-spring/domain/src/main/kotlin/com/paytools/domain/vo/Money.kt` ✅
  - `backend-spring/domain/src/main/kotlin/com/paytools/domain/vo/WorkingHours.kt` ✅

#### S2.2 Entities 전환 (도메인 모델)
- **상태**: ✅ 완료 (2026-01-25)
- **우선순위**: 높음
- **설명**:
  - Employee: 검증 로직 + EmploymentType, CompanySize enum ✅
  - WorkShift: `calculateWorkingHours()`, `calculateNightHours()` ✅
  - Allowance: 4가지 분류 플래그 ✅
  - Kotlin `data class` 기반 도메인 모델 (JPA 엔티티 아님)
- **관련 파일**:
  - `backend-spring/domain/src/main/kotlin/com/paytools/domain/model/Employee.kt` ✅
  - `backend-spring/domain/src/main/kotlin/com/paytools/domain/model/WorkShift.kt` ✅
  - `backend-spring/domain/src/main/kotlin/com/paytools/domain/model/Allowance.kt` ✅

#### S2.3 Domain Services 전환
- **상태**: ✅ 완료 (2026-01-25)
- **우선순위**: 높음
- **설명**:
  - 순수 함수 → Kotlin 클래스 (DI 지원, 사이드이펙트 없음)
  - 전환 완료:
    1. InsuranceCalculator (4대 보험, 2026년 요율) ✅
    2. TaxCalculator (간이세액표) ✅
    3. OvertimeCalculator (연장/야간/휴일) ✅
    4. WeeklyHolidayPayCalculator (주휴수당) ✅
    5. AbsenceCalculator (결근 공제 3정책) ✅
    6. SalaryCalculator (오케스트레이터) ✅
  - ReverseSalaryCalculator, WarningGenerator는 Phase S3에서 추가
- **관련 파일**:
  - `backend-spring/domain/src/main/kotlin/com/paytools/domain/service/InsuranceCalculator.kt` ✅
  - `backend-spring/domain/src/main/kotlin/com/paytools/domain/service/TaxCalculator.kt` ✅
  - `backend-spring/domain/src/main/kotlin/com/paytools/domain/service/OvertimeCalculator.kt` ✅
  - `backend-spring/domain/src/main/kotlin/com/paytools/domain/service/WeeklyHolidayPayCalculator.kt` ✅
  - `backend-spring/domain/src/main/kotlin/com/paytools/domain/service/AbsenceCalculator.kt` ✅
  - `backend-spring/domain/src/main/kotlin/com/paytools/domain/service/SalaryCalculator.kt` ✅

#### S2.4 Result DTO 전환
- **상태**: ✅ 완료 (2026-01-25)
- **우선순위**: 높음
- **설명**:
  - InsuranceResult, TaxResult, OvertimeResult ✅
  - WeeklyHolidayPayResult, AbsenceResult ✅
  - SalaryCalculationResult ✅
  - 각 서비스 파일 내 `data class`로 구현
- **관련 파일**:
  - 각 서비스 파일 내 Result data class 포함

---

### S3. API 계층 전환 + 검증

#### S3.1 Controller + DTO 구현
- **상태**: ✅ 완료 (2026-01-25)
- **우선순위**: 높음
- **설명**:
  - Request/Response DTO (기존 Pydantic 스키마 1:1 매핑) ✅
  - SalaryController: `/api/v1/salary/calculate` ✅
  - InsuranceController: `/api/v1/insurance/rates`, `/calculate` ✅
  - TaxController: `/api/v1/tax/calculate`, `/estimate-annual` ✅
  - GlobalExceptionHandler: `@ControllerAdvice` 확장 ✅
  - API 응답 구조 기존과 동일 유지 (프론트엔드 수정 최소화) ✅
- **구현 파일**: (총 16개)
  - DTO Common: `MoneyResponse.kt`, `WorkingHoursResponse.kt`
  - DTO Request: `EmployeeRequest.kt`, `AllowanceRequest.kt`, `WorkShiftRequest.kt`, `SalaryCalculationRequest.kt`, `InsuranceRequest.kt`, `TaxRequest.kt`
  - DTO Response: `SalaryCalculationResponse.kt` (9개 nested data class 포함), `InsuranceResponse.kt`, `TaxResponse.kt`
  - Controller: `SalaryController.kt`, `InsuranceController.kt`, `TaxController.kt`
  - Domain: `SalaryTypes.kt` (WageType, AbsencePolicy, HoursMode enum)
  - Exception: `GlobalExceptionHandler.kt` (IllegalArgumentException, IllegalStateException 추가)
- **빌드 결과**: ✅ 컴파일 및 빌드 성공

#### S3.2 테스트 + Python 결과 비교 검증
- **상태**: ✅ 완료 (2026-01-25)
- **우선순위**: 높음
- **설명**:
  - 단위 테스트: JUnit 5 + H2 인메모리 DB ✅
  - 통합 테스트: `@SpringBootTest` + `@AutoConfigureMockMvc` ✅
  - **핵심: Python vs Kotlin 1원 일치 검증** ✅
    - 동일 입력값으로 양쪽 API 호출
    - 결과 비교 스크립트 (net_pay, 각 보험료, 세금 등)
    - 불일치 시 상세 로그 + 테스트 실패
- **구현 파일**: (총 6개)
  - Controller 테스트: `SalaryControllerTest.kt`, `InsuranceControllerTest.kt`, `TaxControllerTest.kt` (20개 테스트 전체 통과)
  - 테스트 설정: `application-test.yml`, `TaxRequestValidator.kt`
  - 검증 스크립트: `scripts/verify_parity.py`, `scripts/README.md`
- **빌드 결과**: ✅ 모든 테스트 통과 (20/20)
- **InsuranceResult 개선**: 각 보험별 적용 기준액 (base) 추가 반환

#### S3.3 Python AI 마이크로서비스화
- **상태**: ✅ 계획 완료 (2026-01-25, 실제 전환은 Phase 6)
- **우선순위**: 중간 (Phase 6 이전 완료)
- **설명**:
  - Python 서버에서 API 로직 제거 (급여계산, 보험, 세금)
  - AI 전용 엔드포인트만 유지:
    - `/ai/chat/stream` (RAG 챗봇)
    - `/ai/embed` (문서 임베딩)
    - `/ai/search` (벡터 검색)
  - Spring → Python 통신: REST WebClient
  - 모든 DB 접근은 Spring 경유 (데이터 무결성)
- **구현 파일**:
  - `AiServiceClient.kt` - Spring → Python 통신 클라이언트 ✅
  - `PYTHON_AI_MICROSERVICE_PLAN.md` - 상세 전환 계획 문서 ✅
- **실제 전환**: Phase 6 (AI 챗봇 구현) 시 수행 예정

---

## Phase 3.5: 근무자 등록 시스템 (P1 - Spring으로 구현)

> 목표: 근무자 정보 관리 + 급여 자동화 기반 구축
> 참조: `docs/근로계약서.pdf` (실제 계약서 양식)
> ⚠️ **Phase S 완료 후 진행** — 아래 관련 파일 경로는 Spring 전환 후 `backend-spring/` 하위로 변경됨

### 3.5.1 근무자 DB 모델 설계
- **상태**: ✅ 완료 (2026-01-27)
- **우선순위**: 높음
- **설명**:
  - Employee 테이블 확장 (Spring Boot JPA Entity)
  - 추가 필드:
    - `name`: 이름 ✅
    - `resident_id_prefix`: 주민번호 앞 7자리 (YYMMDD-N) ✅
    - `birth_date`: 생년월일 (주민번호에서 자동 추출) ✅
    - `is_foreigner`: 외국인 여부 (성별코드 5~8이면 외국인) ✅
    - `visa_type`: 체류자격 (E-9, F-4 등, 외국인만) ✅
    - `contract_start_date`: 계약 시작일 ✅
    - `work_start_time`: 근무 시작시간 (기본: 09:00) ✅
    - `work_end_time`: 근무 종료시간 (기본: 18:00) ✅
    - `break_minutes`: 휴게시간 (분, 기본: 60) ✅
    - `weekly_work_days`: 주 근무일수 (기본: 5) ✅
    - `probation_months`: 수습기간 (월, 0=없음) ✅
    - `probation_rate`: 수습 급여 비율 (%, 기본: 100) ✅
- **관련 파일**:
  - `backend-spring/infrastructure/src/main/kotlin/.../entity/EmployeeEntity.kt` ✅
  - `backend-spring/infrastructure/src/main/resources/db/migration/V2__create_employees_table.sql` ✅

### 3.5.2 급여 기간/지급일 설정
- **상태**: ⬜ 대기
- **우선순위**: 높음
- **설명**:
  - PayrollConfig 모델:
    - `period_start_day`: 급여 기간 시작일 (기본: 1)
    - `period_end_day`: 급여 기간 종료일 (기본: 말일)
    - `pay_day`: 급여 지급일 (기본: 20)
    - `weekly_holiday`: 주휴일 요일 (기본: 일요일)
    - `week_start_day`: 주 시작 요일 (기본: 월요일)
- **관련 파일**:
  - `backend/app/domain/entities/payroll_config.py` (신규)
  - `backend/app/api/schemas/employee.py` (신규)

### 3.5.3 국민연금 연령 제한 처리
- **상태**: ✅ 완료 (2026-01-27)
- **우선순위**: 높음
- **설명**:
  - 만 60세 이상: 국민연금 의무가입 대상 아님 ✅
  - 주민번호 앞자리에서 나이 자동 계산 ✅
  - 60세 이상 시 "국민연금 제외 가능" 안내 표시 ✅
  - 프론트엔드 폼에서 자동 감지 ✅
- **구현 로직** (TypeScript):
  ```typescript
  function getAgeFromResidentId(residentIdPrefix: string): number {
    const birthYearPrefix = residentIdPrefix.substring(0, 2);
    const genderDigit = residentIdPrefix.charAt(7);
    const century = ['1', '2', '5', '6'].includes(genderDigit) ? 1900 : 2000;
    const birthYear = century + parseInt(birthYearPrefix, 10);
    return new Date().getFullYear() - birthYear;
  }
  ```
- **관련 파일**:
  - `frontend/src/pages/Employees/EmployeeForm.tsx` ✅

### 3.5.4 근무자 등록 UI
- **상태**: ✅ 완료 (2026-01-27)
- **우선순위**: 높음
- **설명**:
  - 근무자 정보 입력 폼:
    - 이름, 주민번호 앞 7자리 ✅
    - 외국인 여부 (자동 감지 + 수동 토글) ✅
    - 체류자격 선택 (외국인만 표시) ✅
    - 계약 시작일 ✅
    - 근무시간 (시작/종료/휴게) ✅
    - 주 근무일수 ✅
    - 수습기간/비율 ✅
  - 근무자 목록 페이지 (/employees) ✅
  - 근무자 등록/수정 페이지 (/employees/new, /employees/:id/edit) ✅
  - 네비게이션에 "직원 관리" 메뉴 추가 ✅
- **관련 파일**:
  - `frontend/src/pages/Employees/EmployeeList.tsx` ✅ (신규)
  - `frontend/src/pages/Employees/EmployeeForm.tsx` ✅ (신규)
  - `frontend/src/pages/Employees/index.tsx` ✅ (신규)
  - `frontend/src/components/layout/Navigation.tsx` ✅ (수정)
  - `frontend/src/App.tsx` ✅ (라우트 추가)

### 3.5.5 근무자 API 엔드포인트
- **상태**: ✅ 완료 (2026-01-27)
- **우선순위**: 높음
- **설명**:
  - CRUD: POST/GET/PUT/DELETE /api/v1/employees ✅
  - 이름 검색: GET /api/v1/employees/search?name={name} ✅
  - 프론트엔드 API 클라이언트 구현 ✅
  - 타입 정의 (Employee, EmployeeRequest, EmployeeResponse) ✅
  - 무료 요금제: 최대 2명 제한 (Phase 7에서 적용)
- **관련 파일**:
  - `backend-spring/api/src/main/kotlin/.../controller/EmployeeController.kt` ✅
  - `backend-spring/api/src/main/kotlin/.../dto/EmployeeDto.kt` ✅
  - `frontend/src/api/employeeApi.ts` ✅ (신규)
  - `frontend/src/types/employee.ts` ✅ (신규)
  - `docs/API_REFERENCE.md` ✅ (업데이트)

---

## Phase 3.6: 급여 설정 고도화 (P1 - Spring으로 구현) ✅ 완료 (2026-01-29)

> 목표: 4대보험 유연 설정 + 외국인 지원 + 포괄임금제

### 3.6.1 4대보험 개별 체크박스
- **상태**: ✅ 완료 (2026-01-29)
- **우선순위**: 높음
- **설명**:
  - 국민연금, 건강보험, 장기요양보험, 고용보험 각각 체크박스 ✅
  - 기본값: 전체 적용 (체크됨) ✅
  - 만 60세 이상: 국민연금 자동 해제 + 안내 ✅
  - 주 15시간 미만: 고용보험 제외 가능 안내 ✅
  - 건강보험 해제 시 장기요양보험 자동 해제 ✅
- **관련 파일**:
  - `backend-spring/domain/src/main/kotlin/com/paytools/domain/model/InsuranceOptions.kt` ✅
  - `backend-spring/api/src/main/kotlin/com/paytools/api/dto/request/InsuranceOptionsRequest.kt` ✅
  - `frontend/src/components/forms/InsuranceOptions.tsx` ✅ (신규)

### 3.6.2 외국인 근로자 체류자격별 보험 자동 세팅
- **상태**: ✅ 완료 (2026-01-29)
- **우선순위**: 높음
- **설명**:
  - 외국인 체크 시 체류자격 선택 드롭다운 표시 ✅
  - 체류자격별 자동 적용 규칙:
    | 체류자격 | 국민연금 | 건강보험 | 고용보험 | 산재보험 |
    |---------|---------|---------|---------|---------|
    | F-2, F-5, F-6 | ✅ 의무 | ✅ 의무 | ✅ 의무 | ✅ 의무 |
    | E-9, H-2 | ⚠️ 임의 | ✅ 의무 | ⚠️ 임의 | ✅ 의무 |
    | F-4 (재외동포) | ⚠️ 임의 | ✅ 의무 | ⚠️ 임의 | ✅ 의무 |
    | D-7~D-9 | ⚠️ 상호주의 | ✅ 의무 | ⚠️ 상호주의 | ✅ 의무 |
  - 자동 세팅 후 사용자가 수동 변경 가능 ✅
- **관련 파일**:
  - `frontend/src/types/employee.ts` ✅ (VISA_INSURANCE_RULES)
  - `frontend/src/components/forms/EmployeeInfoForm.tsx` ✅ (외국인 여부 + 체류자격)
  - `frontend/src/components/forms/InsuranceOptions.tsx` ✅ (useEffect 자동 세팅)

### 3.6.3 포괄임금제 지원
- **상태**: ✅ 완료 (2026-01-29)
- **우선순위**: 중간
- **설명**:
  - 계약서 사례: 연장수당을 시간당 고정금액으로 설정 (예: 10,500원) ✅
  - 설정 옵션:
    - 포괄임금제 여부 체크 ✅
    - 연장수당 시간당 금액 입력 ✅
    - 월 포함 연장근로 예정시간 입력 ✅
  - 경고: 포괄임금제 시 최저시급 미달 여부 검증 ✅
  - 환산시급 자동 계산 및 표시 ✅
- **관련 파일**:
  - `backend-spring/domain/src/main/kotlin/com/paytools/domain/model/InclusiveWageOptions.kt` ✅ (신규)
  - `backend-spring/api/src/main/kotlin/com/paytools/api/dto/request/InclusiveWageOptionsRequest.kt` ✅ (신규)
  - `backend-spring/domain/src/main/kotlin/com/paytools/domain/service/SalaryCalculator.kt` ✅ (분기 로직)
  - `frontend/src/components/forms/InclusiveWageOptions.tsx` ✅ (신규)

### 3.6.4 209시간/174시간 자동 계산 개선
- **상태**: ✅ 완료 (이전 구현됨)
- **우선순위**: 높음
- **설명**:
  - 주 근로시간 입력 시 월 소정근로시간 자동 계산 ✅
  - 174방식: `min(주근로, 40) × 4.345` ✅
  - 209방식: `(min(주근로, 40) + min(주근로,40)/40×8) × 4.345` ✅
  - SalaryForm에서 실시간 표시 ✅
- **관련 파일**:
  - `backend-spring/domain/src/main/kotlin/com/paytools/domain/service/SalaryCalculator.kt` ✅
  - `frontend/src/components/forms/SalaryForm.tsx` ✅ (자동 표시)

---

## Phase 3.7: 급여 구조 시뮬레이션 (P2) ✅ 완료 (2026-01-29)

> 목표: 같은 총액에서 기본급/수당 배분에 따른 인건비 차이 비교
> 참고: A=250만 통째 기본급 vs B=10,320시급+수당 사례

### 3.7.1 급여 구조 비교 엔진
- **상태**: ✅ 완료 (2026-01-29)
- **우선순위**: 중간
- **설명**:
  - 입력: 월 총 급여액, 주 근로시간, 예상 연장/야간/휴일 시간 ✅
  - 시뮬레이션 항목:
    - 기본급 비율별 통상시급 변화 ✅
    - 통상시급에 따른 가산수당 차이 ✅
    - 퇴직금 산정 기준액 차이 ✅
    - 연차수당 차이 (1년 이상 근무 시) ✅
  - 결과: "사업주 연간 인건비 부담" 비교표 ✅
- **버그 수정** (2026-01-29):
  - API URL 중복 오류 수정 (`/api/v1/api/v1` → `/simulation/compare`)
  - axios response.data 접근 오류 수정
- **관련 파일**:
  - `backend-spring/api/src/main/kotlin/.../controller/SimulationController.kt` ✅
  - `backend-spring/domain/src/main/kotlin/.../service/SimulationService.kt` ✅
  - `frontend/src/api/simulationApi.ts` ✅

### 3.7.2 시뮬레이션 UI
- **상태**: ✅ 완료 (2026-01-29)
- **우선순위**: 중간
- **설명**:
  - 슬라이더로 기본급 비율 조정 (A안/B안) ✅
  - 실시간 비교표 (통상시급, 연장수당, 퇴직금, 연간 인건비) ✅
  - 차이 분석 (연간 인건비 차이율 표시) ✅
  - 추천 의견 표시 ✅
- **관련 파일**:
  - `frontend/src/pages/Simulation/SalarySimulation.tsx` ✅
  - `frontend/src/types/simulation.ts` ✅

---

## Phase 3.8: 기존 고급 기능 (P2) ✅ 완료 (2026-01-29)

> 기존 Phase 3의 나머지 항목

### 3.8.1 급여명세서 PDF 출력
- **상태**: ✅ 완료 (2026-01-29)
- **우선순위**: 중간
- **설명**:
  - jsPDF 라이브러리 통합 ✅
  - 근로기준법 시행령 제27조의2 준수 ✅
  - CSV 내보내기 기능 포함 ✅
- **관련 파일**:
  - `frontend/src/utils/pdfGenerator.ts` ✅
  - `frontend/src/components/ResultDisplay/PDFExport.tsx` ✅

### 3.8.2 Excel/CSV 임포트/익스포트
- **상태**: ✅ 완료 (2026-01-29)
- **우선순위**: 중간
- **설명**:
  - 시프트 데이터 일괄 입력 (CSV 가져오기) ✅
  - 시프트 데이터 CSV 내보내기 ✅
  - 템플릿 다운로드 기능 ✅
- **관련 파일**:
  - `frontend/src/utils/excelHandler.ts` ✅

### 3.8.3 시프트 검증 (한국 근로기준법 기준)
- **상태**: ✅ 완료 (2026-01-29)
- **우선순위**: 중간
- **설명**:
  - 주 52시간 초과 검증 (근로기준법 제53조) ✅
  - 1일 12시간 초과 검증 ✅
  - 휴게시간 부족 검증 (제54조) ✅
  - 7일 연속 근무 경고 (제55조 주휴일) ✅
- **관련 파일**:
  - `frontend/src/utils/shiftValidator.ts` ✅
  - `frontend/src/components/ShiftInput/ShiftSummary.tsx` ✅ (검증 경고 UI)

---

## Phase 4: SEO 및 마케팅 (P3) ✅ 완료 (2026-01-29)

> 목표: 트래픽 확보

### 4.1 Google AdSense 연동
- **상태**: ✅ 완료 (2026-01-29)
- **우선순위**: 낮음
- **설명**:
  - AdSense Auto Ads 코드 삽입 (`index.html`) ✅
  - AdBanner 컴포넌트 생성 (수동 광고 배치용) ✅
  - 개발 환경 플레이스홀더 표시 ✅
- **관련 파일**:
  - `frontend/index.html` ✅ (Auto Ads 스크립트 추가)
  - `frontend/src/components/common/AdBanner.tsx` ✅ (신규)

### 4.2 SEO 최적화
- **상태**: ✅ 완료 (2026-01-29)
- **우선순위**: 낮음
- **설명**:
  - sitemap.xml 최신화 (블로그 포스트 11개 등록) ✅
  - robots.txt 크롤링 허용 설정 ✅
  - 구조화된 데이터 (JSON-LD) 확인 ✅
- **관련 파일**:
  - `frontend/public/sitemap.xml` ✅
  - `frontend/public/robots.txt` ✅

### 4.3 블로그 콘텐츠 추가 (2개)
- **상태**: ✅ 완료 (2026-01-29)
- **우선순위**: 낮음
- **설명**:
  - SEO 키워드 기반 콘텐츠 2개 추가 ✅
  - sitemap.xml에 새 블로그 URL 등록 ✅
- **추가된 콘텐츠**:
  1. "최저임금 위반 시 과태료" (`minimum-wage-violation-penalty`) ✅
  2. "급여명세서 필수 기재사항" (`payslip-requirements`) ✅
- **관련 파일**:
  - `frontend/src/data/blogPosts.ts` ✅
  - `frontend/public/sitemap.xml` ✅

### 4.4 Lighthouse 성능 최적화 (Code Splitting)
- **상태**: ✅ 완료 (2026-01-29)
- **우선순위**: 낮음
- **설명**:
  - React.lazy + Suspense 적용 (20+ 컴포넌트) ✅
  - 메인 번들 17% 감소 (1,511KB → 1,257KB) ✅
  - PageLoader 컴포넌트 (로딩 스피너) ✅
  - 핵심 페이지 즉시 로드 (Landing, Calculator, Login, Register) ✅
- **관련 파일**:
  - `frontend/src/App.tsx` ✅ (Code Splitting 적용)

---

## Phase 5: 급여대장 ✅ 핵심 완료 (2026-01-28)

> 상세 PRD: [PRD_PAYROLL_LEDGER.md](./PRD_PAYROLL_LEDGER.md)

### 5.1 급여대장 - 핵심 CRUD
- **상태**: ✅ 완료 (2026-01-28)
- **우선순위**: 높음
- **설명**:
  - 근무 계약 CRUD (work_contracts) ✅
  - 출퇴근 기록 CRUD (work_shifts) ✅
  - 직원 관리 연동 (user_id 기반 데이터 격리) ✅
  - **계산 결과 저장 (2026-01-28 추가)**: ✅
    - PayrollEntryRequest에 계산 결과 필드 추가 (totalGross, netPay, overtimePay 등)
    - 급여 계산 후 결과값 DB에 저장
    - 급여대장 목록에서 합계 표시
- **구현 DB 테이블**:
  - `work_contracts`: 근무 계약 (월급제/시급제, 수당) ✅
  - `work_shifts`: 출퇴근 기록 (날짜별) ✅
- **관련 파일**:
  - `backend-spring/infrastructure/src/main/resources/db/migration/V3__add_user_id_and_create_payroll_tables.sql` ✅
  - `backend-spring/api/src/main/kotlin/.../controller/PayrollController.kt` ✅
  - `backend-spring/api/src/main/kotlin/.../service/PayrollService.kt` ✅
  - `backend-spring/api/src/main/kotlin/.../dto/request/PayrollRequest.kt` ✅ (계산 결과 필드 추가)

### 5.2 급여대장 - UI + 상태 관리
- **상태**: ✅ 완료 (2026-01-28)
- **우선순위**: 높음
- **설명**:
  - 급여 기간 관리 (payroll_periods) ✅
  - 상태 흐름: DRAFT → CONFIRMED → PAID ✅
  - **PAID 상태에서 DRAFT로 되돌리기 버튼 (2026-01-28 추가)** ✅
  - 직원별 급여 일괄 계산 ✅
  - 월간 템플릿 입력 (요일 체크박스 + 시간 라디오버튼) ✅
  - **기간 선택 기능 (2026-01-28 추가)**: ✅
    - 시작일/종료일 선택 드롭다운
    - 선택한 기간 내에서만 프리셋 시프트 생성
- **구현 DB 테이블**:
  - `payroll_periods`: 급여 기간 (연월별 상태) ✅
  - `payroll_entries`: 급여대장 엔트리 ✅
- **관련 파일**:
  - `frontend/src/pages/Payroll/PayrollList.tsx` ✅ (신규)
  - `frontend/src/pages/Payroll/PayrollDetail.tsx` ✅ (PAID 상태 수정 버튼 추가)
  - `frontend/src/components/ShiftInput/MonthlyTemplate.tsx` ✅ (신규)
  - `frontend/src/components/ShiftInput/ShiftInput.tsx` ✅ (기간 선택 기능)
  - `frontend/src/api/payrollApi.ts` ✅ (신규)
  - `frontend/src/types/payroll.ts` ✅ (계산 결과 타입 추가)

### 5.2.1 계산식 상세 표시
- **상태**: ✅ 완료 (2026-01-28)
- **우선순위**: 높음
- **설명**:
  - 급여 계산 결과에 계산 과정 수식 표시 ✅
  - 통상시급 계산식: `기본급 ÷ 174시간` ✅
  - 주휴수당 계산식: `통상시급 × 8시간 × 4.345주` ✅
  - 연장/야간/휴일 수당 계산식 표시 ✅
  - 4대 보험료 계산식 표시 (2026년 요율: 국민연금 4.75%, 장기요양 13.14%) ✅
  - 소득세 계산식 표시 ✅
- **관련 파일**:
  - `frontend/src/components/ResultDisplay/SalaryResultStitch.tsx` ✅ (계산 수식 추가)

### 5.2.2 급여 계산기 → 급여대장 저장
- **상태**: ✅ 완료 (2026-01-28)
- **우선순위**: 높음
- **설명**:
  - 급여 기간 상태 표시 (DRAFT/CONFIRMED/PAID) ✅
  - 비-DRAFT 기간 저장 비활성화 + 안내 메시지 ✅
  - 계산 결과 전체 저장 (총지급액, 실수령액, 공제액, 수당) ✅
- **관련 파일**:
  - `frontend/src/pages/Calculator/index.tsx` ✅ (저장 UI 개선)

### 5.3 급여대장 - PDF/엑셀 출력
- **상태**: ⬜ 대기
- **우선순위**: 중간
- **예상 작업량**: 3일
- **설명**:
  - PDF 급여명세서 출력 (법적 요구사항 준수)
  - 엑셀 내보내기
  - 연간 통계

---

## Phase 6: AI 노무 자문 챗봇 ✅ 완료 (2026-01-31)

> 상세 설계서: [PHASE6_IMPLEMENTATION_PLAN.md](../08-phase6/PHASE6_IMPLEMENTATION_PLAN.md)
> **구현 완료**: Python FastAPI + LangGraph + Tiered LLM (Gemini → Groq → GPT)
> **배포**: Railway (https://zesty-education-production.up.railway.app)

### 핵심 아키텍처

```
[사용자] → [React Chat UI (SSE)] → [FastAPI /api/v1/chat/stream]
                                              ↓
                                       [LangGraph Agent]
                                         ├── Router Node (의도 분류)
                                         ├── RAG Retrieve (pgvector)
                                         ├── Tool Node (급여계산, DB조회)
                                         └── Generate Node (Tiered LLM)
                                              ├── Gemini Flash (무료, 기본)
                                              ├── Groq Llama 3.3 (무료, 백업)
                                              └── GPT-4o-mini (유료, 고난도)
```

### 6.1 DB + 벡터 인프라
- **상태**: ✅ 완료 (2026-01-31)
- **우선순위**: 높음
- **예상 작업량**: 3일
- **설명**:
  - Railway PostgreSQL에 pgvector 확장 활성화
  - 임베딩: multilingual-e5-large (무료, 1024차원)
  - Alembic 마이그레이션
- **신규 DB 모델**:
  - `DocumentModel`: 법령/판례 문서 메타데이터
  - `DocumentChunkModel`: 문서 청크 + 벡터 (embedding Vector(1024))
  - `UserDocumentChunkModel`: 사업장별 데이터 벡터 (Multi-tenant)
  - `ChatSessionModel`: 대화 세션
  - `ChatMessageModel`: 대화 메시지 (role, content, citations)
  - `TokenUsageModel`: 토큰 사용량 추적 (일별 집계)
- **관련 파일**:
  - `backend/app/db/models.py` (수정)
  - `backend/app/ai/__init__.py` (신규)

### 6.2 RAG 파이프라인
- **상태**: ✅ 완료 (2026-01-31)
- **우선순위**: 높음
- **예상 작업량**: 4일
- **설명**:
  - 법령 데이터 수집 (law.go.kr API, 8개 법률)
  - 법령 조문별 청킹 + 판례 섹션별 청킹
  - Hybrid Search: 벡터 유사도(0.7) + 키워드 검색(0.3)
  - 사업장 데이터 벡터화 (직원/급여/시프트 → 자연어 변환)
- **데이터 소스**:
  - 근로기준법, 최저임금법, 소득세법 등 8개 법률
  - 고용노동부 행정해석 ~500건
  - 사업장 내부 DB (Employee, SalaryRecord)
- **관련 파일**:
  - `backend/app/ai/rag/embedder.py` (신규)
  - `backend/app/ai/rag/chunker.py` (신규)
  - `backend/app/ai/rag/retriever.py` (신규)
  - `backend/app/ai/rag/ingestion.py` (신규)

### 6.3 LangGraph Agent
- **상태**: ✅ 완료 (2026-01-31)
- **우선순위**: 높음
- **예상 작업량**: 5일
- **설명**:
  - Multi-Agent 오케스트레이션 (Router → Specialist)
  - Tools: 급여계산(기존 SalaryCalculator 래핑), 법령검색, DB조회
  - Tiered LLM Routing: FAQ캐시 → Gemini → Groq → GPT-4o-mini
  - 3-tier 캐싱: 정적FAQ + 시맨틱캐시 + 세션캐시
- **관련 파일**:
  - `backend/app/ai/agents/graph.py` (신규)
  - `backend/app/ai/tools/salary_tool.py` (신규)
  - `backend/app/ai/tools/law_search_tool.py` (신규)
  - `backend/app/ai/llm/router.py` (신규)
  - `backend/app/ai/cache/response_cache.py` (신규)

### 6.4 API + 스트리밍
- **상태**: ✅ 완료 (2026-01-31)
- **우선순위**: 높음
- **예상 작업량**: 3일
- **설명**:
  - POST /api/v1/chat/stream (SSE 실시간 응답)
  - GET /api/v1/chat/sessions (세션 목록)
  - Rate limiting: 30 req/hour (무료), 300 req/hour (프리미엄)
  - 토큰 사용량 추적 및 일일 한도
- **관련 파일**:
  - `backend/app/ai/router.py` (신규)
  - `backend/app/ai/schemas.py` (신규)
  - `backend/app/ai/config.py` (신규)

### 6.5 프론트엔드 Chat UI
- **상태**: ✅ 완료 (2026-01-31)
- **우선순위**: 높음
- **예상 작업량**: 4일
- **설명**:
  - 플로팅 위젯 (우하단) + 전체 페이지 모드 (/chat)
  - SSE 스트리밍 타이핑 효과
  - 법령 인용 카드 (Citation) 표시
  - 대화 세션 관리 사이드바
- **관련 파일**:
  - `frontend/src/components/Chat/ChatWidget.tsx` (신규)
  - `frontend/src/components/Chat/ChatWindow.tsx` (신규)
  - `frontend/src/components/Chat/MessageBubble.tsx` (신규)
  - `frontend/src/components/Chat/Citation.tsx` (신규)
  - `frontend/src/hooks/useChat.ts` (신규)
  - `frontend/src/pages/Chat/ChatPage.tsx` (신규)

### 6.6 문서화 + 데모
- **상태**: ✅ 완료 (2026-01-31)
- **우선순위**: 중간
- **예상 작업량**: 2일
- **설명**:
  - 시스템 아키텍처 다이어그램 (C4 모델)
  - RAG 파이프라인 흐름도
  - 데모 시나리오 3개 준비
    1. 법령 질의: "연장근로 가산율" → 근로기준법 제56조 인용
    2. 급여 시뮬레이션: "기본급 280만원 실수령액" → 계산 결과
    3. 사업장 맞춤: "최저임금 미달 위험 직원" → DB 분석
- **관련 파일**:
  - `docs/architecture/SYSTEM_ARCHITECTURE.md` (신규)
  - `docs/architecture/RAG_PIPELINE.md` (신규)

### 추가 패키지

**백엔드 (requirements.txt 추가)**:
```
langchain>=0.3.0, langgraph>=0.2.0
langchain-google-genai>=2.0.0, langchain-groq>=0.2.0
sentence-transformers>=3.0.0, pgvector>=0.3.0
sse-starlette>=2.0.0, tiktoken>=0.7.0, beautifulsoup4>=4.12.0
```

**프론트엔드 (package.json 추가)**:
```
react-markdown, remark-gfm
```

### 비용 전략 (예상 월 $10-20)

| Tier | LLM | 비용 | 용도 |
|------|-----|------|------|
| 1 | 캐시 (FAQ 200개) | $0 | LLM 호출 없이 직접 반환 |
| 2 | Gemini 2.0 Flash | $0 | 일반 질의 (1500 req/day) |
| 3 | Groq Llama 3.3 70B | $0 | 백업 (14400 req/day) |
| 4 | GPT-4o-mini | ~$5 | 복잡한 분석 |

---

## Phase 7: 요금제 및 결제 시스템 (P3)

> 목표: 무료/유료 구분 적용 + Polar 결제 연동
> **결제 서비스**: [Polar](https://polar.sh/) (MoR, 4%+$0.40, 사업자 불필요)
> **이메일 서비스**: [Resend](https://resend.com/) (무료 3,000개/월)

### 요금제 정책 (확정)

| 플랜 | 월 가격 | 직원 수 | AI 상담 | 급여계산 | PDF |
|------|---------|---------|---------|----------|-----|
| **Free** | ₩0 | 3명 | 10회/월 | 5회/월 | ❌ |
| **Basic** | ₩14,900 | 10명 | 30회/월 | 무제한 | ✅ |
| **Pro** | ₩29,900 | 30명 | 무제한 | 무제한 | ✅ |
| **Enterprise** | 수동 | 무제한 | 무제한 | 무제한 | ✅ |

### 7.1 DB 스키마
- **상태**: ⬜ 대기
- **우선순위**: 높음
- **설명**:
  - users 테이블 확장 (subscription_tier, subscription_end, polar_customer_id)
  - subscriptions 테이블 (결제 이력)
  - usage_tracking 테이블 (AI/급여계산 사용량)
- **관련 파일**:
  - `backend-spring/infrastructure/.../V4__add_subscription_tables.sql` (신규)

### 7.2 백엔드 - 제한 로직
- **상태**: ⬜ 대기
- **우선순위**: 높음
- **설명**:
  - User 엔티티에 subscriptionTier 필드 추가
  - 직원 등록 시 플랜 한도 체크
  - 사용량 추적 서비스
- **관련 파일**:
  - `domain/entity/SubscriptionTier.kt` (신규)
  - `domain/entity/User.kt` (수정)
  - `api/service/UsageService.kt` (신규)
  - `api/config/PlanLimits.kt` (신규)

### 7.3 백엔드 - Polar 연동
- **상태**: ⬜ 대기
- **우선순위**: 높음
- **설명**:
  - Checkout URL 생성 API
  - Polar 웹훅 처리 (구독 생성/갱신/취소)
  - 결제 상태 동기화
- **API 엔드포인트**:
  - `GET /api/v1/subscription/me` - 구독 상태 조회
  - `POST /api/v1/subscription/checkout` - Checkout URL 생성
  - `POST /api/v1/subscription/webhook` - Polar 웹훅
  - `GET /api/v1/subscription/usage` - 사용량 조회
- **관련 파일**:
  - `api/controller/SubscriptionController.kt` (신규)
  - `api/service/SubscriptionService.kt` (신규)
  - `api/service/PolarClient.kt` (신규)

### 7.4 프론트엔드
- **상태**: ⬜ 대기
- **우선순위**: 높음
- **설명**:
  - 요금제 페이지 (/pricing)
  - 업그레이드 모달 (제한 도달 시)
  - 구독 관리 페이지
- **관련 파일**:
  - `src/api/subscriptionApi.ts` (신규)
  - `src/pages/Pricing/index.tsx` (신규)
  - `src/components/UpgradeModal.tsx` (신규)
  - `src/contexts/AuthContext.tsx` (수정)

### 7.5 이메일 발송 (Resend)
- **상태**: ⬜ 대기
- **우선순위**: 중간
- **설명**:
  - 결제 완료 영수증
  - 구독 갱신 7일 전 알림
  - 결제 실패 알림
- **관련 파일**:
  - `infrastructure/email/ResendEmailService.kt` (신규)
  - `api/scheduler/SubscriptionScheduler.kt` (신규)

### 7.6 AI 사용량 DB 연동
- **상태**: ⬜ 대기
- **우선순위**: 중간
- **설명**:
  - Rate limiter를 메모리 → DB 기반으로 변경
  - Spring API 호출하여 사용량 체크
- **관련 파일**:
  - `backend-ai/app/services/rate_limiter.py` (수정)
  - `backend-ai/app/api/chat.py` (수정)

---

## 기타

### 6.1 테스트 에러 2건 수정
- **상태**: ⬜ 대기
- **우선순위**: 낮음
- **예상 작업량**: 1시간
- **설명**:
  - 서비스 작동에 영향 없음
  - `test_output.txt` 인코딩 문제
  - `test_secured_api.py` 서버 실행 확인 필요

---

## 완료된 항목

### ✅ Phase 1: 긴급 배포 (2026-01-21)
- [x] Railway에 백엔드 배포
- [x] PostgreSQL 연결
- [x] 프론트엔드 환경변수 수정
- [x] CORS 설정 확인
- [x] 전체 기능 테스트

### ✅ 추가 기능 (2026-01-21)
- [x] 급여 구성 방식 선택 옵션 (209시간/174시간)
- [x] 금액 입력 콤마 포맷팅

### ✅ 랜딩페이지 리뉴얼 (2026-01-22)
- [x] 마케팅 전문 랜딩페이지 (7개 섹션)
- [x] 페이지 구조 개편 (/, /calculator, /dashboard)
- [x] 네비게이션 개선 (투명 모드, 조건부 메뉴)
- [x] 대시보드 페이지
- [x] CTA 버튼 로그인 상태별 조건부 렌더링

### ✅ 월간 시프트 기반 급여 계산 재설계 (2026-01-23)
- [x] 월급제/시급제 분기 로직 (SalaryCalculator)
- [x] 결근 공제 계산 서비스 (AbsenceCalculator, 3가지 정책)
- [x] 주별 개근 체크 로직 수정 (주휴수당 주별 지급)
- [x] 캘린더 중심 UI (월 선택, 템플릿 채우기, ShiftModal)
- [x] 근무 요약 컴포넌트 (WorkSummary)
- [x] Home.tsx 상태 연결 (wageType, hourlyWage, calculationMonth, absencePolicy)
- [x] Cloudflare Pages 배포 완료 (커밋 d5e3827)

### ✅ UI 일러스트레이션 (2026-01-23)
- [x] SVG 3D 아이콘 (PageIcons.tsx - 7개)
- [x] 히어로 대시보드 목업 (HeroIllustration.tsx)
- [x] 빈 상태 일러스트 (EmptyState.tsx)
- [x] 배포 완료 (커밋 ad5b2bd)

### ✅ 역산 계산기 (2026-01-23)
- [x] 역산 계산 서비스 (reverse_calculator.py)
- [x] 역산 계산기 UI (ReverseCalculator.tsx)
- [x] 배포 완료

### ✅ 긴급 버그 수정 - Phase 3.0 (2026-01-24)
- [x] 최저시급 10,030원 → 10,320원 전체 사이트 수정 (7개 파일, 커밋 73f1649)
- [x] 월 소정근로시간 동적 계산 구현 (174방식/209방식 모두 지원, 커밋 fe9936e)

### ✅ Spring Boot Railway 배포 완료 (2026-01-25)
- [x] Railway 배포 완료 (7가지 빌드 이슈 해결)
- [x] 프론트엔드-백엔드 통신 이슈 해결:
  - [x] 필드명 불일치 (full_name → name)
  - [x] API 응답 형식 불일치 (access_token → data.accessToken)
  - [x] User 타입 수정 (full_name/is_active → name/role)
  - [x] UTF-8 인코딩 설정 (application-prod.yml + SecurityConfig)
- [x] 회원가입/로그인 정상 작동 확인 ✅

### ✅ Phase 3.5 근무자 등록 시스템 (2026-01-27)
- [x] 근무자 DB 모델 설계 (Employee JPA Entity + Flyway 마이그레이션)
- [x] 국민연금 연령 제한 처리 (주민번호 기반 나이 자동 계산)
- [x] 근무자 등록 UI (EmployeeList, EmployeeForm 페이지)
- [x] 근무자 API 프론트엔드 연동 (employeeApi.ts, employee.ts 타입)
- [x] API 문서 업데이트 (API_REFERENCE.md Employee API 추가)
- [x] DB 스키마 문서화 (DATABASE_SCHEMA.md 신규 생성)
- [x] 랜딩페이지 마케팅 문구 수정 (허위 통계/주장 제거)
- [x] 네비게이션 가시성 수정 (투명 → 반투명 흰색 배경)

---

## 일정 계획

```
=== 완료 ===
Week 1 (Phase 2 - 핵심 기능): ✅ 완료
Week 1.5 (Phase 2.5 - 계산 재설계): ✅ 완료
Week 2-Day1 (Phase 3.0 - 긴급 버그): ✅ 완료

=== Spring Boot 전환 (Phase S) ===
Week 2-3 (Phase S1 - 초기설정 + 게이트웨이): ✅ 완료 (2026-01-25)
├── Day 1-2: Spring Boot 프로젝트 생성 (Kotlin + Gradle + 멀티모듈) ✅
├── Day 3-4: Docker Compose + Flyway + PostgreSQL/pgvector ✅
├── Day 5-6: Spring Security + JWT 인증 ✅
└── Day 7: Python 프록시 설정 ✅

Week 4-5 (Phase S2 - 도메인 전환):
├── Day 8-9: Value Objects (Money, WorkingHours)
├── Day 10-11: Entities (Employee, WorkShift, Allowance) + JPA
├── Day 12-15: Domain Services 8개 Kotlin 재작성
└── Day 16: Result DTO 전환

Week 6 (Phase S3 - API 전환 + 검증):
├── Day 17-18: Controller + Request/Response DTO
├── Day 19-20: 단위 테스트 (JUnit 5 + MockK)
├── Day 21: 통합 테스트 (TestContainers)
└── Day 22: Python vs Kotlin 1원 일치 검증 + 프록시 제거

=== Spring 기반 기능 확장 ===
Week 7 (Phase 3.5 - 근무자 등록, Spring):
├── Day 23-24: Employee JPA 모델 확장 + Repository
├── Day 25-26: 근무자 등록 API + UI
└── Day 27: 국민연금 연령 제한 + 급여기간 설정

Week 8 (Phase 3.6 - 급여 고도화, Spring):
├── Day 28-29: 4대보험 체크박스 + 외국인 보험
├── Day 30: 포괄임금제 지원
└── Day 31: 209/174시간 자동계산 개선

Week 9 (Phase 3.7 + 3.8 - 시뮬레이션 + 고급기능):
├── Day 32-33: 급여 구조 시뮬레이션 엔진 + UI
└── Day 34-35: 급여명세서 PDF + Excel/CSV

Week 10 (Phase 3.8 + 4 - 고급기능 + 마케팅):
├── Day 36-37: 급여명세서 PDF + Excel/CSV
├── Day 38: 시프트 검증
└── Day 39-40: SEO, AdSense, Lighthouse

Week 11-12 (Phase 5 - 급여대장, Spring):
├── Week 11: 급여대장 CRUD + UI + 상태관리
└── Week 12: PDF/엑셀 출력 + 연간 통계

=== Python AI 마이크로서비스 ===
Week 13 (Phase S3.3 + 6.1-6.2 - AI 인프라):
├── Python 서버 AI 전용화 (기존 API 로직 제거)
├── pgvector 임베딩 인프라
└── RAG 파이프라인 (법령 청킹 + 검색)

Week 14-15 (Phase 6.3-6.5 - AI 챗봇):
├── Week 14: LangGraph Agent + API 스트리밍
└── Week 15: Chat UI + 문서화/데모

Week 16 (Phase 7 - 요금제):
└── 무료/유료 제한 적용 + 업그레이드 안내
```

### 실행 우선순위 요약

```
[즉시] Phase S1 → S2 → S3 (Spring 전환)
  ↓
[이후] Phase 3.5~3.9 (Spring으로 기능 확장)
  ↓
[이후] Phase 5 (급여대장, Spring)
  ↓
[이후] Phase S3.3 + 6 (Python AI 마이크로서비스)
  ↓
[마지막] Phase 4 (마케팅) + Phase 7 (요금제)
```

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|-----------|
| 2026-01-22 | 초기 작성 (PROJECT_ANALYSIS_REPORT.md v1.3.0 기반) |
| 2026-01-23 | AI 챗봇 상세 설계 반영 (Phase 6 세분화, 아키텍처 확정) |
| 2026-01-23 | Phase 2 완료 (경고 시스템 강화, 법정 요율 JSON 관리) |
| 2026-01-23 | Phase 2.5 완료 (월간 시프트 기반 급여 계산 재설계, 배포 완료) |
| 2026-01-23 | Phase 3.0~3.8 신규 추가 (근무자 등록, 급여 고도화, 시뮬레이션, 계약서) |
| 2026-01-23 | Phase 7 추가 (요금제 제한) |
| 2026-01-23 | 역산 기능/UI 일러스트 완료 반영, 일정 재편성 |
| 2026-01-24 | Phase 3.0 완료 (최저시급 10,320원 수정, 월 소정근로시간 동적 계산) |
| 2026-01-25 | **Phase S 추가 (Spring Boot 전환 계획)**: Kotlin+Gradle+JPA+Flyway, 3단계 점진 전환, 일정 재편 |
| 2026-01-25 | **Phase S1 완료**: Spring Boot 멀티모듈 프로젝트 생성, JWT 인증, Python 프록시 구현 |
| 2026-01-25 | **Phase S2 완료**: Value Objects, Domain Models, Domain Services 6개 Kotlin 전환 |
| 2026-01-25 | **Phase S3.1 완료**: Controller 3개 + DTO 16개 구현, API 계층 완성, 빌드 성공 |
| 2026-01-25 | **Phase S3 완료 (전체)**: Spring Boot API 전환 + 테스트 20개 통과 + Python 비교 검증 스크립트 + AI 마이크로서비스 계획 완료 |
| 2026-01-25 | **Railway 배포 완료**: 프론트엔드-백엔드 통신 이슈 4건 해결, 회원가입/로그인 정상 작동 |
| 2026-01-27 | **Phase 3.5 완료 (80%)**: 근무자 등록 시스템 구현 (DB/API/UI), 랜딩페이지 마케팅 문구 수정, DB 스키마 문서화 |
| 2026-01-28 | **Phase 5 핵심 완료**: 급여대장 백엔드 API (PayrollController, PayrollService) + 프론트엔드 UI (목록/상세 페이지, 월간 템플릿) + DB 마이그레이션 (V3) 배포 완료 |
| 2026-01-28 | **Phase 5 기능 추가**: PAID 상태 수정 버튼, 계산식 상세 표시 (SalaryResultStitch), 급여대장 계산 결과 저장 (PayrollEntryRequest 확장), 시프트 기간 선택 (ShiftInput periodStart/periodEnd) |
| 2026-01-29 | **Phase 3.7 완료**: 시뮬레이션 API/UI 버그 수정 (URL 중복, response.data 접근), 주휴수당 계산 법적 공식 수정 |
| 2026-01-29 | **Phase 3.8 제거**: 근로계약서 기능 삭제 (사용자 요청), Phase 3.9 → Phase 3.8로 번호 재정렬 |
| 2026-01-29 | **Phase 3.8 완료**: 급여명세서 PDF/CSV, 시프트 CSV 가져오기/내보내기, 시프트 검증 (한국 근로기준법) |
| 2026-01-29 | **Phase 4 완료**: AdSense Auto Ads, SEO 최적화 (sitemap/robots), 블로그 콘텐츠 2개 추가, Code Splitting (17% 번들 감소) |
| 2026-01-29 | **급여 계산 버그 수정 (v1.3.0)**: 5인 미만 174시간 초과분 누락 해결, 월간 템플릿 휴일근로 자동 설정 버그 수정, Tooltip 모바일 화면 밖 표시 버그 수정 |
| 2026-01-31 | **Phase 6 AI 챗봇 완료 (v1.5.0)**: Python FastAPI 마이크로서비스 + LangGraph Agent + Tiered LLM (Gemini→Groq→GPT) + RAG (법령API + 벡터검색) + 사용자 데이터 조회 도구 + Railway 배포 |
| 2026-01-31 | **Phase 7 계획 확정**: 결제 서비스 Polar (4%+$0.40, MoR), 이메일 Resend, Free 플랜 제한 (직원 3명, AI 10회, 급여계산 5회), 6단계 구현 계획 수립 |

---

**작성자**: Claude Code
**마지막 업데이트**: 2026-01-31 (Phase 7 계획 확정)
