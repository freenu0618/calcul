# PRD: 급여대장 + AI 노무 챗봇 (Payroll Ledger & AI Assistant)

**문서 버전**: v2.0
**작성일**: 2026-01-22
**작성자**: Claude Code + 사용자 협업
**상태**: Draft

---

## 1. 개요

### 1.1 배경
paytools.work는 현재 단일 급여 계산 기능만 제공하고 있습니다. 사업주가 여러 직원의 급여를 월별로 관리하고, **AI 기반 노무 상담**을 받을 수 있는 통합 솔루션이 필요합니다.

### 1.2 목적
1. **포트폴리오 완성도**: 취업용 프로젝트로서 기능 풍부함 + AI 기술 강조
2. **사업주 편의**: 다수 직원의 급여를 월별로 일괄 관리
3. **법적 의무 이행**: 근로기준법상 임금대장 3년 보관 의무 지원
4. **AI 노무 상담**: 노무사 없이도 전문가 수준의 급여 관리 지원

### 1.3 목표 사용자
- **Primary**: 영세 사업장 사업주 (5인 이하)
- **Secondary**: 소규모 사업장 (6~30명)
- **Tertiary**: 노무사/세무사 보조 도구

### 1.4 가치 제안 (Value Proposition)
> **"노무사 없이도, 전문가 수준의 급여 관리"**
> - AI가 계산 근거 설명
> - 법적 리스크 자동 감지
> - 24시간 노무 상담

---

## 2. 요금제 및 비즈니스 모델

### 2.1 시장 포지셔닝

```
┌─────────────────────────────────────────────────────┐
│                    서비스 비용                       │
│  높음 ▲                                             │
│       │  ┌────────────────┐                         │
│       │  │ 급여 아웃소싱   │ 인당 1~1.5만원/월      │
│       │  │ (ZUZU, Flex등) │ + 전문가 대행 서비스   │
│       │  └────────────────┘                         │
│       │                                             │
│       │           ┌──────────────────┐             │
│       │           │ paytools.work    │ ⭐ 목표     │
│       │           │ 셀프 SaaS + AI   │             │
│       │           └──────────────────┘             │
│       │                                             │
│       │  ┌────────────────┐                         │
│       │  │ 무료 계산기    │ 알바천국, 사람인 등    │
│  낮음 │  │ (단순 기능)    │                         │
│       └──┴────────────────┴─────────────────────▶  │
│                           서비스 범위               │
└─────────────────────────────────────────────────────┘
```

### 2.2 경쟁사 분석

#### 급여 아웃소싱 (전문가 대행)
| 서비스 | 가격 | 서비스 범위 |
|-------|------|------------|
| ZUZU 페이롤 | 1만원/인 + α | 급여계산, 4대보험신고, 세무신고, 연말정산 |
| Flex 페이롤 | 1.3~1.5만원/인 | 급여, 퇴직금, 4대보험, 원천세, 연말정산, HR |
| 월급날 | 인원 기준 | 급여계산/이체/대납, 4대보험, 연말정산 |
| 조인스페이 | 인원 기준 | 인사관리, 급여/4대보험, 노무/세무 자문 |
| 메타페이 | 인원 기준 | 급여계산, 4대보험, 퇴직금, 연말정산 |

#### HR SaaS (셀프 서비스)
| 서비스 | 가격 | 특징 |
|-------|------|------|
| flex | 10명 월 7만원, 인당 +7,000원 | 종합 HR |
| ECOUNT | 월 ~7만원 (무제한) | ERP 통합 |

#### 핵심 차이점
> **급여 아웃소싱**: 전문가가 대신 처리 (인건비 포함) - **다른 시장**
> **paytools.work**: 사용자가 직접 사용 + AI 보조 - **셀프 서비스 SaaS**

### 2.3 paytools.work 요금제 (AI 챗봇 포함)

#### Free (무료)
| 항목 | 내용 |
|-----|------|
| **가격** | 0원 |
| 직원 수 | 5명까지 |
| 급여 계산 | 월 5회 |
| 🤖 **AI 챗봇** | **월 10회** (기본 Q&A) |
| 급여대장 | 최근 3개월 |
| PDF 명세서 | ❌ |
| 엑셀 내보내기 | ❌ |

