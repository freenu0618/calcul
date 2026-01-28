# Next Phase Workflow: 서비스 고도화 전략

## 📊 현재 상태 (2026-01-20)

### ✅ Phase 1-2 완료
- 다중 페이지 구조 (14개 페이지)
- Google Analytics 4 통합 (G-26QRZ1CK71)
- Google Search Console 연동
- React Router + Navigation/Footer
- Sitemap.xml 제출

### 🎯 프로젝트 특성
- **목적**: 취업용 포트폴리오
- **핵심**: 기술력 증명 + 법적 정확성
- **타겟**: 영세 사업장, 근로자

---

## 🚀 추천 워크플로우: Workflow A (기능 우선)

### 📌 전략 근거
1. **포트폴리오 강점**: 복잡한 알고리즘 구현 능력 시연
2. **차별화**: 역산 기능은 대부분의 급여 계산기에 없는 고급 기능
3. **풀스택 역량**: 백엔드 알고리즘 + 프론트엔드 UI 통합
4. **사용자 가치**: "250만원 받으려면 얼마 받아야 하나요?" 실질적 질문 해결

---

## 📅 4주 Implementation Plan

### Week 1: 역산 기능 백엔드 구현

#### 🎯 목표
실수령액(Net Pay) → 총지급액(Gross Pay) 추정 알고리즘 개발

#### 📋 Task List
1. **도메인 서비스 설계**
   - 파일: `backend/app/domain/services/reverse_calculator.py`
   - 알고리즘: 이진 탐색 (Binary Search)
   - 입력: 목표 실수령액, 직원 정보, 수당
   - 출력: 추정 총지급액, 계산 과정

2. **핵심 알고리즘**
   ```python
   def reverse_calculate(
       target_net_pay: Money,
       employee: Employee,
       allowances: List[Allowance],
       max_iterations: int = 50,
       tolerance: Money = Money(1000)  # ±1,000원
   ) -> ReverseCalculationResult:
       """
       이진 탐색으로 목표 실수령액 달성하는 총지급액 추정

       Args:
           target_net_pay: 목표 실수령액
           employee: 직원 정보
           allowances: 수당 목록
           max_iterations: 최대 반복 횟수
           tolerance: 허용 오차

       Returns:
           ReverseCalculationResult: 추정 총지급액 및 계산 과정
       """
       # 이진 탐색 구현
       # 하한: target_net_pay (최소값)
       # 상한: target_net_pay * 2 (초기 추정)
       # 반복: 중간값으로 정방향 계산 후 실수령액 비교
   ```

3. **API 엔드포인트**
   - 파일: `backend/app/api/v1/endpoints/salary.py`
   - 라우터: `POST /api/v1/salary/reverse`
   - 스키마: `ReverseCalculationRequest`, `ReverseCalculationResponse`

4. **단위 테스트**
   - 파일: `backend/tests/domain/services/test_reverse_calculator.py`
   - 테스트 케이스:
     - 풀타임 근로자 (월급 300만원 → 실수령 250만원)
     - 파트타임 근로자 (시급 → 월 실수령 100만원)
     - 최저임금 케이스
     - 고소득자 (4대 보험 상한)
     - 부양가족 있는 경우

#### 🔧 기술 스택
- Python 3.11
- FastAPI
- Decimal (정확한 금액 계산)
- Pytest

#### ⏱️ 예상 소요 시간
- 알고리즘 설계: 4시간
- 구현: 8시간
- 테스트 작성: 4시간
- 디버깅: 4시간
- **Total: 20시간 (주 5일 기준 4시간/일)**

#### ✅ 완료 기준
- [ ] 모든 단위 테스트 통과 (커버리지 90% 이상)
- [ ] 정확도: ±1,000원 이내
- [ ] 성능: 50회 반복 내 수렴
- [ ] API 문서화 (Swagger UI)

---

### Week 2: 역산 기능 프론트엔드 통합

#### 🎯 목표
역산 기능 UI 구현 및 백엔드 API 연동

#### 📋 Task List
1. **API 클라이언트 추가**
   - 파일: `frontend/src/services/api/salaryApi.ts`
   - 함수: `reverseCalculate()`
   - TypeScript 타입: `ReverseCalculationRequest`, `ReverseCalculationResponse`

