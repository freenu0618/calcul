# Spring Boot 테스트 가이드

## Railway 배포 후 테스트 방법

Railway에 Spring Boot 앱이 배포되면, 다음 테스트를 진행해주세요.

## 1. 기본 테스트

### 1.1 헬스 체크
```bash
curl https://your-app.up.railway.app/actuator/health
```

**예상 결과**:
```json
{
  "status": "UP"
}
```

✅ **확인**: `status`가 `UP`이면 성공

### 1.2 Swagger UI 접속
브라우저에서 접속:
```
https://your-app.up.railway.app/swagger-ui.html
```

✅ **확인**: API 문서 페이지가 표시되면 성공

## 2. 급여 계산 API 테스트

### 2.1 기본 급여 계산 (월급제)
```bash
curl -X POST https://your-app.up.railway.app/api/v1/salary/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "employee": {
      "employment_type": "FULL_TIME",
      "company_size": "FIVE_OR_MORE",
      "base_salary": 2800000,
      "dependents": 1,
      "children_under_20": 1
    },
    "shifts": [
      {
        "date": "2026-01-20",
        "start_time": "09:00",
        "end_time": "18:00",
        "break_minutes": 60,
        "is_holiday": false
      },
      {
        "date": "2026-01-21",
        "start_time": "09:00",
        "end_time": "18:00",
        "break_minutes": 60,
        "is_holiday": false
      },
      {
        "date": "2026-01-22",
        "start_time": "09:00",
        "end_time": "18:00",
        "break_minutes": 60,
        "is_holiday": false
      },
      {
        "date": "2026-01-23",
        "start_time": "09:00",
        "end_time": "18:00",
        "break_minutes": 60,
        "is_holiday": false
      },
      {
        "date": "2026-01-24",
        "start_time": "09:00",
        "end_time": "18:00",
        "break_minutes": 60,
        "is_holiday": false
      }
    ],
    "allowances": [],
    "wage_type": "MONTHLY",
    "hourly_wage": null,
    "calculation_month": "2026-01",
    "absence_policy": "MODERATE"
  }'
```

**예상 결과** (주요 필드):
```json
{
  "gross_pay": 2800000,
  "deductions": {
    "total_deductions": 약 583000,
    "national_pension": 133000,
    "health_insurance": 100660,
    "long_term_care": 13226,
    "employment_insurance": 25200,
    "income_tax": 약 284000,
    "local_income_tax": 약 28000
  },
  "net_pay": 약 2217000
}
```

✅ **확인 포인트**:
- `gross_pay`: 2,800,000원 (기본급)
- `net_pay`: 약 2,217,000원 (실수령액)
- `national_pension`: 133,000원 (2,800,000 × 4.75%)
- `health_insurance`: 100,660원 (2,800,000 × 3.595%)

### 2.2 야간근무 포함 계산
```bash
curl -X POST https://your-app.up.railway.app/api/v1/salary/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "employee": {
      "employment_type": "FULL_TIME",
      "company_size": "FIVE_OR_MORE",
      "base_salary": 2800000
    },
    "shifts": [
      {
        "date": "2026-01-20",
        "start_time": "21:00",
        "end_time": "06:00",
        "break_minutes": 60,
        "is_holiday": false
      }
    ],
    "allowances": [],
    "wage_type": "MONTHLY",
    "calculation_month": "2026-01"
  }'
```

✅ **확인 포인트**:
- `overtime.night_hours`: 8시간 (22:00~06:00 구간)
- `overtime.night_pay`: 약 64,368원 (통상시급 16,092원 × 8 × 0.5)
- 야간근무 가산수당이 `gross_pay`에 포함됨

