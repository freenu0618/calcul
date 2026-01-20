/**
 * 근무 시프트 캘린더 컴포넌트
 * FullCalendar 기반 시각적 시프트 입력 UI
 * TODO: FullCalendar 설치 후 구현
 */

import type { WorkShiftRequest } from '../../types/salary';

interface ShiftCalendarProps {
    shifts: WorkShiftRequest[];
    onShiftAdd: (shift: WorkShiftRequest) => void;
    onShiftRemove: (index: number) => void;
}

export default function ShiftCalendar(_props: ShiftCalendarProps) {
    return (
        <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-600">캘린더 기능은 곧 제공될 예정입니다.</p>
            <p className="text-sm text-gray-500 mt-2">FullCalendar 라이브러리 설치 후 사용 가능</p>
        </div>
    );
}
