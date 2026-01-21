# /deploy-verify - 배포 검증 에이전트

## 개요
Cloudflare Pages와 Railway/Fly.io 배포 후 프론트엔드와 백엔드의 정상 작동을 검증합니다.
API 엔드포인트, 환경변수, CORS, 법적 정확성을 자동으로 확인합니다.

## Triggers
- "배포 검증", "프로덕션 체크"
- "API 동작 확인", "배포 후 테스트"
- "회원가입 테스트", "급여 계산 검증"

## 사용법
```
/deploy-verify              # 전체 시스템 검증
/deploy-verify backend      # 백엔드만 검증
/deploy-verify frontend     # 프론트엔드만 검증
/deploy-verify --legal      # 법적 정확성 포함
```

## Behavioral Flow

### 1. Backend Health Check
```bash
curl https://paytools.work/health
# 예상: {"status":"healthy","version":"1.0.0"}
```

### 2. Swagger UI 확인
```bash
curl https://paytools.work/docs
# 예상: 200 OK, HTML 응답
```

### 3. 주요 API 엔드포인트 테스트
```bash
# 급여 계산 API
curl -X POST https://paytools.work/api/v1/salary/calculate \
  -H "Content-Type: application/json" \
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
# - "hourly_wage": 16092 (2,800,000 ÷ 174)
# - "weekly_holiday_pay": 559184
# - 응답 시간 < 1초
```

### 4. 프론트엔드 접속 확인
- https://calcul-1b9.pages.dev
- https://paytools.work

### 5. 환경변수 검증
```javascript
// 브라우저 Console에서 확인
[API Config] {
  BASE_URL: 'https://paytools.work',  // 콤마 없어야 함!
  API_VERSION: '/api/v1'
}
```

### 6. CORS 설정 확인
```bash
curl -X OPTIONS https://paytools.work/api/v1/salary/calculate \
  -H "Origin: https://calcul-1b9.pages.dev" \
  -H "Access-Control-Request-Method: POST"

# 예상: Access-Control-Allow-Origin: https://calcul-1b9.pages.dev
```

### 7. 법적 정확성 재검증
```bash
# 시급 계산 (174시간 기준)
# 연장근무 1.5배
# 주휴수당 별도 지급
```

## 검증 체크리스트

### 백엔드
- [ ] Health Check 응답 200 OK
- [ ] Swagger UI 접속 가능
- [ ] 급여 계산 API 정상 (200 OK)
- [ ] 시급 계산 정확 (174시간 기준)
- [ ] 연장근무 1.5배 요율
- [ ] 응답 시간 < 1초

### 프론트엔드
- [ ] 두 도메인 모두 접속 가능
- [ ] 환경변수 정상 (콤마 없음)
- [ ] 회원가입 URL 정상
- [ ] 급여 계산 폼 작동
- [ ] 결과 표시 정상

### CORS
- [ ] calcul-1b9.pages.dev 허용
- [ ] paytools.work 허용
- [ ] OPTIONS 요청 정상

### SEO
- [ ] robots.txt 접근 가능
- [ ] sitemap.xml 접근 가능
- [ ] 메타 태그 정상

## Examples

### Example 1: 전체 검증
```
/deploy-verify --legal

[배포 검증 리포트]

백엔드:
✅ Health Check: 200 OK (23ms)
✅ Swagger UI: 접속 가능
✅ 급여 계산 API: 200 OK (187ms)
✅ 시급 계산: 16,092원 (정확)
✅ 연장근무 요율: 1.5배 (정확)

프론트엔드:
✅ calcul-1b9.pages.dev: 접속 가능
✅ paytools.work: 접속 가능
✅ 환경변수: 정상 (콤마 없음)
✅ 회원가입 URL: https://paytools.work/api/v1/auth/register

CORS:
✅ calcul-1b9.pages.dev: 허용됨
✅ paytools.work: 허용됨

SEO:
✅ robots.txt: 접근 가능
✅ sitemap.xml: 26 URLs

총점: 100/100
배포 성공 ✅
```

### Example 2: 문제 감지
```
/deploy-verify

[배포 검증 리포트]

백엔드:
✅ Health Check: 200 OK
❌ 급여 계산 API: 405 Method Not Allowed
   URL: https://paytools.work/,https://calcul-1b9.pages.dev/api/v1/salary/calculate
   문제: 환경변수에 콤마 포함

프론트엔드:
⚠️ 환경변수: 잘못됨
   VITE_API_BASE_URL=https://paytools.work/,https://calcul-1b9.pages.dev/

조치 필요:
1. Cloudflare Pages 환경변수 수정
   VITE_API_BASE_URL=https://paytools.work
2. 재배포 (Retry deployment)

총점: 60/100
배포 실패 ❌
```

## Tool Coordination
- **Bash**: curl로 API 테스트
- **WebFetch**: 프론트엔드 접속 확인
- **Read**: 환경변수 설정 확인
- **TodoWrite**: 검증 체크리스트 관리

## Boundaries

**Will:**
- 프로덕션 환경 자동 검증
- API 엔드포인트 테스트
- 환경변수 및 CORS 확인
- 법적 정확성 재검증

**Will Not:**
- 프로덕션 데이터 수정
- 부하 테스트 (별도 도구 필요)
- 보안 취약점 스캔
- 모니터링 설정
