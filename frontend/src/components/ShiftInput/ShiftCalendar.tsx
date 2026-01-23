/**
 * 근무 시프트 캘린더 컴포넌트
 * FullCalendar 기반 시각적 시프트 입력 UI
 * - 드래그로 날짜 선택하여 시프트 추가
 * - 이벤트 클릭으로 시프트 삭제
 */

import { useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateClickArg } from '@fullcalendar/interaction';
import type { EventClickArg, EventContentArg } from '@fullcalendar/core';
import type { WorkShiftRequest } from '../../types/salary';
import ShiftModal from './ShiftModal';

interface ShiftCalendarProps {
  shifts: WorkShiftRequest[];
  onShiftAdd: (shift: WorkShiftRequest) => void;
  onShiftRemove: (index: number) => void;
  onShiftUpdate?: (index: number, shift: WorkShiftRequest) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    index: number;
    shift: WorkShiftRequest;
  };
}

export default function ShiftCalendar({
  shifts,
  onShiftAdd,
  onShiftRemove,
  onShiftUpdate,
}: ShiftCalendarProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingShift, setEditingShift] = useState<{
    index: number;
    shift: WorkShiftRequest;
  } | null>(null);

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

  // 날짜 클릭 핸들러
  const handleDateClick = useCallback((arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
    setEditingShift(null);
    setModalOpen(true);
  }, []);

  // 이벤트 클릭 핸들러 (수정/삭제)
  const handleEventClick = useCallback((arg: EventClickArg) => {
    const { index, shift } = arg.event.extendedProps as {
      index: number;
      shift: WorkShiftRequest;
    };
    setSelectedDate(shift.date);
    setEditingShift({ index, shift });
    setModalOpen(true);
  }, []);

  // 시프트 저장 핸들러
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

  // 시프트 삭제 핸들러
  const handleDeleteShift = useCallback(() => {
    if (editingShift) {
      onShiftRemove(editingShift.index);
      setModalOpen(false);
      setEditingShift(null);
    }
  }, [editingShift, onShiftRemove]);

  // 이벤트 렌더링 커스터마이징
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

      {/* 캘린더 */}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="ko"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '',
        }}
        buttonText={{
          today: '오늘',
        }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        height="auto"
        dayMaxEvents={3}
        moreLinkText={(num: number) => `+${num}개 더보기`}
        fixedWeekCount={false}
      />

      {/* 안내 */}
      <p className="mt-4 text-sm text-gray-500 text-center">
        날짜를 클릭하여 시프트 추가 | 시프트를 클릭하여 수정/삭제
      </p>

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
