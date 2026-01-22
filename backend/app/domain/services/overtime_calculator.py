"""Overtime Calculator - 연장/야간/휴일 수당 계산 서비스

근로기준법에 따른 가산수당을 계산합니다.
- 연장근로: 통상시급 × 1.5배 (주 40시간 초과)
- 야간근로: 통상시급 × 0.5배 (22:00~06:00)
- 휴일근로: 통상시급 × 1.5배 (8시간 이하)
- 휴일근로 8시간 초과: 통상시급 × 2.0배 (5인 이상 사업장)
"""
from dataclasses import dataclass
from decimal import Decimal
from typing import List

from ..entities import WorkShift, CompanySize
from ..value_objects import Money, WorkingHours


@dataclass
class OvertimeResult:
    """가산수당 계산 결과

    Attributes:
        overtime_pay: 연장근로수당
        night_pay: 야간근로수당
        holiday_pay: 휴일근로수당
        overtime_hours: 연장근로시간
        night_hours: 야간근로시간
        holiday_hours: 휴일근로시간
        hourly_wage: 통상시급
    """
    overtime_pay: Money
    night_pay: Money
    holiday_pay: Money
    overtime_hours: WorkingHours
    night_hours: WorkingHours
    holiday_hours: WorkingHours
    hourly_wage: Money

    def total(self) -> Money:
        """총 가산수당

        Returns:
            총 가산수당
        """
        return self.overtime_pay + self.night_pay + self.holiday_pay

    def to_dict(self) -> dict:
        """딕셔너리로 변환 (API 응답용)

        Returns:
            가산수당 상세 정보
        """
        result = {}

        if not self.overtime_pay.is_zero():
            result["overtime_pay"] = {
                "amount": self.overtime_pay.to_int(),
                "calculation": (
                    f"{self.hourly_wage.to_int():,}원 × "
                    f"{self.overtime_hours.to_decimal_hours()}시간 × 0.5(가산분)"
                )
            }

        if not self.night_pay.is_zero():
            result["night_pay"] = {
                "amount": self.night_pay.to_int(),
                "calculation": (
                    f"{self.hourly_wage.to_int():,}원 × "
                    f"{self.night_hours.to_decimal_hours()}시간 × 0.5"
                )
            }

        if not self.holiday_pay.is_zero():
            result["holiday_pay"] = {
                "amount": self.holiday_pay.to_int(),
                "calculation": f"휴일근로 {self.holiday_hours.to_decimal_hours()}시간"
            }

        result["total"] = self.total().to_int()
        return result


