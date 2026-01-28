# PayTools 데이터베이스 스키마

> **Database**: PostgreSQL (Railway)
> **ORM**: JPA/Hibernate (Spring Boot)
> **마지막 업데이트**: 2026-01-27

---

## 테이블 목록

| 테이블명 | 설명 | 상태 |
|---------|------|------|
| `users` | 사용자 (인증) | ✅ 운영 중 |
| `employees` | 직원 정보 | ✅ 운영 중 |

---

## 1. users (사용자)

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_users_email ON users(email);
```

### 필드 설명

| 필드 | 타입 | NULL | 설명 |
|------|------|------|------|
| id | BIGSERIAL | NO | PK, 자동증가 |
| email | VARCHAR(255) | NO | 이메일 (유니크) |
| password_hash | VARCHAR(255) | NO | 비밀번호 해시 (bcrypt) |
| name | VARCHAR(255) | NO | 사용자 이름 |
| role | VARCHAR(20) | NO | USER / ADMIN / PREMIUM |
| is_active | BOOLEAN | NO | 활성화 여부 |
| created_at | TIMESTAMP | NO | 생성일시 |
| updated_at | TIMESTAMP | NO | 수정일시 |

---

## 2. employees (직원)

```sql
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    resident_id_prefix VARCHAR(8) NOT NULL UNIQUE,
    birth_date DATE NOT NULL,
    is_foreigner BOOLEAN NOT NULL DEFAULT FALSE,
    visa_type VARCHAR(10),
    contract_start_date DATE NOT NULL,
    employment_type VARCHAR(20) NOT NULL,
    company_size VARCHAR(20) NOT NULL,
    work_start_time TIME NOT NULL DEFAULT '09:00:00',
    work_end_time TIME NOT NULL DEFAULT '18:00:00',
    break_minutes INTEGER NOT NULL DEFAULT 60,
    weekly_work_days INTEGER NOT NULL DEFAULT 5,
    daily_work_hours INTEGER NOT NULL DEFAULT 8,
    probation_months INTEGER NOT NULL DEFAULT 0,
    probation_rate INTEGER NOT NULL DEFAULT 100,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 인덱스
CREATE INDEX idx_employee_name ON employees(name);
CREATE INDEX idx_employee_contract_start ON employees(contract_start_date);
```

### 필드 설명

| 필드 | 타입 | NULL | 설명 |
|------|------|------|------|
| id | UUID | NO | PK |
| name | VARCHAR(100) | NO | 직원 이름 |
| resident_id_prefix | VARCHAR(8) | NO | 주민번호 앞7자리 (YYMMDD-N) |
| birth_date | DATE | NO | 생년월일 |
| is_foreigner | BOOLEAN | NO | 외국인 여부 |
| visa_type | VARCHAR(10) | YES | 체류자격 (외국인만) |
| contract_start_date | DATE | NO | 계약 시작일 |
| employment_type | VARCHAR(20) | NO | FULL_TIME / PART_TIME |
| company_size | VARCHAR(20) | NO | OVER_5 / UNDER_5 |
| work_start_time | TIME | NO | 근무 시작 |
| work_end_time | TIME | NO | 근무 종료 |
| break_minutes | INTEGER | NO | 휴게시간 (분) |
| weekly_work_days | INTEGER | NO | 주 근무일수 |
| daily_work_hours | INTEGER | NO | 일일 근무시간 |
| probation_months | INTEGER | NO | 수습기간 (월) |
| probation_rate | INTEGER | NO | 수습 급여율 (%) |
| created_at | DATE | NO | 생성일 |
| updated_at | DATE | NO | 수정일 |

### 체류자격 (visa_type) 값

| 값 | 설명 |
|----|------|
| E-9 | 비전문취업 |
| H-2 | 방문취업 |
| F-4 | 재외동포 |
| F-2 | 거주 |
| F-5 | 영주 |
| F-6 | 결혼이민 |
| D-7 | 주재 |
| D-8 | 기업투자 |
| D-9 | 무역경영 |

---

## 향후 추가 예정 테이블 (Phase 5+)

### payroll_periods (급여 기간)

```sql
CREATE TABLE payroll_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year_month VARCHAR(7) NOT NULL,  -- YYYY-MM
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',  -- DRAFT/CONFIRMED/PAID
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    pay_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### payroll_entries (급여대장 항목)

```sql
CREATE TABLE payroll_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID NOT NULL REFERENCES payroll_periods(id),
    employee_id UUID NOT NULL REFERENCES employees(id),
    base_salary BIGINT NOT NULL,
    total_allowances BIGINT NOT NULL DEFAULT 0,
    overtime_pay BIGINT NOT NULL DEFAULT 0,
    weekly_holiday_pay BIGINT NOT NULL DEFAULT 0,
    gross_pay BIGINT NOT NULL,
    insurance_deduction BIGINT NOT NULL,
    tax_deduction BIGINT NOT NULL,
    net_pay BIGINT NOT NULL,
    calculation_detail JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### work_shifts (근무 기록)

```sql
CREATE TABLE work_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    work_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_minutes INTEGER NOT NULL DEFAULT 0,
    is_holiday_work BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, work_date)
);
```

---

## ERD (Entity Relationship Diagram)

```
┌───────────────────┐
│      users        │
├───────────────────┤
│ id (PK)           │
│ email (UNIQUE)    │
│ password_hash     │
│ name              │
│ role              │
│ is_active         │
│ created_at        │
│ updated_at        │
└───────────────────┘

┌───────────────────┐
│    employees      │
├───────────────────┤
│ id (PK, UUID)     │
│ name              │
│ resident_id_prefix│
│ birth_date        │
│ is_foreigner      │
│ visa_type         │
│ contract_start_date│
│ employment_type   │
│ company_size      │
│ work_start_time   │
│ work_end_time     │
│ break_minutes     │
│ weekly_work_days  │
│ daily_work_hours  │
│ probation_months  │
│ probation_rate    │
│ created_at        │
│ updated_at        │
└───────────────────┘
```

---

## 마이그레이션 노트

### Hibernate DDL 설정

현재 `ddl-auto: update` 설정으로 Hibernate가 자동으로 스키마를 관리합니다.

**프로덕션 권장 설정:**
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate  # 운영환경
```

### Flyway 마이그레이션 (향후)

Flyway 활성화 시 `db/migration/` 폴더에 SQL 파일 추가:
- `V1__create_users_table.sql`
- `V2__create_employees_table.sql`
- `V3__create_payroll_tables.sql`

---

**작성자**: Claude Code
**버전**: 1.0.0
