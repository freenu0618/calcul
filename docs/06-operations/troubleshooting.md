# 트러블슈팅 가이드

**버전**: v1.0.0
**최종 수정**: 2026-01-28
**상태**: Approved

---

## 개요

Paytools 서비스 운영 중 발생할 수 있는 일반적인 문제와 해결 방법을 정리합니다.

---

## 1. CORS 에러

### 증상
```
Access to XMLHttpRequest at 'https://calcul-production.up.railway.app/api/v1/...'
from origin 'https://paytools.work' has been blocked by CORS policy
```

### 원인
- `ALLOWED_ORIGINS` 환경 변수에 프론트엔드 도메인 누락
- SecurityConfig.kt CORS 설정 문제

### 해결 방법

1. Railway 환경 변수 확인:
```bash
ALLOWED_ORIGINS=https://paytools.work,https://calcul-1b9.pages.dev,http://localhost:5173
```

2. SecurityConfig.kt 확인:
```kotlin
allowedOrigins = listOf(
    "http://localhost:5173",
    "https://paytools.work",
    "https://calcul-1b9.pages.dev"
)
```

3. 백엔드 재배포 후 브라우저 캐시 클리어

---

## 2. 403 Forbidden 에러

### 증상
```
403 Forbidden
```

### 원인
- API 엔드포인트 권한 설정 문제
- JWT 토큰 만료 또는 유효하지 않음

### 해결 방법

1. SecurityConfig.kt에서 엔드포인트 권한 확인:
```kotlin
.requestMatchers("/api/v1/auth/**").permitAll()
.requestMatchers("/api/v1/salary/**").permitAll()
.requestMatchers("/api/v1/insurance/**").permitAll()
.requestMatchers("/api/v1/tax/**").permitAll()
.anyRequest().authenticated()
```

2. JWT 토큰 확인:
   - 로그아웃 후 다시 로그인
   - 브라우저 localStorage 클리어

---

## 3. 500 Internal Server Error

### 증상
```
500 Internal Server Error
```

### 원인
- 데이터베이스 연결 실패
- 환경 변수 누락
- 애플리케이션 예외

### 해결 방법

1. Railway 로그 확인:
```
Railway Dashboard → Deployments → View Logs
```

2. 데이터베이스 연결 확인:
```bash
# DATABASE_URL 환경 변수 확인
# PostgreSQL 서비스 상태 확인
```

3. 헬스 체크:
```bash
curl https://calcul-production.up.railway.app/actuator/health
```

---

## 4. 빌드 실패

### 증상
Railway 배포 중 빌드 에러

### 원인
- Gradle 빌드 실패
- 의존성 충돌
- 테스트 실패

### 해결 방법

1. 로컬에서 먼저 테스트:
```bash
cd backend-spring
./gradlew clean build
./gradlew test
```

2. Railway 빌드 커맨드 확인:
```
./gradlew clean build -x test
```

3. Root Directory 확인: `backend-spring`

---

## 5. Cloudflare 환경 변수 문제

### 증상
프론트엔드에서 API URL이 잘못됨

### 원인
- `VITE_API_BASE_URL` 환경 변수 미설정
- 재배포 안함

### 해결 방법

1. Cloudflare Pages → Settings → Environment variables
2. 환경 변수 설정:
```
VITE_API_BASE_URL=https://calcul-production.up.railway.app
```
3. **반드시 재배포** (Retry deployment)

---

## 6. PostgreSQL 연결 실패

### 증상
```
Connection refused
FATAL: password authentication failed
```

### 원인
- DATABASE_URL 형식 오류
- PostgreSQL 서비스 미생성

### 해결 방법

1. DATABASE_URL 형식 확인:
```
postgresql://user:password@host:port/database
```

2. Railway에서 PostgreSQL 서비스가 같은 프로젝트에 있는지 확인

3. 연결 테스트:
```sql
SELECT * FROM flyway_schema_history;
```

---

## 7. 네비게이션 바 안 보임

### 증상
웹사이트에서 네비게이션 바가 보이지 않음

### 원인
- CSS 색상 문제 (흰색 배경에 흰색 텍스트)

### 해결 방법

Navigation.tsx에서 텍스트 색상 확인:
```tsx
// 잘못된 예
className="text-white"

// 올바른 예
className="text-gray-700"
className="text-primary"
```

---

## 8. 한글 깨짐 (UTF-8)

### 증상
API 응답에서 한글이 깨져서 표시됨

### 원인
- CharacterEncodingFilter 미설정
- Content-Type 헤더 문제

### 해결 방법

1. SecurityConfig.kt에 인코딩 필터 추가:
```kotlin
@Bean
fun characterEncodingFilter(): CharacterEncodingFilter {
    return CharacterEncodingFilter().apply {
        encoding = "UTF-8"
        setForceEncoding(true)
    }
}
```

2. application.yml 설정:
```yaml
server:
  servlet:
    encoding:
      charset: UTF-8
      force: true
```

---

## 9. 휴게시간 자동계산 안됨

### 증상
근무시간 입력 시 휴게시간이 자동으로 변경되지 않음

### 원인
- handleWorkTimeChange 함수 미연결

### 해결 방법

EmployeeForm.tsx에서 onChange 핸들러 확인:
```tsx
<input
  type="time"
  value={form.work_start_time}
  onChange={(e) => handleWorkTimeChange('work_start_time', e.target.value)}
/>
```

---

## 빠른 진단 체크리스트

| 증상 | 확인 사항 |
|------|----------|
| CORS 에러 | ALLOWED_ORIGINS 환경 변수 |
| 403 에러 | SecurityConfig 권한 설정, JWT 토큰 |
| 500 에러 | Railway 로그, DB 연결 |
| 빌드 실패 | 로컬 빌드 테스트, 의존성 |
| 프론트엔드 API 안됨 | VITE_API_BASE_URL, 재배포 |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0.0 | 2026-01-28 | 최초 작성 |
