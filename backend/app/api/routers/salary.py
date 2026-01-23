"""급여 계산 API 라우터"""
from fastapi import APIRouter, HTTPException, status
from datetime import datetime

from app.api.schemas import (
    SalaryCalculationRequest,
    SalaryCalculationResponse,
    MoneyResponse,
    WorkingHoursResponse,
    ErrorResponse,
)
from app.domain.entities import Employee, EmploymentType, CompanySize, WorkShift, Allowance
from app.domain.value_objects import Money
from app.domain.services import SalaryCalculator, WarningGenerator

router = APIRouter()


def _convert_to_money_response(money: Money) -> MoneyResponse:
    """Money 객체를 MoneyResponse로 변환"""
    return MoneyResponse(
        amount=money.to_int(),
        formatted=money.format()
    )


def _convert_to_hours_response(hours) -> WorkingHoursResponse:
    """WorkingHours 객체를 WorkingHoursResponse로 변환"""
    return WorkingHoursResponse(
        hours=hours.hours,
        minutes=hours.minutes,
        total_minutes=hours.to_minutes(),
        formatted=hours.format()
    )


@router.post(
    "/calculate",
    response_model=SalaryCalculationResponse,
    status_code=status.HTTP_200_OK,
    summary="급여 계산",
    description="기본급, 수당, 근무 시프트를 기반으로 실수령액을 계산합니다.",
    responses={
        200: {"description": "급여 계산 성공"},
        400: {"model": ErrorResponse, "description": "잘못된 요청"},
        500: {"model": ErrorResponse, "description": "서버 오류"},
    },
)
async def calculate_salary(request: SalaryCalculationRequest):
    """급여 계산

    ## 계산 항목
    - **4대 보험**: 국민연금, 건강보험, 장기요양보험, 고용보험
    - **가산수당**: 연장/야간/휴일 근로 수당
    - **주휴수당**: 주 근로시간 기준 비례 지급
    - **소득세**: 2026년 간이세액표 적용

    ## 법적 고지
    ⚠️ 본 계산 결과는 참고용이며, 실제 급여 지급 시 전문가와 상담하시기 바랍니다.
    """
    try:
        # 1. 도메인 객체 생성
        employee = Employee(
            name=request.employee.name,
            dependents_count=request.employee.dependents_count,
            children_under_20=request.employee.children_under_20,
            employment_type=EmploymentType[request.employee.employment_type],
            company_size=CompanySize[request.employee.company_size],
            scheduled_work_days=request.employee.scheduled_work_days,
        )

        base_salary = Money(request.base_salary)

        allowances = [
            Allowance(
                name=a.name,
                amount=Money(a.amount),
                is_taxable=a.is_taxable,
                is_includable_in_minimum_wage=a.is_includable_in_minimum_wage,
                is_fixed=a.is_fixed,
                is_included_in_regular_wage=a.is_included_in_regular_wage,
            )
            for a in request.allowances
        ]

        work_shifts = [
            WorkShift(
                date=ws.date,
                start_time=ws.start_time,
                end_time=ws.end_time,
                break_minutes=ws.break_minutes,
                is_holiday_work=ws.is_holiday_work,
            )
            for ws in request.work_shifts
        ]

        # 2. 급여 계산
        calculator = SalaryCalculator()
        result = calculator.calculate(employee, base_salary, allowances, work_shifts)

        # 3. 경고 생성
        warning_gen = WarningGenerator()
        warnings = warning_gen.generate(
            hourly_wage=result.hourly_wage,
            work_shifts=work_shifts,
            company_size=employee.company_size,
            base_salary=base_salary,
            total_gross=result.total_gross,
        )

        # 4. 응답 생성
        from app.api.schemas.salary import (
            GrossBreakdown, DeductionsBreakdown, InsuranceBreakdown,
            TaxBreakdown, OvertimeBreakdown, WeeklyHolidayPayBreakdown,
            WarningResponse,
        )

        # 과세/비과세 수당 계산
        taxable_allowances_total = sum(
            (a.amount for a in result.allowances if a.is_taxable),
            Money.zero()
        )
        non_taxable_allowances_total = sum(
            (a.amount for a in result.allowances if not a.is_taxable),
            Money.zero()
        )

        response = SalaryCalculationResponse(
            employee_name=employee.name,
            gross_breakdown=GrossBreakdown(
                base_salary=_convert_to_money_response(base_salary),
                regular_wage=_convert_to_money_response(result.regular_wage),
                hourly_wage=_convert_to_money_response(result.hourly_wage),
                taxable_allowances=_convert_to_money_response(taxable_allowances_total),
                non_taxable_allowances=_convert_to_money_response(non_taxable_allowances_total),
                overtime_allowances=OvertimeBreakdown(
                    overtime_hours=_convert_to_hours_response(result.overtime_result.overtime_hours),
                    overtime_pay=_convert_to_money_response(result.overtime_result.overtime_pay),
                    night_hours=_convert_to_hours_response(result.overtime_result.night_hours),
                    night_pay=_convert_to_money_response(result.overtime_result.night_pay),
                    holiday_hours=_convert_to_hours_response(result.overtime_result.holiday_hours),
                    holiday_pay=_convert_to_money_response(result.overtime_result.holiday_pay),
                    total=_convert_to_money_response(result.overtime_result.total()),
                ),
                weekly_holiday_pay=WeeklyHolidayPayBreakdown(
                    amount=_convert_to_money_response(result.weekly_holiday_result.weekly_holiday_pay),
                    weekly_hours=_convert_to_hours_response(result.weekly_holiday_result.weekly_hours),
                    is_proportional=result.weekly_holiday_result.is_proportional,
                    calculation=result.weekly_holiday_result.to_dict()["calculation"],
                ),
                total=_convert_to_money_response(result.total_gross),
            ),
            deductions_breakdown=DeductionsBreakdown(
                insurance=InsuranceBreakdown(
                    national_pension=_convert_to_money_response(result.insurance_result.national_pension),
                    health_insurance=_convert_to_money_response(result.insurance_result.health_insurance),
                    long_term_care=_convert_to_money_response(result.insurance_result.long_term_care),
                    employment_insurance=_convert_to_money_response(result.insurance_result.employment_insurance),
                    total=_convert_to_money_response(result.insurance_result.total()),
                ),
                tax=TaxBreakdown(
                    income_tax=_convert_to_money_response(result.tax_result.income_tax),
                    local_income_tax=_convert_to_money_response(result.tax_result.local_income_tax),
                    total=_convert_to_money_response(result.tax_result.total()),
                ),
                total=_convert_to_money_response(result.total_deductions),
            ),
            net_pay=_convert_to_money_response(result.net_pay),
            warnings=[
                WarningResponse(
                    level=w.level, message=w.message, detail=w.detail
                ) for w in warnings
            ],
            calculation_metadata={
                "calculation_date": datetime.now().isoformat(),
                "tax_year": 2026,
                "insurance_year": 2026,
            },
        )

        return response

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Invalid input", "detail": str(e)},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Internal server error", "detail": str(e)},
        )
