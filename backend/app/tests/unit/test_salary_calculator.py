"""Salary Calculator 종합 테스트
CLAUDE.md에 명시된 7가지 테스트 시나리오 포함
"""
import pytest
from datetime import date, time
from decimal import Decimal
from app.domain.services.salary_calculator import SalaryCalculator
from app.domain.entities.employee import Employee, EmploymentType, CompanySize
from app.domain.entities.work_shift import WorkShift
from app.domain.entities.allowance import Allowance
from app.domain.value_objects.money import Money


class TestScenario1FullTime5Days:
    """시나리오 1: 풀타임 주5일 근무 (기본 케이스)"""

    def test_full_time_basic(self):
        """기본급 250만원, 주5일 근무"""
        employee = Employee(
            name="홍길동",
            dependents_count=2,
            children_under_20=1,
            employment_type=EmploymentType.FULL_TIME,
            company_size=CompanySize.OVER_5
        )

        base_salary = Money(2500000)
        allowances = [
            Allowance.create_position_allowance(Money(300000)),  # 직책수당
            Allowance.create_meal_allowance(Money(200000)),      # 식대 (비과세)
        ]

        # 1월 주5일 근무 (공휴일 제외 평일 전체)
        shifts = []
        for day in range(1, 32):
            d = date(2026, 1, day)
            if d.weekday() < 5 and d != date(2026, 1, 1):  # 월~금, 신정 제외
                shifts.append(WorkShift(d, time(9, 0), time(18, 0), 60))

        calculator = SalaryCalculator()
        result = calculator.calculate(employee, base_salary, allowances, shifts)

        # 검증
        # 통상임금 = 250만 + 30만 = 280만 (식대 제외)
        assert result.regular_wage.to_int() == 2800000

        # 통상시급 = 280만 ÷ 174 = 16,092원
        assert result.hourly_wage.to_int() == 16092

        # 연장근로 없음 (주 40시간)
        assert result.overtime_result.overtime_hours.is_zero()

        # 주휴수당 = 16,092 × 8 × 4주(개근) = 514,944원
        # (1월 2일만 있는 부분 주는 15시간 미만으로 제외)
        expected_weekly = 16092 * 8 * 4
        assert abs(result.weekly_holiday_result.weekly_holiday_pay.to_int() - expected_weekly) <= 10

        # 총 지급액 = 기본급 + 수당 + 주휴수당
        total_gross = 2500000 + 300000 + 200000 + expected_weekly
        assert abs(result.total_gross.to_int() - total_gross) <= 10

        # 실수령액 > 0
        assert result.net_pay.is_positive()


class TestScenario2FullTime6Days:
    """시나리오 2: 주6일 근무 (주휴수당 정상)"""

    def test_full_time_6_days(self):
        """기본급 250만원, 주6일 근무"""
        employee = Employee(
            name="김철수",
            dependents_count=1,
            children_under_20=0,
            employment_type=EmploymentType.FULL_TIME,
            company_size=CompanySize.OVER_5
        )

        base_salary = Money(2500000)
        allowances = []

        # 1월 주6일 근무 (월~토)
        shifts = []
        for day in range(5, 31):
            d = date(2026, 1, day)
            if d.weekday() < 6:  # 월~토
                shifts.append(WorkShift(d, time(9, 0), time(18, 0), 60))

        calculator = SalaryCalculator()
        result = calculator.calculate(employee, base_salary, allowances, shifts)

        # 통상시급 = 250만 ÷ 174
        hourly_wage = int(2500000 / 174)

        # 연장근로 = 주 48시간 - 40시간 = 8시간/주
        # 실제 주 수에 따라 연장시간이 달라질 수 있음
        assert result.overtime_result.overtime_hours.hours > 0

        # 주휴수당은 정상 지급 (주 40시간 이상)
        assert not result.weekly_holiday_result.is_proportional


