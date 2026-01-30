"""
LangGraph Agent 서비스
스트리밍 응답 처리
"""

import logging
from typing import AsyncGenerator, Optional

from langchain_core.messages import HumanMessage, SystemMessage

from app.services.llm import get_tiered_llm
from app.services.prompts import SYSTEM_PROMPT

logger = logging.getLogger(__name__)


async def get_agent_response(
    message: str,
    session_id: Optional[str] = None,
) -> AsyncGenerator[dict, None]:
    """
    에이전트 응답 스트리밍 (한글 토큰 버퍼링)

    Args:
        message: 사용자 메시지
        session_id: 세션 ID (대화 컨텍스트용)

    Yields:
        {"type": "token"|"citation"|"tool_call"|"done"|"error", "data": ...}
    """
    try:
        tiered_llm = get_tiered_llm()

        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=message),
        ]

        # 스트리밍 응답 (토큰 버퍼링으로 한글 띄어쓰기 문제 해결)
        buffer = ""
        flush_chars = {" ", ".", ",", "!", "?", "\n", ":", ";", ")", "]", "}", "※"}

        async for chunk in tiered_llm.astream(messages):
            if hasattr(chunk, "content") and chunk.content:
                buffer += chunk.content

                # 문장 부호나 공백이 나오면 버퍼 flush
                if buffer and buffer[-1] in flush_chars:
                    yield {"type": "token", "data": buffer}
                    buffer = ""

        # 남은 버퍼 전송
        if buffer:
            yield {"type": "token", "data": buffer}

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
