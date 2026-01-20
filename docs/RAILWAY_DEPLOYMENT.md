# Railway 백엔드 배포 가이드

## Railway란?

Railway는 GitHub 연동만으로 쉽게 배포할 수 있는 클라우드 플랫폼입니다.

### 장점
- ✅ **초보자 친화적**: 복잡한 설정 없이 클릭 몇 번으로 배포
- ✅ **무료 티어**: 월 $5 크레딧 제공 (약 500시간 실행)
- ✅ **PostgreSQL 자동 연결**: 버튼 클릭으로 DB 생성
- ✅ **GitHub 자동 배포**: Push 시 자동 빌드/배포
- ✅ **실시간 로그**: 디버깅 편리
- ✅ **커스텀 도메인**: 무료 SSL 인증서

---

## 1단계: Railway 계정 생성

### 1-1. 회원가입
1. https://railway.app 접속
2. **Login with GitHub** 클릭
3. GitHub 계정 인증
4. 이메일 인증 완료

### 1-2. 결제 정보 등록 (무료 티어 사용 시에도 필요)
1. Dashboard → **Settings** → **Billing**
2. 신용카드 정보 입력
3. **무료 $5 크레딧**이 자동 충전됨

> ⚠️ **주의**: 무료 크레딧 소진 시 과금될 수 있으므로, 사용량 모니터링 필요

---

## 2단계: GitHub 레포지토리 연결

### 2-1. 새 프로젝트 생성
1. Railway Dashboard → **New Project**
2. **Deploy from GitHub repo** 선택
3. **Configure GitHub App** 클릭

### 2-2. GitHub 권한 부여
1. Repository access → **Only select repositories** 선택
2. `salary-calculator` 레포지토리 선택
3. **Install & Authorize** 클릭

### 2-3. 레포지토리 선택
1. `salary-calculator` 레포지토리 클릭
2. **Deploy Now** 클릭

> Railway가 자동으로 Python 프로젝트를 감지하고 빌드를 시작합니다.

---

## 3단계: 백엔드 서비스 설정

### 3-1. Root Directory 설정
Railway는 기본적으로 루트 디렉토리에서 빌드를 시도합니다.

1. 프로젝트 대시보드 → **서비스 클릭** (예: `salary-calculator`)
2. **Settings** 탭 클릭
3. **Source** 섹션에서 **Root Directory** 설정:
   ```
   backend
   ```
4. **Save** 클릭

### 3-2. Start Command 확인
Railway가 `Procfile` 또는 `railway.toml`을 자동 감지합니다.

**확인 방법**:
1. **Settings** → **Deploy** 섹션
2. **Start Command** 확인:
   ```
   uvicorn app.api.main:app --host 0.0.0.0 --port $PORT
   ```

> 자동 감지되지 않으면 수동으로 입력하세요.

### 3-3. Health Check 설정
1. **Settings** → **Healthcheck**
2. **Healthcheck Path** 입력:
   ```
   /health
   ```
3. **Healthcheck Timeout**: 300초
4. **Save**

---

## 4단계: PostgreSQL 데이터베이스 추가

### 4-1. PostgreSQL 생성
1. 프로젝트 대시보드 → **New** 버튼 클릭
2. **Database** → **Add PostgreSQL** 선택
3. 자동으로 PostgreSQL 인스턴스 생성됨

### 4-2. 환경 변수 자동 연결
Railway가 자동으로 `DATABASE_URL` 환경 변수를 생성합니다.

**확인 방법**:
1. PostgreSQL 서비스 클릭
2. **Variables** 탭 클릭
3. `DATABASE_URL` 값 확인:
   ```
   postgresql://postgres:PASSWORD@HOST:PORT/railway
   ```

> ⚠️ **주의**: `postgres://`가 아닌 `postgresql://` 형식이어야 합니다.
> 백엔드 코드에서 자동 변환 처리됨 (`backend/app/db/database.py`)

---

## 5단계: 환경 변수 설정

### 5-1. CORS 설정
1. 백엔드 서비스 클릭
2. **Variables** 탭 클릭
3. **New Variable** 클릭
4. 다음 환경 변수 추가:

```bash
# 프론트엔드 도메인 (Cloudflare Pages URL)
ALLOWED_ORIGINS=https://salary-calculator.pages.dev

# 또는 커스텀 도메인 사용 시
ALLOWED_ORIGINS=https://salary-calculator.pages.dev,https://yourdomain.com
```

