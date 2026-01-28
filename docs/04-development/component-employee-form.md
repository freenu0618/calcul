# 근로자 정보 입력 폼 컴포넌트 개발 문서

## 문서 정보

- **작성일**: 2026-01-13
- **컴포넌트 위치**: `frontend/src/components/EmployeeForm/`
- **개발 상태**: 완료
- **버전**: 1.0.0

## 1. 개요

### 1.1 목적

급여 계산기에서 근로자의 기본 정보(이름, 부양가족, 고용형태, 사업장 규모)를 입력받는 폼 컴포넌트입니다.

### 1.2 주요 기능

- 5개 필드 입력: 이름, 부양가족 수, 20세 이하 자녀 수, 고용 형태, 사업장 규모
- 실시간 입력 검증 및 에러 메시지 표시
- 접근성 준수 (WCAG 2.1 AA)
- 반응형 디자인 (모바일 우선)
- TypeScript 타입 안정성

## 2. 컴포넌트 구조

### 2.1 파일 구성

```
frontend/src/components/EmployeeForm/
├── EmployeeForm.tsx (154줄)        # 메인 컴포넌트
├── FormField.tsx (67줄)            # 텍스트/숫자 입력 필드
├── RadioGroup.tsx (45줄)           # 라디오 버튼 그룹
├── EmployeeForm.example.tsx (76줄) # 사용 예제
├── index.ts (4줄)                  # Export 모듈
├── README.md                       # 컴포넌트 개요
└── INTEGRATION.md                  # 통합 가이드
```

**총 코드 라인**: 346줄 (개별 파일 모두 200줄 이하)

### 2.2 컴포넌트 계층 구조

```
EmployeeForm (메인)
├── FormField (재사용)
│   ├── 이름 입력
│   ├── 부양가족 수 입력
│   └── 20세 이하 자녀 수 입력
├── RadioGroup (재사용)
│   ├── 고용 형태 선택
│   └── 사업장 규모 선택
```

### 2.3 의존성

```json
{
  "dependencies": {
    "react": "^18.x",
    "typescript": "^5.x"
  },
  "devDependencies": {
    "tailwindcss": "^3.x"
  }
}
```

## 3. 기술 명세

### 3.1 Props Interface

```typescript
interface EmployeeFormProps {
  onChange: (data: EmployeeRequest) => void;
  initialData?: Partial<EmployeeRequest>;
}
```

### 3.2 타입 정의 (salary.ts)

```typescript
export type EmploymentType = 'FULL_TIME' | 'PART_TIME';
export type CompanySize = 'UNDER_5' | 'OVER_5';

export interface EmployeeRequest {
  name: string;
  dependents_count: number;
  children_under_20: number;
  employment_type: EmploymentType;
  company_size: CompanySize;
}
```

### 3.3 검증 규칙

| 필드 | 검증 규칙 | 에러 메시지 |
|------|----------|------------|
| name | 필수 입력, 공백 불가 | "이름을 입력해주세요." |
| dependents_count | >= 0 | "부양가족 수는 0 이상이어야 합니다." |
| children_under_20 | >= 0 | "20세 이하 자녀 수는 0 이상이어야 합니다." |
| children_under_20 | <= dependents_count | "20세 이하 자녀 수는 부양가족 수를 초과할 수 없습니다." |
| employment_type | FULL_TIME \| PART_TIME | (라디오 버튼, 검증 불필요) |
| company_size | UNDER_5 \| OVER_5 | (라디오 버튼, 검증 불필요) |

## 4. 스타일링

### 4.1 Tailwind CSS 클래스

- **카드 컨테이너**: `bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto`
- **제목**: `text-2xl font-bold text-gray-800 mb-6`
- **레이블**: `text-sm font-medium text-gray-700 mb-2`
- **입력 필드**: `px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500`
- **에러 상태**: `border-red-500`
- **에러 메시지**: `text-sm text-red-600`

### 4.2 반응형 디자인

- 기본 (모바일): 전체 너비
- sm (640px+): 카드 최대 너비 제한
- md (768px+): 여백 확대
- lg (1024px+): 여백 확대

## 5. 접근성 (a11y)

### 5.1 구현 사항

- ✅ `<label>` 요소와 입력 필드 연결 (`htmlFor`, `id`)
- ✅ ARIA 속성 사용 (`aria-label`, `aria-invalid`, `aria-describedby`)
- ✅ 에러 메시지 `role="alert"` 적용 (스크린 리더 즉시 읽음)
- ✅ 필수 항목 시각적 표시 (빨간색 별표)
- ✅ 포커스 상태 명확한 표시 (`focus:ring-2`)
- ✅ 키보드 네비게이션 지원 (Tab, Shift+Tab)

