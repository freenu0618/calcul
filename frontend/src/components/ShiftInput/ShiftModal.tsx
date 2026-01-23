/**
 * 시프트 입력/수정 모달
 * 캘린더에서 날짜 클릭 시 표시되는 시프트 입력 폼
 */

import { useState, useEffect } from 'react';
import type { WorkShiftRequest } from '../../types/salary';

interface ShiftModalProps {
  date: string;
  shift?: WorkShiftRequest;
  isEditing: boolean;
  onSave: (shift: WorkShiftRequest) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function ShiftModal({
  date,
  shift,
  isEditing,
  onSave,
  onDelete,
  onClose,
}: ShiftModalProps) {
  const [startTime, setStartTime] = useState(shift?.start_time || '09:00');
  const [endTime, setEndTime] = useState(shift?.end_time || '18:00');
  const [breakMinutes, setBreakMinutes] = useState(shift?.break_minutes || 60);
  const [isHolidayWork, setIsHolidayWork] = useState(shift?.is_holiday_work || false);

  useEffect(() => {
    if (shift) {
      setStartTime(shift.start_time);
      setEndTime(shift.end_time);
      setBreakMinutes(shift.break_minutes);
      setIsHolidayWork(shift.is_holiday_work);
    }
  }, [shift]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      date,
      start_time: startTime,
      end_time: endTime,
      break_minutes: breakMinutes,
      is_holiday_work: isHolidayWork,
    });
  };

  // 실 근무시간 계산
  const calculateWorkHours = () => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // 야간 근무
    const workMinutes = totalMinutes - breakMinutes;
    const hours = Math.floor(workMinutes / 60);
    const minutes = workMinutes % 60;
    return `${hours}시간 ${minutes > 0 ? `${minutes}분` : ''}`.trim();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">
            {isEditing ? '시프트 수정' : '시프트 추가'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 날짜 표시 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              근무일
            </label>
            <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-800">
              {date}
            </div>
          </div>

          {/* 시작/종료 시간 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작 시간
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료 시간
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* 휴게시간 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              휴게시간 (분)
            </label>
            <input
              type="number"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value))}
              min={0}
              max={180}
              step={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 휴일 근무 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isHolidayWork"
              checked={isHolidayWork}
              onChange={(e) => setIsHolidayWork(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isHolidayWork" className="text-sm text-gray-700">
              휴일 근무 (1.5배 가산)
            </label>
          </div>

          {/* 실 근무시간 표시 */}
          <div className="p-3 bg-blue-50 rounded-md">
            <span className="text-sm text-blue-700">
              실 근무시간: <strong>{calculateWorkHours()}</strong>
            </span>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2 pt-2">
            {isEditing && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                삭제
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {isEditing ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
