"""세금 조회 스키마"""
from pydantic import BaseModel, Field, ConfigDict


class TaxCalculationRequest(BaseModel):
    """세금 계산 요청"""
    taxable_income: int = Field(..., ge=0, description="과세 대상 소득 (원)")
    dependents_count: int = Field(
        ..., ge=0, le=20, description="부양가족 수 (본인 포함)"
    )
    children_under_20: int = Field(
        0, ge=0, le=20, description="20세 이하 자녀 수"
    )

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "taxable_income": 2800000,
            "dependents_count": 2,
            "children_under_20": 1
        }
    })


class TaxCalculationResponse(BaseModel):
    """세금 계산 응답"""
    income_tax: dict = Field(..., description="소득세")
    local_income_tax: dict = Field(..., description="지방소득세")
    total: int = Field(..., description="총 세금")

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "income_tax": {
                "amount": 27250,
                "calculation": "간이세액표 (부양가족 2명, 20세 이하 자녀 1명)"
            },
            "local_income_tax": {
                "amount": 2725,
                "calculation": "소득세 × 10%"
            },
            "total": 29975
        }
    })


class AnnualTaxEstimateRequest(BaseModel):
    """연간 소득세 추정 요청"""
    monthly_income: int = Field(..., ge=0, description="월 소득 (원)")
    dependents_count: int = Field(
        ..., ge=0, le=20, description="부양가족 수 (본인 포함)"
    )
    children_under_20: int = Field(
        0, ge=0, le=20, description="20세 이하 자녀 수"
    )

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "monthly_income": 2800000,
            "dependents_count": 2,
            "children_under_20": 1
        }
    })


class AnnualTaxEstimateResponse(BaseModel):
    """연간 소득세 추정 응답"""
    monthly_tax: int = Field(..., description="월 세금")
    annual_tax: int = Field(..., description="연간 세금 추정치")
    note: str = Field(
        ...,
        description="주의사항"
    )

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "monthly_tax": 29975,
            "annual_tax": 359700,
            "note": "간이세액표 기준이므로 실제 연말정산과 차이가 있을 수 있습니다."
        }
    })