### 2.3 시급제 계산
```bash
curl -X POST https://your-app.up.railway.app/api/v1/salary/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "employee": {
      "employment_type": "PART_TIME",
      "company_size": "FIVE_OR_MORE"
    },
    "shifts": [
      {
        "date": "2026-01-20",
        "start_time": "09:00",
        "end_time": "13:00",
        "break_minutes": 0,
        "is_holiday": false
      },
      {
        "date": "2026-01-21",
        "start_time": "09:00",
        "end_time": "13:00",
        "break_minutes": 0,
        "is_holiday": false
      },
      {
        "date": "2026-01-22",
        "start_time": "09:00",
        "end_time": "13:00",
        "break_minutes": 0,
        "is_holiday": false
      },
      {
        "date": "2026-01-23",
        "start_time": "09:00",
        "end_time": "13:00",
        "break_minutes": 0,
        "is_holiday": false
      },
      {
        "date": "2026-01-24",
        "start_time": "09:00",
        "end_time": "13:00",
        "break_minutes": 0,
        "is_holiday": false
      }
    ],
    "allowances": [],
    "wage_type": "HOURLY",
    "hourly_wage": 10320,
    "calculation_month": "2026-01"
  }'
```

✅ **확인 포인트**:
- `work_summary.total_hours`: 20시간 (4시간 × 5일)
- `gross_pay`: 206,400원 (10,320원 × 20시간)
- `weekly_holiday_pay`: 34,400원 (주 20시간, 주휴수당 비례 지급)

## 3. 보험료 API 테스트

### 3.1 2026년 보험료율 조회
```bash
curl https://your-app.up.railway.app/api/v1/insurance/rates?year=2026
```

**예상 결과**:
```json
{
  "year": 2026,
  "rates": {
    "national_pension": 0.0475,
    "health_insurance": 0.03595,
    "long_term_care": 0.1314,
    "employment_insurance": 0.009
  },
  "limits": {
    "national_pension": {
      "min": 390000,
      "max": 5900000
    },
    "employment_insurance": {
      "max": 13500000
    }
  }
}
```

✅ **확인 포인트**:
- `national_pension`: 4.75% (2026년 연금개혁 반영)
- `health_insurance`: 3.595%
- `long_term_care`: 13.14% (2026년 인상)

### 3.2 특정 금액 보험료 계산
```bash
curl -X POST https://your-app.up.railway.app/api/v1/insurance/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "monthly_salary": 2800000,
    "year": 2026,
    "age": 35
  }'
```

**예상 결과**:
```json
{
  "monthly_salary": 2800000,
  "national_pension": 133000,
  "health_insurance": 100660,
  "long_term_care": 13226,
  "employment_insurance": 25200,
  "total": 272086
}
```

✅ **확인 포인트**:
- `national_pension`: 133,000원 (2,800,000 × 4.75%)
- `total`: 272,086원

## 4. 세금 API 테스트

### 4.1 소득세 계산
```bash
curl -X POST https://your-app.up.railway.app/api/v1/tax/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "monthly_salary": 2800000,
    "dependents": 1,
    "children_under_20": 1
  }'
```

**예상 결과**:
```json
{
  "income_tax": 284660,
  "local_income_tax": 28466,
  "total_tax": 313126,
  "effective_rate": 11.18
}
```

✅ **확인 포인트**:
- `income_tax`: 약 284,660원 (간이세액표 기준)
- `local_income_tax`: `income_tax`의 10%
- `effective_rate`: 약 11.18%

## 5. 프론트엔드 연동 테스트

### 5.1 Cloudflare Pages 환경변수 설정
1. Cloudflare Pages 대시보드 → **Settings** → **Environment variables**
2. `VITE_API_BASE_URL` 값 변경:
   ```
   VITE_API_BASE_URL=https://your-spring-app.up.railway.app
   ```
3. **Save** 후 **Retry deployment** (재배포 필수!)

### 5.2 프론트엔드에서 테스트
1. https://paytools.work 접속
2. 급여 계산기 페이지로 이동
3. 다음 정보 입력:
   - 고용 형태: 정규직
   - 사업장 규모: 5인 이상
   - 기본급: 2,800,000원
   - 부양가족: 1명
   - 20세 이하 자녀: 1명
   - 시프트 1개 추가 (09:00-18:00, 휴게 60분)
