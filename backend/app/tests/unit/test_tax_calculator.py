"""Tax Calculator 테스트"""
import pytest
from decimal import Decimal
from app.domain.services.tax_calculator import TaxCalculator, TaxResult
from app.domain.value_objects.money import Money


class TestTaxCalculatorBasic:
    """기본 소득세 계산 테스트"""

    def test_calculate_low_income(self):
        """저소득 (106만원 미만)"""
        calculator = TaxCalculator()
        result = calculator.calculate(Money(1000000), dependents_count=1)

        # 106만원 미만: 소득세 0
        assert result.income_tax.to_int() == 0
        assert result.local_income_tax.to_int() == 0
        assert result.total().is_zero()

    def test_calculate_normal_income_1_dependent(self):
        """일반 소득 (280만원, 부양가족 1명)"""
        calculator = TaxCalculator()
        result = calculator.calculate(Money(2800000), dependents_count=1)

        # 256~306만원 구간, 부양가족 1명: 49,090원
        assert result.income_tax.to_int() == 49090
        # 지방소득세: 49,090 × 10% = 4,909원
        assert result.local_income_tax.to_int() == 4909
        # 총 세금: 53,999원
        assert result.total().to_int() == 53999

    def test_calculate_normal_income_2_dependents(self):
        """일반 소득 (280만원, 부양가족 2명)"""
        calculator = TaxCalculator()
        result = calculator.calculate(Money(2800000), dependents_count=2)

        # 256~306만원 구간, 부양가족 2명: 38,170원
        assert result.income_tax.to_int() == 38170
        # 지방소득세: 38,170 × 10% = 3,817원
        assert result.local_income_tax.to_int() == 3817
        # 총 세금: 41,987원
        assert result.total().to_int() == 41987

    def test_calculate_high_income(self):
        """고소득 (700만원, 부양가족 1명)"""
        calculator = TaxCalculator()
        result = calculator.calculate(Money(7000000), dependents_count=1)

        # 606~706만원 구간, 부양가족 1명: 273,890원
        assert result.income_tax.to_int() == 273890
        # 지방소득세: 273,890 × 10% = 27,389원
        assert result.local_income_tax.to_int() == 27389

    def test_calculate_very_high_income(self):
        """초고소득 (1,500만원, 부양가족 1명)"""
        calculator = TaxCalculator()
        result = calculator.calculate(Money(15000000), dependents_count=1)

        # 1,000만원 이상: 643,090원
        assert result.income_tax.to_int() == 643090
        # 지방소득세: 643,090 × 10% = 64,309원
        assert result.local_income_tax.to_int() == 64309


class TestTaxCalculatorDependents:
    """부양가족 수에 따른 세금 테스트"""

    def test_dependents_1_to_5(self):
        """부양가족 1~5명 비교 (280만원)"""
        calculator = TaxCalculator()
        income = Money(2800000)

        # 부양가족 1명: 49,090원
        result1 = calculator.calculate(income, dependents_count=1)
        assert result1.income_tax.to_int() == 49090

        # 부양가족 2명: 38,170원
        result2 = calculator.calculate(income, dependents_count=2)
        assert result2.income_tax.to_int() == 38170

        # 부양가족 3명: 27,250원
        result3 = calculator.calculate(income, dependents_count=3)
        assert result3.income_tax.to_int() == 27250

        # 부양가족 4명: 16,330원
        result4 = calculator.calculate(income, dependents_count=4)
        assert result4.income_tax.to_int() == 16330

        # 부양가족 5명: 5,410원
        result5 = calculator.calculate(income, dependents_count=5)
        assert result5.income_tax.to_int() == 5410

        # 부양가족이 많을수록 세금 감소
        assert result1.income_tax > result2.income_tax > result3.income_tax

    def test_dependents_over_11(self):
        """부양가족 11명 초과 (최대값 적용)"""
        calculator = TaxCalculator()
        income = Money(2800000)

        result11 = calculator.calculate(income, dependents_count=11)
        result15 = calculator.calculate(income, dependents_count=15)

        # 11명 이상은 모두 11명으로 계산
        assert result11.income_tax == result15.income_tax


