"""Allowance Entity - 수당 엔티티

급여에 포함되는 각종 수당을 관리합니다.
"""
from dataclasses import dataclass
from typing import Optional
from uuid import UUID, uuid4

from ..value_objects import Money


@dataclass
class Allowance:
    """수당 엔티티

    Attributes:
        name: 수당 이름 (예: "직책수당", "식대", "교통비")
        amount: 수당 금액
        is_taxable: 과세 대상 여부 (True: 과세, False: 비과세)
        is_includable_in_minimum_wage: 최저임금 산입 여부
        is_fixed: 고정 수당 여부 (True: 매월 고정, False: 변동)
        is_included_in_regular_wage: 통상임금 포함 여부
        id: 고유 식별자

    Examples:
        >>> # 직책수당: 과세, 최저임금 산입, 고정, 통상임금 포함
        >>> position_allowance = Allowance(
        ...     name="직책수당",
        ...     amount=Money(300000),
        ...     is_taxable=True,
        ...     is_includable_in_minimum_wage=True,
        ...     is_fixed=True,
        ...     is_included_in_regular_wage=True
        ... )

        >>> # 식대: 비과세(20만원 한도), 최저임금 비산입, 고정, 통상임금 제외
        >>> meal_allowance = Allowance(
        ...     name="식대",
        ...     amount=Money(200000),
        ...     is_taxable=False,
        ...     is_includable_in_minimum_wage=False,
        ...     is_fixed=True,
        ...     is_included_in_regular_wage=False
        ... )

        >>> # 연장수당: 과세, 최저임금 비산입(가산분), 변동, 통상임금 제외
        >>> overtime_allowance = Allowance(
        ...     name="연장근로수당",
        ...     amount=Money(180000),
        ...     is_taxable=True,
        ...     is_includable_in_minimum_wage=False,
        ...     is_fixed=False,
        ...     is_included_in_regular_wage=False
        ... )
    """

    name: str
    amount: Money
    is_taxable: bool
    is_includable_in_minimum_wage: bool
    is_fixed: bool = True
    is_included_in_regular_wage: bool = True
    id: Optional[UUID] = None

    def __post_init__(self):
        """초기화 후 처리"""
        if self.id is None:
            object.__setattr__(self, 'id', uuid4())

        # 검증
        if not self.name or not self.name.strip():
            raise ValueError("Allowance name cannot be empty")
        if self.amount.is_negative():
            raise ValueError(f"Allowance amount cannot be negative: {self.amount.amount}")

    def is_regular_wage(self) -> bool:
        """통상임금 포함 여부

        통상임금: 근로자에게 정기적·일률적으로 지급되는 임금
        - 포함: 기본급, 직책수당, 근속수당 등
        - 제외: 식대(비과세), 연장·야간·휴일 가산분, 실비변상 등

        Returns:
            통상임금에 포함되면 True
        """
        return self.is_included_in_regular_wage

    def is_non_taxable(self) -> bool:
        """비과세 여부

        비과세 한도:
        - 식대: 월 20만원
        - 출산/보육수당: 월 10만원
        - 실비변상 경비

        Returns:
            비과세이면 True
        """
        return not self.is_taxable

    @classmethod
    def create_meal_allowance(cls, amount: Money) -> 'Allowance':
        """식대 수당 생성 (비과세 20만원 한도)

        Args:
            amount: 식대 금액 (20만원 초과 시 초과분은 과세)

        Returns:
            식대 수당 객체
        """
        return cls(
            name="식대",
            amount=amount,
            is_taxable=False,
            is_includable_in_minimum_wage=False,
            is_fixed=True,
            is_included_in_regular_wage=False
        )

    @classmethod
    def create_position_allowance(cls, amount: Money) -> 'Allowance':
        """직책수당 생성 (과세, 통상임금 포함)

        Args:
            amount: 직책수당 금액

        Returns:
            직책수당 객체
        """
        return cls(
            name="직책수당",
            amount=amount,
            is_taxable=True,
            is_includable_in_minimum_wage=True,
            is_fixed=True,
            is_included_in_regular_wage=True
        )

    @classmethod
    def create_overtime_allowance(cls, amount: Money) -> 'Allowance':
        """연장근로수당 생성 (과세, 최저임금 비산입, 변동, 통상임금 제외)

        Args:
            amount: 연장근로수당 금액

        Returns:
            연장근로수당 객체
        """
        return cls(
            name="연장근로수당",
            amount=amount,
            is_taxable=True,
            is_includable_in_minimum_wage=False,
            is_fixed=False,
            is_included_in_regular_wage=False
        )