### 5.2 WCAG 2.1 AA 준수

- **1.3.1 정보와 관계**: label과 input 명확히 연결
- **1.4.3 명암 대비**: 텍스트 대비율 4.5:1 이상
- **2.1.1 키보드 접근**: 모든 기능 키보드로 사용 가능
- **3.3.1 오류 식별**: 에러 메시지 명확히 표시
- **3.3.2 레이블 또는 설명**: 모든 입력에 레이블 제공

## 6. 사용 예제

### 6.1 기본 사용

```tsx
import EmployeeForm from './components/EmployeeForm';
import type { EmployeeRequest } from './types/salary';

const App = () => {
  const handleEmployeeChange = (data: EmployeeRequest) => {
    console.log('근로자 정보:', data);
  };

  return <EmployeeForm onChange={handleEmployeeChange} />;
};
```

### 6.2 초기 데이터 제공

```tsx
<EmployeeForm
  onChange={handleEmployeeChange}
  initialData={{
    name: '홍길동',
    dependents_count: 2,
    children_under_20: 1,
    employment_type: 'FULL_TIME',
    company_size: 'OVER_5',
  }}
/>
```

## 7. 법적 고려사항

### 7.1 사업장 규모의 중요성

사업장 규모는 근로기준법 제56조에 따라 휴일근로 가산율에 영향을 미칩니다:

- **5인 미만**: 휴일근로 8시간 초과 시 가산율 1.5배
- **5인 이상**: 휴일근로 8시간 초과 시 가산율 2.0배

### 7.2 부양가족 및 자녀 공제

소득세법에 따라 인적공제에 사용됩니다:

- 부양가족 1인당 연 150만원 공제
- 20세 이하 자녀 추가 공제 적용

## 8. 성능 최적화

### 8.1 적용된 최적화

- `useState` 사용으로 불필요한 재렌더링 방지
- `useEffect` 의존성 배열 최적화
- 컴포넌트 분리로 재렌더링 범위 최소화

### 8.2 추가 최적화 가능 항목

- `React.memo()` 적용 (FormField, RadioGroup)
- `useCallback()` 적용 (onChange, onBlur 핸들러)
- Debounce 적용 (텍스트 입력 시)

## 9. 테스트 시나리오

### 9.1 기능 테스트

- [ ] 이름 입력 시 실시간 검증
- [ ] 부양가족 수 음수 입력 방지
- [ ] 자녀 수 > 부양가족 수 에러 표시
- [ ] 라디오 버튼 선택 동작
- [ ] 초기 데이터 정상 표시
- [ ] onChange 콜백 정상 호출 (검증 통과 시)

### 9.2 접근성 테스트

- [ ] 스크린 리더로 모든 필드 읽기 가능
- [ ] 키보드만으로 모든 입력 가능
- [ ] 에러 메시지 스크린 리더로 즉시 읽힘
- [ ] 포커스 순서 논리적

### 9.3 반응형 테스트

- [ ] 모바일 (320px): 정상 표시
- [ ] 태블릿 (768px): 정상 표시
- [ ] 데스크톱 (1024px+): 정상 표시

## 10. 향후 개선 사항

### 10.1 단기 개선

- [ ] React.memo 적용으로 성능 최적화
- [ ] 입력 필드 포커스 자동 이동
- [ ] 툴팁 추가 (사업장 규모 설명)

### 10.2 장기 개선

- [ ] 다국어 지원 (i18n)
- [ ] 폼 상태 저장 (localStorage)
- [ ] 애니메이션 효과 추가
- [ ] Storybook 통합

## 11. 개발자 노트

### 11.1 코드 품질

- **라인 수 제한 준수**: 모든 파일 200줄 이하
- **DRY 원칙**: FormField, RadioGroup 재사용
- **단일 책임 원칙**: 각 컴포넌트 명확한 역할
- **타입 안정성**: TypeScript로 완벽한 타입 정의

### 11.2 코드 리뷰 체크리스트

- ✅ 타입 import 시 `type` 키워드 사용 (verbatimModuleSyntax)
- ✅ 모든 함수에 JSDoc 주석
- ✅ 접근성 속성 완비
- ✅ 에러 처리 로직 포함
- ✅ 반응형 디자인 적용

### 11.3 알려진 이슈

없음

## 12. 참고 자료

- [React 공식 문서](https://react.dev/)
- [Tailwind CSS 문서](https://tailwindcss.com/)
- [WCAG 2.1 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)
- [근로기준법 (법제처)](https://www.law.go.kr/)
- [소득세법 (법제처)](https://www.law.go.kr/)

## 13. 라이선스

MIT License

---

**문서 버전**: 1.0.0
**마지막 업데이트**: 2026-01-13
**작성자**: Claude Code (claude.ai)
