/**
 * 월간 템플릿 입력 컴포넌트
 * - 요일별 체크박스 선택
 * - 근무 시작/종료 시간 라디오 버튼 선택
 * - 적용 버튼으로 FullCalendar에 일괄 반영
 */

import { useState, useEffect } from 'react';
import type { WorkShiftRequest } from '../../types/salary';

interface MonthlyTemplateProps {
  year: number;
  month: number;
  onApply: (shifts: WorkShiftRequest[]) => void;
  onYearMonthChange?: (year: number, month: number) => void;
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const BREAK_OPTIONS = [0, 30, 60, 90, 120];

// 24시간 프리셋
const TIME_PRESETS = [
  { label: '주간', start: '09:00', end: '18:00', icon: '☀️' },
  { label: '오전', start: '06:00', end: '14:00', icon: '🌅' },
  { label: '오후', start: '14:00', end: '22:00', icon: '🌆' },
  { label: '야간', start: '22:00', end: '07:00', icon: '🌙', nextDay: true },
  { label: '심야', start: '00:00', end: '08:00', icon: '🌃' },
];

// 24시간 옵션 생성
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

export default function MonthlyTemplate({ year, month, onApply, onYearMonthChange }: MonthlyTemplateProps) {
  // 내부 년/월 상태 (직접 선택 가능)
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedMonth, setSelectedMonth] = useState(month);