class TestScenario3PartTime:
    """시나리오 3: 단시간 근로 (주 24시간, 주휴수당 비례)"""

    def test_part_time_24_hours(self):
        """파트타임, 주 24시간 근무"""
        employee = Employee(
            name="이영희",
            dependents_count=0,
            children_under_20=0,
            employment_type=EmploymentType.PART_TIME,
            company_size=CompanySize.UNDER_5
        )

        base_salary = Money(1500000)
        allowances = []

        # 주 3일, 하루 8시간
        shifts = []
        for week in range(4):
            base_day = 5 + (week * 7)
            for offset in [0, 2, 4]:  # 월, 수, 금
                d = date(2026, 1, base_day + offset)
                if d.month == 1:
                    shifts.append(WorkShift(d, time(9, 0), time(18, 0), 60))

        calculator = SalaryCalculator()
        result = calculator.calculate(employee, base_salary, allowances, shifts)

        # 주휴수당 비례 지급 확인 (주 40시간 미만)
        assert result.weekly_holiday_result.is_proportional

        # 연장근로 없음 (주 40시간 미만)
        assert result.overtime_result.overtime_hours.is_zero()


class TestScenario4NightWork:
    """시나리오 4: 야간근로 포함 (22:00~06:00 자동 분리)"""

    def test_night_work_included(self):
        """야간근로가 포함된 시프트"""
        employee = Employee(
            name="박야근",
            dependents_count=1,
            children_under_20=0,
            employment_type=EmploymentType.FULL_TIME,
            company_size=CompanySize.OVER_5
        )

        base_salary = Money(2500000)
        allowances = []

        # 평일 + 야간근무 포함
        shifts = [
            # 평일 4일
            WorkShift(date(2026, 1, 5), time(9, 0), time(18, 0), 60),
            WorkShift(date(2026, 1, 6), time(9, 0), time(18, 0), 60),
            WorkShift(date(2026, 1, 7), time(9, 0), time(18, 0), 60),
            WorkShift(date(2026, 1, 8), time(9, 0), time(18, 0), 60),
            # 야간근무 (22:00~익일 07:00)
            WorkShift(date(2026, 1, 9), time(22, 0), time(7, 0), 60),
        ]

        calculator = SalaryCalculator()
        result = calculator.calculate(employee, base_salary, allowances, shifts)

        # 야간근로 수당 확인
        assert not result.overtime_result.night_hours.is_zero()
        assert result.overtime_result.night_pay.is_positive()

        # 야간근로시간 = 8시간 (22:00~06:00, 휴게 제외 전)
        assert result.overtime_result.night_hours.hours == 8


class TestScenario5HolidayWork:
    """시나리오 5: 휴일근로 (일요일 근무)"""

    def test_holiday_work(self):
        """휴일근로 포함"""
        employee = Employee(
            name="최주말",
            dependents_count=0,
            children_under_20=0,
            employment_type=EmploymentType.FULL_TIME,
            company_size=CompanySize.OVER_5
        )

        base_salary = Money(2500000)
        allowances = []

        # 평일 + 일요일 근무
        shifts = [
            WorkShift(date(2026, 1, 5), time(9, 0), time(18, 0), 60),   # 월
            WorkShift(date(2026, 1, 6), time(9, 0), time(18, 0), 60),   # 화
            WorkShift(date(2026, 1, 7), time(9, 0), time(18, 0), 60),   # 수
            WorkShift(date(2026, 1, 8), time(9, 0), time(18, 0), 60),   # 목
            WorkShift(date(2026, 1, 9), time(9, 0), time(18, 0), 60),   # 금
            WorkShift(date(2026, 1, 11), time(9, 0), time(18, 0), 60, is_holiday_work=True),  # 일
        ]

        calculator = SalaryCalculator()
        result = calculator.calculate(employee, base_salary, allowances, shifts)

        # 휴일근로 수당 확인
        assert not result.overtime_result.holiday_hours.is_zero()
        assert result.overtime_result.holiday_pay.is_positive()

        # 휴일근로 8시간
        assert result.overtime_result.holiday_hours.hours == 8


