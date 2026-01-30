"""
LangGraph Agent Tools
급여계산, 법령검색, DB조회 도구
"""

import logging
from typing import Optional
import httpx
from langchain_core.tools import tool

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@tool
async def salary_calculator(
    base_salary: int,
    employment_type: str = "FULL_TIME",
    company_size: str = "OVER_5",
    dependents_count: int = 1,
    weekly_hours: int = 40,
) -> dict:
    """
    급여 계산 실행.
    기본급과 근무 조건을 입력하면 실수령액, 4대보험, 세금을 계산합니다.

    Args:
        base_salary: 기본급 (월급)
        employment_type: 고용형태 (FULL_TIME, PART_TIME, DAILY)
        company_size: 사업장 규모 (UNDER_5, OVER_5)
        dependents_count: 부양가족 수 (본인 포함)
        weekly_hours: 주 소정근로시간 (기본 40시간)

    Returns:
        급여 계산 결과 (실수령액, 공제 내역, 수당 내역)
    """
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{settings.spring_api_url}/api/v1/salary/calculate",
                json={
                    "employee": {
                        "name": "시뮬레이션",
                        "dependentsCount": dependents_count,
                        "employmentType": employment_type,
                        "companySize": company_size,
                        "weeklyScheduledHours": weekly_hours,
                    },
                    "baseSalary": base_salary,
                    "wageType": "MONTHLY",
                },
            )
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"API 오류: {response.status_code}"}
    except Exception as e:
        logger.error(f"Salary calculator error: {e}")
        return {"error": str(e)}


@tool
async def minimum_wage_check(hourly_rate: int) -> dict:
    """
    최저임금 위반 여부 확인.

    Args:
        hourly_rate: 시간당 임금

    Returns:
        최저임금 준수 여부 및 차액
    """
    MIN_WAGE_2026 = 10_320  # 2026년 최저시급

    is_compliant = hourly_rate >= MIN_WAGE_2026
    difference = hourly_rate - MIN_WAGE_2026

    return {
        "hourly_rate": hourly_rate,
        "minimum_wage": MIN_WAGE_2026,
        "is_compliant": is_compliant,
        "difference": difference,
        "message": (
            f"최저임금 준수 (시급 {hourly_rate:,}원)"
            if is_compliant
            else f"⚠️ 최저임금 위반! {abs(difference):,}원 부족 (노동청 신고 대상)"
        ),
    }


@tool
async def overtime_calculator(
    hourly_rate: int,
    overtime_hours: float,
    night_hours: float = 0,
    holiday_hours: float = 0,
    company_size: str = "OVER_5",
) -> dict:
    """
    연장/야간/휴일 수당 계산.

    Args:
        hourly_rate: 통상시급
        overtime_hours: 연장근로 시간 (주 40시간 초과분)
        night_hours: 야간근로 시간 (22:00~06:00)
        holiday_hours: 휴일근로 시간
        company_size: 사업장 규모 (UNDER_5, OVER_5)

    Returns:
        가산수당 계산 결과
    """
    # 가산율
    overtime_rate = 1.5
    night_rate = 0.5  # 가산분만
    holiday_rate = 1.5 if company_size == "OVER_5" else 1.0

    overtime_pay = int(hourly_rate * overtime_rate * overtime_hours)
    night_pay = int(hourly_rate * night_rate * night_hours)
    holiday_pay = int(hourly_rate * holiday_rate * holiday_hours)
    total = overtime_pay + night_pay + holiday_pay

    return {
        "hourly_rate": hourly_rate,
        "overtime": {"hours": overtime_hours, "rate": overtime_rate, "pay": overtime_pay},
        "night": {"hours": night_hours, "rate": night_rate, "pay": night_pay},
        "holiday": {"hours": holiday_hours, "rate": holiday_rate, "pay": holiday_pay},
        "total_extra_pay": total,
        "calculation": f"연장({overtime_pay:,}) + 야간({night_pay:,}) + 휴일({holiday_pay:,}) = {total:,}원",
    }


