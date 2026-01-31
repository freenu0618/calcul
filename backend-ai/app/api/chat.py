"""
챗봇 API 엔드포인트
SSE 스트리밍 + Spring API 사용량 제한 연동
"""

import json
import uuid
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from app.db.database import get_db
from app.services.agent import get_agent_response
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()
router = APIRouter()


async def check_and_increment_usage(token: str) -> tuple[bool, str]:
    """
    Spring API로 AI_CHAT 사용량 체크 및 증가
    Returns: (allowed, message)
    """
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"{settings.spring_api_url}/api/v1/subscription/usage/increment",
                params={"type": "AI_CHAT"},
                headers={"Authorization": f"Bearer {token}"},
            )
            if response.status_code == 200:
                data = response.json().get("data", {})
                allowed = data.get("allowed", True)
                message = data.get("message", "")
                return allowed, message
            elif response.status_code == 401:
                return False, "인증이 만료되었습니다. 다시 로그인해주세요."
            else:
                logger.warning(f"Usage API error: {response.status_code}")
                return True, ""  # API 오류 시 허용 (fallback)
    except Exception as e:
        logger.error(f"Usage check failed: {e}")
        return True, ""  # 네트워크 오류 시 허용 (fallback)


@router.options("/stream")
@router.options("/message")
async def options_handler():
    """CORS preflight 요청 처리"""
    from fastapi.responses import Response
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    token: Optional[str] = None  # JWT 토큰 (사용자 데이터 조회용)


class ChatResponse(BaseModel):
    session_id: str
    message: str
    citations: list = []


def get_auth_token(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Authorization 헤더에서 JWT 토큰 추출"""
    if authorization and authorization.startswith("Bearer "):
        return authorization[7:]
    return None


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    auth_token: Optional[str] = Depends(get_auth_token),
):
    """
    SSE 스트리밍 챗봇 응답 (로그인 필수)

    Headers:
        Authorization: Bearer {token}

    Event Types:
        - "token": 응답 토큰 (incremental)
        - "tool_call": 도구 호출 알림
        - "done": 응답 완료
        - "error": 에러 발생
    """
    # 토큰 우선순위: 요청 body > Authorization 헤더
    user_token = request.token or auth_token

    # 비로그인 사용자 차단
    if not user_token:
        raise HTTPException(
            status_code=401,
            detail={"error": "로그인이 필요합니다.", "message": "AI 상담을 이용하려면 로그인해주세요."},
        )

    # Spring API로 사용량 체크 및 증가
    allowed, message = await check_and_increment_usage(user_token)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail={"error": "Usage limit exceeded", "message": message or "이번 달 AI 상담 횟수를 모두 사용했습니다. 업그레이드해주세요."},
        )

    async def event_generator():
        try:
            async for event in get_agent_response(request.message, request.session_id, user_token):
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

    return EventSourceResponse(
        event_generator(),
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )


@router.post("/message")
async def chat_message(
    request: ChatRequest,
    auth_token: Optional[str] = Depends(get_auth_token),
):
    """
    비스트리밍 챗봇 응답 (로그인 필수)
    """
    user_token = request.token or auth_token

    if not user_token:
        raise HTTPException(status_code=401, detail={"error": "로그인이 필요합니다."})

    allowed, message = await check_and_increment_usage(user_token)
    if not allowed:
        raise HTTPException(status_code=429, detail={"error": "Usage limit exceeded", "message": message})

    full_response = ""
    async for event in get_agent_response(request.message, request.session_id, user_token):
        if event.get("type") == "token":
            full_response += event.get("data", "")
        elif event.get("type") == "error":
            raise HTTPException(status_code=500, detail=event.get("data"))

    return {"session_id": request.session_id or str(uuid.uuid4()), "message": full_response}


@router.get("/usage")
async def get_usage(auth_token: Optional[str] = Depends(get_auth_token)):
    """사용량 조회 (Spring API 프록시)"""
    if not auth_token:
        raise HTTPException(status_code=401, detail={"error": "로그인이 필요합니다."})

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{settings.spring_api_url}/api/v1/subscription/usage",
                headers={"Authorization": f"Bearer {auth_token}"},
            )
            if response.status_code == 200:
                return response.json()
            raise HTTPException(status_code=response.status_code, detail="사용량 조회 실패")
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"API 연결 오류: {e}")


@router.get("/sessions")
async def get_sessions(
    auth_token: Optional[str] = Depends(get_auth_token),
    db: AsyncSession = Depends(get_db),
):
    """사용자의 대화 세션 목록"""
    if not auth_token:
        raise HTTPException(status_code=401, detail={"error": "로그인이 필요합니다."})
    # TODO: DB에서 세션 조회
    return {"sessions": []}


@router.get("/sessions/{session_id}/messages")
async def get_messages(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """특정 세션의 대화 내역"""
    # TODO: DB에서 메시지 조회
    return {"session_id": session_id, "messages": []}
