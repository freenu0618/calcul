"""공통 스키마 - 재사용 가능한 기본 모델"""
import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class EmploymentTypeEnum(str, Enum):
    """고용 형태"""
    FULL_TIME = "FULL_TIME"
    PART_TIME = "PART_TIME"
    CONTRACT = "CONTRACT"
    TEMPORARY = "TEMPORARY"


class CompanySizeEnum(str, Enum):
    """사업장 규모"""
    UNDER_5 = "UNDER_5"
    OVER_5 = "OVER_5"


class MoneyResponse(BaseModel):
    """금액 응답"""
    amount: int = Field(..., description="금액 (원)")
    formatted: str = Field(..., description="포맷팅된 금액 (예: 2,500,000원)")

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "amount": 2500000,
            "formatted": "2,500,000원"
        }
    })


class WorkingHoursResponse(BaseModel):
    """근로시간 응답"""
    hours: int = Field(..., description="시간")
    minutes: int = Field(..., description="분")
    total_minutes: int = Field(..., description="총 분")
    formatted: str = Field(..., description="포맷팅 (예: 8시간 30분)")

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "hours": 8,
            "minutes": 30,
            "total_minutes": 510,
            "formatted": "8시간 30분"
        }
    })


class EmployeeRequest(BaseModel):
    """근로자 정보 요청"""
    name: str = Field(..., min_length=1, max_length=100, description="근로자 이름")
    dependents_count: int = Field(
        ..., ge=0, le=20, description="부양가족 수 (본인 포함)"
    )
    children_under_20: int = Field(
        0, ge=0, le=20, description="20세 이하 자녀 수"
    )
    employment_type: EmploymentTypeEnum = Field(
        ..., description="고용 형태"
    )
    company_size: CompanySizeEnum = Field(
        ..., description="사업장 규모"
    )
    scheduled_work_days: int = Field(
        5, ge=1, le=7, description="주 소정근로일 (계약상 주당 근무일 수)"
    )

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "name": "홍길동",
            "dependents_count": 2,
            "children_under_20": 1,
            "employment_type": "FULL_TIME",
            "company_size": "OVER_5",
            "scheduled_work_days": 5
        }
    })


class AllowanceRequest(BaseModel):
    """수당 요청"""
    name: str = Field(..., min_length=1, max_length=100, description="수당 이름")
    amount: int = Field(..., ge=0, description="수당 금액 (원)")
    is_taxable: bool = Field(..., description="과세 대상 여부")
    is_includable_in_minimum_wage: bool = Field(
        ..., description="최저임금 산입 여부"
    )
    is_fixed: bool = Field(True, description="고정 수당 여부")
    is_included_in_regular_wage: bool = Field(
        True, description="통상임금 포함 여부"
    )

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "name": "직책수당",
            "amount": 300000,
            "is_taxable": True,
            "is_includable_in_minimum_wage": True,
            "is_fixed": True,
            "is_included_in_regular_wage": True
        }
    })


class WorkShiftRequest(BaseModel):
    """근무 시프트 요청"""
    date: datetime.date = Field(..., description="근무 날짜")
    start_time: datetime.time = Field(..., description="출근 시각")
    end_time: datetime.time = Field(..., description="퇴근 시각")
    break_minutes: int = Field(..., ge=0, description="휴게시간 (분)")
    is_holiday_work: bool = Field(False, description="휴일근로 여부")

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "date": "2026-01-05",
            "start_time": "09:00:00",
            "end_time": "18:00:00",
            "break_minutes": 60,
            "is_holiday_work": False
        }
    })


class ErrorResponse(BaseModel):
    """에러 응답"""
    error: str = Field(..., description="에러 메시지")
    detail: Optional[str] = Field(None, description="상세 내용")

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "error": "Invalid input",
            "detail": "Dependents count cannot be negative"
        }
    })
