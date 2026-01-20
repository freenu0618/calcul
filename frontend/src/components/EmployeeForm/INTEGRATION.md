# EmployeeForm 통합 가이드

## 빠른 시작

### 1. 컴포넌트 import

```tsx
import EmployeeForm from './components/EmployeeForm';
import type { EmployeeRequest } from './types/salary';
```

### 2. 상태 관리 설정

```tsx
const [employeeData, setEmployeeData] = useState<EmployeeRequest | null>(null);

const handleEmployeeChange = (data: EmployeeRequest) => {
  setEmployeeData(data);
  // API 호출 또는 다른 로직
};
```

### 3. 컴포넌트 렌더링

```tsx
<EmployeeForm
  onChange={handleEmployeeChange}
  initialData={employeeData}
/>
```

## 전체 페이지 예제

```tsx
import React, { useState } from 'react';
import EmployeeForm from './components/EmployeeForm';
import type { EmployeeRequest } from './types/salary';

const SalaryCalculatorPage: React.FC = () => {
  const [employeeData, setEmployeeData] = useState<EmployeeRequest | null>(null);
  const [isValid, setIsValid] = useState(false);

  const handleEmployeeChange = (data: EmployeeRequest) => {
    setEmployeeData(data);
    setIsValid(true);
  };

  const handleSubmit = async () => {
    if (!isValid || !employeeData) {
      alert('근로자 정보를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee: employeeData }),
      });

      const result = await response.json();
      console.log('계산 결과:', result);
    } catch (error) {
      console.error('API 오류:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">급여 계산기</h1>

      <EmployeeForm onChange={handleEmployeeChange} />

      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
      >
        다음 단계
      </button>

      {employeeData && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">입력된 정보</h3>
          <pre>{JSON.stringify(employeeData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SalaryCalculatorPage;
```

## API 연동 예제

### 백엔드 API 엔드포인트 호출

```tsx
import type { EmployeeRequest, SalaryCalculationResponse } from './types/salary';

const calculateSalary = async (
  employee: EmployeeRequest,
  baseSalary: number,
  // ... 기타 파라미터
): Promise<SalaryCalculationResponse> => {
  const response = await fetch('/api/salary/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      employee,
      base_salary: baseSalary,
      // ... 기타 데이터
    }),
  });

  if (!response.ok) {
    throw new Error('급여 계산 실패');
  }

  return response.json();
};
```

## 검증 로직

EmployeeForm은 자체적으로 다음 검증을 수행합니다:

1. 이름 필수 입력
2. 부양가족 수 >= 0
3. 20세 이하 자녀 수 >= 0
4. 20세 이하 자녀 수 <= 부양가족 수

검증 통과 시에만 `onChange` 콜백이 호출됩니다.

## 스타일 커스터마이징

### Tailwind CSS 클래스 오버라이드

컴포넌트는 Tailwind CSS를 사용하므로, 전역 스타일이나 상위 컴포넌트에서 커스터마이징 가능합니다:

```tsx
<div className="custom-form-wrapper">
  <EmployeeForm onChange={handleEmployeeChange} />
</div>
```

```css
/* 커스텀 스타일 */
.custom-form-wrapper input {
  @apply border-2 border-purple-500;
}
```

## 접근성 고려사항

- 모든 입력 필드는 `label`과 연결되어 있습니다
- 에러 메시지는 `role="alert"`로 스크린 리더에 즉시 전달됩니다
- 키보드만으로 모든 기능 사용 가능합니다
- 포커스 상태가 명확하게 표시됩니다

## 문제 해결

### Q: onChange가 호출되지 않아요

A: 폼 검증에 실패했을 가능성이 높습니다. 각 필드의 에러 메시지를 확인하세요.

### Q: 초기 데이터가 표시되지 않아요

A: `initialData` prop이 정확한 타입인지 확인하세요. 부분 데이터도 허용됩니다.

### Q: TypeScript 에러가 발생해요

A: `type` 키워드를 사용하여 import하세요:
```tsx
import type { EmployeeRequest } from './types/salary';
```

## 다음 단계

1. 급여 입력 폼 컴포넌트 추가
2. 근무 시프트 입력 캘린더 통합
3. 계산 결과 표시 컴포넌트 연결

## 관련 문서

- [README.md](./README.md) - 컴포넌트 개요
- [EmployeeForm.example.tsx](./EmployeeForm.example.tsx) - 사용 예제
- [types/salary.ts](../../types/salary.ts) - 타입 정의
