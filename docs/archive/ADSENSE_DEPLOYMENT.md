# Google AdSense 수익화 배포 가이드

## 완료된 작업

### ✅ 1. 프론트엔드 SEO 최적화
- `frontend/index.html` 수정
  - Google AdSense Auto Ads 스크립트 추가 (Publisher ID 교체 필요)
  - SEO 메타 태그 추가 (title, description, keywords)
  - Open Graph 태그 추가 (소셜 미디어 공유)
  - Twitter Card 태그 추가
  - JSON-LD 구조화된 데이터 추가
  - Favicon 링크 추가 (이미지 생성 필요)
  - Theme Color 설정

### ✅ 2. SEO 필수 파일 생성
- `frontend/public/robots.txt` 생성
- `frontend/public/sitemap.xml` 생성

### ✅ 3. 백엔드 CORS 설정 수정
- `backend/app/api/main.py` 수정
  - 환경 변수 기반 CORS 설정 적용
  - 로컬 개발 환경 기본값 제공

### ✅ 4. 개인정보 처리방침 추가
- `frontend/src/components/layout/MainLayout.tsx` 수정
  - Google AdSense 쿠키 사용 고지 추가
  - Google 광고 정책 링크 추가

---

## 다음 단계: 배포 전 준비

### 📋 1. Google AdSense 계정 설정

