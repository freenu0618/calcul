"""Salary Calculator - 급여 계산 오케스트레이터

모든 계산 서비스를 조합하여 최종 실수령액을 계산합니다.
"""
from dataclasses import dataclass
from decimal import Decimal
from typing import List

from ..entities import Employee, WorkShift, Allowance
from ..value_objects import Money, WorkingHours
from .insurance_calculator import InsuranceCalculator, InsuranceResult
from .tax_calculator import TaxCalculator, TaxResult
from .overtime_calculator import OvertimeCalculator, OvertimeResult
from .weekly_holiday_pay_calculator import WeeklyHolidayPayCalculator, WeeklyHolidayPayResult


@dataclass
class SalaryCalculationResult:
    """급여 계산 결과

    Attributes:
        employee: 근로자 정보
        base_salary: 기본급
        allowances: 수당 리스트
        regular_wage: 통상임금 (기본급 + 통상임금 포함 고정수당)
        hourly_wage: 통상시급
        overtime_result: 가산수당 계산 결과
        weekly_holiday_result: 주휴수당 계산 결과
        total_gross: 총 지급액
        insurance_result: 보험료 계산 결과
        tax_result: 세금 계산 결과
        total_deductions: 총 공제액
        net_pay: 실수령액
    """
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

    def to_dict(self) -> dict:
        """딕셔너리로 변환 (API 응답용)

        Returns:
            급여 계산 상세 정보
        """
        # 수당 분류
        taxable_allowances = [a for a in self.allowances if a.is_taxable]
        non_taxable_allowances = [a for a in self.allowances if not a.is_taxable]

        return {
            "employee": {
                "name": self.employee.name,
                "employment_type": self.employee.employment_type.value,
                "company_size": self.employee.company_size.value,
                "dependents_count": self.employee.dependents_count
            },
            "gross_breakdown": {
                "base_salary": self.base_salary.to_int(),
                "regular_wage": self.regular_wage.to_int(),
                "hourly_wage": self.hourly_wage.to_int(),
                "taxable_allowances": [
                    {"name": a.name, "amount": a.amount.to_int()}
                    for a in taxable_allowances
                ],
                "non_taxable_allowances": [
                    {"name": a.name, "amount": a.amount.to_int()}
                    for a in non_taxable_allowances
                ],
                "overtime": self.overtime_result.to_dict(),
                "weekly_holiday_pay": self.weekly_holiday_result.to_dict(),
                "total_gross": self.total_gross.to_int()
            },
            "deductions_breakdown": {
                "insurance": self.insurance_result.to_dict(),
                "tax": self.tax_result.to_dict(),
                "total_deductions": self.total_deductions.to_int()
            },
            "net_pay": self.net_pay.to_int()
        }


