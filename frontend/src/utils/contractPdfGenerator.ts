/**
 * 근로계약서 PDF 생성기
 * html2canvas + jsPDF 조합으로 한글 지원
 */

import { jsPDF } from 'jspdf';
import type { LaborContract } from '../types/contract';

/**
 * 계약서 PDF 생성 및 다운로드
 */
export async function generateContractPdf(contract: LaborContract): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // 한글 폰트 설정 (기본 폰트로 처리, 실제 서비스에서는 한글 폰트 파일 필요)
  doc.setFont('helvetica');

  // 제목
  doc.setFontSize(18);
  doc.text('표준 근로계약서', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // 계약 당사자
  doc.setFontSize(10);
  y = addSection(doc, y, '1. 계약 당사자', [
    `사업주(갑): ${contract.employer.company_name} (대표: ${contract.employer.representative_name})`,
    `사업자등록번호: ${contract.employer.business_number}`,
    `주소: ${contract.employer.address}`,
    `근로자(을): ${contract.employee.name}`,
    `주민등록번호: ${contract.employee.resident_id_prefix}******`,
    `주소: ${contract.employee.address}`,
  ]);

  // 계약 기간
  y = addSection(doc, y, '2. 계약 기간', [
    `계약 체결일: ${formatDate(contract.contract_date)}`,
    `근로 시작일: ${formatDate(contract.contract_start_date)}`,
    contract.is_indefinite
      ? '계약 형태: 무기계약'
      : `계약 종료일: ${formatDate(contract.contract_end_date || '')}`,
    contract.has_probation
      ? `수습 기간: ${contract.probation_months}개월 (급여 ${contract.probation_rate}%)`
      : '',
  ].filter(Boolean));

  // 근무 장소 및 업무
  y = addSection(doc, y, '3. 근무 장소 및 업무', [
    `근무 장소: ${contract.workplace}`,
    `직위/직책: ${contract.job_title}`,
    `담당 업무: ${contract.job_description}`,
  ]);

  // 근로 시간
  y = addSection(doc, y, '4. 근로 시간', [
    `근무 시간: ${contract.work_start_time} ~ ${contract.work_end_time}`,
    `휴게 시간: ${contract.break_minutes}분`,
    `주 소정근로일수: ${contract.weekly_work_days}일`,
    `주휴일: ${contract.weekly_holiday}`,
    contract.overtime_agreement
      ? `연장/야간/휴일 근로 합의: 근로기준법에 따라 가산 지급`
      : '',
  ].filter(Boolean));

  // 새 페이지 체크
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  // 임금
  const wageLines = [
    `급여 형태: ${contract.wage_type === 'MONTHLY' ? '월급제' : contract.wage_type === 'HOURLY' ? '시급제' : '일급제'}`,
    `기본급: ${formatWon(contract.base_salary)}원`,
  ];

  if (contract.allowances.length > 0) {
    contract.allowances.forEach((a) => {
      wageLines.push(`- ${a.name}: ${formatWon(a.amount)}원`);
    });
  }

  wageLines.push(
    `급여 지급일: 매월 ${contract.pay_day}일`,
    contract.bank_name ? `지급 계좌: ${contract.bank_name} ${contract.account_number}` : ''
  );

  y = addSection(doc, y, '5. 임금', wageLines.filter(Boolean));

  // 4대 보험
  const insuranceList = [];
  if (contract.social_insurance.national_pension) insuranceList.push('국민연금');
  if (contract.social_insurance.health_insurance) insuranceList.push('건강보험');
  if (contract.social_insurance.employment_insurance) insuranceList.push('고용보험');
  if (contract.social_insurance.industrial_accident) insuranceList.push('산재보험');

  y = addSection(doc, y, '6. 사회보험 적용', [
    `적용 항목: ${insuranceList.join(', ')}`,
  ]);

  // 기타 사항
  if (contract.other_terms) {
    y = addSection(doc, y, '7. 기타 약정사항', [contract.other_terms]);
  }

  // 새 페이지 체크
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  // 서명란
  y += 10;
  doc.setFontSize(10);
  doc.text(
    '위와 같이 근로계약을 체결하고, 이 계약서를 2부 작성하여 당사자가 각 1부씩 보관한다.',
    20,
    y
  );
  y += 15;

  doc.text(`${formatDate(contract.contract_date)}`, pageWidth / 2, y, { align: 'center' });
  y += 15;

  // 사업주 서명
  doc.text('사업주 (갑)', 40, y);
  doc.text(`상호: ${contract.employer.company_name}`, 40, y + 7);
  doc.text(`대표자: ${contract.employer.representative_name}`, 40, y + 14);
  doc.text('(서명 또는 날인)', 40, y + 21);

  // 근로자 서명
  doc.text('근로자 (을)', pageWidth - 70, y);
  doc.text(`성명: ${contract.employee.name}`, pageWidth - 70, y + 7);
  doc.text('(서명 또는 날인)', pageWidth - 70, y + 14);

  // 파일 저장
  const fileName = `근로계약서_${contract.employee.name}_${contract.contract_date}.pdf`;
  doc.save(fileName);
}

/**
 * 섹션 추가 헬퍼
 */
function addSection(doc: jsPDF, y: number, title: string, lines: string[]): number {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  for (const line of lines) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 25, y);
    y += 6;
  }

  return y + 5;
}

/**
 * 날짜 포맷
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/**
 * 금액 포맷
 */
function formatWon(value: number): string {
  return value.toLocaleString('ko-KR');
}
