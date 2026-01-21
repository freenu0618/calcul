# /component-create - React 컴포넌트 생성 에이전트

## 개요
프로젝트 패턴을 준수하는 React 컴포넌트를 자동 생성합니다.
200줄 제한, Tailwind CSS, TypeScript 타입 안전성을 보장합니다.

## Triggers
- "컴포넌트 생성", "UI 추가"
- "폼 만들기", "버튼 컴포넌트"
- "카드 레이아웃", "모달 팝업"

## 사용법
```
/component-create Button       # 버튼 컴포넌트
/component-create Modal        # 모달 컴포넌트
/component-create "UserForm"   # 사용자 폼
```

## 컴포넌트 구조 템플릿

```typescript
/**
 * [컴포넌트 설명]
 */
import type { FC } from 'react';

interface [Component]Props {
  // Props 정의
}

const [Component]: FC<[Component]Props> = ({ ...props }) => {
  return (
    <div className="...">
      {/* Tailwind CSS 사용 */}
    </div>
  );
};

export default [Component];
```

## 규칙
- 파일당 최대 200줄
- TypeScript Props 인터페이스 필수
- Tailwind CSS만 사용 (인라인 스타일 금지)
- 반응형 클래스 사용 (sm:, md:, lg:)
- 접근성 고려 (aria-label, role)

## Tool Coordination
- **Read**: 기존 컴포넌트 패턴 분석
- **Write**: 새 컴포넌트 파일 생성
- **Edit**: 기존 컴포넌트 수정

## Boundaries
**Will:** React 컴포넌트 생성, Props 인터페이스 정의
**Will Not:** 복잡한 상태 관리, API 연동 로직
