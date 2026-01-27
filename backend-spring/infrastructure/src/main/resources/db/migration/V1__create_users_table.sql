-- V1: users 테이블 생성
-- 사용자 인증 정보 저장

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 코멘트
COMMENT ON TABLE users IS '사용자 인증 정보';
COMMENT ON COLUMN users.email IS '이메일 (로그인 ID)';
COMMENT ON COLUMN users.password_hash IS '비밀번호 해시 (bcrypt)';
COMMENT ON COLUMN users.role IS 'USER: 일반, ADMIN: 관리자, PREMIUM: 유료';
