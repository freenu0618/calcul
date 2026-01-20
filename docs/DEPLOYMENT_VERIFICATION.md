# 배포 및 Google Analytics 검증 가이드

## 📋 현재 상태 (2026-01-20)

### ✅ 완료된 작업
1. **다중 페이지 구조 배포** (커밋: 3e0ca08)
   - 14개 페이지 구현
   - React Router 설정
   - Navigation 및 Footer 컴포넌트
   - Sitemap.xml 업데이트

2. **Google Analytics 4 통합** (커밋: c556e4a)
   - GA4 추적 스크립트 추가 (index.html)
   - React Router 페이지뷰 추적 (App.tsx)
   - SPA 라우팅 설정 (_redirects)

### ⏳ 대기 중
- Cloudflare Pages 자동 배포 (2-3분 소요)
- 배포 URL: https://calcul-1b9.pages.dev

---

## 🎯 다음 단계

### Step 1: Cloudflare Pages 배포 확인

#### 1.1 배포 상태 확인
https://dash.cloudflare.com → Pages → calcul → Deployments

**예상 시간**: 2-3분

#### 1.2 배포 완료 확인
- ✅ Status: "Success"
- ✅ Commit: c556e4a
- ✅ Branch: master

---

### Step 2: 페이지 접근성 테스트

#### 2.1 자동 테스트 (Windows PowerShell)
```powershell
# 모든 페이지 HTTP 상태 확인
$urls = @(
    'https://calcul-1b9.pages.dev/',
    'https://calcul-1b9.pages.dev/guide',
    'https://calcul-1b9.pages.dev/guide/insurance',
    'https://calcul-1b9.pages.dev/guide/tax',
    'https://calcul-1b9.pages.dev/guide/overtime',
    'https://calcul-1b9.pages.dev/faq',
    'https://calcul-1b9.pages.dev/examples',
    'https://calcul-1b9.pages.dev/legal',
    'https://calcul-1b9.pages.dev/blog',
    'https://calcul-1b9.pages.dev/about',
    'https://calcul-1b9.pages.dev/privacy',
    'https://calcul-1b9.pages.dev/terms',
    'https://calcul-1b9.pages.dev/contact',
    'https://calcul-1b9.pages.dev/sitemap.xml',
    'https://calcul-1b9.pages.dev/robots.txt'
)

foreach ($url in $urls) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -UseBasicParsing
        Write-Host "✅ $url - Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "❌ $url - Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
```

**예상 결과**: 모든 URL이 HTTP 200 반환

#### 2.2 수동 테스트
브라우저에서 다음 항목 확인:
- [ ] 메인 페이지 로딩
- [ ] Navigation 메뉴 작동
- [ ] Footer 링크 작동
- [ ] 모든 가이드 페이지 접근
- [ ] FAQ 아코디언 작동
- [ ] 급여 계산 기능 정상 작동

---

### Step 3: Google Analytics 4 설정

#### 3.1 GA4 계정 생성
1. https://analytics.google.com 접속
2. "측정 시작" 클릭
3. 계정 설정:
   - **계정 이름**: 급여계산기
   - **속성 이름**: calcul-1b9.pages.dev
   - **보고 시간대**: (GMT+09:00) 대한민국 시간
   - **통화**: 한국 원(₩)

4. 데이터 스트림 생성:
   - **플랫폼**: 웹
   - **웹사이트 URL**: https://calcul-1b9.pages.dev
   - **스트림 이름**: 급여계산기 웹

5. **측정 ID 복사**: `G-XXXXXXXXXX` 형식

#### 3.2 측정 ID 코드에 적용

**파일 1**: `frontend/index.html` (2곳)
```html
<!-- 변경 전 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  ...
  gtag('config', 'G-XXXXXXXXXX', {
    ...
  });
</script>

<!-- 변경 후 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_ACTUAL_ID"></script>
<script>
  ...
  gtag('config', 'G-YOUR_ACTUAL_ID', {
    ...
  });
</script>
```

**파일 2**: `frontend/src/App.tsx` (1곳)
```typescript
// 변경 전
window.gtag('config', 'G-XXXXXXXXXX', {
  page_path: location.pathname + location.search,
});

// 변경 후
window.gtag('config', 'G-YOUR_ACTUAL_ID', {
  page_path: location.pathname + location.search,
});
```

