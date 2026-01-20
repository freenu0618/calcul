"""보험료 조회 API 라우터"""
from fastapi import APIRouter, HTTPException, status

from app.api.schemas import (
    InsuranceRatesResponse,
    InsuranceCalculationRequest,
    InsuranceCalculationResponse,
    ErrorResponse,
)
from app.domain.value_objects import Money
from app.domain.services import InsuranceCalculator

router = APIRouter()


@router.get(
    "/rates",
    response_model=InsuranceRatesResponse,
    status_code=status.HTTP_200_OK,
    summary="보험료율 조회",
    description="2026년 4대 보험 요율 정보를 조회합니다.",
)
async def get_insurance_rates(year: int = 2026):
    """보험료율 조회

    ## 2026년 4대 보험 요율
    - **국민연금**: 4.5% (상한 590만원, 하한 39만원)
    - **건강보험**: 3.595%
    - **장기요양보험**: 건강보험료 × 12.95%
    - **고용보험**: 0.9% (상한 1350만원)
    """
    try:
        rates = InsuranceCalculator.get_rates_info(year)
        return InsuranceRatesResponse(**rates)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Invalid year", "detail": str(e)},
        )


@router.post(
    "/calculate",
    response_model=InsuranceCalculationResponse,
    status_code=status.HTTP_200_OK,
    summary="보험료 계산",
    description="총 과세 대상 급여를 기반으로 4대 보험료를 계산합니다.",
    responses={
        200: {"description": "보험료 계산 성공"},
        400: {"model": ErrorResponse, "description": "잘못된 요청"},
    },
)
async def calculate_insurance(request: InsuranceCalculationRequest):
    """보험료 계산

    ## 계산 방식
    - **국민연금**: 기준소득월액 × 4.5%
    - **건강보험**: 급여 × 3.595%
    - **장기요양보험**: 건강보험료 × 12.95%
    - **고용보험**: 급여 × 0.9%

    ## 주의사항
    - 국민연금은 상한/하한 적용
    - 고용보험은 상한 적용
    """
    try:
        calculator = InsuranceCalculator()
        result = calculator.calculate(Money(request.gross_income))

        return InsuranceCalculationResponse(**result.to_dict())

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Invalid input", "detail": str(e)},
        )
