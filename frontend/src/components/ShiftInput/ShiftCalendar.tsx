/**
 * 근무 시프트 캘린더 컴포넌트
 * FullCalendar 기반 시각적 시프트 입력 UI
 * - 드래그로 날짜 선택하여 시프트 추가
 * - 이벤트 클릭으로 시프트 삭제
 * - 월간 템플릿으로 일괄 입력
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateClickArg } from '@fullcalendar/interaction';
import type { EventClickArg, EventContentArg, DatesSetArg } from '@fullcalendar/core';
import type { WorkShiftRequest } from '../../types/salary';
import ShiftModal from './ShiftModal';
import MonthlyTemplate from './MonthlyTemplate';

interface ShiftCalendarProps {
  shifts: WorkShiftRequest[];
  onShiftAdd: (shift: WorkShiftRequest) => void;
  onShiftRemove: (index: number) => void;
  onShiftUpdate?: (index: number, shift: WorkShiftRequest) => void;
  onBulkAdd?: (shifts: WorkShiftRequest[]) => void;
  initialMonth?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: { index: number; shift: WorkShiftRequest };
}

export default function ShiftCalendar({
  shifts,
  onShiftAdd,
  onShiftRemove,
  onShiftUpdate,
  onBulkAdd,
  initialMonth,
}: ShiftCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingShift, setEditingShift] = useState<{ index: number; shift: WorkShiftRequest } | null>(null);
  const [showTemplate, setShowTemplate] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (initialMonth) return new Date(`${initialMonth}-01`);
    return new Date();
  });

  // 현재 표시 연월
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // 월간 템플릿에서 월 변경 시 캘린더 동기화
  const handleYearMonthChange = useCallback((year: number, month: number) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.gotoDate(new Date(year, month - 1, 1));
    }
  }, []);

  // 이미 등록된 날짜 Set
  const existingDates = useMemo(() => new Set(shifts.map((s) => s.date)), [shifts]);

  // 시프트를 캘린더 이벤트로 변환
  const events: CalendarEvent[] = shifts.map((shift, index) => {
    const isNightShift = shift.start_time >= '22:00' || shift.end_time <= '06:00';
    const isHoliday = shift.is_holiday_work;
    return {
      id: `shift-${index}`,
      title: `${shift.start_time}~${shift.end_time}`,
      start: shift.date,
      backgroundColor: isHoliday ? '#EF4444' : isNightShift ? '#6366F1' : '#3B82F6',
      borderColor: isHoliday ? '#DC2626' : isNightShift ? '#4F46E5' : '#2563EB',
      extendedProps: { index, shift },
    };
  });

  const handleDateClick = useCallback((arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
    setEditingShift(null);
    setModalOpen(true);
  }, []);

  const handleEventClick = useCallback((arg: EventClickArg) => {
    const { index, shift } = arg.event.extendedProps as { index: number; shift: WorkShiftRequest };
    setSelectedDate(shift.date);
    setEditingShift({ index, shift });
    setModalOpen(true);
  }, []);

  const handleSaveShift = useCallback(
    (shift: WorkShiftRequest) => {
      if (editingShift && onShiftUpdate) {
        onShiftUpdate(editingShift.index, shift);
      } else {
        onShiftAdd(shift);
      }
      setModalOpen(false);
      setEditingShift(null);
    },
    [editingShift, onShiftAdd, onShiftUpdate]
  );

  const handleDeleteShift = useCallback(() => {
    if (editingShift) {
      onShiftRemove(editingShift.index);
      setModalOpen(false);
      setEditingShift(null);
    }
  }, [editingShift, onShiftRemove]);

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    // arg.view.currentStart를 사용하여 정확한 월의 1일을 가져옴
    // arg.start는 캘린더 그리드 첫 날짜 (이전 달 일요일 포함 가능)
    setCurrentDate(arg.view.currentStart);
  }, []);

  // 월간 템플릿 적용
  const handleTemplateApply = useCallback(
    (templateShifts: WorkShiftRequest[]) => {
      // 이미 등록된 날짜 제외
      const newShifts = templateShifts.filter((s) => !existingDates.has(s.date));
      if (newShifts.length === 0) {
        alert('모든 날짜에 이미 시프트가 등록되어 있습니다.');
        return;
      }
      if (onBulkAdd) {
        onBulkAdd(newShifts);
      } else {
        newShifts.forEach((shift) => onShiftAdd(shift));
      }
      setShowTemplate(false);
      alert(`${newShifts.length}개의 시프트가 추가되었습니다.`);
    },
    [existingDates, onBulkAdd, onShiftAdd]
  );

  const renderEventContent = (eventInfo: EventContentArg) => {
    const { shift } = eventInfo.event.extendedProps as { shift: WorkShiftRequest };
    return (
      <div className="px-1 py-0.5 text-xs truncate">
        <span className="font-medium">{eventInfo.event.title}</span>
        {shift.is_holiday_work && <span className="ml-1">🔴</span>}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 월간 템플릿 토글 버튼 */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowTemplate(!showTemplate)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showTemplate
              ? 'bg-primary-500 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {showTemplate ? 'close' : 'auto_fix_high'}
          </span>
          {showTemplate ? '닫기' : '월간 템플릿'}
        </button>
      </div>

      {/* 월간 템플릿 */}
      {showTemplate && (
        <MonthlyTemplate
          year={currentYear}
          month={currentMonth}
          onApply={handleTemplateApply}
          onYearMonthChange={handleYearMonthChange}
        />
      )}

      {/* 캘린더 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {/* 범례 */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>일반 근무</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-indigo-500" />
            <span>야간 근무</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>휴일 근무</span>
          </div>
        </div>

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          initialDate={initialMonth ? `${initialMonth}-01` : undefined}
          locale="ko"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
          buttonText={{ today: '오늘' }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          datesSet={handleDatesSet}
          height="auto"
          dayMaxEvents={3}
          moreLinkText={(num: number) => `+${num}개 더보기`}
          fixedWeekCount={false}
        />

        <p className="mt-4 text-sm text-gray-500 text-center">
          날짜를 클릭하여 시프트 추가 | 시프트를 클릭하여 수정/삭제
        </p>
      </div>

      {/* 모달 */}
      {modalOpen && (
        <ShiftModal
          date={selectedDate}
          shift={editingShift?.shift}
          isEditing={!!editingShift}
          onSave={handleSaveShift}
          onDelete={handleDeleteShift}
          onClose={() => {
            setModalOpen(false);
            setEditingShift(null);
          }}
        />
      )}
    </div>
  );
}
