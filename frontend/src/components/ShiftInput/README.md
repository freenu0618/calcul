# ShiftInput 컴포넌트

근무 시프트 입력을 위한 React 컴포넌트 모듈입니다. 한국 근로기준법에 따른 근무 시간 계산 및 경고 표시 기능을 제공합니다.

## 컴포넌트 구조

```
ShiftInput/
├── ShiftInput.tsx           # 메인 컨테이너 컴포넌트 (170줄)
├── ShiftRow.tsx             # 개별 시프트 행 컴포넌트 (98줄)
├── ShiftRowMobile.tsx       # 모바일 카드 뷰 (135줄)
├── ShiftRowDesktop.tsx      # 데스크톱 테이블 뷰 (96줄)
├── ShiftSummary.tsx         # 근무 시간 요약 컴포넌트 (146줄)
├── ShiftInput.example.tsx   # 사용 예제 (83줄)
├── index.ts                 # 모듈 exports
└── README.md                # 본 문서
```

**모든 컴포넌트는 200줄 이하로 작성되었습니다 (CLAUDE.md 준수).**

## 주요 기능

### 1. 시프트 관리
- 여러 개의 근무 시프트 추가/삭제
- 각 시프트별 입력 항목:
  - 근무일 (date): YYYY-MM-DD 형식
  - 시작 시간 (start_time): HH:MM 24시간 형식
  - 종료 시간 (end_time): HH:MM 24시간 형식
  - 휴게시간 (break_minutes): 분 단위
  - 휴일 근무 여부 (is_holiday_work): boolean

### 2. 자동 계산
- **실 근무 시간**: (종료 시간 - 시작 시간 - 휴게시간)
- **야간 근무 감지**: 22:00~06:00 구간 포함 시 자동 표시
- **다음날 근무 지원**: 종료 시간 < 시작 시간인 경우 (예: 22:00~06:00)

### 3. 법적 경고
- 주 52시간 초과 경고 (월 226시간 기준)
- 야간 근무 가산수당 안내 (통상시급의 50%)
- 휴일 근무 가산수당 안내 (통상시급의 150%)

### 4. 반응형 디자인
- **모바일**: 카드 형태 레이아웃
- **데스크톱**: 테이블 형태 레이아웃
- Tailwind CSS 유틸리티 클래스 사용

## 사용 방법

### 기본 사용

```tsx
import React, { useState } from 'react';
import { ShiftInput } from './components/ShiftInput';
import { WorkShiftRequest } from './types/salary';

function SalaryCalculator() {
  const [workShifts, setWorkShifts] = useState<WorkShiftRequest[]>([]);

  return (
    <div>
      <ShiftInput
        onChange={(shifts) => setWorkShifts(shifts)}
        initialShifts={[]}
      />
    </div>
  );
}
```

### 초기 데이터와 함께 사용

```tsx
const initialShifts: WorkShiftRequest[] = [
  {
    date: '2026-01-13',
    start_time: '09:00',
    end_time: '18:00',
    break_minutes: 60,
    is_holiday_work: false,
  },
  {
    date: '2026-01-14',
    start_time: '22:00',
    end_time: '06:00',
    break_minutes: 30,
    is_holiday_work: false,
  },
];

<ShiftInput
  onChange={handleShiftChange}
  initialShifts={initialShifts}
/>
```

## Props

### ShiftInput

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onChange` | `(shifts: WorkShiftRequest[]) => void` | Yes | 시프트 변경 시 호출되는 콜백 함수 |
| `initialShifts` | `WorkShiftRequest[]` | No | 초기 시프트 데이터 (기본값: `[]`) |

### WorkShiftRequest 타입

```typescript
interface WorkShiftRequest {
  date: string;              // YYYY-MM-DD
  start_time: string;        // HH:MM
  end_time: string;          // HH:MM
  break_minutes: number;     // 분 단위
  is_holiday_work: boolean;  // 휴일 근무 여부
}
```

## 스타일링

### Tailwind CSS 클래스 구조

- **컨테이너**: `space-y-4` - 수직 간격
- **헤더**: `flex justify-between items-center` - 타이틀과 버튼 배치
- **버튼**: `bg-blue-600 hover:bg-blue-700` - 기본 액션 버튼
- **카드**: `border rounded-lg shadow-md` - 시프트 카드
- **경고**: `bg-yellow-50 border-yellow-200` - 안내 메시지
- **휴일 근무**: `bg-red-50 border-red-200` - 휴일 시프트 강조

### 반응형 브레이크포인트

- **모바일**: `< 768px` - 카드 레이아웃
- **데스크톱**: `>= 768px` (md:) - 테이블 레이아웃

## 접근성 (a11y)

- 모든 입력 필드에 `aria-label` 적용
- 폼 필드에 `<label>` 요소 연결
- 필수 입력 필드 시각적 표시 (`*`)
- 키보드 네비게이션 지원
- Focus 상태 명확한 표시 (`focus:ring-2`)

## 계산 로직

### 근무 시간 계산

```typescript
// 분 단위로 계산
const startMinutes = startHour * 60 + startMin;
let endMinutes = endHour * 60 + endMin;

// 다음날 넘어가는 경우
if (endMinutes < startMinutes) {
  endMinutes += 24 * 60;
}

const workingMinutes = endMinutes - startMinutes - break_minutes;
```

### 야간 근무 감지

```typescript
// 22:00 ~ 06:00 구간 포함 여부
const hasNightWork =
  startHour >= 22 ||
  endHour < 6 ||
  (startHour < 6 && endHour < 6);
```

## 법적 기준 (2026년)

### 가산수당 (근로기준법 제56조)
- **연장근로**: 통상시급 × 1.5배 (주 40시간 초과)
- **야간근로**: 통상시급 × 0.5배 (22:00~06:00)
- **휴일근로**: 통상시급 × 1.5배 (8시간 이하)

### 주 52시간 제한
- 법정 근로시간: 주 40시간
- 연장 근로 한도: 주 12시간
- **총 한도**: 주 52시간

## 향후 개선 사항

- [ ] FullCalendar 통합 (시각적 캘린더 뷰)
- [ ] 시프트 템플릿 기능 (주간/월간 패턴 복사)
- [ ] Excel/CSV 임포트/익스포트
- [ ] 드래그 앤 드롭으로 시프트 재정렬
- [ ] 시프트 간 간격 검증 (11시간 휴식 권장)
- [ ] 주차별 그룹화 표시

## 테스트 시나리오

1. **풀타임 근무** (09:00~18:00, 휴게 60분)
2. **야간 근무** (22:00~06:00, 휴게 30분)
3. **휴일 근무** (일요일 근무)
4. **주 52시간 초과** (226시간 이상)
5. **빈 시프트 리스트** (안내 메시지 표시)

## 관련 파일

- **타입 정의**: `C:\calcul\frontend\src\types\salary.ts`
- **백엔드 엔티티**: `C:\calcul\backend\app\domain\entities\work_shift.py`
- **계산 서비스**: `C:\calcul\backend\app\domain\services\overtime_calculator.py`

## 라이선스

본 컴포넌트는 취업 포트폴리오용 프로젝트의 일부입니다.
