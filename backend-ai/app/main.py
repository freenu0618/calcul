"""
PayTools AI - FastAPI 메인 애플리케이션
AI 노무 자문 챗봇 서비스
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.database import init_db
from app.api import chat, health

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작/종료 이벤트"""
    # 시작 시 DB 초기화 (실패해도 앱은 시작)
    try:
        await init_db()
    except Exception as e:
        import logging
        logging.warning(f"DB 초기화 실패 (서비스는 계속): {e}")
    yield
    # 종료 시 정리 작업


app = FastAPI(
    title="PayTools AI",
    description="AI 노무 자문 챗봇 API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS 설정 - 모든 origin 허용 (SSE 스트리밍 지원)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # "*" 사용 시 False 필수
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# 라우터 등록
app.include_router(health.router, tags=["Health"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])


@app.get("/")
async def root():
    return {"service": "PayTools AI", "version": "0.1.0", "status": "running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
