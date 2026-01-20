"""Money Value Object 테스트"""
import pytest
from decimal import Decimal
from app.domain.value_objects.money import Money


class TestMoneyCreation:
    """Money 객체 생성 테스트"""

    def test_create_money_from_int(self):
        """정수로 Money 생성"""
        money = Money(100000)
        assert money.amount == Decimal('100000')
        assert money.currency == "KRW"

    def test_create_money_from_decimal(self):
        """Decimal로 Money 생성"""
        money = Money(Decimal('250000'))
        assert money.amount == Decimal('250000')

    def test_zero_money(self):
        """0원 생성"""
        money = Money.zero()
        assert money.amount == Decimal('0')
        assert money.is_zero()


class TestMoneyArithmetic:
    """Money 산술 연산 테스트"""

    def test_add_money(self):
        """금액 더하기"""
        money1 = Money(100000)
        money2 = Money(50000)
        result = money1 + money2
        assert result.amount == Decimal('150000')

    def test_subtract_money(self):
        """금액 빼기"""
        money1 = Money(100000)
        money2 = Money(50000)
        result = money1 - money2
        assert result.amount == Decimal('50000')

    def test_multiply_money(self):
        """금액 곱하기"""
        money = Money(100000)
        result = money * 1.5
        assert result.amount == Decimal('150000')

    def test_divide_money(self):
        """금액 나누기"""
        money = Money(100000)
        result = money / 4
        assert result.amount == Decimal('25000')

    def test_divide_by_zero(self):
        """0으로 나누기 오류"""
        money = Money(100000)
        with pytest.raises(ValueError, match="Cannot divide by zero"):
            money / 0

    def test_add_different_currency(self):
        """다른 통화 더하기 오류"""
        money1 = Money(100000, "KRW")
        money2 = Money(100, "USD")
        with pytest.raises(ValueError, match="Cannot add different currencies"):
            money1 + money2


class TestMoneyComparison:
    """Money 비교 연산 테스트"""

    def test_less_than(self):
        """작은지 비교"""
        money1 = Money(50000)
        money2 = Money(100000)
        assert money1 < money2
        assert not money2 < money1

    def test_greater_than(self):
        """큰지 비교"""
        money1 = Money(100000)
        money2 = Money(50000)
        assert money1 > money2
        assert not money2 > money1

    def test_equal(self):
        """같은지 비교"""
        money1 = Money(100000)
        money2 = Money(100000)
        assert money1.amount == money2.amount

    def test_compare_different_currency(self):
        """다른 통화 비교 오류"""
        money1 = Money(100000, "KRW")
        money2 = Money(100, "USD")
        with pytest.raises(ValueError, match="Cannot compare different currencies"):
            money1 < money2


class TestMoneyRounding:
    """Money 반올림 테스트"""

    def test_round_up(self):
        """올림 (0.5 이상)"""
        money = Money(Decimal("12345.67"))
        rounded = money.round_to_won()
        assert rounded.amount == Decimal('12346')

    def test_round_down(self):
        """내림 (0.5 미만)"""
        money = Money(Decimal("12345.34"))
        rounded = money.round_to_won()
        assert rounded.amount == Decimal('12345')

    def test_round_exact_half(self):
        """정확히 0.5 (반올림)"""
        money = Money(Decimal("12345.5"))
        rounded = money.round_to_won()
        assert rounded.amount == Decimal('12346')

    def test_to_int(self):
        """정수 변환"""
        money = Money(Decimal("12345.67"))
        assert money.to_int() == 12346


class TestMoneyFormatting:
    """Money 포맷팅 테스트"""

    def test_format_with_currency(self):
        """통화 단위 포함 포맷팅"""
        money = Money(2500000)
        assert money.format() == "2,500,000원"

    def test_format_without_currency(self):
        """통화 단위 미포함 포맷팅"""
        money = Money(2500000)
        assert money.format(with_currency=False) == "2,500,000"

    def test_format_zero(self):
        """0원 포맷팅"""
        money = Money.zero()
        assert money.format() == "0원"


class TestMoneyPredicates:
    """Money 상태 확인 테스트"""

    def test_is_zero(self):
        """0원 확인"""
        assert Money.zero().is_zero()
        assert not Money(100).is_zero()

    def test_is_positive(self):
        """양수 확인"""
        assert Money(100).is_positive()
        assert not Money.zero().is_positive()
        assert not Money(-100).is_positive()

    def test_is_negative(self):
        """음수 확인"""
        assert Money(-100).is_negative()
        assert not Money.zero().is_negative()
        assert not Money(100).is_negative()


class TestMoneyImmutability:
    """Money 불변성 테스트"""

    def test_immutable(self):
        """불변 객체 확인"""
        money = Money(100000)
        with pytest.raises(Exception):  # dataclass frozen=True
            money.amount = Decimal('200000')
