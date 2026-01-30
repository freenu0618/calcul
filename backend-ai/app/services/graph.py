"""
LangGraph Agent 정의
Router → Tool/RAG → Generate 흐름
"""

import logging
from typing import TypedDict, Annotated, Literal
from operator import add

from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from app.services.llm import get_tiered_llm
from app.services.tools import ALL_TOOLS
from app.services.prompts import SYSTEM_PROMPT

logger = logging.getLogger(__name__)


class AgentState(TypedDict):
    """Agent 상태 정의"""
    messages: Annotated[list, add]
    intent: str
    tool_results: list
    final_response: str


def create_agent_graph():
    """LangGraph Agent 생성"""

    llm = get_tiered_llm()
    llm_with_tools = llm.get_llm_with_fallback().bind_tools(ALL_TOOLS)

    # 노드 정의
    async def router_node(state: AgentState) -> dict:
        """의도 분류 노드"""
        messages = state["messages"]
        last_message = messages[-1].content if messages else ""

        # 간단한 키워드 기반 라우팅
        intent = "general"
        keywords = {
            "salary_calc": ["급여", "실수령", "월급", "연봉", "세후"],
            "insurance": ["보험", "국민연금", "건강보험", "고용보험", "4대보험"],
            "overtime": ["연장", "야간", "휴일", "수당", "가산"],
            "minimum_wage": ["최저임금", "최저시급", "시급"],
            "law_search": ["법", "조문", "규정", "근로기준법"],
        }

        for intent_type, words in keywords.items():
            if any(word in last_message for word in words):
                intent = intent_type
                break

        logger.info(f"Intent classified: {intent}")
        return {"intent": intent}

    async def tool_decision_node(state: AgentState) -> dict:
        """도구 사용 여부 결정"""
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + state["messages"]

        response = await llm_with_tools.ainvoke(messages)

        return {"messages": [response]}

    async def tool_executor_node(state: AgentState) -> dict:
        """도구 실행"""
        tool_node = ToolNode(ALL_TOOLS)
        result = await tool_node.ainvoke(state)
        return result

    async def generate_node(state: AgentState) -> dict:
        """최종 응답 생성"""
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + state["messages"]

        llm_base = get_tiered_llm().get_llm_with_fallback()
        response = await llm_base.ainvoke(messages)

        return {"messages": [response], "final_response": response.content}

    def should_use_tools(state: AgentState) -> Literal["tools", "generate"]:
        """도구 사용 여부 판단"""
        messages = state["messages"]
        if not messages:
            return "generate"

        last_message = messages[-1]
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools"
        return "generate"

    # 그래프 구성
    workflow = StateGraph(AgentState)

    # 노드 추가
    workflow.add_node("router", router_node)
    workflow.add_node("tool_decision", tool_decision_node)
    workflow.add_node("tools", tool_executor_node)
    workflow.add_node("generate", generate_node)

    # 엣지 정의
    workflow.set_entry_point("router")
    workflow.add_edge("router", "tool_decision")
    workflow.add_conditional_edges(
        "tool_decision",
        should_use_tools,
        {"tools": "tools", "generate": "generate"},
    )
    workflow.add_edge("tools", "generate")
    workflow.add_edge("generate", END)

    return workflow.compile()


# 싱글톤 Agent
_agent = None


def get_agent():
    global _agent
    if _agent is None:
        _agent = create_agent_graph()
    return _agent
