# Railway 배포 가이드 - Spring Boot 전환

## 1. Railway 프로젝트 생성

### 1.1 새 프로젝트 생성
1. Railway 대시보드 접속: https://railway.app/dashboard
2. **New Project** 클릭
3. **Deploy from GitHub repo** 선택
4. `freenu0618/calcul` 레포지토리 선택

### 1.2 서비스 설정

Railway는 자동으로 루트 디렉토리를 감지합니다. Spring Boot 프로젝트를 배포하려면:

1. **Settings** → **Root Directory** → `backend-spring` 입력
2. **Build Command**: `./gradlew clean build -x test`
3. **Start Command**: `java -jar api/build/libs/api.jar`

## 2. PostgreSQL 데이터베이스 추가

### 2.1 PostgreSQL 서비스 생성
1. 프로젝트 대시보드에서 **New** 클릭
2. **Database** → **PostgreSQL** 선택
3. Railway가 자동으로 `DATABASE_URL` 환경변수 생성

### 2.2 pgvector 확장 설치
```sql
-- Railway PostgreSQL 콘솔에서 실행
CREATE EXTENSION IF NOT EXISTS vector;
```

또는 `init-scripts/01-init-pgvector.sql` 파일 내용을 복사해서 실행

## 3. 환경변수 설정

### 3.1 필수 환경변수

Spring Boot 서비스의 **Variables** 탭에서 다음 환경변수 추가:

```bash
# Spring Profile (prod로 설정)
SPRING_PROFILES_ACTIVE=prod

# PostgreSQL (Railway가 자동 설정)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Secret (32자 이상 랜덤 문자열)
JWT_SECRET=your-secure-256-bit-secret-key-here-change-this-in-production

# Python API URL (기존 Python 서버 - Phase S1 게이트웨이용)
PYTHON_API_URL=https://calcul-production.up.railway.app

# CORS 허용 도메인
ALLOWED_ORIGINS=https://paytools.work,https://calcul-1b9.pages.dev

# 서버 포트 (Railway 자동 할당)
PORT=8080
```

### 3.2 프로덕션 설정 확인

`backend-spring/api/src/main/resources/application-prod.yml` 파일이 다음과 같이 설정되어 있는지 확인:

```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
  jpa:
    hibernate:
      ddl-auto: validate  # 프로덕션에서는 validate만 사용
  flyway:
    enabled: true  # 마이그레이션 자동 실행

server:
  port: ${PORT:8080}
```

## 4. 배포 실행

### 4.1 자동 배포
- Git push 시 자동 배포 (GitHub 연동)
- 또는 Railway 대시보드에서 **Deploy** 클릭

### 4.2 배포 로그 확인
1. **Deployments** 탭에서 진행 상황 확인
2. 빌드 로그에서 에러 체크:
   - Gradle 빌드 성공 여부
   - Flyway 마이그레이션 성공 여부
   - Spring Boot 시작 로그

### 4.3 예상 빌드 시간
- 초기 빌드: 3-5분 (의존성 다운로드)
- 이후 빌드: 1-2분

## 5. 배포 후 테스트

### 5.1 헬스 체크
```bash
# Railway가 할당한 도메인 확인 (예: paytools-spring.up.railway.app)
curl https://your-app.up.railway.app/actuator/health
```

예상 응답:
```json
{
  "status": "UP"
}
```

### 5.2 API 테스트

#### Swagger UI 접속
```
https://your-app.up.railway.app/swagger-ui.html
```

#### 급여 계산 API 테스트
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
        "start_time": "09:00",
        "end_time": "18:00",
        "break_minutes": 60,
        "is_holiday": false
      }
    ],
    "allowances": [],
    "wage_type": "MONTHLY",
    "calculation_month": "2026-01"
  }'