#### Starter (신설)
| 항목 | 내용 |
|-----|------|
| **가격** | **₩4,900/월** |
| **연간 결제** | ₩49,000/년 (월 4,083원) |
| 직원 수 | 5명까지 |
| 급여 계산 | 무제한 |
| 🤖 **AI 챗봇** | **월 30회** |
| 급여대장 | 전체 기간 |
| PDF 명세서 | ✅ |
| 엑셀 내보내기 | ❌ |

#### Basic
| 항목 | 내용 |
|-----|------|
| **정가** | ~~₩39,900/월~~ |
| **런칭 특가** | **₩14,900/월** (63% 할인) |
| **연간 결제** | ₩149,000/년 (월 12,417원) |
| 직원 수 | 10명까지 |
| 급여 계산 | 무제한 |
| 🤖 **AI 챗봇** | **월 100회** + 계산근거 설명 |
| 급여대장 | 전체 기간 |
| PDF 명세서 | ✅ |
| 엑셀 내보내기 | ❌ |

#### Pro
| 항목 | 내용 |
|-----|------|
| **정가** | ~~₩79,900/월~~ |
| **런칭 특가** | **₩29,900/월** (63% 할인) |
| **연간 결제** | ₩299,000/년 (월 24,917원) |
| 직원 수 | 30명까지 |
| 급여 계산 | 무제한 |
| 🤖 **AI 챗봇** | **무제한** + 법령검색 + 맞춤분석 |
| 급여대장 | 전체 기간 |
| PDF 명세서 | ✅ |
| 엑셀 내보내기 | ✅ |
| 연간 통계 | ✅ |

#### Enterprise
| 항목 | 내용 |
|-----|------|
| **가격** | 별도 문의 |
| 직원 수 | 무제한 |
| 🤖 **AI 챗봇** | **전용 모델** + 사내규정 학습 |
| 전용 지원 | ✅ |
| API 연동 | ✅ |

### 2.4 경쟁 우위

```
flex vs paytools.work (10명 기준)
├── flex: 월 70,000원 (AI 챗봇 없음)
├── paytools.work: 월 14,900원 (AI 챗봇 포함!)
└── 절감: 약 78% 저렴 + AI 노무상담 포함!
```

### 2.5 비용 구조 (AI 챗봇)

| 항목 | 예상 비용 |
|-----|----------|
| LLM API (질문당) | 50~100원 |
| Free 10회/월 | 500~1,000원 (마케팅 비용) |
| Basic 100회/월 | 5,000~10,000원 |
| Pro 무제한(추정 300회) | 15,000~30,000원 |

→ **Pro 29,900원이면 마진 확보 가능**

### 2.6 구현 우선순위
> **중요**: 결제 시스템이 아직 미구현 상태이므로, 요금제 관련 기능은 구현 후 비활성화(주석/플래그) 처리합니다.

```
Phase 1: 무료 기능 전체 오픈 (급여대장 + AI 챗봇 기본)
Phase 2: 유료 기능 UI만 구현 (Coming Soon 표시)
Phase 3: 결제 연동 후 활성화
Phase 4: AI 챗봇 고급 기능 (법령검색, 맞춤분석)
```

---

## 3. 기능 요구사항

### 3.1 직원 관리 (Employee Management)

#### FR-EMP-001: 직원 등록
- 사업주가 직원 정보를 등록할 수 있어야 함
- **필수 필드**: 이름, 고용형태, 사업장 규모, 부양가족 수
- **선택 필드**: 입사일, 메모
- **제약**: 무료 플랜은 5명까지

#### FR-EMP-002: 직원 목록 조회
- 등록된 직원 목록을 조회할 수 있어야 함
- 정렬: 이름순, 입사일순, 최근 등록순
- 검색: 이름으로 검색

#### FR-EMP-003: 직원 정보 수정/삭제
- 직원 정보를 수정/삭제할 수 있어야 함
- 삭제 시 연결된 급여 기록은 유지 (soft delete)

### 3.2 근무 계약 관리 (Work Contract)

#### FR-CON-001: 계약 등록
- 직원별 근무 조건을 등록할 수 있어야 함
- **필수 필드**:
  - 계약 유형: 월급제 / 시급제
  - 기본 금액: 월급 또는 시급
  - 주 소정근로시간 (기본 40시간)
  - 주 근무일수 (기본 5일)
- **선택 필드**:
  - 계약 시작일, 종료일
  - 수당 목록

#### FR-CON-002: 계약 이력 관리
- 직원별 계약 변경 이력 조회
- 현재 유효 계약 자동 판별

