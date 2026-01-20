# EmployeeForm 컴포넌트

근로자의 기본 정보를 입력받는 폼 컴포넌트입니다.

## 기능

- 근로자 이름 입력
- 부양가족 수 입력
- 20세 이하 자녀 수 입력
- 고용 형태 선택 (정규직/비정규직)
- 사업장 규모 선택 (5인 미만/5인 이상)
- 실시간 입력 검증 및 에러 메시지 표시
- 접근성 지원 (ARIA 레이블, 스크린 리더 지원)

## 사용 방법

### 기본 사용

```tsx
import EmployeeForm from './components/EmployeeForm';
import { EmployeeRequest } from './types/salary';

const MyComponent = () => {
  const handleEmployeeChange = (data: EmployeeRequest) => {
    console.log('근로자 정보:', data);
  };

  return <EmployeeForm onChange={handleEmployeeChange} />;
};
```

### 초기 데이터 제공

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

## Props

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| `onChange` | `(data: EmployeeRequest) => void` | Yes | 폼 데이터 변경 시 호출되는 콜백 함수 |
| `initialData` | `Partial<EmployeeRequest>` | No | 폼의 초기 데이터 |

## 검증 규칙

1. **이름**: 필수 입력 항목
2. **부양가족 수**: 0 이상의 정수
3. **20세 이하 자녀 수**: 0 이상의 정수, 부양가족 수 이하
4. **고용 형태**: FULL_TIME 또는 PART_TIME
5. **사업장 규모**: UNDER_5 또는 OVER_5

## 스타일링

- Tailwind CSS 기반
- 모바일 우선 반응형 디자인
- 카드 형태의 깔끔한 레이아웃
- 에러 상태 시각적 표시 (빨간색 테두리)

## 접근성

- 모든 입력 필드에 `label` 연결
- ARIA 속성 지원 (`aria-label`, `aria-invalid`, `aria-describedby`)
- 에러 메시지 스크린 리더 지원 (`role="alert"`)
- 키보드 네비게이션 지원
- 포커스 상태 명확한 표시

## 법적 참고사항

### 사업장 규모의 중요성

사업장 규모는 휴일근로 가산율 계산에 영향을 미칩니다:

- **5인 미만**: 휴일근로 8시간 초과 시 가산율 1.5배 (기본)
- **5인 이상**: 휴일근로 8시간 초과 시 가산율 2.0배 (근로기준법 제56조)

### 부양가족 및 자녀 수

소득세 계산 시 인적공제에 사용됩니다:
- 부양가족 1인당 연 150만원 공제
- 20세 이하 자녀 추가 공제 적용

## 예제

실제 사용 예제는 `EmployeeForm.example.tsx` 파일을 참고하세요.

## 파일 구조

```
EmployeeForm/
├── EmployeeForm.tsx          # 메인 컴포넌트
├── EmployeeForm.example.tsx  # 사용 예제
├── index.ts                  # Export 모듈
└── README.md                 # 이 문서
```

## 라이선스

MIT License
