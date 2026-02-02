/**
 * 급여명세서 PDF 생성기
 * html2canvas 방식으로 한글 완벽 지원
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { SalaryCalculationResponse } from '../types/salary';

/**
 * 숫자를 원화 형식으로 포맷
 */
function formatKRW(amount: number): string {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
}

/**
 * 급여명세서 PDF 생성 및 다운로드 (html2canvas 방식)
 */
export async function generatePayslipPdf(
  result: SalaryCalculationResponse,
  employerName: string = 'PayTools 사업장'
): Promise<void> {
  const { gross_breakdown, deductions_breakdown, net_pay, work_summary } = result;
  const calcDate = result.calculation_metadata.calculation_date;
  const yearMonth = calcDate.slice(0, 7).replace('-', '년 ') + '월';

  // 지급 항목
  const payItems = [
    { label: '기본급', amount: gross_breakdown.base_salary.amount },
    { label: '주휴수당', amount: gross_breakdown.weekly_holiday_pay.amount.amount },
    { label: '연장근로수당', amount: gross_breakdown.overtime_allowances.overtime_pay.amount },
    { label: '야간근로수당', amount: gross_breakdown.overtime_allowances.night_pay.amount },
    { label: '휴일근로수당', amount: gross_breakdown.overtime_allowances.holiday_pay.amount },
    { label: '과세수당', amount: gross_breakdown.taxable_allowances.amount },
    { label: '비과세수당', amount: gross_breakdown.non_taxable_allowances.amount },
  ].filter(item => item.amount > 0);

  // 공제 항목
  const deductItems = [
    { label: '국민연금', amount: deductions_breakdown.insurance.national_pension.amount },
    { label: '건강보험', amount: deductions_breakdown.insurance.health_insurance.amount },
    { label: '장기요양보험', amount: deductions_breakdown.insurance.long_term_care.amount },
    { label: '고용보험', amount: deductions_breakdown.insurance.employment_insurance.amount },
    { label: '소득세', amount: deductions_breakdown.tax.income_tax.amount },
    { label: '지방소득세', amount: deductions_breakdown.tax.local_income_tax.amount },
  ].filter(item => item.amount > 0);

  // HTML 템플릿 생성
  const html = `
    <div id="payslip-pdf" style="width: 595px; padding: 40px; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; background: white; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; margin: 0;">급 여 명 세 서</h1>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px;">
        <div>
          <p style="margin: 4px 0;"><strong>귀속연월:</strong> ${yearMonth}</p>
          <p style="margin: 4px 0;"><strong>성    명:</strong> ${result.employee_name}</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 4px 0;"><strong>지급일:</strong> ${calcDate.replace(/-/g, '.')}</p>
          <p style="margin: 4px 0;"><strong>사업장:</strong> ${employerName}</p>
        </div>
      </div>

      <hr style="border: none; border-top: 2px solid #1e293b; margin: 20px 0;">

      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 14px; margin: 0 0 12px; color: #3b82f6;">[지급 내역]</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          ${payItems.map(item => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0;">${item.label}</td>
              <td style="padding: 8px 0; text-align: right;">${formatKRW(item.amount)}</td>
            </tr>
          `).join('')}
          <tr style="background: #f1f5f9; font-weight: bold;">
            <td style="padding: 10px 0;">총 지급액</td>
            <td style="padding: 10px 0; text-align: right;">${gross_breakdown.total.formatted}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 14px; margin: 0 0 12px; color: #ef4444;">[공제 내역]</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          ${deductItems.map(item => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0;">${item.label}</td>
              <td style="padding: 8px 0; text-align: right;">${formatKRW(item.amount)}</td>
            </tr>
          `).join('')}
          <tr style="background: #fef2f2; font-weight: bold;">
            <td style="padding: 10px 0;">총 공제액</td>
            <td style="padding: 10px 0; text-align: right;">${deductions_breakdown.total.formatted}</td>
          </tr>
        </table>
      </div>

      <hr style="border: none; border-top: 2px solid #1e293b; margin: 20px 0;">

      <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #3b82f6; color: white; border-radius: 8px; margin-bottom: 24px;">
        <span style="font-size: 18px; font-weight: bold;">실수령액</span>
        <span style="font-size: 24px; font-weight: bold;">${net_pay.formatted}</span>
      </div>

      ${work_summary ? `
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 14px; margin: 0 0 12px; color: #64748b;">[근무 요약]</h3>
          <div style="font-size: 13px; color: #64748b;">
            <p style="margin: 4px 0;">총 근무일수: ${work_summary.actual_work_days}일</p>
            <p style="margin: 4px 0;">총 근무시간: ${work_summary.total_work_hours.formatted}</p>
            ${work_summary.overtime_hours.total_minutes > 0 ? `<p style="margin: 4px 0;">연장근로: ${work_summary.overtime_hours.formatted}</p>` : ''}
            ${work_summary.night_hours.total_minutes > 0 ? `<p style="margin: 4px 0;">야간근로: ${work_summary.night_hours.formatted}</p>` : ''}
            ${work_summary.holiday_hours.total_minutes > 0 ? `<p style="margin: 4px 0;">휴일근로: ${work_summary.holiday_hours.formatted}</p>` : ''}
          </div>
        </div>
      ` : ''}

      <div style="text-align: center; font-size: 11px; color: #94a3b8; margin-top: 30px;">
        <p style="margin: 4px 0;">본 급여명세서는 근로기준법 시행령 제27조의2에 따라 교부합니다.</p>
        <p style="margin: 4px 0;">* 본 문서는 PayTools에서 생성되었으며, 참고용입니다.</p>
      </div>
    </div>
  `;

  // 임시 컨테이너 생성
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);

  try {
    const element = container.querySelector('#payslip-pdf') as HTMLElement;

    // html2canvas로 이미지 변환
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // PDF 생성
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // 파일 저장
    const fileName = `급여명세서_${result.employee_name}_${calcDate.slice(0, 7)}.pdf`;
    pdf.save(fileName);
  } finally {
    // 임시 컨테이너 제거
    document.body.removeChild(container);
  }
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