### 3.3 출퇴근 기록 (Work Shifts)

#### FR-SFT-001: 캘린더 UI 입력
- FullCalendar 기반 시각적 시프트 입력
- 드래그 앤 드롭으로 시프트 생성/수정
- 주간/월간 뷰 전환

#### FR-SFT-002: 템플릿 일괄 입력
- 프리셋 템플릿으로 한 달치 자동 생성
- **기본 템플릿**:
  - 주 5일 풀타임 (09:00-18:00)
  - 주 4일 풀타임 (09:00-18:00)
  - 주 6일 풀타임 (09:00-18:00)
  - 오전조 (06:00-14:00)
  - 오후조 (14:00-22:00)
  - 야간조 (22:00-06:00)
- 사용자 정의 템플릿 저장

#### FR-SFT-003: 시프트 상세 입력
- 날짜별 출근/퇴근 시각
- 휴게시간 (분 단위)
- 휴일근로 여부 체크

### 3.4 급여대장 (Payroll Ledger)

#### FR-PAY-001: 월별 급여 기간 생성
- 연도/월 선택하여 급여 기간 생성
- 상태 관리: 초안(DRAFT) → 확정(CONFIRMED) → 지급완료(PAID)

#### FR-PAY-002: 급여 일괄 계산
- 선택한 직원들의 급여를 일괄 계산
- 기존 SalaryCalculator 로직 재사용
- 계산 결과 자동 저장

#### FR-PAY-003: 급여대장 조회
- 월별 전체 직원 급여 목록
- 합계 표시: 총 지급액, 총 공제액, 총 실수령액
- 직원별 상세 내역 펼쳐보기

#### FR-PAY-004: 급여대장 확정
- DRAFT → CONFIRMED 상태 변경
- 확정 후 수정 불가 (법적 기록 보존)
- 확정 취소는 관리자만 가능

### 3.5 PDF 급여명세서 (Payslip PDF)

#### FR-PDF-001: 개인 급여명세서 생성
- 법적 요구사항 준수 급여명세서 PDF 생성
- **필수 항목** (임금명세서 교부 의무, 근로기준법 제48조):
  - 근로자 성명
  - 급여 지급일
  - 임금 산정 기간
  - 임금 총액
  - 공제 항목별 금액과 근거
  - 실지급액

#### FR-PDF-002: 일괄 다운로드
- 월별 전체 직원 급여명세서 ZIP 다운로드

### 3.6 엑셀 내보내기 (Excel Export)

#### FR-XLS-001: 급여대장 엑셀 내보내기
- 월별 급여대장을 엑셀 파일로 다운로드
- 항목: 직원명, 기본급, 수당, 4대보험, 소득세, 실수령액

#### FR-XLS-002: 연간 통계 엑셀
- 연간 급여 지급 현황 리포트
- 직원별, 월별 피벗 테이블

### 3.7 경고 시스템 (Warnings)

#### FR-WRN-001: 최저임금 미달 경고
- 시급 계산 시 최저임금(10,320원) 미달 경고
- "⚠️ 노동청 신고 가능 사항" 메시지

#### FR-WRN-002: 주 52시간 위반 경고
- 주 단위 근로시간 52시간 초과 시 경고
- 연장근로 12시간 한도 안내

#### FR-WRN-003: 플랜 제한 경고
- 무료 플랜 직원 수 초과 시 업그레이드 안내
- 월별 계산 횟수 초과 시 안내

### 3.8 AI 노무 챗봇 (AI Labor Consultant)

#### FR-AI-001: 기본 Q&A (Tier 1 - Free/Starter)
- 최저임금 관련 질문 응답
- 4대보험 요율 안내
- 기본 근로기준법 안내
- 일반적인 급여 계산 방법 설명

#### FR-AI-002: 계산 근거 설명 (Tier 2 - Basic)
- 사용자 급여 계산 결과 해석
- "왜 이렇게 계산되었나요?" 상세 설명
- 세부 항목별 법적 근거 안내
- 주휴수당/연장수당 계산 로직 설명

#### FR-AI-003: 심화 분석 (Tier 3 - Pro)
- 법령 조문 검색 및 해석
- 유사 판례 참조
- 맞춤형 노무 리스크 분석
- "우리 회사 상황에서는?" 컨텍스트 분석
- 문서 업로드 분석 (근로계약서 검토 등)

