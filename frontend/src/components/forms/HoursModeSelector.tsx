/**
 * 통상시급 계산 기준 (174시간/209시간) 카드형 선택 컴포넌트
 */
import type { HoursMode } from '../../types/salary';

interface HoursModeSelectorProps {
  hoursMode: HoursMode;
  onHoursModeChange: (mode: HoursMode) => void;
  scheduledWorkDays: number;
  dailyWorkHours: number;
  baseSalary: number;
}

const CARDS = [
  {
    mode: '174' as HoursMode,
    title: '174시간 (주휴 분리)',
    badge: '추천',
    summary: '주휴수당을 별도 계산',
    when: '대부분의 근로계약에 적합',
    formula: '통상시급 = 기본급 ÷ 174시간',
  },
  {
    mode: '209' as HoursMode,
    title: '209시간 (주휴 포함)',
    badge: null,
    summary: '기본급에 주휴수당 포함',
    when: '최저임금 월 환산 기준 사용 시',
    formula: '통상시급 = 기본급 ÷ 209시간',
  },
];

export default function HoursModeSelector({
  hoursMode, onHoursModeChange, scheduledWorkDays, dailyWorkHours, baseSalary,
}: HoursModeSelectorProps) {
  const wh = scheduledWorkDays * dailyWorkHours;
  const capped = Math.min(wh, 40);
  const monthlyHours = hoursMode === '209'
    ? Math.round((capped + (capped / 40) * 8) * 4.345)
    : Math.round(capped * 4.345);

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-800">통상시급 계산 기준</p>
      <div className="grid grid-cols-2 gap-3">
        {CARDS.map((card) => {
          const isSelected = hoursMode === card.mode;
          return (
            <button
              key={card.mode}
              type="button"
              onClick={() => onHoursModeChange(card.mode)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-bold ${isSelected ? 'text-indigo-700' : 'text-gray-800'}`}>
                  {card.title}
                </span>
                {card.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded">
                    {card.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mb-1">{card.summary}</p>
              <p className="text-[11px] text-gray-400">{card.when}</p>
              <p className="text-[11px] text-indigo-600 mt-2 font-mono">{card.formula}</p>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-indigo-700">
        주 {wh}시간 → 월 소정근로시간: <strong>{monthlyHours}시간</strong>
        {baseSalary > 0 && (
          <span className="ml-2">(통상시급 ≈ {Math.round(baseSalary / monthlyHours).toLocaleString()}원)</span>
        )}
      </p>

      {hoursMode === '174' && (
        <p className="text-xs text-gray-500">
          잘 모르겠다면 174시간을 선택하세요. 대부분의 사업장에 적합합니다.
        </p>
      )}
      {hoursMode === '209' && (
        <p className="text-xs text-amber-600">
          209시간: 기본급에 주휴수당이 포함된 것으로 간주하여 주휴수당을 별도 계산하지 않습니다.
        </p>
      )}
    </div>
  );
}
