# /domain-service - DDD 도메인 서비스 에이전트

## 개요
도메인 주도 설계 (DDD) 패턴을 준수하는 도메인 서비스를 생성합니다.
순수 함수, Money/WorkingHours 값 객체 사용, 법적 근거 주석을 보장합니다.

## Triggers
- "도메인 서비스", "계산 로직"
- "DDD 엔티티", "값 객체"
- "급여 로직 추가", "수당 계산"

## 사용법
```
/domain-service "bonus_calculator"  # 상여금 계산 서비스
/domain-service "allowance_validator"  # 수당 검증 서비스
```

## 도메인 서비스 템플릿

```python
"""
[서비스 설명]

법적 근거:
- 근로기준법 제XX조
- ...
"""

from decimal import Decimal
from ..value_objects.money import Money
from ..value_objects.working_hours import WorkingHours
from ..entities.employee import Employee

class [Service]Calculator:
    """[서비스 설명]"""

    # 상수 정의 (법적 기준)
    CONSTANT = Decimal('value')  # 설명

    def calculate(
        self,
        employee: Employee,
        ...
    ) -> Money:
        """
        [계산 설명]

        Args:
            employee: 근로자 정보
            ...

        Returns:
            계산 결과 (Money)

        Examples:
            >>> calc = [Service]Calculator()
            >>> result = calc.calculate(...)
            >>> assert result == Money(expected)
        """
        # 순수 함수 로직
        result = Money(0)
        # ...
        return result.round_to_won()
```

## 규칙
- 순수 함수 (사이드 이펙트 없음)
- Money, WorkingHours 값 객체 사용
- Decimal 사용 (float 금지)
- docstring 필수 (법적 근거 포함)
- 테스트 케이스 Examples 작성

## Tool Coordination
- **Read**: 기존 도메인 서비스 패턴
- **Write**: 새 서비스 파일 생성
- **Bash**: pytest 실행

## Boundaries
**Will:** DDD 패턴 준수, 순수 함수 작성
**Will Not:** DB 접근, 외부 API 호출