#### FR-AI-004: 전용 서비스 (Tier 4 - Enterprise)
- 사내 취업규칙 학습
- 전용 Fine-tuning 모델
- 사내 시스템 연동 (Slack, Teams)
- 실시간 법령 업데이트 알림

#### FR-AI-005: 사용량 관리
- 플랜별 월간 질문 횟수 제한
- 남은 횟수 표시
- 초과 시 업그레이드 안내
- 월초 자동 리셋

### 3.9 AI 챗봇 기술 명세

#### 기술 스택
```
┌─────────────────────────────────────────┐
│            paytools AI 챗봇             │
├─────────────────────────────────────────┤
│  LangGraph (대화 흐름 관리)             │
│  └── Intent 분류 → Context 수집        │
│      → RAG 검색 → 계산 → 응답 생성     │
├─────────────────────────────────────────┤
│  LangChain (LLM 오케스트레이션)         │
│  └── Prompt Template, Chain, Agent     │
├─────────────────────────────────────────┤
│  Vector DB (법령/판례 임베딩)           │
│  └── 근로기준법, 최저임금법, 판례 등   │
├─────────────────────────────────────────┤
│  LLM API (Claude / GPT-4)               │
└─────────────────────────────────────────┘
```

#### LangGraph 대화 흐름
```
사용자 질문
    │
    ▼
┌─────────────────────────────────────┐
│ Intent Classification Node          │
│ → 질문 유형 분류 (급여/보험/법률 등)│
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Context Gathering Node              │
│ → 사용자 플랜 확인                  │
│ → 회사 정보 (5인 이상/미만) 조회    │
│ → 이전 대화 컨텍스트 로드           │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ RAG Node (법령 검색)                │
│ → Vector DB에서 관련 법령 검색      │
│ → 관련 판례 검색 (Pro 이상)         │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Calculation Node (필요시)           │
│ → 기존 SalaryCalculator 호출        │
│ → 구체적 금액 계산 예시 생성        │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Response Generation Node            │
│ → 플랜별 응답 상세도 조절           │
│ → Free: 기본 답변                   │
│ → Pro: 상세 법적 근거 + 계산 예시   │
└─────────────────────────────────────┘
```

#### 응답 예시

**Free 응답:**
```
야간근로(22:00~06:00)는 통상임금의 50%를 가산해야 합니다.
예: 시급 10,000원 → 야간 가산분 5,000원 추가
```

**Pro 응답:**
```
야간근로(22:00~06:00)는 통상임금의 50%를 가산해야 합니다.

📜 법적 근거: 근로기준법 제56조 제2항
"사용자는 야간근로에 대하여는 통상임금의 100분의 50 이상을
가산하여 근로자에게 지급하여야 한다."

💰 계산 예시 (귀사 기준):
- 통상시급: 16,092원
- 야간 가산분: 16,092 × 0.5 = 8,046원
- 야간 1시간당 총 지급: 24,138원

⚠️ 참고: 5인 미만 사업장은 야간근로 가산 의무가 면제되나,
귀사는 5인 이상으로 등록되어 있어 적용 대상입니다.
```

---

## 4. 비기능 요구사항

### 4.1 성능
- 급여 일괄 계산: 30명 기준 5초 이내
- 페이지 로딩: 2초 이내
- PDF 생성: 3초 이내

### 4.2 보안
- 급여 데이터 암호화 저장
- 사용자별 데이터 격리 (user_id FK)
- JWT 인증 필수

### 4.3 데이터 보존
- 급여 기록 최소 3년 보관 (법적 요구)
- 삭제 시 soft delete 처리

### 4.4 호환성
- 데스크톱: Chrome, Safari, Edge 최신 2버전
- 모바일: 반응형 UI

---

## 5. 데이터베이스 스키마

### 5.1 ERD 개요

```
users (기존)
  │
  ├── employees (기존, 확장)
  │     │
  │     ├── work_contracts (신규)
  │     │
  │     └── work_shifts (신규)
  │
  └── payroll_periods (신규)
        │
        └── payroll_entries (신규)
```

### 5.2 테이블 상세

