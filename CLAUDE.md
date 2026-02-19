# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

한국 근로기준법 및 세법에 따른 근로자의 실수령액을 계산하는 웹 기반 급여 계산기입니다.

**목표 사용자**: 영세 사업장 사업주, 근로자, 노무사 보조 도구

**핵심 원칙**: 법적 정확성 > 기능 풍부함. 틀린 계산보다 없는 기능이 낫습니다.

## 기술 스택

- **백엔드**: Kotlin + Spring Boot 3.2.2 (도메인 주도 설계 적용)
  - 멀티모듈: api / domain / infrastructure / common
  - JPA + PostgreSQL
  - JWT 인증 (Spring Security)
- **프론트엔드**: React 19 + TypeScript + Tailwind CSS + FullCalendar
- **DB**: PostgreSQL (Railway)
- **배포**: Railway (백엔드) + Cloudflare Pages (프론트엔드)

## 코드 아키텍처

### 도메인 주도 설계 (DDD) 구조

백엔드는 멀티모듈 구조로 구성되어 있습니다:

```
backend-spring/
├── api/                 # API 계층 (Controller, DTO)
│   └── src/main/kotlin/com/paytools/api/
│       ├── controller/      # REST Controller
│       └── dto/             # Request/Response DTO
├── domain/              # 도메인 계층 (순수 비즈니스 로직)
│   └── src/main/kotlin/com/paytools/domain/
│       ├── model/           # 도메인 모델 (Employee, WorkShift, Allowance)
│       ├── vo/              # 값 객체 (Money, WorkingHours)
│       └── service/         # 도메인 서비스
│           ├── SalaryCalculator.kt           # 급여 계산 오케스트레이터
│           ├── InsuranceCalculator.kt        # 4대 보험 계산
│           ├── TaxCalculator.kt              # 소득세 계산
│           ├── OvertimeCalculator.kt         # 연장/야간/휴일 수당 계산
│           └── WeeklyHolidayPayCalculator.kt # 주휴수당 계산
├── infrastructure/      # 인프라 계층 (JPA, Security)
│   └── src/main/kotlin/com/paytools/infrastructure/
│       ├── entity/          # JPA Entity
│       ├── repository/      # JPA Repository
│       └── security/        # JWT, Spring Security
└── common/              # 공통 유틸리티
```

### 핵심 설계 원칙

1. **Money 값 객체**: 모든 금액은 `Money` 객체로 다룹니다. Decimal 기반으로 정확한 계산을 보장하며, 모든 금액은 원 단위로 반올림합니다 (`ROUND_HALF_UP`).

2. **WorkingHours 값 객체**: 시간은 **분 단위**로 저장 및 계산하고, 표시 시에만 "시간:분" 형식으로 변환합니다.

3. **야간근로 자동 분리**: `WorkShift.calculate_night_hours()`는 22:00~06:00 구간을 1분 단위로 순회하며 자동 분리합니다.

4. **연장근로 주 단위 계산**: `OvertimeCalculator`는 시프트를 주 단위로 그룹화하여 주 40시간 초과분만 연장근로로 계산합니다 (ISO 주 기준, 월요일 시작).

5. **통상시급 계산**:

   **중요: 209시간 vs 174시간**

   - **209시간**: 최저임금 월 환산 기준 (주휴수당 포함)
     - 용도: 월급제 기본급 → 시급 환산
     - 예: 2,156,880원 ÷ 209 = 10,320원
     - 적용 대상: 주휴수당이 기본급에 이미 포함된 경우

   - **174시간**: 실제 근로시간 기준 (주휴수당 제외) ← **본 프로젝트 사용**
     - 용도: 통상임금 → 통상시급 → 가산수당 계산
     - 예: 2,800,000원 ÷ 174 = 16,092원
     - 적용 대상: 주휴수당을 별도로 계산하는 경우

   **본 시스템의 계산 흐름:**
   ```
   통상임금 (기본급 + 통상임금 포함 수당)
        ↓
   통상시급 = 통상임금 ÷ 174시간  ← 실제 근로시간
        ↓
   연장/야간/휴일 가산수당 = 통상시급 × 가산율
        ↓
   주휴수당 = 통상시급 × 8시간 × 4.345주 (별도 계산)
   ```

   ⚠️ **주휴수당 포함 여부:**
   - 기본급에 주휴수당 **포함되지 않음** (별도 지급)
   - 209시간 사용 시 이중 계산 문제 발생
   - 174시간 사용으로 정확한 분리 보장

   **모든 가산수당은 통상시급 기준으로 계산됩니다.**

