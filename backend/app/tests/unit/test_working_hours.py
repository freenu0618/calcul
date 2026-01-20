"""WorkingHours Value Object 테스트"""
import pytest
from decimal import Decimal
from app.domain.value_objects.working_hours import WorkingHours


class TestWorkingHoursCreation:
    """WorkingHours 객체 생성 테스트"""

    def test_create_working_hours(self):
        """정상 생성"""
        hours = WorkingHours(8, 30)
        assert hours.hours == 8
        assert hours.minutes == 30

    def test_create_without_minutes(self):
        """분 생략 시 기본값 0"""
        hours = WorkingHours(8)
        assert hours.hours == 8
        assert hours.minutes == 0

    def test_negative_hours(self):
        """음수 시간 오류"""
        with pytest.raises(ValueError, match="Hours cannot be negative"):
            WorkingHours(-1, 0)

    def test_invalid_minutes(self):
        """잘못된 분 값 오류"""
        with pytest.raises(ValueError, match="Minutes must be between 0 and 59"):
            WorkingHours(8, 60)
        with pytest.raises(ValueError, match="Minutes must be between 0 and 59"):
            WorkingHours(8, -1)

    def test_zero_working_hours(self):
        """0시간 생성"""
        hours = WorkingHours.zero()
        assert hours.hours == 0
        assert hours.minutes == 0
        assert hours.is_zero()


class TestWorkingHoursConversion:
    """WorkingHours 변환 테스트"""

    def test_to_minutes(self):
        """분으로 변환"""
        hours = WorkingHours(2, 30)
        assert hours.to_minutes() == 150

    def test_to_decimal_hours(self):
        """Decimal 시간으로 변환"""
        hours = WorkingHours(8, 30)
        assert hours.to_decimal_hours() == Decimal('8.5')

    def test_from_minutes(self):
        """분에서 생성"""
        hours = WorkingHours.from_minutes(150)
        assert hours.hours == 2
        assert hours.minutes == 30

    def test_from_minutes_exact_hours(self):
        """정확히 시간 단위"""
        hours = WorkingHours.from_minutes(180)
        assert hours.hours == 3
        assert hours.minutes == 0

    def test_from_minutes_negative(self):
        """음수 분 오류"""
        with pytest.raises(ValueError, match="Total minutes cannot be negative"):
            WorkingHours.from_minutes(-10)

    def test_from_decimal_hours(self):
        """Decimal 시간에서 생성"""
        hours = WorkingHours.from_decimal_hours(Decimal('8.5'))
        assert hours.hours == 8
        assert hours.minutes == 30

    def test_to_tuple(self):
        """튜플로 변환"""
        hours = WorkingHours(8, 30)
        assert hours.to_tuple() == (8, 30)


class TestWorkingHoursArithmetic:
    """WorkingHours 산술 연산 테스트"""

    def test_add_working_hours(self):
        """시간 더하기"""
        hours1 = WorkingHours(3, 40)
        hours2 = WorkingHours(2, 30)
        result = hours1 + hours2
        assert result.hours == 6
        assert result.minutes == 10

    def test_add_with_carry_over(self):
        """시간 더하기 (분 올림)"""
        hours1 = WorkingHours(1, 45)
        hours2 = WorkingHours(2, 30)
        result = hours1 + hours2
        assert result.hours == 4
        assert result.minutes == 15

    def test_subtract_working_hours(self):
        """시간 빼기"""
        hours1 = WorkingHours(5, 30)
        hours2 = WorkingHours(2, 10)
        result = hours1 - hours2
        assert result.hours == 3
        assert result.minutes == 20

    def test_subtract_negative_result(self):
        """시간 빼기 (음수 결과 오류)"""
        hours1 = WorkingHours(2, 10)
        hours2 = WorkingHours(5, 30)
        with pytest.raises(ValueError, match="result would be negative"):
            hours1 - hours2

    def test_multiply_working_hours(self):
        """시간 곱하기 (가산율)"""
        hours = WorkingHours(10, 0)
        result = hours * 1.5
        assert result.hours == 15
        assert result.minutes == 0

    def test_multiply_with_fraction(self):
        """시간 곱하기 (소수 배율)"""
        hours = WorkingHours(8, 0)
        result = hours * 0.5
        assert result.hours == 4
        assert result.minutes == 0


class TestWorkingHoursComparison:
    """WorkingHours 비교 연산 테스트"""

    def test_less_than(self):
        """작은지 비교"""
        hours1 = WorkingHours(2, 30)
        hours2 = WorkingHours(5, 0)
        assert hours1 < hours2
        assert not hours2 < hours1

    def test_greater_than(self):
        """큰지 비교"""
        hours1 = WorkingHours(5, 0)
        hours2 = WorkingHours(2, 30)
        assert hours1 > hours2
        assert not hours2 > hours1

    def test_less_than_equal(self):
        """작거나 같은지 비교"""
        hours1 = WorkingHours(2, 30)
        hours2 = WorkingHours(2, 30)
        hours3 = WorkingHours(5, 0)
        assert hours1 <= hours2
        assert hours1 <= hours3

    def test_greater_than_equal(self):
        """크거나 같은지 비교"""
        hours1 = WorkingHours(5, 0)
        hours2 = WorkingHours(5, 0)
        hours3 = WorkingHours(2, 30)
        assert hours1 >= hours2
        assert hours1 >= hours3


class TestWorkingHoursFormatting:
    """WorkingHours 포맷팅 테스트"""

    def test_format_with_minutes(self):
        """분 포함 포맷팅"""
        hours = WorkingHours(8, 30)
        assert hours.format() == "8시간 30분"

    def test_format_without_minutes(self):
        """분 없이 포맷팅"""
        hours = WorkingHours(10, 0)
        assert hours.format() == "10시간"

    def test_format_zero(self):
        """0시간 포맷팅"""
        hours = WorkingHours.zero()
        assert hours.format() == "0시간"


class TestWorkingHoursPredicates:
    """WorkingHours 상태 확인 테스트"""

    def test_is_zero(self):
        """0시간 확인"""
        assert WorkingHours.zero().is_zero()
        assert WorkingHours(0, 0).is_zero()
        assert not WorkingHours(0, 1).is_zero()
        assert not WorkingHours(1, 0).is_zero()


class TestWorkingHoursImmutability:
    """WorkingHours 불변성 테스트"""

    def test_immutable(self):
        """불변 객체 확인"""
        hours = WorkingHours(8, 30)
        with pytest.raises(Exception):  # dataclass frozen=True
            hours.hours = 10