class OvertimeCalculator:
    """연장/야간/휴일 수당 계산기

    근로기준법 제56조:
    - 연장근로, 야간근로, 휴일근로에 대해서는 통상임금의 50% 이상 가산 지급
    - 휴일근로가 8시간을 초과하는 경우에는 연장근로 가산임금도 추가 지급

    ※ 가산수당 계산 원칙:
      - 연장근로: 통상시급 × 1.5배 (기본 1.0 + 가산 0.5)
      - 야간근로: 통상시급 × 0.5배 (가산분만, 기본 근로시간과 중복 계산 방지)
      - 휴일근로: 통상시급 × 1.5배 (휴일은 무급이므로 기본 + 가산 모두)
    """

    # 가산율
    OVERTIME_RATE = Decimal('1.5')    # 연장근로 1.5배 (기본 + 가산)
    NIGHT_RATE = Decimal('0.5')       # 야간근로 0.5배 (가산분만)
    HOLIDAY_RATE = Decimal('1.5')     # 휴일근로 1.5배 (기본 + 가산)
    HOLIDAY_OVERTIME_RATE = Decimal('2.0')  # 휴일근로 8시간 초과 시 2.0배

    # 기준
    WEEKLY_REGULAR_HOURS = 40  # 주 소정근로시간
    DAILY_REGULAR_HOURS = 8    # 일 소정근로시간

    def calculate(
        self,
        work_shifts: List[WorkShift],
        hourly_wage: Money,
        company_size: CompanySize,
        scheduled_work_days: int = 5
    ) -> OvertimeResult:
        """가산수당 계산

        Args:
            work_shifts: 근무 시프트 리스트 (1개월치)
            hourly_wage: 통상시급
            company_size: 사업장 규모
            scheduled_work_days: 주 소정근로일 (계약상 근무일 수)

        Returns:
            가산수당 계산 결과

        Examples:
            >>> shifts = [
            ...     WorkShift(date(2026, 1, 6), time(9, 0), time(20, 0), 60, False),  # 10시간 근무
            ...     WorkShift(date(2026, 1, 12), time(9, 0), time(18, 0), 60, True),  # 휴일 8시간
            ... ]
            >>> calculator = OvertimeCalculator()
            >>> result = calculator.calculate(shifts, Money(16092), CompanySize.OVER_5, 5)
        """
        # 1. 연장근로 계산 (주 단위 + 소정근로일 초과분)
        overtime_hours, overtime_pay = self._calculate_overtime(
            work_shifts, hourly_wage, scheduled_work_days
        )

        # 2. 야간근로 계산
        night_hours, night_pay = self._calculate_night_work(
            work_shifts, hourly_wage
        )

        # 3. 휴일근로 계산
        holiday_hours, holiday_pay = self._calculate_holiday_work(
            work_shifts, hourly_wage, company_size
        )

        return OvertimeResult(
            overtime_pay=overtime_pay,
            night_pay=night_pay,
            holiday_pay=holiday_pay,
            overtime_hours=overtime_hours,
            night_hours=night_hours,
            holiday_hours=holiday_hours,
            hourly_wage=hourly_wage
        )

    def _calculate_overtime(
        self,
        work_shifts: List[WorkShift],
        hourly_wage: Money,
        scheduled_work_days: int = 5
    ) -> tuple[WorkingHours, Money]:
        """연장근로 계산

        연장근로는 두 가지 기준으로 계산:
        1. 주 40시간 초과분 (시간 기준)
        2. 소정근로일 초과 근무분 (일수 기준)

        Args:
            work_shifts: 근무 시프트 리스트
            hourly_wage: 통상시급
            scheduled_work_days: 주 소정근로일

        Returns:
            (연장근로시간, 연장근로수당)
        """
        # 주별로 그룹화하여 계산
        weekly_groups = self._group_by_week(work_shifts)
        total_overtime_minutes = 0

        # 주 소정근로시간 계산 (소정근로일 × 8시간)
        scheduled_weekly_hours = scheduled_work_days * self.DAILY_REGULAR_HOURS
        # 실제 적용할 기준: 소정근로시간과 40시간 중 작은 값
        weekly_limit_minutes = min(scheduled_weekly_hours, self.WEEKLY_REGULAR_HOURS) * 60

        for week_shifts in weekly_groups:
            # 평일 근무만 집계 (휴일근로는 별도 계산)
            regular_shifts = [s for s in week_shifts if not s.is_holiday_work]

            # 날짜순 정렬
            sorted_shifts = sorted(regular_shifts, key=lambda s: s.date)

            # 소정근로일 내 근무시간과 초과 근무시간 분리
            scheduled_minutes = 0  # 소정근로일 내 근무시간
            excess_minutes = 0     # 소정근로일 초과 근무시간

            for i, shift in enumerate(sorted_shifts):
                shift_minutes = shift.calculate_working_hours().to_minutes()

                if i < scheduled_work_days:
                    # 소정근로일 내: 8시간 초과분은 연장근로
                    daily_limit = self.DAILY_REGULAR_HOURS * 60
                    if shift_minutes > daily_limit:
                        scheduled_minutes += daily_limit
                        excess_minutes += shift_minutes - daily_limit
                    else:
                        scheduled_minutes += shift_minutes
                else:
                    # 소정근로일 초과: 전체가 연장근로
                    excess_minutes += shift_minutes

            # 소정근로일 내에서도 주 기준 초과분 계산
            if scheduled_minutes > weekly_limit_minutes:
                excess_minutes += scheduled_minutes - weekly_limit_minutes

            total_overtime_minutes += excess_minutes

        overtime_hours = WorkingHours.from_minutes(total_overtime_minutes)

        # 연장수당 = 통상시급 × 연장시간 × 1.5
        overtime_pay = (
            hourly_wage * overtime_hours.to_decimal_hours() * self.OVERTIME_RATE
        ).round_to_won()

        return overtime_hours, overtime_pay

    def _calculate_night_work(
        self,
        work_shifts: List[WorkShift],
        hourly_wage: Money
    ) -> tuple[WorkingHours, Money]:
        """야간근로 계산 (22:00~06:00)

        Args:
            work_shifts: 근무 시프트 리스트
            hourly_wage: 통상시급

        Returns:
            (야간근로시간, 야간근로수당)
        """
        total_night_minutes = sum(
            s.calculate_night_hours().to_minutes()
            for s in work_shifts
        )

        night_hours = WorkingHours.from_minutes(total_night_minutes)

        # 야간수당 = 통상시급 × 야간시간 × 0.5 (가산분만)
        night_pay = (
            hourly_wage * night_hours.to_decimal_hours() * self.NIGHT_RATE
        ).round_to_won()

        return night_hours, night_pay

    def _calculate_holiday_work(
        self,
        work_shifts: List[WorkShift],
        hourly_wage: Money,
        company_size: CompanySize
    ) -> tuple[WorkingHours, Money]:
        """휴일근로 계산

        근로기준법 제56조 제2항:
        - 0~8시간: 통상시급 × 1.5배
        - 8시간 초과: 통상시급 × 2.0배 (5인 이상만)

        Args:
            work_shifts: 근무 시프트 리스트
            hourly_wage: 통상시급
            company_size: 사업장 규모

        Returns:
            (휴일근로시간, 휴일근로수당)
        """
        holiday_shifts = [s for s in work_shifts if s.is_holiday_work]

        if not holiday_shifts:
            return WorkingHours.zero(), Money.zero()

        total_holiday_pay = Money.zero()
        total_holiday_minutes = 0

        for shift in holiday_shifts:
            working_hours = shift.calculate_working_hours()
            total_holiday_minutes += working_hours.to_minutes()

            # 5인 이상 사업장: 8시간 초과 시 가산율 다름
            if company_size == CompanySize.OVER_5:
                hours_decimal = working_hours.to_decimal_hours()

                if hours_decimal > 8:
                    # 8시간: 1.5배
                    base_pay = hourly_wage * Decimal('8') * self.HOLIDAY_RATE
                    # 초과분: 2.0배
                    overtime_hours = hours_decimal - Decimal('8')
                    overtime_pay = hourly_wage * overtime_hours * self.HOLIDAY_OVERTIME_RATE
                    total_holiday_pay += (base_pay + overtime_pay).round_to_won()
                else:
                    # 8시간 이하: 1.5배
                    pay = hourly_wage * hours_decimal * self.HOLIDAY_RATE
                    total_holiday_pay += pay.round_to_won()
            else:
                # 5인 미만: 8시간 초과해도 1.5배
                hours_decimal = working_hours.to_decimal_hours()
                pay = hourly_wage * hours_decimal * self.HOLIDAY_RATE
                total_holiday_pay += pay.round_to_won()

        holiday_hours = WorkingHours.from_minutes(total_holiday_minutes)
        return holiday_hours, total_holiday_pay

    def _group_by_week(self, work_shifts: List[WorkShift]) -> List[List[WorkShift]]:
        """근무 시프트를 주 단위로 그룹화

        Args:
            work_shifts: 근무 시프트 리스트

        Returns:
            주별 그룹화된 시프트 리스트
        """
        if not work_shifts:
            return []

        # 날짜순 정렬
        sorted_shifts = sorted(work_shifts, key=lambda s: s.date)

        # 주 단위로 그룹화 (월요일 시작 기준)
        weeks = {}
        for shift in sorted_shifts:
            # ISO 주 번호 (년, 주차)
            year, week_num, _ = shift.date.isocalendar()
            week_key = (year, week_num)

            if week_key not in weeks:
                weeks[week_key] = []
            weeks[week_key].append(shift)

        return list(weeks.values())