2. **UI 컴포넌트 설계**
   - 파일: `frontend/src/pages/ReverseCalculator.tsx`
   - 레이아웃:
     ```
     [목표 실수령액 입력]
     ├─ 입력 필드: "원하는 실수령액 (예: 2,500,000원)"
     ├─ 직원 정보 폼 (재사용: EmployeeInfoForm)
     └─ 수당 입력 (재사용: AllowanceInput)

     [계산 결과]
     ├─ 추정 총지급액: "₩3,200,000"
     ├─ 실제 실수령액: "₩2,498,500" (오차 표시)
     ├─ 계산 과정:
     │   ├─ 4대 보험: ₩350,000
     │   ├─ 소득세: ₩120,000
     │   └─ 지방소득세: ₩12,000
     └─ 경고 메시지 (최저임금 미달 등)
     ```

3. **라우팅 추가**
   - 파일: `frontend/src/App.tsx`
   - 경로: `/reverse`
   - Navigation 메뉴에 "역산 계산기" 추가

4. **UI/UX 개선**
   - 로딩 상태 표시
   - 에러 핸들링 (API 실패)
   - 반응형 디자인 (모바일 최적화)
   - 애니메이션 (결과 표시 시)

5. **통합 테스트**
   - 파일: `frontend/src/__tests__/ReverseCalculator.test.tsx`
   - 테스트 케이스:
     - 입력 검증
     - API 호출 성공
     - 에러 처리
     - 결과 표시 정확성

#### 🔧 기술 스택
- React 18 + TypeScript
- Tailwind CSS
- Axios (API 호출)
- React Hook Form (폼 관리)

#### ⏱️ 예상 소요 시간
- UI 컴포넌트 구현: 8시간
- API 연동: 4시간
- 스타일링: 4시간
- 테스트: 4시간
- **Total: 20시간**

#### ✅ 완료 기준
- [ ] 모든 기능 정상 작동
- [ ] 모바일 반응형 완료
- [ ] API 에러 핸들링 완료
- [ ] 사용자 경험 검증

---

### Week 3: 자동 경고 시스템

#### 🎯 목표
법적 리스크 자동 감지 및 경고 표시

#### 📋 Task List
1. **백엔드: 검증 로직**
   - 파일: `backend/app/domain/services/validation_service.py`
   - 검증 항목:
     ```python
     class SalaryValidationService:
         def validate_minimum_wage(self, salary_result: SalaryResult) -> List[Warning]:
             """최저임금 미달 검사"""

         def validate_weekly_hours(self, shifts: List[WorkShift]) -> List[Warning]:
             """주 52시간 위반 검사"""

         def validate_insurance_limits(self, insurance: InsuranceCalculationResult) -> List[Warning]:
             """4대 보험 상한/하한 검사"""

         def validate_overtime_limits(self, overtime: OvertimeCalculationResult) -> List[Warning]:
             """연장근로 제한 검사 (주 12시간)"""
     ```

2. **프론트엔드: 경고 UI**
   - 파일: `frontend/src/components/WarningAlert.tsx` (기존 확장)
   - 경고 레벨:
     - 🔴 Critical: 법 위반 (최저임금 미달)
     - 🟡 Warning: 권장 사항 (주 52시간 초과)
     - 🔵 Info: 참고 정보 (보험 상한 근접)

3. **경고 메시지 작성**
   ```typescript
   const warnings = {
     MINIMUM_WAGE_VIOLATION: {
       level: 'critical',
       title: '최저임금 미달',
       message: '계산된 시급이 2026년 최저임금(10,030원)보다 낮습니다.',
       action: '노동청 신고 가능 (☎ 1350)',
       link: 'https://www.moel.go.kr'
     },
     WEEKLY_HOURS_VIOLATION: {
       level: 'warning',
       title: '주 52시간 초과',
       message: '연장근로 포함 주 52시간을 초과합니다.',
       action: '근로기준법 제53조 위반 가능성',
       link: '/legal'
     }
   };
   ```

#### ⏱️ 예상 소요 시간
- 백엔드 검증 로직: 8시간
- 프론트엔드 UI: 6시간
- 테스트: 6시간
- **Total: 20시간**

#### ✅ 완료 기준
- [ ] 모든 법적 리스크 검증
- [ ] 경고 메시지 정확성
- [ ] 사용자 친화적 표현
- [ ] 관련 법 조문 링크

---

### Week 4: 콘텐츠 강화 (SEO)

#### 🎯 목표
트래픽 확보를 위한 고품질 콘텐츠 제작

#### 📋 Task List

##### 1. 계산 사례 상세 페이지 3개
**파일 구조:**
```
frontend/src/pages/Examples/
├── ExamplesPage.tsx (기존 - 인덱스 페이지)
├── FulltimeExample.tsx (신규)
├── ParttimeExample.tsx (신규)
└── ShiftWorkExample.tsx (신규)
```

