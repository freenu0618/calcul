"""Reverse Salary Calculator 역산 계산기 테스트"""
import pytest
from datetime import date, time
from app.domain.services.reverse_salary_calculator import ReverseSalaryCalculator
from app.domain.services.salary_calculator import SalaryCalculator
from app.domain.entities.employee import Employee, EmploymentType, CompanySize
from app.domain.entities.work_shift import WorkShift
from app.domain.entities.allowance import Allowance
from app.domain.value_objects.money import Money


def _create_employee(**kwargs):
    defaults = {
        "name": "홍길동",
        "dependents_count": 2,
        "children_under_20": 1,
        "employment_type": EmploymentType.FULL_TIME,
        "company_size": CompanySize.OVER_5,
        "scheduled_work_days": 5,
    }
    defaults.update(kwargs)
    return Employee(**defaults)


def _create_monthly_shifts(year=2026, month=1):
    """1월 주5일 근무 시프트 생성"""
    shifts = []
    for day in range(1, 32):
        try:
            d = date(year, month, day)
        except ValueError:
            break
        if d.weekday() < 5 and d != date(2026, 1, 1):  # 신정 제외
            shifts.append(WorkShift(d, time(9, 0), time(18, 0), 60))
    return shifts


class TestReverseSalaryBasic:
    """기본 역산 테스트"""

    def test_reverse_basic_250(self):
        """기본급 250만원의 실수령액을 역산하면 250만원 근처로 복원"""
        employee = _create_employee()
        shifts = _create_monthly_shifts()

        # 정방향: 250만원 → 실수령액
        fwd = SalaryCalculator()
        fwd_result = fwd.calculate(
            employee=employee, base_salary=Money(2500000),
            allowances=[], work_shifts=shifts,
            wage_type="MONTHLY", calculation_month="2026-01",
        )
        target_net = fwd_result.net_pay.to_int()

        # 역산: 실수령액 → 기본급
        rev = ReverseSalaryCalculator()
        rev_result = rev.calculate(
            target_net_pay=Money(target_net),
            employee=employee, allowances=[],
            work_shifts=shifts, wage_type="MONTHLY",
            calculation_month="2026-01",
        )

        # 실수령액 오차 ±1,000원 이내
        assert rev_result.difference.to_int() <= 1000

    def test_reverse_with_allowances(self):
        """수당 포함 역산"""
        employee = _create_employee()
        shifts = _create_monthly_shifts()
        allowances = [
            Allowance.create_position_allowance(Money(300000)),
        ]

        fwd = SalaryCalculator()
        fwd_result = fwd.calculate(
            employee=employee, base_salary=Money(3000000),
            allowances=allowances, work_shifts=shifts,
            wage_type="MONTHLY", calculation_month="2026-01",
        )

        rev = ReverseSalaryCalculator()
        rev_result = rev.calculate(
            target_net_pay=fwd_result.net_pay,
            employee=employee, allowances=allowances,
            work_shifts=shifts, wage_type="MONTHLY",
            calculation_month="2026-01",
        )

        assert rev_result.difference.to_int() <= 1000

    def test_reverse_low_salary(self):
        """저임금 역산 (200만원)"""
        employee = _create_employee(dependents_count=1, children_under_20=0)
        shifts = _create_monthly_shifts()

        fwd = SalaryCalculator()
        fwd_result = fwd.calculate(
            employee=employee, base_salary=Money(2000000),
            allowances=[], work_shifts=shifts,
            wage_type="MONTHLY", calculation_month="2026-01",
        )

        rev = ReverseSalaryCalculator()
        rev_result = rev.calculate(
            target_net_pay=fwd_result.net_pay,
            employee=employee, allowances=[],
            work_shifts=shifts, wage_type="MONTHLY",
            calculation_month="2026-01",
        )

        assert rev_result.difference.to_int() <= 1000

    def test_reverse_high_salary(self):
        """고임금 역산 (600만원 - 국민연금 상한 초과)"""
        employee = _create_employee()
        shifts = _create_monthly_shifts()

        fwd = SalaryCalculator()
        fwd_result = fwd.calculate(
            employee=employee, base_salary=Money(6000000),
            allowances=[], work_shifts=shifts,
            wage_type="MONTHLY", calculation_month="2026-01",
        )

        rev = ReverseSalaryCalculator()
        rev_result = rev.calculate(
            target_net_pay=fwd_result.net_pay,
            employee=employee, allowances=[],
            work_shifts=shifts, wage_type="MONTHLY",
            calculation_month="2026-01",
        )

        assert rev_result.difference.to_int() <= 1000


class TestReverseSalaryEdgeCases:
    """엣지 케이스 테스트"""

    def test_zero_target_raises(self):
        """목표 0원 → ValueError"""
        rev = ReverseSalaryCalculator()
        with pytest.raises(ValueError, match="0보다 커야"):
            rev.calculate(
                target_net_pay=Money(0),
                employee=_create_employee(),
                allowances=[], work_shifts=[],
            )

    def test_negative_target_raises(self):
        """음수 목표 → ValueError"""
        rev = ReverseSalaryCalculator()
        with pytest.raises(ValueError, match="0보다 커야"):
            rev.calculate(
                target_net_pay=Money(-100000),
                employee=_create_employee(),
                allowances=[], work_shifts=[],
            )

    def test_iterations_reasonable(self):
        """탐색 횟수가 합리적 범위 내"""
        employee = _create_employee()
        shifts = _create_monthly_shifts()

        rev = ReverseSalaryCalculator()
        rev_result = rev.calculate(
            target_net_pay=Money(2500000),
            employee=employee, allowances=[],
            work_shifts=shifts, wage_type="MONTHLY",
            calculation_month="2026-01",
        )

        assert rev_result.iterations <= 50
        assert rev_result.iterations > 0

    def test_result_contains_full_breakdown(self):
        """결과에 전체 계산 내역 포함"""
        employee = _create_employee()
        shifts = _create_monthly_shifts()

        rev = ReverseSalaryCalculator()
        rev_result = rev.calculate(
            target_net_pay=Money(2500000),
            employee=employee, allowances=[],
            work_shifts=shifts, wage_type="MONTHLY",
            calculation_month="2026-01",
        )

        calc = rev_result.calculation_result
        assert calc.total_gross.to_int() > 0
        assert calc.insurance_result.total().to_int() > 0
        assert calc.tax_result.total().to_int() >= 0
        assert calc.net_pay.to_int() > 0


class TestReverseSalaryMonotonicity:
    """단조성 검증: 목표 실수령액 증가 → 필요 기본급 증가"""

    def test_monotonic_increase(self):
        """실수령액이 증가하면 필요 기본급도 증가"""
        employee = _create_employee()
        shifts = _create_monthly_shifts()
        rev = ReverseSalaryCalculator()

        targets = [2000000, 2500000, 3000000, 3500000]
        results = []
        for target in targets:
            result = rev.calculate(
                target_net_pay=Money(target),
                employee=employee, allowances=[],
                work_shifts=shifts, wage_type="MONTHLY",
                calculation_month="2026-01",
            )
            results.append(result.required_base_salary.to_int())

        # 단조 증가 확인
        for i in range(1, len(results)):
            assert results[i] > results[i - 1]
