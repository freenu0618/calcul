"""WorkShift Entity 테스트"""
import pytest
from datetime import date, time
from app.domain.entities.work_shift import WorkShift
from app.domain.value_objects.working_hours import WorkingHours


class TestWorkShiftCreation:
    """WorkShift 객체 생성 테스트"""

    def test_create_work_shift(self):
        """정상 생성"""
        shift = WorkShift(
            date=date(2026, 1, 6),
            start_time=time(9, 0),
            end_time=time(18, 0),
            break_minutes=60,
            is_holiday_work=False
        )
        assert shift.date == date(2026, 1, 6)
        assert shift.start_time == time(9, 0)
        assert shift.end_time == time(18, 0)
        assert shift.break_minutes == 60
        assert not shift.is_holiday_work
        assert shift.id is not None

    def test_negative_break_minutes(self):
        """음수 휴게시간 오류"""
        with pytest.raises(ValueError, match="Break minutes cannot be negative"):
            WorkShift(
                date=date(2026, 1, 6),
                start_time=time(9, 0),
                end_time=time(18, 0),
                break_minutes=-10
            )


class TestWorkingHoursCalculation:
    """근로시간 계산 테스트"""

    def test_calculate_working_hours_normal_day(self):
        """정상 근무일 계산 (9시간 - 1시간 휴게 = 8시간)"""
        shift = WorkShift(
            date=date(2026, 1, 6),
            start_time=time(9, 0),
            end_time=time(18, 0),
            break_minutes=60
        )
        working_hours = shift.calculate_working_hours()
        assert working_hours.hours == 8
        assert working_hours.minutes == 0

    def test_calculate_working_hours_with_partial_minutes(self):
        """부분 분 포함"""
        shift = WorkShift(
            date=date(2026, 1, 6),
            start_time=time(9, 0),
            end_time=time(17, 45),
            break_minutes=60
        )
        working_hours = shift.calculate_working_hours()
        assert working_hours.hours == 7
        assert working_hours.minutes == 45

    def test_break_exceeds_total_time(self):
        """휴게시간이 총 근무시간 초과 오류"""
        shift = WorkShift(
            date=date(2026, 1, 6),
            start_time=time(9, 0),
            end_time=time(10, 0),
            break_minutes=120
        )
        with pytest.raises(ValueError, match="Break time.*exceeds total work time"):
            shift.calculate_working_hours()


class TestNightWorkCalculation:
    """야간근로 계산 테스트 (22:00~06:00)"""

    def test_no_night_work(self):
        """야간근로 없음 (9시~18시)"""
        shift = WorkShift(
            date=date(2026, 1, 6),
            start_time=time(9, 0),
            end_time=time(18, 0),
            break_minutes=60
        )
        night_hours = shift.calculate_night_hours()
        assert night_hours.is_zero()
        assert not shift.is_night_shift()

    def test_partial_night_work(self):
        """부분 야간근로 (18시~23시, 야간 1시간: 22시~23시)"""
        shift = WorkShift(
            date=date(2026, 1, 6),
            start_time=time(18, 0),
            end_time=time(23, 0),
            break_minutes=0
        )
        night_hours = shift.calculate_night_hours()
        assert night_hours.hours == 1
        assert night_hours.minutes == 0
        assert shift.is_night_shift()

    def test_full_night_work(self):
        """전체 야간근로 (22시~익일 7시, 야간 8시간: 22시~06시)"""
        shift = WorkShift(
            date=date(2026, 1, 6),
            start_time=time(22, 0),
            end_time=time(7, 0),
            break_minutes=60
        )
        night_hours = shift.calculate_night_hours()
        # 22:00~06:00 = 8시간 (휴게시간 제외 전)
        assert night_hours.hours == 8
        assert night_hours.minutes == 0
        assert shift.is_night_shift()

    def test_night_work_midnight_crossing(self):
        """자정 경계 야간근로 (20시~익일 02시, 야간 4시간: 22시~02시)"""
        shift = WorkShift(
            date=date(2026, 1, 6),
            start_time=time(20, 0),
            end_time=time(2, 0),
            break_minutes=0
        )
        night_hours = shift.calculate_night_hours()
        assert night_hours.hours == 4
        assert night_hours.minutes == 0

    def test_early_morning_work(self):
        """새벽 근무 (04시~12시, 야간 2시간: 04시~06시)"""
        shift = WorkShift(
            date=date(2026, 1, 6),
            start_time=time(4, 0),
            end_time=time(12, 0),
            break_minutes=0
        )
        night_hours = shift.calculate_night_hours()
        assert night_hours.hours == 2
        assert night_hours.minutes == 0


class TestOvertimeCalculation:
    """연장근로 계산 테스트 (참고용)"""

    def test_overtime_hours(self):
        """연장근로 추정 (9시간 근무, 1시간 연장)"""
        shift = WorkShift(
            date=date(2026, 1, 6),
            start_time=time(9, 0),
            end_time=time(19, 0),
            break_minutes=60
        )
        overtime_hours = shift.calculate_overtime_hours()
        assert overtime_hours.hours == 1
        assert overtime_hours.minutes == 0

    def test_no_overtime(self):
        """연장근로 없음 (8시간 정상 근무)"""
        shift = WorkShift(
            date=date(2026, 1, 6),
            start_time=time(9, 0),
            end_time=time(18, 0),
            break_minutes=60
        )
        overtime_hours = shift.calculate_overtime_hours()
        assert overtime_hours.is_zero()


class TestHolidayWork:
    """휴일근로 테스트"""

    def test_holiday_work(self):
        """휴일근로 플래그"""
        shift = WorkShift(
            date=date(2026, 1, 4),  # 일요일
            start_time=time(9, 0),
            end_time=time(18, 0),
            break_minutes=60,
            is_holiday_work=True
        )
        assert shift.is_holiday_work


class TestWorkShiftString:
    """WorkShift 문자열 표현 테스트"""

    def test_str_normal_shift(self):
        """정상 근무"""
        shift = WorkShift(
            date=date(2026, 1, 6),
            start_time=time(9, 0),
            end_time=time(18, 0),
            break_minutes=60
        )
        shift_str = str(shift)
        assert "2026-01-06" in shift_str
        assert "09:00" in shift_str
        assert "18:00" in shift_str
        assert "60분" in shift_str

    def test_str_holiday_shift(self):
        """휴일근로"""
        shift = WorkShift(
            date=date(2026, 1, 4),
            start_time=time(9, 0),
            end_time=time(18, 0),
            break_minutes=60,
            is_holiday_work=True
        )
        shift_str = str(shift)
        assert "휴일근로" in shift_str
