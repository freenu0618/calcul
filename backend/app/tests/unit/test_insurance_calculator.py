"""Insurance Calculator 테스트"""
import pytest
from decimal import Decimal
from app.domain.services.insurance_calculator import InsuranceCalculator, InsuranceResult
from app.domain.value_objects.money import Money


class TestInsuranceCalculatorBasic:
    """기본 보험료 계산 테스트"""

    def test_calculate_normal_income(self):
        """정상 소득 (280만원)"""
        calculator = InsuranceCalculator()
        result = calculator.calculate(Money(2800000))

        # 국민연금: 2,800,000 × 4.5% = 126,000
        assert result.national_pension.to_int() == 126000

        # 건강보험: 2,800,000 × 3.595% = 100,660
        assert result.health_insurance.to_int() == 100660

        # 장기요양: 100,660 × 12.95% = 13,035
        assert result.long_term_care.to_int() == 13035

        # 고용보험: 2,800,000 × 0.9% = 25,200
        assert result.employment_insurance.to_int() == 25200

        # 총합: 264,895
        assert result.total().to_int() == 264895

    def test_calculate_high_income(self):
        """고소득 (700만원, 국민연금 상한 적용)"""
        calculator = InsuranceCalculator()
        result = calculator.calculate(Money(7000000))

        # 국민연금: 5,900,000 × 4.5% = 265,500 (상한 적용)
        assert result.national_pension.to_int() == 265500

        # 건강보험: 7,000,000 × 3.595% = 251,650
        assert result.health_insurance.to_int() == 251650

        # 장기요양: 251,650 × 12.95% = 32,589
        assert result.long_term_care.to_int() == 32589

        # 고용보험: 7,000,000 × 0.9% = 63,000
        assert result.employment_insurance.to_int() == 63000

    def test_calculate_low_income(self):
        """저소득 (30만원, 국민연금 하한 적용)"""
        calculator = InsuranceCalculator()
        result = calculator.calculate(Money(300000))

        # 국민연금: 390,000 × 4.5% = 17,550 (하한 적용)
        assert result.national_pension.to_int() == 17550

        # 건강보험: 300,000 × 3.595% = 10,785
        assert result.health_insurance.to_int() == 10785

        # 장기요양: 10,785 × 12.95% = 1,397
        assert result.long_term_care.to_int() == 1397

        # 고용보험: 300,000 × 0.9% = 2,700
        assert result.employment_insurance.to_int() == 2700

    def test_calculate_very_high_income(self):
        """초고소득 (2000만원, 고용보험 상한 적용)"""
        calculator = InsuranceCalculator()
        result = calculator.calculate(Money(20000000))

        # 국민연금: 5,900,000 × 4.5% = 265,500 (상한)
        assert result.national_pension.to_int() == 265500

        # 건강보험: 20,000,000 × 3.595% = 719,000
        assert result.health_insurance.to_int() == 719000

        # 장기요양: 719,000 × 12.95% = 93,111
        assert result.long_term_care.to_int() == 93111

        # 고용보험: 13,500,000 × 0.9% = 121,500 (상한 적용)
        assert result.employment_insurance.to_int() == 121500


class TestNationalPensionLimits:
    """국민연금 상한/하한 테스트"""

    def test_national_pension_max_limit(self):
        """국민연금 상한 적용 (590만원)"""
        calculator = InsuranceCalculator()
        result = calculator.calculate(Money(10000000))

        # 590만원 × 4.5% = 265,500
        assert result.national_pension.to_int() == 265500

    def test_national_pension_min_limit(self):
        """국민연금 하한 적용 (39만원)"""
        calculator = InsuranceCalculator()
        result = calculator.calculate(Money(100000))

        # 39만원 × 4.5% = 17,550
        assert result.national_pension.to_int() == 17550

    def test_national_pension_within_limits(self):
        """국민연금 정상 범위 (상한/하한 미적용)"""
        calculator = InsuranceCalculator()
        result = calculator.calculate(Money(3000000))

        # 300만원 × 4.5% = 135,000
        assert result.national_pension.to_int() == 135000


class TestEmploymentInsuranceLimit:
    """고용보험 상한 테스트"""

    def test_employment_insurance_max_limit(self):
        """고용보험 상한 적용 (1350만원)"""
        calculator = InsuranceCalculator()
        result = calculator.calculate(Money(20000000))

        # 1350만원 × 0.9% = 121,500
        assert result.employment_insurance.to_int() == 121500

    def test_employment_insurance_within_limit(self):
        """고용보험 정상 범위 (상한 미적용)"""
        calculator = InsuranceCalculator()
        result = calculator.calculate(Money(5000000))

        # 500만원 × 0.9% = 45,000
        assert result.employment_insurance.to_int() == 45000


