# 🚨 Cloudflare Pages 환경변수 긴급 수정 필요

**날짜**: 2026-01-21
**우선순위**: 🔴 CRITICAL

---

## 문제 상황

### 현재 환경변수 값 (잘못됨)
```
VITE_API_BASE_URL=https://paytools.work/,https://calcul-1b9.pages.dev/
```

### 문제점
1. **콤마로 구분된 여러 URL**: API 클라이언트가 잘못된 URL 생성
2. **끝에 슬래시(/)**: URL 중복 슬래시 발생 가능

### 영향
- API 호출 실패 (405 Method Not Allowed)
- 회원가입/로그인 불가
- 급여 계산 기능 불가

---

## 즉시 수정 방법

### Step 1: Cloudflare Pages 대시보드 접속
```
https://dash.cloudflare.com
→ Pages
→ calcul (또는 프로젝트 이름)
→ Settings
→ Environment variables
```

### Step 2: Production 환경변수 수정
```
1. Production 탭 클릭
2. VITE_API_BASE_URL 찾기
3. Edit 버튼 클릭
4. 값 변경:

   ❌ 잘못된 값:
   https://paytools.work/,https://calcul-1b9.pages.dev/

   ✅ 올바른 값:
   https://paytools.work

5. Save 버튼 클릭
```

### Step 3: 재배포
```
1. Deployments 탭 이동
2. 최신 배포 찾기 (커밋 8ce435d)
3. ... 버튼 → Retry deployment 클릭
4. 빌드 완료 대기 (약 2-3분)
```

---

## 검증 절차

### 1. 빌드 로그 확인
```
배포 로그에서 다음 출력 확인:

✅ 환경변수 검증 완료
   VITE_API_BASE_URL: https://paytools.work

(콤마 없어야 함!)
```

### 2. 빌드 성공 확인
```
✅ Build succeeded
✅ Deployed to production

(에러 없어야 함)
```

### 3. 프론트엔드 동작 확인
```bash
# 브라우저에서 접속
https://calcul-1b9.pages.dev

# 개발자 도구 (F12) → Console
# 다음 로그 확인:
[API Config] {
  BASE_URL: 'https://paytools.work',
  API_VERSION: '/api/v1',
  ...
}
```

### 4. API 호출 테스트
```
1. 회원가입 페이지 이동
2. 개발자 도구 → Network 탭
3. 테스트 계정 생성 시도
4. Request URL 확인:

   ✅ 정상: https://paytools.work/api/v1/auth/register
   ❌ 오류: https://paytools.work/,https://...
```

---

## TypeScript 빌드 오류 해결 완료

### 수정된 파일 (커밋 8ce435d)

1. **App.tsx**
   - 제거: gtag 타입 선언 (전역 타입과 충돌)
   - 이유: index.html의 GA 스크립트에서 이미 정의됨

2. **ErrorBoundary.tsx**
   - 변경: `import { ErrorInfo, ReactNode }` → `import type { ErrorInfo, ReactNode }`
   - 변경: `process.env.NODE_ENV` → `import.meta.env.DEV`
   - 이유: verbatimModuleSyntax 요구사항

3. **ShiftInput.tsx, Home.tsx**
   - 제거: 사용하지 않는 `useMemo` import

### 검증 결과
```bash
✅ TypeScript 컴파일: 에러 0개
✅ 로컬 타입 체크: 통과
✅ 커밋: 8ce435d
✅ GitHub 푸시: 완료
```

---

## 배포 후 최종 체크리스트

### 필수 확인 사항
- [ ] 환경변수 수정 완료 (`https://paytools.work` 단일 값)
- [ ] 재배포 완료 (커밋 8ce435d)
- [ ] 빌드 성공 확인
- [ ] 프론트엔드 접속 확인
- [ ] 회원가입 URL 정상 확인
- [ ] 급여 계산 기능 테스트

### 예상 복구 시간
- 환경변수 수정: 1분
- 재배포 대기: 2-3분
- 검증: 5분
- **총 소요 시간**: 약 10분

---

## 추가 참고사항

### 환경변수 설정 규칙
```bash
# ✅ 올바른 형식
VITE_API_BASE_URL=https://api.example.com

# ❌ 잘못된 형식들
VITE_API_BASE_URL=https://api.example.com/     # 끝에 슬래시
VITE_API_BASE_URL=https://api1.com,https://api2.com  # 여러 URL
VITE_API_BASE_URL="https://api.example.com"    # 따옴표 (불필요)
```

### CORS 설정 (백엔드)
백엔드의 `ALLOWED_ORIGINS`는 여러 도메인 허용:
```bash
# Railway/Fly.io 환경변수 (올바름)
ALLOWED_ORIGINS=https://calcul-1b9.pages.dev,https://paytools.work
```

이는 프론트엔드의 `VITE_API_BASE_URL`과는 다른 용도입니다.

---

## 문제 발생 원인 분석

### 1차 원인: 환경변수 잘못된 설정
- 누군가 Cloudflare Pages에서 환경변수를 잘못 입력
- 또는 이전 설정이 잘못 병합됨

### 2차 원인: TypeScript 엄격 모드
- `verbatimModuleSyntax: true` 설정
- 타입 import와 값 import 엄격히 구분
- Vite 환경에서 process.env 사용 불가

### 근본 원인: 로컬 테스트 부족
- 로컬에서는 `.env` 파일로 환경변수 설정
- 프로덕션 환경변수는 별도 확인 필요
- CI/CD에서 빌드 테스트 권장

---

## 재발 방지 대책

### 1. 환경변수 검증 강화
현재 `validate-env.js`는 존재 여부만 확인합니다.
향후 개선 권장:
```javascript
// 콤마 포함 여부 확인
if (process.env.VITE_API_BASE_URL.includes(',')) {
  console.error('❌ 환경변수에 콤마(,)가 포함되어 있습니다.');
  process.exit(1);
}

// 끝에 슬래시 경고
if (process.env.VITE_API_BASE_URL.endsWith('/')) {
  console.warn('⚠️ 환경변수 끝의 슬래시(/)는 자동 제거됩니다.');
}
```

### 2. GitHub Actions CI/CD
`.github/workflows/build-test.yml` 생성 권장:
```yaml
name: Build Test
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build frontend
        run: |
          cd frontend
          npm ci
          VITE_API_BASE_URL=https://example.com npm run build
```

### 3. 프로덕션 환경변수 문서화
`.env.example` 파일에 명확한 주석 추가:
```bash
# ⚠️ 프로덕션 배포 시 주의사항:
# - 단일 URL만 입력 (콤마 금지)
# - 끝에 슬래시(/) 제거
# - 따옴표 없이 입력
VITE_API_BASE_URL=https://paytools.work
```

---

## 연락처

문제가 지속되면:
1. Cloudflare Pages 배포 로그 확인
2. GitHub Issues에 빌드 로그 첨부
3. `docs/DEPLOYMENT_READY.md` 트러블슈팅 참고

**긴급 문의**: GitHub repository Issues 탭
