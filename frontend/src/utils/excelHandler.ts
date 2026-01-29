/**
 * 시프트 데이터 Excel/CSV 처리기
 */

import type { WorkShiftRequest } from '../types/salary';

/**
 * 시프트 템플릿 CSV 다운로드
 */
export function downloadShiftTemplate(): void {
  const headers = ['date', 'start_time', 'end_time', 'break_minutes', 'is_holiday_work'];
  const example = ['2026-01-06', '09:00', '18:00', '60', 'false'];
  const csvContent = [headers.join(','), example.join(',')].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = '시프트_템플릿.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * CSV 파일에서 시프트 데이터 파싱
 */
export function parseShiftCsv(csvText: string): WorkShiftRequest[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error('데이터가 없습니다.');

  const headers = lines[0].toLowerCase().split(',').map((h) => h.trim());
  const dateIdx = headers.indexOf('date');
  const startIdx = headers.indexOf('start_time');
  const endIdx = headers.indexOf('end_time');
  const breakIdx = headers.indexOf('break_minutes');
  const holidayIdx = headers.indexOf('is_holiday_work');

  if (dateIdx === -1 || startIdx === -1 || endIdx === -1) {
    throw new Error('필수 컬럼(date, start_time, end_time)이 없습니다.');
  }

  const shifts: WorkShiftRequest[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(',').map((c) => c.trim());
    const date = cols[dateIdx];
    const start = cols[startIdx];
    const end = cols[endIdx];

    if (!date || !start || !end) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`잘못된 날짜 형식 (행 ${i + 1}): ${date}`);
    if (!/^\d{2}:\d{2}$/.test(start)) throw new Error(`잘못된 시작 시간 (행 ${i + 1}): ${start}`);
    if (!/^\d{2}:\d{2}$/.test(end)) throw new Error(`잘못된 종료 시간 (행 ${i + 1}): ${end}`);

    const breakMins = breakIdx !== -1 && cols[breakIdx] ? parseInt(cols[breakIdx], 10) : 60;
    const isHoliday = holidayIdx !== -1 && cols[holidayIdx]?.toLowerCase() === 'true';

    shifts.push({
      date,
      start_time: start,
      end_time: end,
      break_minutes: isNaN(breakMins) ? 60 : breakMins,
      is_holiday_work: isHoliday,
    });
  }

  if (shifts.length === 0) throw new Error('유효한 시프트 데이터가 없습니다.');
  return shifts;
}

/**
 * 시프트 데이터를 CSV로 내보내기
 */
export function exportShiftsToCsv(shifts: WorkShiftRequest[], fileName?: string): void {
  const headers = ['date', 'start_time', 'end_time', 'break_minutes', 'is_holiday_work'];
  const rows = shifts.map((s) =>
    [s.date, s.start_time, s.end_time, s.break_minutes, s.is_holiday_work].join(',')
  );
  const csvContent = [headers.join(','), ...rows].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName || `시프트_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * 파일 읽기 유틸리티 (Promise 기반)
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.readAsText(file, 'UTF-8');
  });
}
