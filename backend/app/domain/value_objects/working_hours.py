"""WorkingHours Value Object - 근무시간을 나타내는 불변 값 객체

시간과 분을 분리하여 관리하며, Decimal 변환 시 정확한 계산을 보장합니다.
"""
from dataclasses import dataclass
from decimal import Decimal
from typing import Tuple


@dataclass(frozen=True)
class WorkingHours:
    """근무시간 값 객체

    Attributes:
        hours: 시간 (0 이상의 정수)
        minutes: 분 (0~59 사이의 정수)

    Examples:
        >>> work = WorkingHours(8, 30)  # 8시간 30분
        >>> work.to_decimal_hours()
        Decimal('8.5')
        >>> work.to_minutes()
        510
    """

    hours: int
    minutes: int = 0

    def __post_init__(self):
        """초기화 후 검증"""
        if self.hours < 0:
            raise ValueError(f"Hours cannot be negative: {self.hours}")
        if self.minutes < 0 or self.minutes >= 60:
            raise ValueError(f"Minutes must be between 0 and 59: {self.minutes}")

    def __add__(self, other: 'WorkingHours') -> 'WorkingHours':
        """근무시간 더하기

        Args:
            other: 더할 근무시간

        Returns:
            더한 결과 근무시간

        Examples:
            >>> WorkingHours(3, 40) + WorkingHours(2, 30)
            WorkingHours(hours=6, minutes=10)
        """
        total_minutes = self.to_minutes() + other.to_minutes()
        return WorkingHours.from_minutes(total_minutes)

    def __sub__(self, other: 'WorkingHours') -> 'WorkingHours':
        """근무시간 빼기

        Args:
            other: 뺄 근무시간

        Returns:
            뺀 결과 근무시간

        Raises:
            ValueError: 결과가 음수인 경우
        """
        total_minutes = self.to_minutes() - other.to_minutes()
        if total_minutes < 0:
            raise ValueError(f"Cannot subtract {other} from {self}: result would be negative")
        return WorkingHours.from_minutes(total_minutes)

    def __mul__(self, multiplier: float) -> 'WorkingHours':
        """근무시간 곱하기 (가산율 적용 등)

        Args:
            multiplier: 곱할 값

        Returns:
            곱한 결과 근무시간

        Examples:
            >>> WorkingHours(10, 0) * 1.5  # 연장근로 1.5배
            WorkingHours(hours=15, minutes=0)
        """
        total_minutes = int(self.to_minutes() * multiplier)
        return WorkingHours.from_minutes(total_minutes)

    def __lt__(self, other: 'WorkingHours') -> bool:
        """작은지 비교"""
        return self.to_minutes() < other.to_minutes()

    def __le__(self, other: 'WorkingHours') -> bool:
        """작거나 같은지 비교"""
        return self.to_minutes() <= other.to_minutes()

    def __gt__(self, other: 'WorkingHours') -> bool:
        """큰지 비교"""
        return self.to_minutes() > other.to_minutes()

    def __ge__(self, other: 'WorkingHours') -> bool:
        """크거나 같은지 비교"""
        return self.to_minutes() >= other.to_minutes()

    def to_minutes(self) -> int:
        """총 분으로 변환

        Returns:
            총 분 수

        Examples:
            >>> WorkingHours(2, 30).to_minutes()
            150
        """
        return self.hours * 60 + self.minutes

    def to_decimal_hours(self) -> Decimal:
        """Decimal 시간으로 변환 (급여 계산용)

        Returns:
            Decimal 시간 (예: 8.5시간)

        Examples:
            >>> WorkingHours(8, 30).to_decimal_hours()
            Decimal('8.5')
        """
        return Decimal(self.hours) + Decimal(self.minutes) / Decimal(60)

    @classmethod
    def from_minutes(cls, total_minutes: int) -> 'WorkingHours':
        """총 분에서 WorkingHours 생성

        Args:
            total_minutes: 총 분 수

        Returns:
            WorkingHours 객체

        Examples:
            >>> WorkingHours.from_minutes(150)
            WorkingHours(hours=2, minutes=30)
        """
        if total_minutes < 0:
            raise ValueError(f"Total minutes cannot be negative: {total_minutes}")
        hours = total_minutes // 60
        minutes = total_minutes % 60
        return cls(hours, minutes)

    @classmethod
    def from_decimal_hours(cls, decimal_hours: Decimal) -> 'WorkingHours':
        """Decimal 시간에서 WorkingHours 생성

        Args:
            decimal_hours: Decimal 시간 (예: Decimal('8.5'))

        Returns:
            WorkingHours 객체

        Examples:
            >>> WorkingHours.from_decimal_hours(Decimal('8.5'))
            WorkingHours(hours=8, minutes=30)
        """
        total_minutes = int(decimal_hours * Decimal(60))
        return cls.from_minutes(total_minutes)

    @classmethod
    def zero(cls) -> 'WorkingHours':
        """0시간 0분 생성

        Returns:
            0시간 0분 WorkingHours 객체
        """
        return cls(0, 0)

    def is_zero(self) -> bool:
        """0시간인지 확인

        Returns:
            0시간이면 True
        """
        return self.hours == 0 and self.minutes == 0

    def format(self) -> str:
        """포맷팅 (한글 표시)

        Returns:
            포맷팅된 문자열

        Examples:
            >>> WorkingHours(8, 30).format()
            '8시간 30분'
            >>> WorkingHours(10, 0).format()
            '10시간'
        """
        if self.minutes == 0:
            return f"{self.hours}시간"
        return f"{self.hours}시간 {self.minutes}분"

    def to_tuple(self) -> Tuple[int, int]:
        """튜플로 변환

        Returns:
            (시간, 분) 튜플
        """
        return (self.hours, self.minutes)
