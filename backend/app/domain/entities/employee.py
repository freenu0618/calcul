"""Employee Entity - 근로자 엔티티

근로자의 기본 정보와 고용 형태를 관리합니다.
"""
from dataclasses import dataclass
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4


class EmploymentType(str, Enum):
    """고용 형태"""
    FULL_TIME = "FULL_TIME"  # 정규직
    PART_TIME = "PART_TIME"  # 파트타임
    CONTRACT = "CONTRACT"    # 계약직


class CompanySize(str, Enum):
    """사업장 규모 (5인 기준)

    5인 이상 사업장과 5인 미만 사업장은 근로기준법 적용이 다릅니다.
    - 5인 이상: 휴일근로 8시간 초과 시 가산율 2.0 적용
    - 5인 미만: 휴일근로 8시간 초과 시에도 가산율 1.5 적용
    """
    UNDER_5 = "UNDER_5"  # 5인 미만
    OVER_5 = "OVER_5"    # 5인 이상


@dataclass
class Employee:
    """근로자 엔티티

    Attributes:
        id: 고유 식별자
        name: 이름
        dependents_count: 부양가족 수 (본인 포함, 소득세 계산에 사용)
        children_under_20: 20세 이하 자녀 수 (소득세 추가 공제)
        employment_type: 고용 형태
        company_size: 사업장 규모
        scheduled_work_days: 주 소정근로일 (계약상 주당 근무일 수)

    Examples:
        >>> employee = Employee(
        ...     name="홍길동",
        ...     dependents_count=2,
        ...     children_under_20=1,
        ...     employment_type=EmploymentType.FULL_TIME,
        ...     company_size=CompanySize.OVER_5,
        ...     scheduled_work_days=5
        ... )
    """

    name: str
    dependents_count: int
    children_under_20: int
    employment_type: EmploymentType
    company_size: CompanySize
    scheduled_work_days: int = 5  # 주 소정근로일 (기본 5일)
    id: Optional[UUID] = None

    def __post_init__(self):
        """초기화 후 처리"""
        if self.id is None:
            object.__setattr__(self, 'id', uuid4())

        # 검증
        if self.dependents_count < 0:
            raise ValueError(f"Dependents count cannot be negative: {self.dependents_count}")
        if self.children_under_20 < 0:
            raise ValueError(f"Children under 20 cannot be negative: {self.children_under_20}")
        if self.children_under_20 > self.dependents_count:
            raise ValueError(
                f"Children under 20 ({self.children_under_20}) cannot exceed "
                f"dependents count ({self.dependents_count})"
            )

    def is_full_time(self) -> bool:
        """정규직 여부

        Returns:
            정규직이면 True
        """
        return self.employment_type == EmploymentType.FULL_TIME

    def is_part_time(self) -> bool:
        """파트타임 여부

        Returns:
            파트타임이면 True
        """
        return self.employment_type == EmploymentType.PART_TIME

    def is_large_company(self) -> bool:
        """5인 이상 사업장 여부

        Returns:
            5인 이상이면 True
        """
        return self.company_size == CompanySize.OVER_5

    def is_small_company(self) -> bool:
        """5인 미만 사업장 여부

        Returns:
            5인 미만이면 True
        """
        return self.company_size == CompanySize.UNDER_5
