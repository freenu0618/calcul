# 배포 준비 완료 보고서

**날짜**: 2026-01-21
**버전**: 1.0.0-production-ready
**커밋**: 477a5e8

---

## 1. 배포 준비 상태 ✅

### 1-1. 테스트 결과

#### 백엔드
```
✅ 181/181 테스트 통과
  - 167 단위 테스트
  - 14 통합 테스트
  - 실행 시간: 1.00초
  - 경고: 2개 (FastAPI deprecation, 배포 차단 없음)
```

#### 프론트엔드
```
✅ TypeScript 컴파일 통과
  - 타입 에러: 0개
  - 'any' 타입: 8개 (예제 페이지, 우선순위 낮음)
  - 빌드 검증 스크립트: 정상 작동
```

### 1-2. 주요 수정 사항 (v1.0.0)

#### 🚨 CRITICAL: 법적 정확성 수정

1. **시급 계산 기준 수정 (209시간 → 174시간)**
   - 문제: 통상시급 17.6% 과소 계산
   - 영향: 근로자당 월 ~2,695원 손해
   - 해결: `MONTHLY_REGULAR_HOURS = 174` 변경
   - 파일: `backend/app/domain/services/salary_calculator.py`

2. **초과근무 수당 요율 수정 (0.5배 → 1.5배)**
   - 문제: 연장근무 수당 67% 과소 지급
   - 영향: 연장 10시간당 월 ~100,000원 손해
   - 해결: `OVERTIME_RATE = 1.5` 변경
   - 파일: `backend/app/domain/services/overtime_calculator.py`

3. **파트타임 주휴수당 자동 인식**
   - 문제: 파트타임 근로자 주휴수당 0원
   - 해결: 근무 패턴 자동 감지 (Counter 사용)
   - 파일: `backend/app/domain/services/weekly_holiday_pay_calculator.py`

#### 🔧 프로덕션 준비 개선

4. **API URL 구성 중앙화**
   - 문제: 405 에러 (URL에 콤마 포함)
   - 해결: `api.config.ts` 중앙 설정 모듈 생성
   - 파일: `frontend/src/config/api.config.ts` (신규)

5. **환경변수 검증 스크립트**
   - 기능: 빌드 전 필수 환경변수 확인
   - 파일: `frontend/scripts/validate-env.js` (신규)
   - package.json: `prebuild` 스크립트 추가

6. **Pydantic V2 마이그레이션**
   - 변경: `Config` → `ConfigDict`
   - 영향: 경고 5개 → 2개 (60% 감소)
   - 파일: auth.py, employees.py, records.py

7. **TypeScript 타입 안전성**
   - 변경: `any` 타입 제거 (우선순위 파일)
   - 파일: App.tsx, Login.tsx, Register.tsx

8. **React 성능 최적화**
   - 변경: `useCallback` 추가
   - 파일: Home.tsx, ShiftInput.tsx

9. **에러 바운더리 추가**
   - 기능: React 에러 전역 처리
   - GA4 에러 추적 연동
   - 파일: `frontend/src/components/ErrorBoundary.tsx` (신규)

---

## 2. 배포 체크리스트

### 2-1. 프론트엔드 (Cloudflare Pages)

#### 빌드 설정
```yaml
Project name: salary-calculator (또는 사용자 지정)
Production branch: master (또는 main)

Build settings:
  Framework preset: Vite
  Build command: cd frontend && npm ci && npm run build
  Build output directory: frontend/dist
  Root directory: (비워둠)
```

#### 환경 변수 (필수)
```bash
# Cloudflare Pages → Settings → Environment variables → Production

VITE_API_BASE_URL=https://paytools.work
```

**⚠️ 중요**: 환경변수 미설정 시 빌드 실패 (validate-env.js가 차단)

#### 배포 URL
- Cloudflare Pages 자동 생성: `https://{project-name}.pages.dev`
- 실제 도메인: `https://calcul-1b9.pages.dev` (기존)

### 2-2. 백엔드 (Railway/Fly.io)

#### 현재 상태
- **도메인**: `https://paytools.work` (이미 설정됨)
- **플랫폼**: 확인 필요 (Railway 또는 Fly.io)

#### 환경 변수 (확인 필요)
```bash
ALLOWED_ORIGINS=https://calcul-1b9.pages.dev,https://paytools.work
PYTHONUNBUFFERED=1
DATABASE_URL=(PostgreSQL 자동 설정)
```

#### 재배포 필요 여부
- ✅ **필수**: 백엔드 코드 변경 (법적 정확성 수정)
- 방법: Git push 시 자동 재배포 (Railway/Fly.io 설정 확인)

---

## 3. 배포 후 검증 절차

### 3-1. 프론트엔드 검증

#### A. 페이지 로딩 확인
```bash
# 브라우저 접속
https://calcul-1b9.pages.dev

# 개발자 도구 (F12) → Console
# - 에러 메시지 없어야 함
# - API 설정 로그: "[API Config] { BASE_URL: 'https://paytools.work', ... }"
```

