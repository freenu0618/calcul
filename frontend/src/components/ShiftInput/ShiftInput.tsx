import { useState, useEffect, useCallback } from 'react';
import type { WorkShiftRequest } from '../../types/salary';
import ShiftRow from './ShiftRow';
import ShiftSummary from './ShiftSummary';
import ShiftCalendar from './ShiftCalendar';

/**
 * 시프트 프리셋 정의
 */
const SHIFT_PRESETS = {
  fulltime5: { name: '풀타임 (주5일)', start: '09:00', end: '18:00', break: 60, days: 5 },
  fulltime4: { name: '풀타임 (주4일)', start: '09:00', end: '18:00', break: 60, days: 4 },
  fulltime6: { name: '풀타임 (주6일)', start: '09:00', end: '18:00', break: 60, days: 6 },
  morning: { name: '오전조', start: '06:00', end: '15:00', break: 60, days: 5 },
  afternoon: { name: '오후조', start: '14:00', end: '23:00', break: 60, days: 5 },
  night: { name: '야간조', start: '22:00', end: '07:00', break: 60, days: 5 },
} as const;

interface ShiftInputProps {
  onChange: (shifts: WorkShiftRequest[]) => void;
  initialShifts?: WorkShiftRequest[];
  calculationMonth?: string;
  onCalculationMonthChange?: (month: string) => void;
}

const ShiftInput: React.FC<ShiftInputProps> = ({
  onChange, initialShifts = [], calculationMonth = '', onCalculationMonthChange,
}) => {
  const [shifts, setShifts] = useState<WorkShiftRequest[]>(initialShifts);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');

  // 기본 월: 현재 월
  const currentMonth = calculationMonth || new Date().toISOString().slice(0, 7);

  const handleMonthChange = useCallback((month: string) => {
    onCalculationMonthChange?.(month);
  }, [onCalculationMonthChange]);

  useEffect(() => {
    onChange(shifts);
  }, [shifts, onChange]);

  // 새 시프트 추가 (메모이제이션)
  const handleAddShift = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const newShift: WorkShiftRequest = {
      date: today,
      start_time: '09:00',
      end_time: '18:00',
      break_minutes: 60,
      is_holiday_work: false,
    };
    setShifts(prev => [...prev, newShift]);
  }, []);

  // 월간 템플릿 채우기: 선택한 월의 평일에 프리셋 시프트 생성
  const handleFillMonth = useCallback((presetKey: keyof typeof SHIFT_PRESETS) => {
    const preset = SHIFT_PRESETS[presetKey];
    const [year, month] = currentMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const newShifts: WorkShiftRequest[] = [];

    const formatLocalDate = (d: Date): string => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    // 주당 근무일수에 맞춰 평일만 채우기 (월~금 or 월~토)
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dow = date.getDay(); // 0=일, 6=토
      // preset.days: 4=월~목, 5=월~금, 6=월~토
      const isWorkday = dow >= 1 && dow <= Math.min(preset.days, 6);
      if (isWorkday) {
        newShifts.push({
          date: formatLocalDate(date),
          start_time: preset.start,
          end_time: preset.end,
          break_minutes: preset.break,
          is_holiday_work: false,
        });
      }
    }

    setShifts(newShifts);
    if (!calculationMonth) {
      onCalculationMonthChange?.(currentMonth);
    }
  }, [currentMonth, calculationMonth, onCalculationMonthChange]);

  const handleUpdateShift = useCallback((index: number, updatedShift: WorkShiftRequest) => {
    setShifts(prev => {
      const newShifts = [...prev];
      newShifts[index] = updatedShift;
      return newShifts;
    });
  }, []);

  const handleDeleteShift = useCallback((index: number) => {
    setShifts(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearAll = useCallback(() => {
    setShifts([]);
  }, []);

  return (
    <div className="space-y-4">
      {/* 월 선택 */}
      <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
        <label className="text-sm font-medium text-gray-700">계산 대상 월:</label>
        <input
          type="month"
          value={currentMonth}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 헤더 */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl font-bold text-gray-800">근무 시프트 입력</h2>
        <div className="flex gap-2">
          {/* 뷰 토글 */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              📋 리스트
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 text-sm ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              📅 캘린더
            </button>
          </div>
          {shifts.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              전체 삭제
            </button>
          )}
          {viewMode === 'list' && (
            <button
              type="button"
              onClick={handleAddShift}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + 시프트 추가
            </button>
          )}
        </div>
      </div>

      {/* 월간 템플릿 채우기 */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">월간 템플릿 채우기:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SHIFT_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleFillMonth(key as keyof typeof SHIFT_PRESETS)}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-100 hover:border-gray-400 transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          * 선택한 월의 모든 근무일에 해당 프리셋이 자동 적용됩니다.
        </p>
      </div>

      {/* 캘린더 뷰 */}
      {viewMode === 'calendar' && (
        <ShiftCalendar
          shifts={shifts}
          onShiftAdd={(shift) => setShifts((prev) => [...prev, shift])}
          onShiftRemove={handleDeleteShift}
          onShiftUpdate={handleUpdateShift}
          initialMonth={currentMonth}
        />
      )}

      {/* 리스트 뷰 */}
      {viewMode === 'list' && (
        <>
          {/* 데스크톱 테이블 헤더 */}
          {shifts.length > 0 && (
            <div className="hidden md:grid md:grid-cols-7 md:gap-3 px-4 py-2 bg-gray-100 rounded-lg font-semibold text-gray-700 text-sm">
              <div>근무일</div>
              <div>시작 (24시간)</div>
              <div>종료 (24시간)</div>
              <div>휴게(분)</div>
              <div className="text-center">휴일</div>
              <div>실 근무</div>
              <div>삭제</div>
            </div>
          )}

          {/* 시프트 리스트 */}
          {shifts.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-2">시프트가 없습니다.</p>
              <p className="text-sm text-gray-400">
                위의 프리셋을 선택하거나 "시프트 추가" 버튼을 클릭하세요.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {shifts.map((shift, index) => (
                <ShiftRow
                  key={`${shift.date}-${index}`}
                  shift={shift}
                  index={index}
                  onChange={handleUpdateShift}
                  onDelete={handleDeleteShift}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* 요약 */}
      <ShiftSummary shifts={shifts} />

      {/* 안내 */}
      {shifts.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <strong>💡 안내:</strong> 시간은 24시간제로 입력 (예: 오후 2시 = 14:00).
          야간근로(22:00~06:00)는 자동 감지됩니다.
        </div>
      )}
    </div>
  );
};

export default ShiftInput;

