import { useState, useEffect, useCallback, useRef } from 'react';
import type { WorkShiftRequest } from '../../types/salary';
import ShiftRow from './ShiftRow';
import ShiftSummary from './ShiftSummary';
import ShiftCalendar from './ShiftCalendar';
import TimeStepper from '../common/TimeStepper';
import { downloadShiftTemplate, parseShiftCsv, exportShiftsToCsv, readFileAsText } from '../../utils/excelHandler';

/**
 * 시프트 프리셋 정의
 */
const SHIFT_PRESETS = {
  fulltime5: { name: '주5일', start: '09:00', end: '18:00', break: 60, days: 5 },
  fulltime4: { name: '주4일', start: '09:00', end: '18:00', break: 60, days: 4 },
  fulltime6: { name: '주6일', start: '09:00', end: '18:00', break: 60, days: 6 },
  morning: { name: '오전조', start: '06:00', end: '15:00', break: 60, days: 5 },
  afternoon: { name: '오후조', start: '14:00', end: '23:00', break: 60, days: 5 },
  night: { name: '야간조', start: '22:00', end: '07:00', break: 60, days: 5 },
} as const;

interface ShiftInputProps {
  onChange: (shifts: WorkShiftRequest[]) => void;
  initialShifts?: WorkShiftRequest[];
  calculationMonth?: string;
  onCalculationMonthChange?: (month: string) => void;
  payPeriodStart?: string;  // "YYYY-MM-DD"
  payPeriodEnd?: string;    // "YYYY-MM-DD"
}