class TestScenario6SmallCompany:
    """시나리오 6: 5인 미만 사업장 (휴일근로 8시간 초과 시 가산율 차이)"""

    def test_small_company_holiday_overtime(self):
        """5인 미만 사업장, 휴일 10시간 근무"""
        employee = Employee(
            name="소규모",
            dependents_count=0,
            children_under_20=0,
            employment_type=EmploymentType.FULL_TIME,
            company_size=CompanySize.UNDER_5  # 5인 미만
        )

        base_salary = Money(2500000)
        allowances = []

        shifts = [
            WorkShift(date(2026, 1, 5), time(9, 0), time(18, 0), 60),
            WorkShift(date(2026, 1, 6), time(9, 0), time(18, 0), 60),
            WorkShift(date(2026, 1, 7), time(9, 0), time(18, 0), 60),
            WorkShift(date(2026, 1, 8), time(9, 0), time(18, 0), 60),
            WorkShift(date(2026, 1, 11), time(9, 0), time(20, 0), 60, is_holiday_work=True),  # 일 10시간
        ]

        calculator = SalaryCalculator()
        result = calculator.calculate(employee, base_salary, allowances, shifts)

        # 5인 미만: 10시간 × 1.5배 (8시간 초과도 동일)
        hourly_wage = result.hourly_wage.to_int()
        expected_holiday_pay = hourly_wage * 10 * 1.5
        actual_holiday_pay = result.overtime_result.holiday_pay.to_int()

        # 반올림 오차 허용
        assert abs(actual_holiday_pay - expected_holiday_pay) <= 10

    def test_large_company_holiday_overtime(self):
        """5인 이상 사업장, 휴일 10시간 근무 (비교)"""
        employee = Employee(
            name="대규모",
            dependents_count=0,
            children_under_20=0,
            employment_type=EmploymentType.FULL_TIME,
            company_size=CompanySize.OVER_5  # 5인 이상
        )

        base_salary = Money(2500000)
        allowances = []

        shifts = [
            WorkShift(date(2026, 1, 5), time(9, 0), time(18, 0), 60),
            WorkShift(date(2026, 1, 6), time(9, 0), time(18, 0), 60),
            WorkShift(date(2026, 1, 7), time(9, 0), time(18, 0), 60),
            WorkShift(date(2026, 1, 8), time(9, 0), time(18, 0), 60),
            WorkShift(date(2026, 1, 11), time(9, 0), time(20, 0), 60, is_holiday_work=True),  # 일 10시간
        ]

        calculator = SalaryCalculator()
        result = calculator.calculate(employee, base_salary, allowances, shifts)

        # 5인 이상: 8시간(1.5배) + 2시간(2.0배)
        hourly_wage = result.hourly_wage.to_int()
        expected_holiday_pay = hourly_wage * 8 * 1.5 + hourly_wage * 2 * 2.0
        actual_holiday_pay = result.overtime_result.holiday_pay.to_int()

        # 반올림 오차 허용
        assert abs(actual_holiday_pay - expected_holiday_pay) <= 10


class TestScenario7MinimumWage:
    """시나리오 7: 최저임금 관련 케이스"""

    def test_minimum_wage_check(self):
        """2026년 최저임금 10,320원 기준 확인"""
        # 2026년 최저임금: 시급 10,320원
        # 월 209시간 기준: 2,156,880원

        employee = Employee(
            name="최저임금",
            dependents_count=0,
            children_under_20=0,
            employment_type=EmploymentType.FULL_TIME,
            company_size=CompanySize.UNDER_5
        )

        # 최저임금 수준 기본급
        base_salary = Money(2156880)
        allowances = []

        shifts = []
        for day in range(5, 31):
            d = date(2026, 1, day)
            if d.weekday() < 5:
                shifts.append(WorkShift(d, time(9, 0), time(18, 0), 60))

        calculator = SalaryCalculator()
        result = calculator.calculate(employee, base_salary, allowances, shifts)

        # 통상시급이 최저임금 이상인지 확인
        # 2,156,880 ÷ 174 = 12,396원 (> 10,320원)
        assert result.hourly_wage.to_int() >= 10320