4. **급여 계산하기** 클릭

✅ **확인 포인트**:
- 실수령액: 약 2,217,000원 표시
- 4대 보험 내역 표시
- 소득세 내역 표시
- 에러 없이 정상 작동

## 6. 데이터베이스 확인

### 6.1 Flyway 마이그레이션 확인
Railway PostgreSQL 콘솔에서:
```sql
SELECT version, description, installed_on
FROM flyway_schema_history
ORDER BY installed_rank;
```

**예상 결과**:
```
version | description              | installed_on
--------|--------------------------|-------------------------
1       | init user                | 2026-01-25 12:00:00
2       | create employee table    | 2026-01-25 12:00:01
```

✅ **확인**: 2개 마이그레이션이 성공적으로 실행됨

### 6.2 테이블 확인
```sql
-- users 테이블 확인
SELECT * FROM users LIMIT 1;

-- employees 테이블 확인
SELECT * FROM employees LIMIT 1;
```

✅ **확인**: 테이블이 존재하고 스키마가 올바름

## 7. 문제 해결

### 7.1 502 Bad Gateway
**원인**: Spring Boot 앱이 시작되지 않음
**확인**:
1. Railway 배포 로그에서 에러 확인
2. `DATABASE_URL` 환경변수가 올바른지 확인
3. PostgreSQL 서비스가 실행 중인지 확인

### 7.2 CORS 에러
**원인**: `ALLOWED_ORIGINS`에 프론트엔드 도메인 누락
**해결**:
1. Railway 환경변수에서 `ALLOWED_ORIGINS` 확인:
   ```
   ALLOWED_ORIGINS=https://paytools.work,https://calcul-1b9.pages.dev
   ```
2. Spring Boot 재배포

### 7.3 계산 결과 불일치
**원인**: Python 버전과 계산 로직 차이
**확인**:
1. `scripts/verify_parity.py` 실행 (로컬)
2. 동일한 입력값으로 Python vs Kotlin 결과 비교
3. 1원 이내 오차는 반올림 차이로 허용

### 7.4 Swagger UI 404
**원인**: Swagger 의존성 누락 또는 경로 오류
**확인**:
1. `build.gradle.kts`에 `springdoc-openapi-starter-webmvc-ui` 포함 여부
2. URL: `/swagger-ui.html` (끝에 `.html` 필수)

## 8. 성공 기준

모든 테스트가 통과하면 배포 성공:

- [ ] 헬스 체크 성공 (`/actuator/health`)
- [ ] Swagger UI 접속 가능
- [ ] 급여 계산 API 정상 작동 (월급제)
- [ ] 급여 계산 API 정상 작동 (시급제)
- [ ] 야간근무 가산수당 정확히 계산
- [ ] 보험료 조회 API 정상 작동
- [ ] 보험료 계산 API 정상 작동
- [ ] 소득세 계산 API 정상 작동
- [ ] 프론트엔드 연동 성공
- [ ] Flyway 마이그레이션 성공

## 9. 추가 테스트 (선택)

### 9.1 부하 테스트 (간단)
```bash
# ab (Apache Bench) 사용
ab -n 100 -c 10 https://your-app.up.railway.app/actuator/health
```

✅ **확인**: 초당 처리량, 평균 응답 시간

### 9.2 보안 테스트
```bash
# JWT 없이 보호된 엔드포인트 접근 시도
curl https://your-app.up.railway.app/api/v1/employees
```

✅ **확인**: 401 Unauthorized 반환

## 10. 다음 단계

배포 테스트 성공 후:
1. **Phase 3.5** 진행 - 근무자 등록 시스템
2. 프론트엔드 API 엔드포인트 전환 (Python → Spring)
3. Python 서버 게이트웨이만 유지

---

**작성일**: 2026-01-25
**테스트 환경**: Railway + PostgreSQL 16 + Spring Boot 3.2.2
