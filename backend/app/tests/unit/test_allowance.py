"""Allowance Entity 테스트"""
import pytest
from app.domain.entities.allowance import Allowance
from app.domain.value_objects.money import Money


class TestAllowanceCreation:
    """Allowance 객체 생성 테스트"""

    def test_create_allowance(self):
        """정상 생성"""
        allowance = Allowance(
            name="직책수당",
            amount=Money(300000),
            is_taxable=True,
            is_includable_in_minimum_wage=True,
            is_fixed=True,
            is_included_in_regular_wage=True
        )
        assert allowance.name == "직책수당"
        assert allowance.amount.to_int() == 300000
        assert allowance.is_taxable
        assert allowance.is_includable_in_minimum_wage
        assert allowance.is_fixed
        assert allowance.is_included_in_regular_wage
        assert allowance.id is not None

    def test_empty_name(self):
        """빈 이름 오류"""
        with pytest.raises(ValueError, match="Allowance name cannot be empty"):
            Allowance(
                name="",
                amount=Money(100000),
                is_taxable=True,
                is_includable_in_minimum_wage=True
            )

    def test_whitespace_name(self):
        """공백 이름 오류"""
        with pytest.raises(ValueError, match="Allowance name cannot be empty"):
            Allowance(
                name="   ",
                amount=Money(100000),
                is_taxable=True,
                is_includable_in_minimum_wage=True
            )

    def test_negative_amount(self):
        """음수 금액 오류"""
        with pytest.raises(ValueError, match="Allowance amount cannot be negative"):
            Allowance(
                name="수당",
                amount=Money(-100000),
                is_taxable=True,
                is_includable_in_minimum_wage=True
            )


class TestAllowancePredicates:
    """Allowance 상태 확인 테스트"""

    def test_is_regular_wage(self):
        """통상임금 포함 여부"""
        allowance1 = Allowance(
            name="직책수당",
            amount=Money(300000),
            is_taxable=True,
            is_includable_in_minimum_wage=True,
            is_fixed=True,
            is_included_in_regular_wage=True
        )
        allowance2 = Allowance(
            name="식대",
            amount=Money(200000),
            is_taxable=False,
            is_includable_in_minimum_wage=False,
            is_fixed=True,
            is_included_in_regular_wage=False
        )
        assert allowance1.is_regular_wage()
        assert not allowance2.is_regular_wage()

    def test_is_non_taxable(self):
        """비과세 여부"""
        allowance1 = Allowance(
            name="식대",
            amount=Money(200000),
            is_taxable=False,
            is_includable_in_minimum_wage=False
        )
        allowance2 = Allowance(
            name="직책수당",
            amount=Money(300000),
            is_taxable=True,
            is_includable_in_minimum_wage=True
        )
        assert allowance1.is_non_taxable()
        assert not allowance2.is_non_taxable()


class TestAllowanceFactoryMethods:
    """Allowance 팩토리 메서드 테스트"""

    def test_create_meal_allowance(self):
        """식대 수당 생성"""
        allowance = Allowance.create_meal_allowance(Money(200000))
        assert allowance.name == "식대"
        assert allowance.amount.to_int() == 200000
        assert not allowance.is_taxable
        assert not allowance.is_includable_in_minimum_wage
        assert allowance.is_fixed
        assert not allowance.is_included_in_regular_wage
        assert allowance.is_non_taxable()
        assert not allowance.is_regular_wage()

    def test_create_position_allowance(self):
        """직책수당 생성"""
        allowance = Allowance.create_position_allowance(Money(300000))
        assert allowance.name == "직책수당"
        assert allowance.amount.to_int() == 300000
        assert allowance.is_taxable
        assert allowance.is_includable_in_minimum_wage
        assert allowance.is_fixed
        assert allowance.is_included_in_regular_wage
        assert not allowance.is_non_taxable()
        assert allowance.is_regular_wage()

    def test_create_overtime_allowance(self):
        """연장근로수당 생성"""
        allowance = Allowance.create_overtime_allowance(Money(180000))
        assert allowance.name == "연장근로수당"
        assert allowance.amount.to_int() == 180000
        assert allowance.is_taxable
        assert not allowance.is_includable_in_minimum_wage
        assert not allowance.is_fixed
        assert not allowance.is_included_in_regular_wage
        assert not allowance.is_non_taxable()
        assert not allowance.is_regular_wage()


class TestAllowanceClassification:
    """수당 분류 시나리오 테스트"""

    def test_typical_allowances_classification(self):
        """일반적인 수당 분류"""
        # 1. 직책수당: 과세, 최저임금 산입, 고정, 통상임금 포함
        position = Allowance.create_position_allowance(Money(300000))
        assert position.is_taxable
        assert position.is_includable_in_minimum_wage
        assert position.is_fixed
        assert position.is_regular_wage()

        # 2. 식대: 비과세(20만원 한도), 최저임금 비산입, 고정, 통상임금 제외
        meal = Allowance.create_meal_allowance(Money(200000))
        assert not meal.is_taxable
        assert not meal.is_includable_in_minimum_wage
        assert meal.is_fixed
        assert not meal.is_regular_wage()

        # 3. 연장수당: 과세, 최저임금 비산입(가산분), 변동, 통상임금 제외
        overtime = Allowance.create_overtime_allowance(Money(180000))
        assert overtime.is_taxable
        assert not overtime.is_includable_in_minimum_wage
        assert not overtime.is_fixed
        assert not overtime.is_regular_wage()
