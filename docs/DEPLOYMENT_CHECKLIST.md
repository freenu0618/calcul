# Railway 배포 체크리스트

배포 성공 여부를 확인하기 위한 단계별 체크리스트입니다.

## ✅ 배포 전 준비

- [ ] Git 커밋 완료 (`feat: Spring Boot 전환 완료`)
- [ ] Git push 완료 (master 브랜치)
- [ ] 프론트엔드 타입 수정 커밋 완료 (`fix: Spring Boot API 타입에 맞춰 프론트엔드 수정`)

## ✅ Railway 프로젝트 설정

### 1. 새 서비스 생성
- [ ] Railway 대시보드 접속
- [ ] **New Project** → **Deploy from GitHub repo**
- [ ] `freenu0618/calcul` 레포지토리 선택
- [ ] 서비스 이름: `paytools-spring-boot` (또는 원하는 이름)

### 2. 빌드 설정
- [ ] **Settings** → **Root Directory**: `backend-spring`
- [ ] **Build Command**: `./gradlew clean build -x test`
- [ ] **Start Command**: `java -jar api/build/libs/api.jar`
- [ ] **Watch Paths**: `backend-spring/**` (선택사항, 변경 감지 최적화)

### 3. PostgreSQL 추가
- [ ] 같은 프로젝트에 **New** → **Database** → **PostgreSQL** 추가
- [ ] Railway가 자동으로 `DATABASE_URL` 환경변수 생성 확인

## ✅ 환경변수 설정

Spring Boot 서비스의 **Variables** 탭에서 다음 환경변수 추가:

### 필수 환경변수
- [ ] `SPRING_PROFILES_ACTIVE=prod`
- [ ] `DATABASE_URL=${{Postgres.DATABASE_URL}}` (Reference Variables에서 선택)
- [ ] `JWT_SECRET=[32자 이상 랜덤 문자열]` (직접 생성)
- [ ] `PYTHON_API_URL=https://calcul-production.up.railway.app`
- [ ] `ALLOWED_ORIGINS=https://paytools.work,https://calcul-1b9.pages.dev`
- [ ] `PORT=8080`

### JWT_SECRET 생성 방법
```bash
# 로컬에서 실행
openssl rand -base64 32
```
또는 온라인 생성기 사용: https://generate-secret.vercel.app/32

## ✅ pgvector 확장 설치

PostgreSQL 서비스에서:
- [ ] **Data** 탭 클릭 → **Query** 클릭
- [ ] 다음 SQL 실행:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## ✅ 배포 실행

- [ ] **Deploy** 버튼 클릭 (또는 Git push로 자동 배포)
- [ ] 빌드 로그 확인 (3-5분 소요)
- [ ] 에러 없이 빌드 완료 확인

## ✅ 배포 후 테스트

### 1. 헬스 체크
```bash
curl https://[your-domain].up.railway.app/actuator/health
```
- [ ] 응답: `{"status":"UP"}`

### 2. Swagger UI 접속
- [ ] 브라우저에서 `https://[your-domain].up.railway.app/swagger-ui.html` 접속
- [ ] API 문서가 정상적으로 표시됨

### 3. 급여 계산 API 테스트
```bash
curl -X POST https://[your-domain].up.railway.app/api/v1/salary/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "employee": {
      "name": "테스트",
      "employment_type": "FULL_TIME",
      "company_size": "FIVE_OR_MORE",
      "dependents": 1,
      "children_under_20": 0,
      "scheduled_work_days": 5,
      "daily_work_hours": 8
    },
    "shifts": [{
      "date": "2026-01-20",
      "start_time": "09:00",
      "end_time": "18:00",
      "break_minutes": 60,
      "is_holiday": false
    }],
    "allowances": [],
    "wage_type": "MONTHLY",
    "base_salary": 2800000,
    "hourly_wage": 0,
    "calculation_month": "2026-01",
    "absence_policy": "MODERATE",
    "hours_mode": "174"
  }'
```
- [ ] 응답: `gross_pay: 2800000`, `net_pay: 약 2217000`

### 4. 보험료 조회 API 테스트
```bash
curl https://[your-domain].up.railway.app/api/v1/insurance/rates?year=2026
```
- [ ] 응답: 2026년 보험료율 (national_pension: 0.0475)

### 5. Flyway 마이그레이션 확인
Railway PostgreSQL **Query** 탭에서:
```sql
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
```
- [ ] V1 (init_user), V2 (create_employee_table) 마이그레이션 성공

## ✅ 프론트엔드 연동

### 1. Cloudflare Pages 환경변수 업데이트
- [ ] Cloudflare Pages 대시보드 → **Settings** → **Environment variables**
- [ ] `VITE_API_BASE_URL` 값 변경: `https://[your-domain].up.railway.app`
- [ ] **Save** 후 **Retry deployment** 클릭 (재배포 필수!)

### 2. 프론트엔드 빌드 확인
- [ ] Cloudflare Pages 빌드 성공 (약 1-2분)
- [ ] 빌드 로그에서 `VITE_API_BASE_URL` 올바르게 설정됨 확인

### 3. 프론트엔드 테스트
- [ ] https://paytools.work 접속
- [ ] 급여 계산기 페이지 이동
- [ ] 테스트 데이터 입력:
  - 고용형태: 정규직
  - 기본급: 2,800,000원
  - 시프트 1개 추가
- [ ] **급여 계산하기** 클릭
- [ ] 실수령액 약 2,217,000원 표시
- [ ] 콘솔에 CORS 에러 없음

## ✅ 문제 해결

### 빌드 실패 시
- [ ] Railway 배포 로그에서 에러 메시지 확인
- [ ] `./gradlew clean build` 로컬에서 성공하는지 확인
- [ ] Java 17 사용 확인 (`gradle.properties`)

### 데이터베이스 연결 실패 시
- [ ] `DATABASE_URL` 환경변수 올바른지 확인
- [ ] PostgreSQL 서비스가 같은 프로젝트에 있는지 확인
- [ ] Flyway 마이그레이션 로그 확인

### CORS 에러 시
- [ ] `ALLOWED_ORIGINS` 환경변수에 프론트엔드 도메인 포함 확인
- [ ] Spring Boot 재배포
- [ ] 브라우저 개발자 도구 Network 탭에서 응답 헤더 확인

### 404 Not Found 시
- [ ] Swagger UI에서 사용 가능한 엔드포인트 확인
- [ ] URL 경로가 `/api/v1/...` 형식인지 확인
- [ ] Spring Boot 시작 로그에서 컨트롤러 매핑 확인

## ✅ 배포 완료

모든 체크리스트 항목이 완료되면:

### Railway 배포 정보
- **Spring Boot URL**: `https://[your-domain].up.railway.app`
- **Swagger UI**: `https://[your-domain].up.railway.app/swagger-ui.html`
- **Health**: `https://[your-domain].up.railway.app/actuator/health`

### 프론트엔드
- **URL**: https://paytools.work
- **API Base URL**: Spring Boot 도메인으로 변경됨

### 데이터베이스
- **PostgreSQL**: Railway managed
- **pgvector**: 설치 완료
- **Flyway**: 2개 마이그레이션 성공

## 📝 다음 단계

배포 성공 후:
1. ✅ Phase S3 완료 - Spring Boot 전환 및 배포
2. 🔄 Python 서버를 게이트웨이로만 사용 (점진적 축소)
3. 📋 Phase 3.5 시작 - 근무자 등록 시스템 구현

---

**작성일**: 2026-01-25
**버전**: Spring Boot 3.2.2 + Kotlin 1.9.22