#### work_contracts (근무 계약)
```sql
CREATE TABLE work_contracts (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    contract_type VARCHAR(20) NOT NULL, -- 'MONTHLY' | 'HOURLY'
    base_amount INTEGER NOT NULL,        -- 월급 또는 시급 (원)
    scheduled_hours_per_week INTEGER DEFAULT 40,
    scheduled_days_per_week INTEGER DEFAULT 5,
    effective_date DATE NOT NULL,
    end_date DATE,                       -- NULL이면 현재 유효
    allowances_json TEXT DEFAULT '[]',   -- 고정 수당 목록
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### work_shifts (출퇴근 기록)
```sql
CREATE TABLE work_shifts (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_minutes INTEGER DEFAULT 60,
    is_holiday_work BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (employee_id, date)  -- 직원별 날짜 중복 방지
);
```

#### payroll_periods (급여 기간)
```sql
CREATE TABLE payroll_periods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT', -- 'DRAFT' | 'CONFIRMED' | 'PAID'
    confirmed_at TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, year, month)
);
```

#### payroll_entries (급여대장 엔트리)
```sql
CREATE TABLE payroll_entries (
    id SERIAL PRIMARY KEY,
    payroll_period_id INTEGER NOT NULL REFERENCES payroll_periods(id),
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    contract_id INTEGER REFERENCES work_contracts(id),

    -- 계산 입력
    base_salary INTEGER NOT NULL,
    allowances_json TEXT DEFAULT '[]',
    total_work_minutes INTEGER DEFAULT 0,
    overtime_minutes INTEGER DEFAULT 0,
    night_minutes INTEGER DEFAULT 0,
    holiday_minutes INTEGER DEFAULT 0,

    -- 계산 결과
    regular_wage INTEGER,
    hourly_wage INTEGER,
    overtime_pay INTEGER,
    night_pay INTEGER,
    holiday_pay INTEGER,
    weekly_holiday_pay INTEGER,
    total_gross INTEGER,

    -- 공제
    national_pension INTEGER,
    health_insurance INTEGER,
    long_term_care INTEGER,
    employment_insurance INTEGER,
    income_tax INTEGER,
    local_income_tax INTEGER,
    total_deductions INTEGER,

    -- 실수령액
    net_pay INTEGER,

    -- 메타데이터
    calculation_detail TEXT,  -- JSON 상세 내역
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (payroll_period_id, employee_id)
);
```

#### subscription_plans (구독 플랜) - Phase 3
```sql
-- 결제 연동 시 활성화
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    plan_type VARCHAR(20) NOT NULL,  -- 'FREE' | 'STARTER' | 'BASIC' | 'PRO' | 'ENTERPRISE'
    billing_cycle VARCHAR(20),        -- 'MONTHLY' | 'ANNUAL'
    price_paid INTEGER,               -- 실제 결제 금액
    started_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### ai_chat_sessions (AI 챗봇 세션)
```sql
CREATE TABLE ai_chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    message_count INTEGER DEFAULT 0
);
```

#### ai_chat_messages (AI 챗봇 메시지)
```sql
CREATE TABLE ai_chat_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES ai_chat_sessions(id),
    role VARCHAR(20) NOT NULL,        -- 'user' | 'assistant'
    content TEXT NOT NULL,
    metadata_json TEXT,               -- 사용된 법령, 계산 결과 등
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### ai_usage_tracking (AI 사용량 추적)
```sql
CREATE TABLE ai_usage_tracking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    question_count INTEGER DEFAULT 0,
    last_reset_at TIMESTAMP,
    UNIQUE (user_id, year, month)
);
```

### 5.3 기존 테이블 확장

#### employees 테이블 확장
```sql
ALTER TABLE employees ADD COLUMN join_date DATE;
ALTER TABLE employees ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE'; -- 'ACTIVE' | 'RESIGNED'
ALTER TABLE employees ADD COLUMN resigned_at DATE;
```

---

## 6. API 명세

### 6.1 근무 계약 API

```
POST   /api/v1/contracts              - 계약 생성
GET    /api/v1/contracts              - 계약 목록
GET    /api/v1/contracts/{id}         - 계약 상세
PUT    /api/v1/contracts/{id}         - 계약 수정
DELETE /api/v1/contracts/{id}         - 계약 삭제
GET    /api/v1/employees/{id}/contracts - 직원별 계약 이력
```

### 6.2 시프트 API

```
POST   /api/v1/shifts                 - 시프트 생성
GET    /api/v1/shifts                 - 시프트 목록 (쿼리: employee_id, start_date, end_date)
PUT    /api/v1/shifts/{id}            - 시프트 수정
DELETE /api/v1/shifts/{id}            - 시프트 삭제
POST   /api/v1/shifts/bulk            - 시프트 일괄 생성 (템플릿)
```

### 6.3 급여대장 API

```
POST   /api/v1/payroll-periods        - 급여 기간 생성
GET    /api/v1/payroll-periods        - 급여 기간 목록 (쿼리: year)
GET    /api/v1/payroll-periods/{id}   - 급여 기간 상세 + 엔트리 목록
PUT    /api/v1/payroll-periods/{id}   - 급여 기간 수정 (상태 변경)
DELETE /api/v1/payroll-periods/{id}   - 급여 기간 삭제 (DRAFT만)

