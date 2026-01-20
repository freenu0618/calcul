"""WorkShift Entity - 근무 시프트 엔티티

하루 단위 근무 기록과 근로시간 계산을 담당합니다.
"""
from dataclasses import dataclass
from datetime import date, time, datetime, timedelta
from typing import Optional
from uuid import UUID, uuid4

from ..value_objects import WorkingHours


@dataclass
class WorkShift:
    """근무 시프트 엔티티

    Attributes:
        date: 근무 날짜
        start_time: 출근 시각
        end_time: 퇴근 시각
        break_minutes: 휴게시간 (분)
        is_holiday_work: 휴일근로 여부
        id: 고유 식별자

    Examples:
        >>> # 평일 09:00-18:00 근무, 휴게 1시간
        >>> shift = WorkShift(
        ...     date=date(2026, 1, 6),
        ...     start_time=time(9, 0),
        ...     end_time=time(18, 0),
        ...     break_minutes=60,
        ...     is_holiday_work=False
        ... )
        >>> shift.calculate_working_hours()
        WorkingHours(hours=8, minutes=0)

        >>> # 야간근무 22:00 ~ 익일 07:00, 휴게 1시간
        >>> night_shift = WorkShift(
        ...     date=date(2026, 1, 6),
        ...     start_time=time(22, 0),
        ...     end_time=time(7, 0),
        ...     break_minutes=60,
        ...     is_holiday_work=False
        ... )
        >>> night_shift.calculate_night_hours()
        WorkingHours(hours=8, minutes=0)  # 22:00-06:00
    """

    date: date
    start_time: time
    end_time: time
    break_minutes: int
    is_holiday_work: bool = False
    id: Optional[UUID] = None

    def __post_init__(self):
        """초기화 후 처리"""
        if self.id is None:
            object.__setattr__(self, 'id', uuid4())

        # 검증
        if self.break_minutes < 0:
            raise ValueError(f"Break minutes cannot be negative: {self.break_minutes}")

    def calculate_working_hours(self) -> WorkingHours:
        """실근로시간 계산 (휴게시간 제외)

        Returns:
            실근로시간

        Examples:
            >>> shift = WorkShift(
            ...     date=date(2026, 1, 6),
            ...     start_time=time(9, 0),
            ...     end_time=time(18, 0),
            ...     break_minutes=60
            ... )
            >>> shift.calculate_working_hours()
            WorkingHours(hours=8, minutes=0)
        """
        total_minutes = self._calculate_total_minutes()
        net_minutes = total_minutes - self.break_minutes

        if net_minutes < 0:
            raise ValueError(f"Break time ({self.break_minutes}분) exceeds total work time ({total_minutes}분)")

        return WorkingHours.from_minutes(net_minutes)

    def calculate_night_hours(self) -> WorkingHours:
        """야간근로시간 계산 (22:00~06:00)

        근로기준법 제56조: 야간근로(22:00~06:00)는 통상임금의 50% 가산

        Returns:
            야간근로시간 (순수 야간시간, 휴게시간 제외 전)

        Examples:
            >>> # 18:00 ~ 23:00 근무 (야간 1시간: 22:00~23:00)
            >>> shift = WorkShift(
            ...     date=date(2026, 1, 6),
            ...     start_time=time(18, 0),
            ...     end_time=time(23, 0),
            ...     break_minutes=0
            ... )
            >>> shift.calculate_night_hours()
            WorkingHours(hours=1, minutes=0)
        """
        start_dt = datetime.combine(self.date, self.start_time)
        end_dt = datetime.combine(self.date, self.end_time)

        # 퇴근 시각이 출근 시각보다 빠르면 다음날로 간주
        if end_dt <= start_dt:
            end_dt += timedelta(days=1)

        night_minutes = 0
        current = start_dt

        # 1분 단위로 순회하며 야간 시간대 체크
        while current < end_dt:
            hour = current.hour
            # 22:00~23:59 또는 00:00~05:59
            if hour >= 22 or hour < 6:
                night_minutes += 1
            current += timedelta(minutes=1)

        return WorkingHours.from_minutes(night_minutes)

    def calculate_overtime_hours(self, weekly_regular_hours: int = 40) -> WorkingHours:
        """연장근로시간 계산

        주 40시간 초과분을 연장근로로 계산합니다.
        실제 계산은 주 단위로 집계 후 판단해야 하므로, 이 메서드는 참고용입니다.

        Args:
            weekly_regular_hours: 주 소정근로시간 (기본 40시간)

        Returns:
            연장근로시간 (추정치)

        Note:
            실제 연장근로는 OvertimeCalculator에서 주 단위로 계산합니다.
        """
        working_hours = self.calculate_working_hours()
        daily_regular = 8  # 하루 소정근로시간

        if working_hours.to_minutes() > daily_regular * 60:
            overtime_minutes = working_hours.to_minutes() - (daily_regular * 60)
            return WorkingHours.from_minutes(overtime_minutes)

        return WorkingHours.zero()

    def is_night_shift(self) -> bool:
        """야간근로 포함 여부

        Returns:
            야간근로가 포함되면 True
        """
        return not self.calculate_night_hours().is_zero()

    def _calculate_total_minutes(self) -> int:
        """총 근무시간 계산 (분 단위, 휴게시간 포함)

        Returns:
            총 근무 분

        Examples:
            >>> shift = WorkShift(
            ...     date=date(2026, 1, 6),
            ...     start_time=time(9, 0),
            ...     end_time=time(18, 0),
            ...     break_minutes=60
            ... )
            >>> shift._calculate_total_minutes()
            540  # 9시간 = 540분
        """
        start_dt = datetime.combine(self.date, self.start_time)
        end_dt = datetime.combine(self.date, self.end_time)

        # 퇴근 시각이 출근 시각보다 빠르면 다음날로 간주
        if end_dt <= start_dt:
            end_dt += timedelta(days=1)

        delta = end_dt - start_dt
        return int(delta.total_seconds() / 60)

    def __str__(self) -> str:
        """문자열 표현

        Returns:
            포맷팅된 문자열
        """
        return (
            f"WorkShift({self.date.isoformat()} "
            f"{self.start_time.strftime('%H:%M')}~{self.end_time.strftime('%H:%M')}, "
            f"휴게 {self.break_minutes}분"
            f"{', 휴일근로' if self.is_holiday_work else ''})"
        )
