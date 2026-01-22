"""Overtime Calculator 테스트"""
import pytest
from datetime import date, time
from app.domain.services.overtime_calculator import OvertimeCalculator
from app.domain.entities.work_shift import WorkShift
from app.domain.entities.employee import CompanySize
from app.domain.value_objects.money import Money
from app.domain.value_objects.working_hours import WorkingHours


class TestOvertimeCalculation:
    """연장근로 계산 테스트"""

    def test_no_overtime(self):
        """연장근로 없음 (주 40시간 이하)"""
        shifts = [
            WorkShift(date(2026, 1, 5), time(9, 0), time(18, 0), 60),  # 월 8h
            WorkShift(date(2026, 1, 6), time(9, 0), time(18, 0), 60),  # 화 8h
            WorkShift(date(2026, 1, 7), time(9, 0), time(18, 0), 60),  # 수 8h
            WorkShift(date(2026, 1, 8), time(9, 0), time(18, 0), 60),  # 목 8h
            WorkShift(date(2026, 1, 9), time(9, 0), time(18, 0), 60),  # 금 8h
        ]
        calculator = OvertimeCalculator()
        result = calculator.calculate(shifts, Money(10000), CompanySize.OVER_5)

        assert result.overtime_hours.is_zero()
        assert result.overtime_pay.is_zero()

    def test_overtime_weekly(self):
        """주 단위 연장근로 (주 50시간 = 10시간 연장)"""
        shifts = [
            WorkShift(date(2026, 1, 5), time(9, 0), time(20, 0), 60),  # 월 10h
            WorkShift(date(2026, 1, 6), time(9, 0), time(20, 0), 60),  # 화 10h
            WorkShift(date(2026, 1, 7), time(9, 0), time(20, 0), 60),  # 수 10h
            WorkShift(date(2026, 1, 8), time(9, 0), time(20, 0), 60),  # 목 10h
            WorkShift(date(2026, 1, 9), time(9, 0), time(20, 0), 60),  # 금 10h
        ]
        calculator = OvertimeCalculator()
        result = calculator.calculate(shifts, Money(10000), CompanySize.OVER_5)

        # 50 - 40 = 10시간 연장
        assert result.overtime_hours.hours == 10
        # 10,000 × 10 × 1.5 = 150,000
        assert result.overtime_pay.to_int() == 150000


class TestNightWorkCalculation:
    """야간근로 계산 테스트"""

    def test_no_night_work(self):
        """야간근로 없음"""
        shifts = [
            WorkShift(date(2026, 1, 6), time(9, 0), time(18, 0), 60),
        ]
        calculator = OvertimeCalculator()
        result = calculator.calculate(shifts, Money(10000), CompanySize.OVER_5)

        assert result.night_hours.is_zero()
        assert result.night_pay.is_zero()

    def test_partial_night_work(self):
        """부분 야간근로 (22시~23시)"""
        shifts = [
            WorkShift(date(2026, 1, 6), time(18, 0), time(23, 0), 0),
        ]
        calculator = OvertimeCalculator()
        result = calculator.calculate(shifts, Money(10000), CompanySize.OVER_5)

        # 야간 1시간 (22:00~23:00)
        assert result.night_hours.hours == 1
        # 10,000 × 1 × 0.5 = 5,000
        assert result.night_pay.to_int() == 5000

    def test_full_night_work(self):
        """전체 야간근로 (22시~익일 7시)"""
        shifts = [
            WorkShift(date(2026, 1, 6), time(22, 0), time(7, 0), 60),
        ]
        calculator = OvertimeCalculator()
        result = calculator.calculate(shifts, Money(10000), CompanySize.OVER_5)

        # 야간 8시간 (22:00~06:00, 휴게 제외 전)
        assert result.night_hours.hours == 8
        # 10,000 × 8 × 0.5 = 40,000
        assert result.night_pay.to_int() == 40000