**콘텐츠 구성 (각 1,500단어):**
```markdown
# [사례 제목] (예: 풀타임 근로자 급여 계산 완벽 가이드)

## 1. 기본 정보
- 근무 형태: 풀타임 주5일 (월~금)
- 근무 시간: 09:00 ~ 18:00 (점심 1시간)
- 기본급: 3,000,000원
- 사업장 규모: 5인 이상

## 2. 급여 계산 과정
[단계별 상세 설명]

## 3. 실제 계산 예시
[스크린샷 + 수치]

## 4. 자주 묻는 질문 (5개)

## 5. 관련 법률
[근로기준법 조항]

## 6. 실전 팁
[주의사항 및 꿀팁]
```

**3개 사례:**
1. **FulltimeExample.tsx**: 풀타임 주5일 (기본 케이스)
2. **ParttimeExample.tsx**: 파트타임 주3일 + 주휴수당
3. **ShiftWorkExample.tsx**: 교대근무 + 야간수당

##### 2. 블로그 포스트 5개
**파일 구조:**
```
frontend/src/pages/Blog/
├── BlogPage.tsx (기존 - 인덱스)
├── posts/
│   ├── 2026MinimumWage.tsx
│   ├── InsuranceRates2026.tsx
│   ├── OvertimeCalculationTips.tsx
│   ├── WeeklyHolidayPay.tsx
│   └── TaxSavingStrategies.tsx
```

**포스트 주제 (각 1,000단어):**
1. **2026년 최저임금 완벽 정리** (키워드: 최저임금 2026)
2. **4대 보험료율 변경 사항** (키워드: 4대 보험 2026)
3. **연장수당 계산 꿀팁 5가지** (키워드: 연장수당 계산)
4. **주휴수당 계산법 쉽게 이해하기** (키워드: 주휴수당)
5. **근로소득세 절세 전략** (키워드: 소득세 절세)

##### 3. 라우팅 및 SEO 최적화
- 각 페이지에 고유 메타 태그
- Open Graph 이미지 (og-image)
- Schema.org 마크업 (Article, HowTo)
- 내부 링크 최적화 (상호 참조)

#### ⏱️ 예상 소요 시간
- 사례 페이지 3개: 12시간 (4시간/개)
- 블로그 포스트 5개: 10시간 (2시간/개)
- SEO 최적화: 4시간
- 이미지 제작: 4시간
- **Total: 30시간**

#### ✅ 완료 기준
- [ ] 총 콘텐츠: 8개 페이지 (사례 3 + 블로그 5)
- [ ] 평균 단어 수: 1,200단어 이상
- [ ] 내부 링크: 각 페이지 3개 이상
- [ ] SEO 점수: 90점 이상 (Lighthouse)

---

## 📊 4주 후 예상 성과

### 기술적 성과
- ✅ 역산 기능: 복잡한 알고리즘 구현 (이진 탐색)
- ✅ 자동 경고: 법적 안전장치 완비
- ✅ 풀스택 통합: 백엔드 + 프론트엔드 완전 연동

### 콘텐츠 성과
- 📄 총 페이지: 14개 → 22개 (57% 증가)
- 📝 총 단어 수: 10,000 → 20,000 (2배)
- 🔗 내부 링크: 강화된 크로스 링크 구조

### SEO 성과
- 🔍 타겟 키워드: 15개 추가
- 📈 예상 월간 노출: 1,000 → 5,000
- 👥 예상 일일 방문자: 0 → 30명

### 포트폴리오 강점
- 🎯 차별화: 역산 기능 (독창성)
- 💻 기술 스택: Python 알고리즘 + React UI
- 📚 도메인 지식: 근로기준법 전문성
- 🧪 품질: 90% 테스트 커버리지

---

## 🔄 Alternative Workflows

### Workflow B: 밸런스 (기능 + 콘텐츠)
**특징**: 기능 개발과 콘텐츠 제작 병행

- Week 1: 역산 기능 백엔드 + 사례 1개
- Week 2: 역산 기능 프론트엔드 + 사례 2개
- Week 3: 블로그 5개 + 자동 경고
- Week 4: PDF 출력 기능 시작

**장점**: 빠른 트래픽 확보
**단점**: 개발 집중도 분산

### Workflow C: 콘텐츠 우선 (트래픽 우선)
**특징**: SEO 효과 극대화 후 기능 개발

- Week 1-2: 사례 3개 + 블로그 8개
- Week 3-4: 역산 기능 전체

**장점**: AdSense 승인 조기 달성
**단점**: 기술력 증명 지연

---

