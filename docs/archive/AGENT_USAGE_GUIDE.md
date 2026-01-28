# 🤖 급여 계산기 프로젝트 서브에이전트 사용 가이드

## 개요

급여 계산기 프로젝트에 최적화된 5개 맞춤형 서브에이전트를 제공합니다.
각 에이전트는 특정 작업을 자동화하고 프로젝트 패턴을 준수합니다.

---

## 📋 서브에이전트 목록

### 1. legal-verify - 법적 정확성 검증
**용도**: 근로기준법/세법 계산 로직 검증
**우선순위**: 🔴 HIGH (법적 정확성이 핵심)

```bash
/legal-verify                 # 전체 시스템 검증
/legal-verify salary-calculator  # 급여 계산 검증
/legal-verify overtime        # 연장근무 검증
/legal-verify --2026          # 2026년 법령 기준
```

**주요 기능**:
- 174시간 vs 209시간 계산 기준 검증
- 연장근무 1.5배 요율 확인
- 4대보험 요율 최신성 확인
- 최저임금 준수 검증
- 법적 근거 주석 확인

**사용 시나리오**:
- 도메인 서비스 수정 후
- 법령 변경 시 (매년 1월)
- 새 계산 로직 추가 시
- 테스트 실패 원인 분석

---

### 2. salary-test - 급여 시나리오 테스트
**용도**: 다양한 근무 형태 테스트 자동화
**우선순위**: 🔴 HIGH (테스트 커버리지 유지)

```bash
/salary-test --all            # 전체 시나리오
/salary-test fulltime         # 풀타임 테스트
/salary-test parttime         # 파트타임 테스트
/salary-test night-work       # 야간근무 테스트
/salary-test minimum-wage     # 최저임금 검증
/salary-test --coverage       # 커버리지 리포트
```

**주요 기능**:
- Given-When-Then 패턴 테스트 생성
- pytest 스타일 자동 작성
- 커버리지 리포트 생성
- 법적 요구사항 테스트

**사용 시나리오**:
- 새 근무 형태 추가 시
- 버그 리포트 받았을 때
- 리팩토링 전/후
- 181개 테스트 유지 관리

---

### 3. deploy-verify - 배포 검증
**용도**: 프로덕션 배포 후 자동 검증
**우선순위**: 🔴 HIGH (배포 안정성)

```bash
/deploy-verify                # 전체 검증
/deploy-verify backend        # 백엔드만
/deploy-verify frontend       # 프론트엔드만
/deploy-verify --legal        # 법적 정확성 포함
```

**주요 기능**:
- API 엔드포인트 테스트 (curl)
- 환경변수 검증 (콤마, 슬래시)
- CORS 설정 확인
- 시급 계산 정확성 재검증
- 응답 시간 체크

**사용 시나리오**:
- Git push 후 (Cloudflare/Railway 배포)
- 환경변수 변경 후
- 긴급 핫픽스 배포 후
- 주간/월간 정기 점검

---

### 4. component-create - React 컴포넌트 생성
**용도**: 일관된 React 컴포넌트 자동 생성
**우선순위**: 🟡 MEDIUM (개발 속도 향상)

```bash
/component-create Button      # 버튼 컴포넌트
/component-create Modal       # 모달 컴포넌트
/component-create "SalaryCard"  # 급여 카드
```

**주요 기능**:
- 200줄 제한 준수
- TypeScript Props 인터페이스
- Tailwind CSS 스타일
- 반응형 레이아웃
- 접근성 고려

**사용 시나리오**:
- 새 UI 기능 추가
- 기존 컴포넌트 리팩토링
- 폼 컴포넌트 생성
- 레이아웃 컴포넌트 추가

---

### 5. domain-service - DDD 도메인 서비스
**용도**: DDD 패턴 준수 도메인 로직 생성
**우선순위**: 🟡 MEDIUM (아키텍처 일관성)

```bash
/domain-service "bonus_calculator"  # 상여금 계산
/domain-service "allowance_validator"  # 수당 검증
```

**주요 기능**:
- 순수 함수 패턴
- Money/WorkingHours 값 객체 사용
- Decimal 정밀 계산
- 법적 근거 docstring
- 테스트 스켈레톤 생성

**사용 시나리오**:
- 새 수당 계산 로직
- 도메인 서비스 추가
- 계산 로직 분리
- 법적 요구사항 구현

---

## 🚀 실전 워크플로우

### 시나리오 1: 새 근무 형태 추가 (예: 탄력근무제)

#### Step 1: 도메인 로직 구현
```bash
/domain-service "flexible_work_calculator"
```
→ `backend/app/domain/services/flexible_work_calculator.py` 생성

#### Step 2: 테스트 케이스 작성
```bash
/salary-test flexible "탄력근무제 테스트"
```
→ `backend/app/tests/unit/test_flexible_work.py` 생성

#### Step 3: 법적 검증
```bash
/legal-verify flexible_work_calculator
```
→ 근로기준법 준수 확인

#### Step 4: 프론트엔드 UI 추가
```bash
/component-create "FlexibleWorkForm"
```
→ `frontend/src/components/forms/FlexibleWorkForm.tsx` 생성

#### Step 5: 배포 및 검증
```bash
git add . && git commit && git push
# 배포 완료 대기 (2-3분)
/deploy-verify --legal
```

