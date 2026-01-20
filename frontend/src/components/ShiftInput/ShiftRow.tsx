import type { WorkShiftRequest } from '../../types/salary';
import ShiftRowMobile from './ShiftRowMobile';
import ShiftRowDesktop from './ShiftRowDesktop';

/**
 * 개별 근무 시프트 입력 행 컴포넌트
 *
 * @description 단일 근무 시프트의 입력 필드를 표시하고 관리합니다.
 * 근무일, 시작/종료 시간, 휴게시간, 휴일 여부를 입력받습니다.
 * 모바일과 데스크톱 뷰를 자동으로 전환합니다.
 *
 * @example
 * <ShiftRow
 *   shift={shiftData}
 *   index={0}
 *   onChange={handleChange}
 *   onDelete={handleDelete}
 * />
 */
interface ShiftRowProps {
  shift: WorkShiftRequest;
  index: number;
  onChange: (index: number, updatedShift: WorkShiftRequest) => void;
  onDelete: (index: number) => void;
}

const ShiftRow: React.FC<ShiftRowProps> = ({ shift, index, onChange, onDelete }) => {
  const handleFieldChange = (field: keyof WorkShiftRequest, value: string | number | boolean) => {
    onChange(index, { ...shift, [field]: value });
  };

  // 근무 시간 계산 (분 단위)
  const calculateWorkingMinutes = (): number | null => {
    if (!shift.start_time || !shift.end_time) return null;

    const [startHour, startMin] = shift.start_time.split(':').map(Number);
    const [endHour, endMin] = shift.end_time.split(':').map(Number);

    let startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;

    // 다음날 넘어가는 경우 (예: 22:00 ~ 06:00)
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }

    const totalMinutes = endMinutes - startMinutes - shift.break_minutes;
    return totalMinutes > 0 ? totalMinutes : 0;
  };

  // 야간 근무 포함 여부 확인 (22:00~06:00)
  const hasNightWork = (): boolean => {
    if (!shift.start_time || !shift.end_time) return false;

    const [startHour] = shift.start_time.split(':').map(Number);
    const [endHour] = shift.end_time.split(':').map(Number);

    // 22시 이후 시작 또는 6시 이전 종료
    return startHour >= 22 || endHour < 6 || (startHour < 6 && endHour < 6);
  };

  const workingMinutes = calculateWorkingMinutes();
  const workingHours = workingMinutes !== null ? Math.floor(workingMinutes / 60) : null;
  const workingMins = workingMinutes !== null ? workingMinutes % 60 : null;

  return (
    <div
      className={`
        p-4 border rounded-lg
        ${shift.is_holiday_work ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}
        hover:shadow-md transition-shadow
      `}
    >
      <ShiftRowMobile
        shift={shift}
        index={index}
        workingHours={workingHours}
        workingMins={workingMins}
        hasNightWork={hasNightWork()}
        onFieldChange={handleFieldChange}
        onDelete={() => onDelete(index)}
      />

      <ShiftRowDesktop
        shift={shift}
        index={index}
        workingHours={workingHours}
        workingMins={workingMins}
        hasNightWork={hasNightWork()}
        onFieldChange={handleFieldChange}
        onDelete={() => onDelete(index)}
      />
    </div>
  );
};

export default ShiftRow;
