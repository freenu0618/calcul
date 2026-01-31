"""
벡터 스토어 서비스
법령 데이터를 임베딩하여 유사도 검색
"""

import logging
from typing import Optional
from dataclasses import dataclass

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.schema import Document

from app.services.law_api import LawArticle

logger = logging.getLogger(__name__)


@dataclass
class SearchResult:
    """벡터 검색 결과"""
    article: LawArticle
    score: float


class VectorStoreService:
    """벡터 스토어 서비스 (ChromaDB + HuggingFace 임베딩)"""

    def __init__(self):
        # 한국어 특화 임베딩 모델 (무료, 로컬)
        self.embeddings = HuggingFaceEmbeddings(
            model_name="jhgan/ko-sroberta-multitask",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        self.vector_store: Optional[Chroma] = None
        self._initialized = False

    async def initialize(self, articles: list[LawArticle]):
        """법령 조문으로 벡터 스토어 초기화"""
        if self._initialized and self.vector_store:
            return

        documents = []
        for article in articles:
            # 문서 생성
            doc = Document(
                page_content=f"{article.law_name} 제{article.article_no}조 {article.article_title}\n{article.content}",
                metadata={
                    "law_name": article.law_name,
                    "article_no": article.article_no,
                    "article_title": article.article_title,
                },
            )
            documents.append(doc)

        if documents:
            self.vector_store = Chroma.from_documents(
                documents=documents,
                embedding=self.embeddings,
                collection_name="labor_laws",
            )
            self._initialized = True
            logger.info(f"Vector store initialized with {len(documents)} documents")

    async def search(self, query: str, k: int = 5) -> list[SearchResult]:
        """쿼리와 유사한 법령 조문 검색"""
        if not self.vector_store:
            return []

        try:
            results = self.vector_store.similarity_search_with_score(query, k=k)
            search_results = []
            for doc, score in results:
                article = LawArticle(
                    law_name=doc.metadata.get("law_name", ""),
                    article_no=doc.metadata.get("article_no", ""),
                    article_title=doc.metadata.get("article_title", ""),
                    content=doc.page_content,
                )
                search_results.append(SearchResult(article=article, score=score))
            return search_results
        except Exception as e:
            logger.error(f"Vector search error: {e}")
            return []


# 싱글톤 인스턴스
_vector_store: Optional[VectorStoreService] = None


def get_vector_store() -> VectorStoreService:
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStoreService()
    return _vector_store
