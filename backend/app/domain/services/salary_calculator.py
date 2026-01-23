"""Salary Calculator - 급여 계산 오케스트레이터

월급제/시급제를 지원하며 결근 공제 로직을 포함합니다.
"""
from dataclasses import dataclass, field
from decimal import Decimal
from typing import List, Optional

from ..entities import Employee, WorkShift, Allowance
from ..entities.employee import CompanySize
from ..value_objects import Money, WorkingHours
from .insurance_calculator import InsuranceCalculator, InsuranceResult
from .tax_calculator import TaxCalculator, TaxResult
from .overtime_calculator import OvertimeCalculator, OvertimeResult
from .weekly_holiday_pay_calculator import WeeklyHolidayPayCalculator, WeeklyHolidayPayResult
from .absence_calculator import AbsenceCalculator, AbsenceResult


@dataclass
class SalaryCalculationResult:
    """급여 계산 결과"""
    employee: Employee
    base_salary: Money
    allowances: List[Allowance]
    regular_wage: Money
    hourly_wage: Money
    overtime_result: OvertimeResult
    weekly_holiday_result: WeeklyHolidayPayResult
    total_gross: Money
    insurance_result: InsuranceResult
    tax_result: TaxResult
    total_deductions: Money
    net_pay: Money
    wage_type: str = "MONTHLY"
    calculation_month: str = ""
    absence_result: Optional[AbsenceResult] = None


