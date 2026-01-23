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

        # 3. 개근한 주 수 계산 (주별 개근 → 해당 주 주휴수당 지급)
        qualifying_weeks, _ = self._count_qualifying_weeks(work_shifts, scheduled_work_days)

        if qualifying_weeks == 0:
            return WeeklyHolidayPayResult(
                weekly_holiday_pay=Money.zero(),
                weekly_hours=avg_weekly_hours,
                hourly_wage=hourly_wage,
                is_proportional=is_proportional
            )

        # 4. 주휴수당 계산
        if is_proportional:
            ratio = weekly_hours_decimal / self.WEEKLY_REGULAR_HOURS
            holiday_hours = ratio * self.HOLIDAY_HOURS
        else:
            holiday_hours = self.HOLIDAY_HOURS

        # 월 주휴수당 = 1주 주휴수당 × 개근 주 수
        weekly_pay = hourly_wage * holiday_hours
        monthly_holiday_pay = (weekly_pay * Decimal(qualifying_weeks)).round_to_won()

        return WeeklyHolidayPayResult(
            weekly_holiday_pay=monthly_holiday_pay,
            weekly_hours=avg_weekly_hours,
            hourly_wage=hourly_wage,
            is_proportional=is_proportional
        )

    def _count_qualifying_weeks(
        self,
        work_shifts: List[WorkShift],
        scheduled_work_days: int
    ) -> tuple[int, int]:
        """개근 주 수 계산

        주별로 실제 근무일 수가 소정근로일 이상인 주를 카운트합니다.
        월 경계에 걸친 부분 주는 해당 주의 가능한 근무일 수로 판단합니다.

        Args:
            work_shifts: 근무 시프트 리스트
            scheduled_work_days: 주 소정근로일

        Returns:
            (개근 주 수, 전체 주 수) 튜플
        """
        if not work_shifts:
            return (0, 0)

        regular_shifts = [s for s in work_shifts if not s.is_holiday_work]
        if not regular_shifts:
            return (0, 0)

        from collections import defaultdict
        weeks: dict[tuple, set] = defaultdict(set)
        for shift in regular_shifts:
            week_key = shift.date.isocalendar()[:2]
            weeks[week_key].add(shift.date)

        if not weeks:
            return (0, 0)

        # 월 범위 파악 (해당 월의 전체 범위로 확장)
        import calendar
        from collections import Counter as Ctr
        month_counter = Ctr((s.date.year, s.date.month) for s in regular_shifts)
        main_year, main_month = month_counter.most_common(1)[0][0]
        from datetime import date, timedelta
        min_date = date(main_year, main_month, 1)
        max_date = date(main_year, main_month, calendar.monthrange(main_year, main_month)[1])

        # 주별 근무 시간 집계
        from collections import defaultdict as dd2
        week_minutes: dict[tuple, int] = dd2(int)
        for shift in regular_shifts:
            wk = shift.date.isocalendar()[:2]
            week_minutes[wk] += shift.calculate_working_hours().to_minutes()

        qualifying = 0
        total = 0
        for week_key, dates in weeks.items():
            # 해당 주의 실제 근무시간이 15시간(900분) 미만이면 미적용
            if week_minutes.get(week_key, 0) < 900:
                continue

            # 해당 주에서 월 범위 내 가능한 평일 수 계산
            iso_year, iso_week = week_key
            jan4 = date(iso_year, 1, 4)
            start_of_week = jan4 + timedelta(weeks=iso_week - 1, days=-jan4.weekday())
            possible_days = 0
            for i in range(7):
                d = start_of_week + timedelta(days=i)
                if d.weekday() < scheduled_work_days and min_date <= d <= max_date:
                    possible_days += 1

            if possible_days < scheduled_work_days:
                required = possible_days
            else:
                required = scheduled_work_days

            total += 1
            if len(dates) >= required:
                qualifying += 1

        return (qualifying, total)

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
