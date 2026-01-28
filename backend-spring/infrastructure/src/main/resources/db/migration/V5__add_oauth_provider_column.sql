-- V5: OAuth 소셜 로그인 지원을 위한 컬럼 추가
-- oauth_provider: google, kakao, naver (null = 일반 로그인)

ALTER TABLE users
ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(20) DEFAULT NULL;

-- 코멘트
COMMENT ON COLUMN users.oauth_provider IS 'OAuth 제공자 (google, kakao, naver). NULL이면 일반 로그인';