@tool
async def insurance_calculator(monthly_salary: int) -> dict:
    """
    4대 보험료 계산.

    Args:
        monthly_salary: 월 급여 (보험료 산정 기준)

    Returns:
        4대 보험료 내역 (근로자 부담분)
    """
    # 2026년 요율
    NATIONAL_PENSION_RATE = 0.0475  # 4.75% (연금개혁)
    HEALTH_INSURANCE_RATE = 0.03595  # 3.595%
    LONG_TERM_CARE_RATE = 0.1314  # 장기요양 = 건강보험 × 13.14%
    EMPLOYMENT_INSURANCE_RATE = 0.009  # 0.9%

    # 국민연금 상하한
    pension_base = min(max(monthly_salary, 390_000), 5_900_000)
    national_pension = int(pension_base * NATIONAL_PENSION_RATE)

    health_insurance = int(monthly_salary * HEALTH_INSURANCE_RATE)
    long_term_care = int(health_insurance * LONG_TERM_CARE_RATE)
    employment_insurance = int(monthly_salary * EMPLOYMENT_INSURANCE_RATE)

    total = national_pension + health_insurance + long_term_care + employment_insurance

    return {
        "monthly_salary": monthly_salary,
        "national_pension": national_pension,
        "health_insurance": health_insurance,
        "long_term_care": long_term_care,
        "employment_insurance": employment_insurance,
        "total": total,
        "summary": f"4대보험 합계: {total:,}원 (국민연금 {national_pension:,} + 건강 {health_insurance:,} + 장기요양 {long_term_care:,} + 고용 {employment_insurance:,})",
    }


@tool
async def law_search(query: str, law_name: Optional[str] = None) -> dict:
    """
    법령 검색 (RAG).
    관련 법령 조문을 검색합니다.

    Args:
        query: 검색어 (예: "연장근로 가산율", "주휴수당 지급 조건")
        law_name: 특정 법령명 (예: "근로기준법", "최저임금법")

    Returns:
        관련 법령 조문 목록
    """
    # TODO: Phase 6.2에서 실제 RAG 구현
    # 현재는 하드코딩된 응답 반환

    knowledge_base = {
        "연장근로": {
            "law": "근로기준법 제56조",
            "content": "연장근로에 대하여는 통상임금의 100분의 50 이상을 가산하여 지급",
            "note": "주 40시간 초과분에 적용",
        },
        "야간근로": {
            "law": "근로기준법 제56조",
            "content": "야간근로(오후 10시부터 오전 6시까지)에 대하여는 통상임금의 100분의 50 이상을 가산",
            "note": "22:00~06:00 근무 시 적용",
        },
        "휴일근로": {
            "law": "근로기준법 제56조",
            "content": "휴일근로에 대하여는 8시간 이내는 통상임금의 100분의 50, 8시간 초과는 100분의 100 가산",
            "note": "5인 이상 사업장에 적용",
        },
        "주휴수당": {
            "law": "근로기준법 제55조",
            "content": "1주 동안 소정의 근로일수를 개근한 자에게 1주에 평균 1회 이상의 유급휴일을 주어야 한다",
            "note": "주 15시간 이상 근무 시 적용",
        },
        "최저임금": {
            "law": "최저임금법 제6조",
            "content": "2026년 최저시급 10,320원. 월 환산액 2,156,880원 (209시간 기준)",
            "note": "모든 사업장 적용",
        },
    }

    results = []
    query_lower = query.lower()

    for keyword, info in knowledge_base.items():
        if keyword in query or keyword in query_lower:
            results.append(info)

    if not results:
        return {
            "query": query,
            "results": [],
            "message": "관련 법령을 찾지 못했습니다. 더 구체적인 검색어를 사용해주세요.",
        }

    return {
        "query": query,
        "results": results,
        "count": len(results),
    }


# 도구 목록
ALL_TOOLS = [
    salary_calculator,
    minimum_wage_check,
    overtime_calculator,
    insurance_calculator,
    law_search,
]