#### B. 회원가입 API URL 검증
```
1. 회원가입 페이지 (/register) 이동
2. 개발자 도구 → Network 탭 열기
3. 회원가입 폼 제출
4. Network 탭에서 요청 URL 확인:

   ✅ 정상: https://paytools.work/api/v1/auth/register
   ❌ 오류: https://paytools.work/,https://calcul-1b9.pages.dev//api/v1/...
```

#### C. 에러 바운더리 테스트
```
1. 개발자 도구 → Console
2. 의도적 에러 발생:
   throw new Error('Test error');

3. 에러 페이지 표시 확인:
   - "문제가 발생했습니다" 메시지
   - "홈으로 돌아가기" 버튼
   - GA4 에러 이벤트 전송 (gtag 'exception')
```

### 3-2. 백엔드 검증

#### A. Swagger UI 접속
```bash
https://paytools.work/docs

# 예상 응답: Swagger UI 페이지 로딩
```

#### B. 급여 계산 API 테스트
```bash
# curl 테스트 (PowerShell)
curl -X POST https://paytools.work/api/v1/salary/calculate `
  -H "Content-Type: application/json" `
  -d '{
    "employee": {
      "name": "테스트",
      "dependents_count": 0,
      "employment_type": "FULL_TIME",
      "company_size": "OVER_5"
    },
    "base_salary": 2800000,
    "allowances": [],
    "work_shifts": []
  }'

# 검증 포인트:
# 1. "hourly_wage": 16092  ✅ (2,800,000 ÷ 174 = 16,092원)
# 2. "weekly_holiday_pay": 559184 ✅ (별도 지급)
# 3. 에러 없음
```

#### C. 연장근무 수당 검증
```bash
# 연장 10시간 시나리오 (주 40시간 + 10시간)
curl -X POST https://paytools.work/api/v1/salary/calculate `
  -H "Content-Type: application/json" `
  -d '{
    "employee": {"name": "연장테스트", "dependents_count": 0, "employment_type": "FULL_TIME", "company_size": "OVER_5"},
    "base_salary": 2800000,
    "allowances": [],
    "work_shifts": [
      {"date": "2026-01-13", "start_time": "09:00", "end_time": "20:00", "break_minutes": 60},
      {"date": "2026-01-14", "start_time": "09:00", "end_time": "20:00", "break_minutes": 60},
      {"date": "2026-01-15", "start_time": "09:00", "end_time": "20:00", "break_minutes": 60},
      {"date": "2026-01-16", "start_time": "09:00", "end_time": "20:00", "break_minutes": 60},
      {"date": "2026-01-17", "start_time": "09:00", "end_time": "20:00", "break_minutes": 60}
    ]
  }'

# 검증 포인트:
# "overtime_pay": 241380 ✅ (16,092원 × 1.5배 × 10시간)
# 잘못된 값: 80,460원 (0.5배 사용 시)
```

#### D. 파트타임 주휴수당 검증
```bash
# 주 3일 근무 시나리오
curl -X POST https://paytools.work/api/v1/salary/calculate `
  -H "Content-Type: application/json" `
  -d '{
    "employee": {"name": "파트타임", "dependents_count": 0, "employment_type": "PART_TIME", "company_size": "OVER_5"},
    "base_salary": 0,
    "allowances": [],
    "work_shifts": [
      {"date": "2026-01-13", "start_time": "09:00", "end_time": "17:00", "break_minutes": 0},
      {"date": "2026-01-15", "start_time": "09:00", "end_time": "17:00", "break_minutes": 0},
      {"date": "2026-01-17", "start_time": "09:00", "end_time": "17:00", "break_minutes": 0}
    ]
  }'

# 검증 포인트:
# "weekly_holiday_pay": > 0 ✅ (비례 계산)
# "is_proportional": true ✅
# 잘못된 값: 0원 (파트타임 미인식 시)
```

---

## 4. 트러블슈팅 가이드

### 4-1. "❌ 필수 환경변수 누락: VITE_API_BASE_URL"

**원인**: Cloudflare Pages 환경변수 미설정

**해결**:
```
1. Cloudflare Pages 대시보드 접속
2. 프로젝트 선택
3. Settings → Environment variables 클릭
4. Production 탭에서 추가:
   - Variable name: VITE_API_BASE_URL
   - Value: https://paytools.work
5. Save 클릭
6. Deployments → Retry deployment
```

### 4-2. "405 Method Not Allowed" (회원가입/로그인)

**원인**: API URL에 콤마 또는 중복 슬래시 포함

**증상**:
```
POST https://paytools.work/,https://calcul-1b9.pages.dev//api/v1/auth/register 405
```

**해결**: 이미 수정됨 (api.config.ts 적용)

**검증**: Network 탭에서 URL 확인
```
✅ 정상: https://paytools.work/api/v1/auth/register
```

### 4-3. 통상시급 과소 계산 (13,397원)