#### 3.3 변경사항 커밋 및 푸시
```bash
git add .
git commit -m "chore: Update GA4 Measurement ID

- Replace placeholder G-XXXXXXXXXX with actual ID
- GA4 tracking now fully operational

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin master
```

#### 3.4 GA4 실시간 테스트
1. GA4 속성 → **보고서** → **실시간**
2. 브라우저에서 https://calcul-1b9.pages.dev 방문
3. 여러 페이지 이동 (/guide, /faq, /examples 등)
4. GA4 실시간 보고서에서 확인:
   - 활성 사용자 수: 1명 이상
   - 페이지뷰 이벤트 발생
   - 페이지 경로 정확히 표시

**예상 결과**: 1-2분 내 실시간 데이터 반영

---

### Step 4: Google Search Console 연동

#### 4.1 Search Console 속성 추가
1. https://search.google.com/search-console 접속
2. "속성 추가" → **URL 접두어**
3. URL 입력: `https://calcul-1b9.pages.dev`

#### 4.2 소유권 확인 (HTML 태그 방법)
1. "HTML 태그" 선택
2. 메타 태그 복사:
   ```html
   <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
   ```

3. `frontend/index.html`의 `<head>` 섹션에 추가:
   ```html
   <!-- Google Search Console 소유권 확인 -->
   <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
   ```

4. 커밋 및 푸시:
   ```bash
   git add frontend/index.html
   git commit -m "chore: Add Google Search Console verification tag"
   git push origin master
   ```

5. 배포 완료 후 Search Console에서 "확인" 클릭

#### 4.3 Sitemap 제출
1. Search Console → Sitemaps
2. 새 사이트맵 추가: `https://calcul-1b9.pages.dev/sitemap.xml`
3. "제출" 클릭

**예상 결과**: "성공" 상태 (인덱싱은 1-7일 소요)

#### 4.4 GA4와 Search Console 연동
1. GA4 속성 → **관리** → **제품 링크** → **Search Console 링크**
2. "링크" 클릭
3. Search Console 속성 선택: `https://calcul-1b9.pages.dev`
4. "제출" 클릭

**혜택**: GA4에서 검색어 데이터 확인 가능

---

## 📊 검증 체크리스트

### Phase 1: 배포 검증
- [ ] Cloudflare Pages 배포 완료 (Status: Success)
- [ ] 모든 페이지 HTTP 200 반환
- [ ] Navigation 메뉴 정상 작동
- [ ] Footer 링크 정상 작동
- [ ] 급여 계산 기능 정상 작동
- [ ] 모바일 반응형 확인 (375px, 768px)

### Phase 2: GA4 검증
- [ ] GA4 계정 및 속성 생성
- [ ] 측정 ID 발급 (G-XXXXXXXXXX)
- [ ] index.html 및 App.tsx에 ID 적용
- [ ] 코드 커밋 및 푸시
- [ ] 실시간 보고서에서 페이지뷰 확인
- [ ] 페이지 경로 정확히 추적되는지 확인

### Phase 3: Search Console 검증
- [ ] Search Console 속성 추가
- [ ] 소유권 확인 (HTML 태그)
- [ ] Sitemap 제출
- [ ] GA4 연동

### Phase 4: SEO 검증
- [ ] Meta 태그 확인 (title, description)
- [ ] Open Graph 태그 확인
- [ ] Structured Data 확인 (Schema.org)
- [ ] robots.txt 접근 가능
- [ ] sitemap.xml 유효성 검사

---

## 🔍 트러블슈팅

### 문제 1: 페이지 404 에러
**증상**: /guide 같은 경로가 404 반환
**원인**: _redirects 파일 누락 또는 잘못된 설정
**해결**:
1. `frontend/public/_redirects` 파일 존재 확인
2. 내용: `/*    /index.html   200`
3. 재배포 후 확인

