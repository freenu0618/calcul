"""Weekly Holiday Pay Calculator 테스트"""
import pytest
from datetime import date, time
from decimal import Decimal
from app.domain.services.weekly_holiday_pay_calculator import WeeklyHolidayPayCalculator
from app.domain.entities.work_shift import WorkShift
from app.domain.value_objects.money import Money
from app.domain.value_objects.working_hours import WorkingHours


class TestWeeklyHolidayPayFullTime:
    """정규직 주휴수당 계산 테스트 (주 40시간)"""

    def test_full_time_5_days(self):
        """주 5일 근무 (주 40시간 - 전액 지급)"""
        # 1월 5일(월) ~ 1월 30일(금): 4주 = 20일
        shifts = []
        for day in range(5, 31):
            d = date(2026, 1, day)
            if d.weekday() < 5:  # 월~금
                shifts.append(WorkShift(d, time(9, 0), time(18, 0), 60))

        calculator = WeeklyHolidayPayCalculator()
        result = calculator.calculate(shifts, Money(10000))

        # 주 40시간 이상: 8시간 × 통상시급
        # 월 주휴수당 = 10,000 × 8 × 4.345주 = 347,600
        assert not result.is_proportional
        assert result.weekly_holiday_pay.to_int() == 347600

    def test_full_time_6_days(self):
        """주 6일 근무 (주 48시간 - 전액 지급)"""
        shifts = []
        for day in range(5, 31):
            d = date(2026, 1, day)
            if d.weekday() < 6:  # 월~토
                shifts.append(WorkShift(d, time(9, 0), time(18, 0), 60))

        calculator = WeeklyHolidayPayCalculator()
        result = calculator.calculate(shifts, Money(10000))

        # 주 48시간 (40시간 초과): 8시간 × 통상시급
        assert not result.is_proportional
        assert result.weekly_holiday_pay.to_int() == 347600


class TestWeeklyHolidayPayPartTime:
    """단시간 근로 주휴수당 계산 테스트 (비례 지급)"""

    def test_part_time_24_hours(self):
        """주 24시간 근무 (비례 지급) - 주 3일 계약, 3일 개근"""
        # 주 3일, 하루 8시간 (소정근로일 3일)
        shifts = []
        for week in range(4):
            base_day = 5 + (week * 7)
            # 월, 수, 금
            for offset in [0, 2, 4]:
                d = date(2026, 1, base_day + offset)
                if d.month == 1:
                    shifts.append(WorkShift(d, time(9, 0), time(18, 0), 60))

        calculator = WeeklyHolidayPayCalculator()
        # scheduled_work_days=3: 주 3일 계약
        result = calculator.calculate(shifts, Money(10000), scheduled_work_days=3)

        # 주 평균 근로시간은 총 일수를 기준으로 계산됨
        # 주휴수당이 비례 지급되는지 확인
        assert result.is_proportional
        # 주휴수당이 양수인지 확인
        assert result.weekly_holiday_pay.is_positive()

    def test_part_time_20_hours(self):
        """주 20시간 근무 (비례 지급)"""
        # 주 5일, 하루 4시간 (9시~14시, 휴게 1시간 = 4시간 근무)
        shifts = []
        for day in range(5, 31):
            d = date(2026, 1, day)
            if d.weekday() < 5:  # 월~금
                shifts.append(WorkShift(d, time(9, 0), time(14, 0), 60))  # 4시간

        calculator = WeeklyHolidayPayCalculator()
        result = calculator.calculate(shifts, Money(10000))

        # 주 평균 근로시간은 실제 일수 기준으로 계산됨
        # 비례 지급 확인
        assert result.is_proportional
        # 주휴수당이 양수인지 확인
        assert result.weekly_holiday_pay.is_positive()


