/**
 * Excel(xlsx) 내보내기 유틸리티
 * SheetJS 라이브러리 사용
 */

import * as XLSX from 'xlsx';
import type { PayrollEntryResponse, PayrollPeriodResponse } from '../types/payroll';
import type { EmployeeResponse } from '../types/employee';

/** 공통: 워크북 다운로드 */
function downloadWorkbook(wb: XLSX.WorkBook, fileName: string) {
  XLSX.writeFile(wb, fileName);
}

/** 열 너비 자동 조정 */
function autoFitColumns(ws: XLSX.WorkSheet, data: (string | number | null)[][]) {
  const colWidths = data[0].map((_, colIdx) => {
    const maxLen = data.reduce((max, row) => {
      const cell = row[colIdx];
      const len = cell != null ? String(cell).length : 0;
      return Math.max(max, len);
    }, 0);
    return { wch: Math.min(Math.max(maxLen + 2, 8), 30) };
  });
  ws['!cols'] = colWidths;
}

/**
 * 급여대장 상세 내보내기 (월간)
 */
export function exportPayrollDetailXlsx(
  period: PayrollPeriodResponse,
  entries: PayrollEntryResponse[],
) {
  const header = [
    '이름', '기본급', '연장수당', '야간수당', '휴일수당', '주휴수당',
    '총 지급액', '국민연금', '건강보험', '장기요양', '고용보험',
    '소득세', '지방소득세', '총 공제액', '실수령액',
  ];

  const rows = entries.map((e) => [
    e.employee_name || '',
    e.base_salary,
    e.overtime_pay || 0,
    e.night_pay || 0,
    e.holiday_pay || 0,
    e.weekly_holiday_pay || 0,
    e.total_gross || 0,
    e.national_pension || 0,
    e.health_insurance || 0,
    e.long_term_care || 0,
    e.employment_insurance || 0,
    e.income_tax || 0,
    e.local_income_tax || 0,
    e.total_deductions || 0,
    e.net_pay || 0,
  ]);

  // 합계 행
  const sumRow = ['합계', ...header.slice(1).map((_, i) =>
    rows.reduce((sum, row) => sum + (Number(row[i + 1]) || 0), 0)
  )];

  const data = [header, ...rows, sumRow];
  const ws = XLSX.utils.aoa_to_sheet(data);
  autoFitColumns(ws, data);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `${period.year}년 ${period.month}월`);

  downloadWorkbook(wb, `급여대장_${period.year}년${period.month}월.xlsx`);
}

/**
 * 급여대장 연간 요약 내보내기
 */
export function exportPayrollSummaryXlsx(periods: PayrollPeriodResponse[]) {
  const header = ['연월', '직원수', '상태', '총 지급액', '총 실수령액', '총 공제액'];

  const statusMap: Record<string, string> = {
    DRAFT: '작성중', CONFIRMED: '확정', PAID: '지급완료',
  };

  const rows = periods.map((p) => [
    `${p.year}년 ${p.month}월`,
    p.employee_count,
    statusMap[p.status] || p.status,
    p.total_gross,
    p.total_net_pay,
    p.total_gross - p.total_net_pay,
  ]);

  const sumRow = [
    '합계', '', '',
    periods.reduce((s, p) => s + p.total_gross, 0),
    periods.reduce((s, p) => s + p.total_net_pay, 0),
    periods.reduce((s, p) => s + (p.total_gross - p.total_net_pay), 0),
  ];

  const data = [header, ...rows, sumRow];
  const ws = XLSX.utils.aoa_to_sheet(data);
  autoFitColumns(ws, data);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '급여 요약');

  const year = periods[0]?.year || new Date().getFullYear();
  downloadWorkbook(wb, `급여대장_요약_${year}년.xlsx`);
}

/**
 * 직원 목록 내보내기
 */
export function exportEmployeeListXlsx(employees: EmployeeResponse[]) {
  const header = [
    '이름', '나이', '고용형태', '사업장규모', '입사일',
    '출근시간', '퇴근시간', '휴게(분)', '주 근무일', '일 근무시간',
    '외국인', '체류자격', '수습', '연금적용',
  ];

  const empTypeMap: Record<string, string> = {
    FULL_TIME: '정규직', PART_TIME: '파트타임',
  };
  const sizeMap: Record<string, string> = {
    OVER_5: '5인 이상', UNDER_5: '5인 미만',
  };

  const rows = employees.map((e) => [
    e.name,
    e.age,
    empTypeMap[e.employment_type] || e.employment_type,
    sizeMap[e.company_size] || e.company_size,
    e.contract_start_date,
    e.work_start_time?.slice(0, 5),
    e.work_end_time?.slice(0, 5),
    e.break_minutes,
    e.weekly_work_days,
    e.daily_work_hours,
    e.is_foreigner ? 'Y' : 'N',
    e.visa_type || '-',
    e.is_in_probation ? 'Y' : 'N',
    e.is_pension_eligible ? 'Y' : 'N',
  ]);

  const data = [header, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);
  autoFitColumns(ws, data);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '직원 목록');

  downloadWorkbook(wb, `직원목록_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