### 문제 2: GA4 실시간 데이터 없음
**증상**: 실시간 보고서에 데이터 없음
**원인**: 측정 ID 불일치 또는 미교체
**해결**:
1. 브라우저 개발자 도구 → Console 탭 확인
2. GA4 스크립트 로드 오류 확인
3. `window.gtag` 함수 존재 확인 (Console에서 `typeof gtag`)
4. 측정 ID 일치 확인 (3곳 모두)

### 문제 3: 급여 계산 API 연결 실패
**증상**: CORS 에러 또는 API 호출 실패
**원인**: Railway 환경 변수에 새 도메인 미등록
**해결**:
1. Railway 프로젝트 → Variables
2. `ALLOWED_ORIGINS` 추가:
   ```
   ALLOWED_ORIGINS=https://calcul-1b9.pages.dev
   ```
3. Railway 재배포

### 문제 4: Search Console 소유권 확인 실패
**증상**: "소유권을 확인할 수 없습니다"
**원인**: 메타 태그 미배포 또는 잘못된 위치
**해결**:
1. 배포된 페이지 소스 보기 (Ctrl+U)
2. `<head>` 섹션에 google-site-verification 태그 존재 확인
3. 없으면 재커밋 및 재배포
4. 배포 완료 후 5분 대기 후 재시도

---

## 📈 모니터링 계획

### 일일 확인 (첫 1주)
- GA4 실시간 보고서
- 페이지별 방문자 수
- 이탈률
- 평균 체류 시간

### 주간 확인
- Search Console 실적
  - 총 클릭수
  - 총 노출수
  - 평균 CTR
  - 평균 게재 순위
- GA4 참여도
  - 신규 사용자
  - 재방문 사용자
  - 전환 이벤트 (급여 계산 완료)

### 월간 확인
- 콘텐츠 실적 분석
- 인기 페이지 TOP 10
- 유입 경로 분석 (검색, 직접 방문, 소셜)
- Core Web Vitals 점수

---

## 🎯 목표 지표 (1개월 후)

| 지표 | 현재 | 목표 |
|------|------|------|
| 일일 방문자 | 0 | 50명 |
| 페이지뷰 | 0 | 200 |
| 평균 체류시간 | - | 1분 |
| 이탈률 | - | 70% |
| 검색 노출 | 0 | 1,000 |
| 인덱싱된 페이지 | 0 | 14개 |

---

## 📚 참고 자료

- [GA4 시작 가이드](https://support.google.com/analytics/answer/9304153)
- [Search Console 시작 가이드](https://support.google.com/webmasters/answer/9128668)
- [Cloudflare Pages 문서](https://developers.cloudflare.com/pages/)
- [React Router 문서](https://reactrouter.com/)

---

## ✅ 최종 확인 사항

배포 및 GA4 통합이 완료되면 다음을 확인하세요:

1. **기능 테스트**
   - [ ] 급여 계산기 정상 작동
   - [ ] 모든 페이지 접근 가능
   - [ ] Navigation 및 Footer 작동

2. **분석 도구**
   - [ ] GA4 실시간 데이터 수집
   - [ ] Search Console 소유권 확인
   - [ ] Sitemap 제출

3. **SEO 최적화**
   - [ ] Meta 태그 정상
   - [ ] Structured Data 정상
   - [ ] 모바일 반응형 정상

4. **다음 단계 준비**
   - [ ] 블로그 포스팅 계획
   - [ ] 콘텐츠 추가 계획
   - [ ] 기능 고도화 계획

---

## 🚀 다음 단계 (Phase 3: 서비스 고도화)

검증 완료 후 다음 계획을 진행하세요:

1. **콘텐츠 강화** (1-2주)
   - 블로그 포스트 5개 작성
   - 계산 사례 상세 페이지 3개
   - FAQ 10개 추가

2. **기능 고도화** (2-4주)
   - 역산 기능 (Net → Gross)
   - PDF 출력 기능
   - 시프트 템플릿 확장
   - 자동 경고 시스템

3. **트래픽 확보** (1-3개월)
   - 주 1-2회 블로그 포스팅
   - SEO 최적화 지속
   - 롱테일 키워드 공략
   - 목표: 일 100명 방문

자세한 내용은 `GOOGLE_ANALYTICS_STRATEGY.md` 참조.