**원인**: 백엔드 코드 미배포 (209시간 기준 사용 중)

**증상**:
```json
{
  "hourly_wage": 13397,  // ❌ 잘못됨 (2,800,000 ÷ 209)
  "expected": 16092      // ✅ 정답 (2,800,000 ÷ 174)
}
```

**해결**:
```bash
# Git push로 자동 재배포 (Railway/Fly.io)
git push origin master

# 또는 수동 재배포 (Railway 대시보드)
```

### 4-4. 연장근무 수당 과소 지급

**원인**: 백엔드 코드 미배포 (0.5배 요율 사용 중)

**증상**:
```json
{
  "overtime_pay": 80460,   // ❌ 잘못됨 (0.5배)
  "expected": 241380       // ✅ 정답 (1.5배)
}
```

**해결**: 4-3과 동일 (백엔드 재배포)

### 4-5. CORS 에러

**원인**: 백엔드 `ALLOWED_ORIGINS` 미설정

**증상**:
```
Access to XMLHttpRequest at 'https://paytools.work/api/v1/salary/calculate'
from origin 'https://calcul-1b9.pages.dev' has been blocked by CORS policy
```

**해결**:
```bash
# Railway 또는 Fly.io 환경변수 추가
ALLOWED_ORIGINS=https://calcul-1b9.pages.dev,https://paytools.work
```

---

## 5. 배포 순서 (권장)

### Step 1: 프론트엔드 환경변수 설정
```
Cloudflare Pages → Settings → Environment variables
VITE_API_BASE_URL=https://paytools.work
```

### Step 2: 백엔드 재배포
```bash
# Git push (자동 배포)
git push origin master

# 또는 Railway 대시보드에서 수동 재배포
```

### Step 3: 프론트엔드 재배포
```
Cloudflare Pages → Deployments → Retry deployment
(또는 Git push 시 자동 배포)
```

### Step 4: 검증
```
1. Swagger UI 접속 (https://paytools.work/docs)
2. 급여 계산 API 테스트 (curl)
3. 프론트엔드 접속 (https://calcul-1b9.pages.dev)
4. 회원가입 URL 확인 (Network 탭)
5. 급여 계산 기능 테스트
```

---

## 6. 법적 정확성 검증 결과

### 시급 계산 (174시간 기준)
| 기본급 | 기대값 (174시간) | 실제값 | 상태 |
|--------|------------------|--------|------|
| 2,800,000원 | 16,092원 | ✅ 16,092원 | 정상 |
| 2,156,880원 | 12,396원 | ✅ 12,396원 | 정상 |

### 연장근무 수당 (1.5배)
| 연장시간 | 통상시급 | 기대값 | 실제값 | 상태 |
|----------|----------|--------|--------|------|
| 10시간 | 16,092원 | 241,380원 | ✅ 241,380원 | 정상 |

### 주휴수당 (별도 지급)
| 근무형태 | 시급 | 기대값 | 실제값 | 상태 |
|----------|------|--------|--------|------|
| 풀타임 | 16,092원 | 559,184원 | ✅ 559,184원 | 정상 |
| 파트타임 (주24h) | 16,092원 | 335,510원 | ✅ 335,510원 | 정상 |

---

## 7. 성능 지표

### 백엔드
- 테스트 실행 시간: 1.00초
- API 응답 시간: < 100ms (예상)
- 메모리 사용량: < 512MB (예상)

### 프론트엔드
- 빌드 시간: ~30초 (Vite)
- 번들 크기: ~300KB (예상)
- Lighthouse 점수 목표: 90+

---

## 8. 다음 단계 (배포 후)

### 즉시 수행
- [ ] 백엔드 재배포 (법적 정확성 수정 반영)
- [ ] 프론트엔드 환경변수 설정
- [ ] 배포 후 검증 (섹션 3 수행)

### 단기 (1주일)
- [ ] Google Search Console 등록
- [ ] Google Analytics 4 이벤트 검증
- [ ] 성능 모니터링 (Lighthouse)

### 중기 (1개월)
- [ ] SEO 최적화 (블로그 콘텐츠)
- [ ] 사용자 피드백 수집
- [ ] 버그 수정 및 개선

---

## 9. 연락처 및 지원

### 프로젝트 정보
- GitHub: (레포지토리 URL)
- 프론트엔드: https://calcul-1b9.pages.dev
- 백엔드: https://paytools.work

### 기술 문서
- 배포 가이드: `docs/DEPLOYMENT_GUIDE.md`
- Railway 배포: `docs/RAILWAY_DEPLOYMENT.md`
- 프로젝트 가이드: `CLAUDE.md`

---

## 10. 결론

**배포 준비 상태: ✅ 완료**

모든 테스트 통과, 법적 정확성 검증 완료, 프로덕션 안전장치 적용 완료.

**권장 사항**: 백엔드 재배포 후 섹션 3의 검증 절차를 수행하여 모든 수정사항이 정상 반영되었는지 확인하시기 바랍니다.
