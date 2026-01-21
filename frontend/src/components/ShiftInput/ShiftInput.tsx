import { useState, useEffect, useCallback, useMemo } from 'react';
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
}

const ShiftInput: React.FC<ShiftInputProps> = ({ onChange, initialShifts = [] }) => {
  const [shifts, setShifts] = useState<WorkShiftRequest[]>(initialShifts);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

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

  // 프리셋으로 시프트 생성 (메모이제이션)
  const handleApplyPreset = useCallback((presetKey: keyof typeof SHIFT_PRESETS) => {
    const preset = SHIFT_PRESETS[presetKey];
    const today = new Date();
    const newShifts: WorkShiftRequest[] = [];

    // 이번 주 월요일 찾기
    const dayOfWeek = today.getDay();
    // 일요일(0)이면 -6, 그 외는 1-dayOfWeek
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysToMonday);

    // 로컬 날짜를 YYYY-MM-DD 포맷으로 변환 (시간대 문제 방지)
    const formatLocalDate = (d: Date): string => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    for (let i = 0; i < preset.days; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      newShifts.push({
        date: formatLocalDate(date),
        start_time: preset.start,
        end_time: preset.end,
        break_minutes: preset.break,
        is_holiday_work: false,
      });
    }

    setShifts(newShifts);
  }, []);

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

      {/* 프리셋 버튼 (리스트 모드에서만) */}
      {viewMode === 'list' && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">빠른 입력 (프리셋):</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SHIFT_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleApplyPreset(key as keyof typeof SHIFT_PRESETS)}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-100 hover:border-gray-400 transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * 프리셋 클릭 시 이번 주 월요일부터 근무일이 자동 생성됩니다.
          </p>
        </div>
      )}

      {/* 캘린더 뷰 */}
      {viewMode === 'calendar' && (
        <ShiftCalendar
          shifts={shifts}
          onShiftAdd={(shift) => setShifts([...shifts, shift])}
          onShiftRemove={(index) => setShifts(shifts.filter((_, i) => i !== index))}
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

