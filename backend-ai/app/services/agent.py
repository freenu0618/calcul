"""
LangGraph Agent 서비스
스트리밍 응답 처리 + RAG (법령 검색) + Tool Calling + 대화 히스토리
"""

import logging
import json
import httpx
from typing import AsyncGenerator, Optional
from collections import defaultdict
from dataclasses import dataclass, field

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, ToolMessage

from app.services.llm import get_tiered_llm
from app.services.prompts import SYSTEM_PROMPT
from app.services.rag import get_rag_service
from app.services.tools import ALL_TOOLS, GENERAL_TOOLS, USER_DATA_TOOLS, set_user_token
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


async def _execute_tool(tool_name: str, tool_args: dict) -> str:
    """Tool 실행 및 결과 반환"""
    tool_map = {t.name: t for t in ALL_TOOLS}

    if tool_name not in tool_map:
        return json.dumps({"error": f"Unknown tool: {tool_name}"})

    try:
        tool = tool_map[tool_name]
        result = await tool.ainvoke(tool_args)
        return json.dumps(result, ensure_ascii=False, default=str)
    except Exception as e:
        logger.error(f"Tool execution error ({tool_name}): {e}")
        return json.dumps({"error": str(e)})


async def _invoke_with_fallback(tiered_llm, messages: list, tools: list):
    """LLM 호출 with fallback (Tool Calling 지원)"""
    logger.info(f"_invoke_with_fallback called, tiers: {[n for n,_ in tiered_llm.tiers]}")
    last_error = None

    for name, llm in tiered_llm.tiers:
        cb = tiered_llm.circuit_breakers[name]
        if not cb.can_execute():
            logger.debug(f"Skipping {name} (circuit open)")
            continue

        try:
            llm_with_tools = llm.bind_tools(tools)
            response = await llm_with_tools.ainvoke(messages)
            cb.record_success()
            logger.info(f"LLM response from {name}")
            return response
        except Exception as e:
            cb.record_failure()
            last_error = e
            logger.warning(f"{name} failed: {e}")
            continue

    raise RuntimeError(f"All LLM tiers failed: {last_error}")


async def get_agent_response(
    message: str,
    session_id: Optional[str] = None,
    user_token: Optional[str] = None,
) -> AsyncGenerator[dict, None]:
    """
    에이전트 응답 스트리밍 (Tool Calling + 대화 히스토리)

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

        # 사용자 토큰 설정 (Tool에서 사용)
        set_user_token(user_token)

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

        # 사용자 이름 추가
        if user_name:
            system_content += f"\n\n현재 사용자: {user_name}님"

        # Tool 사용 가능 여부 안내
        if user_token:
            system_content += """

[사용 가능한 도구]
로그인된 사용자이므로 다음 도구를 사용할 수 있습니다:
- get_my_employees: 직원 목록 조회 ("직원 누구야", "직원 명단" 등)
- get_employee_detail: 특정 직원 상세 조회 ("김철수 정보", "홍길동 급여" 등)
- get_payroll_summary: 급여대장 요약 ("이번달 인건비", "급여 총액" 등)
- get_monthly_labor_cost: 특정 월 인건비 조회
- salary_calculator: 급여 계산 시뮬레이션
- insurance_calculator: 4대보험 계산

사용자가 직원이나 급여 데이터를 물어보면 반드시 도구를 사용하세요.
"""
        else:
            system_content += """

