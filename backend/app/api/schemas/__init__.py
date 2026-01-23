"""API 스키마 패키지"""
from .common import (
    EmploymentTypeEnum,
    CompanySizeEnum,
    MoneyResponse,
    WorkingHoursResponse,
    EmployeeRequest,
    AllowanceRequest,
    WorkShiftRequest,
    ErrorResponse,
)
from .salary import (
    SalaryCalculationRequest,
    SalaryCalculationResponse,
    ReverseSalaryRequest,
    ReverseSalaryResponse,
)
from .insurance import (
    InsuranceRatesResponse,
    InsuranceCalculationRequest,
    InsuranceCalculationResponse,
)
from .tax import (
    TaxCalculationRequest,
    TaxCalculationResponse,
    AnnualTaxEstimateRequest,
    AnnualTaxEstimateResponse,
)

__all__ = [
    # Common
    "EmploymentTypeEnum",
    "CompanySizeEnum",
    "MoneyResponse",
    "WorkingHoursResponse",
    "EmployeeRequest",
    "AllowanceRequest",
    "WorkShiftRequest",
    "ErrorResponse",
    # Salary
    "SalaryCalculationRequest",
    "SalaryCalculationResponse",
    "ReverseSalaryRequest",
    "ReverseSalaryResponse",
    # Insurance
    "InsuranceRatesResponse",
    "InsuranceCalculationRequest",
    "InsuranceCalculationResponse",
    # Tax
    "TaxCalculationRequest",
    "TaxCalculationResponse",
    "AnnualTaxEstimateRequest",
    "AnnualTaxEstimateResponse",
]
