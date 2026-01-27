# PayTools API Reference (Spring Boot)

> **Base URL**: `https://calcul-production.up.railway.app/api/v1`
>
> **중요**: Spring Boot 백엔드는 **camelCase** 필드명을 사용합니다.

## 급여 계산 API

### POST `/salary/calculate`

급여 계산 - 기본급, 수당, 근무 시프트를 기반으로 실수령액 계산

#### Request Body

```json
{
  "employee": {
    "name": "홍길동",
    "dependentsCount": 2,
    "childrenUnder20": 1,
    "employmentType": "FULL_TIME",
    "companySize": "OVER_5",
    "scheduledWorkDays": 5,
    "dailyWorkHours": 8
  },
  "baseSalary": 3000000,
  "allowances": [
    {
      "name": "직책수당",
      "amount": 300000,
      "isTaxable": true,
      "isIncludableInMinimumWage": true,
      "isFixed": true,
      "isIncludedInRegularWage": true
    }
  ],
  "workShifts": [
    {
      "date": "2026-01-06",
      "startTime": "09:00:00",
      "endTime": "18:00:00",
      "breakMinutes": 60,
      "isHolidayWork": false
    }
  ],
  "wageType": "MONTHLY",
  "hourlyWage": 0,
  "calculationMonth": "2026-01",
  "absencePolicy": "STRICT",
  "hoursMode": "MODE_174"
}
```

#### Request 필드 상세

| 필드 | 타입 | 필수 | 설명 | 예시 |
|------|------|------|------|------|
| **employee** | object | ✅ | 근로자 정보 | |
| ├ name | string | ✅ | 근로자 이름 | "홍길동" |
| ├ dependentsCount | int | ✅ | 부양가족 수 (본인 포함) | 2 |
| ├ childrenUnder20 | int | | 20세 이하 자녀 수 | 1 |
| ├ employmentType | enum | ✅ | 고용 형태 | "FULL_TIME" / "PART_TIME" |
| ├ companySize | enum | ✅ | 사업장 규모 | "OVER_5" / "UNDER_5" |
| ├ scheduledWorkDays | int | | 주 소정근로일 (기본 5) | 5 |
| └ dailyWorkHours | int | | 1일 소정근로시간 (기본 8) | 8 |
| **baseSalary** | long | | 기본 월급 (원) | 3000000 |
| **allowances** | array | | 수당 목록 | |
| ├ name | string | ✅ | 수당 이름 | "직책수당" |
| ├ amount | long | ✅ | 금액 (원) | 300000 |
| ├ isTaxable | boolean | ✅ | 과세 대상 여부 | true |
| ├ isIncludableInMinimumWage | boolean | ✅ | 최저임금 산입 여부 | true |
| ├ isFixed | boolean | | 고정 수당 여부 (기본 true) | true |
| └ isIncludedInRegularWage | boolean | | 통상임금 포함 여부 (기본 true) | true |
| **workShifts** | array | | 근무 시프트 목록 | |
| ├ date | string | ✅ | 근무 날짜 (YYYY-MM-DD) | "2026-01-06" |
| ├ startTime | string | ✅ | 출근 시각 (HH:MM:SS) | "09:00:00" |
| ├ endTime | string | ✅ | 퇴근 시각 (HH:MM:SS) | "18:00:00" |
| ├ breakMinutes | int | ✅ | 휴게시간 (분) | 60 |
| └ isHolidayWork | boolean | | 휴일근로 여부 (기본 false) | false |
| **wageType** | enum | | 급여 형태 (기본 MONTHLY) | "MONTHLY" / "HOURLY" |
| **hourlyWage** | long | | 시급 (시급제일 때 사용) | 10320 |
| **calculationMonth** | string | | 계산 대상 월 (YYYY-MM) | "2026-01" |
| **absencePolicy** | enum | | 결근 공제 정책 (기본 STRICT) | "STRICT" / "MODERATE" / "LENIENT" |
| **hoursMode** | enum | | 월 소정근로시간 방식 (기본 MODE_174) | "MODE_174" / "MODE_209" |

#### Response Body

