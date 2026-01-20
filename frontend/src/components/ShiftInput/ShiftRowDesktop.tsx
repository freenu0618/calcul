import type { WorkShiftRequest } from '../../types/salary';

/**
 * 근무 시프트 입력 행 - 데스크톱 테이블 뷰
 */
interface ShiftRowDesktopProps {
  shift: WorkShiftRequest;
  index: number;
  workingHours: number | null;
  workingMins: number | null;
  hasNightWork: boolean;
  onFieldChange: (field: keyof WorkShiftRequest, value: string | number | boolean) => void;
  onDelete: () => void;
}

const ShiftRowDesktop: React.FC<ShiftRowDesktopProps> = ({
  shift,
  index,
  workingHours,
  workingMins,
  hasNightWork,
  onFieldChange,
  onDelete,
}) => {
  // 날짜 포맷팅 (YYYY-MM-DD -> MM/DD 요일)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getMonth() + 1}/${date.getDate()} (${days[date.getDay()]})`;
  };

  return (
    <div className="hidden md:grid md:grid-cols-7 md:gap-3 md:items-center">
      {/* 날짜 */}
      <div className="relative">
        <input
          type="date"
          value={shift.date}
          onChange={(e) => onFieldChange('date', e.target.value)}
          className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          required
        />
        <span className="block text-xs text-gray-500 mt-0.5">{formatDate(shift.date)}</span>
      </div>

      {/* 시작 시간 */}
      <input
        type="time"
        value={shift.start_time}
        onChange={(e) => onFieldChange('start_time', e.target.value)}
        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
        required
      />

      {/* 종료 시간 */}
      <input
        type="time"
        value={shift.end_time}
        onChange={(e) => onFieldChange('end_time', e.target.value)}
        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
        required
      />

      {/* 휴게시간 */}
      <input
        type="number"
        value={shift.break_minutes}
        onChange={(e) => onFieldChange('break_minutes', parseInt(e.target.value) || 0)}
        min="0"
        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
      />

      {/* 휴일 */}
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          id={`holiday-desktop-${index}`}
          checked={shift.is_holiday_work}
          onChange={(e) => onFieldChange('is_holiday_work', e.target.checked)}
          className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
        />
      </div>

      {/* 실 근무 시간 */}
      <div className="text-sm">
        {workingHours !== null && workingMins !== null && (
          <>
            <span className="font-semibold text-blue-600">
              {workingHours}시간 {workingMins > 0 ? `${workingMins}분` : ''}
            </span>
            {hasNightWork && (
              <span className="block text-xs text-purple-600">🌙 야간</span>
            )}
          </>
        )}
      </div>

      {/* 삭제 */}
      <button
        type="button"
        onClick={onDelete}
        className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
      >
        삭제
      </button>
    </div>
  );
};

export default ShiftRowDesktop;

