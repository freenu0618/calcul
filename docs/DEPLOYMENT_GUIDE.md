# 급여 계산기 배포 가이드

## 개요

- **프론트엔드**: Cloudflare Pages (무료)
- **백엔드**: Railway 또는 Fly.io (추천)
- **데이터베이스**: PostgreSQL (Railway/Fly.io 자동 제공)
- **도메인**: Cloudflare Registrar (선택 사항)

---

## 1. 프론트엔드 배포 (Cloudflare Pages)

### 장점
- ✅ **완전 무료**: 무제한 대역폭, 무제한 요청
- ✅ **글로벌 CDN**: 전 세계 275+ 도시에서 빠른 로딩
- ✅ **자동 배포**: GitHub Push 시 자동 빌드/배포
- ✅ **무료 SSL**: HTTPS 자동 적용
- ✅ **무제한 사이트**: 프로젝트 수 제한 없음
- ✅ **빠른 빌드**: Vercel보다 빌드 속도 빠름

### 1-1. GitHub 레포지토리 준비

```bash
# 현재 작업 디렉토리에서 실행
cd C:\calcul

# GitHub에 새 레포지토리 생성 (https://github.com/new)
# 레포지토리 이름: salary-calculator

# 원격 레포지토리 추가
git remote add origin https://github.com/YOUR_USERNAME/salary-calculator.git

# 푸시
git branch -M main
git push -u origin main
```

### 1-2. Cloudflare Pages 설정

1. **Cloudflare 계정 생성**
   - https://dash.cloudflare.com 접속
   - 이메일 인증 완료

2. **Pages 프로젝트 생성**
   - 왼쪽 메뉴: **Pages** 클릭
   - **Create a project** → **Connect to Git** 선택
   - GitHub 계정 연동 및 `salary-calculator` 레포지토리 선택

3. **빌드 설정**
   ```
   Project name: salary-calculator
   Production branch: main

   Build settings:
   - Framework preset: Vite
   - Build command: cd frontend && npm install && npm run build
   - Build output directory: frontend/dist
   - Root directory: (leave empty)

   Environment variables:
   - VITE_API_BASE_URL: https://api.yourdomain.com (백엔드 배포 후 업데이트)
   ```

4. **배포 시작**
   - **Save and Deploy** 클릭
   - 빌드 완료 대기 (약 2-3분)
   - 배포 완료 후 `https://salary-calculator.pages.dev` URL 생성

### 1-3. 커스텀 도메인 연결 (선택 사항)

1. **도메인 구매**
   - Cloudflare Registrar 추천 (가장 저렴)
   - 예: `salary-calculator.com` (연 $10-15)

