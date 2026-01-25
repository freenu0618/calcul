# Paytools Spring Backend

급여 계산기 프로젝트의 Spring Boot 백엔드입니다.

## 기술 스택

- **Language**: Kotlin 1.9
- **Framework**: Spring Boot 3.2
- **Build**: Gradle (Kotlin DSL)
- **Database**: PostgreSQL 16 + pgvector
- **Authentication**: JWT (기존 Python과 호환)
- **Migration**: Flyway

## 프로젝트 구조

```
backend-spring/
├── api/             # Controller, DTO, GlobalExceptionHandler
├── domain/          # Entity, VO, Service (외부 의존성 없음)
├── infrastructure/  # JPA Repository, Security, Proxy
└── common/          # 공통 유틸, 예외 정의
```

## 시작하기

### 1. 환경 요구사항

- JDK 17+
- Docker & Docker Compose (선택)

### 2. 데이터베이스 설정

**Option A: Docker 사용 (권장)**
```bash
docker-compose up -d
```

**Option B: 로컬 PostgreSQL**
```sql
CREATE DATABASE paytools;
CREATE USER paytools WITH PASSWORD 'paytools123';
GRANT ALL PRIVILEGES ON DATABASE paytools TO paytools;
```

### 3. Gradle Wrapper 초기화

```bash
# Windows
gradlew.bat wrapper --gradle-version=8.5

# Linux/Mac
./gradlew wrapper --gradle-version=8.5
```

### 4. 빌드 및 실행

```bash
# 빌드
./gradlew build

# 실행
./gradlew :api:bootRun
```

### 5. API 확인

- Swagger UI: http://localhost:8080/swagger-ui.html
- Health Check: http://localhost:8080/actuator/health

## 환경 프로파일

- `local`: 로컬 개발 (기본)
- `dev`: 개발 서버
- `prod`: 운영 서버

## 아키텍처 (3단계 전환)

### 1단계: 게이트웨이 (현재)
```
React → Spring Boot (인증) → Python (급여계산 프록시)
```

### 2단계: 도메인 전환 (예정)
```
React → Spring Boot (인증 + 급여계산) → Python (축소)
```

### 3단계: AI 서비스 분리 (예정)
```
React → Spring Boot (전체 API) ←→ Python (AI 전용)
```

## API 엔드포인트

### 인증 (Spring 직접 처리)
- `POST /api/v1/auth/register` - 회원가입
- `POST /api/v1/auth/login` - 로그인

### 프록시 (Python 전달)
- `POST /api/v1/salary/calculate` - 급여 계산
- `POST /api/v1/salary/reverse-calculate` - 역산
- `GET /api/v1/insurance/rates` - 보험료율
- `POST /api/v1/insurance/calculate` - 보험료 계산
- `POST /api/v1/tax/estimate` - 세금 계산

## 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `DATABASE_URL` | PostgreSQL URL | jdbc:postgresql://localhost:5432/paytools |
| `DATABASE_USERNAME` | DB 사용자 | paytools |
| `DATABASE_PASSWORD` | DB 비밀번호 | paytools123 |
| `JWT_SECRET` | JWT 서명 키 | (32자 이상) |
| `PYTHON_API_URL` | Python 서버 URL | http://localhost:8000 |

## 테스트

```bash
# 단위 테스트
./gradlew test

# 통합 테스트 (TestContainers 필요)
./gradlew integrationTest
```

## 라이선스

Private - Paytools Project