const ShiftInput: React.FC<ShiftInputProps> = ({
  onChange, initialShifts = [], calculationMonth = '', onCalculationMonthChange,
  payPeriodStart, payPeriodEnd,
}) => {
  const [shifts, setShifts] = useState<WorkShiftRequest[]>(initialShifts);
  // 모바일에서는 리스트 뷰 기본값 (터치 친화적)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>(isMobile ? 'list' : 'calendar');
  const [periodStart, setPeriodStart] = useState(1);
  const [periodEnd, setPeriodEnd] = useState(31);
  const [csvError, setCsvError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customStart, setCustomStart] = useState('09:00');
  const [customEnd, setCustomEnd] = useState('18:00');
  const [customDays, setCustomDays] = useState(5);
  const [useCustomTime, setUseCustomTime] = useState(false);

  // 기본 월: 현재 월
  const currentMonth = calculationMonth || new Date().toISOString().slice(0, 7);
  const [year, month] = currentMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  // 월 변경 시 기간 초기화
  useEffect(() => {
    setPeriodEnd(daysInMonth);
  }, [daysInMonth]);

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

  // 월간 템플릿 채우기: 정산기간 또는 선택한 기간의 평일에 프리셋 시프트 생성
  const handleFillMonth = useCallback((presetKey: keyof typeof SHIFT_PRESETS | 'custom') => {
    const preset = presetKey === 'custom'
      ? { start: customStart, end: customEnd, break: 60, days: customDays }
      : SHIFT_PRESETS[presetKey];
    const newShifts: WorkShiftRequest[] = [];

    const formatLocalDate = (d: Date): string => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    // 정산기간이 설정되어 있으면 그 범위 사용, 아니면 기존 방식
    if (payPeriodStart && payPeriodEnd) {
      const cur = new Date(payPeriodStart);
      const end = new Date(payPeriodEnd);
      while (cur <= end) {
        const dow = cur.getDay();
        if (dow >= 1 && dow <= Math.min(preset.days, 6)) {
          newShifts.push({
            date: formatLocalDate(cur),
            start_time: preset.start,
            end_time: preset.end,
            break_minutes: preset.break,
            is_holiday_work: false,
          });
        }
        cur.setDate(cur.getDate() + 1);
      }
    } else {
      for (let day = periodStart; day <= Math.min(periodEnd, daysInMonth); day++) {
        const date = new Date(year, month - 1, day);
        const dow = date.getDay();
        if (dow >= 1 && dow <= Math.min(preset.days, 6)) {
          newShifts.push({
            date: formatLocalDate(date),
            start_time: preset.start,
            end_time: preset.end,
            break_minutes: preset.break,
            is_holiday_work: false,
          });
        }
      }
    }

    setShifts(newShifts);
    if (!calculationMonth) {
      onCalculationMonthChange?.(currentMonth);
    }
  }, [currentMonth, calculationMonth, onCalculationMonthChange, periodStart, periodEnd, year, month, daysInMonth, customStart, customEnd, customDays, payPeriodStart, payPeriodEnd]);

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

  // CSV 파일 가져오기
  const handleCsvImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError('');
    try {
      const text = await readFileAsText(file);
      const imported = parseShiftCsv(text);
      setShifts(imported);
    } catch (err) {
      setCsvError(err instanceof Error ? err.message : 'CSV 파싱 실패');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // CSV 내보내기
  const handleCsvExport = useCallback(() => {
    if (shifts.length === 0) return;
    exportShiftsToCsv(shifts, `시프트_${currentMonth}.csv`);
  }, [shifts, currentMonth]);

  return (
    <div className="space-y-4">
      {/* 월 선택 — 정산기간 미사용 시만 표시 */}
      {!payPeriodStart && (
        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
          <label className="text-sm font-medium text-gray-700">계산 대상 월:</label>
          <input
            type="month"
            value={currentMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

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
      <div className="bg-gray-50 p-3 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">월간 템플릿 채우기</p>
          {/* 정산기간 미사용 시에만 일자 범위 선택 표시 */}
          {!payPeriodStart && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">기간:</span>
              <select
                value={periodStart}
                onChange={(e) => setPeriodStart(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}일</option>
                ))}
              </select>
              <span className="text-gray-400">~</span>
              <select
                value={periodEnd}
                onChange={(e) => setPeriodEnd(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}일</option>
                ))}
              </select>
            </div>
          )}
          {payPeriodStart && payPeriodEnd && (
            <span className="text-xs text-gray-500">
              정산 기간: {payPeriodStart} ~ {payPeriodEnd}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SHIFT_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleFillMonth(key as keyof typeof SHIFT_PRESETS)}
              title={`${preset.start}~${preset.end} | 휴게 ${preset.break}분 | 주${preset.days}일`}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-100 hover:border-gray-400 transition-colors"
            >
              {preset.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setUseCustomTime(!useCustomTime)}
            className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
              useCustomTime ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 hover:bg-gray-100'
            }`}
          >
            {useCustomTime ? '직접설정 ▲' : '직접설정 ▼'}
          </button>
        </div>

        {/* 커스텀 시간 설정 */}
        {useCustomTime && (
          <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3">
            <div className="flex flex-wrap items-end gap-4">
              <TimeStepper value={customStart} onChange={setCustomStart} label="출근" />
              <TimeStepper value={customEnd} onChange={setCustomEnd} label="퇴근" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">근무일</label>
                <select
                  value={customDays}
                  onChange={(e) => setCustomDays(Number(e.target.value))}
                  className="px-2 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {[3, 4, 5, 6].map((d) => (
                    <option key={d} value={d}>주{d}일</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => handleFillMonth('custom')}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                적용
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500">
          {payPeriodStart
            ? `* 정산 기간(${payPeriodStart} ~ ${payPeriodEnd}) 내 근무일에 프리셋이 적용됩니다.`
            : `* ${periodStart}일 ~ ${periodEnd}일 기간 내 근무일에 프리셋이 적용됩니다.`}
        </p>
      </div>

      {/* CSV 가져오기/내보내기 */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCsvImport}
            className="hidden"
            id="csv-import"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-100"
          >
            CSV 가져오기
          </button>
          <button
            type="button"
            onClick={handleCsvExport}
            disabled={shifts.length === 0}
            className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            CSV 내보내기
          </button>
          <button
            type="button"
            onClick={downloadShiftTemplate}
            className="px-3 py-1.5 text-sm text-blue-600 hover:underline"
          >
            템플릿 다운로드
          </button>
        </div>
        {csvError && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md">
            <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
            <div>
              <p className="text-sm font-medium text-red-700">CSV 가져오기 실패</p>
              <p className="text-xs text-red-600">{csvError}</p>
              <p className="text-xs text-gray-500 mt-0.5">형식: 날짜,시작,종료,휴게(분),휴일여부</p>
            </div>
          </div>
        )}
      </div>

      {/* 캘린더 뷰 */}
      {viewMode === 'calendar' && (
        <ShiftCalendar
          shifts={shifts}
          onShiftAdd={(shift) => setShifts((prev) => [...prev, shift])}
          onShiftRemove={handleDeleteShift}
          onShiftUpdate={handleUpdateShift}
          initialMonth={currentMonth}
          periodStart={payPeriodStart}
          periodEnd={payPeriodEnd}
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

      {/* 요약 — 정산기간 내 시프트만 집계 */}
      <ShiftSummary
        shifts={shifts}
        periodStart={payPeriodStart}
        periodEnd={payPeriodEnd}
      />

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

