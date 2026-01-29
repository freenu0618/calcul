/**
 * 시프트 검증 유틸리티 (한국 근로기준법 기준)
 * - 주 52시간 위반 경고 (근로기준법 제53조)
 * - 1일 연장근로 한도 검증
 * - 휴게시간 부족 경고 (4시간→30분, 8시간→1시간)
 */

import type { WorkShiftRequest } from '../types/salary';

export interface ShiftWarning {
  type: 'weekly_hours' | 'daily_hours' | 'break_time' | 'consecutive_work';
  severity: 'warning' | 'critical';
  message: string;
  dates?: string[];
}

/**
 * 시프트 실제 근무 분 계산
 */
function calcWorkMinutes(shift: WorkShiftRequest): number {
  const [sh, sm] = shift.start_time.split(':').map(Number);
  const [eh, em] = shift.end_time.split(':').map(Number);
  let totalMins = (eh * 60 + em) - (sh * 60 + sm);
  // 익일 종료 처리 (22:00~07:00 등)
  if (totalMins < 0) totalMins += 24 * 60;
  return Math.max(0, totalMins - shift.break_minutes);
}

/**
 * 시프트 검증 (한국 근로기준법 기준)
 */
export function validateShifts(shifts: WorkShiftRequest[]): ShiftWarning[] {
  const warnings: ShiftWarning[] = [];
  if (shifts.length === 0) return warnings;

  // 날짜순 정렬
  const sorted = [...shifts].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.start_time.localeCompare(b.start_time);
  });

  // 1. 주 52시간 검증 (근로기준법 제53조)
  const weeklyHours: Map<string, number> = new Map();
  sorted.forEach((shift) => {
    const date = new Date(shift.date);
    // ISO 주 계산 (월요일 시작)
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    const weekKey = monday.toISOString().slice(0, 10);
    const mins = calcWorkMinutes(shift);
    weeklyHours.set(weekKey, (weeklyHours.get(weekKey) || 0) + mins);
  });

  const overWeeks: string[] = [];
  weeklyHours.forEach((mins, weekKey) => {
    if (mins > 52 * 60) overWeeks.push(weekKey);
  });
  if (overWeeks.length > 0) {
    warnings.push({
      type: 'weekly_hours',
      severity: 'critical',
      message: `주 52시간을 초과하는 주가 ${overWeeks.length}주 있습니다 (근로기준법 제53조 위반).`,
      dates: overWeeks,
    });
  }

  // 2. 1일 연장근로 한도 검증 (8시간 + 연장 4시간 = 12시간)
  const longDays: string[] = [];
  sorted.forEach((shift) => {
    const mins = calcWorkMinutes(shift);
    if (mins > 12 * 60) longDays.push(shift.date);
  });
  if (longDays.length > 0) {
    warnings.push({
      type: 'daily_hours',
      severity: 'critical',
      message: `1일 12시간(법정 8시간 + 연장 4시간)을 초과하는 근무일이 ${longDays.length}일 있습니다.`,
      dates: longDays,
    });
  }

  // 3. 휴게시간 부족 검증 (근로기준법 제54조)
  const insufficientBreak: string[] = [];
  sorted.forEach((shift) => {
    const totalMins = calcWorkMinutes(shift) + shift.break_minutes; // 총 근로시간 (휴게 포함)
    const requiredBreak = totalMins > 8 * 60 ? 60 : totalMins > 4 * 60 ? 30 : 0;
    if (shift.break_minutes < requiredBreak) {
      insufficientBreak.push(shift.date);
    }
  });
  if (insufficientBreak.length > 0) {
    warnings.push({
      type: 'break_time',
      severity: 'warning',
      message: `휴게시간이 부족한 날이 ${insufficientBreak.length}일 있습니다 (4시간→30분, 8시간→1시간 필수).`,
      dates: insufficientBreak,
    });
  }

  // 4. 연속 근무일 검증 (7일 이상 연속 근무 경고)
  let consecutiveDays = 1;
  let maxConsecutive = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1].date);
    const currDate = new Date(sorted[i].date);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      consecutiveDays++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
    } else if (diffDays > 1) {
      consecutiveDays = 1;
    }
  }
  if (maxConsecutive >= 7) {
    warnings.push({
      type: 'consecutive_work',
      severity: 'warning',
      message: `${maxConsecutive}일 연속 근무가 확인됩니다. 주휴일(1주 1회)을 확보해야 합니다 (근로기준법 제55조).`,
    });
  }

  return warnings;
}