6. **수당 분류 시스템**: `Allowance` 엔티티는 4가지 플래그로 수당을 정확히 분류합니다:
   - `is_taxable`: 과세 대상 여부
   - `is_includable_in_minimum_wage`: 최저임금 산입 여부
   - `is_fixed`: 고정 수당 여부
   - `is_included_in_regular_wage`: 통상임금 포함 여부

## 법적 계산 규칙 (2026년 기준)

### 최저임금 산입 기준
- **산입**: 기본급, 고정 직책수당
- **비산입**: 연장·야간·휴일 가산분, 식대(20만원 한도), 실비변상 수당
- **계산식**: 산입임금 기준 시급 = (기본급 + 산입수당) ÷ 월 소정근로시간 (174시간)

### 4대 보험 요율 (2026년, 연금개혁 반영)
- 국민연금: 4.75% (상한 590만원, 하한 39만원) - 2026년 연금개혁으로 인상
- 건강보험: 3.595%
- 장기요양보험: 건강보험료 × 13.14% - 2026년 인상
- 고용보험: 0.9% (상한 1350만원)

### 가산수당 계산
- 연장근로: 통상시급 × 1.5배 (주 40시간 초과)
- 야간근로: 통상시급 × 0.5배 (22:00~06:00, 가산분만)
- 휴일근로: 통상시급 × 1.5배 (8시간 이하)
- 휴일근로 8시간 초과: 통상시급 × 2.0배 (5인 이상 사업장만)

### 주휴수당 계산
```
주휴수당 = (1주 소정근로시간 ÷ 40) × 8 × 통상시급
```
- 적용 조건: 주 15시간 이상, 소정근로일 개근
- 5인 미만 사업장도 의무 적용

## 코드 작성 규칙

### 계산 로직
- 모든 계산 함수는 **순수 함수**로 작성 (사이드 이펙트 없음)
- 금액은 `Money` 객체 사용, 연산 후 `.round_to_won()` 호출
- 시간은 `WorkingHours` 객체 사용, 내부적으로 분 단위 저장
- 휴게시간 제외 필수 (`calculate_working_hours()` 메서드에서 자동 처리)

### Docstring 규칙
- 모든 함수/클래스에 docstring 필수
- 계산식이 포함된 경우 Examples 섹션에 명시
- 관련 법 조문 주석 추가 (예: `# 근로기준법 제56조`)

### 검증 규칙
- Entity의 `__post_init__`에서 값 검증 수행
- 음수 방지: 금액, 시간, 부양가족 수 등
- 논리적 일관성 검증: 20세 이하 자녀 수 ≤ 부양가족 수

### 테스트 시나리오 (반드시 포함)
1. 풀타임 주5일 근무 (기본 케이스)
2. 주6일 근무 (주휴수당 정상)
3. 단시간 근로 (주 24시간, 주휴수당 비례)
4. 야간근로 포함 (22:00~06:00 자동 분리)
5. 휴일근로 (일요일 근무)
6. 5인 미만 사업장 (휴일근로 8시간 초과 시 가산율 차이)
7. 최저임금 미달 케이스

## 법적 안전장치

### 경고 메시지 (필수)
- 최저임금 미달: "노동청 신고 가능 사항"
- 연장근로 과다: "주 52시간 위반 가능성"
- 역산 기능: "포괄임금제 오용 주의"

### 면책 조항
모든 계산 결과에 포함:
```
⚠️ 법적 고지
본 계산기는 참고용이며, 실제 급여 지급 시
노무사 또는 세무사와 상담하시기 바랍니다.
계산 결과로 인한 법적 책임은 사용자에게 있습니다.
```

