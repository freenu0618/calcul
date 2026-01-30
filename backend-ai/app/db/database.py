"""
데이터베이스 연결 및 세션 관리
PostgreSQL + pgvector
"""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.async_database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    """FastAPI 의존성 주입용 DB 세션"""
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """pgvector 확장 활성화 및 테이블 생성"""
    async with engine.begin() as conn:
        # pgvector 확장 활성화
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        # 테이블 생성
        await conn.run_sync(Base.metadata.create_all)
