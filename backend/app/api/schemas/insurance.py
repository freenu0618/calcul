"""보험료 조회 스키마"""
from pydantic import BaseModel, Field, ConfigDict

from .common import MoneyResponse


class InsuranceRatesResponse(BaseModel):
    """보험료율 정보 응답"""
    year: int = Field(..., description="적용 연도")
    national_pension: dict = Field(..., description="국민연금 정보")
    health_insurance: dict = Field(..., description="건강보험 정보")
    long_term_care: dict = Field(..., description="장기요양보험 정보")
    employment_insurance: dict = Field(..., description="고용보험 정보")

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "year": 2026,
            "national_pension": {
                "rate": 0.045,
                "max_base": 5900000,
                "min_base": 390000
            },
            "health_insurance": {
                "rate": 0.03595
            },
            "long_term_care": {
                "rate": 0.1295,
                "calculation": "건강보험료 기준"
            },
            "employment_insurance": {
                "rate": 0.009,
                "max_base": 13500000
            }
        }
    })


class InsuranceCalculationRequest(BaseModel):
    """보험료 계산 요청"""
    gross_income: int = Field(..., ge=0, description="총 과세 대상 급여 (원)")

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "gross_income": 2800000
        }
    })


class InsuranceCalculationResponse(BaseModel):
    """보험료 계산 응답"""
    national_pension: dict = Field(..., description="국민연금")
    health_insurance: dict = Field(..., description="건강보험")
    long_term_care: dict = Field(..., description="장기요양보험")
    employment_insurance: dict = Field(..., description="고용보험")
    total: int = Field(..., description="총 보험료")

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "national_pension": {
                "amount": 126000,
                "rate": 0.045,
                "base": 2800000
            },
            "health_insurance": {
                "amount": 100660,
                "rate": 0.03595,
                "base": 2800000
            },
            "long_term_care": {
                "amount": 13035,
                "calculation": "건강보험료 × 12.95%"
            },
            "employment_insurance": {
                "amount": 25200,
                "rate": 0.009,
                "base": 2800000
            },
            "total": 264895
        }
    })
