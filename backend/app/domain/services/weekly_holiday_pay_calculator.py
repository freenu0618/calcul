"""Weekly Holiday Pay Calculator - 주휴수당 계산 서비스

주휴수당은 1주일 동안 소정근로일을 개근한 근로자에게 지급되는 유급휴일 수당입니다.
- 주휴수당 = (1주 소정근로시간 ÷ 40) × 8 × 통상시급
- 주 15시간 미만: 주휴수당 없음
- 5인 미만 사업장도 의무 적용
"""
from dataclasses import dataclass
from decimal import Decimal
from typing import List

from ..entities import WorkShift
from ..value_objects import Money, WorkingHours


@dataclass
class WeeklyHolidayPayResult:
    """주휴수당 계산 결과

    Attributes:
        weekly_holiday_pay: 주휴수당
        weekly_hours: 주 소정근로시간
        hourly_wage: 통상시급
        is_proportional: 비례 지급 여부 (주 40시간 미만)
    """
    weekly_holiday_pay: Money
    weekly_hours: WorkingHours
    hourly_wage: Money
    is_proportional: bool

    def to_dict(self) -> dict:
        """딕셔너리로 변환 (API 응답용)

        Returns:
            주휴수당 상세 정보
        """
        weekly_hours_decimal = self.weekly_hours.to_decimal_hours()

        if self.is_proportional:
            # 비례 지급
            calculation = (
                f"({weekly_hours_decimal} ÷ 40) × 8 × {self.hourly_wage.to_int():,}원 "
                f"= {weekly_hours_decimal / Decimal('40') * Decimal('8'):.1f}시간 × {self.hourly_wage.to_int():,}원"
            )
        else:
            # 전액 지급 (주 40시간 이상)
            calculation = f"8시간 × {self.hourly_wage.to_int():,}원"

        return {
            "amount": self.weekly_holiday_pay.to_int(),
            "calculation": calculation,
            "is_proportional": self.is_proportional,
            "note": "5인 미만 사업장도 의무 적용"
        }


