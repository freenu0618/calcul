"""
벡터 스토어 서비스 (Stub 구현)
sentence-transformers/PyTorch 의존성 제거로 빌드 시간 단축
키워드 검색 fallback 사용
"""

import logging
from typing import Optional
from dataclasses import dataclass

from app.services.law_api import LawArticle

logger = logging.getLogger(__name__)


@dataclass
class SearchResult:
    """벡터 검색 결과"""
    article: LawArticle
    score: float


class VectorStoreService:
    """벡터 스토어 서비스 (Stub - 키워드 검색으로 대체됨)"""

    def __init__(self):
        self._initialized = False
        logger.info("VectorStoreService: Using keyword fallback (vector disabled)")

    async def initialize(self, articles: list[LawArticle]):
        """벡터 스토어 초기화 (no-op)"""
        self._initialized = True
        logger.info(f"Vector store stub: {len(articles)} articles (keyword fallback)")

    async def search(self, query: str, k: int = 5) -> list[SearchResult]:
        """벡터 검색 (항상 빈 결과 → RAG가 키워드 검색 사용)"""
        return []


# 싱글톤 인스턴스
_vector_store: Optional[VectorStoreService] = None


def get_vector_store() -> VectorStoreService:
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStoreService()
    return _vector_store
