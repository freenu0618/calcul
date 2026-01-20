# 급여 계산기 API

한국 근로기준법 및 세법에 따른 근로자 실수령액 계산 REST API

## 🚀 Quick Start

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 환경 변수 설정

```bash
# .env 파일 생성 (선택사항)
SECRET_KEY=your-secret-key-here  # JWT 토큰 서명용
DATABASE_URL=postgresql://user:pass@host:5432/db  # PostgreSQL 연결
```

**기본값**: SQLite (`salary_calculator.db`) 사용

### 3. 데이터베이스 마이그레이션

```bash
cd backend
alembic upgrade head
```

### 4. 서버 실행

```bash
uvicorn app.api.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. API 문서 확인

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📡 API 엔드포인트

### Authentication (인증) 🔐

모든 CRUD API는 JWT 토큰 인증이 필요합니다. 회원가입 후 로그인하여 토큰을 받으세요.

#### POST `/api/v1/auth/register`
회원가입

**요청 예제:**
```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "full_name": "홍길동"
}
```

#### POST `/api/v1/auth/login`
로그인 (JWT 토큰 획득)

**요청 예제:**
```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

**응답 예제:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "token_type": "bearer"
}
```

#### GET `/api/v1/auth/me`
현재 로그인 사용자 정보 조회

**헤더:**
```
Authorization: Bearer {access_token}
```

### Employees (직원 관리) 🔒

**인증 필수**: 모든 엔드포인트는 JWT 토큰이 필요하며, 본인이 생성한 직원만 조회/수정/삭제 가능합니다.

#### GET `/api/v1/employees`
직원 목록 조회

#### POST `/api/v1/employees`
직원 생성

**요청 예제:**
```json
{
  "name": "홍길동",
  "dependents_count": 2,
  "children_under_20": 1,
  "employment_type": "FULL_TIME",
  "company_size": "OVER_5",
  "scheduled_work_days": 5
}
```

#### GET `/api/v1/employees/{employee_id}`
직원 상세 조회

#### PUT `/api/v1/employees/{employee_id}`
직원 정보 수정

#### DELETE `/api/v1/employees/{employee_id}`
직원 삭제

### Records (급여 이력) 🔒

**인증 필수**: 모든 엔드포인트는 JWT 토큰이 필요하며, 본인의 급여 이력만 접근 가능합니다.

#### GET `/api/v1/records`
급여 이력 목록 조회

**쿼리 파라미터:**
- `employee_id` (optional): 특정 직원의 이력만 필터링
- `skip` (default: 0): 페이지네이션 오프셋
- `limit` (default: 100): 페이지 크기

#### POST `/api/v1/records`
급여 이력 저장

**요청 예제:**
```json
{
  "employee_id": 1,
  "base_salary": 3000000,
  "allowances_json": [],
  "total_gross": 3000000,
  "total_deductions": 500000,
  "net_pay": 2500000,
  "calculation_detail": {"note": "2026년 1월"},
  "note": "정상 지급"
}
```

#### GET `/api/v1/records/{record_id}`
급여 이력 상세 조회

#### DELETE `/api/v1/records/{record_id}`
급여 이력 삭제

### Salary (급여 계산)

#### POST `/api/v1/salary/calculate`
급여 계산 - 기본급, 수당, 근무 시프트를 기반으로 실수령액 계산

**요청 예제:**
```json
{
  "employee": {
    "name": "홍길동",
    "dependents_count": 2,
    "children_under_20": 1,
    "employment_type": "FULL_TIME",
    "company_size": "OVER_5"
  },
  "base_salary": 2500000,
  "allowances": [
    {
      "name": "직책수당",
      "amount": 300000,
      "is_taxable": true,
      "is_includable_in_minimum_wage": true,
      "is_fixed": true,
      "is_included_in_regular_wage": true
    }
  ],
  "work_shifts": [
    {
      "date": "2026-01-05",
      "start_time": "09:00:00",
      "end_time": "18:00:00",
      "break_minutes": 60,
      "is_holiday_work": false
    }
  ]
}
```

### Insurance (보험료 조회)

#### GET `/api/v1/insurance/rates`
2026년 4대 보험 요율 정보 조회

#### POST `/api/v1/insurance/calculate`
보험료 계산 - 총 과세 대상 급여 기반

**요청 예제:**
```json
{
  "gross_income": 2800000
}
```

### Tax (세금 조회)

#### POST `/api/v1/tax/calculate`
세금 계산 - 간이세액표 기준

**요청 예제:**
```json
{
  "taxable_income": 2800000,
  "dependents_count": 2,
  "children_under_20": 1
}
```

#### POST `/api/v1/tax/estimate-annual`
연간 소득세 추정

**요청 예제:**
```json
{
  "monthly_income": 2800000,
  "dependents_count": 2,
  "children_under_20": 1
}
```

## 🧪 테스트 실행

### 단위 테스트
```bash
pytest app/tests/unit/ -v
```

### 통합 테스트
```bash
pytest app/tests/integration/ -v
```

### 전체 테스트
```bash
pytest app/tests/ -v
```

## 📊 계산 기준

### 2026년 법정 요율
- **국민연금**: 4.5% (상한 590만원, 하한 39만원)
- **건강보험**: 3.595%
- **장기요양보험**: 건강보험료 × 12.95%
- **고용보험**: 0.9% (상한 1350만원)
- **최저임금**: 시급 10,320원

### 가산수당
- **연장근로**: 통상시급 × 1.5배 (주 40시간 초과)
- **야간근로**: 통상시급 × 0.5배 (22:00~06:00)
- **휴일근로**: 통상시급 × 1.5배 (8시간 이하)
- **휴일근로 초과**: 통상시급 × 2.0배 (5인 이상만)

### 주휴수당
```
주휴수당 = (주 소정근로시간 ÷ 40) × 8 × 통상시급
```
- 주 15시간 이상 근무 시 지급
- 5인 미만 사업장도 의무 적용

## ⚠️ 법적 고지

본 계산기는 참고용이며, 실제 급여 지급 시 노무사 또는 세무사와 상담하시기 바랍니다.
계산 결과로 인한 법적 책임은 사용자에게 있습니다.

## 📁 프로젝트 구조

```
backend/
├── alembic/                     # 데이터베이스 마이그레이션
│   ├── versions/
│   │   └── 4233dc320fd0_initial_migration_with_user_model.py
│   ├── env.py
│   └── alembic.ini
├── app/
│   ├── api/
│   │   ├── main.py              # FastAPI 앱
│   │   ├── routers/             # API 엔드포인트
│   │   │   ├── auth.py          # 인증 (회원가입/로그인)
│   │   │   ├── employees.py     # 직원 CRUD (인증 필요)
│   │   │   ├── records.py       # 급여 이력 CRUD (인증 필요)
│   │   │   ├── salary.py
│   │   │   ├── insurance.py
│   │   │   └── tax.py
│   │   └── schemas/             # Request/Response DTO
│   │       ├── common.py
│   │       ├── salary.py
│   │       ├── insurance.py
│   │       └── tax.py
│   ├── core/                    # 인증 및 보안
│   │   ├── config.py            # JWT 설정
│   │   ├── security.py          # 비밀번호 해싱, 토큰 생성
│   │   └── deps.py              # 인증 의존성
│   ├── db/                      # 데이터베이스 모델
│   │   ├── database.py          # DB 연결
│   │   └── models.py            # SQLAlchemy 모델 (User, Employee, SalaryRecord)
│   ├── domain/                  # DDD 도메인 로직
│   │   ├── entities/
│   │   ├── value_objects/
│   │   └── services/
│   └── tests/
│       ├── unit/                # 165개 단위 테스트
│       └── integration/         # 14개 통합 테스트
├── test_auth.py                 # 인증 테스트
├── test_secured_api.py          # 보안 적용 통합 테스트
├── requirements.txt
└── README.md
```

## 🔧 기술 스택

- **FastAPI 0.128.0** - 웹 프레임워크
- **Uvicorn 0.40.0** - ASGI 서버
- **Pydantic 2.12.5** - 데이터 검증
- **SQLAlchemy 2.0+** - ORM
- **Alembic** - 데이터베이스 마이그레이션
- **PostgreSQL / SQLite** - 데이터베이스
- **python-jose** - JWT 토큰 생성/검증
- **passlib[argon2]** - Argon2 비밀번호 해싱
- **Pytest 9.0.2** - 테스트 프레임워크

## 🔐 보안 고지

- **JWT 토큰**: 30일 만료 (프로덕션 환경에서는 더 짧게 설정 권장)
- **비밀번호 해싱**: Argon2 알고리즘 사용
- **데이터 격리**: 사용자는 본인이 생성한 데이터만 접근 가능
- **환경 변수**: `SECRET_KEY`는 반드시 안전한 랜덤 문자열로 설정
- **프로덕션 배포 시**: HTTPS 필수, CORS 설정 확인

## 📝 버전 정보

- **API Version**: 1.1.0 (인증 시스템 추가)
- **적용 연도**: 2026년
- **최종 업데이트**: 2026-01-20