[안내] 로그인하면 직원 목록, 급여대장 조회 등 더 많은 기능을 사용할 수 있습니다.
"""

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

        # Tool 바인딩 (로그인된 경우 전체, 아니면 일반 도구만)
        tools = ALL_TOOLS if user_token else GENERAL_TOOLS

        # Tool Calling 루프 (최대 3회)
        max_iterations = 3
        full_response = ""

        for iteration in range(max_iterations):
            # LLM 호출 (fallback 지원)
            response = await _invoke_with_fallback(tiered_llm, messages, tools)

            # Tool Call이 있는지 확인
            if hasattr(response, "tool_calls") and response.tool_calls:
                messages.append(response)  # AI 메시지 추가

                for tool_call in response.tool_calls:
                    tool_name = tool_call.get("name", "")
                    tool_args = tool_call.get("args", {})
                    tool_id = tool_call.get("id", "")

                    logger.info(f"Tool call: {tool_name}({tool_args})")

                    # Tool 호출 알림
                    yield {
                        "type": "tool_call",
                        "data": {"tool": tool_name, "status": "start"}
                    }

                    # Tool 실행
                    result = await _execute_tool(tool_name, tool_args)

                    # Tool 결과 메시지 추가
                    messages.append(ToolMessage(content=result, tool_call_id=tool_id))

                    yield {
                        "type": "tool_call",
                        "data": {"tool": tool_name, "status": "end", "result": result[:200]}
                    }

                continue  # 다시 LLM 호출

            # Tool Call이 없으면 최종 응답
            if hasattr(response, "content") and response.content:
                full_response = response.content
                break

        # 스트리밍 출력 (토큰 단위가 아닌 문장 단위)
        if full_response:
            # 문장 단위로 나눠서 스트리밍 효과
            sentences = full_response.replace(".", ".|").replace("!", "!|").replace("?", "?|").split("|")
            for sentence in sentences:
                if sentence.strip():
                    yield {"type": "token", "data": sentence}

        # 대화 히스토리에 저장
        session.messages.append(("user", message))
        session.messages.append(("assistant", full_response))

        # 히스토리 최대 크기 제한
        if len(session.messages) > MAX_HISTORY * 2:
            session.messages = session.messages[-MAX_HISTORY * 2:]

        yield {"type": "done", "data": ""}

    except Exception as e:
        logger.error(f"Agent error: {e}")
        # 사용자 친화적 에러 메시지
        user_message = "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        yield {"type": "error", "data": user_message}


async def get_agent_response_streaming(
    message: str,
    session_id: Optional[str] = None,
    user_token: Optional[str] = None,
) -> AsyncGenerator[dict, None]:
    """
    스트리밍 전용 응답 (Tool Calling 없이 빠른 응답)
    단순 질문이나 빠른 응답이 필요할 때 사용
    """
    try:
        tiered_llm = get_tiered_llm()
        rag_service = get_rag_service()

        # 세션 관리
        session_key = session_id or "default"
        session = _sessions[session_key]

        # RAG 컨텍스트
        rag_context = await rag_service.get_context(message)

        # 시스템 프롬프트
        system_content = SYSTEM_PROMPT
        if rag_context.context_text:
            system_content += f"\n\n{rag_context.context_text}"

        # 메시지 구성
        messages = [SystemMessage(content=system_content)]
        for role, content in session.messages[-MAX_HISTORY:]:
            if role == "user":
                messages.append(HumanMessage(content=content))
            else:
                messages.append(AIMessage(content=content))
        messages.append(HumanMessage(content=message))

        # 스트리밍 응답
        buffer = ""
        full_response = ""
        flush_chars = {" ", ".", ",", "!", "?", "\n", ":", ";", ")", "]", "}", "※"}

        async for chunk in tiered_llm.astream(messages):
            if hasattr(chunk, "content") and chunk.content:
                buffer += chunk.content
                full_response += chunk.content

                if buffer and buffer[-1] in flush_chars:
                    yield {"type": "token", "data": buffer}
                    buffer = ""

        if buffer:
            yield {"type": "token", "data": buffer}

        # 히스토리 저장
        session.messages.append(("user", message))
        session.messages.append(("assistant", full_response))

        if len(session.messages) > MAX_HISTORY * 2:
            session.messages = session.messages[-MAX_HISTORY * 2:]

        yield {"type": "done", "data": ""}

    except Exception as e:
        logger.error(f"Streaming agent error: {e}")
        yield {"type": "error", "data": str(e)}
