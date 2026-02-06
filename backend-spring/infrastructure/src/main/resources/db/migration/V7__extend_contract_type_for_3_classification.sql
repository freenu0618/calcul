-- V7: 급여형태 3분류 확장 (MONTHLY_FIXED, HOURLY_MONTHLY, HOURLY_BASED_MONTHLY)
-- 기존 MONTHLY/HOURLY는 하위 호환용으로 유지

ALTER TABLE work_contracts
    DROP CONSTRAINT IF EXISTS chk_contract_type;

ALTER TABLE work_contracts
    ADD CONSTRAINT chk_contract_type CHECK (
        contract_type IN ('MONTHLY', 'HOURLY', 'MONTHLY_FIXED', 'HOURLY_MONTHLY', 'HOURLY_BASED_MONTHLY')
    );

COMMENT ON COLUMN work_contracts.contract_type IS
    'MONTHLY/MONTHLY_FIXED: 월급제 고정, HOURLY/HOURLY_MONTHLY: 시급제 월정산, HOURLY_BASED_MONTHLY: 시급기반 월급제';
