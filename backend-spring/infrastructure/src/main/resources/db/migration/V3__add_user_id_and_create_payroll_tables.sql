-- V3: employees 테이블 user_id 추가 + 급여대장 기초 테이블 생성
-- 목적: 사용자별 데이터 격리 + 근무계약/출퇴근 기록 관리

-- =====================================================
-- 1. employees 테이블에 user_id 추가
-- =====================================================
ALTER TABLE employees ADD COLUMN IF NOT EXISTS user_id BIGINT;

-- 기존 데이터에 대해 user_id 설정 (첫 번째 사용자에게 할당)
UPDATE employees SET user_id = (SELECT id FROM users LIMIT 1) WHERE user_id IS NULL;

-- user_id가 여전히 NULL인 employees 삭제 (users 테이블이 비어있는 경우)
DELETE FROM employees WHERE user_id IS NULL;

-- NOT NULL 제약조건 추가 (오류 무시)
DO $$
BEGIN
    ALTER TABLE employees ALTER COLUMN user_id SET NOT NULL;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'user_id NOT NULL constraint may already exist';
END $$;

-- 외래키 추가 (이미 있으면 건너뛰기)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_employees_user_id'
    ) THEN
        ALTER TABLE employees ADD CONSTRAINT fk_employees_user_id
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Foreign key may already exist';
END $$;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);

-- =====================================================
-- 2. work_contracts (근무 계약) 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS work_contracts (
    id BIGSERIAL PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    contract_type VARCHAR(20) NOT NULL,           -- 'MONTHLY' (월급제) | 'HOURLY' (시급제)
    base_amount BIGINT NOT NULL,                  -- 월급 또는 시급 (원)
    scheduled_hours_per_week INTEGER NOT NULL DEFAULT 40,
    scheduled_days_per_week INTEGER NOT NULL DEFAULT 5,
    effective_date DATE NOT NULL,
    end_date DATE,                                -- NULL이면 현재 유효
    allowances_json TEXT DEFAULT '[]',            -- 고정 수당 목록 (JSON)
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 제약조건
    CONSTRAINT chk_contract_type CHECK (contract_type IN ('MONTHLY', 'HOURLY')),
    CONSTRAINT chk_base_amount CHECK (base_amount > 0),
    CONSTRAINT chk_scheduled_hours CHECK (scheduled_hours_per_week BETWEEN 1 AND 52),
    CONSTRAINT chk_scheduled_days CHECK (scheduled_days_per_week BETWEEN 1 AND 7)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_work_contracts_employee_id ON work_contracts(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_contracts_effective_date ON work_contracts(effective_date);
CREATE INDEX IF NOT EXISTS idx_work_contracts_is_current ON work_contracts(is_current);

-- 코멘트
COMMENT ON TABLE work_contracts IS '근무 계약 정보';
COMMENT ON COLUMN work_contracts.contract_type IS 'MONTHLY: 월급제, HOURLY: 시급제';
COMMENT ON COLUMN work_contracts.base_amount IS '월급 또는 시급 (원 단위)';
COMMENT ON COLUMN work_contracts.allowances_json IS '고정 수당 배열 (JSON)';

-- =====================================================
-- 3. work_shifts (출퇴근 기록) 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS work_shifts (
    id BIGSERIAL PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_minutes INTEGER NOT NULL DEFAULT 60,
    is_holiday_work BOOLEAN NOT NULL DEFAULT FALSE,
    memo VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 직원별 날짜 중복 방지
    CONSTRAINT uq_work_shifts_employee_date UNIQUE (employee_id, date),

    -- 제약조건
    CONSTRAINT chk_break_minutes_shifts CHECK (break_minutes >= 0)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_work_shifts_employee_id ON work_shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_shifts_date ON work_shifts(date);
CREATE INDEX IF NOT EXISTS idx_work_shifts_employee_date ON work_shifts(employee_id, date);

-- 코멘트
COMMENT ON TABLE work_shifts IS '출퇴근 기록';
COMMENT ON COLUMN work_shifts.is_holiday_work IS '휴일근로 여부';
COMMENT ON COLUMN work_shifts.break_minutes IS '휴게시간 (분)';

-- =====================================================
-- 4. payroll_periods (급여 기간) 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS payroll_periods (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',  -- 'DRAFT' | 'CONFIRMED' | 'PAID'
    confirmed_at TIMESTAMP,
    paid_at TIMESTAMP,
    memo VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 사용자별 연월 중복 방지
    CONSTRAINT uq_payroll_periods_user_year_month UNIQUE (user_id, year, month),

    -- 제약조건
    CONSTRAINT chk_payroll_status CHECK (status IN ('DRAFT', 'CONFIRMED', 'PAID')),
    CONSTRAINT chk_payroll_year CHECK (year BETWEEN 2020 AND 2100),
    CONSTRAINT chk_payroll_month CHECK (month BETWEEN 1 AND 12)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_payroll_periods_user_id ON payroll_periods(user_id);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_year_month ON payroll_periods(year, month);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_status ON payroll_periods(status);

-- 코멘트
COMMENT ON TABLE payroll_periods IS '급여 기간 (월별 급여대장 헤더)';
COMMENT ON COLUMN payroll_periods.status IS 'DRAFT: 작성중, CONFIRMED: 확정, PAID: 지급완료';

-- =====================================================
-- 5. payroll_entries (급여대장 엔트리) 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS payroll_entries (
    id BIGSERIAL PRIMARY KEY,
    payroll_period_id BIGINT NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    contract_id BIGINT REFERENCES work_contracts(id),

    -- 계산 입력
    base_salary BIGINT NOT NULL,
    allowances_json TEXT DEFAULT '[]',
    total_work_minutes INTEGER NOT NULL DEFAULT 0,
    overtime_minutes INTEGER NOT NULL DEFAULT 0,
    night_minutes INTEGER NOT NULL DEFAULT 0,
    holiday_minutes INTEGER NOT NULL DEFAULT 0,

    -- 계산 결과 (급여)
    regular_wage BIGINT,
    hourly_wage BIGINT,
    overtime_pay BIGINT,
    night_pay BIGINT,
    holiday_pay BIGINT,
    weekly_holiday_pay BIGINT,
    total_gross BIGINT,

    -- 공제
    national_pension BIGINT,
    health_insurance BIGINT,
    long_term_care BIGINT,
    employment_insurance BIGINT,
    income_tax BIGINT,
    local_income_tax BIGINT,
    total_deductions BIGINT,

    -- 실수령액
    net_pay BIGINT,

    -- 메타데이터
    calculation_detail TEXT,  -- JSON 상세 내역
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 급여기간별 직원 중복 방지
    CONSTRAINT uq_payroll_entries_period_employee UNIQUE (payroll_period_id, employee_id),

    -- 제약조건
    CONSTRAINT chk_base_salary CHECK (base_salary >= 0),
    CONSTRAINT chk_work_minutes CHECK (total_work_minutes >= 0)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_payroll_entries_period_id ON payroll_entries(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_entries_employee_id ON payroll_entries(employee_id);

-- 코멘트
COMMENT ON TABLE payroll_entries IS '급여대장 엔트리 (직원별 급여 내역)';
COMMENT ON COLUMN payroll_entries.calculation_detail IS 'JSON 형식의 상세 계산 내역';