## 문서 활용 가이드

### 작업 시작 전 필수 확인

**순서대로 읽기 (토큰 효율성 94% 향상)**:
1. **[PROJECT_INDEX.md](./PROJECT_INDEX.md)** - 프로젝트 전체 구조 파악 (~3K 토큰)
2. **[docs/INDEX.md](./docs/INDEX.md)** - 작업 유형별 참고문서 매핑
3. 해당 작업에 필요한 문서만 선택적으로 읽기 (전체 읽기 금지)

### 작업 유형별 필수 문서

| 작업 유형 | 필수 문서 |
|----------|----------|
| **프론트엔드** | `docs/04-development/frontend-guide.md` |
| **백엔드 API** | `docs/04-development/backend-guide.md`, `docs/03-architecture/api-reference.md` |
| **급여 계산** | 본 문서 (법적 계산 규칙 섹션) |
| **배포** | `docs/05-deployment/deployment-guide.md` |
| **문제 해결** | `docs/06-operations/troubleshooting.md` |
| **신규 기능** | `docs/01-business/roadmap.md` |

### 작업 완료 후 업데이트 체크리스트
- [ ] API 변경 시 → `docs/03-architecture/api-reference.md` 업데이트
- [ ] DB 변경 시 → `docs/03-architecture/database-schema.md` 업데이트
- [ ] 기능 완료 시 → `docs/07-planning/todo-list.md` 업데이트
- [ ] 버그 수정 시 → `docs/06-operations/troubleshooting.md` 추가 (재발 방지)

## Git Branch 전략

### 브랜치 네이밍
```
feature/기능명    # 새 기능: feature/payroll-ledger
fix/이슈명        # 버그 수정: fix/overtime-calculation
docs/문서명       # 문서: docs/api-reference
hotfix/이슈명     # 긴급 수정: hotfix/login-error
```

### 작업 흐름
```bash
# 1. 최신 main 동기화
git checkout main && git pull origin main

# 2. 브랜치 생성
git checkout -b feature/기능명

# 3. 작업 후 커밋 (컨벤션 준수)
git commit -m "feat: 기능 설명"

# 4. 푸시 및 PR
git push -u origin feature/기능명
```

### 커밋 메시지 컨벤션
| 타입 | 설명 |
|------|------|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 |
| `refactor` | 리팩토링 |
| `test` | 테스트 추가 |
| `chore` | 빌드, 설정 변경 |

## 참고 문서

### 핵심 문서 (자주 사용)
- **[PROJECT_INDEX.md](./PROJECT_INDEX.md)**: 프로젝트 전체 구조 (세션 시작 시 필독)
- **[docs/INDEX.md](./docs/INDEX.md)**: 작업별 참고문서 매핑
- **[docs/03-architecture/api-reference.md](./docs/03-architecture/api-reference.md)**: API 명세
- **[docs/06-operations/troubleshooting.md](./docs/06-operations/troubleshooting.md)**: 문제 해결

### 비즈니스 문서
- **[docs/01-business/service-overview.md](./docs/01-business/service-overview.md)**: 서비스 개요, 가치 제안
- **[docs/01-business/pricing-policy.md](./docs/01-business/pricing-policy.md)**: 요금제 정책
- **[docs/01-business/roadmap.md](./docs/01-business/roadmap.md)**: 제품 로드맵 (Q1~Q4 2026)

## 현재 구현 상태

### 백엔드 - Spring Boot (완료, Railway 배포됨)
- [x] Kotlin + Spring Boot 3.2.2 멀티모듈 프로젝트
- [x] 도메인 모델 설계 (Domain Model, Value Object)
- [x] 4대 보험 계산 로직 (2026년 요율)
- [x] 연장/야간/휴일 수당 계산 로직
- [x] 주휴수당 계산 로직 (비례 계산 포함)
- [x] 급여 계산 오케스트레이터
- [x] 소득세 계산 로직 (간이세액표 적용)
- [x] JWT 인증 (Spring Security)
- [x] REST API 엔드포인트
  - [x] 인증 API (POST /api/v1/auth/register, /login)
  - [x] 급여 계산 API (POST /api/v1/salary/calculate)
  - [x] 보험료 조회 API (GET /api/v1/insurance/rates, POST /api/v1/insurance/calculate)
  - [x] 세금 계산 API (POST /api/v1/tax/calculate, POST /api/v1/tax/estimate-annual)
  - [x] 직원 관리 API (CRUD /api/v1/employees)
  - [x] 급여대장 API (CRUD /api/v1/payroll/periods, /entries, /shifts, /contracts)