2. **DNS 설정**
   - Cloudflare Pages 대시보드 → **Custom domains** → **Set up a custom domain**
   - 도메인 입력 (예: `salary-calculator.com`)
   - Cloudflare가 자동으로 DNS 레코드 추가
   - HTTPS 자동 적용 (Let's Encrypt)

---

## 2. 백엔드 배포 (Railway 추천)

### 옵션 1: Railway (초보자 추천)

#### 2-1. Railway 계정 생성
1. https://railway.app 접속
2. GitHub 계정으로 로그인
3. 신용카드 등록 (무료 티어 사용 시에도 필요)

#### 2-2. 프로젝트 생성
1. **New Project** → **Deploy from GitHub repo**
2. `salary-calculator` 레포지토리 선택
3. **Add variables** 클릭

#### 2-3. 환경 변수 설정
```bash
# Railway 대시보드 → Variables 탭
ALLOWED_ORIGINS=https://salary-calculator.pages.dev,https://yourdomain.com
PYTHONUNBUFFERED=1
```

#### 2-4. 빌드 설정
Railway 대시보드 → **Settings** 탭:
```
Root Directory: backend
Build Command: (자동 감지)
Start Command: uvicorn app.api.main:app --host 0.0.0.0 --port $PORT
```

#### 2-5. PostgreSQL 추가
1. Railway 프로젝트 → **New** → **Database** → **PostgreSQL**
2. 자동으로 `DATABASE_URL` 환경 변수 생성됨
3. 백엔드 서비스 재시작 (자동)

#### 2-6. 커스텀 도메인 연결
1. Railway 대시보드 → **Settings** → **Domains**
2. **Generate Domain** 클릭 (예: `salary-calculator-production.up.railway.app`)
3. 커스텀 도메인 추가 (예: `api.yourdomain.com`)
   - Cloudflare DNS 설정:
     - Type: CNAME
     - Name: api
     - Target: `salary-calculator-production.up.railway.app`

#### 2-7. 프론트엔드 환경 변수 업데이트
```bash
# Cloudflare Pages → Settings → Environment variables
VITE_API_BASE_URL=https://api.yourdomain.com
```

---

### 옵션 2: Fly.io (가성비 최고)

#### 2-1. Fly.io CLI 설치
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# 설치 확인
fly version
```

#### 2-2. Fly.io 계정 생성 및 로그인
```bash
fly auth signup  # 계정 생성
fly auth login   # 로그인
```

#### 2-3. Dockerfile 생성 (이미 존재함)
`backend/Dockerfile` 확인:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.api.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

#### 2-4. 프로젝트 초기화
```bash
cd backend
fly launch

# 질문에 답변:
# - App name: salary-calculator-api
# - Region: Tokyo (nrt) - 한국과 가까움
# - PostgreSQL: Yes (무료 3GB)
# - Redis: No
```

#### 2-5. 환경 변수 설정
```bash
fly secrets set ALLOWED_ORIGINS="https://salary-calculator.pages.dev,https://yourdomain.com"
```

#### 2-6. 배포
```bash
fly deploy
```

#### 2-7. 도메인 확인
```bash
fly status

# URL: https://salary-calculator-api.fly.dev
```

#### 2-8. 커스텀 도메인 연결
```bash
fly certs add api.yourdomain.com

# Cloudflare DNS 설정:
# Type: CNAME
# Name: api
# Target: salary-calculator-api.fly.dev
```

---

## 3. 데이터베이스 마이그레이션

### Railway PostgreSQL 연결 테스트
```bash
# 로컬에서 테스트 (Railway DATABASE_URL 사용)
cd backend

# .env 파일 생성
echo "DATABASE_URL=postgresql://user:password@host:port/dbname" > .env

# 테스트 실행
uvicorn app.api.main:app --reload

# 브라우저에서 확인:
# http://localhost:8000/docs
```

### PostgreSQL 스키마 확인
Railway 대시보드 → PostgreSQL → **Connect** → **psql**:
```sql
-- 테이블 목록 확인
\dt

-- employees 테이블 조회
SELECT * FROM employees LIMIT 5;

-- records 테이블 조회
SELECT * FROM records LIMIT 5;
```

---

## 4. 배포 후 검증

### 4-1. 프론트엔드 테스트
```bash
# 브라우저에서 접속
https://salary-calculator.pages.dev

# 개발자 도구 (F12) → Network 탭
# - favicon.svg 로딩 확인
# - adsbygoogle.js 로딩 확인 (AdSense 코드 삽입 시)
```

### 4-2. 백엔드 API 테스트
```bash
# Swagger UI 접속
https://api.yourdomain.com/docs

# 헬스 체크
curl https://api.yourdomain.com/health

# 예상 응답:
# {"status":"healthy","version":"1.0.0"}
```

### 4-3. CORS 테스트
```bash
# 프론트엔드에서 급여 계산 버튼 클릭
# 개발자 도구 → Console 확인
# - CORS 에러 없어야 함
# - 200 OK 응답 확인
```

### 4-4. SEO 검증
```bash
# robots.txt 확인
https://salary-calculator.pages.dev/robots.txt

# sitemap.xml 확인
https://salary-calculator.pages.dev/sitemap.xml

# Google Rich Results Test
https://search.google.com/test/rich-results
```

---

## 5. 비용 예상

### 무료 티어 (초기 운영)
| 항목 | 플랫폼 | 비용 |
|------|--------|------|
| 프론트엔드 | Cloudflare Pages | **무료** (무제한) |
| 백엔드 | Railway | **$5 크레딧/월** (약 500시간) |
| PostgreSQL | Railway | **포함** (무료) |
| 도메인 | Cloudflare Registrar | $10-15/년 |
| **총합** | | **$0-1/월** |

### Fly.io 사용 시 (가성비)
| 항목 | 플랫폼 | 비용 |
|------|--------|------|
| 프론트엔드 | Cloudflare Pages | **무료** |
| 백엔드 | Fly.io | **무료** (3개 VM) |
| PostgreSQL | Fly.io | **무료** (3GB) |
| 도메인 | Cloudflare Registrar | $10-15/년 |
| **총합** | | **$0/월** |

### 유료 전환 시 (트래픽 증가)
| 항목 | 플랫폼 | 비용 |
|------|--------|------|
| 프론트엔드 | Cloudflare Pages | **무료** (무제한) |
| 백엔드 | Railway | $5-10/월 |
| PostgreSQL | Railway | 포함 |
| 도메인 | Cloudflare Registrar | $10-15/년 |
| **총합** | | **$5-10/월** |

---

## 6. GitHub Actions CI/CD (선택 사항)

### 자동 테스트 및 배포
`.github/workflows/deploy.yml` 생성:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest
      - name: Run tests
        run: |
          cd backend
          pytest -v

  deploy-frontend:
    needs: test-backend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Cloudflare Pages
        run: echo "Cloudflare Pages auto-deploys on push"

  deploy-backend:
    needs: test-backend
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        run: echo "Railway auto-deploys on push"
```

---

## 7. 모니터링 및 유지보수

### Cloudflare Analytics
- Cloudflare Pages 대시보드 → **Analytics**
- 페이지뷰, 방문자 수, 지역별 트래픽 확인
- 무료 제공

### Railway 로그 모니터링
- Railway 대시보드 → **Deployments** → **View Logs**
- 실시간 로그 스트리밍
- 에러 추적 가능

### Uptime 모니터링
- [UptimeRobot](https://uptimerobot.com) (무료)
- API 엔드포인트 헬스 체크 (5분마다)
- 다운 시 이메일 알림

---

## 8. 트러블슈팅

### 프론트엔드 빌드 실패
**원인**: `frontend/` 디렉토리 경로 오류
**해결**:
```bash
# Cloudflare Pages → Settings → Build settings
Build command: cd frontend && npm ci && npm run build
Build output directory: frontend/dist
```

### CORS 에러
**원인**: 백엔드 `ALLOWED_ORIGINS` 환경 변수 누락
**해결**:
```bash
# Railway 또는 Fly.io에서 환경 변수 추가
ALLOWED_ORIGINS=https://salary-calculator.pages.dev,https://yourdomain.com
```

### PostgreSQL 연결 실패
**원인**: `DATABASE_URL` 형식 오류
**해결**:
```python
# backend/app/db/database.py에서 자동 변환 확인
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
```

### 500 Internal Server Error
**원인**: 백엔드 환경 변수 누락 또는 DB 연결 실패
**해결**:
```bash
# Railway 로그 확인
railway logs

# Fly.io 로그 확인
fly logs
```

---

## 9. 다음 단계

- [ ] Google AdSense Publisher ID 발급 및 교체
- [ ] Google Search Console 사이트 등록
- [ ] Google Analytics 4 연동
- [ ] 블로그 콘텐츠 제작 (SEO)
- [ ] 네이버 블로그 홍보
- [ ] 성능 모니터링 (Lighthouse 90+ 목표)

---

## 참고 자료

- [Cloudflare Pages 문서](https://developers.cloudflare.com/pages/)
- [Railway 배포 가이드](https://docs.railway.app/)
- [Fly.io 문서](https://fly.io/docs/)
- [FastAPI 배포 가이드](https://fastapi.tiangolo.com/deployment/)
- [SQLAlchemy PostgreSQL](https://docs.sqlalchemy.org/en/20/dialects/postgresql.html)