  // 요일 선택 상태 [일, 월, 화, 수, 목, 금, 토]
  const [selectedDays, setSelectedDays] = useState<boolean[]>([false, true, true, true, true, true, false]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [breakMinutes, setBreakMinutes] = useState(60);
  const [isNextDayEnd, setIsNextDayEnd] = useState(false); // 익일 퇴근 여부

  // 급여 기간 선택
  const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
  const [periodStart, setPeriodStart] = useState(1);
  const [periodEnd, setPeriodEnd] = useState(lastDay);

  // props 변경 시 내부 상태 동기화
  useEffect(() => {
    setSelectedYear(year);
    setSelectedMonth(month);
  }, [year, month]);

  // 월 변경 시 기간 초기화
  useEffect(() => {
    const newLastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    setPeriodStart(1);
    setPeriodEnd(newLastDay);
  }, [selectedYear, selectedMonth]);

  // 년/월 변경 핸들러
  const handleYearMonthChange = (newYear: number, newMonth: number) => {
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
    onYearMonthChange?.(newYear, newMonth);
  };

  // 프리셋 적용
  const applyPreset = (preset: typeof TIME_PRESETS[0]) => {
    setStartTime(preset.start);
    setEndTime(preset.end);
    setIsNextDayEnd(preset.nextDay || false);
  };

  const handleDayToggle = (index: number) => {
    setSelectedDays(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedDays([true, true, true, true, true, true, true]);
  };

  const handleSelectWeekdays = () => {
    setSelectedDays([false, true, true, true, true, true, false]);
  };

  const handleClearAll = () => {
    setSelectedDays([false, false, false, false, false, false, false]);
  };

  const generateShifts = (): WorkShiftRequest[] => {
    const shifts: WorkShiftRequest[] = [];

    for (let day = periodStart; day <= periodEnd; day++) {
      const date = new Date(selectedYear, selectedMonth - 1, day);
      const dayOfWeek = date.getDay(); // 0=일, 1=월, ..., 6=토

      if (selectedDays[dayOfWeek]) {
        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        shifts.push({
          date: dateStr,
          start_time: startTime,
          end_time: endTime,
          break_minutes: breakMinutes,
          is_holiday_work: dayOfWeek === 0 || dayOfWeek === 6, // 주말은 휴일근로
        });
      }
    }

    return shifts;
  };

  const handleApply = () => {
    const shifts = generateShifts();
    if (shifts.length === 0) {
      alert('선택된 요일이 없습니다.');
      return;
    }
    onApply(shifts);
  };

  const selectedCount = selectedDays.filter(Boolean).length;
  const previewShifts = generateShifts();

  // 년도 옵션 (현재 년도 기준 -1 ~ +1)
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">calendar_month</span>
          월간 템플릿 채우기
        </h4>
        {/* 년/월 선택 */}
        <div className="flex items-center gap-1">
          <select
            value={selectedYear}
            onChange={(e) => handleYearMonthChange(Number(e.target.value), selectedMonth)}
            className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => handleYearMonthChange(selectedYear, Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>
        </div>
      </div>

      {/* 기간 선택 (항상 표시) */}
      <div className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
        <label className="text-sm font-medium text-gray-700">적용 기간:</label>
        <select
          value={periodStart}
          onChange={(e) => setPeriodStart(Number(e.target.value))}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          {Array.from({ length: lastDay }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>{d}일</option>
          ))}
        </select>
        <span className="text-gray-400">~</span>
        <select
          value={periodEnd}
          onChange={(e) => setPeriodEnd(Number(e.target.value))}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          {Array.from({ length: lastDay }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>{d}일</option>
          ))}
        </select>
        <span className="text-xs text-gray-500 ml-auto">
          {selectedYear}년 {selectedMonth}월 ({lastDay}일)
        </span>
      </div>

      {/* 요일 선택 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">근무 요일 선택</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSelectWeekdays}
              className="text-xs text-blue-600 hover:underline"
            >
              평일만
            </button>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-blue-600 hover:underline"
            >
              전체
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-gray-600 hover:underline"
            >
              초기화
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          {DAY_LABELS.map((label, index) => (
            <label
              key={label}
              className={`flex-1 flex flex-col items-center p-2 rounded-lg cursor-pointer border-2 transition-all ${
                selectedDays[index]
                  ? index === 0
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : index === 6
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedDays[index]}
                onChange={() => handleDayToggle(index)}
                className="sr-only"
              />
              <span className="text-sm font-medium">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 근무 시간대 프리셋 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">근무 시간대</label>
        <div className="flex gap-2 flex-wrap">
          {TIME_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                startTime === preset.start && endTime === preset.end && isNextDayEnd === (preset.nextDay || false)
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300'
              }`}
            >
              {preset.icon} {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 24시간 시간 선택 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">출근 시간</label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {HOUR_OPTIONS.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">퇴근 시간</label>
          <div className="flex gap-2">
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {HOUR_OPTIONS.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
            <label className="flex items-center gap-1 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={isNextDayEnd}
                onChange={(e) => setIsNextDayEnd(e.target.checked)}
                className="rounded"
              />
              <span className="text-amber-700">익일</span>
            </label>
          </div>
        </div>
      </div>

      {/* 휴게시간 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">휴게시간</label>
        <div className="flex gap-2">
          {BREAK_OPTIONS.map((minutes) => (
            <label
              key={minutes}
              className={`flex-1 flex items-center justify-center p-2 rounded cursor-pointer text-sm font-medium transition-all ${
                breakMinutes === minutes
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300'
              }`}
            >
              <input
                type="radio"
                name="breakMinutes"
                value={minutes}
                checked={breakMinutes === minutes}
                onChange={() => setBreakMinutes(minutes)}
                className="sr-only"
              />
              {minutes === 0 ? '없음' : `${minutes}분`}
            </label>
          ))}
        </div>
      </div>

      {/* 미리보기 */}
      <div className="bg-white rounded border border-gray-200 p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">적용 예정:</span>
          <span className="font-medium text-gray-900">
            {previewShifts.length}일 ({startTime} ~ {endTime}{isNextDayEnd ? ' (익일)' : ''}, 휴게 {breakMinutes}분)
          </span>
        </div>
        {previewShifts.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            실 근무시간:{' '}
            {(() => {
              const [sh, sm] = startTime.split(':').map(Number);
              const [eh, em] = endTime.split(':').map(Number);
              let totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
              if (isNextDayEnd || totalMinutes < 0) totalMinutes += 24 * 60; // 익일 퇴근
              totalMinutes -= breakMinutes;
              const hours = Math.floor(totalMinutes / 60);
              const mins = totalMinutes % 60;
              return `${hours}시간 ${mins > 0 ? `${mins}분` : ''}`;
            })()}
            /일
            {isNextDayEnd && <span className="text-amber-600 ml-1">(야간근로 포함)</span>}
          </div>
        )}
      </div>

      {/* 적용 버튼 */}
      <button
        type="button"
        onClick={handleApply}
        disabled={selectedCount === 0}
        className="w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary-500 text-white hover:bg-primary-600"
      >
        <span className="material-symbols-outlined text-lg">check_circle</span>
        캘린더에 적용 ({previewShifts.length}일)
      </button>

      <p className="text-xs text-gray-500 text-center">
        ⚠️ 기존 등록된 시프트가 있는 날짜는 건너뜁니다
      </p>
    </div>
  );
}
