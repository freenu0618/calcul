"""Insurance Calculator - 4대 보험 계산 서비스

한국의 4대 보험(국민연금, 건강보험, 장기요양보험, 고용보험)을 계산합니다.
2026년 기준 요율 적용
"""
from dataclasses import dataclass
from decimal import Decimal

from ..value_objects import Money


@dataclass
class InsuranceResult:
    """보험료 계산 결과

    Attributes:
        national_pension: 국민연금 (4.5%, 근로자 부담분)
        health_insurance: 건강보험 (3.595%, 근로자 부담분)
        long_term_care: 장기요양보험 (건강보험료 × 12.95%)
        employment_insurance: 고용보험 (0.9%, 근로자 부담분)
        base_amount: 보험료 산정 기준 금액
    """
    national_pension: Money
    health_insurance: Money
    long_term_care: Money
    employment_insurance: Money
    base_amount: Money

    def total(self) -> Money:
        """총 보험료 (4대 보험 합계)

        Returns:
            총 보험료
        """
        return (
            self.national_pension +
            self.health_insurance +
            self.long_term_care +
            self.employment_insurance
        )

    def to_dict(self) -> dict:
        """딕셔너리로 변환 (API 응답용)

        Returns:
            보험료 상세 정보
        """
        return {
            "national_pension": {
                "amount": self.national_pension.to_int(),
                "rate": 0.045,
                "base": self.base_amount.to_int()
            },
            "health_insurance": {
                "amount": self.health_insurance.to_int(),
                "rate": 0.03595,
                "base": self.base_amount.to_int()
            },
            "long_term_care": {
                "amount": self.long_term_care.to_int(),
                "calculation": f"건강보험료 × 12.95%"
            },
            "employment_insurance": {
                "amount": self.employment_insurance.to_int(),
                "rate": 0.009,
                "base": self.base_amount.to_int()
            },
            "total": self.total().to_int()
        }


class InsuranceCalculator:
    """4대 보험 계산기

    2026년 기준:
    - 국민연금: 4.5% (상한 590만원, 하한 39만원)
    - 건강보험: 3.595%
    - 장기요양보험: 건강보험료 × 12.95%
    - 고용보험: 0.9% (상한 1350만원)
    """

    # 2026년 기준 요율
    NATIONAL_PENSION_RATE = Decimal('0.045')          # 4.5%
    HEALTH_INSURANCE_RATE = Decimal('0.03595')        # 3.595%
    LONG_TERM_CARE_RATE = Decimal('0.1295')           # 12.95%
    EMPLOYMENT_INSURANCE_RATE = Decimal('0.009')      # 0.9%

    # 국민연금 기준소득월액 상한/하한 (2026년)
    NATIONAL_PENSION_MAX = Money(Decimal('5900000'))  # 590만원
    NATIONAL_PENSION_MIN = Money(Decimal('390000'))   # 39만원

    # 고용보험 기준임금 상한 (2026년)
    EMPLOYMENT_INSURANCE_MAX = Money(Decimal('13500000'))  # 1350만원

    def calculate(self, gross_income: Money) -> InsuranceResult:
        """4대 보험료 계산

        Args:
            gross_income: 총 과세 대상 급여 (비과세 제외)

        Returns:
            보험료 계산 결과

        Examples:
            >>> calculator = InsuranceCalculator()
            >>> result = calculator.calculate(Money(2800000))
            >>> result.national_pension.to_int()
            126000  # 2,800,000 × 4.5%
            >>> result.total().to_int()
            264895  # 4대 보험 합계
        """
        # 1. 국민연금 (상한/하한 적용)
        pension_base = self._apply_national_pension_limits(gross_income)
        national_pension = (pension_base * self.NATIONAL_PENSION_RATE).round_to_won()

        # 2. 건강보험
        health_insurance = (gross_income * self.HEALTH_INSURANCE_RATE).round_to_won()

        # 3. 장기요양보험 (건강보험료 기준)
        long_term_care = (health_insurance * self.LONG_TERM_CARE_RATE).round_to_won()

        # 4. 고용보험 (상한 적용)
        employment_base = self._apply_employment_insurance_limit(gross_income)
        employment_insurance = (employment_base * self.EMPLOYMENT_INSURANCE_RATE).round_to_won()

        return InsuranceResult(
            national_pension=national_pension,
            health_insurance=health_insurance,
            long_term_care=long_term_care,
            employment_insurance=employment_insurance,
            base_amount=gross_income
        )

    def _apply_national_pension_limits(self, income: Money) -> Money:
        """국민연금 기준소득월액 상한/하한 적용

        Args:
            income: 소득

        Returns:
            상한/하한이 적용된 기준소득월액
        """
        if income > self.NATIONAL_PENSION_MAX:
            return self.NATIONAL_PENSION_MAX
        if income < self.NATIONAL_PENSION_MIN:
            return self.NATIONAL_PENSION_MIN
        return income

    def _apply_employment_insurance_limit(self, income: Money) -> Money:
        """고용보험 기준임금 상한 적용

        Args:
            income: 소득

        Returns:
            상한이 적용된 기준임금
        """
        if income > self.EMPLOYMENT_INSURANCE_MAX:
            return self.EMPLOYMENT_INSURANCE_MAX
        return income

    @classmethod
    def get_rates_info(cls, year: int = 2026) -> dict:
        """보험료율 정보 조회

        Args:
            year: 조회 연도 (기본 2026)

        Returns:
            보험료율 정보
        """
        if year != 2026:
            raise ValueError(f"Only 2026 rates are available, not {year}")

        return {
            "year": 2026,
            "national_pension": {
                "rate": float(cls.NATIONAL_PENSION_RATE),
                "max_base": cls.NATIONAL_PENSION_MAX.to_int(),
                "min_base": cls.NATIONAL_PENSION_MIN.to_int()
            },
            "health_insurance": {
                "rate": float(cls.HEALTH_INSURANCE_RATE)
            },
            "long_term_care": {
                "rate": float(cls.LONG_TERM_CARE_RATE),
                "calculation": "건강보험료 기준"
            },
            "employment_insurance": {
                "rate": float(cls.EMPLOYMENT_INSURANCE_RATE),
                "max_base": cls.EMPLOYMENT_INSURANCE_MAX.to_int()
            }
        }
