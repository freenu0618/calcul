"""
헬스체크 API
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """서비스 상태 확인"""
    return {"status": "healthy", "service": "paytools-ai"}
