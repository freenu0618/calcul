-- 구독 시스템 테이블 추가
-- Phase 7: 요금제 및 결제 시스템

-- users 테이블에 구독 관련 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'FREE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'ACTIVE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS polar_customer_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS polar_subscription_id VARCHAR(100);

-- 구독 이력 테이블
CREATE TABLE IF NOT EXISTS subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    polar_subscription_id VARCHAR(100),
    polar_customer_id VARCHAR(100),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용량 추적 테이블
CREATE TABLE IF NOT EXISTS usage_tracking (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    usage_type VARCHAR(30) NOT NULL,
    year_month VARCHAR(7) NOT NULL,
    count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_usage UNIQUE(user_id, usage_type, year_month)
);

-- 결제 이력 테이블
CREATE TABLE IF NOT EXISTS payment_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id BIGINT REFERENCES subscriptions(id),
    polar_payment_id VARCHAR(100),
    amount_cents INT NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_year_month ON usage_tracking(year_month);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);

-- 코멘트 추가
COMMENT ON COLUMN users.subscription_tier IS '구독 플랜: FREE, TRIAL, BASIC, PRO, ENTERPRISE';
COMMENT ON COLUMN users.subscription_status IS '구독 상태: ACTIVE, CANCELED, PAST_DUE, TRIAL';
COMMENT ON TABLE subscriptions IS '구독 이력 (플랜 변경 추적)';
COMMENT ON TABLE usage_tracking IS '월별 사용량 추적 (AI 상담, 급여 계산 등)';
COMMENT ON TABLE payment_history IS '결제 이력';