class TestHolidayWorkCalculation:
    """휴일근로 계산 테스트"""

    def test_no_holiday_work(self):
        """휴일근로 없음"""
        shifts = [
            WorkShift(date(2026, 1, 6), time(9, 0), time(18, 0), 60, is_holiday_work=False),
        ]
        calculator = OvertimeCalculator()
        result = calculator.calculate(shifts, Money(10000), CompanySize.OVER_5)

        assert result.holiday_hours.is_zero()
        assert result.holiday_pay.is_zero()

    def test_holiday_work_8_hours_or_less(self):
        """휴일근로 8시간 이하"""
        shifts = [
            WorkShift(date(2026, 1, 4), time(9, 0), time(18, 0), 60, is_holiday_work=True),  # 일요일
        ]
        calculator = OvertimeCalculator()
        result = calculator.calculate(shifts, Money(10000), CompanySize.OVER_5)

        # 휴일 8시간
        assert result.holiday_hours.hours == 8
        # 10,000 × 8 × 1.5 = 120,000
        assert result.holiday_pay.to_int() == 120000

    def test_holiday_work_over_8_hours_large_company(self):
        """휴일근로 8시간 초과 (5인 이상)"""
        shifts = [
            WorkShift(date(2026, 1, 4), time(9, 0), time(20, 0), 60, is_holiday_work=True),  # 10시간
        ]
        calculator = OvertimeCalculator()
        result = calculator.calculate(shifts, Money(10000), CompanySize.OVER_5)

        # 휴일 10시간
        assert result.holiday_hours.hours == 10
        # 8시간: 10,000 × 8 × 1.5 = 120,000
        # 2시간: 10,000 × 2 × 2.0 = 40,000
        # 합계: 160,000
        assert result.holiday_pay.to_int() == 160000

    def test_holiday_work_over_8_hours_small_company(self):
        """휴일근로 8시간 초과 (5인 미만, 가산율 동일)"""
        shifts = [
            WorkShift(date(2026, 1, 4), time(9, 0), time(20, 0), 60, is_holiday_work=True),  # 10시간
        ]
        calculator = OvertimeCalculator()
        result = calculator.calculate(shifts, Money(10000), CompanySize.UNDER_5)

        # 휴일 10시간
        assert result.holiday_hours.hours == 10
        # 10,000 × 10 × 1.5 = 150,000 (8시간 초과도 1.5배)
        assert result.holiday_pay.to_int() == 150000


class TestCombinedCalculation:
    """복합 가산수당 계산 테스트"""

    def test_overtime_and_night_combined(self):
        """연장 + 야간 복합"""
        shifts = [
            WorkShift(date(2026, 1, 5), time(9, 0), time(23, 0), 60),  # 월 13시간 (야간 1시간)
            WorkShift(date(2026, 1, 6), time(9, 0), time(23, 0), 60),  # 화 13시간 (야간 1시간)
            WorkShift(date(2026, 1, 7), time(9, 0), time(23, 0), 60),  # 수 13시간 (야간 1시간)
        ]
        calculator = OvertimeCalculator()
        result = calculator.calculate(shifts, Money(10000), CompanySize.OVER_5)

        # 연장: 일 8시간 초과분 5시간 × 3일 = 15시간
        assert result.overtime_hours.hours == 15
        assert result.overtime_pay.to_int() == 225000  # 10,000 × 15 × 1.5

        # 야간: 3시간 (각 1시간씩)
        assert result.night_hours.hours == 3
        assert result.night_pay.to_int() == 15000  # 10,000 × 3 × 0.5

    def test_all_types_combined(self):
        """연장 + 야간 + 휴일 복합"""
        shifts = [
            WorkShift(date(2026, 1, 5), time(9, 0), time(20, 0), 60),  # 월 10h
            WorkShift(date(2026, 1, 6), time(9, 0), time(20, 0), 60),  # 화 10h
            WorkShift(date(2026, 1, 7), time(9, 0), time(20, 0), 60),  # 수 10h
            WorkShift(date(2026, 1, 8), time(9, 0), time(20, 0), 60),  # 목 10h
            WorkShift(date(2026, 1, 9), time(9, 0), time(20, 0), 60),  # 금 10h
            WorkShift(date(2026, 1, 11), time(22, 0), time(6, 0), 0, is_holiday_work=True),  # 일 8h 야간
        ]
        calculator = OvertimeCalculator()
        result = calculator.calculate(shifts, Money(10000), CompanySize.OVER_5)

        # 연장: 50 - 40 = 10시간
        assert result.overtime_hours.hours == 10

        # 야간: 8시간 (일요일 야간근무)
        assert result.night_hours.hours == 8

        # 휴일: 8시간
        assert result.holiday_hours.hours == 8

        # 총합 확인
        total = result.total().to_int()
        assert total > 0


