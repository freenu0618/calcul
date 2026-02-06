/**
 * 급여 정산기간 + 귀속월 설정 컴포넌트
 * - 시작일/종료일 date input
 * - 귀속월 select (종료일 기준 자동 추론)
 * - 빠른 설정 프리셋 (이번 달, 지난 달, 25일~24일, 16일~15일)
 */

import { useState } from 'react';

interface PayPeriodSelectorProps {
  periodStart: string;
  periodEnd: string;
  attributionMonth: string;
  onPeriodChange: (start: string, end: string) => void;
  onAttributionMonthChange: (month: string) => void;
}

// 날짜 포맷 헬퍼
const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmtYM = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const firstDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const lastDay = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

function getPresets() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const day = now.getDate();

  // 25일~24일 구간
  const get2524 = () => {
    if (day >= 25) {
      const s = new Date(now.getFullYear(), now.getMonth(), 25);
      const e = new Date(now.getFullYear(), now.getMonth() + 1, 24);
      return { start: fmt(s), end: fmt(e), month: fmtYM(e) };
    }
    const s = new Date(now.getFullYear(), now.getMonth() - 1, 25);
    const e = new Date(now.getFullYear(), now.getMonth(), 24);
    return { start: fmt(s), end: fmt(e), month: fmtYM(e) };
  };

  // 16일~15일 구간
  const get1615 = () => {
    if (day >= 16) {
      const s = new Date(now.getFullYear(), now.getMonth(), 16);
      const e = new Date(now.getFullYear(), now.getMonth() + 1, 15);
      return { start: fmt(s), end: fmt(e), month: fmtYM(e) };
    }
    const s = new Date(now.getFullYear(), now.getMonth() - 1, 16);
    const e = new Date(now.getFullYear(), now.getMonth(), 15);
    return { start: fmt(s), end: fmt(e), month: fmtYM(e) };
  };

  return [
    { label: '이번 달', ...(() => {
      const s = firstDay(now), e = lastDay(now);
      return { start: fmt(s), end: fmt(e), month: fmtYM(now) };
    })() },
    { label: '지난 달', ...(() => {
      const s = firstDay(prev), e = lastDay(prev);
      return { start: fmt(s), end: fmt(e), month: fmtYM(prev) };
    })() },
    { label: '25일~24일', ...get2524() },
    { label: '16일~15일', ...get1615() },
  ];
}

function getLast12Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = -1; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(fmtYM(d));
  }
  return months;
}

const TOOLTIP_TEXT =
  '급여가 귀속되는 월입니다. 4대 보험료와 소득세는 귀속월 기준으로 계산됩니다. ' +
  '예: 정산기간 1/25~2/24 → 귀속월 2월. 종료일 기준으로 자동 설정되며 직접 변경할 수 있습니다.';

export default function PayPeriodSelector({
  periodStart,
  periodEnd,
  attributionMonth,
  onPeriodChange,
  onAttributionMonthChange,
}: PayPeriodSelectorProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const presets = getPresets();

  const handleStartChange = (start: string) => {
    onPeriodChange(start, periodEnd);
  };

  const handleEndChange = (end: string) => {
    onPeriodChange(periodStart, end);
    // 귀속월 자동 추론: 종료일이 속한 월
    const endDate = new Date(end);
    if (!isNaN(endDate.getTime())) {
      onAttributionMonthChange(fmtYM(endDate));
    }
  };

  const applyPreset = (p: { start: string; end: string; month: string }) => {
    onPeriodChange(p.start, p.end);
    onAttributionMonthChange(p.month);
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-blue-600 text-[20px]">date_range</span>
        <span className="font-medium text-gray-800 text-sm">급여 정산 기간</span>
      </div>

      {/* 날짜 입력 + 귀속월 */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">시작일</label>
          <input
            type="date"
            value={periodStart}
            onChange={(e) => handleStartChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <span className="text-gray-400 pb-1.5">~</span>
        <div>
          <label className="block text-xs text-gray-500 mb-1">종료일</label>
          <input
            type="date"
            value={periodEnd}
            onChange={(e) => handleEndChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="relative">
          <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            귀속월
            <button
              type="button"
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-gray-400 hover:text-blue-500"
            >
              <span className="material-symbols-outlined text-[16px]">info</span>
            </button>
          </label>
          <select
            value={attributionMonth}
            onChange={(e) => onAttributionMonthChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {getLast12Months().map((m) => (
              <option key={m} value={m}>
                {m.replace('-', '년 ')}월
              </option>
            ))}
          </select>
          {showTooltip && (
            <div className="absolute z-50 top-full left-0 mt-1 w-72 p-3 bg-white border border-gray-200 rounded-lg shadow-lg text-xs text-gray-600">
              {TOOLTIP_TEXT}
              <button
                type="button"
                onClick={() => setShowTooltip(false)}
                className="block mt-2 text-blue-500 hover:underline"
              >
                닫기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 빠른 설정 프리셋 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500">빠른 설정:</span>
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              periodStart === p.start && periodEnd === p.end
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        정산 기간에 해당하는 근무시프트만 급여 계산에 반영됩니다.
      </p>
    </div>
  );
}
