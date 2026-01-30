"""
Tiered LLM with Fallback Chain & Circuit Breaker
Tier 1: Gemini 2.0 Flash (무료/저렴)
Tier 2: Groq Llama 3.3 70B (중간)
Tier 3: GPT-4o-mini (최후 보루)
"""

import logging
import time
from typing import Optional
from dataclasses import dataclass, field

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_core.language_models import BaseChatModel

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@dataclass
class CircuitBreaker:
    """Circuit Breaker 패턴 구현"""
    failure_threshold: int = 5
    recovery_timeout: int = 300  # 5분
    failure_count: int = field(default=0, init=False)
    last_failure_time: float = field(default=0, init=False)
    is_open: bool = field(default=False, init=False)

    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.is_open = True
            logger.warning(f"Circuit breaker opened after {self.failure_count} failures")

    def record_success(self):
        self.failure_count = 0
        self.is_open = False

    def can_execute(self) -> bool:
        if not self.is_open:
            return True
        # Recovery timeout 체크
        if time.time() - self.last_failure_time > self.recovery_timeout:
            self.is_open = False
            self.failure_count = 0
            logger.info("Circuit breaker recovered")
            return True
        return False


class TieredLLM:
    """Tiered LLM with Fallback Chain"""

    def __init__(self):
        self.tiers: list[tuple[str, BaseChatModel]] = []
        self.circuit_breakers: dict[str, CircuitBreaker] = {}
        self._init_tiers()

    def _init_tiers(self):
        # Tier 1: Gemini
        if settings.google_api_key:
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                temperature=settings.llm_temperature,
                google_api_key=settings.google_api_key,
                timeout=settings.llm_timeout,
            )
            self.tiers.append(("gemini", llm))
            self.circuit_breakers["gemini"] = CircuitBreaker()
            logger.info("Tier 1 (Gemini) initialized")

        # Tier 2: Groq
        if settings.groq_api_key:
            llm = ChatGroq(
                model="llama-3.3-70b-versatile",
                temperature=settings.llm_temperature,
                groq_api_key=settings.groq_api_key,
                timeout=settings.llm_timeout,
            )
            self.tiers.append(("groq", llm))
            self.circuit_breakers["groq"] = CircuitBreaker()
            logger.info("Tier 2 (Groq) initialized")

        # Tier 3: OpenAI
        if settings.openai_api_key:
            llm = ChatOpenAI(
                model="gpt-4o-mini",
                temperature=settings.llm_temperature,
                openai_api_key=settings.openai_api_key,
                timeout=settings.llm_timeout,
            )
            self.tiers.append(("openai", llm))
            self.circuit_breakers["openai"] = CircuitBreaker()
            logger.info("Tier 3 (OpenAI) initialized")

        if not self.tiers:
            raise ValueError("No LLM API keys configured")

    def get_llm_with_fallback(self) -> BaseChatModel:
        """Fallback이 설정된 LLM 반환"""
        available_llms = []
        for name, llm in self.tiers:
            if self.circuit_breakers[name].can_execute():
                available_llms.append(llm)

        if not available_llms:
            # 모든 circuit breaker가 열려있으면 강제로 첫 번째 사용
            logger.warning("All circuit breakers open, forcing first tier")
            return self.tiers[0][1]

        if len(available_llms) == 1:
            return available_llms[0]

        # with_fallbacks로 체인 구성
        primary = available_llms[0]
        fallbacks = available_llms[1:]
        return primary.with_fallbacks(fallbacks)

    async def ainvoke(self, messages, **kwargs):
        """비동기 호출 with Circuit Breaker"""
        for name, llm in self.tiers:
            cb = self.circuit_breakers[name]
            if not cb.can_execute():
                logger.debug(f"Skipping {name} (circuit open)")
                continue

            try:
                response = await llm.ainvoke(messages, **kwargs)
                cb.record_success()
                logger.info(f"Response from {name}")
                return response
            except Exception as e:
                cb.record_failure()
                logger.warning(f"{name} failed: {e}")
                continue

        raise RuntimeError("All LLM tiers failed")

    async def astream(self, messages, **kwargs):
        """비동기 스트리밍 with Circuit Breaker"""
        for name, llm in self.tiers:
            cb = self.circuit_breakers[name]
            if not cb.can_execute():
                continue

            try:
                async for chunk in llm.astream(messages, **kwargs):
                    yield chunk
                cb.record_success()
                logger.info(f"Streamed from {name}")
                return
            except Exception as e:
                cb.record_failure()
                logger.warning(f"{name} stream failed: {e}")
                continue

        raise RuntimeError("All LLM tiers failed for streaming")


# 싱글톤 인스턴스
_tiered_llm: Optional[TieredLLM] = None


def get_tiered_llm() -> TieredLLM:
    global _tiered_llm
    if _tiered_llm is None:
        _tiered_llm = TieredLLM()
    return _tiered_llm
