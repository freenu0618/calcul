"""Admin API 라우터 - 법정 요율 관리"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Any, List

from app.core.legal_rates_loader import (
    get_rates,
    get_available_years,
    get_insurance_rates,
    get_minimum_wage,
    update_rates,
    reload_rates,
)

router = APIRouter()


class RatesResponse(BaseModel):
    """법정 요율 응답"""
    year: int
    rates: Dict[str, Any]


class RatesUpdateRequest(BaseModel):
    """법정 요율 업데이트 요청"""
    year: int = Field(..., ge=2024, le=2030, description="적용 연도")
    rates: Dict[str, Any] = Field(..., description="요율 데이터")


@router.get(
    "/rates",
    response_model=RatesResponse,
    summary="법정 요율 조회",
    description="특정 연도의 최저임금, 보험료율 등을 조회합니다.",
)
async def get_legal_rates(year: int = 2026):
    """법정 요율 조회"""
    try:
        rates = get_rates(year)
        return RatesResponse(year=year, rates=rates)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/rates/years",
    response_model=List[str],
    summary="사용 가능 연도 목록",
)
async def list_available_years():
    """사용 가능한 연도 목록 조회"""
    return get_available_years()


@router.get(
    "/rates/insurance",
    summary="보험 요율 조회",
    description="4대 보험 요율을 Decimal 변환하여 조회합니다.",
)
async def get_insurance_rates_api(year: int = 2026):
    """보험 요율 조회"""
    try:
        rates = get_insurance_rates(year)
        # Decimal → float 변환 (JSON 직렬화)
        return {k: float(v) if hasattr(v, 'as_tuple') else v
                for k, v in rates.items()}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/rates/minimum-wage",
    summary="최저임금 조회",
)
async def get_minimum_wage_api(year: int = 2026):
    """최저임금 시급 조회"""
    try:
        wage = get_minimum_wage(year)
        return {"year": year, "hourly": int(wage)}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put(
    "/rates",
    response_model=RatesResponse,
    summary="법정 요율 업데이트",
    description="특정 연도의 법정 요율을 업데이트합니다. (관리자 전용)",
)
async def update_legal_rates(request: RatesUpdateRequest):
    """법정 요율 업데이트 (Admin)"""
    try:
        update_rates(request.year, request.rates)
        return RatesResponse(year=request.year, rates=request.rates)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