class TestScheduledWorkDaysOvertime:
    """소정근로일 기반 연장근로 계산 테스트"""

    def test_4day_contract_5day_work(self):
        """소정근로 4일 계약인데 5일 근무 → 1일 연장근로"""
        shifts = [
            WorkShift(date(2026, 1, 5), time(9, 0), time(18, 0), 60),  # 월 8h
            WorkShift(date(2026, 1, 6), time(9, 0), time(18, 0), 60),  # 화 8h
            WorkShift(date(2026, 1, 7), time(9, 0), time(18, 0), 60),  # 수 8h
            WorkShift(date(2026, 1, 8), time(9, 0), time(18, 0), 60),  # 목 8h
            WorkShift(date(2026, 1, 9), time(9, 0), time(18, 0), 60),  # 금 8h (초과)
        ]
        calculator = OvertimeCalculator()
        # 소정근로일 4일로 설정
        result = calculator.calculate(shifts, Money(10000), CompanySize.OVER_5, scheduled_work_days=4)

        # 5번째 날 8시간 전체가 연장근로
        assert result.overtime_hours.hours == 8
        # 10,000 × 8 × 1.5 = 120,000
        assert result.overtime_pay.to_int() == 120000

    def test_4day_contract_4day_work(self):
        """소정근로 4일 계약, 4일 근무 → 연장근로 없음"""
        shifts = [
            WorkShift(date(2026, 1, 5), time(9, 0), time(18, 0), 60),  # 월 8h
            WorkShift(date(2026, 1, 6), time(9, 0), time(18, 0), 60),  # 화 8h
            WorkShift(date(2026, 1, 7), time(9, 0), time(18, 0), 60),  # 수 8h
            WorkShift(date(2026, 1, 8), time(9, 0), time(18, 0), 60),  # 목 8h
        ]
        calculator = OvertimeCalculator()
        result = calculator.calculate(shifts, Money(10000), CompanySize.OVER_5, scheduled_work_days=4)

        # 연장근로 없음
        assert result.overtime_hours.is_zero()
        assert result.overtime_pay.is_zero()

    def test_5day_contract_6day_work(self):
        """소정근로 5일 계약, 6일 근무 → 1일 연장근로"""
        shifts = [
            WorkShift(date(2026, 1, 5), time(9, 0), time(18, 0), 60),  # 월 8h
            WorkShift(date(2026, 1, 6), time(9, 0), time(18, 0), 60),  # 화 8h
            WorkShift(date(2026, 1, 7), time(9, 0), time(18, 0), 60),  # 수 8h
            WorkShift(date(2026, 1, 8), time(9, 0), time(18, 0), 60),  # 목 8h
            WorkShift(date(2026, 1, 9), time(9, 0), time(18, 0), 60),  # 금 8h
            WorkShift(date(2026, 1, 10), time(9, 0), time(18, 0), 60), # 토 8h (초과)
        ]
        calculator = OvertimeCalculator()
        result = calculator.calculate(shifts, Money(10000), CompanySize.OVER_5, scheduled_work_days=5)

        # 6번째 날 8시간 전체가 연장근로
        assert result.overtime_hours.hours == 8
        # 10,000 × 8 × 1.5 = 120,000
        assert result.overtime_pay.to_int() == 120000

    def test_4day_contract_daily_overtime(self):
        """소정근로 4일 계약, 일 10시간 근무 → 일별 초과분 연장"""
        shifts = [
            WorkShift(date(2026, 1, 5), time(9, 0), time(20, 0), 60),  # 월 10h
            WorkShift(date(2026, 1, 6), time(9, 0), time(20, 0), 60),  # 화 10h
            WorkShift(date(2026, 1, 7), time(9, 0), time(20, 0), 60),  # 수 10h
            WorkShift(date(2026, 1, 8), time(9, 0), time(20, 0), 60),  # 목 10h
        ]
        calculator = OvertimeCalculator()
        result = calculator.calculate(shifts, Money(10000), CompanySize.OVER_5, scheduled_work_days=4)

        # 매일 2시간씩 × 4일 = 8시간 연장
        assert result.overtime_hours.hours == 8
        assert result.overtime_pay.to_int() == 120000


class TestOvertimeResultMethods:
    """OvertimeResult 메서드 테스트"""

    def test_to_dict(self):
        """딕셔너리 변환"""
        shifts = [
            WorkShift(date(2026, 1, 5), time(9, 0), time(20, 0), 60),
            WorkShift(date(2026, 1, 6), time(9, 0), time(20, 0), 60),
            WorkShift(date(2026, 1, 7), time(9, 0), time(20, 0), 60),
            WorkShift(date(2026, 1, 8), time(9, 0), time(20, 0), 60),
            WorkShift(date(2026, 1, 9), time(9, 0), time(20, 0), 60),
        ]
        calculator = OvertimeCalculator()
        result = calculator.calculate(shifts, Money(10000), CompanySize.OVER_5)

        result_dict = result.to_dict()
        assert "overtime_pay" in result_dict
        assert "total" in result_dict
        assert result_dict["total"] == result.total().to_int()
