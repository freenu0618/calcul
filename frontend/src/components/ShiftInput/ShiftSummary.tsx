import type { WorkShiftRequest } from '../../types/salary';
import { validateShifts, type ShiftWarning } from '../../utils/shiftValidator';

/**
 * 근무 시프트 요약 컴포넌트
 *
 * @description 전체 시프트의 총 근무 시간, 야간 근무 횟수, 휴일 근무 횟수를 표시합니다.
 *
 * @example
 * <ShiftSummary shifts={workShifts} />
 */
interface ShiftSummaryProps {
  shifts: WorkShiftRequest[];
}

const ShiftSummary: React.FC<ShiftSummaryProps> = ({ shifts }) => {
  // 총 근무 시간 계산
  const calculateTotalWorkingMinutes = (): number => {
    return shifts.reduce((total, shift) => {
      if (!shift.start_time || !shift.end_time) return total;

      const [startHour, startMin] = shift.start_time.split(':').map(Number);
      const [endHour, endMin] = shift.end_time.split(':').map(Number);

      let startMinutes = startHour * 60 + startMin;
      let endMinutes = endHour * 60 + endMin;

      // 다음날 넘어가는 경우
      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60;
      }

      const workingMinutes = endMinutes - startMinutes - shift.break_minutes;
      return total + (workingMinutes > 0 ? workingMinutes : 0);
    }, 0);
  };

  // 야간 근무 포함 시프트 수
  const countNightShifts = (): number => {
    return shifts.filter((shift) => {
      if (!shift.start_time || !shift.end_time) return false;

      const [startHour] = shift.start_time.split(':').map(Number);
      const [endHour] = shift.end_time.split(':').map(Number);

      return startHour >= 22 || endHour < 6 || (startHour < 6 && endHour < 6);
    }).length;
  };

  // 휴일 근무 시프트 수
  const countHolidayShifts = (): number => {
    return shifts.filter((shift) => shift.is_holiday_work).length;
  };

  if (shifts.length === 0) {
    return null;
  }

  const totalMinutes = calculateTotalWorkingMinutes();
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;
  const nightShifts = countNightShifts();
  const holidayShifts = countHolidayShifts();
  const warnings: ShiftWarning[] = validateShifts(shifts);

  // 주 52시간 초과 경고 (월 단위 환산: 52 * 4.345 = 226시간)
  const isOvertime = totalHours > 226;

  return (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-900 mb-3">근무 시간 요약</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 총 근무 시간 */}
        <div className="bg-white p-3 rounded-md shadow-sm">
          <div className="text-sm text-gray-600 mb-1">총 근무 시간</div>
          <div className={`text-2xl font-bold ${isOvertime ? 'text-red-600' : 'text-blue-600'}`}>
            {totalHours}시간 {totalMins}분
          </div>
          {isOvertime && (
            <div className="mt-2 text-xs text-red-600 font-medium">
              주 52시간 초과 가능성
            </div>
          )}
        </div>

        {/* 총 시프트 수 */}
        <div className="bg-white p-3 rounded-md shadow-sm">
          <div className="text-sm text-gray-600 mb-1">총 시프트 수</div>
          <div className="text-2xl font-bold text-gray-800">{shifts.length}일</div>
        </div>

        {/* 야간 근무 */}
        <div className="bg-white p-3 rounded-md shadow-sm">
          <div className="text-sm text-gray-600 mb-1">야간 근무</div>
          <div className="text-2xl font-bold text-purple-600">
            {nightShifts}회
          </div>
          {nightShifts > 0 && (
            <div className="mt-1 text-xs text-gray-500">
              22:00~06:00 포함
            </div>
          )}
        </div>

        {/* 휴일 근무 */}
        <div className="bg-white p-3 rounded-md shadow-sm">
          <div className="text-sm text-gray-600 mb-1">휴일 근무</div>
          <div className="text-2xl font-bold text-red-600">
            {holidayShifts}회
          </div>
          {holidayShifts > 0 && (
            <div className="mt-1 text-xs text-gray-500">
              가산수당 적용
            </div>
          )}
        </div>
      </div>

      {/* 검증 경고 */}
      {warnings.length > 0 && (
        <div className="mt-4 space-y-2">
          {warnings.map((w, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-md text-sm ${
                w.severity === 'critical'
                  ? 'bg-red-50 border border-red-200 text-red-700'
                  : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
              }`}
            >
              <span className="font-medium">{w.severity === 'critical' ? '⚠️ 위반 경고' : '💡 주의'}:</span> {w.message}
            </div>
          ))}
        </div>
      )}

      {/* 추가 정보 */}
      {(nightShifts > 0 || holidayShifts > 0) && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="text-sm text-gray-700">
            <strong className="text-blue-900">참고:</strong>
            {nightShifts > 0 && (
              <div className="mt-1">
                • 야간 근무(22:00~06:00)에 대해 통상시급의 50% 가산 수당이 적용됩니다.
              </div>
            )}
            {holidayShifts > 0 && (
              <div className="mt-1">
                • 휴일 근무에 대해 통상시급의 150% 수당이 적용됩니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftSummary;