POST   /api/v1/payroll-periods/{id}/calculate  - 급여 일괄 계산
GET    /api/v1/payroll-periods/{id}/entries    - 엔트리 목록
GET    /api/v1/payroll-entries/{id}            - 엔트리 상세
```

### 6.4 PDF/Excel API

```
GET    /api/v1/payroll-entries/{id}/pdf   - 개인 급여명세서 PDF
GET    /api/v1/payroll-periods/{id}/pdf   - 전체 명세서 ZIP
GET    /api/v1/payroll-periods/{id}/excel - 급여대장 엑셀
GET    /api/v1/reports/annual/{year}      - 연간 통계 엑셀
```

### 6.5 AI 챗봇 API

```
POST   /api/v1/ai/chat                    - 챗봇 메시지 전송
GET    /api/v1/ai/sessions                - 세션 목록
GET    /api/v1/ai/sessions/{id}           - 세션 상세 (메시지 히스토리)
DELETE /api/v1/ai/sessions/{id}           - 세션 삭제
GET    /api/v1/ai/usage                   - 이번 달 사용량 조회
POST   /api/v1/ai/feedback                - 응답 피드백 (좋아요/싫어요)
```

#### POST /api/v1/ai/chat 요청/응답 예시

**Request:**
```json
{
  "session_id": "uuid-or-null",
  "message": "야간근로 수당은 어떻게 계산하나요?",
  "context": {
    "employee_id": 123,
    "calculation_id": 456
  }
}
```

**Response:**
```json
{
  "session_id": "uuid",
  "message_id": "uuid",
  "response": "야간근로(22:00~06:00)는 통상임금의 50%를...",
  "sources": [
    {"type": "law", "reference": "근로기준법 제56조 제2항"}
  ],
  "usage": {
    "used_this_month": 5,
    "limit": 10,
    "remaining": 5
  }
}
```

---

## 7. UI/UX 와이어프레임

### 7.1 페이지 구조

```
/dashboard                    - 대시보드 (월별 요약)
/employees                    - 직원 목록
/employees/{id}               - 직원 상세 (계약, 시프트 포함)
/employees/{id}/shifts        - 시프트 캘린더
/payroll                      - 급여대장 목록
/payroll/{year}/{month}       - 월별 급여대장
/payroll/{year}/{month}/entry/{id} - 급여 상세
/settings/subscription        - 구독 관리 (Coming Soon)
```

### 7.2 주요 화면

#### 급여대장 목록 (Payroll List)
```
┌─────────────────────────────────────────────┐
│ 급여대장                    [+ 새 급여 기간] │
├─────────────────────────────────────────────┤
│ 2026년                                      │
│ ┌─────────┬────────┬────────┬────────────┐ │
│ │ 월      │ 직원수 │ 총지급액│ 상태       │ │
│ ├─────────┼────────┼────────┼────────────┤ │
│ │ 1월     │ 5명    │ 15,000,000│ 🔵 확정  │ │
│ │ 2월     │ 5명    │ 계산 전  │ 📝 초안  │ │
│ └─────────┴────────┴────────┴────────────┘ │
└─────────────────────────────────────────────┘
```

#### 월별 급여대장 상세
```
┌─────────────────────────────────────────────────────┐
│ 2026년 1월 급여대장                    [PDF] [Excel]│
│ 상태: 🔵 확정                                       │
├─────────────────────────────────────────────────────┤
│ ┌────┬────────┬────────┬────────┬────────┬───────┐ │
│ │선택│ 이름   │ 기본급 │ 수당   │ 공제액 │실수령 │ │
│ ├────┼────────┼────────┼────────┼────────┼───────┤ │
│ │☑️  │홍길동  │2,500,000│350,000│450,000│2,400,000│
│ │☑️  │김철수  │2,200,000│200,000│380,000│2,020,000│
│ └────┴────────┴────────┴────────┴────────┴───────┘ │
│                                                     │
│ 합계: 총지급 4,700,000 / 총공제 830,000 / 총실수령 3,870,000│
│                                                     │
│ [일괄 계산] [급여대장 확정]                         │
└─────────────────────────────────────────────────────┘
```

---

## 8. 구현 우선순위

### Phase 1: 핵심 기능 (1주)
1. work_contracts, work_shifts 테이블 생성
2. 계약/시프트 CRUD API
3. 시프트 템플릿 일괄 생성
4. 급여 일괄 계산 (기존 로직 재사용)

### Phase 2: 급여대장 (1주)
1. payroll_periods, payroll_entries 테이블 생성
2. 급여대장 CRUD API
3. 급여대장 UI 구현
4. 상태 관리 (DRAFT → CONFIRMED)

### Phase 3: 출력 기능 (3일)
1. PDF 급여명세서 생성 (jsPDF)
2. 엑셀 내보내기 (SheetJS)
3. 연간 통계

### Phase 4: 캘린더 UI (3일)
1. FullCalendar 통합
2. 시프트 드래그 앤 드롭
3. 시프트 템플릿 UI

### Phase 5: AI 챗봇 기본 (1주)
1. ai_chat_sessions, ai_chat_messages, ai_usage_tracking 테이블 생성
2. LangChain 기반 기본 Q&A 구현
3. 법령 데이터 Vector DB 구축 (근로기준법, 최저임금법)
4. 챗봇 UI 컴포넌트 구현
5. 플랜별 사용량 제한 로직

### Phase 6: AI 챗봇 고급 (1주)
1. LangGraph 대화 흐름 구현
2. 계산 근거 설명 기능 (기존 SalaryCalculator 연동)
3. 판례 검색 기능 (Pro)
4. 맞춤 분석 기능 (회사 정보 컨텍스트)

### Phase 7: 구독 관리 (나중)
1. subscription_plans 테이블
2. 플랜 제한 로직 (직원 수, 계산 횟수, AI 사용량)
3. 결제 연동 (Toss Payments 등)

---

## 9. 법적 고려사항

### 9.1 임금대장 보관 의무
- 근로기준법 제48조: 사용자는 임금대장을 작성하여 3년간 보관해야 함
- **시스템 대응**: 급여 기록 soft delete, 최소 3년 보관

### 9.2 급여명세서 교부 의무
- 근로기준법 제48조: 임금 지급 시 명세서 서면 교부 의무 (2021.11 시행)
- **필수 기재 항목**:
  - 근로자 성명, 급여 지급일, 임금 산정 기간
  - 임금 총액, 공제 항목별 금액과 근거, 실지급액
- **시스템 대응**: PDF 명세서에 모든 필수 항목 포함

### 9.3 개인정보 보호
- 급여 정보는 민감 정보로 분류
- 암호화 저장, 접근 권한 관리 필수

---

## 10. 리스크 및 대응

| 리스크 | 확률 | 영향 | 대응 |
|-------|------|------|------|
| 결제 연동 지연 | 높음 | 중간 | 무료 기능 먼저 오픈, 유료는 Coming Soon |
| 법적 계산 오류 | 낮음 | 높음 | 기존 테스트 179개 유지, 추가 테스트 |
| 성능 이슈 | 낮음 | 중간 | 30명 기준 성능 테스트 |

---

## 11. 성공 지표 (KPI)

| 지표 | 목표 | 측정 방법 |
|-----|------|----------|
| 회원가입 | 100명/월 | DB 집계 |
| 급여 계산 횟수 | 500회/월 | API 로그 |
| 유료 전환율 | 5% | 결제 데이터 |
| 사용자 만족도 | 4.0/5.0 | 설문조사 |

---

## 부록: 참고 문서

- [CLAUDE.md](../CLAUDE.md): 프로젝트 전체 가이드
- [PROJECT_ANALYSIS_REPORT.md](./PROJECT_ANALYSIS_REPORT.md): 현재 구현 상태
- [기존 API 문서](https://calcul-production.up.railway.app/docs): Swagger UI

---

**문서 이력**
| 버전 | 날짜 | 작성자 | 변경 내용 |
|-----|------|-------|----------|
| v1.0 | 2026-01-22 | Claude Code | 초안 작성 |
| v2.0 | 2026-01-22 | Claude Code | AI 노무 챗봇 추가, 요금제 재설계 (Starter 추가), 경쟁사 상세 분석 |
