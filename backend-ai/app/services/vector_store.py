"""
벡터 스토어 서비스 (OpenAI Embeddings 사용)
PyTorch 없이 클라우드 임베딩 API로 벡터 검색 지원
"""

import logging
import numpy as np
from typing import Optional
from dataclasses import dataclass

from app.services.law_api import LawArticle
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@dataclass
class SearchResult:
    """벡터 검색 결과"""
    article: LawArticle
    score: float


class VectorStoreService:
    """인메모리 벡터 스토어 (OpenAI Embeddings 사용)"""

    def __init__(self):
        self._articles: list[LawArticle] = []
        self._embeddings: list[list[float]] = []
        self._initialized = False
        self._client = None

    def _get_client(self):
        """OpenAI 클라이언트 lazy 초기화"""
        if self._client is None:
            try:
                from openai import OpenAI
                self._client = OpenAI(api_key=settings.openai_api_key)
            except Exception as e:
                logger.warning(f"OpenAI client init failed: {e}")
        return self._client

    def _get_embedding(self, text: str) -> Optional[list[float]]:
        """OpenAI API로 임베딩 생성"""
        client = self._get_client()
        if not client:
            return None

        try:
            # text-embedding-3-small: 저렴하고 빠름
            response = client.embeddings.create(
                model="text-embedding-3-small",
                input=text[:8000]  # 토큰 제한
            )
            return response.data[0].embedding
        except Exception as e:
            logger.warning(f"Embedding failed: {e}")
            return None

    def _cosine_similarity(self, a: list[float], b: list[float]) -> float:
        """코사인 유사도 계산"""
        a_np = np.array(a)
        b_np = np.array(b)
        return float(np.dot(a_np, b_np) / (np.linalg.norm(a_np) * np.linalg.norm(b_np)))

    async def initialize(self, articles: list[LawArticle]):
        """벡터 스토어 초기화 (법령 조문 임베딩)"""
        if not settings.openai_api_key:
            logger.info("VectorStore: OpenAI key not set, using keyword fallback")
            return

        self._articles = articles
        logger.info(f"VectorStore: Indexing {len(articles)} articles...")

        # 배치로 임베딩 생성 (비용 절약)
        for article in articles:
            text = f"{article.law_name} 제{article.article_no}조 {article.article_title or ''}: {article.content[:500]}"
            embedding = self._get_embedding(text)
            if embedding:
                self._embeddings.append(embedding)
            else:
                self._embeddings.append([])  # 빈 임베딩 (검색에서 제외됨)

        valid_count = sum(1 for e in self._embeddings if e)
        logger.info(f"VectorStore: {valid_count}/{len(articles)} articles indexed")
        self._initialized = valid_count > 0

    async def search(self, query: str, k: int = 3) -> list[SearchResult]:
        """벡터 검색으로 관련 조문 찾기"""
        if not self._initialized or not self._embeddings:
            return []

        # 쿼리 임베딩
        query_embedding = self._get_embedding(query)
        if not query_embedding:
            return []

        # 유사도 계산
        scores = []
        for i, emb in enumerate(self._embeddings):
            if emb:
                score = self._cosine_similarity(query_embedding, emb)
                scores.append((i, score))

        # 상위 k개 반환
        scores.sort(key=lambda x: x[1], reverse=True)
        results = []
        for idx, score in scores[:k]:
            if score > 0.3:  # 최소 유사도 임계값
                results.append(SearchResult(
                    article=self._articles[idx],
                    score=score
                ))

        return results


# 싱글톤 인스턴스
_vector_store: Optional[VectorStoreService] = None


def get_vector_store() -> VectorStoreService:
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStoreService()
    return _vector_store
