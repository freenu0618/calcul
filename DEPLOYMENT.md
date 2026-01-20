# 🚀 배포 가이드

본 문서는 급여 계산기를 프로덕션 환경에 배포하는 단계별 가이드입니다.

## 📋 사전 준비

- [x] GitHub 저장소: `freenu0618/calcul`
- [ ] Railway 계정 (백엔드 배포)
- [ ] Cloudflare 계정 (프론트엔드 배포)
- [ ] PostgreSQL 데이터베이스 (Railway 제공)

---

## 🔧 백엔드 배포 (Railway)

### 1. Railway 프로젝트 생성

1. [Railway 대시보드](https://railway.app/dashboard) 접속
2. **New Project** → **Deploy from GitHub repo** 선택
3. `freenu0618/calcul` 저장소 선택
4. **Deploy Now** 클릭

### 2. PostgreSQL 서비스 추가

1. Railway 프로젝트 대시보드에서 **New** 클릭
2. **Database** → **Add PostgreSQL** 선택
3. 자동으로 연결됨 (환경 변수 자동 생성)

### 3. 환경 변수 설정

Railway 프로젝트 → **Variables** 탭:

```bash
# CORS 허용 도메인 (프론트엔드 URL)
ALLOWED_ORIGINS=https://calcul-1b9.pages.dev

# PostgreSQL 연결 (자동 생성, 확인만)
DATABASE_URL=postgresql://${{PGUSER}}:${{POSTGRES_PASSWORD}}@${{RAILWAY_PRIVATE_DOMAIN}}:5432/${{PGDATABASE}}

# 포트 (자동 생성)
PORT=8000
```

### 4. 배포 설정 확인

**Root Directory**: `/` (프로젝트 루트)
**Build Command**: 자동 감지 (Procfile 사용)
**Start Command**: `cd backend && uvicorn app.api.main:app --host 0.0.0.0 --port $PORT`

### 5. 배포 및 확인

```bash
# 배포 트리거 (자동)
git push origin main

# 헬스 체크
curl https://your-backend-url.railway.app/health

# 예상 응답
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### 6. 백엔드 URL 복사

Railway 대시보드 → **Settings** → **Domains**
- 예: `https://calcul-backend-production.railway.app`
- 이 URL을 복사하여 프론트엔드 환경 변수에 사용

---

## 🌐 프론트엔드 배포 (Cloudflare Pages)

### 1. Cloudflare Pages 프로젝트 생성

1. [Cloudflare Pages](https://dash.cloudflare.com/) 접속
2. **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. `freenu0618/calcul` 저장소 선택
4. **Begin setup** 클릭

### 2. 빌드 설정

```bash
# Framework preset
Vite

# Build command
cd frontend && npm install && npm run build

# Build output directory
frontend/dist

# Root directory
/ (프로젝트 루트)
```

### 3. 환경 변수 설정

Cloudflare Pages → **Settings** → **Environment variables**:

```bash
# Production 환경
VITE_API_BASE_URL=https://your-backend-url.railway.app

# Preview 환경 (선택사항)
VITE_API_BASE_URL=http://localhost:8000
```

**중요**: Railway 백엔드 URL을 여기에 입력하세요!

### 4. 배포 및 확인

```bash
# 배포 트리거 (자동)
git push origin main

# 접속
https://calcul-1b9.pages.dev/

# 커스텀 도메인 (선택사항)
https://yourdomain.com
```

---

## ✅ 배포 체크리스트

### 백엔드 (Railway)

- [ ] Railway 프로젝트 생성
- [ ] PostgreSQL 데이터베이스 추가
- [ ] 환경 변수 설정 (`ALLOWED_ORIGINS`, `DATABASE_URL`, `PORT`)
- [ ] 배포 성공 확인 (로그 확인)
- [ ] 헬스 체크 성공 (`/health` 엔드포인트)
- [ ] CORS 정상 작동 확인

### 프론트엔드 (Cloudflare Pages)

- [ ] Cloudflare Pages 프로젝트 생성
- [ ] 빌드 설정 완료
- [ ] 환경 변수 설정 (`VITE_API_BASE_URL`)
- [ ] 배포 성공 확인
- [ ] 웹사이트 접속 확인
- [ ] API 연동 테스트 (급여 계산 버튼 클릭)

### SEO 최적화

- [x] `robots.txt` 생성
- [x] `sitemap.xml` 생성
- [x] Meta 태그 업데이트 (title, description, keywords)
- [x] Open Graph 태그 설정
- [x] Google AdSense 스니펫 추가
- [ ] Google Search Console 등록
- [ ] Google Analytics 설정 (선택사항)

---

## 🔍 문제 해결

### 405 에러 (Method Not Allowed)

**증상**: 급여 계산 버튼 클릭 시 405 에러

**원인**:
1. 프론트엔드가 백엔드 URL을 모름
2. `VITE_API_BASE_URL` 환경 변수가 설정되지 않음

**해결**:
```bash
# Cloudflare Pages → Environment variables
VITE_API_BASE_URL=https://your-backend-url.railway.app

# 재배포 필요
git commit --allow-empty -m "Trigger rebuild"
git push origin main
```

### CORS 에러

**증상**: 브라우저 콘솔에 CORS 정책 위반 에러

**원인**: 백엔드가 프론트엔드 도메인을 허용 목록에 추가하지 않음

**해결**:
```bash
# Railway → Variables
ALLOWED_ORIGINS=https://calcul-1b9.pages.dev

# 재배포 (자동)
```

### 데이터베이스 연결 실패

**증상**: Railway 로그에 "could not connect to server" 에러

**원인**: PostgreSQL 서비스가 연결되지 않음

**해결**:
1. Railway 프로젝트 대시보드 확인
2. PostgreSQL 서비스가 있는지 확인
3. 없으면 **New** → **Database** → **PostgreSQL** 추가
4. 환경 변수 `DATABASE_URL` 자동 생성 확인

### 빌드 실패 (Cloudflare Pages)

**증상**: 빌드 로그에 "npm ERR!" 또는 "vite build failed"

**원인**: 의존성 설치 실패 또는 빌드 설정 오류

**해결**:
```bash
# 로컬에서 빌드 테스트
cd frontend
npm install
npm run build

# 성공하면 GitHub에 푸시
git push origin main
```

---

## 📊 모니터링

### Railway 로그 확인

```bash
# Railway 대시보드 → Deployments → View Logs
# 실시간 로그 스트리밍
```

### Cloudflare Pages 로그 확인

```bash
# Cloudflare Pages → Deployments → [최신 배포] → Build log
```

### API 헬스 체크

```bash
# 백엔드
curl https://your-backend-url.railway.app/health

# API 문서
https://your-backend-url.railway.app/docs
```

---

## 🎯 다음 단계

1. **커스텀 도메인 연결** (선택사항)
   - Cloudflare Pages: `yourdomain.com`
   - Railway: `api.yourdomain.com`

2. **Google Search Console 등록**
   - https://search.google.com/search-console
   - Sitemap 제출: `https://calcul-1b9.pages.dev/sitemap.xml`

3. **성능 모니터링**
   - Google Analytics
   - Cloudflare Web Analytics
   - Railway Metrics

4. **보안 강화**
   - Rate limiting (API 속도 제한)
   - Input validation (입력 검증 강화)
   - HTTPS 강제 (자동 적용됨)

---

## 📞 지원

- GitHub Issues: https://github.com/freenu0618/calcul/issues
- Railway 문서: https://docs.railway.app
- Cloudflare Pages 문서: https://developers.cloudflare.com/pages
