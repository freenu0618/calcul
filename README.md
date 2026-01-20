# 급여 계산기 🧮

한국 근로기준법 기반 실수령액 계산기

🌐 **라이브 데모**: https://calcul-1b9.pages.dev/
📦 **GitHub**: https://github.com/freenu0618/calcul

## 🚀 로컬 개발 환경 설정

### 사전 요구사항
- Python 3.11+ (백엔드)
- Node.js 18+ (프론트엔드)

### 백엔드 실행
```bash
cd backend
pip install -r requirements.txt
uvicorn app.api.main:app --reload --port 8000
```

### 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```

### 접속
- 프론트엔드: http://localhost:5175
- 백엔드 API: http://localhost:8000
- API 문서: http://localhost:8000/docs

---

## 📋 기능

- ✅ 4대 보험 계산 (국민연금, 건강보험, 장기요양, 고용보험)
- ✅ 소득세 / 지방소득세 계산
- ✅ 연장/야간/휴일 수당 자동 계산
- ✅ 주휴수당 계산 (개근 조건 체크)
- ✅ FullCalendar 캘린더 UI
- ✅ 시급 기반 역산 로직

---

## 🌐 배포 가이드

### 프론트엔드 (Cloudflare Pages)

1. **환경 변수 설정**
   ```bash
   # Cloudflare Pages 대시보드 → Settings → Environment variables
   VITE_API_BASE_URL=https://your-backend-url.railway.app
   ```

2. **빌드 설정**
   - Build command: `cd frontend && npm install && npm run build`
   - Build output directory: `frontend/dist`
   - Root directory: `/`

3. **배포**
   ```bash
   git push origin main  # GitHub에 푸시하면 자동 배포
   ```

### 백엔드 (Railway)

1. **환경 변수 설정**
   ```bash
   # Railway 대시보드 → Variables
   ALLOWED_ORIGINS=https://calcul-1b9.pages.dev
   DATABASE_URL=postgresql://${{PGUSER}}:${{POSTGRES_PASSWORD}}@${{RAILWAY_PRIVATE_DOMAIN}}:5432/${{PGDATABASE}}
   PORT=8000
   ```

2. **배포**
   ```bash
   git push origin main  # GitHub에 푸시하면 자동 배포
   ```

3. **헬스 체크**
   ```bash
   curl https://your-backend-url.railway.app/health
   ```

### 문제 해결

#### 405 에러 (Method Not Allowed)
- **원인**: 프론트엔드가 백엔드 URL을 모름
- **해결**: Cloudflare Pages 환경 변수에 `VITE_API_BASE_URL` 추가

#### CORS 에러
- **원인**: 백엔드가 프론트엔드 도메인을 허용 목록에 추가하지 않음
- **해결**: Railway 환경 변수 `ALLOWED_ORIGINS`에 프론트엔드 URL 추가

---

## ⚠️ 법적 고지

본 계산기는 **참고용**이며, 실제 급여 지급 시
노무사 또는 세무사와 상담하시기 바랍니다.
