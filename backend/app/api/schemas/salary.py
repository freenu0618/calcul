"""급여 계산 스키마"""
from typing import List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

from .common import (
    EmployeeRequest,
    AllowanceRequest,
    WorkShiftRequest,
    MoneyResponse,
    WorkingHoursResponse,
)


class SalaryCalculationRequest(BaseModel):
    """급여 계산 요청"""
    employee: EmployeeRequest = Field(..., description="근로자 정보")
    base_salary: int = Field(..., ge=0, description="기본급 (원)")
    allowances: List[AllowanceRequest] = Field(
        default_factory=list, description="수당 목록"
    )
    work_shifts: List[WorkShiftRequest] = Field(
        default_factory=list, description="근무 시프트 목록"
    )

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "employee": {
                "name": "홍길동",
                "dependents_count": 2,
                "children_under_20": 1,
                "employment_type": "FULL_TIME",
                "company_size": "OVER_5"
            },
            "base_salary": 2500000,
            "allowances": [
                {
                    "name": "직책수당",
                    "amount": 300000,
                    "is_taxable": True,
                    "is_includable_in_minimum_wage": True,
                    "is_fixed": True,
                    "is_included_in_regular_wage": True
                }
            ],
            "work_shifts": [
                {
                    "date": "2026-01-05",
                    "start_time": "09:00:00",
                    "end_time": "18:00:00",
                    "break_minutes": 60,
                    "is_holiday_work": False
                }
            ]
        }
    })


class InsuranceBreakdown(BaseModel):
    """4대 보험 상세"""
    national_pension: MoneyResponse = Field(..., description="국민연금")
    health_insurance: MoneyResponse = Field(..., description="건강보험")
    long_term_care: MoneyResponse = Field(..., description="장기요양보험")
    employment_insurance: MoneyResponse = Field(..., description="고용보험")
    total: MoneyResponse = Field(..., description="4대 보험 합계")


class TaxBreakdown(BaseModel):
    """세금 상세"""
    income_tax: MoneyResponse = Field(..., description="소득세")
    local_income_tax: MoneyResponse = Field(..., description="지방소득세")
    total: MoneyResponse = Field(..., description="세금 합계")


class OvertimeBreakdown(BaseModel):
    """가산수당 상세"""
    overtime_hours: WorkingHoursResponse = Field(..., description="연장근로시간")
    overtime_pay: MoneyResponse = Field(..., description="연장근로수당")
    night_hours: WorkingHoursResponse = Field(..., description="야간근로시간")
    night_pay: MoneyResponse = Field(..., description="야간근로수당")
    holiday_hours: WorkingHoursResponse = Field(..., description="휴일근로시간")
    holiday_pay: MoneyResponse = Field(..., description="휴일근로수당")
    total: MoneyResponse = Field(..., description="가산수당 합계")


class WeeklyHolidayPayBreakdown(BaseModel):
    """주휴수당 상세"""
    amount: MoneyResponse = Field(..., description="주휴수당")
    weekly_hours: WorkingHoursResponse = Field(..., description="주 평균 근로시간")
    is_proportional: bool = Field(..., description="비례 지급 여부")
    calculation: str = Field(..., description="계산식")


class GrossBreakdown(BaseModel):
    """총 지급액 상세"""
    base_salary: MoneyResponse = Field(..., description="기본급")
    regular_wage: MoneyResponse = Field(..., description="통상임금")
    hourly_wage: MoneyResponse = Field(..., description="통상시급")
    taxable_allowances: MoneyResponse = Field(..., description="과세 수당")
    non_taxable_allowances: MoneyResponse = Field(..., description="비과세 수당")
    overtime_allowances: OvertimeBreakdown = Field(..., description="가산수당")
    weekly_holiday_pay: WeeklyHolidayPayBreakdown = Field(
        ..., description="주휴수당"
    )
    total: MoneyResponse = Field(..., description="총 지급액")


class DeductionsBreakdown(BaseModel):
    """공제 내역 상세"""
    insurance: InsuranceBreakdown = Field(..., description="4대 보험")
    tax: TaxBreakdown = Field(..., description="세금")
    total: MoneyResponse = Field(..., description="총 공제액")


class WarningResponse(BaseModel):
    """경고 메시지"""
    level: str = Field(..., description="경고 수준 (critical, warning, info)")
    message: str = Field(..., description="경고 메시지")
    detail: str = Field(default="", description="상세 설명")


class SalaryCalculationResponse(BaseModel):
    """급여 계산 응답"""
    employee_name: str = Field(..., description="근로자 이름")
    gross_breakdown: GrossBreakdown = Field(..., description="지급 내역")
    deductions_breakdown: DeductionsBreakdown = Field(..., description="공제 내역")
    net_pay: MoneyResponse = Field(..., description="실수령액")
    warnings: List[WarningResponse] = Field(
        default_factory=list, description="경고 메시지 목록"
    )
    calculation_metadata: Dict[str, Any] = Field(
        default_factory=dict, description="계산 메타데이터"
    )

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "employee_name": "홍길동",
            "gross_breakdown": {
                "base_salary": {"amount": 2500000, "formatted": "2,500,000원"},
                "total": {"amount": 3559358, "formatted": "3,559,358원"}
            },
            "deductions_breakdown": {
                "insurance": {
                    "total": {"amount": 317814, "formatted": "317,814원"}
                },
                "tax": {
                    "total": {"amount": 48345, "formatted": "48,345원"}
                },
                "total": {"amount": 366159, "formatted": "366,159원"}
            },
            "net_pay": {"amount": 3193199, "formatted": "3,193,199원"},
            "warnings": [],
            "calculation_metadata": {
                "calculation_date": "2026-01-13",
                "tax_year": 2026,
                "insurance_year": 2026
            }
        }
    })
