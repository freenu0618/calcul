# /salary-test - 급여 시나리오 테스트 에이전트

## 개요
다양한 근무 형태와 시나리오에 대한 급여 계산 테스트를 자동으로 생성하고 실행합니다.
풀타임, 파트타임, 야간근무, 휴일근무, 5인 미만 사업장 등 모든 케이스를 커버합니다.

## Triggers
- "급여 시나리오", "테스트 추가"
- "최저임금 검증", "파트타임 테스트"
- "야간근무 케이스", "휴일근무 테스트"
- "테스트 커버리지", "시나리오 검증"

## 사용법
```
/salary-test [시나리오]
/salary-test fulltime          # 풀타임 기본 시나리오
/salary-test parttime          # 파트타임 시나리오
/salary-test night-work        # 야간근무 시나리오
/salary-test holiday           # 휴일근무 시나리오
/salary-test minimum-wage      # 최저임금 검증
/salary-test --all             # 모든 시나리오 실행
/salary-test --coverage        # 커버리지 리포트 생성
```

## Behavioral Flow

### 1. Understand - 시나리오 이해
- 사용자 요청 분석
  - 근무 형태 (풀타임/파트타임)
  - 특수 조건 (야간/휴일/연장)
  - 사업장 규모 (5인 이상/미만)
- 기존 테스트 패턴 확인
  - `backend/app/tests/unit/test_salary_calculator.py`
  - `backend/app/tests/unit/test_overtime_calculator.py`

### 2. Design - 테스트 케이스 설계
- Given-When-Then 패턴 사용
- 기대값 계산 (수동 검증)
- 경계값 테스트 포함
- 법적 요구사항 검증

### 3. Generate - 테스트 코드 생성
- pytest 스타일 테스트 작성
- Money, WorkingHours 값 객체 사용
- 명확한 테스트 이름
- 상세한 주석 및 docstring

### 4. Execute - 테스트 실행
- pytest 실행
- 실패 시 원인 분석
- 디버깅 정보 수집

### 5. Report - 결과 보고
- 테스트 통과/실패 요약
- 커버리지 리포트
- 추가 테스트 권장사항

## Tool Coordination
- **Read**: 기존 테스트 코드 패턴 분석
- **Write**: 새 테스트 케이스 작성
- **Bash**: pytest 실행 및 커버리지 생성
- **TodoWrite**: 테스트 진행 상황 추적
- **Grep**: 테스트 관련 파일 검색

## 시나리오 템플릿

### Template 1: 풀타임 기본 (주 5일)
```python
def test_fulltime_basic():
    """
    Given: 풀타임 근로자, 기본급 280만원, 주 5일 근무
    When: 급여 계산
    Then: 통상시급 16,092원, 주휴수당 559,184원
    """
    employee = Employee(
        name="풀타임",
        dependents_count=1,
        employment_type=EmploymentType.FULL_TIME,
        company_size=CompanySize.OVER_5
    )

    base_salary = Money(2_800_000)

    # 1월 전체 주 5일 근무 (월~금)
    shifts = generate_shifts(
        start_date=date(2026, 1, 1),
        end_date=date(2026, 1, 31),
        work_days=[0, 1, 2, 3, 4],  # 월~금
        start_time=time(9, 0),
        end_time=time(18, 0),
        break_minutes=60
    )

    result = calculator.calculate(employee, base_salary, [], shifts)

    # 검증
    assert result.hourly_wage == Money(16_092)  # 2,800,000 ÷ 174
    assert result.weekly_holiday_pay == Money(559_184)  # 16,092 × 8 × 4.345
```

### Template 2: 파트타임 (주 3일, 24시간)
```python
def test_parttime_24_hours():
    """
    Given: 파트타임 근로자, 주 3일 (월/수/금), 각 8시간
    When: 급여 계산
    Then: 주휴수당 비례 지급 (60% = 24h/40h)
    """
    employee = Employee(
        name="파트타임",
        dependents_count=0,
        employment_type=EmploymentType.PART_TIME,
        company_size=CompanySize.OVER_5,
        scheduled_work_days=3  # 자동 감지도 가능
    )

    # 주 3일 근무 패턴
    shifts = generate_shifts(
        start_date=date(2026, 1, 1),
        end_date=date(2026, 1, 31),
        work_days=[0, 2, 4],  # 월/수/금
        start_time=time(9, 0),
        end_time=time(17, 0),
        break_minutes=0
    )

    result = calculator.calculate(employee, Money(0), [], shifts)

    # 검증
    assert result.weekly_holiday_result.is_proportional == True
    assert result.weekly_holiday_pay > Money(0)  # 비례 지급
```