### 5-2. 환경 변수 목록

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `DATABASE_URL` | (자동 생성) | PostgreSQL 연결 URL |
| `ALLOWED_ORIGINS` | `https://salary-calculator.pages.dev` | CORS 허용 도메인 |
| `PORT` | (자동 생성) | Railway가 자동 할당 |

### 5-3. 환경 변수 적용
1. **Save** 클릭
2. 서비스 자동 재시작 (약 30초 소요)

---

## 6단계: 배포 확인

### 6-1. 빌드 로그 확인
1. 백엔드 서비스 클릭
2. **Deployments** 탭 클릭
3. 최근 배포 클릭
4. **View Logs** 클릭

**성공 시 로그**:
```
Building...
Successfully built
Starting...
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### 6-2. 배포 URL 확인
1. 백엔드 서비스 클릭
2. **Settings** → **Domains** 섹션
3. Railway 제공 URL 확인:
   ```
   https://salary-calculator-production.up.railway.app
   ```

### 6-3. API 테스트
브라우저에서 접속:
```
https://salary-calculator-production.up.railway.app/health
```

**예상 응답**:
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### 6-4. Swagger UI 확인
```
https://salary-calculator-production.up.railway.app/docs
```

---

## 7단계: 커스텀 도메인 연결 (선택 사항)

### 7-1. Railway 도메인 추가
1. 백엔드 서비스 클릭
2. **Settings** → **Domains**
3. **Custom Domain** 클릭
4. 도메인 입력 (예: `api.yourdomain.com`)

### 7-2. Cloudflare DNS 설정
1. Cloudflare 대시보드 → **DNS** → **Records**
2. **Add record** 클릭
3. 다음 정보 입력:
   ```
   Type: CNAME
   Name: api
   Target: salary-calculator-production.up.railway.app
   Proxy status: DNS only (회색 구름)
   TTL: Auto
   ```
4. **Save** 클릭

### 7-3. SSL 인증서 확인
Railway가 자동으로 Let's Encrypt SSL 인증서를 발급합니다 (5-10분 소요).

**확인 방법**:
```
https://api.yourdomain.com/health
```

---

## 8단계: Cloudflare Pages 환경 변수 업데이트

### 8-1. 프론트엔드 API URL 변경
1. Cloudflare Pages 대시보드 → **salary-calculator** 프로젝트
2. **Settings** → **Environment variables**
3. **Production** 탭 클릭
4. **Add variable** 클릭:
   ```
   Variable name: VITE_API_BASE_URL
   Value: https://api.yourdomain.com

   또는 Railway 기본 도메인:
   Value: https://salary-calculator-production.up.railway.app
   ```
5. **Save** 클릭

### 8-2. 프론트엔드 재배포
1. Cloudflare Pages → **Deployments** 탭
2. **Retry deployment** 클릭 (또는 GitHub Push)

---

## 9단계: Railway 환경 변수 업데이트

### 9-1. CORS 도메인 추가
백엔드 서비스 → **Variables** → `ALLOWED_ORIGINS` 수정:
```bash
# Railway 기본 도메인 사용 시
ALLOWED_ORIGINS=https://salary-calculator.pages.dev

# 커스텀 도메인 사용 시
ALLOWED_ORIGINS=https://salary-calculator.pages.dev,https://yourdomain.com
```

---

## 10단계: 전체 통합 테스트

### 10-1. 프론트엔드에서 API 호출 테스트
1. 브라우저에서 프론트엔드 접속:
   ```
   https://salary-calculator.pages.dev
   ```

2. 개발자 도구 (F12) 열기

3. **급여 계산** 버튼 클릭

4. **Network** 탭에서 확인:
   - `/api/v1/salary/calculate` 요청 확인
   - Status: `200 OK`
   - CORS 에러 없음

### 10-2. PostgreSQL 데이터 확인
1. Railway 대시보드 → PostgreSQL 서비스 클릭
2. **Data** 탭 클릭 (또는 **Connect** → **psql**)
3. 테이블 조회:
   ```sql
   -- 테이블 목록
   \dt

   -- employees 테이블 조회
   SELECT * FROM employees LIMIT 5;
   ```

---

## 11단계: 모니터링 및 유지보수

### 11-1. 사용량 확인
1. Railway Dashboard → **Usage**
2. 월별 크레딧 사용량 확인:
   - 실행 시간
   - 데이터베이스 용량
   - 네트워크 대역폭

**무료 티어 제한**:
- 월 $5 크레딧
- 약 500시간 실행 (월 730시간 기준, 68% 가동률)

### 11-2. 로그 모니터링
1. 백엔드 서비스 → **Deployments** → 최근 배포 클릭
2. **View Logs** 클릭
3. 실시간 로그 스트리밍

**에러 추적**:
```
# 에러 필터링
grep -i "error" logs.txt