class TestLongTermCareCalculation:
    """장기요양보험 계산 테스트"""

    def test_long_term_care_based_on_health_insurance(self):
        """장기요양보험은 건강보험료 기준으로 계산"""
        calculator = InsuranceCalculator()
        result = calculator.calculate(Money(3000000))

        # 건강보험: 3,000,000 × 3.595% = 107,850
        health = result.health_insurance.to_int()

        # 장기요양: 107,850 × 12.95% = 13,967
        long_term = result.long_term_care.to_int()

        # 검증: long_term ≈ health × 0.1295
        expected = int(health * 0.1295)
        assert abs(long_term - expected) <= 1  # 반올림 오차 허용


class TestInsuranceResultMethods:
    """InsuranceResult 메서드 테스트"""

    def test_total_insurance(self):
        """총 보험료 계산"""
        calculator = InsuranceCalculator()
        result = calculator.calculate(Money(2500000))

        total = (
            result.national_pension.to_int() +
            result.health_insurance.to_int() +
            result.long_term_care.to_int() +
            result.employment_insurance.to_int()
        )

        assert result.total().to_int() == total

    def test_to_dict(self):
        """딕셔너리 변환"""
        calculator = InsuranceCalculator()
        result = calculator.calculate(Money(2500000))

        result_dict = result.to_dict()

        assert "national_pension" in result_dict
        assert "health_insurance" in result_dict
        assert "long_term_care" in result_dict
        assert "employment_insurance" in result_dict
        assert "total" in result_dict

        assert result_dict["national_pension"]["rate"] == 0.045
        assert result_dict["health_insurance"]["rate"] == 0.03595
        assert result_dict["employment_insurance"]["rate"] == 0.009
        assert result_dict["total"] == result.total().to_int()


class TestInsuranceRatesInfo:
    """보험료율 정보 조회 테스트"""

    def test_get_rates_info_2026(self):
        """2026년 보험료율 정보"""
        rates = InsuranceCalculator.get_rates_info(2026)

        assert rates["year"] == 2026
        assert rates["national_pension"]["rate"] == 0.045
        assert rates["national_pension"]["max_base"] == 5900000
        assert rates["national_pension"]["min_base"] == 390000
        assert rates["health_insurance"]["rate"] == 0.03595
        assert rates["long_term_care"]["rate"] == 0.1295
        assert rates["employment_insurance"]["rate"] == 0.009
        assert rates["employment_insurance"]["max_base"] == 13500000

    def test_get_rates_info_invalid_year(self):
        """잘못된 연도 조회 오류"""
        with pytest.raises(ValueError, match="Only 2026 rates are available"):
            InsuranceCalculator.get_rates_info(2025)


class TestInsuranceEdgeCases:
    """보험료 계산 예외 케이스"""

    def test_zero_income(self):
        """0원 소득"""
        calculator = InsuranceCalculator()
        result = calculator.calculate(Money.zero())

        # 국민연금은 하한 적용: 39만원 × 4.5% = 17,550
        assert result.national_pension.to_int() == 17550

        # 나머지는 0
        assert result.health_insurance.to_int() == 0
        assert result.long_term_care.to_int() == 0
        assert result.employment_insurance.to_int() == 0

    def test_exact_pension_max(self):
        """국민연금 정확히 상한선 (590만원)"""
        calculator = InsuranceCalculator()
        result = calculator.calculate(Money(5900000))

        # 590만원 × 4.5% = 265,500
        assert result.national_pension.to_int() == 265500

    def test_exact_pension_min(self):
        """국민연금 정확히 하한선 (39만원)"""
        calculator = InsuranceCalculator()
        result = calculator.calculate(Money(390000))

        # 39만원 × 4.5% = 17,550
        assert result.national_pension.to_int() == 17550

    def test_exact_employment_max(self):
        """고용보험 정확히 상한선 (1350만원)"""
        calculator = InsuranceCalculator()
        result = calculator.calculate(Money(13500000))

        # 1350만원 × 0.9% = 121,500
        assert result.employment_insurance.to_int() == 121500


class TestInsuranceRounding:
    """보험료 반올림 테스트"""

    def test_rounding_precision(self):
        """원 단위 반올림 정확성"""
        calculator = InsuranceCalculator()

        # 특정 금액으로 소수점 발생 확인
        result = calculator.calculate(Money(2345678))

        # 모든 보험료가 정수여야 함
        assert isinstance(result.national_pension.to_int(), int)
        assert isinstance(result.health_insurance.to_int(), int)
        assert isinstance(result.long_term_care.to_int(), int)
        assert isinstance(result.employment_insurance.to_int(), int)
