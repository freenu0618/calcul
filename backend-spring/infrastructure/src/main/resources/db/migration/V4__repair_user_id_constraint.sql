-- V4: V3 마이그레이션 복구 스크립트
-- user_id 컬럼 및 제약조건 복구 (V3 실패 시 대비)

-- 1. user_id 컬럼 추가 (이미 있으면 건너뛰기)
ALTER TABLE employees ADD COLUMN IF NOT EXISTS user_id BIGINT;

-- 2. user_id가 NULL인 employees에 첫 번째 사용자 할당
UPDATE employees SET user_id = (SELECT id FROM users LIMIT 1) WHERE user_id IS NULL;

-- 3. 여전히 NULL인 employees 삭제 (데이터 무결성)
DELETE FROM employees WHERE user_id IS NULL;

-- 4. NOT NULL 제약조건 추가 (오류 무시)
DO $$
BEGIN
    ALTER TABLE employees ALTER COLUMN user_id SET NOT NULL;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'user_id NOT NULL constraint already exists';
END $$;

-- 5. 외래키 추가 (이미 있으면 건너뛰기)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_employees_user_id'
        AND table_name = 'employees'
    ) THEN
        ALTER TABLE employees ADD CONSTRAINT fk_employees_user_id
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Foreign key fk_employees_user_id already exists';
END $$;

-- 6. 인덱스 추가 (이미 있으면 건너뛰기)
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);

-- 7. 급여대장 테이블 생성 (이미 있으면 건너뛰기)
CREATE TABLE IF NOT EXISTS work_contracts (
    id BIGSERIAL PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    contract_type VARCHAR(20) NOT NULL,
    base_amount BIGINT NOT NULL,
    scheduled_hours_per_week INTEGER NOT NULL DEFAULT 40,
    scheduled_days_per_week INTEGER NOT NULL DEFAULT 5,
    effective_date DATE NOT NULL,
    end_date DATE,
    allowances_json TEXT DEFAULT '[]',
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_shifts (
    id BIGSERIAL PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_minutes INTEGER NOT NULL DEFAULT 60,
    is_holiday_work BOOLEAN NOT NULL DEFAULT FALSE,
    memo VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payroll_periods (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    confirmed_at TIMESTAMP,
    paid_at TIMESTAMP,
    memo VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payroll_entries (
    id BIGSERIAL PRIMARY KEY,
    payroll_period_id BIGINT NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    contract_id BIGINT REFERENCES work_contracts(id),
    base_salary BIGINT NOT NULL,
    allowances_json TEXT DEFAULT '[]',
    total_work_minutes INTEGER NOT NULL DEFAULT 0,
    overtime_minutes INTEGER NOT NULL DEFAULT 0,
    night_minutes INTEGER NOT NULL DEFAULT 0,
    holiday_minutes INTEGER NOT NULL DEFAULT 0,
    regular_wage BIGINT,
    hourly_wage BIGINT,
    overtime_pay BIGINT,
    night_pay BIGINT,
    holiday_pay BIGINT,
    weekly_holiday_pay BIGINT,
    total_gross BIGINT,
    national_pension BIGINT,
    health_insurance BIGINT,
    long_term_care BIGINT,
    employment_insurance BIGINT,
    income_tax BIGINT,
    local_income_tax BIGINT,
    total_deductions BIGINT,
    net_pay BIGINT,
    calculation_detail TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. 인덱스 추가 (이미 있으면 건너뛰기)
CREATE INDEX IF NOT EXISTS idx_work_contracts_employee_id ON work_contracts(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_shifts_employee_id ON work_shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_user_id ON payroll_periods(user_id);
CREATE INDEX IF NOT EXISTS idx_payroll_entries_period_id ON payroll_entries(payroll_period_id);
