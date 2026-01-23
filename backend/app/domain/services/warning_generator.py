"""Warning Generator - 급여 계산 경고 생성 서비스

근로기준법 위반 가능성을 검출하여 경고 메시지를 생성합니다.
- 최저임금 미달: 노동청 신고 가능 사항
- 주 52시간 위반: 연장근로 과다
- 포괄임금제 오용 주의
"""
from dataclasses import dataclass
from decimal import Decimal
from typing import List

from ..entities import WorkShift, CompanySize
from ..value_objects import Money, WorkingHours


@dataclass
class Warning:
    """경고 메시지

    Attributes:
        level: 경고 수준 (critical, warning, info)
        message: 경고 메시지
        detail: 상세 설명
    """
    level: str
    message: str
    detail: str = ""

    def to_dict(self) -> dict:
        return {
            "level": self.level,
            "message": self.message,
            "detail": self.detail,
        }


# 2026년 최저임금: 시급 10,320원
MINIMUM_WAGE_HOURLY_2026 = Decimal('10320')
# 주 최대 근로시간 (연장 포함): 52시간 (근로기준법 제53조)
MAX_WEEKLY_HOURS = Decimal('52')
# 주 소정근로시간 상한: 40시간
REGULAR_WEEKLY_HOURS = Decimal('40')


class WarningGenerator:
    """급여 경고 생성기

    계산 결과를 분석하여 법적 위반 가능성을 경고합니다.
    """

    def generate(
        self,
        hourly_wage: Money,
        work_shifts: List[WorkShift],
        company_size: CompanySize,
        base_salary: Money,
        total_gross: Money,
    ) -> List[Warning]:
        """경고 메시지 생성

        Args:
            hourly_wage: 통상시급
            work_shifts: 근무 시프트 리스트
            company_size: 사업장 규모
            base_salary: 기본급
            total_gross: 총 지급액

        Returns:
            경고 메시지 리스트
        """
        warnings: List[Warning] = []

        warnings.extend(self._check_minimum_wage(hourly_wage))
        warnings.extend(self._check_weekly_hours(work_shifts, company_size))
        warnings.extend(self._check_overtime_ratio(base_salary, total_gross))

        return warnings

    def _check_minimum_wage(self, hourly_wage: Money) -> List[Warning]:
        """최저임금 미달 검사 (근로기준법 제6조, 최저임금법 제6조)"""
        warnings = []
        if hourly_wage.amount < MINIMUM_WAGE_HOURLY_2026:
            diff = MINIMUM_WAGE_HOURLY_2026 - hourly_wage.amount
            warnings.append(Warning(
                level="critical",
                message=f"최저임금 미달: 통상시급 {hourly_wage.format()}은 "
                        f"2026년 최저임금(시급 10,320원)에 미달합니다.",
                detail=f"시급 {int(diff)}원 부족. 최저임금법 위반으로 "
                       f"노동청 신고 대상이 될 수 있습니다. "
                       f"(3년 이하 징역 또는 2천만원 이하 벌금)",
            ))
        return warnings

    def _check_weekly_hours(
        self,
        work_shifts: List[WorkShift],
        company_size: CompanySize,
    ) -> List[Warning]:
        """주 52시간 위반 검사 (근로기준법 제53조)"""
        warnings = []
        if not work_shifts:
            return warnings

        # ISO 주 단위 그룹화
        weekly_groups: dict = {}
        for shift in work_shifts:
            week_key = shift.date.isocalendar()[1]
            if week_key not in weekly_groups:
                weekly_groups[week_key] = []
            weekly_groups[week_key].append(shift)

        for week_num, shifts in weekly_groups.items():
            total_minutes = sum(
                s.calculate_working_hours().to_minutes() for s in shifts
            )
            total_hours = Decimal(total_minutes) / Decimal('60')

            if total_hours > MAX_WEEKLY_HOURS:
                warnings.append(Warning(
                    level="critical",
                    message=f"주 52시간 초과: {week_num}주차 "
                            f"총 근로시간 {total_hours:.1f}시간",
                    detail="근로기준법 제53조 위반. 5인 이상 사업장은 "
                           "주 52시간(소정 40 + 연장 12) 초과 불가. "
                           "(2년 이하 징역 또는 2천만원 이하 벌금)",
                ))
            elif total_hours > REGULAR_WEEKLY_HOURS:
                overtime_hours = total_hours - REGULAR_WEEKLY_HOURS
                if overtime_hours > Decimal('12'):
                    warnings.append(Warning(
                        level="warning",
                        message=f"연장근로 과다: {week_num}주차 "
                                f"연장근로 {overtime_hours:.1f}시간 (한도 12시간)",
                        detail="주 12시간 초과 연장근로는 근로기준법 위반입니다.",
                    ))

        return warnings

    def _check_overtime_ratio(
        self,
        base_salary: Money,
        total_gross: Money,
    ) -> List[Warning]:
        """포괄임금제 오용 검사"""
        warnings = []
        if base_salary.amount <= 0 or total_gross.amount <= 0:
            return warnings

        overtime_portion = total_gross.amount - base_salary.amount
        if base_salary.amount > 0:
            ratio = overtime_portion / base_salary.amount
            if ratio > Decimal('0.5'):
                warnings.append(Warning(
                    level="info",
                    message="수당 비중 과다: 기본급 대비 수당이 50%를 초과합니다.",
                    detail="포괄임금제 적용 시 실제 연장근로시간을 "
                           "정확히 산정하고 있는지 확인하세요. "
                           "포괄임금제 오용은 임금체불로 인정될 수 있습니다.",
                ))

        return warnings