class TestSalaryCalculatorEdgeCases:
    """예외 케이스 테스트"""

    def test_no_shifts(self):
        """근무 시프트 없음"""
        employee = Employee(
            name="무근무",
            dependents_count=0,
            children_under_20=0,
            employment_type=EmploymentType.FULL_TIME,
            company_size=CompanySize.OVER_5
        )

        base_salary = Money(2500000)
        allowances = []
        shifts = []

        calculator = SalaryCalculator()
        result = calculator.calculate(employee, base_salary, allowances, shifts)

        # 가산수당 없음
        assert result.overtime_result.total().is_zero()

        # 주휴수당 없음
        assert result.weekly_holiday_result.weekly_holiday_pay.is_zero()

        # 실수령액 = 기본급 - 보험료 - 세금
        assert result.net_pay.is_positive()

    def test_complex_allowances(self):
        """복잡한 수당 조합"""
        employee = Employee(
            name="복합수당",
            dependents_count=2,
            children_under_20=1,
            employment_type=EmploymentType.FULL_TIME,
            company_size=CompanySize.OVER_5
        )

        base_salary = Money(2000000)
        allowances = [
            Allowance.create_position_allowance(Money(500000)),  # 직책수당 (통상임금 포함)
            Allowance.create_meal_allowance(Money(200000)),      # 식대 (비과세, 통상임금 제외)
            Allowance(
                name="교통비",
                amount=Money(100000),
                is_taxable=False,  # 비과세
                is_includable_in_minimum_wage=True,
                is_fixed=True,
                is_included_in_regular_wage=False  # 통상임금 제외
            ),
        ]

        # 1월 전체 평일 (공휴일 제외)
        shifts = []
        for day in range(1, 32):
            d = date(2026, 1, day)
            if d.weekday() < 5 and d != date(2026, 1, 1):
                shifts.append(WorkShift(d, time(9, 0), time(18, 0), 60))

        calculator = SalaryCalculator()
        result = calculator.calculate(employee, base_salary, allowances, shifts)

        # 통상임금 = 기본급 + 직책수당 = 250만원
        assert result.regular_wage.to_int() == 2500000

        # 총 지급액 = 기본급 + 모든 수당 + 주휴수당
        total_allowances = sum(a.amount.to_int() for a in allowances)
        expected_gross = 2000000 + total_allowances + result.weekly_holiday_result.weekly_holiday_pay.to_int()
        assert abs(result.total_gross.to_int() - expected_gross) <= 10


class TestHourlyWageCalculation:
    """통상시급 계산 정확성 테스트"""

    def test_174_hours_basis_validation(self):
        """174시간 기준 검증 (209시간과 비교)"""
        employee = Employee(
            name="시급검증",
            dependents_count=0,
            children_under_20=0,
            employment_type=EmploymentType.FULL_TIME,
            company_size=CompanySize.OVER_5
        )

        base_salary = Money(2800000)
        calculator = SalaryCalculator()
        result = calculator.calculate(employee, base_salary, [], [])

        # 174시간 기준: 2,800,000 ÷ 174 = 16,092원
        expected_174 = 16092
        assert result.hourly_wage.to_int() == expected_174

        # 만약 209시간 사용 시: 2,800,000 ÷ 209 = 13,397원
        wrong_209 = int(2800000 / 209)
        assert result.hourly_wage.to_int() > wrong_209  # 16,092 > 13,397

        # 차이: 약 2,695원 (17.6%)
        difference = expected_174 - wrong_209
        assert difference == 2695

    def test_weekly_holiday_separate_no_double_counting(self):
        """주휴수당 별도 계산 검증 (이중 계산 방지)"""
        employee = Employee(
            name="주휴검증",
            dependents_count=0,
            children_under_20=0,
            employment_type=EmploymentType.FULL_TIME,
            company_size=CompanySize.OVER_5
        )

        base_salary = Money(2800000)

        # 1월 전체 평일 (공휴일 제외)
        shifts = []
        for day in range(1, 32):
            d = date(2026, 1, day)
            if d.weekday() < 5 and d != date(2026, 1, 1):
                shifts.append(WorkShift(d, time(9, 0), time(18, 0), 60))

        calculator = SalaryCalculator()
        result = calculator.calculate(employee, base_salary, [], shifts)

        # 통상시급 = 2,800,000 ÷ 174 = 16,092원
        assert result.hourly_wage.to_int() == 16092

        # 주휴수당 = 16,092 × 8 × 4주(개근) = 514,944원
        expected_weekly = 16092 * 8 * 4
        assert abs(result.weekly_holiday_result.weekly_holiday_pay.to_int() - expected_weekly) <= 10

        # 총 지급액 = 기본급 + 주휴수당 (이중 계산 아님)
        expected_total = 2800000 + expected_weekly
        assert abs(result.total_gross.to_int() - expected_total) <= 10
