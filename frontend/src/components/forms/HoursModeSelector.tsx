/**
 * 통상시급 계산 기준 (174시간/209시간) 선택 컴포넌트
 */
import type { HoursMode } from '../../types/salary';
import Tooltip from '../common/Tooltip';

interface HoursModeSelectorProps {
  hoursMode: HoursMode;
  onHoursModeChange: (mode: HoursMode) => void;
  scheduledWorkDays: number;
  dailyWorkHours: number;
  baseSalary: number;
}

export default function HoursModeSelector({
  hoursMode,
  onHoursModeChange,
  scheduledWorkDays,
  dailyWorkHours,
  baseSalary,
}: HoursModeSelectorProps) {
  const calcMode = hoursMode === '209' ? 'included' : 'separated';
  const setCalcMode = (mode: 'included' | 'separated') =>
    onHoursModeChange(mode === 'included' ? '209' : '174');

  const wh = scheduledWorkDays * dailyWorkHours;
  const capped = Math.min(wh, 40);
  const monthlyHours =
    calcMode === 'included'
      ? Math.round((capped + (capped / 40) * 8) * 4.345)
      : Math.round(capped * 4.345);

  return (
    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-sm font-semibold text-gray-800">통상시급 계산 기준</p>
        <Tooltip
          content="174시간: 주휴 분리, 209시간: 주휴 포함. 총 급여액은 동일합니다."
          position="right"
          maxWidth={300}
        >
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs text-gray-500 bg-indigo-200 rounded-full cursor-help">
            ?
          </span>
        </Tooltip>
      </div>
      <div className="flex gap-4 mb-2">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            checked={calcMode === 'separated'}
            onChange={() => setCalcMode('separated')}
            className="mr-2"
          />
          <span className="text-sm">174시간 (주휴 분리)</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            checked={calcMode === 'included'}
            onChange={() => setCalcMode('included')}
            className="mr-2"
          />
          <span className="text-sm">209시간 (주휴 포함)</span>
        </label>
      </div>
      <p className="text-xs text-indigo-700">
        주 {wh}시간 → 월 소정근로시간: <strong>{monthlyHours}시간</strong>
        {baseSalary > 0 && (
          <span className="ml-2">
            (통상시급 ≈ {Math.round(baseSalary / monthlyHours).toLocaleString()}원)
          </span>
        )}
      </p>
      {calcMode === 'included' && (
        <p className="text-xs text-amber-600 mt-1">
          209시간: 기본급에 주휴수당이 포함된 것으로 간주하여 주휴수당을 별도 계산하지 않습니다.
        </p>
      )}
    </div>
  );
}
