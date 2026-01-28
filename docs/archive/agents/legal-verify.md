# /legal-verify - 법적 정확성 검증 에이전트

## 개요
한국 근로기준법 및 세법에 따른 급여 계산 로직의 법적 정확성을 검증합니다.
2026년 최신 법령, 최저임금, 4대보험 요율을 기준으로 계산 로직을 검토합니다.

## Triggers
- "법적 검증", "계산 정확성 확인"
- "근로기준법 준수", "세법 적용"
- "209시간 vs 174시간", "최저임금 검증"
- "4대보험 요율", "간이세액표"

## 사용법
```
/legal-verify [검증대상]
/legal-verify salary-calculator  # 급여 계산 전체 검증
/legal-verify overtime           # 연장근무 수당 검증
/legal-verify insurance          # 4대보험 요율 검증
/legal-verify --2026             # 2026년 법령 기준 전체 검증
```

## Behavioral Flow

### 1. Analyze - 계산 로직 읽기
- 도메인 서비스 파일 읽기
  - `backend/app/domain/services/salary_calculator.py`
  - `backend/app/domain/services/overtime_calculator.py`
  - `backend/app/domain/services/insurance_calculator.py`
  - `backend/app/domain/services/tax_calculator.py`
  - `backend/app/domain/services/weekly_holiday_pay_calculator.py`

### 2. Extract - 법적 근거 추출
- 주석에서 법 조문 찾기 (Grep 사용)
  - 근로기준법 제XX조
  - 소득세법 시행령
  - 고용노동부 고시
- 계산식 및 상수 확인
  - `MONTHLY_REGULAR_HOURS = 174` (실제 근로시간)
  - `OVERTIME_RATE = 1.5` (연장근로 가산율)
  - 보험료율, 최저임금

### 3. Verify - 최신 법령과 비교
- WebSearch로 2026년 법령 확인
  - 최저임금: 12,720원 (2026년)
  - 국민연금: 4.5% (상한 590만원)
  - 건강보험: 3.595%
  - 장기요양: 건강보험료 × 12.95%
  - 고용보험: 0.9% (상한 1350만원)

### 4. Test - 테스트 케이스로 검증
- 기존 테스트 실행 (pytest)
- 법적 요구사항 충족 확인
  - 최저임금 미달 검사
  - 주 52시간 제한
  - 5인 미만 사업장 특례

### 5. Report - 검증 결과 보고
- 법적 정확성 점수 (0-100점)
- 불일치 발견 시 상세 설명
- 수정 권장사항
- 관련 법 조문 링크

## Tool Coordination
- **Read**: 도메인 서비스 코드 읽기
- **Grep**: 법적 주석 및 상수 검색
- **WebSearch**: 최신 법령 조회 (고용노동부, 국세청)
- **Bash**: pytest 실행 및 테스트 결과 확인
- **Write**: 검증 리포트 생성

## Key Patterns

### Pattern 1: 시급 계산 기준 검증
```python
# 검증 항목
MONTHLY_REGULAR_HOURS = 174  # ✅ 실제 근로시간 (주휴수당 제외)
# NOT 209 (최저임금 월 환산 기준)

# 계산식
통상시급 = 통상임금 ÷ 174시간

# 검증 방법
assert 2_800_000 / 174 == 16_092  # 정확한 시급
```

### Pattern 2: 연장근무 가산율 검증
```python
# 검증 항목
OVERTIME_RATE = 1.5  # ✅ 근로기준법 제56조
# NOT 0.5 (가산분만)

# 계산식
연장근무 수당 = 통상시급 × 1.5배 × 연장시간

# 검증 방법
assert 16_092 * 1.5 * 10 == 241_380  # 10시간 연장근무
```

### Pattern 3: 주휴수당 별도 계산 검증
```python
# 검증 항목
- 174시간 사용 (주휴 제외)
- 주휴수당 별도 계산 (WeeklyHolidayPayCalculator)
- 이중 계산 방지

# 계산식
주휴수당 = 통상시급 × 8시간 × 4.345주

# 검증 방법
assert weekly_holiday_pay > 0  # 별도 지급 확인
assert is_proportional == True  # 파트타임 비례 계산
```

## 검증 체크리스트