### Template 3: 야간근무 (22:00~06:00)
```python
def test_night_work():
    """
    Given: 야간조 근로자 (22:00~07:00, 휴게 60분)
    When: 급여 계산
    Then: 야간 가산수당 0.5배 × 8시간
    """
    employee = Employee(
        name="야간조",
        dependents_count=0,
        employment_type=EmploymentType.FULL_TIME,
        company_size=CompanySize.OVER_5
    )

    base_salary = Money(2_800_000)

    # 주 5일 야간근무
    shifts = generate_shifts(
        start_date=date(2026, 1, 6),  # 월요일
        end_date=date(2026, 1, 10),   # 금요일
        work_days=[0, 1, 2, 3, 4],
        start_time=time(22, 0),
        end_time=time(7, 0),  # 다음날 7시
        break_minutes=60
    )

    result = calculator.calculate(employee, base_salary, [], shifts)

    # 검증
    hourly_wage = Money(16_092)
    expected_night_pay = hourly_wage * Decimal('0.5') * 8 * 5  # 5일
    assert result.night_work_pay.round_to_won() == expected_night_pay.round_to_won()
```

### Template 4: 연장근무 (주 50시간)
```python
def test_overtime_10_hours():
    """
    Given: 주 50시간 근무 (40시간 + 연장 10시간)
    When: 급여 계산
    Then: 연장수당 = 통상시급 × 1.5배 × 10시간
    """
    employee = Employee(
        name="연장근무",
        dependents_count=0,
        employment_type=EmploymentType.FULL_TIME,
        company_size=CompanySize.OVER_5
    )

    base_salary = Money(2_800_000)

    # 월~금 하루 10시간 (9시간 + 1시간 휴게 + 2시간 연장)
    shifts = generate_shifts(
        start_date=date(2026, 1, 6),
        end_date=date(2026, 1, 10),
        work_days=[0, 1, 2, 3, 4],
        start_time=time(9, 0),
        end_time=time(20, 0),  # 9시간 근무 + 1시간 휴게 + 2시간 연장
        break_minutes=60
    )

    result = calculator.calculate(employee, base_salary, [], shifts)

    # 검증
    hourly_wage = Money(16_092)
    expected_overtime = hourly_wage * Decimal('1.5') * 10
    assert result.overtime_pay == expected_overtime  # 241,380원
```

### Template 5: 휴일근무 (일요일)
```python
def test_holiday_work():
    """
    Given: 일요일 8시간 근무
    When: 급여 계산
    Then: 휴일수당 = 통상시급 × 1.5배 × 8시간
    """
    employee = Employee(
        name="휴일근무",
        dependents_count=0,
        employment_type=EmploymentType.FULL_TIME,
        company_size=CompanySize.OVER_5
    )

    base_salary = Money(2_800_000)

    # 일요일 근무
    shifts = [
        WorkShift(
            date=date(2026, 1, 12),  # 일요일
            start_time=time(9, 0),
            end_time=time(18, 0),
            break_minutes=60,
            is_holiday_work=True
        )
    ]

    result = calculator.calculate(employee, base_salary, [], shifts)

    # 검증
    hourly_wage = Money(16_092)
    expected_holiday = hourly_wage * Decimal('1.5') * 8
    assert result.holiday_work_pay == expected_holiday  # 193,104원
```

### Template 6: 최저임금 검증 (2026년)
```python
def test_minimum_wage_2026():
    """
    Given: 최저임금 기본급 (209시간 × 12,720원 = 2,658,480원)
    When: 급여 계산
    Then: 통상시급 = 2,658,480 ÷ 174 = 15,278원
    """
    employee = Employee(
        name="최저임금",
        dependents_count=0,
        employment_type=EmploymentType.FULL_TIME,
        company_size=CompanySize.OVER_5
    )

    # 2026년 최저임금 (주휴 포함)
    minimum_wage_monthly = Money(12_720 * 209)  # 2,658,480원

    result = calculator.calculate(employee, minimum_wage_monthly, [], [])

    # 검증: 통상시급 = 기본급 ÷ 174 (주휴수당 제외)
    expected_hourly = Money(15_278)  # 2,658,480 ÷ 174
    assert result.hourly_wage == expected_hourly

    # 주휴수당 별도 지급
    assert result.weekly_holiday_pay > Money(0)
```