class SalaryCalculator:
    """급여 계산기

    한국 근로기준법 및 세법에 따라 실수령액을 계산합니다.

    계산 순서:
    1. 통상임금 계산 (기본급 + 통상임금 포함 고정수당)
    2. 통상시급 계산 (통상임금 ÷ 월 소정근로시간 174시간)
    3. 연장/야간/휴일 수당 계산 (통상시급 기준)
    4. 주휴수당 계산 (통상시급 기준)
    5. 총 지급액 계산
    6. 4대 보험 계산 (비과세 제외)
    7. 소득세 계산
    8. 실수령액 계산
    """

    # 월 소정근로시간 (주휴수당 제외)
    # 주 40시간 × (365일/7일) / 12개월 = 약 174시간
    #
    # ⚠️ 주의: 209시간은 최저임금 월 환산 기준 (주휴 포함)
    # 본 시스템은 주휴수당을 WeeklyHolidayPayCalculator에서 별도 계산하므로
    # 통상시급 계산 시 174시간(실제 근로시간)을 사용해야 함
    #
    # 참고:
    # - 209시간 사용 시: 통상시급 17.6% 낮아짐 (법적 오류)
    # - 주휴수당 이중 계산 방지를 위해 174시간 필수
    MONTHLY_REGULAR_HOURS = Decimal('174')

    def __init__(self):
        """초기화"""
        self.insurance_calculator = InsuranceCalculator()
        self.tax_calculator = TaxCalculator()
        self.overtime_calculator = OvertimeCalculator()
        self.weekly_holiday_calculator = WeeklyHolidayPayCalculator()

    def calculate(
        self,
        employee: Employee,
        base_salary: Money,
        allowances: List[Allowance],
        work_shifts: List[WorkShift]
    ) -> SalaryCalculationResult:
        """급여 계산

        Args:
            employee: 근로자 정보
            base_salary: 기본급
            allowances: 수당 리스트
            work_shifts: 근무 시프트 리스트 (1개월치)

        Returns:
            급여 계산 결과

        Examples:
            >>> employee = Employee(
            ...     name="홍길동",
            ...     dependents_count=2,
            ...     children_under_20=1,
            ...     employment_type=EmploymentType.FULL_TIME,
            ...     company_size=CompanySize.OVER_5
            ... )
            >>> calculator = SalaryCalculator()
            >>> result = calculator.calculate(
            ...     employee=employee,
            ...     base_salary=Money(2500000),
            ...     allowances=[...],
            ...     work_shifts=[...]
            ... )
            >>> result.net_pay.to_int()
            2944855
        """
        # 1. 통상임금 계산 (기본급 + 통상임금 포함 고정수당)
        regular_wage = self._calculate_regular_wage(base_salary, allowances)

        # 2. 통상시급 계산 (중요!)
        hourly_wage = self._calculate_hourly_wage(regular_wage)

        # 3. 연장/야간/휴일 수당 계산 (통상시급 기준)
        overtime_result = self.overtime_calculator.calculate(
            work_shifts=work_shifts,
            hourly_wage=hourly_wage,
            company_size=employee.company_size,
            scheduled_work_days=employee.scheduled_work_days
        )

        # 4. 주휴수당 계산 (통상시급 기준, 개근 조건 체크)
        weekly_holiday_result = self.weekly_holiday_calculator.calculate(
            work_shifts=work_shifts,
            hourly_wage=hourly_wage,
            scheduled_work_days=employee.scheduled_work_days
        )

        # 5. 총 지급액 계산
        total_gross = self._calculate_total_gross(
            base_salary=base_salary,
            allowances=allowances,
            overtime_pay=overtime_result.total(),
            weekly_holiday_pay=weekly_holiday_result.weekly_holiday_pay
        )

        # 6. 4대 보험 계산 (비과세 제외한 과세 대상 기준)
        taxable_gross = self._calculate_taxable_gross(total_gross, allowances)
        insurance_result = self.insurance_calculator.calculate(taxable_gross)

        # 7. 소득세 계산 (간이세액표)
        tax_result = self.tax_calculator.calculate(
            taxable_gross,
            employee.dependents_count,
            employee.children_under_20
        )

        # 8. 총 공제액
        total_deductions = insurance_result.total() + tax_result.total()

        # 9. 실수령액
        net_pay = total_gross - total_deductions

        return SalaryCalculationResult(
            employee=employee,
            base_salary=base_salary,
            allowances=allowances,
            regular_wage=regular_wage,
            hourly_wage=hourly_wage,
            overtime_result=overtime_result,
            weekly_holiday_result=weekly_holiday_result,
            total_gross=total_gross,
            insurance_result=insurance_result,
            tax_result=tax_result,
            total_deductions=total_deductions,
            net_pay=net_pay
        )

    def _calculate_regular_wage(
        self,
        base_salary: Money,
        allowances: List[Allowance]
    ) -> Money:
        """통상임금 계산

        통상임금: 근로자에게 정기적·일률적으로 지급되는 임금
        - 포함: 기본급, 고정 직책수당, 근속수당 등
        - 제외: 식대(비과세), 연장·야간·휴일 가산분, 실비변상 등

        Args:
            base_salary: 기본급
            allowances: 수당 리스트

        Returns:
            통상임금
        """
        # 기본급
        regular_wage = base_salary

        # 통상임금에 포함되는 수당만 합산
        for allowance in allowances:
            if allowance.is_regular_wage():
                regular_wage += allowance.amount

        return regular_wage

    def _calculate_hourly_wage(self, regular_wage: Money) -> Money:
        """통상시급 계산

        통상시급 = 월 통상임금 ÷ 월 소정근로시간 (174시간)

        ⚠️ 중요: 174시간은 실제 근로시간 기준입니다.
        209시간(주휴 포함)을 사용하면 통상시급이 17.6% 낮아져
        모든 가산수당이 과소 계산됩니다.

        본 시스템은 주휴수당을 별도로 계산하므로 174시간이 정확합니다.

        Args:
            regular_wage: 통상임금

        Returns:
            통상시급

        Examples:
            >>> calculator._calculate_hourly_wage(Money(2800000))
            Money(16092)  # 2,800,000 ÷ 174 = 16,092원
        """
        return (regular_wage / self.MONTHLY_REGULAR_HOURS).round_to_won()

    def _calculate_total_gross(
        self,
        base_salary: Money,
        allowances: List[Allowance],
        overtime_pay: Money,
        weekly_holiday_pay: Money
    ) -> Money:
        """총 지급액 계산

        총 지급액 = 기본급 + 모든 수당 + 가산수당 + 주휴수당

        Args:
            base_salary: 기본급
            allowances: 수당 리스트
            overtime_pay: 연장/야간/휴일 수당 합계
            weekly_holiday_pay: 주휴수당

        Returns:
            총 지급액
        """
        total = base_salary

        # 모든 수당 합산 (과세/비과세 포함)
        for allowance in allowances:
            total += allowance.amount

        # 가산수당 합산
        total += overtime_pay

        # 주휴수당 합산
        total += weekly_holiday_pay

        return total

    def _calculate_taxable_gross(
        self,
        total_gross: Money,
        allowances: List[Allowance]
    ) -> Money:
        """과세 대상 금액 계산

        과세 대상 = 총 지급액 - 비과세 수당

        Args:
            total_gross: 총 지급액
            allowances: 수당 리스트

        Returns:
            과세 대상 금액
        """
        # 비과세 수당 합계
        non_taxable_total = Money.zero()
        for allowance in allowances:
            if not allowance.is_taxable:
                non_taxable_total += allowance.amount

        return total_gross - non_taxable_total

    @classmethod
    def get_monthly_regular_hours(cls) -> Decimal:
        """월 소정근로시간 조회

        Returns:
            월 소정근로시간 (174시간)
        """
        return cls.MONTHLY_REGULAR_HOURS