class WeeklyHolidayPayCalculator:
    """주휴수당 계산기

    근로기준법 제55조:
    - 사용자는 근로자에게 1주일에 평균 1회 이상 유급휴일을 주어야 한다.
    - 단시간 근로자: 비례 지급 (1주 소정근로시간 ÷ 40 × 8시간)

    적용 조건:
    - 1주 소정근로시간 ≥ 15시간
    - 해당 주 소정근로일 개근
    - 계속근로관계 유지
    """

    WEEKLY_REGULAR_HOURS = Decimal('40')  # 주 40시간 기준
    HOLIDAY_HOURS = Decimal('8')           # 주휴일 8시간
    MINIMUM_WEEKLY_HOURS = Decimal('15')   # 최소 주 15시간

    def calculate(
        self,
        work_shifts: List[WorkShift],
        hourly_wage: Money,
        scheduled_work_days: int = 5
    ) -> WeeklyHolidayPayResult:
        """주휴수당 계산

        Args:
            work_shifts: 근무 시프트 리스트 (1개월치)
            hourly_wage: 통상시급
            scheduled_work_days: 주 소정근로일 (계약상 주당 근무일 수)

        Returns:
            주휴수당 계산 결과

        Examples:
            >>> # 주 40시간 근무 (전액)
            >>> shifts = [WorkShift(...) for _ in range(20)]  # 월~금 20일
            >>> calculator = WeeklyHolidayPayCalculator()
            >>> result = calculator.calculate(shifts, Money(16092), 5)
            >>> result.weekly_holiday_pay.to_int()
            128736  # 16,092 × 8

            >>> # 주 24시간 근무 (비례)
            >>> shifts = [WorkShift(...) for _ in range(12)]  # 주 3일
            >>> result = calculator.calculate(shifts, Money(10320), 4)
            >>> result.weekly_holiday_pay.to_int()
            49536  # (24 ÷ 40) × 8 × 10,320
        """
        # 1. 주별 평균 근로시간 계산
        avg_weekly_hours = self._calculate_average_weekly_hours(work_shifts)
        weekly_hours_decimal = avg_weekly_hours.to_decimal_hours()

        # 비례 지급 여부는 근로시간 기준 (개근 여부와 무관)
        is_proportional = weekly_hours_decimal < self.WEEKLY_REGULAR_HOURS

        # 2. 주 15시간 미만: 주휴수당 없음
        if weekly_hours_decimal < self.MINIMUM_WEEKLY_HOURS:
            return WeeklyHolidayPayResult(
                weekly_holiday_pay=Money.zero(),
                weekly_hours=avg_weekly_hours,
                hourly_wage=hourly_wage,
                is_proportional=is_proportional
            )

        # 3. 개근 조건 체크 (주별 실제 근무일 vs 소정근로일)
        if not self._check_full_attendance(work_shifts, scheduled_work_days):
            return WeeklyHolidayPayResult(
                weekly_holiday_pay=Money.zero(),
                weekly_hours=avg_weekly_hours,
                hourly_wage=hourly_wage,
                is_proportional=is_proportional
            )

        # 4. 주휴수당 계산

        if is_proportional:
            # 비례 지급: (주 소정근로시간 ÷ 40) × 8 × 통상시급
            ratio = weekly_hours_decimal / self.WEEKLY_REGULAR_HOURS
            holiday_hours = ratio * self.HOLIDAY_HOURS
        else:
            # 전액 지급: 8시간
            holiday_hours = self.HOLIDAY_HOURS

        # 월 주휴수당 = 주휴수당 × 주 수 (한 달 평균 4.345주)
        weekly_pay = hourly_wage * holiday_hours
        monthly_weeks = Decimal('4.345')  # 1년 365일 ÷ 7일 ÷ 12개월
        monthly_holiday_pay = (weekly_pay * monthly_weeks).round_to_won()

        return WeeklyHolidayPayResult(
            weekly_holiday_pay=monthly_holiday_pay,
            weekly_hours=avg_weekly_hours,
            hourly_wage=hourly_wage,
            is_proportional=is_proportional
        )

    def _check_full_attendance(
        self,
        work_shifts: List[WorkShift],
        scheduled_work_days: int
    ) -> bool:
        """개근 여부 체크

        주별로 실제 근무일 수가 소정근로일 이상인지 확인합니다.
        scheduled_work_days가 실제 근무 패턴과 맞지 않으면 자동으로 추정합니다.

        Args:
            work_shifts: 근무 시프트 리스트
            scheduled_work_days: 주 소정근로일

        Returns:
            개근이면 True (최소 1주 이상 개근해야 함)
        """
        if not work_shifts:
            return False

        # 평일 근무만 집계 (휴일근로 제외)
        regular_shifts = [s for s in work_shifts if not s.is_holiday_work]

        if not regular_shifts:
            return False

        # 주별로 그룹화
        from collections import defaultdict, Counter
        weeks = defaultdict(set)
        for shift in regular_shifts:
            # ISO week number 사용
            week_key = shift.date.isocalendar()[:2]  # (year, week)
            weeks[week_key].add(shift.date)

        # 주별 근무일 수 집계
        work_days_per_week = [len(dates) for dates in weeks.values()]

        if not work_days_per_week:
            return False

        # 개근 여부: 모든 주에서 소정근로일 이상 근무해야 함
        # (자동 조정 삭제 - 계약상 소정근로일 기준으로 엄격하게 판단)
        full_attendance_weeks = sum(
            1 for dates in weeks.values()
            if len(dates) >= scheduled_work_days
        )
        total_weeks = len(weeks)

        # 모든 주 개근해야 주휴수당 지급 (1주라도 결근하면 해당 월 주휴수당 없음)
        return full_attendance_weeks == total_weeks

    def _calculate_average_weekly_hours(
        self,
        work_shifts: List[WorkShift]
    ) -> WorkingHours:
        """주 평균 근로시간 계산

        Args:
            work_shifts: 근무 시프트 리스트

        Returns:
            주 평균 근로시간
        """
        if not work_shifts:
            return WorkingHours.zero()

        # 평일 근무만 집계 (휴일근로 제외)
        regular_shifts = [s for s in work_shifts if not s.is_holiday_work]

        if not regular_shifts:
            return WorkingHours.zero()

        # 총 근로시간 계산
        total_minutes = sum(
            s.calculate_working_hours().to_minutes()
            for s in regular_shifts
        )

        # 주 단위로 변환 (총 일수 ÷ 7)
        sorted_shifts = sorted(regular_shifts, key=lambda s: s.date)
        first_date = sorted_shifts[0].date
        last_date = sorted_shifts[-1].date
        total_days = (last_date - first_date).days + 1
        weeks = Decimal(total_days) / Decimal('7')

        if weeks == 0:
            weeks = Decimal('1')

        # 주 평균 근로시간
        avg_weekly_minutes = int(Decimal(total_minutes) / weeks)
        return WorkingHours.from_minutes(avg_weekly_minutes)

    @classmethod
    def calculate_proportional_rate(cls, weekly_hours: Decimal) -> Decimal:
        """비례 지급률 계산

        Args:
            weekly_hours: 주 소정근로시간

        Returns:
            비례 지급률 (0.0 ~ 1.0)

        Examples:
            >>> WeeklyHolidayPayCalculator.calculate_proportional_rate(Decimal('24'))
            Decimal('0.6')  # 24 ÷ 40
        """
        if weekly_hours >= cls.WEEKLY_REGULAR_HOURS:
            return Decimal('1.0')
        if weekly_hours < cls.MINIMUM_WEEKLY_HOURS:
            return Decimal('0.0')

        return weekly_hours / cls.WEEKLY_REGULAR_HOURS