```json
{
  "employeeName": "홍길동",
  "grossBreakdown": {
    "baseSalary": { "amount": 3000000, "formatted": "3,000,000원" },
    "regularWage": { "amount": 3300000, "formatted": "3,300,000원" },
    "hourlyWage": { "amount": 18966, "formatted": "18,966원" },
    "taxableAllowances": { "amount": 300000, "formatted": "300,000원" },
    "nonTaxableAllowances": { "amount": 0, "formatted": "0원" },
    "overtimeAllowances": {
      "overtimeHours": { "hours": 0, "minutes": 0, "totalMinutes": 0, "formatted": "0시간" },
      "overtimePay": { "amount": 0, "formatted": "0원" },
      "nightHours": { "hours": 0, "minutes": 0, "totalMinutes": 0, "formatted": "0시간" },
      "nightPay": { "amount": 0, "formatted": "0원" },
      "holidayHours": { "hours": 0, "minutes": 0, "totalMinutes": 0, "formatted": "0시간" },
      "holidayPay": { "amount": 0, "formatted": "0원" },
      "total": { "amount": 0, "formatted": "0원" }
    },
    "weeklyHolidayPay": {
      "amount": { "amount": 658896, "formatted": "658,896원" },
      "weeklyHours": { "hours": 40, "minutes": 0, "totalMinutes": 2400, "formatted": "40시간" },
      "isProportional": false,
      "calculation": "(40시간 ÷ 40) × 8 × 18966원"
    },
    "total": { "amount": 3958896, "formatted": "3,958,896원" }
  },
  "deductionsBreakdown": {
    "insurance": {
      "nationalPension": { "amount": 177150, "formatted": "177,150원" },
      "healthInsurance": { "amount": 134206, "formatted": "134,206원" },
      "longTermCare": { "amount": 17638, "formatted": "17,638원" },
      "employmentInsurance": { "amount": 33630, "formatted": "33,630원" },
      "total": { "amount": 362624, "formatted": "362,624원" }
    },
    "tax": {
      "incomeTax": { "amount": 82840, "formatted": "82,840원" },
      "localIncomeTax": { "amount": 8284, "formatted": "8,284원" },
      "total": { "amount": 91124, "formatted": "91,124원" }
    },
    "total": { "amount": 453748, "formatted": "453,748원" }
  },
  "netPay": { "amount": 3505148, "formatted": "3,505,148원" },
  "workSummary": null,
  "absenceBreakdown": null,
  "warnings": [],
  "calculationMetadata": {
    "calculation_date": "2026-01-27",
    "tax_year": 2026,
    "insurance_year": 2026,
    "wage_type": "MONTHLY",
    "calculation_month": "2026-01"
  }
}
```

#### Response 필드 상세

| 필드 | 타입 | 설명 |
|------|------|------|
| employeeName | string | 근로자 이름 |
| **grossBreakdown** | object | 총 지급액 내역 |
| ├ baseSalary | MoneyResponse | 기본급 |
| ├ regularWage | MoneyResponse | 통상임금 |
| ├ hourlyWage | MoneyResponse | 통상시급 |
| ├ taxableAllowances | MoneyResponse | 과세 수당 합계 |
| ├ nonTaxableAllowances | MoneyResponse | 비과세 수당 합계 |
| ├ overtimeAllowances | OvertimeBreakdown | 가산수당 내역 |
| ├ weeklyHolidayPay | WeeklyHolidayPayBreakdown | 주휴수당 내역 |
| └ total | MoneyResponse | 총 지급액 |
| **deductionsBreakdown** | object | 공제 내역 |
| ├ insurance | InsuranceBreakdown | 4대 보험 |
| ├ tax | TaxBreakdown | 세금 |
| └ total | MoneyResponse | 총 공제액 |
| netPay | MoneyResponse | 실수령액 |
| workSummary | WorkSummaryResponse | 근무 요약 (nullable) |
| absenceBreakdown | AbsenceBreakdown | 결근 공제 상세 (nullable) |
| warnings | array | 경고 메시지 목록 |
| calculationMetadata | object | 계산 메타데이터 |

---

## 공통 타입