#### 1-1. AdSense 계정 생성
1. [Google AdSense](https://www.google.com/adsense) 접속
2. Google 계정으로 로그인 (Gmail 계정 사용)
3. 사이트 URL 입력 (도메인 구매 후 진행)
4. 이용약관 동의 및 계정 생성

#### 1-2. Publisher ID 발급
1. AdSense 대시보드 접속
2. **계정** → **계정 정보** 메뉴에서 Publisher ID 확인
   - 형식: `ca-pub-XXXXXXXXXXXXXXXX`
3. **광고** → **개요** → **Auto Ads** 활성화
4. AdSense 코드 스니펫 복사

#### 1-3. Publisher ID 교체
**파일**: `frontend/index.html`

**수정 전**:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script>
```

**수정 후** (실제 Publisher ID로 교체):
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
     crossorigin="anonymous"></script>
```

---

### 🎨 2. Favicon 및 이미지 생성

#### 2-1. 필요한 이미지
- `frontend/public/favicon.png` (32x32px)
- `frontend/public/apple-touch-icon.png` (180x180px)
- `frontend/public/og-image.png` (1200x630px, Open Graph 이미지)

#### 2-2. 디자인 가이드
**Favicon 디자인 아이디어**:
- 급여 아이콘 (💰, 💵)
- 계산기 아이콘 (🧮)
- 원화 기호 (₩)
- 색상: Indigo (#4F46E5, Tailwind primary color)

**디자인 도구**:
- [Figma](https://www.figma.com) (무료)
- [Canva](https://www.canva.com) (무료)
- [Favicon Generator](https://realfavicongenerator.net/) (자동 생성)

#### 2-3. 이미지 생성 후 확인
```bash
# 파일 존재 확인
ls frontend/public/favicon.png
ls frontend/public/apple-touch-icon.png
ls frontend/public/og-image.png
```

---

### 🌐 3. 도메인 구매 및 연결

#### 3-1. 도메인 추천
**한국 도메인**:
- `salary-calculator.kr` (급여계산기)
- `geupyecalc.kr` (급여계산)
- `paycheck-calc.kr` (페이체크 계산)

**국제 도메인**:
- `salary-calculator.com`
- `kr-paycheck.com`
- `geupyecalc.com`

#### 3-2. 도메인 구매처
- [가비아](https://www.gabia.com) (한국)
- [Cloudflare](https://www.cloudflare.com) (저렴, DNS 관리 편리)
- [Namecheap](https://www.namecheap.com) (국제)

#### 3-3. 도메인 교체 위치
**파일 1**: `frontend/index.html`
```html
<!-- 변경 전 -->
<link rel="canonical" href="https://yourdomain.com/" />
<meta property="og:url" content="https://yourdomain.com/" />
<meta property="og:image" content="https://yourdomain.com/og-image.png" />
<meta name="twitter:image" content="https://yourdomain.com/og-image.png" />

<!-- 변경 후 (예시: salary-calculator.kr) -->
<link rel="canonical" href="https://salary-calculator.kr/" />
<meta property="og:url" content="https://salary-calculator.kr/" />
<meta property="og:image" content="https://salary-calculator.kr/og-image.png" />
<meta name="twitter:image" content="https://salary-calculator.kr/og-image.png" />
```

**파일 2**: `frontend/public/robots.txt`
```txt
# 변경 전
Sitemap: https://yourdomain.com/sitemap.xml

# 변경 후
Sitemap: https://salary-calculator.kr/sitemap.xml
```

**파일 3**: `frontend/public/sitemap.xml`
```xml
<!-- 변경 전 -->
<loc>https://yourdomain.com/</loc>

<!-- 변경 후 -->
<loc>https://salary-calculator.kr/</loc>
```

---

### 🚀 4. 프론트엔드 배포 (Vercel 권장)

#### 4-1. Vercel 계정 생성
1. [Vercel](https://vercel.com) 접속
2. GitHub 계정으로 로그인
3. "New Project" 클릭

#### 4-2. GitHub 레포지토리 연결
1. `calcul` 레포지토리 선택
2. 빌드 설정:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### 4-3. 환경 변수 설정
Vercel 대시보드 → **Settings** → **Environment Variables**:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_API_BASE_URL` | `https://api.salary-calculator.kr` | Production |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Development |

#### 4-4. 도메인 연결
1. Vercel 대시보드 → **Settings** → **Domains**
2. Custom Domain 추가 (예: `salary-calculator.kr`)
3. DNS 설정 (가비아/Cloudflare에서 설정):
   - **Type**: A Record
   - **Name**: `@` (루트 도메인)
   - **Value**: Vercel IP (대시보드에서 확인)
   - **Type**: CNAME Record
   - **Name**: `www`
   - **Value**: `cname.vercel-dns.com`

#### 4-5. HTTPS 자동 적용
- Vercel이 자동으로 Let's Encrypt SSL 인증서 발급
- 배포 후 약 5-10분 소요

---

### 🖥️ 5. 백엔드 배포 (Railway 권장)

#### 5-1. Railway 계정 생성
1. [Railway](https://railway.app) 접속
2. GitHub 계정으로 로그인
3. "New Project" → "Deploy from GitHub repo" 선택

#### 5-2. 서비스 설정
1. `calcul` 레포지토리 선택
2. 서비스 설정:
   - **Root Directory**: `backend`
   - **Start Command**:
     ```bash
     uvicorn app.api.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Install Command**:
     ```bash
     pip install -r requirements.txt
     ```

#### 5-3. PostgreSQL 추가 (선택 사항)
현재는 SQLite를 사용하고 있지만, 프로덕션에서는 PostgreSQL 권장:
1. Railway 대시보드 → "New" → "Database" → "PostgreSQL"
2. 자동으로 `DATABASE_URL` 환경 변수 생성됨
3. **향후 작업**: SQLAlchemy 설정을 PostgreSQL로 변경 필요

#### 5-4. 환경 변수 설정
Railway 대시보드 → **Variables**:

| Key | Value | 설명 |
|-----|-------|------|
| `ALLOWED_ORIGINS` | `https://salary-calculator.kr,https://www.salary-calculator.kr` | CORS 허용 도메인 |
| `DATABASE_URL` | (Railway 자동 생성) | PostgreSQL 연결 URL (향후) |

**로컬 테스트 시 환경 변수 추가**:
```bash
# backend/.env 파일 생성
ALLOWED_ORIGINS=http://localhost:5175,http://localhost:5173
```

#### 5-5. 커스텀 도메인 연결 (API 서브도메인)
1. Railway 대시보드 → **Settings** → **Domains**
2. Custom Domain 추가: `api.salary-calculator.kr`
3. DNS 설정 (가비아/Cloudflare):
   - **Type**: CNAME Record
   - **Name**: `api`
   - **Value**: Railway 제공 도메인 (예: `yourapp.up.railway.app`)

---

### 🔍 6. Google AdSense 사이트 심사

#### 6-1. 사이트 등록
1. AdSense 대시보드 → **사이트** → **사이트 추가**
2. 도메인 입력 (예: `salary-calculator.kr`)
3. AdSense 코드 스니펫 복사 (이미 index.html에 삽입됨)

#### 6-2. 도메인 소유권 인증
AdSense가 제공하는 방법 중 하나 선택:
- **방법 1**: HTML 파일 업로드
  - AdSense가 제공하는 HTML 파일을 `frontend/public/` 폴더에 추가
  - 예: `google1234567890abcdef.html`
- **방법 2**: 메타 태그 추가
  - `index.html`의 `<head>`에 AdSense 제공 메타 태그 추가

#### 6-3. 심사 대기
- 심사 기간: 1-2주 (평균)
- 심사 기준:
  - ✅ 콘텐츠 충분성 (최소 10페이지 이상 권장)
  - ✅ 트래픽 확보 (일 방문자 100명 이상 권장)
  - ✅ 정책 준수 (불법 콘텐츠 없음)
  - ✅ 독창적인 콘텐츠 (복사된 콘텐츠 금지)

#### 6-4. 심사 통과 후
- AdSense 대시보드에서 "광고 게재 확인됨" 상태 확인
- Auto Ads가 자동으로 광고 위치 선택하여 표시
- 수익 발생 시작

---

### 📊 7. Google Analytics 4 연동 (선택 사항)

#### 7-1. GA4 계정 생성
1. [Google Analytics](https://analytics.google.com) 접속
2. "관리" → "속성 만들기" 클릭
3. 속성 이름: "급여 계산기"
4. 측정 ID 발급 (형식: `G-XXXXXXXXXX`)

#### 7-2. GA4 스크립트 추가
**파일**: `frontend/index.html`

`</head>` 태그 직전에 추가:
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

#### 7-3. 이벤트 추적 (선택 사항)
급여 계산 버튼 클릭 시 이벤트 전송:
```typescript
// App.tsx에서 handleCalculate 함수 수정
const handleCalculate = async () => {
  // ... 기존 코드 ...

  // GA4 이벤트 전송
  if (window.gtag) {
    window.gtag('event', 'calculate_salary', {
      event_category: 'engagement',
      event_label: 'salary_calculation',
    });
  }
};
```

---

### 🔐 8. Google Search Console 등록

#### 8-1. Search Console 설정
1. [Google Search Console](https://search.google.com/search-console) 접속
2. "속성 추가" → "URL 접두어" 선택
3. 도메인 입력: `https://salary-calculator.kr`

#### 8-2. 소유권 확인
방법 중 하나 선택:
- **방법 1**: HTML 파일 업로드 (AdSense 인증과 동일)
- **방법 2**: 메타 태그 추가
- **방법 3**: Google Analytics 연동 (GA4 설치 시 자동)

#### 8-3. Sitemap 제출
1. Search Console → **Sitemaps** 메뉴
2. Sitemap URL 입력: `https://salary-calculator.kr/sitemap.xml`
3. "제출" 클릭
4. 색인 생성 대기 (1-2주)

---

## 배포 체크리스트

### 배포 전 필수 작업
- [ ] Google AdSense 계정 생성 및 Publisher ID 발급
- [ ] `frontend/index.html`에서 Publisher ID 교체
- [ ] Favicon 이미지 생성 (favicon.png, apple-touch-icon.png, og-image.png)
- [ ] 도메인 구매 (예: salary-calculator.kr)
- [ ] 모든 파일에서 `yourdomain.com`을 실제 도메인으로 교체
- [ ] 백엔드 환경 변수 설정 (`ALLOWED_ORIGINS`)

### 배포 단계
- [ ] Vercel에 프론트엔드 배포
- [ ] Railway에 백엔드 배포
- [ ] 도메인 DNS 설정 (Vercel, Railway 연결)
- [ ] HTTPS 적용 확인
- [ ] API 통신 테스트 (CORS 확인)

### AdSense 승인 단계
- [ ] AdSense에 사이트 등록 및 심사 요청
- [ ] 도메인 소유권 인증
- [ ] 콘텐츠 페이지 추가 (최소 10페이지 권장)
- [ ] 트래픽 확보 (일 방문자 100명 이상)
- [ ] 심사 통과 후 광고 표시 확인

### SEO 최적화 단계
- [ ] Google Search Console 등록
- [ ] Sitemap 제출
- [ ] Google Analytics 4 연동
- [ ] 키워드 리서치 (Google Keyword Planner)
- [ ] 블로그 콘텐츠 제작 시작 (주 1-2회)

---

## 환경 변수 요약

### 프론트엔드 (.env)
```bash
# Vercel 배포 시 설정
VITE_API_BASE_URL=https://api.salary-calculator.kr
```

### 백엔드 (.env)
```bash
# Railway 배포 시 설정
ALLOWED_ORIGINS=https://salary-calculator.kr,https://www.salary-calculator.kr,http://localhost:5175

# PostgreSQL (향후)
DATABASE_URL=postgresql://user:password@host:port/dbname
```

---

## 테스트 가이드

### 로컬 테스트
```bash
# 프론트엔드 실행
cd frontend
npm run dev

# 백엔드 실행
cd backend
uvicorn app.api.main:app --reload

# 브라우저에서 확인
# http://localhost:5175
```

### 배포 후 테스트
1. **HTTPS 확인**: `https://salary-calculator.kr` 접속
2. **AdSense 스크립트 확인**:
   - 브라우저 개발자 도구 (F12)
   - Network 탭 → `adsbygoogle.js` 로딩 확인
   - Console에 AdSense 에러 없는지 확인
3. **API 통신 확인**:
   - 급여 계산 버튼 클릭
   - Network 탭 → `/api/v1/salary/calculate` 요청 확인
   - 200 OK 응답 확인
4. **SEO 확인**:
   - `https://salary-calculator.kr/robots.txt` 접속
   - `https://salary-calculator.kr/sitemap.xml` 접속
   - Google Rich Results Test: https://search.google.com/test/rich-results

---

## 문제 해결

### AdSense 광고가 표시되지 않을 때
1. Publisher ID가 올바른지 확인
2. AdSense 심사 통과 여부 확인 (대시보드)
3. 브라우저 광고 차단 플러그인 비활성화
4. 개발자 도구 Console에서 에러 확인

### CORS 에러 발생 시
1. 백엔드 환경 변수 `ALLOWED_ORIGINS` 확인
2. 프론트엔드 도메인이 포함되어 있는지 확인
3. Railway 대시보드에서 환경 변수 재설정
4. 백엔드 서비스 재시작

### Sitemap 접근 불가 시
1. `frontend/public/sitemap.xml` 파일 존재 확인
2. Vercel 빌드 로그에서 파일 복사 확인
3. 캐시 삭제 후 재접속 (Ctrl+F5)

---

## 다음 단계: 트래픽 확보 전략

### 1. 콘텐츠 마케팅
- 블로그 게시 (주 1-2회)
- 키워드: "급여 계산기", "실수령액 계산", "4대보험 계산"
- 가이드 작성: "2026년 최저임금 계산법", "주휴수당 계산 방법"

### 2. 소셜 미디어
- 네이버 블로그에 급여 계산기 소개 글 작성
- Reddit, 네이버 카페 등에 자연스럽게 공유
- YouTube 영상 제작 (급여 계산 가이드)

### 3. 백링크 확보
- 노무사 커뮤니티에 도구 소개
- 오픈소스 공개 (GitHub Stars 확보)
- 유용한 도구로 추천받기

### 4. SEO 최적화
- 키워드 순위 추적 (Google Search Console)
- 메타 태그 A/B 테스트
- 페이지 속도 최적화 (Lighthouse)

---

## 예상 타임라인

| 기간 | 목표 | 예상 수익 |
|------|------|-----------|
| 1개월 | AdSense 승인, 배포 완료 | 0원 |
| 3개월 | 일 방문자 100명 돌파 | 월 10,000원 |
| 6개월 | 일 방문자 500명 | 월 50,000원 |
| 1년 | 일 방문자 2,000명 | 월 500,000원 |

---

## 참고 자료

- [Google AdSense 고객센터](https://support.google.com/adsense)
- [Vercel 배포 가이드](https://vercel.com/docs)
- [Railway 배포 가이드](https://docs.railway.app)
- [Google Search Console 사용 가이드](https://support.google.com/webmasters)
- [SEO 가이드 (Google)](https://developers.google.com/search/docs)