## 🎯 Workflow A 선택 근거

### 1. 포트폴리오 관점
- **면접 질문 대비**: "가장 어려웠던 기능은?" → 역산 알고리즘
- **기술력 증명**: 단순 CRUD가 아닌 알고리즘 구현 능력
- **차별화**: 대부분의 신입 포트폴리오에 없는 고급 기능

### 2. 사용자 가치
- **실질적 질문 해결**: "250만원 받으려면?" → 즉시 답변
- **법적 안전장치**: 자동 경고로 리스크 회피
- **신뢰도 향상**: 정확한 계산 + 검증 로직

### 3. 개발 효율성
- **코드 재사용**: 기존 계산 로직 활용
- **테스트 용이**: 단위 테스트로 정확도 보장
- **문서화**: API 문서 자동 생성 (Swagger)

---

## 📋 Implementation Checklist

### Pre-Implementation
- [ ] Git branch 생성: `feature/reverse-calculator`
- [ ] 개발 환경 확인 (Python 3.11, Node 18)
- [ ] 의존성 설치 (pytest, jspdf)

### Week 1 (역산 백엔드)
- [ ] `reverse_calculator.py` 구현
- [ ] API 엔드포인트 추가
- [ ] 단위 테스트 작성 (10개 이상)
- [ ] API 문서화 업데이트
- [ ] 커밋 및 푸시

### Week 2 (역산 프론트엔드)
- [ ] TypeScript 타입 정의
- [ ] `ReverseCalculator.tsx` 구현
- [ ] API 클라이언트 통합
- [ ] 라우팅 추가
- [ ] 통합 테스트
- [ ] 배포 및 검증

### Week 3 (자동 경고)
- [ ] `validation_service.py` 구현
- [ ] 경고 메시지 작성
- [ ] `WarningAlert.tsx` 확장
- [ ] 테스트 (모든 경고 케이스)
- [ ] 배포

### Week 4 (콘텐츠)
- [ ] 사례 페이지 3개 작성
- [ ] 블로그 포스트 5개 작성
- [ ] SEO 메타 태그 추가
- [ ] 이미지 최적화
- [ ] sitemap.xml 업데이트
- [ ] Google Search Console 재제출

---

## 🔍 Quality Gates

### 코드 품질
- [ ] 테스트 커버리지: 90% 이상
- [ ] 타입 검사: TypeScript strict 모드
- [ ] 린팅: ESLint + Prettier 통과
- [ ] 보안: OWASP Top 10 준수

### 성능
- [ ] API 응답 시간: 200ms 이하
- [ ] 프론트엔드 로딩: 3초 이내
- [ ] Lighthouse 점수: 90점 이상

### 사용성
- [ ] 모바일 반응형: 375px 이상
- [ ] 접근성: WCAG 2.1 AA 준수
- [ ] 브라우저 호환성: Chrome, Firefox, Safari, Edge

### SEO
- [ ] 메타 태그 완비
- [ ] Open Graph 이미지
- [ ] Structured Data 검증
- [ ] sitemap.xml 유효성

---

## 📚 참고 자료

### 알고리즘 참고
- [Binary Search Algorithm](https://en.wikipedia.org/wiki/Binary_search_algorithm)
- [Numerical Methods for Root Finding](https://en.wikipedia.org/wiki/Root-finding_algorithms)

### 한국 법률
- [근로기준법 (최저임금)](https://www.law.go.kr/법령/근로기준법)
- [근로기준법 시행령 (근로시간)](https://www.law.go.kr/법령/근로기준법시행령)

### SEO 가이드
- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)

---

## 🚀 시작하기

### 즉시 실행
```bash
# 1. Feature branch 생성
git checkout -b feature/reverse-calculator

# 2. 역산 기능 구현 시작
# backend/app/domain/services/reverse_calculator.py 생성

# 3. 테스트 주도 개발 (TDD)
# backend/tests/domain/services/test_reverse_calculator.py 먼저 작성
```

### 다음 명령
```
1. "/sc:implement reverse calculator" - 역산 기능 즉시 구현 시작
2. "역산 기능 백엔드부터 구현해줘" - 백엔드 알고리즘 개발
3. "계산 사례 페이지 3개 만들어줘" - 콘텐츠 제작 시작
```

**추천**: Workflow A를 따라 역산 기능부터 시작하세요!

---

## 📞 Support

문제 발생 시:
1. `docs/DEPLOYMENT_VERIFICATION.md` - 배포 관련
2. `CLAUDE.md` - 프로젝트 가이드
3. GitHub Issues - 버그 리포트

Good luck! 🎉


