"""Money Value Object - 금액을 나타내는 불변 값 객체

한국 근로기준법에 따라 모든 금액은 원 단위로 반올림하여 계산합니다.
"""
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Union


@dataclass(frozen=True)
class Money:
    """금액 값 객체

    Attributes:
        amount: 금액 (Decimal 타입으로 정확한 계산 보장)
        currency: 통화 (기본값: KRW)

    Examples:
        >>> salary = Money(2500000)
        >>> bonus = Money(500000)
        >>> total = salary + bonus
        >>> total.amount
        Decimal('3000000')
    """

    amount: Decimal
    currency: str = "KRW"

    def __post_init__(self):
        """초기화 후 검증"""
        # amount를 Decimal로 변환
        if not isinstance(self.amount, Decimal):
            object.__setattr__(self, 'amount', Decimal(str(self.amount)))

    def __add__(self, other: 'Money') -> 'Money':
        """금액 더하기

        Args:
            other: 더할 금액

        Returns:
            더한 결과 금액

        Raises:
            ValueError: 통화가 다른 경우
        """
        if self.currency != other.currency:
            raise ValueError(f"Cannot add different currencies: {self.currency} and {other.currency}")
        return Money(self.amount + other.amount, self.currency)

    def __sub__(self, other: 'Money') -> 'Money':
        """금액 빼기

        Args:
            other: 뺄 금액

        Returns:
            뺀 결과 금액

        Raises:
            ValueError: 통화가 다른 경우
        """
        if self.currency != other.currency:
            raise ValueError(f"Cannot subtract different currencies: {self.currency} and {other.currency}")
        return Money(self.amount - other.amount, self.currency)

    def __mul__(self, multiplier: Union[int, float, Decimal]) -> 'Money':
        """금액 곱하기

        Args:
            multiplier: 곱할 값 (배율, 시간 등)

        Returns:
            곱한 결과 금액
        """
        if not isinstance(multiplier, Decimal):
            multiplier = Decimal(str(multiplier))
        return Money(self.amount * multiplier, self.currency)

    def __truediv__(self, divisor: Union[int, float, Decimal]) -> 'Money':
        """금액 나누기

        Args:
            divisor: 나눌 값

        Returns:
            나눈 결과 금액

        Raises:
            ValueError: 0으로 나누는 경우
        """
        if divisor == 0:
            raise ValueError("Cannot divide by zero")

        if not isinstance(divisor, Decimal):
            divisor = Decimal(str(divisor))
        return Money(self.amount / divisor, self.currency)

    def __lt__(self, other: 'Money') -> bool:
        """작은지 비교"""
        self._check_currency(other)
        return self.amount < other.amount

    def __le__(self, other: 'Money') -> bool:
        """작거나 같은지 비교"""
        self._check_currency(other)
        return self.amount <= other.amount

    def __gt__(self, other: 'Money') -> bool:
        """큰지 비교"""
        self._check_currency(other)
        return self.amount > other.amount

    def __ge__(self, other: 'Money') -> bool:
        """크거나 같은지 비교"""
        self._check_currency(other)
        return self.amount >= other.amount

    def _check_currency(self, other: 'Money'):
        """통화 일치 확인"""
        if self.currency != other.currency:
            raise ValueError(f"Cannot compare different currencies: {self.currency} and {other.currency}")

    def round_to_won(self) -> 'Money':
        """원 단위로 반올림

        한국 근로기준법에 따라 0.5원 이상은 올림, 미만은 내림

        Returns:
            원 단위로 반올림된 금액

        Examples:
            >>> Money(Decimal("12345.67")).round_to_won()
            Money(amount=Decimal('12346'), currency='KRW')
        """
        rounded_amount = self.amount.quantize(Decimal('1'), rounding=ROUND_HALF_UP)
        return Money(rounded_amount, self.currency)

    def to_int(self) -> int:
        """정수형으로 변환 (원 단위 반올림)

        Returns:
            원 단위 정수
        """
        return int(self.round_to_won().amount)

    def format(self, with_currency: bool = True) -> str:
        """금액을 포맷팅 (천 단위 콤마)

        Args:
            with_currency: 통화 단위 포함 여부

        Returns:
            포맷팅된 문자열

        Examples:
            >>> Money(2500000).format()
            '2,500,000원'
            >>> Money(2500000).format(with_currency=False)
            '2,500,000'
        """
        amount_str = f"{self.to_int():,}"
        if with_currency and self.currency == "KRW":
            return f"{amount_str}원"
        return amount_str

    @classmethod
    def zero(cls) -> 'Money':
        """0원 생성

        Returns:
            0원 Money 객체
        """
        return cls(Decimal('0'))

    def is_zero(self) -> bool:
        """0원인지 확인

        Returns:
            0원이면 True
        """
        return self.amount == Decimal('0')

    def is_positive(self) -> bool:
        """양수인지 확인

        Returns:
            양수이면 True
        """
        return self.amount > Decimal('0')

    def is_negative(self) -> bool:
        """음수인지 확인

        Returns:
            음수이면 True
        """
        return self.amount < Decimal('0')