### Template 7: 5인 미만 사업장
```python
def test_under_5_employees():
    """
    Given: 5인 미만 사업장, 휴일 10시간 근무
    When: 급여 계산
    Then: 8시간 초과분도 1.5배만 (2.0배 아님)
    """
    employee = Employee(
        name="소규모사업장",
        dependents_count=0,
        employment_type=EmploymentType.FULL_TIME,
        company_size=CompanySize.UNDER_5
    )

    base_salary = Money(2_800_000)

    shifts = [
        WorkShift(
            date=date(2026, 1, 12),  # 일요일
            start_time=time(9, 0),
            end_time=time(20, 0),  # 10시간 (휴게 1시간)
            break_minutes=60,
            is_holiday_work=True
        )
    ]

    result = calculator.calculate(employee, base_salary, [], shifts)

    # 검증: 5인 미만은 8시간 초과도 1.5배
    hourly_wage = Money(16_092)
    expected = hourly_wage * Decimal('1.5') * 10  # 전체 1.5배
    assert result.holiday_work_pay == expected
```

## Helper 함수

```python
def generate_shifts(
    start_date: date,
    end_date: date,
    work_days: list[int],  # 0=월, 1=화, ..., 6=일
    start_time: time,
    end_time: time,
    break_minutes: int
) -> list[WorkShift]:
    """근무 시프트 자동 생성"""
    shifts = []
    current = start_date

    while current <= end_date:
        if current.weekday() in work_days:
            shifts.append(WorkShift(
                date=current,
                start_time=start_time,
                end_time=end_time,
                break_minutes=break_minutes
            ))
        current += timedelta(days=1)

    return shifts
```

## Examples

### Example 1: 전체 시나리오 실행
```
/salary-test --all

[급여 시나리오 테스트 실행]

✅ test_fulltime_basic: PASSED
✅ test_parttime_24_hours: PASSED
✅ test_night_work: PASSED
✅ test_overtime_10_hours: PASSED
✅ test_holiday_work: PASSED
✅ test_minimum_wage_2026: PASSED
✅ test_under_5_employees: PASSED

총 7개 테스트, 7개 통과 (100%)
실행 시간: 1.23초
```

### Example 2: 특정 시나리오 추가
```
/salary-test parttime-night "파트타임 야간근무"

[새 테스트 케이스 생성]

파일: backend/app/tests/unit/test_salary_calculator.py
위치: Line 582

def test_parttime_night_work():
    """
    Given: 파트타임 근로자, 주 3일 야간근무 (22:00~06:00)
    When: 급여 계산
    Then: 주휴수당 비례 + 야간 가산수당
    """
    # [테스트 코드 자동 생성]
    ...

테스트 실행: PASSED ✅
```

### Example 3: 커버리지 리포트
```
/salary-test --coverage

[테스트 커버리지 리포트]

backend/app/domain/services/salary_calculator.py
  - 구문 커버리지: 98%
  - 분기 커버리지: 95%
  - 미커버 라인: 245-247 (에러 처리)

backend/app/domain/services/overtime_calculator.py
  - 구문 커버리지: 100%
  - 분기 커버리지: 100%

권장 사항:
1. salary_calculator.py 에러 처리 테스트 추가
2. 경계값 테스트 확대 (주 52시간 정확히)
```

## Boundaries

**Will:**
- 다양한 급여 계산 시나리오 테스트 생성
- 기존 테스트 패턴 준수
- pytest 스타일 테스트 작성
- 커버리지 리포트 생성

**Will Not:**
- 프로덕션 데이터 테스트
- 성능 테스트 (별도 도구 사용)
- UI 테스트 (E2E 테스트는 별도)
- 수동 테스트 대체

## 참고
- 기존 테스트: `backend/app/tests/unit/test_salary_calculator.py`
- 테스트 실행: `pytest backend/app/tests/ -v --cov=backend/app/domain`