class TestWeeklyHolidayPayMinimum:
    """최소 근로시간 테스트 (주 15시간 미만)"""

    def test_below_minimum_hours(self):
        """주 15시간 미만 (주휴수당 없음)"""
        # 주 2일, 하루 5시간
        shifts = []
        for week in range(4):
            base_day = 5 + (week * 7)
            for offset in [0, 2]:  # 월, 수
                d = date(2026, 1, base_day + offset)
                if d.month == 1:
                    shifts.append(WorkShift(d, time(9, 0), time(14, 0), 0))  # 5시간

        calculator = WeeklyHolidayPayCalculator()
        result = calculator.calculate(shifts, Money(10000))

        # 주 평균 근로시간이 15시간 미만이면 주휴수당 없음
        assert result.weekly_hours.to_decimal_hours() < Decimal('15')
        assert result.weekly_holiday_pay.is_zero()

    def test_exactly_minimum_hours(self):
        """정확히 주 15시간 (주휴수당 지급) - 주 3일 계약, 3일 개근"""
        # 주 15시간 (주 3일, 하루 5시간)
        shifts = []
        for week in range(4):
            base_day = 5 + (week * 7)
            for offset in [0, 2, 4]:  # 월, 수, 금
                d = date(2026, 1, base_day + offset)
                if d.month == 1:
                    shifts.append(WorkShift(d, time(9, 0), time(14, 0), 0))  # 5시간

        calculator = WeeklyHolidayPayCalculator()
        # scheduled_work_days=3: 주 3일 계약
        result = calculator.calculate(shifts, Money(10000), scheduled_work_days=3)

        # 주 15시간: (15 ÷ 40) × 8 = 3시간
        assert not result.weekly_holiday_pay.is_zero()
        assert result.is_proportional


class TestWeeklyHolidayPayAttendance:
    """개근 조건 테스트"""

    def test_not_full_attendance(self):
        """주 5일 계약인데 4일만 근무 → 주휴수당 없음"""
        # 주 4일 근무 (월~목)
        shifts = []
        for day in range(5, 31):
            d = date(2026, 1, day)
            if d.weekday() < 4:  # 월~목 (금요일 결근)
                shifts.append(WorkShift(d, time(9, 0), time(18, 0), 60))

        calculator = WeeklyHolidayPayCalculator()
        # scheduled_work_days=5: 주 5일 계약이지만 4일만 근무
        result = calculator.calculate(shifts, Money(10000), scheduled_work_days=5)

        # 개근 미달 → 주휴수당 0원
        assert result.weekly_holiday_pay.is_zero()

    def test_partial_week_not_full(self):
        """일부 주에서 결근 → 주휴수당 없음"""
        shifts = []
        # 1주차: 5일 근무 (개근)
        for day in [5, 6, 7, 8, 9]:
            shifts.append(WorkShift(date(2026, 1, day), time(9, 0), time(18, 0), 60))
        # 2주차: 4일 근무 (결근)
        for day in [12, 13, 14, 15]:  # 금요일 결근
            shifts.append(WorkShift(date(2026, 1, day), time(9, 0), time(18, 0), 60))
        # 3주차: 5일 근무 (개근)
        for day in [19, 20, 21, 22, 23]:
            shifts.append(WorkShift(date(2026, 1, day), time(9, 0), time(18, 0), 60))
        # 4주차: 5일 근무 (개근)
        for day in [26, 27, 28, 29, 30]:
            shifts.append(WorkShift(date(2026, 1, day), time(9, 0), time(18, 0), 60))

        calculator = WeeklyHolidayPayCalculator()
        result = calculator.calculate(shifts, Money(10000), scheduled_work_days=5)

        # 2주차 결근으로 전체 월 주휴수당 0원
        assert result.weekly_holiday_pay.is_zero()


