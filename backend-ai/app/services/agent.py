"""
LangGraph Agent 서비스
스트리밍 응답 처리 + RAG (법령 검색) + 사용자 데이터 컨텍스트 + 대화 히스토리
"""

import logging
import httpx
from typing import AsyncGenerator, Optional
from collections import defaultdict
from dataclasses import dataclass, field

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

from app.services.llm import get_tiered_llm
from app.services.prompts import SYSTEM_PROMPT
from app.services.rag import get_rag_service
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


# ==================== 세션 관리 ====================

@dataclass
class UserSession:
    """사용자 세션 정보"""
    user_name: str = ""
    user_email: str = ""
    messages: list = field(default_factory=list)  # [(role, content), ...]

# 세션 저장소 (메모리 기반, 추후 Redis/DB로 전환 가능)
_sessions: dict[str, UserSession] = defaultdict(UserSession)
MAX_HISTORY = 10  # 최대 대화 히스토리 수


async def _fetch_user_info(token: str) -> tuple[str, str]:
    """사용자 기본 정보 (이름, 이메일) 조회"""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{settings.spring_api_url}/api/v1/auth/me",
                headers={"Authorization": f"Bearer {token}"},
            )
            if resp.status_code == 200:
                data = resp.json().get("data", {})
                return data.get("name", ""), data.get("email", "")
    except Exception as e:
        logger.warning(f"User info fetch failed: {e}")
    return "", ""


async def _fetch_user_context(token: str, user_name: str = "") -> str:
    """사용자 데이터 조회하여 컨텍스트 생성"""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            # 직원 목록 조회
            emp_resp = await client.get(
                f"{settings.spring_api_url}/api/v1/employees",
                headers={"Authorization": f"Bearer {token}"},
            )
            # 급여대장 기간 조회
            period_resp = await client.get(
                f"{settings.spring_api_url}/api/v1/payroll/periods",
                headers={"Authorization": f"Bearer {token}"},
            )

            context_parts = ["[현재 사용자 정보]"]
            if user_name:
                context_parts.append(f"사용자 이름: {user_name}")

            if emp_resp.status_code == 200:
                employees = emp_resp.json()
                emp_list = employees if isinstance(employees, list) else employees.get("content", [])
                context_parts.append(f"등록 직원: {len(emp_list)}명")
                for e in emp_list[:5]:  # 최대 5명
                    context_parts.append(f"- {e.get('name')}: {e.get('employmentType')}, 기본급 {e.get('baseSalary', 0):,}원")

            if period_resp.status_code == 200:
                periods = period_resp.json()
                period_list = periods if isinstance(periods, list) else periods.get("content", [])
                if period_list:
                    latest = period_list[0]
                    context_parts.append(f"\n최근 급여대장: {latest.get('year')}-{latest.get('month'):02d}")

            return "\n".join(context_parts) if len(context_parts) > 1 else ""
    except Exception as e:
        logger.warning(f"User context fetch failed: {e}")
        return ""


async def get_agent_response(
    message: str,
    session_id: Optional[str] = None,
    user_token: Optional[str] = None,
) -> AsyncGenerator[dict, None]:
    """
    에이전트 응답 스트리밍 (한글 토큰 버퍼링 + 대화 히스토리)

    Args:
        message: 사용자 메시지
        session_id: 세션 ID (대화 컨텍스트용)
        user_token: JWT 토큰 (사용자 데이터 조회용)

    Yields:
        {"type": "token"|"citation"|"tool_call"|"done"|"error", "data": ...}
    """
    try:
        tiered_llm = get_tiered_llm()
        rag_service = get_rag_service()

        # 세션 관리 (session_id가 없으면 새 세션)
        session_key = session_id or "default"
        session = _sessions[session_key]

        # 사용자 정보 조회 (세션에 없으면 API 호출)
        user_name = session.user_name
        if user_token and not user_name:
            user_name, user_email = await _fetch_user_info(user_token)
            session.user_name = user_name
            session.user_email = user_email
            logger.info(f"User info loaded: {user_name}")

        # RAG: 관련 법령 컨텍스트 조회
        rag_context = await rag_service.get_context(message)

        # 시스템 프롬프트 구성
        system_content = SYSTEM_PROMPT

        # 사용자 데이터 컨텍스트 추가 (로그인된 경우)
        if user_token:
            user_context = await _fetch_user_context(user_token, user_name)
            if user_context:
                system_content += f"\n\n{user_context}"
                logger.info("User context added to prompt")

        # 법령 컨텍스트 추가
        if rag_context.context_text:
            system_content += f"\n\n{rag_context.context_text}"
            logger.info(f"RAG: {len(rag_context.relevant_articles)} articles added")

        # 메시지 구성 (시스템 + 이전 대화 + 현재 메시지)
        messages = [SystemMessage(content=system_content)]

        # 이전 대화 히스토리 추가 (최대 MAX_HISTORY개)
        for role, content in session.messages[-MAX_HISTORY:]:
            if role == "user":
                messages.append(HumanMessage(content=content))
            else:
                messages.append(AIMessage(content=content))

        # 현재 사용자 메시지 추가
        messages.append(HumanMessage(content=message))

        # 스트리밍 응답 (토큰 버퍼링으로 한글 띄어쓰기 문제 해결)
        buffer = ""
        full_response = ""
        flush_chars = {" ", ".", ",", "!", "?", "\n", ":", ";", ")", "]", "}", "※"}

        async for chunk in tiered_llm.astream(messages):
            if hasattr(chunk, "content") and chunk.content:
                buffer += chunk.content
                full_response += chunk.content

                # 문장 부호나 공백이 나오면 버퍼 flush
                if buffer and buffer[-1] in flush_chars:
                    yield {"type": "token", "data": buffer}
                    buffer = ""

        # 남은 버퍼 전송
        if buffer:
            yield {"type": "token", "data": buffer}

        # 대화 히스토리에 저장
        session.messages.append(("user", message))
        session.messages.append(("assistant", full_response))

        # 히스토리 최대 크기 제한
        if len(session.messages) > MAX_HISTORY * 2:
            session.messages = session.messages[-MAX_HISTORY * 2:]

        yield {"type": "done", "data": ""}

    except Exception as e:
        logger.error(f"Agent error: {e}")
        yield {"type": "error", "data": str(e)}


async def get_agent_response_with_tools(
    message: str,
    session_id: Optional[str] = None,
) -> AsyncGenerator[dict, None]:
    """
    도구 사용이 포함된 에이전트 응답 (LangGraph)

    TODO: Phase 6.3 완료 후 graph.py와 연동
    """
    try:
        from app.services.graph import get_agent

        agent = get_agent()

        # LangGraph 실행
        async for event in agent.astream_events(
            {"messages": [HumanMessage(content=message)]},
            version="v2",
        ):
            event_type = event.get("event")

            if event_type == "on_chat_model_stream":
                chunk = event.get("data", {}).get("chunk")
                if chunk and hasattr(chunk, "content") and chunk.content:
                    yield {"type": "token", "data": chunk.content}

            elif event_type == "on_tool_start":
                tool_name = event.get("name", "unknown")
                yield {"type": "tool_call", "data": {"tool": tool_name, "status": "start"}}

            elif event_type == "on_tool_end":
                tool_name = event.get("name", "unknown")
                yield {"type": "tool_call", "data": {"tool": tool_name, "status": "end"}}

        yield {"type": "done", "data": ""}

    except Exception as e:
        logger.error(f"Agent with tools error: {e}")
        yield {"type": "error", "data": str(e)}