class TestTaxCalculatorChildren:
    """20세 이하 자녀 공제 테스트"""

    def test_children_under_20_deduction(self):
        """20세 이하 자녀 공제 효과"""
        calculator = TaxCalculator()
        income = Money(2800000)

        # 부양가족 2명 (자녀 없음)
        result_no_children = calculator.calculate(
            income,
            dependents_count=2,
            children_under_20=0
        )

        # 부양가족 2명 + 20세 이하 자녀 1명 (실효 3명)
        result_with_children = calculator.calculate(
            income,
            dependents_count=2,
            children_under_20=1
        )

        # 자녀 공제로 세금 감소
        assert result_with_children.income_tax < result_no_children.income_tax

        # 실효 부양가족 3명 세액과 동일
        result_3_dependents = calculator.calculate(income, dependents_count=3)
        assert result_with_children.income_tax == result_3_dependents.income_tax

    def test_multiple_children(self):
        """20세 이하 자녀 2명 공제"""
        calculator = TaxCalculator()
        income = Money(2800000)

        # 부양가족 1명 + 자녀 2명 (실효 3명)
        result = calculator.calculate(
            income,
            dependents_count=1,
            children_under_20=2
        )

        # 실효 부양가족 3명 세액과 동일
        result_3_dependents = calculator.calculate(income, dependents_count=3)
        assert result.income_tax == result_3_dependents.income_tax
        assert result.income_tax.to_int() == 27250


class TestTaxCalculatorIncomeBrackets:
    """소득 구간별 세액 테스트"""

    def test_income_bracket_106_151(self):
        """106~151만원 구간"""
        calculator = TaxCalculator()
        result = calculator.calculate(Money(1300000), dependents_count=1)
        assert result.income_tax.to_int() == 6880

    def test_income_bracket_151_206(self):
        """151~206만원 구간"""
        calculator = TaxCalculator()
        result = calculator.calculate(Money(1800000), dependents_count=1)
        assert result.income_tax.to_int() == 17490

    def test_income_bracket_206_256(self):
        """206~256만원 구간"""
        calculator = TaxCalculator()
        result = calculator.calculate(Money(2300000), dependents_count=1)
        assert result.income_tax.to_int() == 31290

    def test_income_bracket_boundary(self):
        """구간 경계값"""
        calculator = TaxCalculator()

        # 106만원 (경계)
        result1 = calculator.calculate(Money(1060000), dependents_count=1)
        assert result1.income_tax.to_int() == 6880

        # 105만9천원 (이전 구간)
        result2 = calculator.calculate(Money(1059000), dependents_count=1)
        assert result2.income_tax.to_int() == 0

        # 경계에서 세액 변경
        assert result1.income_tax > result2.income_tax


class TestTaxCalculatorLocalIncomeTax:
    """지방소득세 계산 테스트"""

    def test_local_income_tax_10_percent(self):
        """지방소득세는 소득세의 10%"""
        calculator = TaxCalculator()
        result = calculator.calculate(Money(2800000), dependents_count=2)

        # 소득세: 38,170원
        # 지방소득세: 3,817원 (38,170 × 10%)
        expected_local = int(result.income_tax.to_int() * 0.1)
        actual_local = result.local_income_tax.to_int()

        # 반올림 오차 허용
        assert abs(actual_local - expected_local) <= 1

    def test_local_income_tax_zero(self):
        """소득세가 0이면 지방소득세도 0"""
        calculator = TaxCalculator()
        result = calculator.calculate(Money(1000000), dependents_count=1)

        assert result.income_tax.is_zero()
        assert result.local_income_tax.is_zero()