### MoneyResponse
```json
{
  "amount": 3000000,
  "formatted": "3,000,000원"
}
```

### WorkingHoursResponse
```json
{
  "hours": 8,
  "minutes": 30,
  "totalMinutes": 510,
  "formatted": "8시간 30분"
}
```

### WarningResponse
```json
{
  "level": "critical",
  "message": "최저임금 미달",
  "detail": "시급 9,000원은 2026년 최저임금 10,320원 미만입니다."
}
```

| level | 설명 |
|-------|------|
| critical | 법적 위반 가능성 (최저임금 미달 등) |
| warning | 주의 필요 (52시간 초과 등) |
| info | 정보성 안내 |

---

## Enum 값 참조

### EmploymentType
| 값 | 설명 |
|----|------|
| FULL_TIME | 정규직/풀타임 |
| PART_TIME | 파트타임/단시간 근로자 |

### CompanySize
| 값 | 설명 |
|----|------|
| OVER_5 | 5인 이상 사업장 |
| UNDER_5 | 5인 미만 사업장 |

### WageType
| 값 | 설명 |
|----|------|
| MONTHLY | 월급제 |
| HOURLY | 시급제 |

### AbsencePolicy
| 값 | 설명 |
|----|------|
| STRICT | 결근 시 일급 + 주휴수당 모두 공제 |
| MODERATE | 결근 시 일급만 공제 |
| LENIENT | 결근 무시 (전액 지급) |

### HoursMode
| 값 | 설명 |
|----|------|
| MODE_174 | 174시간 (주휴수당 별도 계산) |
| MODE_209 | 209시간 (주휴수당 포함) |

---

## 보험료 API

### GET `/insurance/rates`

2026년 4대 보험 요율 조회

### POST `/insurance/calculate`

보험료 계산

```json
// Request
{ "grossIncome": 3000000 }

// Response
{
  "nationalPension": { "amount": 142500, "formatted": "142,500원" },
  "healthInsurance": { "amount": 107850, "formatted": "107,850원" },
  "longTermCare": { "amount": 14171, "formatted": "14,171원" },
  "employmentInsurance": { "amount": 27000, "formatted": "27,000원" },
  "total": { "amount": 291521, "formatted": "291,521원" }
}
```

---

## 세금 API

### POST `/tax/calculate`

소득세 계산 (간이세액표 기준)

```json
// Request
{
  "taxableIncome": 3000000,
  "dependentsCount": 2,
  "childrenUnder20": 1
}

// Response
{
  "incomeTax": { "amount": 49090, "formatted": "49,090원" },
  "localIncomeTax": { "amount": 4909, "formatted": "4,909원" },
  "total": { "amount": 53999, "formatted": "53,999원" }
}
```

---

## 에러 응답

```json
{
  "success": false,
  "error": {
    "message": "Internal server error",
    "detail": "JSON parse error: ..."
  },
  "timestamp": "2026-01-27T13:00:00.000Z"
}
```

---

## 프론트엔드 ↔ 백엔드 필드명 매핑

프론트엔드는 snake_case, 백엔드는 camelCase를 사용합니다.
`frontend/src/api/client.ts`에서 자동 변환됩니다.

| Frontend (snake_case) | Backend (camelCase) |
|----------------------|---------------------|
| employee.dependents_count | employee.dependentsCount |
| employee.children_under_20 | employee.childrenUnder20 |
| employee.employment_type | employee.employmentType |
| employee.company_size | employee.companySize |
| employee.scheduled_work_days | employee.scheduledWorkDays |
| employee.daily_work_hours | employee.dailyWorkHours |
| base_salary | baseSalary |
| work_shifts | workShifts |
| wage_type | wageType |
| hourly_wage | hourlyWage |
| calculation_month | calculationMonth |
| absence_policy | absencePolicy |
| hours_mode | hoursMode |

### 특수 변환
| Frontend | Backend |
|----------|---------|
| hours_mode: "174" | hoursMode: "MODE_174" |
| hours_mode: "209" | hoursMode: "MODE_209" |

---

## 버전 정보

- **API Version**: 1.0.0
- **적용 연도**: 2026년
- **최종 업데이트**: 2026-01-27
