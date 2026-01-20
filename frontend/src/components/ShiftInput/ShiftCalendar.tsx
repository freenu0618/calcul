/**
 * 근무 시프트 캘린더 컴포넌트
 * FullCalendar 기반 시각적 시프트 입력 UI
 */

import { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateClickArg } from '@fullcalendar/interaction';
import type { EventInput, EventClickArg } from '@fullcalendar/core';
import type { WorkShiftRequest } from '../../types/salary';

interface ShiftCalendarProps {
    shifts: WorkShiftRequest[];
    onShiftAdd: (shift: WorkShiftRequest) => void;
    onShiftRemove: (index: number) => void;
}

export default function ShiftCalendar({ shifts, onShiftAdd, onShiftRemove }: ShiftCalendarProps) {
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('18:00');
    const [breakMinutes, setBreakMinutes] = useState(60);
    const [isHolidayWork, setIsHolidayWork] = useState(false);

    // 시프트를 캘린더 이벤트로 변환
    const events: EventInput[] = useMemo(() => {
        return shifts.map((shift, index) => ({
            id: String(index),
            title: `${shift.start_time.slice(0, 5)}~${shift.end_time.slice(0, 5)}`,
            date: shift.date,
            backgroundColor: shift.is_holiday_work ? '#ef4444' : '#3b82f6',
            borderColor: shift.is_holiday_work ? '#dc2626' : '#2563eb',
            extendedProps: { index, shift },
        }));
    }, [shifts]);

    // 날짜 클릭 시 모달 열기
    const handleDateClick = (info: DateClickArg) => {
        setSelectedDate(info.dateStr);
        setIsHolidayWork(info.date.getDay() === 0 || info.date.getDay() === 6);
        setShowModal(true);
    };

    // 이벤트 클릭 시 삭제
    const handleEventClick = (info: EventClickArg) => {
        const index = info.event.extendedProps.index as number;
        if (confirm(`${info.event.startStr} 시프트를 삭제하시겠습니까?`)) {
            onShiftRemove(index);
        }
    };

    // 시프트 추가
    const handleAddShift = () => {
        onShiftAdd({
            date: selectedDate,
            start_time: startTime + ':00',
            end_time: endTime + ':00',
            break_minutes: breakMinutes,
            is_holiday_work: isHolidayWork,
        });
        setShowModal(false);
    };

    return (
        <div className="shift-calendar">
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale="ko"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: ''
                }}
                buttonText={{
                    today: '오늘'
                }}
                events={events}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                height="auto"
                dayMaxEvents={3}
                eventDisplay="block"
            />

            {/* 시프트 추가 모달 */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                        <h3 className="text-lg font-semibold mb-4">
                            📅 {selectedDate} 시프트 추가
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        시작 시간
                                    </label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    휴게시간 (분)
                                </label>
                                <input
                                    type="number"
                                    value={breakMinutes}
                                    onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 0)}
                                    min={0}
                                    max={120}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isHolidayWork}
                                    onChange={(e) => setIsHolidayWork(e.target.checked)}
                                    className="mr-2"
                                />
                                휴일근로
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleAddShift}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                추가
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .fc-day-today {
          background-color: #fef3c7 !important;
        }
        .fc-day-sat { color: #3b82f6; }
        .fc-day-sun { color: #ef4444; }
        .fc-event {
          cursor: pointer;
          font-size: 0.75rem;
          padding: 2px 4px;
        }
        .fc-daygrid-day {
          cursor: pointer;
        }
        .fc-daygrid-day:hover {
          background-color: #f3f4f6;
        }
      `}</style>
        </div>
    );
}