# 특정 API 호출 추적
grep "/api/v1/salary/calculate" logs.txt
```

### 11-3. 알림 설정 (선택 사항)
1. Railway Dashboard → **Project Settings** → **Notifications**
2. **Slack** 또는 **Email** 연동
3. 배포 실패, 서비스 다운 시 알림

---

## 트러블슈팅

### 문제 1: 빌드 실패 (Module not found)
**원인**: `requirements.txt`에 누락된 패키지

**해결**:
```bash
cd backend
pip freeze > requirements.txt
git add requirements.txt
git commit -m "fix: requirements.txt 업데이트"
git push origin main
```

### 문제 2: DATABASE_URL 연결 실패
**원인**: `postgres://` → `postgresql://` 변환 실패

**확인**:
```python
# backend/app/db/database.py
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
```

### 문제 3: CORS 에러
**원인**: `ALLOWED_ORIGINS` 환경 변수 누락 또는 오타

**해결**:
```bash
# Railway Variables 확인
ALLOWED_ORIGINS=https://salary-calculator.pages.dev
```

### 문제 4: 502 Bad Gateway
**원인**: 백엔드 서비스 크래시 또는 시작 실패

**해결**:
```bash
# Railway Logs 확인
# Settings → Start Command 확인:
uvicorn app.api.main:app --host 0.0.0.0 --port $PORT
```

### 문제 5: Health Check 실패
**원인**: `/health` 엔드포인트 미응답

**확인**:
```bash
curl https://salary-calculator-production.up.railway.app/health
```

---

## 비용 관리

### 무료 티어 최적화
| 항목 | 설정 | 목적 |
|------|------|------|
| **Sleep on Idle** | 비활성화 (기본값) | Cold Start 방지 |
| **Minimum Replicas** | 1 (기본값) | 항상 실행 |
| **Auto Scaling** | 비활성화 | 비용 절감 |

### 예상 월 비용
| 시나리오 | 실행 시간 | 비용 |
|----------|----------|------|
| **무료 티어** | 500시간 (68% 가동률) | $5 크레딧 |
| **초과 시** | 730시간 (100% 가동률) | $5 + $2 = $7 |

### 비용 절감 팁
1. **개발 환경 분리**: 개발용 브랜치는 Railway로 배포하지 않기
2. **Sleep on Idle 활성화**: 트래픽 낮을 때 자동 슬립 (Cold Start 감수)
3. **모니터링**: Railway Usage 페이지에서 매일 확인

---

## 다음 단계

- [ ] Railway 배포 완료 확인
- [ ] Cloudflare Pages 환경 변수 업데이트
- [ ] CORS 테스트
- [ ] Google AdSense Publisher ID 교체
- [ ] Google Search Console 사이트 등록
- [ ] 성능 테스트 (Lighthouse)
- [ ] 사용량 모니터링 설정

---

## 참고 자료

- [Railway 공식 문서](https://docs.railway.app/)
- [Railway Python 배포 가이드](https://docs.railway.app/guides/python)
- [Railway PostgreSQL 가이드](https://docs.railway.app/databases/postgresql)
- [FastAPI 배포 가이드](https://fastapi.tiangolo.com/deployment/)

---

## 빠른 체크리스트

### 배포 전
- [ ] GitHub 레포지토리 생성 및 Push
- [ ] `backend/Procfile` 파일 확인
- [ ] `backend/railway.toml` 파일 확인
- [ ] `backend/requirements.txt` 최신화

### Railway 설정
- [ ] Railway 계정 생성 및 GitHub 연동
- [ ] Root Directory: `backend` 설정
- [ ] PostgreSQL 추가
- [ ] 환경 변수 `ALLOWED_ORIGINS` 설정

### 배포 후
- [ ] `/health` 엔드포인트 테스트
- [ ] `/docs` Swagger UI 확인
- [ ] Cloudflare Pages에서 API 호출 테스트
- [ ] CORS 에러 없음 확인
- [ ] PostgreSQL 데이터 확인

---

**배포 성공을 기원합니다! 🚀**
