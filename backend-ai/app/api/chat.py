"""
챗봇 API 엔드포인트
SSE 스트리밍 + Rate Limiting
"""

import json
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.services.agent import get_agent_response
from app.services.rate_limiter import get_rate_limiter

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None  # 임시: 실제로는 JWT에서 추출


class ChatResponse(BaseModel):
    session_id: str
    message: str
    citations: list = []


class UsageResponse(BaseModel):
    user_id: str
    tier: str
    used: int
    limit: int
    remaining: int


def get_user_id(x_user_id: Optional[str] = Header(None)) -> str:
    """사용자 ID 추출 (헤더 또는 기본값)"""
    return x_user_id or "anonymous"


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    user_id: str = Depends(get_user_id),
):
    """
    SSE 스트리밍 챗봇 응답

    Headers:
        X-User-Id: 사용자 ID (선택)

    Event Types:
        - "token": 응답 토큰 (incremental)
        - "citation": 인용 정보
        - "tool_call": 도구 호출 알림
        - "done": 응답 완료
        - "error": 에러 발생
    """
    # Rate limit 체크
    rate_limiter = get_rate_limiter()
    effective_user_id = request.user_id or user_id

    allowed, remaining, reset_seconds = rate_limiter.check_limit(effective_user_id)

    if not allowed:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "remaining": 0,
                "reset_seconds": reset_seconds,
                "message": f"요청 한도 초과. {reset_seconds}초 후 다시 시도해주세요.",
            },
        )

    # 요청 기록
    rate_limiter.record_request(effective_user_id)

    async def event_generator():
        try:
            async for event in get_agent_response(request.message, request.session_id):
                event_type = event.get("type", "token")
                data = event.get("data", "")

                if event_type == "token":
                    yield {"event": "token", "data": data}
                elif event_type == "citation":
                    yield {"event": "citation", "data": json.dumps(data, ensure_ascii=False)}
                elif event_type == "tool_call":
                    yield {"event": "tool_call", "data": json.dumps(data, ensure_ascii=False)}
                elif event_type == "done":
                    yield {"event": "done", "data": ""}
                    break
                elif event_type == "error":
                    yield {"event": "error", "data": data}
                    break

        except Exception as e:
            yield {"event": "error", "data": str(e)}

    return EventSourceResponse(event_generator())


@router.post("/message")
async def chat_message(
    request: ChatRequest,
    user_id: str = Depends(get_user_id),
):
    """
    비스트리밍 챗봇 응답 (단일 응답)
    """
    rate_limiter = get_rate_limiter()
    effective_user_id = request.user_id or user_id

    allowed, remaining, reset_seconds = rate_limiter.check_limit(effective_user_id)

    if not allowed:
        raise HTTPException(
            status_code=429,
            detail={"error": "Rate limit exceeded", "reset_seconds": reset_seconds},
        )

    rate_limiter.record_request(effective_user_id)

    # 전체 응답 수집
    full_response = ""
    async for event in get_agent_response(request.message, request.session_id):
        if event.get("type") == "token":
            full_response += event.get("data", "")
        elif event.get("type") == "error":
            raise HTTPException(status_code=500, detail=event.get("data"))

    return {
        "session_id": request.session_id or str(uuid.uuid4()),
        "message": full_response,
        "usage": rate_limiter.get_usage(effective_user_id),
    }


@router.get("/usage")
async def get_usage(user_id: str = Depends(get_user_id)) -> UsageResponse:
    """사용량 조회"""
    rate_limiter = get_rate_limiter()
    usage = rate_limiter.get_usage(user_id)
    return UsageResponse(**usage)


@router.get("/sessions")
async def get_sessions(
    user_id: str = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    """사용자의 대화 세션 목록"""
    # TODO: DB에서 세션 조회
    return {"sessions": [], "user_id": user_id}


@router.get("/sessions/{session_id}/messages")
async def get_messages(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """특정 세션의 대화 내역"""
    # TODO: DB에서 메시지 조회
    return {"session_id": session_id, "messages": []}