class TestTaxResultMethods:
    """TaxResult 메서드 테스트"""

    def test_total(self):
        """총 세금 계산"""
        calculator = TaxCalculator()
        result = calculator.calculate(Money(2800000), dependents_count=2)

        total = result.income_tax.to_int() + result.local_income_tax.to_int()
        assert result.total().to_int() == total

    def test_to_dict(self):
        """딕셔너리 변환"""
        calculator = TaxCalculator()
        result = calculator.calculate(Money(2800000), dependents_count=2)

        result_dict = result.to_dict()

        assert "income_tax" in result_dict
        assert "local_income_tax" in result_dict
        assert "total" in result_dict
        assert result_dict["income_tax"]["amount"] == result.income_tax.to_int()
        assert result_dict["local_income_tax"]["amount"] == result.local_income_tax.to_int()
        assert result_dict["total"] == result.total().to_int()

    def test_to_dict_with_children(self):
        """딕셔너리 변환 (자녀 포함)"""
        calculator = TaxCalculator()
        result = calculator.calculate(
            Money(2800000),
            dependents_count=2,
            children_under_20=1
        )

        result_dict = result.to_dict()
        calculation = result_dict["income_tax"]["calculation"]

        assert "부양가족 2명" in calculation
        assert "20세 이하 자녀 1명" in calculation


class TestTaxCalculatorAnnualEstimate:
    """연간 소득세 추정 테스트"""

    def test_estimate_annual_tax(self):
        """연간 소득세 추정"""
        monthly_income = Money(2800000)
        annual_tax = TaxCalculator.estimate_annual_tax(monthly_income, dependents_count=2)

        # 월 세금 × 12
        calculator = TaxCalculator()
        monthly_tax = calculator.calculate(monthly_income, dependents_count=2)
        expected_annual = monthly_tax.total() * 12

        assert annual_tax == expected_annual

    def test_estimate_annual_tax_with_children(self):
        """연간 소득세 추정 (자녀 포함)"""
        monthly_income = Money(2800000)
        annual_tax = TaxCalculator.estimate_annual_tax(
            monthly_income,
            dependents_count=2,
            children_under_20=1
        )

        # 자녀 공제 적용된 세액 × 12
        calculator = TaxCalculator()
        monthly_tax = calculator.calculate(
            monthly_income,
            dependents_count=2,
            children_under_20=1
        )
        expected_annual = monthly_tax.total() * 12

        assert annual_tax == expected_annual


class TestTaxCalculatorEdgeCases:
    """예외 케이스 테스트"""

    def test_zero_income(self):
        """0원 소득"""
        calculator = TaxCalculator()
        result = calculator.calculate(Money.zero(), dependents_count=1)

        assert result.income_tax.is_zero()
        assert result.local_income_tax.is_zero()

    def test_zero_dependents(self):
        """부양가족 0명 (최소 1명으로 처리)"""
        calculator = TaxCalculator()
        result = calculator.calculate(Money(2800000), dependents_count=0)

        # 부양가족 0명은 1명으로 처리
        result_1_dependent = calculator.calculate(Money(2800000), dependents_count=1)
        assert result.income_tax == result_1_dependent.income_tax

    def test_exact_bracket_boundary(self):
        """정확한 구간 경계값"""
        calculator = TaxCalculator()

        # 1,060,000원 정확히 (새 구간 시작)
        result1 = calculator.calculate(Money(1060000), dependents_count=1)
        assert result1.income_tax.to_int() == 6880

        # 2,060,000원 정확히
        result2 = calculator.calculate(Money(2060000), dependents_count=1)
        assert result2.income_tax.to_int() == 31290


class TestTaxCalculatorRounding:
    """세금 반올림 테스트"""

    def test_rounding_precision(self):
        """원 단위 반올림 정확성"""
        calculator = TaxCalculator()
        result = calculator.calculate(Money(3456789), dependents_count=2)

        # 모든 세금이 정수여야 함
        assert isinstance(result.income_tax.to_int(), int)
        assert isinstance(result.local_income_tax.to_int(), int)
        assert isinstance(result.total().to_int(), int)