- [x] 통합 테스트 (20개 테스트 전체 통과)
- [x] Railway 배포 완료 (https://calcul-production.up.railway.app)

### 프론트엔드 (완료, Cloudflare Pages 배포됨)
- [x] React 19 + Vite + TypeScript 프로젝트
- [x] Tailwind CSS 설정 및 기본 스타일
- [x] 마케팅 랜딩페이지 (12개 섹션, DataValueSection 포함)
- [x] 급여 계산기 페이지 (/calculator)
- [x] 대시보드 페이지 (/dashboard, 인건비 추이 차트 포함)
- [x] 로그인/회원가입 페이지
- [x] 직원 관리 페이지 (/employees)
- [x] 급여대장 페이지 (/payroll, /payroll/:id)
- [x] 월간 템플릿 입력 (요일 체크박스 + 시간 라디오버튼)
- [x] API 클라이언트 레이어 및 TypeScript 타입
- [x] 급여 계산 API 연동 완료
- [x] 인증 API 연동 완료 (회원가입/로그인)
- [x] Cloudflare Pages 배포 완료 (https://paytools.work)

### UI/UX 디자인 시스템
- [x] 전역 카드/버튼 인터랙션 통일 (hover lift + shadow + gradient CTA)
- [x] 글래스모피즘 모달 (backdrop-blur-md + bg-white/95)
- [x] Pricing 카드 스타일 강화 (인기 플랜 scale-105 + gradient CTA)
- [x] 대시보드 인건비 추이 차트 (LineChart 컴포넌트 활용)
- [x] 랜딩페이지 "데이터 누적 가치" 섹션 (DataValueSection)
- [x] UpgradeModal (이용 한도 도달 시 Polar 결제 연동)
- [x] 서비스 사용 가이드 (/guide/how-to-use, WageType 의사결정 도우미)

### 향후 개발 계획
- [x] 근무자 등록 시스템 (Phase 3.5) ✅ 완료
- [x] 급여대장 기능 (Phase 5) ✅ 핵심 완료 (PDF/엑셀 출력 미구현)
- [ ] AI 노무 챗봇 - Python 마이크로서비스 (Phase 6)
- [ ] 급여명세서 PDF 출력
- [ ] E2E 테스트 추가
- [ ] 백엔드 급여 분석 API (월별 집계, 직원별 추이)

## 중요 알림

- **계산식 투명성**: API 응답에 모든 계산 과정을 포함 (`to_dict()` 메서드의 `calculation` 필드 참조)
- **경고는 과도하게**: 법적 리스크가 있으면 반드시 경고 표시
- **매년 업데이트 필요**: 보험료율/최저임금은 매년 1월 변경됨 (DB 버전 관리 필수)
- **코드 작성 가이드**: 파일당 200줄이 넘어가지 않게 작성할것(God Object방지), 최대한 간결하고 깔끔하게 작성하고 tyding 코딩할것
## 문서 보관
- **본 프로젝트의 의미**: 본 프로젝트는 실제 상용 서비스로 운영됩니다. 프로젝트 기획서, 사용기술 목록, 요구사항 정의서 및 명세서, 화면 설계서, UML, 주요 서비스 기능 및 소스코드, 테스트 코드, 테스트 결과, 소프트웨어 아키텍처, 향후 개발 계획 등을 문서로 정리하여 보관합니다.
- **문서 보관 위치**: calcul/docs 폴더에 문서를 정리하여 보관합니다.

[범위]
- 문제 해결과 구현에 필요한 핵심파일만만

[목표]
- 문제 해결

[제약]
- 설명 최소
- 코드 중심
- 불필요한 리팩토링 금지
