/**
 * 급여명세서 PDF 생성기
 * 근로기준법 시행령 제27조의2 준수
 */

import { jsPDF } from 'jspdf';
import type { SalaryCalculationResponse } from '../types/salary';

/**
 * 급여명세서 PDF 생성 및 다운로드
 */
export async function generatePayslipPdf(
  result: SalaryCalculationResponse,
  employerName: string = 'PayTools 사업장'
): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const { gross_breakdown, deductions_breakdown, net_pay, work_summary } = result;

  let y = 15;

  // 제목
  doc.setFontSize(16);
  doc.text('급 여 명 세 서', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // 기본 정보
  doc.setFontSize(9);
  const calcDate = result.calculation_metadata.calculation_date;
  const yearMonth = calcDate.slice(0, 7).replace('-', '년 ') + '월';

  doc.text(`귀속연월: ${yearMonth}`, 15, y);
  doc.text(`지급일: ${calcDate.replace(/-/g, '.')}`, pageWidth - 50, y);
  y += 6;
  doc.text(`성    명: ${result.employee_name}`, 15, y);
  doc.text(`사업장: ${employerName}`, pageWidth - 70, y);
  y += 10;

  // 구분선
  doc.setLineWidth(0.5);
  doc.line(15, y, pageWidth - 15, y);
  y += 8;

  // 지급 내역 테이블
  doc.setFontSize(10);
  doc.text('[지급 내역]', 15, y);
  y += 6;

  const payItems = [
    { label: '기본급', amount: gross_breakdown.base_salary },
    { label: '주휴수당', amount: gross_breakdown.weekly_holiday_pay.amount },
    { label: '연장근로수당', amount: gross_breakdown.overtime_allowances.overtime_pay },
    { label: '야간근로수당', amount: gross_breakdown.overtime_allowances.night_pay },
    { label: '휴일근로수당', amount: gross_breakdown.overtime_allowances.holiday_pay },
    { label: '과세수당', amount: gross_breakdown.taxable_allowances },
    { label: '비과세수당', amount: gross_breakdown.non_taxable_allowances },
  ].filter(item => item.amount.amount > 0);

  doc.setFontSize(9);
  payItems.forEach((item) => {
    doc.text(item.label, 20, y);
    doc.text(item.amount.formatted, pageWidth - 40, y, { align: 'right' });
    y += 5;
  });

  y += 3;
  doc.setFontSize(10);
  doc.text('총 지급액', 20, y);
  doc.text(gross_breakdown.total.formatted, pageWidth - 40, y, { align: 'right' });
  y += 10;

  // 공제 내역 테이블
  doc.text('[공제 내역]', 15, y);
  y += 6;

  const deductItems = [
    { label: '국민연금', amount: deductions_breakdown.insurance.national_pension },
    { label: '건강보험', amount: deductions_breakdown.insurance.health_insurance },
    { label: '장기요양보험', amount: deductions_breakdown.insurance.long_term_care },
    { label: '고용보험', amount: deductions_breakdown.insurance.employment_insurance },
    { label: '소득세', amount: deductions_breakdown.tax.income_tax },
    { label: '지방소득세', amount: deductions_breakdown.tax.local_income_tax },
  ].filter(item => item.amount.amount > 0);

  doc.setFontSize(9);
  deductItems.forEach((item) => {
    doc.text(item.label, 20, y);
    doc.text(item.amount.formatted, pageWidth - 40, y, { align: 'right' });
    y += 5;
  });

  y += 3;
  doc.setFontSize(10);
  doc.text('총 공제액', 20, y);
  doc.text(deductions_breakdown.total.formatted, pageWidth - 40, y, { align: 'right' });
  y += 10;

  // 구분선
  doc.setLineWidth(0.5);
  doc.line(15, y, pageWidth - 15, y);
  y += 8;

  // 실수령액
  doc.setFontSize(12);
  doc.text('실수령액', 20, y);
  doc.text(net_pay.formatted, pageWidth - 40, y, { align: 'right' });
  y += 15;

  // 근무 요약 (있는 경우)
  if (work_summary) {
    doc.setFontSize(10);
    doc.text('[근무 요약]', 15, y);
    y += 6;
    doc.setFontSize(9);
    doc.text(`총 근무일수: ${work_summary.actual_work_days}일`, 20, y);
    y += 5;
    doc.text(`총 근무시간: ${work_summary.total_work_hours.formatted}`, 20, y);
    y += 5;
    if (work_summary.overtime_hours.total_minutes > 0) {
      doc.text(`연장근로시간: ${work_summary.overtime_hours.formatted}`, 20, y);
      y += 5;
    }
    if (work_summary.night_hours.total_minutes > 0) {
      doc.text(`야간근로시간: ${work_summary.night_hours.formatted}`, 20, y);
      y += 5;
    }
    if (work_summary.holiday_hours.total_minutes > 0) {
      doc.text(`휴일근로시간: ${work_summary.holiday_hours.formatted}`, 20, y);
      y += 5;
    }
    y += 10;
  }

  // 법적 고지
  doc.setFontSize(8);
  doc.text(
    '본 급여명세서는 근로기준법 시행령 제27조의2에 따라 교부합니다.',
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  y += 5;
  doc.text(
    '* 본 문서는 PayTools에서 생성되었으며, 참고용입니다.',
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  // 파일 저장
  const fileName = `급여명세서_${result.employee_name}_${calcDate.slice(0, 7)}.pdf`;
  doc.save(fileName);
}

/**
 * 급여 계산 결과를 CSV로 내보내기
 */
export function exportSalaryToCsv(result: SalaryCalculationResponse): void {
  const { gross_breakdown, deductions_breakdown, net_pay } = result;

  const rows = [
    ['항목', '금액'],
    ['성명', result.employee_name],
    ['귀속연월', result.calculation_metadata.calculation_date.slice(0, 7)],
    [''],
    ['[지급 내역]', ''],
    ['기본급', gross_breakdown.base_salary.amount.toString()],
    ['주휴수당', gross_breakdown.weekly_holiday_pay.amount.amount.toString()],
    ['연장근로수당', gross_breakdown.overtime_allowances.overtime_pay.amount.toString()],
    ['야간근로수당', gross_breakdown.overtime_allowances.night_pay.amount.toString()],
    ['휴일근로수당', gross_breakdown.overtime_allowances.holiday_pay.amount.toString()],
    ['과세수당', gross_breakdown.taxable_allowances.amount.toString()],
    ['비과세수당', gross_breakdown.non_taxable_allowances.amount.toString()],
    ['총 지급액', gross_breakdown.total.amount.toString()],
    [''],
    ['[공제 내역]', ''],
    ['국민연금', deductions_breakdown.insurance.national_pension.amount.toString()],
    ['건강보험', deductions_breakdown.insurance.health_insurance.amount.toString()],
    ['장기요양보험', deductions_breakdown.insurance.long_term_care.amount.toString()],
    ['고용보험', deductions_breakdown.insurance.employment_insurance.amount.toString()],
    ['소득세', deductions_breakdown.tax.income_tax.amount.toString()],
    ['지방소득세', deductions_breakdown.tax.local_income_tax.amount.toString()],
    ['총 공제액', deductions_breakdown.total.amount.toString()],
    [''],
    ['실수령액', net_pay.amount.toString()],
  ];

  const csvContent = rows.map((row) => row.join(',')).join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `급여명세서_${result.employee_name}_${result.calculation_metadata.calculation_date.slice(0, 7)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}