class SalaryCalculator:
    """급여 계산기

    계산 순서:
    1. 기본급 결정 (월급제: 고정급-결근공제 / 시급제: 시급×시간)
    2. 통상시급 계산
    3. 연장/야간/휴일 수당 계산
    4. 주휴수당 계산 (개근 주만)
    5. 총 지급액 → 보험/세금 공제 → 실수령액
    """

    WEEKS_PER_MONTH = Decimal('4.345')  # 365 ÷ 7 ÷ 12

    def __init__(self):
        self.insurance_calculator = InsuranceCalculator()
        self.tax_calculator = TaxCalculator()
        self.overtime_calculator = OvertimeCalculator()
        self.weekly_holiday_calculator = WeeklyHolidayPayCalculator()
        self.absence_calculator = AbsenceCalculator()

    @staticmethod
    def calculate_monthly_regular_hours(
        weekly_hours: int, hours_mode: str = "174"
    ) -> Decimal:
        """월 소정근로시간 동적 계산

        Args:
            weekly_hours: 주 소정근로시간 (scheduled_work_days × daily_work_hours)
            hours_mode: "174" (주휴분리) 또는 "209" (주휴포함)

        Examples:
            40h, 174방식: min(40,40) × 4.345 = 173.8 ≈ 174
            35h, 174방식: min(35,40) × 4.345 = 152.075 ≈ 152
            40h, 209방식: (40 + 40/40×8) × 4.345 = 208.56 ≈ 209
        """
        capped = min(weekly_hours, 40)
        weeks = Decimal('4.345')
        if hours_mode == "209":
            # 주휴시간 포함: (소정근로 + 주휴시간) × 4.345
            weekly_holiday_hours = Decimal(capped) / Decimal('40') * Decimal('8')
            return ((Decimal(capped) + weekly_holiday_hours) * weeks).quantize(
                Decimal('1'), rounding='ROUND_HALF_UP'
            )
        else:
            # 174방식: 소정근로시간만
            return (Decimal(capped) * weeks).quantize(
                Decimal('1'), rounding='ROUND_HALF_UP'
            )

    def calculate(
        self,
        employee: Employee,
        base_salary: Money,
        allowances: List[Allowance],
        work_shifts: List[WorkShift],
        wage_type: str = "MONTHLY",
        hourly_wage_input: int = 0,
        calculation_month: str = "",
        absence_policy: str = "STRICT",
        weekly_hours: int = 40,
        hours_mode: str = "174",
    ) -> SalaryCalculationResult:
        """급여 계산

        Args:
            employee: 근로자 정보
            base_salary: 기본 월급 (월급제)
            allowances: 수당 리스트
            work_shifts: 근무 시프트 리스트 (1개월치)
            wage_type: "MONTHLY" 또는 "HOURLY"
            hourly_wage_input: 시급 (시급제)
            calculation_month: 계산 대상 월 (YYYY-MM)
            absence_policy: 결근 공제 정책
            weekly_hours: 주 소정근로시간 (scheduled_work_days × daily_work_hours)
            hours_mode: "174" (주휴분리) 또는 "209" (주휴포함)
        """
        # 0. 계산월 추론 (미지정 시 시프트 날짜에서)
        if not calculation_month and work_shifts:
            first_date = min(s.date for s in work_shifts)
            calculation_month = first_date.strftime("%Y-%m")

        absence_result = None
        is_over_5 = employee.company_size == CompanySize.OVER_5

        if wage_type == "HOURLY":
            # 시급제: 기본급 = 시급 × 실제 근무시간
            hw = Money(hourly_wage_input)
            total_minutes = sum(
                s.calculate_working_hours().to_minutes()
                for s in work_shifts if not s.is_holiday_work
            )
            total_hours = Decimal(total_minutes) / Decimal('60')
            effective_base = (hw * total_hours).round_to_won()
            hourly_wage = hw
            regular_wage = effective_base
        else:
            # 월급제: 결근 공제 계산
            if calculation_month and work_shifts:
                absence_result = self.absence_calculator.calculate(
                    work_shifts=work_shifts,
                    scheduled_work_days=employee.scheduled_work_days,
                    calculation_month=calculation_month,
                    base_salary=base_salary,
                    absence_policy=absence_policy,
                    is_over_5=is_over_5,
                )
                effective_base = base_salary - absence_result.total_deduction
            else:
                effective_base = base_salary

            # 통상임금 = 기본급(공제 전) + 통상임금 포함 수당
            regular_wage = self._calculate_regular_wage(base_salary, allowances)
            monthly_hours = self.calculate_monthly_regular_hours(weekly_hours, hours_mode)
            hourly_wage = self._calculate_hourly_wage(regular_wage, monthly_hours)

            # 결근 공제 후 주휴수당 계산용 시급 전달
            if absence_result:
                absence_result = AbsenceResult(
                    scheduled_days=absence_result.scheduled_days,
                    actual_work_days=absence_result.actual_work_days,
                    absent_days=absence_result.absent_days,
                    daily_wage=absence_result.daily_wage,
                    wage_deduction=absence_result.wage_deduction,
                    holiday_pay_loss=absence_result.holiday_pay_loss,
                    total_deduction=absence_result.total_deduction,
                    absent_weeks=absence_result.absent_weeks,
                )

        # 3. 연장/야간/휴일 수당
        overtime_result = self.overtime_calculator.calculate(
            work_shifts=work_shifts,
            hourly_wage=hourly_wage,
            company_size=employee.company_size,
            scheduled_work_days=employee.scheduled_work_days,
        )

        # 4. 주휴수당 (개근 주만 지급)
        weekly_holiday_result = self.weekly_holiday_calculator.calculate(
            work_shifts=work_shifts,
            hourly_wage=hourly_wage,
            scheduled_work_days=employee.scheduled_work_days,
        )

        # 5. 총 지급액
        total_gross = self._calculate_total_gross(
            base_salary=effective_base,
            allowances=allowances,
            overtime_pay=overtime_result.total(),
            weekly_holiday_pay=weekly_holiday_result.weekly_holiday_pay,
        )

        # 6. 보험/세금
        taxable_gross = self._calculate_taxable_gross(total_gross, allowances)
        insurance_result = self.insurance_calculator.calculate(taxable_gross)
        tax_result = self.tax_calculator.calculate(
            taxable_gross, employee.dependents_count, employee.children_under_20
        )

        total_deductions = insurance_result.total() + tax_result.total()
        net_pay = total_gross - total_deductions

        return SalaryCalculationResult(
            employee=employee,
            base_salary=effective_base,
            allowances=allowances,
            regular_wage=regular_wage,
            hourly_wage=hourly_wage,
            overtime_result=overtime_result,
            weekly_holiday_result=weekly_holiday_result,
            total_gross=total_gross,
            insurance_result=insurance_result,
            tax_result=tax_result,
            total_deductions=total_deductions,
            net_pay=net_pay,
            wage_type=wage_type,
            calculation_month=calculation_month,
            absence_result=absence_result,
        )

    def _calculate_regular_wage(
        self, base_salary: Money, allowances: List[Allowance]
    ) -> Money:
        """통상임금 = 기본급 + 통상임금 포함 고정수당"""
        regular_wage = base_salary
        for allowance in allowances:
            if allowance.is_regular_wage():
                regular_wage += allowance.amount
        return regular_wage

    def _calculate_hourly_wage(self, regular_wage: Money, monthly_hours: Decimal) -> Money:
        """통상시급 = 통상임금 ÷ 월 소정근로시간"""
        return (regular_wage / monthly_hours).round_to_won()

    def _calculate_total_gross(
        self, base_salary: Money, allowances: List[Allowance],
        overtime_pay: Money, weekly_holiday_pay: Money
    ) -> Money:
        """총 지급액 = 기본급 + 수당 + 가산수당 + 주휴수당"""
        total = base_salary
        for allowance in allowances:
            total += allowance.amount
        total += overtime_pay + weekly_holiday_pay
        return total

    def _calculate_taxable_gross(
        self, total_gross: Money, allowances: List[Allowance]
    ) -> Money:
        """과세 대상 = 총 지급액 - 비과세 수당"""
        non_taxable = Money.zero()
        for allowance in allowances:
            if not allowance.is_taxable:
                non_taxable += allowance.amount
        return total_gross - non_taxable

    @classmethod
    def get_monthly_regular_hours(cls, weekly_hours: int = 40, hours_mode: str = "174") -> Decimal:
        """월 소정근로시간 조회 (동적 계산)"""
        return cls.calculate_monthly_regular_hours(weekly_hours, hours_mode)
