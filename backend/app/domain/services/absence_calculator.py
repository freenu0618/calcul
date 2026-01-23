"""Absence Calculator - 결근 계산 서비스

월급제 근로자의 결근일 산출 및 공제액 계산.
- STRICT: 일급 공제 + 결근 주 주휴수당 미지급
- MODERATE: 결근 주 주휴수당만 미지급
- LENIENT: 공제 없음
"""
import calendar
from collections import defaultdict
from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from typing import List, Set

from ..entities import WorkShift
from ..value_objects import Money
from ...core.holidays_2026 import get_holidays


@dataclass
class AbsenceResult:
    """결근 계산 결과"""
    scheduled_days: int        # 소정근로일수
    actual_work_days: int      # 실제 근무일수
    absent_days: int           # 결근일수
    daily_wage: Money          # 일급
    wage_deduction: Money      # 일급 공제액
    holiday_pay_loss: Money    # 주휴수당 미지급액
    total_deduction: Money     # 총 공제액
    absent_weeks: int          # 결근 발생 주 수


class AbsenceCalculator:
    """결근 계산기

    사업장 규모별 공휴일 처리:
    - 5인 이상: 공휴일 = 유급휴일 (소정근로일에서 제외)
    - 5인 미만: 공휴일 적용 의무 없음 (소정근로일에 포함)
    """

    # 주 소정근로일 → 근무 요일 매핑 (0=월, 6=일)
    WEEKDAY_MAP = {
        4: range(0, 4),   # 월~목
        5: range(0, 5),   # 월~금
        6: range(0, 6),   # 월~토
        7: range(0, 7),   # 매일
    }

    def calculate(
        self,
        work_shifts: List[WorkShift],
        scheduled_work_days: int,
        calculation_month: str,
        base_salary: Money,
        absence_policy: str,
        is_over_5: bool,
        hourly_wage: Money = None,
    ) -> AbsenceResult:
        """결근 계산

        Args:
            work_shifts: 근무 시프트 리스트
            scheduled_work_days: 주 소정근로일 (4~7)
            calculation_month: 계산 대상 월 (YYYY-MM)
            base_salary: 기본 월급
            absence_policy: 공제 정책 (STRICT/MODERATE/LENIENT)
            is_over_5: 5인 이상 사업장 여부
            hourly_wage: 통상시급 (주휴수당 계산용)
        """
        year, month = map(int, calculation_month.split('-'))

        # 1. 소정근로일수 계산
        scheduled_dates = self._get_scheduled_dates(
            year, month, scheduled_work_days, is_over_5
        )
        scheduled_count = len(scheduled_dates)

        # 2. 실제 근무일수 (평일 근무만, 휴일근무 제외)
        actual_dates = {
            s.date for s in work_shifts if not s.is_holiday_work
        }
        actual_count = len(actual_dates & scheduled_dates)

        # 3. 결근일수
        absent_days = max(0, scheduled_count - actual_count)

        # 4. 일급 계산
        daily_wage = Money.zero()
        if scheduled_count > 0:
            daily_wage = (base_salary / Decimal(scheduled_count)).round_to_won()

        # 5. 정책별 공제액 계산
        wage_deduction = Money.zero()
        holiday_pay_loss = Money.zero()

        if absence_policy == "LENIENT" or absent_days == 0:
            pass  # 공제 없음
        elif absence_policy == "STRICT":
            wage_deduction = (daily_wage * Decimal(absent_days)).round_to_won()
            holiday_pay_loss = self._calc_holiday_pay_loss(
                work_shifts, scheduled_work_days, scheduled_dates,
                hourly_wage, year, month
            )
        elif absence_policy == "MODERATE":
            holiday_pay_loss = self._calc_holiday_pay_loss(
                work_shifts, scheduled_work_days, scheduled_dates,
                hourly_wage, year, month
            )

        # 결근 발생 주 수 계산
        absent_weeks = self._count_absent_weeks(
            work_shifts, scheduled_work_days, scheduled_dates, year, month
        )

        total_deduction = wage_deduction + holiday_pay_loss

        return AbsenceResult(
            scheduled_days=scheduled_count,
            actual_work_days=actual_count,
            absent_days=absent_days,
            daily_wage=daily_wage,
            wage_deduction=wage_deduction,
            holiday_pay_loss=holiday_pay_loss,
            total_deduction=total_deduction,
            absent_weeks=absent_weeks,
        )

    def _get_scheduled_dates(
        self, year: int, month: int,
        scheduled_work_days: int, is_over_5: bool
    ) -> Set[date]:
        """해당 월 소정근로일 집합 반환"""
        holidays = get_holidays(year) if is_over_5 else set()
        work_weekdays = self.WEEKDAY_MAP.get(scheduled_work_days, range(0, 5))

        _, days_in_month = calendar.monthrange(year, month)
        scheduled = set()

        for day in range(1, days_in_month + 1):
            d = date(year, month, day)
            if d.weekday() in work_weekdays and d not in holidays:
                scheduled.add(d)

        return scheduled

    def _count_absent_weeks(
        self, work_shifts: List[WorkShift],
        scheduled_work_days: int, scheduled_dates: Set[date],
        year: int, month: int
    ) -> int:
        """결근 발생 주 수 계산 (ISO 주 기준)"""
        actual_dates = {
            s.date for s in work_shifts if not s.is_holiday_work
        }

        # 주별 그룹화
        weeks = defaultdict(set)
        for d in scheduled_dates:
            week_key = d.isocalendar()[:2]
            weeks[week_key].add(d)

        absent_weeks = 0
        for week_key, week_dates in weeks.items():
            expected = len(week_dates)
            actual = len(actual_dates & week_dates)
            if actual < expected:
                absent_weeks += 1

        return absent_weeks

    def _calc_holiday_pay_loss(
        self, work_shifts: List[WorkShift],
        scheduled_work_days: int, scheduled_dates: Set[date],
        hourly_wage: Money, year: int, month: int
    ) -> Money:
        """결근 주의 주휴수당 미지급액 계산"""
        if not hourly_wage:
            return Money.zero()

        absent_weeks = self._count_absent_weeks(
            work_shifts, scheduled_work_days, scheduled_dates, year, month
        )

        if absent_weeks == 0:
            return Money.zero()

        # 주휴수당 = 8시간 × 통상시급 (주 40시간 기준)
        weekly_holiday_pay = (hourly_wage * Decimal('8')).round_to_won()
        return (weekly_holiday_pay * Decimal(absent_weeks)).round_to_won()
