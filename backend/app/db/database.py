"""데이터베이스 설정"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 환경 변수에서 DATABASE_URL 가져오기 (Railway, Render 등에서 자동 설정)
# 로컬 개발 환경에서는 SQLite 사용
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./salary_calculator.db"  # 기본값: SQLite
)

# PostgreSQL URL 형식 변환 (Railway는 postgres://로 시작하는 URL 제공)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 엔진 생성
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    # SQLite 전용 설정
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,  # PostgreSQL 연결 체크
    pool_size=5,  # PostgreSQL 연결 풀 크기
    max_overflow=10  # PostgreSQL 최대 오버플로우 연결
)

# 세션 팩토리
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base 클래스
Base = declarative_base()


def get_db():
    """DB 세션 의존성"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """테이블 생성"""
    from app.db import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
