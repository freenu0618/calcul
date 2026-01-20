import type { WorkShiftRequest } from '../../types/salary';

/**
 * 근무 시프트 입력 행 - 모바일 카드 뷰
 */
interface ShiftRowMobileProps {
  shift: WorkShiftRequest;
  index: number;
  workingHours: number | null;
  workingMins: number | null;
  hasNightWork: boolean;
  onFieldChange: (field: keyof WorkShiftRequest, value: string | number | boolean) => void;
  onDelete: () => void;
}

const ShiftRowMobile: React.FC<ShiftRowMobileProps> = ({
  shift,
  index,
  workingHours,
  workingMins,
  hasNightWork,
  onFieldChange,
  onDelete,
}) => {
  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
  };

  return (
    <div className="space-y-3 md:hidden">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-700">시프트 {index + 1}</span>
        <button
          type="button"
          onClick={onDelete}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          삭제
        </button>
      </div>

      {/* 근무일 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          근무일 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={shift.date}
          onChange={(e) => onFieldChange('date', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
          required
        />
        <span className="text-xs text-gray-500 mt-0.5 block">{formatDate(shift.date)}</span>
      </div>

      {/* 시작/종료 시간 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            시작 (24시간제) <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={shift.start_time}
            onChange={(e) => onFieldChange('start_time', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            종료 (24시간제) <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={shift.end_time}
            onChange={(e) => onFieldChange('end_time', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
            required
          />
        </div>
      </div>

      {/* 휴게시간 + 휴일 */}
      <div className="grid grid-cols-2 gap-3 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">휴게(분)</label>
          <input
            type="number"
            value={shift.break_minutes}
            onChange={(e) => onFieldChange('break_minutes', parseInt(e.target.value) || 0)}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
          />
        </div>
        <div className="flex items-center h-[42px]">
          <input
            type="checkbox"
            id={`holiday-${index}`}
            checked={shift.is_holiday_work}
            onChange={(e) => onFieldChange('is_holiday_work', e.target.checked)}
            className="w-5 h-5 text-red-600 border-gray-300 rounded"
          />
          <label htmlFor={`holiday-${index}`} className="ml-2 text-sm text-gray-700">
            휴일 근무
          </label>
        </div>
      </div>

      {/* 근무 시간 표시 */}
      {workingHours !== null && workingMins !== null && (
        <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
          <span className="text-gray-600 text-sm">실 근무:</span>
          <span className="font-semibold text-blue-600">
            {workingHours}시간 {workingMins > 0 ? `${workingMins}분` : ''}
            {hasNightWork && <span className="ml-1 text-purple-600">🌙</span>}
          </span>
        </div>
      )}
    </div>
  );
};

export default ShiftRowMobile;

