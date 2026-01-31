"""
RAG (Retrieval-Augmented Generation) 서비스
법령 검색 결과를 AI 응답에 포함 (벡터 + 키워드 하이브리드)
"""

import logging
from typing import Optional
from dataclasses import dataclass

from app.services.law_api import get_law_client, LawArticle
from app.services.vector_store import get_vector_store

logger = logging.getLogger(__name__)


@dataclass
class RAGContext:
    """RAG 컨텍스트"""
    query: str
    relevant_articles: list[LawArticle]
    context_text: str


# 노동법 관련 키워드 매핑
LABOR_KEYWORDS = {
    "최저임금": ["최저임금법", "근로기준법"],
    "연장근로": ["근로기준법"],
    "야간근로": ["근로기준법"],
    "휴일근로": ["근로기준법"],
    "주휴수당": ["근로기준법"],
    "주휴": ["근로기준법"],
    "퇴직금": ["근로자퇴직급여보장법", "근로기준법"],
    "연차": ["근로기준법"],
    "유급휴가": ["근로기준법"],
    "해고": ["근로기준법"],
    "4대보험": ["국민연금법", "국민건강보험법", "고용보험법"],
    "국민연금": ["국민연금법"],
    "건강보험": ["국민건강보험법"],
    "고용보험": ["고용보험법"],
    "산재보험": ["산업재해보상보험법"],
    "소득세": [],  # 세법은 별도
    "근로계약": ["근로기준법"],
    "임금체불": ["근로기준법"],
    "가산수당": ["근로기준법"],
    "통상임금": ["근로기준법"],
    "평균임금": ["근로기준법"],
}

# 관련 조문 번호 매핑
ARTICLE_MAPPING = {
    "근로기준법": {
        "최저임금": ["6조"],
        "연장근로": ["53조", "56조"],
        "야간근로": ["56조"],
        "휴일근로": ["55조", "56조"],
        "주휴수당": ["55조"],
        "주휴": ["55조"],
        "연차": ["60조"],
        "해고": ["23조", "26조", "27조"],
        "근로계약": ["15조", "17조"],
        "임금": ["43조"],
        "통상임금": ["2조", "43조"],
        "평균임금": ["2조"],
        "가산수당": ["56조"],
        "퇴직금": ["34조"],
    },
}


class RAGService:
    """RAG 서비스 (벡터 + 키워드 하이브리드)"""

    def __init__(self):
        self.law_client = get_law_client()
        self.vector_store = get_vector_store()
        self._cache: dict[str, list[LawArticle]] = {}
        self._vector_initialized = False

    async def _ensure_vector_store(self):
        """벡터 스토어 초기화 (최초 1회)"""
        if self._vector_initialized:
            return

        # 핵심 노동법령 로드
        try:
            labor_laws = await self.law_client.get_labor_laws()
            all_articles = []
            for articles in labor_laws.values():
                all_articles.extend(articles)
            await self.vector_store.initialize(all_articles)
            self._vector_initialized = True
            logger.info(f"Vector store ready with {len(all_articles)} articles")
        except Exception as e:
            logger.warning(f"Vector store init failed, using keyword fallback: {e}")

    async def get_context(self, query: str) -> RAGContext:
        """질문에 대한 관련 법령 컨텍스트 조회 (벡터 우선, 키워드 폴백)"""
        # 벡터 스토어 초기화
        await self._ensure_vector_store()

        # 1차: 벡터 검색
        if self._vector_initialized:
            results = await self.vector_store.search(query, k=3)
            if results:
                articles = [r.article for r in results]
                logger.info(f"RAG: Vector search found {len(articles)} articles")
                return RAGContext(
                    query=query,
                    relevant_articles=articles,
                    context_text=self._format_context(articles),
                )

        # 2차: 키워드 폴백
        keywords = self._extract_keywords(query)
        if not keywords:
            return RAGContext(query=query, relevant_articles=[], context_text="")

        articles = await self._fetch_relevant_articles(keywords)
        context_text = self._format_context(articles)

        return RAGContext(
            query=query,
            relevant_articles=articles,
            context_text=context_text,
        )

    def _extract_keywords(self, query: str) -> list[str]:
        """질문에서 노동법 관련 키워드 추출"""
        found = []
        query_lower = query.lower()

        for keyword in LABOR_KEYWORDS.keys():
            if keyword in query_lower:
                found.append(keyword)

        return found

    async def _fetch_relevant_articles(self, keywords: list[str]) -> list[LawArticle]:
        """키워드에 해당하는 법령 조문 조회"""
        articles = []
        seen = set()

        for keyword in keywords:
            law_names = LABOR_KEYWORDS.get(keyword, [])

            for law_name in law_names:
                # 캐시 확인
                cache_key = law_name
                if cache_key not in self._cache:
                    # API 호출
                    search_results = await self.law_client.search_laws(law_name, display=1)
                    if search_results:
                        law_articles = await self.law_client.get_law_content(search_results[0].law_id)
                        self._cache[cache_key] = law_articles
                    else:
                        self._cache[cache_key] = []

                # 관련 조문 필터링
                article_nums = ARTICLE_MAPPING.get(law_name, {}).get(keyword, [])

                for article in self._cache.get(cache_key, []):
                    # 조문 번호로 필터링
                    if article_nums:
                        if not any(num in article.article_no for num in article_nums):
                            continue

                    # 중복 제거
                    key = f"{article.law_name}_{article.article_no}"
                    if key not in seen:
                        seen.add(key)
                        articles.append(article)

        return articles[:5]  # 최대 5개 조문

    def _format_context(self, articles: list[LawArticle]) -> str:
        """조문을 컨텍스트 텍스트로 포맷팅"""
        if not articles:
            return ""

        parts = ["[관련 법령]"]
        for article in articles:
            title = f"{article.article_title}" if article.article_title else ""
            parts.append(f"\n【{article.law_name} 제{article.article_no}조{title}】")
            # 내용 축약 (너무 길면 자름)
            content = article.content[:500] + "..." if len(article.content) > 500 else article.content
            parts.append(content)

        return "\n".join(parts)


# 싱글톤 인스턴스
_rag_service: Optional[RAGService] = None


def get_rag_service() -> RAGService:
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service