```

#### 보험료 조회 API 테스트
```bash
curl https://your-app.up.railway.app/api/v1/insurance/rates?year=2026
```

## 6. 프론트엔드 환경변수 업데이트

### 6.1 Cloudflare Pages 환경변수 수정
1. Cloudflare Pages 대시보드 접속
2. **Settings** → **Environment variables**
3. `VITE_API_BASE_URL` 수정:
   ```
   VITE_API_BASE_URL=https://your-spring-app.up.railway.app
   ```
4. **Save** 후 **Retry deployment** (재배포 필수)

### 6.2 CORS 확인
Spring Boot `application-prod.yml`의 `ALLOWED_ORIGINS`에 프론트엔드 도메인이 포함되어 있는지 확인:
```yaml
# SecurityConfig.kt에서 참조
ALLOWED_ORIGINS=https://paytools.work,https://calcul-1b9.pages.dev
```

## 7. 데이터베이스 마이그레이션 확인

### 7.1 Flyway 마이그레이션 로그 확인
배포 로그에서 다음 메시지 확인:
```
Flyway: Migrating schema "public" to version "1 - init user"
Flyway: Migrating schema "public" to version "2 - create employee table"
Flyway: Successfully applied 2 migrations
```

### 7.2 수동 마이그레이션 확인 (필요시)
Railway PostgreSQL 콘솔에서:
```sql
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
```

## 8. 문제 해결

### 8.1 빌드 실패
**증상**: Gradle 빌드 에러
**해결**:
1. 로컬에서 `./gradlew clean build` 성공 확인
2. `.gitignore`에 `build/` 폴더가 포함되어 있는지 확인
3. Railway 빌드 커맨드: `./gradlew clean build -x test`

### 8.2 데이터베이스 연결 실패
**증상**: `Connection refused` 또는 `Authentication failed`
**해결**:
1. `DATABASE_URL` 환경변수가 올바르게 설정되었는지 확인
2. PostgreSQL 서비스가 같은 프로젝트에 있는지 확인
3. Flyway 마이그레이션이 성공했는지 로그 확인

### 8.3 CORS 에러
**증상**: 프론트엔드에서 API 호출 시 CORS 에러
**해결**:
1. `ALLOWED_ORIGINS` 환경변수에 프론트엔드 도메인 추가
2. Spring Boot 재배포
3. 브라우저 개발자 도구에서 네트워크 탭 확인

### 8.4 404 Not Found
**증상**: API 엔드포인트가 404 반환
**해결**:
1. Swagger UI 접속해서 사용 가능한 엔드포인트 확인
2. URL 경로가 `/api/v1/...` 형식인지 확인
3. 컨트롤러가 제대로 빈으로 등록되었는지 로그 확인

## 9. 모니터링 및 로그

### 9.1 실시간 로그 확인
Railway 대시보드 → **Deployments** → 최신 배포 클릭 → **View Logs**

### 9.2 Actuator 엔드포인트
- `/actuator/health` - 헬스 체크
- `/actuator/info` - 애플리케이션 정보
- `/actuator/metrics` - 메트릭

### 9.3 로그 레벨 조정 (필요시)
`application-prod.yml`에서 로그 레벨 조정:
```yaml
logging:
  level:
    root: INFO
    com.paytools: DEBUG  # 디버깅 필요 시 DEBUG로 변경
```

## 10. 배포 체크리스트

### 배포 전
- [ ] 로컬에서 `./gradlew clean build` 성공
- [ ] 로컬에서 `./gradlew test` 성공 (20개 테스트)
- [ ] `application-prod.yml` 프로덕션 설정 확인
- [ ] Git commit & push

### Railway 설정
- [ ] PostgreSQL 서비스 생성
- [ ] pgvector 확장 설치
- [ ] 환경변수 설정 (JWT_SECRET, DATABASE_URL, ALLOWED_ORIGINS)
- [ ] Root Directory: `backend-spring`
- [ ] Build Command: `./gradlew clean build -x test`
- [ ] Start Command: `java -jar api/build/libs/api.jar`

### 배포 후
- [ ] 헬스 체크 성공 (`/actuator/health`)
- [ ] Swagger UI 접속 성공
- [ ] 급여 계산 API 테스트 성공
- [ ] 보험료 조회 API 테스트 성공
- [ ] Flyway 마이그레이션 로그 확인
- [ ] 프론트엔드 환경변수 업데이트 (VITE_API_BASE_URL)
- [ ] 프론트엔드 재배포
- [ ] 프론트엔드에서 API 호출 테스트

## 11. 예상 비용

| 항목 | 무료 티어 | 예상 비용 |
|------|-----------|-----------|
| Spring Boot 서비스 | $5/월 | $5/월 |
| PostgreSQL (Shared) | $5/월 | $5/월 |
| **총계** | - | **$10/월** |

> Railway Hobby Plan: $5 크레딧/월 제공
> 초과 사용 시 추가 과금

## 12. 다음 단계

배포 성공 후:
1. **Phase 3.5** 진행 - 근무자 등록 시스템 (Employee Management)
2. Python 서버 점진적 축소 (게이트웨이만 유지)
3. Phase 6에서 Python AI 마이크로서비스로 완전 전환

---

**작성일**: 2026-01-25
**Spring Boot 버전**: 3.2.2
**Kotlin 버전**: 1.9.22
