-- Phase 3.5.1: 근무자 테이블 생성
-- 근로계약서 기반 근무자 정보 관리

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 기본 정보
    name VARCHAR(100) NOT NULL,
    resident_id_prefix VARCHAR(8) NOT NULL UNIQUE,
    birth_date DATE NOT NULL,
    is_foreigner BOOLEAN NOT NULL DEFAULT FALSE,
    visa_type VARCHAR(10),

    -- 계약 정보
    contract_start_date DATE NOT NULL,
    employment_type VARCHAR(20) NOT NULL,
    company_size VARCHAR(20) NOT NULL,

    -- 근무 시간 정보
    work_start_time TIME NOT NULL DEFAULT '09:00:00',
    work_end_time TIME NOT NULL DEFAULT '18:00:00',
    break_minutes INTEGER NOT NULL DEFAULT 60,
    weekly_work_days INTEGER NOT NULL DEFAULT 5,
    daily_work_hours INTEGER NOT NULL DEFAULT 8,

    -- 수습 기간
    probation_months INTEGER NOT NULL DEFAULT 0,
    probation_rate INTEGER NOT NULL DEFAULT 100,

    -- 감사 필드
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_at DATE NOT NULL DEFAULT CURRENT_DATE,

    -- 제약 조건
    CONSTRAINT chk_weekly_work_days CHECK (weekly_work_days BETWEEN 1 AND 7),
    CONSTRAINT chk_break_minutes CHECK (break_minutes >= 0),
    CONSTRAINT chk_daily_work_hours CHECK (daily_work_hours > 0),
    CONSTRAINT chk_probation_months CHECK (probation_months >= 0),
    CONSTRAINT chk_probation_rate CHECK (probation_rate BETWEEN 0 AND 100),
    CONSTRAINT chk_employment_type CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT')),
    CONSTRAINT chk_company_size CHECK (company_size IN ('UNDER_5', 'OVER_5'))
);

-- 인덱스
CREATE INDEX idx_employee_name ON employees(name);
CREATE INDEX idx_employee_contract_start ON employees(contract_start_date);

-- 주석
COMMENT ON TABLE employees IS '근무자 정보 (근로계약서 기반)';
COMMENT ON COLUMN employees.name IS '근로자 이름';
COMMENT ON COLUMN employees.resident_id_prefix IS '주민번호 앞 7자리 (YYMMDD-N)';
COMMENT ON COLUMN employees.birth_date IS '생년월일 (주민번호에서 추출)';
COMMENT ON COLUMN employees.is_foreigner IS '외국인 여부 (성별코드 5~8)';
COMMENT ON COLUMN employees.visa_type IS '체류자격 (E-9, F-4 등)';
COMMENT ON COLUMN employees.contract_start_date IS '계약 시작일';
COMMENT ON COLUMN employees.employment_type IS '고용형태 (FULL_TIME, PART_TIME, CONTRACT)';
COMMENT ON COLUMN employees.company_size IS '사업장 규모 (UNDER_5, OVER_5)';
COMMENT ON COLUMN employees.work_start_time IS '근무 시작시간';
COMMENT ON COLUMN employees.work_end_time IS '근무 종료시간';
COMMENT ON COLUMN employees.break_minutes IS '휴게시간 (분)';
COMMENT ON COLUMN employees.weekly_work_days IS '주 근무일수';
COMMENT ON COLUMN employees.daily_work_hours IS '일일 근로시간 (시간)';
COMMENT ON COLUMN employees.probation_months IS '수습기간 (월, 0=없음)';
COMMENT ON COLUMN employees.probation_rate IS '수습 급여 비율 (%, 100=전액)';
