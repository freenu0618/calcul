"""급여 계산 API 라우터"""
from fastapi import APIRouter, HTTPException, status
from datetime import datetime

from app.api.schemas import (
    SalaryCalculationRequest,
    SalaryCalculationResponse,
    ReverseSalaryRequest,
    ReverseSalaryResponse,
    MoneyResponse,
    WorkingHoursResponse,
    ErrorResponse,
)
from app.domain.entities import Employee, EmploymentType, CompanySize, WorkShift, Allowance
from app.domain.value_objects import Money
from app.domain.services import SalaryCalculator, ReverseSalaryCalculator, WarningGenerator

router = APIRouter()


def _money(money: Money) -> MoneyResponse:
    """Money → MoneyResponse"""
    return MoneyResponse(amount=money.to_int(), formatted=money.format())


def _hours(hours) -> WorkingHoursResponse:
    """WorkingHours → WorkingHoursResponse"""
    return WorkingHoursResponse(
        hours=hours.hours, minutes=hours.minutes,
        total_minutes=hours.to_minutes(), formatted=hours.format()
    )


@router.post(
    "/calculate",
    response_model=SalaryCalculationResponse,
    status_code=status.HTTP_200_OK,
    summary="급여 계산",
    description="월급제/시급제 지원. 시프트 기반 급여 계산 및 결근 공제.",
    responses={
        400: {"model": ErrorResponse, "description": "잘못된 요청"},
        500: {"model": ErrorResponse, "description": "서버 오류"},
    },
)
async def calculate_salary(request: SalaryCalculationRequest):
    """급여 계산 API"""
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
                name=a.name, amount=Money(a.amount),
                is_taxable=a.is_taxable,
                is_includable_in_minimum_wage=a.is_includable_in_minimum_wage,
                is_fixed=a.is_fixed,
                is_included_in_regular_wage=a.is_included_in_regular_wage,
            )
            for a in request.allowances
        ]
        work_shifts = [
            WorkShift(
                date=ws.date, start_time=ws.start_time,
                end_time=ws.end_time, break_minutes=ws.break_minutes,
                is_holiday_work=ws.is_holiday_work,
            )
            for ws in request.work_shifts
        ]

        # 2. 급여 계산 (새 파라미터 전달)
        calculator = SalaryCalculator()
        result = calculator.calculate(
            employee=employee,
            base_salary=base_salary,
            allowances=allowances,
            work_shifts=work_shifts,
            wage_type=request.wage_type,
            hourly_wage_input=request.hourly_wage,
            calculation_month=request.calculation_month,
            absence_policy=request.absence_policy,
        )

        # 3. 경고 생성
        warning_gen = WarningGenerator()
        warnings = warning_gen.generate(
            hourly_wage=result.hourly_wage,
            work_shifts=work_shifts,
            company_size=employee.company_size,
            base_salary=base_salary,
            total_gross=result.total_gross,
        )

        # 4. 응답 구성
        from app.api.schemas.salary import (
            GrossBreakdown, DeductionsBreakdown, InsuranceBreakdown,
            TaxBreakdown, OvertimeBreakdown, WeeklyHolidayPayBreakdown,
            WarningResponse, WorkSummaryResponse, AbsenceBreakdown,
        )
        from app.domain.value_objects import WorkingHours

        taxable_total = sum(
            (a.amount for a in result.allowances if a.is_taxable), Money.zero()
        )
        non_taxable_total = sum(
            (a.amount for a in result.allowances if not a.is_taxable), Money.zero()
        )

        # 근무 요약 생성
        work_summary = None
        if result.calculation_month:
            total_minutes = sum(
                s.calculate_working_hours().to_minutes() for s in work_shifts
            )
            night_minutes = sum(
                s.calculate_night_hours().to_minutes() for s in work_shifts
            )
            holiday_minutes = sum(
                s.calculate_working_hours().to_minutes()
                for s in work_shifts if s.is_holiday_work
            )
            regular_minutes = total_minutes - holiday_minutes
            overtime_minutes = result.overtime_result.overtime_hours.to_minutes()

            # 주 수 계산
            scheduled_days = 0
            absent_days = 0
            actual_days = len({s.date for s in work_shifts if not s.is_holiday_work})
            if result.absence_result:
                scheduled_days = result.absence_result.scheduled_days
                absent_days = result.absence_result.absent_days
            else:
                scheduled_days = actual_days

            # 주휴수당 발생 주 계산
            total_weeks = _count_weeks_in_month(result.calculation_month)
            holiday_weeks = total_weeks - (
                result.absence_result.absent_weeks if result.absence_result else 0
            )

            work_summary = WorkSummaryResponse(
                calculation_month=result.calculation_month,
                wage_type=result.wage_type,
                scheduled_days=scheduled_days,
                actual_work_days=actual_days,
                absent_days=absent_days,
                total_work_hours=_hours(WorkingHours.from_minutes(total_minutes)),
                regular_hours=_hours(WorkingHours.from_minutes(regular_minutes)),
                overtime_hours=_hours(result.overtime_result.overtime_hours),
                night_hours=_hours(result.overtime_result.night_hours),
                holiday_hours=_hours(result.overtime_result.holiday_hours),
                weekly_holiday_weeks=max(0, holiday_weeks),
                total_weeks=total_weeks,
            )

        # 결근 공제 상세
        absence_breakdown = None
        if result.absence_result and result.absence_result.absent_days > 0:
            ar = result.absence_result
            absence_breakdown = AbsenceBreakdown(
                scheduled_days=ar.scheduled_days,
                actual_work_days=ar.actual_work_days,
                absent_days=ar.absent_days,
                daily_wage=_money(ar.daily_wage),
                wage_deduction=_money(ar.wage_deduction),
                holiday_pay_loss=_money(ar.holiday_pay_loss),
                total_deduction=_money(ar.total_deduction),
                absence_policy=request.absence_policy,
            )

        response = SalaryCalculationResponse(
            employee_name=employee.name,
            gross_breakdown=GrossBreakdown(
                base_salary=_money(result.base_salary),
                regular_wage=_money(result.regular_wage),
                hourly_wage=_money(result.hourly_wage),
                taxable_allowances=_money(taxable_total),
                non_taxable_allowances=_money(non_taxable_total),
                overtime_allowances=OvertimeBreakdown(
                    overtime_hours=_hours(result.overtime_result.overtime_hours),
                    overtime_pay=_money(result.overtime_result.overtime_pay),
                    night_hours=_hours(result.overtime_result.night_hours),
                    night_pay=_money(result.overtime_result.night_pay),
                    holiday_hours=_hours(result.overtime_result.holiday_hours),
                    holiday_pay=_money(result.overtime_result.holiday_pay),
                    total=_money(result.overtime_result.total()),
                ),
                weekly_holiday_pay=WeeklyHolidayPayBreakdown(
                    amount=_money(result.weekly_holiday_result.weekly_holiday_pay),
                    weekly_hours=_hours(result.weekly_holiday_result.weekly_hours),
                    is_proportional=result.weekly_holiday_result.is_proportional,
                    calculation=result.weekly_holiday_result.to_dict()["calculation"],
                ),
                total=_money(result.total_gross),
            ),
            deductions_breakdown=DeductionsBreakdown(
                insurance=InsuranceBreakdown(
                    national_pension=_money(result.insurance_result.national_pension),
                    health_insurance=_money(result.insurance_result.health_insurance),
                    long_term_care=_money(result.insurance_result.long_term_care),
                    employment_insurance=_money(result.insurance_result.employment_insurance),
                    total=_money(result.insurance_result.total()),
                ),
                tax=TaxBreakdown(
                    income_tax=_money(result.tax_result.income_tax),
                    local_income_tax=_money(result.tax_result.local_income_tax),
                    total=_money(result.tax_result.total()),
                ),
                total=_money(result.total_deductions),
            ),
            net_pay=_money(result.net_pay),
            work_summary=work_summary,
            absence_breakdown=absence_breakdown,
            warnings=[
                WarningResponse(level=w.level, message=w.message, detail=w.detail)
                for w in warnings
            ],
            calculation_metadata={
                "calculation_date": datetime.now().isoformat(),
                "tax_year": 2026,
                "insurance_year": 2026,
                "wage_type": result.wage_type,
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


@router.post(
    "/reverse-calculate",
    response_model=ReverseSalaryResponse,
    status_code=status.HTTP_200_OK,
    summary="역산 계산 (실수령액 → 필요 기본급)",
    description="목표 실수령액을 입력하면 필요한 기본급을 이진탐색으로 역산합니다.",
    responses={
        400: {"model": ErrorResponse, "description": "잘못된 요청"},
        500: {"model": ErrorResponse, "description": "서버 오류"},
    },
)
async def reverse_calculate_salary(request: ReverseSalaryRequest):
    """역산 계산 API

    ⚠️ 포괄임금제 오용 주의: 역산 결과를 근로계약서에 직접 적용하는 것은
    포괄임금제 오용에 해당할 수 있습니다.
    """
    try:
        employee = Employee(
            name=request.employee.name,
            dependents_count=request.employee.dependents_count,
            children_under_20=request.employee.children_under_20,
            employment_type=EmploymentType[request.employee.employment_type],
            company_size=CompanySize[request.employee.company_size],
            scheduled_work_days=request.employee.scheduled_work_days,
        )
        allowances = [
            Allowance(
                name=a.name, amount=Money(a.amount),
                is_taxable=a.is_taxable,
                is_includable_in_minimum_wage=a.is_includable_in_minimum_wage,
                is_fixed=a.is_fixed,
                is_included_in_regular_wage=a.is_included_in_regular_wage,
            )
            for a in request.allowances
        ]
        work_shifts = [
            WorkShift(
                date=ws.date, start_time=ws.start_time,
                end_time=ws.end_time, break_minutes=ws.break_minutes,
                is_holiday_work=ws.is_holiday_work,
            )
            for ws in request.work_shifts
        ]

        # 역산 계산
        reverse_calculator = ReverseSalaryCalculator()
        reverse_result = reverse_calculator.calculate(
            target_net_pay=Money(request.target_net_pay),
            employee=employee,
            allowances=allowances,
            work_shifts=work_shifts,
            wage_type=request.wage_type,
            calculation_month=request.calculation_month,
            absence_policy=request.absence_policy,
        )

        # 정방향 계산 결과로 응답 구성 (기존 calculate_salary와 동일 형식)
        result = reverse_result.calculation_result
        from app.api.schemas.salary import (
            GrossBreakdown, DeductionsBreakdown, InsuranceBreakdown,
            TaxBreakdown, OvertimeBreakdown, WeeklyHolidayPayBreakdown,
            WarningResponse, WorkSummaryResponse, AbsenceBreakdown,
        )
        from app.domain.value_objects import WorkingHours

        taxable_total = sum(
            (a.amount for a in result.allowances if a.is_taxable), Money.zero()
        )
        non_taxable_total = sum(
            (a.amount for a in result.allowances if not a.is_taxable), Money.zero()
        )

        calc_response = SalaryCalculationResponse(
            employee_name=employee.name,
            gross_breakdown=GrossBreakdown(
                base_salary=_money(result.base_salary),
                regular_wage=_money(result.regular_wage),
                hourly_wage=_money(result.hourly_wage),
                taxable_allowances=_money(taxable_total),
                non_taxable_allowances=_money(non_taxable_total),
                overtime_allowances=OvertimeBreakdown(
                    overtime_hours=_hours(result.overtime_result.overtime_hours),
                    overtime_pay=_money(result.overtime_result.overtime_pay),
                    night_hours=_hours(result.overtime_result.night_hours),
                    night_pay=_money(result.overtime_result.night_pay),
                    holiday_hours=_hours(result.overtime_result.holiday_hours),
                    holiday_pay=_money(result.overtime_result.holiday_pay),
                    total=_money(result.overtime_result.total()),
                ),
                weekly_holiday_pay=WeeklyHolidayPayBreakdown(
                    amount=_money(result.weekly_holiday_result.weekly_holiday_pay),
                    weekly_hours=_hours(result.weekly_holiday_result.weekly_hours),
                    is_proportional=result.weekly_holiday_result.is_proportional,
                    calculation=result.weekly_holiday_result.to_dict()["calculation"],
                ),
                total=_money(result.total_gross),
            ),
            deductions_breakdown=DeductionsBreakdown(
                insurance=InsuranceBreakdown(
                    national_pension=_money(result.insurance_result.national_pension),
                    health_insurance=_money(result.insurance_result.health_insurance),
                    long_term_care=_money(result.insurance_result.long_term_care),
                    employment_insurance=_money(result.insurance_result.employment_insurance),
                    total=_money(result.insurance_result.total()),
                ),
                tax=TaxBreakdown(
                    income_tax=_money(result.tax_result.income_tax),
                    local_income_tax=_money(result.tax_result.local_income_tax),
                    total=_money(result.tax_result.total()),
                ),
                total=_money(result.total_deductions),
            ),
            net_pay=_money(result.net_pay),
            warnings=[],
            calculation_metadata={
                "calculation_date": datetime.now().isoformat(),
                "tax_year": 2026,
                "insurance_year": 2026,
                "wage_type": result.wage_type,
                "reverse_calculation": True,
            },
        )

        # 경고 생성 (포괄임금제 오용 주의 포함)
        warning_gen = WarningGenerator()
        warnings = warning_gen.generate(
            hourly_wage=result.hourly_wage,
            work_shifts=work_shifts,
            company_size=employee.company_size,
            base_salary=reverse_result.required_base_salary,
            total_gross=result.total_gross,
        )
        # 역산 고유 경고 추가
        from app.domain.services.warning_generator import Warning
        warnings.append(Warning(
            level="warning",
            message="포괄임금제 오용 주의",
            detail="역산 결과를 근로계약서에 직접 적용 시 포괄임금제 오용에 해당할 수 있습니다. 노무사 상담을 권장합니다.",
        ))

        return ReverseSalaryResponse(
            target_net_pay=_money(reverse_result.target_net_pay),
            required_base_salary=_money(reverse_result.required_base_salary),
            actual_net_pay=_money(reverse_result.actual_net_pay),
            difference=_money(reverse_result.difference),
            iterations=reverse_result.iterations,
            calculation_result=calc_response,
            warnings=[
                WarningResponse(level=w.level, message=w.message, detail=w.detail)
                for w in warnings
            ],
        )

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


def _count_weeks_in_month(calculation_month: str) -> int:
    """해당 월의 주 수 계산 (ISO 주 기준)"""
    import calendar
    from datetime import date
    year, month = map(int, calculation_month.split('-'))
    _, days = calendar.monthrange(year, month)
    weeks = set()
    for day in range(1, days + 1):
        d = date(year, month, day)
        weeks.add(d.isocalendar()[:2])
    return len(weeks)
