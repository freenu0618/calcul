-- V2: employees 테이블 생성
-- 직원 정보 (근로계약서 기반)

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    resident_id_prefix VARCHAR(8) NOT NULL UNIQUE,
    birth_date DATE NOT NULL,
    is_foreigner BOOLEAN NOT NULL DEFAULT FALSE,
    visa_type VARCHAR(10),
    contract_start_date DATE NOT NULL,
    employment_type VARCHAR(20) NOT NULL,
    company_size VARCHAR(20) NOT NULL,
    work_start_time TIME NOT NULL DEFAULT '09:00:00',
    work_end_time TIME NOT NULL DEFAULT '18:00:00',
    break_minutes INTEGER NOT NULL DEFAULT 60,
    weekly_work_days INTEGER NOT NULL DEFAULT 5,
    daily_work_hours INTEGER NOT NULL DEFAULT 8,
    probation_months INTEGER NOT NULL DEFAULT 0,
    probation_rate INTEGER NOT NULL DEFAULT 100,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_at DATE NOT NULL DEFAULT CURRENT_DATE,

    -- 제약조건
    CONSTRAINT chk_weekly_work_days CHECK (weekly_work_days BETWEEN 1 AND 7),
    CONSTRAINT chk_break_minutes CHECK (break_minutes >= 0),
    CONSTRAINT chk_daily_work_hours CHECK (daily_work_hours > 0),
    CONSTRAINT chk_probation_months CHECK (probation_months >= 0),
    CONSTRAINT chk_probation_rate CHECK (probation_rate BETWEEN 0 AND 100),
    CONSTRAINT chk_resident_id_format CHECK (resident_id_prefix ~ '^\d{6}-\d$')
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_employee_name ON employees(name);
CREATE INDEX IF NOT EXISTS idx_employee_contract_start ON employees(contract_start_date);

-- 코멘트
COMMENT ON TABLE employees IS '직원 정보 (근로계약서 기반)';
COMMENT ON COLUMN employees.resident_id_prefix IS '주민번호 앞7자리 (YYMMDD-N)';
COMMENT ON COLUMN employees.visa_type IS '체류자격: E-9, F-4, F-5, H-2 등';
COMMENT ON COLUMN employees.employment_type IS 'FULL_TIME: 정규직, PART_TIME: 파트타임';
COMMENT ON COLUMN employees.company_size IS 'OVER_5: 5인 이상, UNDER_5: 5인 미만';