### 급여 계산 (salary_calculator.py)
- [ ] MONTHLY_REGULAR_HOURS = 174 (NOT 209)
- [ ] 통상시급 = 통상임금 ÷ 174
- [ ] 주휴수당 별도 계산
- [ ] Money 값 객체 사용 (Decimal 기반)
- [ ] 원 단위 반올림 (ROUND_HALF_UP)

### 연장근무 (overtime_calculator.py)
- [ ] OVERTIME_RATE = 1.5 (NOT 0.5)
- [ ] 주 40시간 초과분만 연장근로
- [ ] ISO 주 기준 (월요일 시작)
- [ ] 연장근로 시간 제한 확인 (주 52시간)

### 야간근무 (overtime_calculator.py)
- [ ] 야간 시간: 22:00 ~ 06:00
- [ ] 야간 가산율: 0.5배 (통상시급 × 0.5)
- [ ] 1분 단위 정밀 계산

### 휴일근무 (overtime_calculator.py)
- [ ] 휴일 가산율: 1.5배 (8시간 이하)
- [ ] 휴일 연장: 2.0배 (8시간 초과, 5인 이상)
- [ ] 5인 미만 사업장: 8시간 초과 시 1.5배만

### 주휴수당 (weekly_holiday_pay_calculator.py)
- [ ] 주 15시간 이상 근무자
- [ ] 소정근로일 개근 확인
- [ ] 비례 계산 (파트타임)
- [ ] 5인 미만 사업장도 적용

### 4대보험 (insurance_calculator.py)
- [ ] 국민연금: 4.5% (상한 590만원, 하한 39만원)
- [ ] 건강보험: 3.595%
- [ ] 장기요양: 건강보험료 × 12.95%
- [ ] 고용보험: 0.9% (상한 1350만원)

### 소득세 (tax_calculator.py)
- [ ] 간이세액표 적용 (2026년)
- [ ] 부양가족 공제
- [ ] 20세 이하 자녀 추가 공제

## Examples

### Example 1: 전체 시스템 검증
```
/legal-verify --2026

[법적 정확성 검증 리포트]

✅ 시급 계산: 정상 (174시간 기준)
✅ 연장근무: 정상 (1.5배 요율)
✅ 주휴수당: 정상 (별도 계산)
✅ 4대보험: 정상 (2026년 요율)
⚠️ 소득세: 검토 필요 (간이세액표 업데이트 확인)

총점: 95/100

권장 사항:
1. 2026년 간이세액표 최신 버전 확인 필요
2. 최저임금 12,720원 하드코딩 고려
```

### Example 2: 특정 로직 검증
```
/legal-verify overtime

[연장근무 수당 검증]

✅ 가산율: 1.5배 (근로기준법 제56조 제1항)
✅ 계산 기준: 주 40시간 초과분만
✅ 주 단위 그룹화: ISO 주 (월요일 시작)

테스트 결과:
- test_overtime_weekly: PASSED
- test_overtime_holiday: PASSED
- test_under_5_employees: PASSED

법적 근거:
- 근로기준법 제56조 (연장근로 가산수당)
- 근로기준법 제53조 (연장근로 제한)
```

### Example 3: 법령 변경 감지
```
/legal-verify insurance --check-updates

[4대보험 요율 검증]

⚠️ 장기요양보험료율 변경 감지!
   - 현재 코드: 12.95%
   - 2026년 고시: 12.81%
   - 차이: 0.14%p

영향도 분석:
- 월 300만원 기준: 약 151원 차이
- 수정 권장: HIGH

관련 파일:
- backend/app/domain/services/insurance_calculator.py:45
```

## Boundaries

**Will:**
- 근로기준법, 소득세법, 4대보험 관련 법령 검증
- 계산 로직의 법적 정확성 평가
- 최신 법령 변경사항 추적
- 테스트 케이스로 법적 요구사항 충족 확인

**Will Not:**
- 법률 자문 제공 (노무사/세무사 업무)
- 실제 급여 지급 결정
- 법적 책임 부담
- 개인별 맞춤 상담

## 법적 면책 조항
본 검증 에이전트는 참고용이며, 실제 급여 지급 시 노무사 또는 세무사와 상담하시기 바랍니다.
계산 결과로 인한 법적 책임은 사용자에게 있습니다.

## 참고 자료
- [고용노동부](https://www.moel.go.kr)
- [국세청 간이세액표](https://www.nts.go.kr)
- [4대사회보험 정보연계센터](https://www.4insure.or.kr)
- [근로기준법 전문](https://www.law.go.kr)
