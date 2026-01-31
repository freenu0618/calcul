"""
법령정보센터 Open API 클라이언트
https://www.law.go.kr/openApi.do
"""

import logging
import httpx
from typing import Optional
from dataclasses import dataclass

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

BASE_URL = "http://www.law.go.kr/DRF"


@dataclass
class LawArticle:
    """법령 조문"""
    law_name: str
    article_no: str
    article_title: str
    content: str


@dataclass
class LawSearchResult:
    """법령 검색 결과"""
    law_id: str
    law_name: str
    law_type: str  # 법률, 시행령, 시행규칙
    promulgation_date: str


class LawAPIClient:
    """법령정보센터 API 클라이언트"""

    def __init__(self):
        self.api_key = settings.law_api_key
        self.client = httpx.AsyncClient(timeout=30.0)

    async def search_laws(
        self,
        query: str,
        target: str = "law",  # law: 법령, prec: 판례
        display: int = 10,
    ) -> list[LawSearchResult]:
        """
        법령 검색

        Args:
            query: 검색어 (예: "근로기준법", "최저임금")
            target: 검색 대상 (law/prec)
            display: 결과 수
        """
        if not self.api_key:
            logger.warning("Law API key not configured")
            return []

        try:
            params = {
                "OC": self.api_key,
                "target": target,
                "type": "XML",
                "query": query,
                "display": display,
            }

            response = await self.client.get(f"{BASE_URL}/lawSearch.do", params=params)
            response.raise_for_status()

            # XML 파싱
            from xml.etree import ElementTree as ET
            root = ET.fromstring(response.text)

            results = []
            for item in root.findall(".//law"):
                results.append(LawSearchResult(
                    law_id=item.findtext("법령ID", ""),
                    law_name=item.findtext("법령명한글", ""),
                    law_type=item.findtext("법령구분", ""),
                    promulgation_date=item.findtext("공포일자", ""),
                ))

            logger.info(f"Law search '{query}': {len(results)} results")
            return results

        except Exception as e:
            logger.error(f"Law search error: {e}")
            return []

    async def get_law_content(
        self,
        law_id: str,
        article_no: Optional[str] = None,
    ) -> list[LawArticle]:
        """
        법령 조문 조회

        Args:
            law_id: 법령 ID
            article_no: 특정 조문 번호 (없으면 전체)
        """
        if not self.api_key:
            return []

        try:
            params = {
                "OC": self.api_key,
                "target": "law",
                "type": "XML",
                "ID": law_id,
            }

            response = await self.client.get(f"{BASE_URL}/lawService.do", params=params)
            response.raise_for_status()

            from xml.etree import ElementTree as ET
            root = ET.fromstring(response.text)

            law_name = root.findtext(".//법령명_한글", "")
            articles = []

            for article in root.findall(".//조문단위"):
                art_no = article.findtext("조문번호", "")

                # 특정 조문만 필터링
                if article_no and art_no != article_no:
                    continue

                content_parts = []
                for content in article.findall(".//조문내용"):
                    if content.text:
                        content_parts.append(content.text.strip())

                # 항 내용도 포함
                for para in article.findall(".//항"):
                    para_content = para.findtext("항내용", "")
                    if para_content:
                        content_parts.append(para_content.strip())

                if content_parts:
                    articles.append(LawArticle(
                        law_name=law_name,
                        article_no=art_no,
                        article_title=article.findtext("조문제목", ""),
                        content="\n".join(content_parts),
                    ))

            logger.info(f"Law content '{law_id}': {len(articles)} articles")
            return articles

        except Exception as e:
            logger.error(f"Law content error: {e}")
            return []

    async def get_labor_laws(self) -> dict[str, list[LawArticle]]:
        """
        노동 관련 핵심 법령 조회
        - 근로기준법
        - 최저임금법
        - 고용보험법
        - 국민연금법
        """
        labor_law_ids = {
            "근로기준법": "001930",
            "최저임금법": "003325",
            "고용보험법": "004852",
            "국민연금법": "003594",
            "국민건강보험법": "005765",
        }

        result = {}
        for name, law_id in labor_law_ids.items():
            articles = await self.get_law_content(law_id)
            if articles:
                result[name] = articles

        return result

    async def close(self):
        await self.client.aclose()


# 싱글톤 인스턴스
_law_client: Optional[LawAPIClient] = None


def get_law_client() -> LawAPIClient:
    global _law_client
    if _law_client is None:
        _law_client = LawAPIClient()
    return _law_client