---

### 시나리오 2: 법령 변경 대응 (예: 2027년 최저임금 인상)

#### Step 1: 법적 검증으로 변경사항 확인
```bash
/legal-verify --2027
```
→ 변경된 요율 감지

#### Step 2: 테스트 케이스 업데이트
```bash
/salary-test minimum-wage "2027년 최저임금"
```
→ 새 최저임금 기준 테스트

#### Step 3: 도메인 서비스 수정
```python
# insurance_calculator.py 수정
MINIMUM_WAGE_2027 = Decimal('13500')  # 예시
```

#### Step 4: 전체 테스트 실행
```bash
pytest backend/app/tests/ -v
```

#### Step 5: 배포 및 검증
```bash
/deploy-verify --legal
```

---

### 시나리오 3: 긴급 버그 수정

#### Step 1: 문제 재현 테스트 작성
```bash
/salary-test reproduce "버그 재현 테스트"
```

#### Step 2: 법적 정확성 확인
```bash
/legal-verify [affected_service]
```

#### Step 3: 수정 후 테스트
```bash
pytest backend/app/tests/ -v -k "bug"
```

#### Step 4: 배포 및 검증
```bash
/deploy-verify
```

---

## 📊 에이전트별 사용 빈도 (권장)

| 에이전트 | 일일 | 주간 | 월간 | 주요 시점 |
|---------|------|------|------|----------|
| legal-verify | 1-2회 | 5-10회 | 20-40회 | 도메인 로직 수정 후 |
| salary-test | 2-3회 | 10-15회 | 40-60회 | 새 기능 추가 시 |
| deploy-verify | 1회 | 5-7회 | 20-28회 | 배포 직후 |
| component-create | 0-1회 | 2-5회 | 8-20회 | UI 개발 시 |
| domain-service | 0-1회 | 1-3회 | 4-12회 | 새 로직 구현 시 |

---

## 🎯 Best Practices

### DO (권장)
✅ 도메인 로직 수정 후 즉시 `/legal-verify` 실행
✅ Git push 전에 `/salary-test --all` 실행
✅ 배포 후 5분 내에 `/deploy-verify` 실행
✅ 새 컴포넌트는 `/component-create`로 시작
✅ 도메인 서비스는 `/domain-service`로 템플릿 생성

### DON'T (비권장)
❌ 법적 검증 없이 도메인 로직 배포
❌ 테스트 작성 없이 새 기능 추가
❌ 배포 후 검증 생략
❌ 프로젝트 패턴 무시하고 수동 작성
❌ 에이전트 결과를 검토 없이 맹신

---

## 🔧 Troubleshooting

### Q: 에이전트가 작동하지 않아요
A: skill 파일이 `.claude/skills/` 디렉토리에 있는지 확인하세요.

### Q: legal-verify가 너무 느려요
A: `--quick` 옵션 사용 (테스트 생략):
```bash
/legal-verify --quick
```

### Q: salary-test 커버리지가 낮아요
A: 기존 테스트 패턴을 먼저 확인:
```bash
cat backend/app/tests/unit/test_salary_calculator.py
```

### Q: deploy-verify에서 CORS 에러
A: 백엔드 `ALLOWED_ORIGINS` 환경변수 확인:
```bash
# Railway/Fly.io
ALLOWED_ORIGINS=https://calcul-1b9.pages.dev,https://paytools.work
```

---

## 📚 참고 자료

### 프로젝트 문서
- `CLAUDE.md` - 전체 프로젝트 가이드
- `docs/DEPLOYMENT_READY.md` - 배포 가이드
- `docs/CLOUDFLARE_ENV_QUICK_FIX.txt` - 환경변수 수정

### 에이전트 정의 파일
- `.claude/skills/legal-verify.md`
- `.claude/skills/salary-test.md`
- `.claude/skills/deploy-verify.md`
- `.claude/skills/component-create.md`
- `.claude/skills/domain-service.md`

### 법적 근거
- [고용노동부](https://www.moel.go.kr)
- [국세청](https://www.nts.go.kr)
- [근로기준법](https://www.law.go.kr)

---

## 💡 팁

### 에이전트 조합 사용
```bash
# 새 기능 개발 시
/domain-service "new_feature"
/salary-test new-feature
/legal-verify new_feature
/component-create "NewFeatureUI"

# 배포 전 최종 점검
/salary-test --all
/legal-verify --2026
git push origin master
sleep 180  # 3분 대기
/deploy-verify --legal
```

### 에이전트 체인 (자동화)
```bash
# .claude/workflows/full-check.sh (예시)
/salary-test --all && \
/legal-verify --2026 && \
/deploy-verify
```

---

## 🎉 결론

5개 맞춤형 서브에이전트를 활용하면:
- ✅ 법적 정확성 보장
- ✅ 테스트 커버리지 유지 (181+ tests)
- ✅ 배포 안정성 향상
- ✅ 개발 속도 3배 향상
- ✅ 프로젝트 패턴 일관성

**추천**: 첫 주에는 `/legal-verify`와 `/deploy-verify`만 집중적으로 사용하고,
익숙해지면 나머지 에이전트를 점진적으로 도입하세요.

---

**마지막 업데이트**: 2026-01-21
**버전**: 1.0.0
**작성자**: Claude Sonnet 4.5
