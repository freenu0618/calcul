# Paytools 배포 가이드

**버전**: v1.0.0
**최종 수정**: 2026-01-28
**상태**: Approved

---

## 개요

Paytools 서비스 배포 통합 가이드입니다.

| 구성 요소 | 플랫폼 | URL |
|----------|--------|-----|
| 프론트엔드 | Cloudflare Pages | https://paytools.work |
| 백엔드 | Railway | https://calcul-production.up.railway.app |
| 데이터베이스 | Railway PostgreSQL | (자동 연결) |

---

## 1. 프론트엔드 배포 (Cloudflare Pages)

### 1.1 빌드 설정

| 항목 | 값 |
|------|-----|
| Framework preset | Vite |
| Build command | `cd frontend && npm install && npm run build` |
| Build output | `frontend/dist` |
| Root directory | (비워둠) |

### 1.2 환경 변수

```bash
VITE_API_BASE_URL=https://calcul-production.up.railway.app
```

### 1.3 커스텀 도메인

1. Cloudflare Pages → Custom domains
2. `paytools.work` 추가
3. DNS 자동 설정 (CNAME)
4. SSL 자동 적용

---

## 2. 백엔드 배포 (Railway - Spring Boot)

### 2.1 Railway 프로젝트 설정

| 항목 | 값 |
|------|-----|
| Root Directory | `backend-spring` |
| Build Command | `./gradlew clean build -x test` |
| Start Command | `java -jar api/build/libs/api.jar` |

### 2.2 필수 환경 변수

```bash
# Spring Profile
SPRING_PROFILES_ACTIVE=prod

# PostgreSQL (Railway 자동 설정)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Secret (32자 이상)
JWT_SECRET=your-secure-256-bit-secret-key-here

# CORS
ALLOWED_ORIGINS=https://paytools.work,https://calcul-1b9.pages.dev

# 서버 포트
PORT=8080
```

### 2.3 PostgreSQL 설정

1. Railway → New → Database → PostgreSQL
2. pgvector 확장 설치:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2.4 배포 실행

- **자동 배포**: Git push 시 자동
- **수동 배포**: Railway 대시보드 → Deploy 클릭
- **예상 시간**: 초기 3-5분, 이후 1-2분

---

## 3. 배포 후 검증

### 3.1 헬스 체크

```bash
curl https://calcul-production.up.railway.app/actuator/health
# 예상: {"status":"UP"}
```

### 3.2 API 테스트

```bash
# 급여 계산 API
curl -X POST https://calcul-production.up.railway.app/api/v1/salary/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "employee": {
      "employment_type": "FULL_TIME",
      "company_size": "FIVE_OR_MORE",
      "base_salary": 2800000
    },
    "shifts": [],
    "allowances": [],
    "wage_type": "MONTHLY",
    "calculation_month": "2026-01"
  }'
```

### 3.3 Swagger UI

```
https://calcul-production.up.railway.app/swagger-ui.html
```

---

## 4. 배포 체크리스트

### 배포 전
- [ ] 로컬 `./gradlew clean build` 성공
- [ ] 로컬 `./gradlew test` 성공 (20개 테스트)
- [ ] `application-prod.yml` 설정 확인
- [ ] Git commit & push

### Railway 설정
- [ ] PostgreSQL 서비스 생성
- [ ] pgvector 확장 설치
- [ ] 환경 변수 설정

### 배포 후
- [ ] 헬스 체크 성공
- [ ] Swagger UI 접속
- [ ] 급여 계산 API 테스트
- [ ] Flyway 마이그레이션 로그 확인
- [ ] 프론트엔드 → 백엔드 통신 테스트

---

## 5. 비용

| 항목 | 플랫폼 | 비용 |
|------|--------|------|
| 프론트엔드 | Cloudflare Pages | **무료** |
| 백엔드 | Railway | ~$5/월 |
| PostgreSQL | Railway | 포함 |
| 도메인 | Cloudflare | $10-15/년 |
| **총계** | | **~$5/월** |

---

## 6. 모니터링

### 6.1 로그 확인
- Railway → Deployments → View Logs

### 6.2 Actuator 엔드포인트
- `/actuator/health` - 헬스 체크
- `/actuator/info` - 앱 정보
- `/actuator/metrics` - 메트릭

### 6.3 Uptime 모니터링
- [UptimeRobot](https://uptimerobot.com) (무료)
- 5분마다 헬스 체크
- 다운 시 이메일 알림

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0.0 | 2026-01-28 | 4개 배포 문서 통합 (Spring Boot 기준) |
