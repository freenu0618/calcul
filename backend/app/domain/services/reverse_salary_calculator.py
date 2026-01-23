"""Reverse Salary Calculator - 역산 계산기

실수령액(Net Pay) → 필요 기본급(Gross) 이진탐색 알고리즘
"""
from dataclasses import dataclass
from typing import List, Optional

from ..entities import Employee, WorkShift, Allowance
from ..value_objects import Money
from .salary_calculator import SalaryCalculator, SalaryCalculationResult


@dataclass
class ReverseSalaryResult:
    """역산 결과"""
    target_net_pay: Money
    required_base_salary: Money
    actual_net_pay: Money
    difference: Money
    iterations: int
    calculation_result: SalaryCalculationResult


class ReverseSalaryCalculator:
    """역산 계산기 - 이진탐색 기반

    실수령액을 입력하면 필요한 기본급을 역산합니다.
    비선형 관계(보험 상한, 세액표 구간)로 인해 이진탐색 사용.

    정확도: ±1,000원 이내
    """

    MAX_ITERATIONS = 50
    TOLERANCE = 1000  # ±1,000원

    def __init__(self):
        self.calculator = SalaryCalculator()

    def calculate(
        self,
        target_net_pay: Money,
        employee: Employee,
        allowances: List[Allowance],
        work_shifts: List[WorkShift],
        wage_type: str = "MONTHLY",
        calculation_month: str = "",
        absence_policy: str = "STRICT",
    ) -> ReverseSalaryResult:
        """역산 계산

        Args:
            target_net_pay: 목표 실수령액
            employee: 근로자 정보
            allowances: 수당 리스트
            work_shifts: 근무 시프트
            wage_type: MONTHLY 또는 HOURLY
            calculation_month: 계산월
            absence_policy: 결근 정책

        Returns:
            ReverseSalaryResult: 필요 기본급 및 계산 상세

        Raises:
            ValueError: 목표 금액이 0 이하이거나 탐색 실패 시
        """
        if target_net_pay.to_int() <= 0:
            raise ValueError("목표 실수령액은 0보다 커야 합니다")

        target = target_net_pay.to_int()

        # 탐색 범위: base_salary는 net_pay보다 작을 수 있음 (주휴수당 > 공제 시)
        lower = max(1, int(target * 0.5))
        upper = int(target * 1.5)

        # 상한 검증: upper로도 부족하면 확장
        for _ in range(5):
            upper_result = self._forward(
                Money(upper), employee, allowances, work_shifts,
                wage_type, calculation_month, absence_policy
            )
            if upper_result.net_pay.to_int() >= target:
                break
            upper = int(upper * 1.5)

        # 이진탐색: 목표에 가장 가까운 값 추적
        best_result: Optional[SalaryCalculationResult] = None
        best_salary = 0
        best_diff = float('inf')
        iterations = 0

        while lower <= upper and iterations < self.MAX_ITERATIONS:
            iterations += 1
            mid = (lower + upper) // 2

            result = self._forward(
                Money(mid), employee, allowances, work_shifts,
                wage_type, calculation_month, absence_policy
            )
            actual_net = result.net_pay.to_int()
            diff = actual_net - target

            # 가장 가까운 결과 추적
            if abs(diff) < best_diff:
                best_diff = abs(diff)
                best_result = result
                best_salary = mid

            if abs(diff) <= self.TOLERANCE:
                break
            elif actual_net < target:
                lower = mid + 1
            else:
                upper = mid - 1

        if best_result is None:
            raise ValueError("역산 실패: 적절한 기본급을 찾을 수 없습니다")

        return ReverseSalaryResult(
            target_net_pay=target_net_pay,
            required_base_salary=Money(best_salary),
            actual_net_pay=best_result.net_pay,
            difference=Money(abs(best_result.net_pay.to_int() - target)),
            iterations=iterations,
            calculation_result=best_result,
        )

    def _forward(
        self,
        base_salary: Money,
        employee: Employee,
        allowances: List[Allowance],
        work_shifts: List[WorkShift],
        wage_type: str,
        calculation_month: str,
        absence_policy: str,
    ) -> SalaryCalculationResult:
        """정방향 계산 실행"""
        hourly_input = base_salary.to_int() if wage_type == "HOURLY" else 0
        return self.calculator.calculate(
            employee=employee,
            base_salary=base_salary if wage_type == "MONTHLY" else Money.zero(),
            allowances=allowances,
            work_shifts=work_shifts,
            wage_type=wage_type,
            hourly_wage_input=hourly_input,
            calculation_month=calculation_month,
            absence_policy=absence_policy,
        )