class TestWeeklyHolidayPayEdgeCases:
    """예외 케이스 테스트"""

    def test_no_shifts(self):
        """근무 시프트 없음"""
        calculator = WeeklyHolidayPayCalculator()
        result = calculator.calculate([], Money(10000))

        assert result.weekly_holiday_pay.is_zero()
        assert result.weekly_hours.is_zero()

    def test_exclude_holiday_work(self):
        """휴일근로 제외"""
        shifts = [
            WorkShift(date(2026, 1, 5), time(9, 0), time(18, 0), 60, is_holiday_work=False),
            WorkShift(date(2026, 1, 6), time(9, 0), time(18, 0), 60, is_holiday_work=False),
            WorkShift(date(2026, 1, 7), time(9, 0), time(18, 0), 60, is_holiday_work=False),
            WorkShift(date(2026, 1, 8), time(9, 0), time(18, 0), 60, is_holiday_work=False),
            WorkShift(date(2026, 1, 9), time(9, 0), time(18, 0), 60, is_holiday_work=False),
            WorkShift(date(2026, 1, 11), time(9, 0), time(18, 0), 60, is_holiday_work=True),  # 일요일
        ]

        calculator = WeeklyHolidayPayCalculator()
        result = calculator.calculate(shifts, Money(10000))

        # 휴일근로는 주 평균 계산에서 제외됨
        # 주 평균이 40시간 이상이면 전액 지급
        assert result.weekly_hours.to_decimal_hours() >= Decimal('40')
        assert not result.is_proportional


class TestProportionalRateCalculation:
    """비례 지급률 계산 테스트"""

    def test_proportional_rate_24_hours(self):
        """주 24시간: 0.6 (60%)"""
        rate = WeeklyHolidayPayCalculator.calculate_proportional_rate(Decimal('24'))
        assert rate == Decimal('0.6')

    def test_proportional_rate_20_hours(self):
        """주 20시간: 0.5 (50%)"""
        rate = WeeklyHolidayPayCalculator.calculate_proportional_rate(Decimal('20'))
        assert rate == Decimal('0.5')

    def test_proportional_rate_40_hours_or_more(self):
        """주 40시간 이상: 1.0 (100%)"""
        rate = WeeklyHolidayPayCalculator.calculate_proportional_rate(Decimal('40'))
        assert rate == Decimal('1.0')

        rate = WeeklyHolidayPayCalculator.calculate_proportional_rate(Decimal('48'))
        assert rate == Decimal('1.0')

    def test_proportional_rate_below_minimum(self):
        """주 15시간 미만: 0.0"""
        rate = WeeklyHolidayPayCalculator.calculate_proportional_rate(Decimal('10'))
        assert rate == Decimal('0.0')


class TestWeeklyHolidayPayResultMethods:
    """WeeklyHolidayPayResult 메서드 테스트"""

    def test_to_dict_proportional(self):
        """딕셔너리 변환 (비례 지급)"""
        shifts = []
        for week in range(4):
            base_day = 5 + (week * 7)
            for offset in [0, 2, 4]:
                d = date(2026, 1, base_day + offset)
                if d.month == 1:
                    shifts.append(WorkShift(d, time(9, 0), time(18, 0), 60))

        calculator = WeeklyHolidayPayCalculator()
        result = calculator.calculate(shifts, Money(10000))

        result_dict = result.to_dict()
        assert "amount" in result_dict
        assert "calculation" in result_dict
        assert "is_proportional" in result_dict
        assert result_dict["is_proportional"] is True
        assert "note" in result_dict

    def test_to_dict_full_time(self):
        """딕셔너리 변환 (전액 지급)"""
        shifts = []
        for day in range(5, 31):
            d = date(2026, 1, day)
            if d.weekday() < 5:
                shifts.append(WorkShift(d, time(9, 0), time(18, 0), 60))

        calculator = WeeklyHolidayPayCalculator()
        result = calculator.calculate(shifts, Money(10000))

        result_dict = result.to_dict()
        assert result_dict["is_proportional"] is False
        assert "8시간" in result_dict["calculation"]
