/**
 * 월간 템플릿 입력 컴포넌트
 * - 요일별 체크박스 선택
 * - 근무 시작/종료 시간 라디오 버튼 선택
 * - 적용 버튼으로 FullCalendar에 일괄 반영
 */

import { useState } from 'react';
import type { WorkShiftRequest } from '../../types/salary';

interface MonthlyTemplateProps {
  year: number;
  month: number;
  onApply: (shifts: WorkShiftRequest[]) => void;
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const START_TIME_OPTIONS = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00'];
const END_TIME_OPTIONS = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
const BREAK_OPTIONS = [0, 30, 60, 90, 120];

export default function MonthlyTemplate({ year, month, onApply }: MonthlyTemplateProps) {
  // 요일 선택 상태 [일, 월, 화, 수, 목, 금, 토]
  const [selectedDays, setSelectedDays] = useState<boolean[]>([false, true, true, true, true, true, false]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [breakMinutes, setBreakMinutes] = useState(60);

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
    const lastDay = new Date(year, month, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay(); // 0=일, 1=월, ..., 6=토

      if (selectedDays[dayOfWeek]) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">calendar_month</span>
          월간 템플릿 채우기
        </h4>
        <span className="text-xs text-gray-500">
          {year}년 {month}월
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

      {/* 시간 선택 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 시작 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">출근 시간</label>
          <div className="grid grid-cols-4 gap-1">
            {START_TIME_OPTIONS.map((time) => (
              <label
                key={time}
                className={`flex items-center justify-center p-2 rounded cursor-pointer text-xs font-medium transition-all ${
                  startTime === time
                    ? 'bg-primary-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300'
                }`}
              >
                <input
                  type="radio"
                  name="startTime"
                  value={time}
                  checked={startTime === time}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="sr-only"
                />
                {time}
              </label>
            ))}
          </div>
        </div>

        {/* 종료 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">퇴근 시간</label>
          <div className="grid grid-cols-4 gap-1">
            {END_TIME_OPTIONS.map((time) => (
              <label
                key={time}
                className={`flex items-center justify-center p-2 rounded cursor-pointer text-xs font-medium transition-all ${
                  endTime === time
                    ? 'bg-primary-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300'
                }`}
              >
                <input
                  type="radio"
                  name="endTime"
                  value={time}
                  checked={endTime === time}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="sr-only"
                />
                {time}
              </label>
            ))}
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
            {previewShifts.length}일 ({startTime} ~ {endTime}, 휴게 {breakMinutes}분)
          </span>
        </div>
        {previewShifts.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            실 근무시간:{' '}
            {(() => {
              const [sh, sm] = startTime.split(':').map(Number);
              const [eh, em] = endTime.split(':').map(Number);
              const totalMinutes = (eh * 60 + em) - (sh * 60 + sm) - breakMinutes;
              const hours = Math.floor(totalMinutes / 60);
              const mins = totalMinutes % 60;
              return `${hours}시간 ${mins > 0 ? `${mins}분` : ''}`;
            })()}
            /일
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
