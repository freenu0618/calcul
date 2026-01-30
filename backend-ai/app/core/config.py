"""
애플리케이션 설정
환경 변수 기반 설정 관리
"""

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database (환경변수는 postgresql://, 내부에서 asyncpg로 변환)
    database_url: str = "postgresql://localhost:5432/paytools_ai"

    @property
    def async_database_url(self) -> str:
        """asyncpg 드라이버용 URL 변환"""
        url = self.database_url
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    # LLM API Keys
    google_api_key: str = ""
    groq_api_key: str = ""
    openai_api_key: str = ""

    # Law API
    law_api_key: str = ""

    # Spring Boot API
    spring_api_url: str = "https://calcul-production.up.railway.app"
    internal_api_key: str = ""

    # Server
    host: str = "0.0.0.0"
    port: int = 8001
    debug: bool = False

    # Rate Limiting
    free_tier_requests_per_hour: int = 30
    pro_tier_requests_per_hour: int = 300

    # LLM Settings
    llm_temperature: float = 0.3
    llm_timeout: int = 30

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
