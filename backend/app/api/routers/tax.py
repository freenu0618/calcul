"""세금 조회 API 라우터"""
from fastapi import APIRouter, HTTPException, status

from app.api.schemas import (
    TaxCalculationRequest,
    TaxCalculationResponse,
    AnnualTaxEstimateRequest,
    AnnualTaxEstimateResponse,
    ErrorResponse,
)
from app.domain.value_objects import Money
from app.domain.services import TaxCalculator

router = APIRouter()


@router.post(
    "/calculate",
    response_model=TaxCalculationResponse,
    status_code=status.HTTP_200_OK,
    summary="세금 계산",
    description="과세 대상 소득을 기반으로 소득세 및 지방소득세를 계산합니다.",
    responses={
        200: {"description": "세금 계산 성공"},
        400: {"model": ErrorResponse, "description": "잘못된 요청"},
    },
)
async def calculate_tax(request: TaxCalculationRequest):
    """세금 계산

    ## 계산 방식
    - **소득세**: 2026년 간이세액표 기준
    - **지방소득세**: 소득세 × 10%

    ## 공제 항목
    - 부양가족 수에 따른 공제
    - 20세 이하 자녀 추가 공제 (1명당 부양가족 1명 효과)

    ## 주의사항
    ⚠️ 간이세액표 기준이므로 실제 연말정산과 차이가 있을 수 있습니다.
    """
    try:
        calculator = TaxCalculator()
        result = calculator.calculate(
            Money(request.taxable_income),
            request.dependents_count,
            request.children_under_20,
        )

        return TaxCalculationResponse(**result.to_dict())

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Invalid input", "detail": str(e)},
        )


@router.post(
    "/estimate-annual",
    response_model=AnnualTaxEstimateResponse,
    status_code=status.HTTP_200_OK,
    summary="연간 소득세 추정",
    description="월 소득을 기반으로 연간 소득세를 추정합니다.",
    responses={
        200: {"description": "연간 소득세 추정 성공"},
        400: {"model": ErrorResponse, "description": "잘못된 요청"},
    },
)
async def estimate_annual_tax(request: AnnualTaxEstimateRequest):
    """연간 소득세 추정

    ## 계산 방식
    연간 세금 = 월 세금 × 12

    ## 주의사항
    ⚠️ 간이세액표 기준이므로 실제 연말정산과 차이가 있을 수 있습니다.
    - 연말정산 시 추가 공제 항목 반영
    - 월별 급여 변동 고려 안 됨
    """
    try:
        annual_tax = TaxCalculator.estimate_annual_tax(
            Money(request.monthly_income),
            request.dependents_count,
            request.children_under_20,
        )

        calculator = TaxCalculator()
        monthly_result = calculator.calculate(
            Money(request.monthly_income),
            request.dependents_count,
            request.children_under_20,
        )

        return AnnualTaxEstimateResponse(
            monthly_tax=monthly_result.total().to_int(),
            annual_tax=annual_tax.to_int(),
            note="간이세액표 기준이므로 실제 연말정산과 차이가 있을 수 있습니다.",
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Invalid input", "detail": str(e)},
        )
