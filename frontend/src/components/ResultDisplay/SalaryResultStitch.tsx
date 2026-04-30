/**
 * Stitch 디자인 기반 급여 계산 결과 컴포넌트
 * - 신뢰감 있는 전문적 디자인
 * - 아코디언 스타일 상세 내역
 * - 카카오 공유 + 저장 버튼
 */

import { useState } from 'react';
import type { SalaryCalculationResponse } from '../../types/salary';
import { ShareButtons } from '../common/ShareButtons';
import { DonutChart, type DonutChartData } from '../charts';

interface SalaryResultStitchProps {
  result: SalaryCalculationResponse;
}

// Material Symbol 아이콘 컴포넌트
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
  );
}

// 아코디언 섹션 컴포넌트
function AccordionSection({
  icon,
  iconBg,
  iconColor,
  title,
  amount,
  amountColor = 'text-gray-900',
  children,
  defaultOpen = false,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  amount?: string;
  amountColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${iconBg} ${iconColor}`}>
            <Icon name={icon} className="text-[20px]" />
          </div>
          <span className="text-gray-900 text-base font-bold">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {amount && <span className={`font-bold ${amountColor}`}>{amount}</span>}
          <Icon
            name="expand_more"
            className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-0 flex flex-col gap-3 border-t border-dashed border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

// 상세 항목 행
function DetailRow({ label, value, sublabel, formula }: { label: string; value: string; sublabel?: string; formula?: string }) {
  return (
    <div className="pt-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">
          {label}
          {sublabel && <span className="text-gray-400 text-xs ml-1">({sublabel})</span>}
        </span>
        <span className="font-medium text-gray-900">{value}</span>
      </div>
      {formula && (
        <div className="text-xs text-gray-400 mt-1 bg-gray-50 p-2 rounded">
          {formula}
        </div>
      )}
    </div>
  );
}

// 차트 색상 팔레트
const CHART_COLORS = {
  baseSalary: '#3b82f6',    // blue-500
  weeklyHoliday: '#10b981', // emerald-500
  overtime: '#8b5cf6',      // violet-500
  allowance: '#06b6d4',     // cyan-500
  guarantee: '#a855f7',     // purple-500 (계약보전수당)
  deduction: '#ef4444',     // red-500
  netPay: '#22c55e',        // green-500
};

export default function SalaryResultStitch({ result }: SalaryResultStitchProps) {
  const { gross_breakdown, deductions_breakdown, net_pay, warnings } = result;
  const CAPTURE_ID = 'salary-result-capture';

  // 급여 타입 및 계산 모드 확인
  const wageType = result.calculation_metadata?.wage_type || 'MONTHLY';
  const isHourlyWage = wageType === 'HOURLY' || wageType === 'HOURLY_MONTHLY' || wageType === 'HOURLY_BASED_MONTHLY';
  const appliedWageMode = result.applied_wage_mode;
  const contractDiff = result.contract_vs_actual_diff;
  const guaranteeAllowance = result.contract_guarantee_allowance;

  // 통상시급 (API에서 계산된 값 사용)
  const hourlyWage = gross_breakdown.hourly_wage?.amount || 0;
  const taxableIncome = gross_breakdown.total.amount - gross_breakdown.non_taxable_allowances.amount;

  // 2026년 보험요율
  const RATES = { pension: 4.75, health: 3.595, care: 13.14, employment: 0.9 };

  // 날짜 포맷
  const payDate = new Date();
  payDate.setMonth(payDate.getMonth() + 1);
  payDate.setDate(10);
  const payDateStr = payDate.toISOString().slice(0, 10).replace(/-/g, '.');

  // 도넛 차트 데이터
  const grossChartData: DonutChartData[] = [
    { name: '기본급', value: gross_breakdown.base_salary.amount, color: CHART_COLORS.baseSalary },
    ...(gross_breakdown.weekly_holiday_pay.amount.amount > 0
      ? [{ name: '주휴수당', value: gross_breakdown.weekly_holiday_pay.amount.amount, color: CHART_COLORS.weeklyHoliday }]
      : []),
    ...(gross_breakdown.overtime_allowances.total.amount > 0
      ? [{ name: '연장/야간/휴일', value: gross_breakdown.overtime_allowances.total.amount, color: CHART_COLORS.overtime }]
      : []),
    ...((gross_breakdown.taxable_allowances.amount + gross_breakdown.non_taxable_allowances.amount) > 0
      ? [{ name: '기타수당', value: gross_breakdown.taxable_allowances.amount + gross_breakdown.non_taxable_allowances.amount, color: CHART_COLORS.allowance }]
      : []),
    ...(guaranteeAllowance && guaranteeAllowance.amount > 0
      ? [{ name: '계약보전수당', value: guaranteeAllowance.amount, color: CHART_COLORS.guarantee }]
      : []),
  ];

  const netVsDeductionData: DonutChartData[] = [
    { name: '실수령액', value: net_pay.amount, color: CHART_COLORS.netPay },
    { name: '공제합계', value: deductions_breakdown.total.amount, color: CHART_COLORS.deduction },
  ];

  return (
    <div className="space-y-4">
      <div id={CAPTURE_ID} className="space-y-4">
        {/* 페이지 헤딩 */}
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-between">
            <h2 className="text-gray-900 tracking-tight text-2xl sm:text-3xl font-bold leading-tight">
              {result.calculation_metadata.calculation_date.slice(0, 7).replace('-', '년 ')}월 급여 명세서
            </h2>
            <button
              className="hidden sm:flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
              onClick={() => window.print()}
            >
              <Icon name="print" className="text-[18px]" />
              Print
            </button>
          </div>
          <p className="text-gray-500 text-sm">계산 결과는 참고용이며 법적 효력을 갖지 않습니다.</p>
        </div>

        {/* Hero Stats Card - 실수령액 + 도넛 차트 */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 sm:p-8 shadow-sm text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6">
            {/* 실수령액 텍스트 */}
            <div className="text-left z-10 min-w-0 flex-1">
              <p className="text-blue-100 text-xs sm:text-sm font-medium uppercase tracking-wider mb-2 break-keep">
                이번 달 실수령액 (NET PAY)
              </p>
              <h2 className="text-[clamp(2.5rem,8vw,4.5rem)] leading-[0.95] font-bold tracking-tight mb-4 break-all sm:break-keep">
                {net_pay.formatted}
              </h2>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-blue-100">
                <span className="break-keep">{result.employee_name}</span>
                <span className="hidden sm:inline">|</span>
                <span className="break-keep">지급예정일: {payDateStr}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1 text-green-300 font-medium text-sm mt-2">
                <Icon name="verified" className="text-[16px]" />
                <span className="break-keep">2026년 법령 적용</span>
              </div>
            </div>

            {/* 실수령 vs 공제 도넛 차트 */}
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 w-full xl:w-auto xl:min-w-[260px] max-w-full self-center">
              <DonutChart
                data={netVsDeductionData}
                centerLabel="실수령"
                centerValue={`${((net_pay.amount / gross_breakdown.total.amount) * 100).toFixed(1)}%`}
                size="sm"
                darkMode
              />
            </div>
          </div>
        </div>

        {/* 시급기반 월급제: 적용 모드 배지 */}
        {appliedWageMode && (
          <div className={`rounded-lg p-4 flex items-center justify-between ${
            appliedWageMode === 'CONTRACT_SALARY'
              ? 'bg-gray-50 border border-gray-200'
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                appliedWageMode === 'CONTRACT_SALARY'
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-blue-200 text-blue-800'
              }`}>
                {appliedWageMode === 'CONTRACT_SALARY' ? '계약월급 적용' : '실제계산 적용'}
              </span>
              <span className="text-sm text-gray-600">
                {appliedWageMode === 'CONTRACT_SALARY'
                  ? '계약월급이 실제 계산액보다 높아 계약월급 기준으로 지급'
                  : '실제 계산액이 계약월급보다 높아 실제 계산 기준으로 지급'}
              </span>
            </div>
            {contractDiff && (
              <span className="text-sm font-medium text-gray-700">
                차액: {contractDiff.formatted}
              </span>
            )}
          </div>
        )}

        {/* Warning Banner */}
        {warnings && warnings.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex gap-3 items-start">
            <Icon name="warning" className="text-red-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <p className="text-red-800 text-sm font-bold">{warnings[0].level === 'critical' ? '최저임금 미달 경고' : '경고'}</p>
              <p className="text-red-700 text-sm leading-relaxed">{warnings[0].message}</p>
            </div>
          </div>
        )}

        {/* 지급 구성 차트 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Icon name="pie_chart" className="text-primary text-[20px]" />
            지급 구성
          </h3>
          <div className="flex justify-center">
            <DonutChart
              data={grossChartData}
              centerLabel="지급총액"
              centerValue={gross_breakdown.total.formatted}
              size="md"
            />
          </div>
        </div>

        {/* Accordion Sections */}
        <div className="flex flex-col gap-3">
          {/* 총 급여 내역 */}
          <AccordionSection
            icon="payments"
            iconBg="bg-blue-50"
            iconColor="text-primary"
            title="총 급여 내역 (Total Pay)"
            amount={gross_breakdown.total.formatted}
            defaultOpen={true}
          >
            <DetailRow
              label="기본급"
              sublabel="Base Pay"
              value={gross_breakdown.base_salary.formatted}
              formula={isHourlyWage
                ? `시급제: 통상시급 ${hourlyWage.toLocaleString()}원 × 월 근무시간`
                : `통상시급 = ${gross_breakdown.regular_wage.amount.toLocaleString()}원 ÷ 월소정근로시간 = ${hourlyWage.toLocaleString()}원/시간`}
            />
            {gross_breakdown.weekly_holiday_pay.amount.amount > 0 ? (
              <DetailRow
                label="주휴수당"
                sublabel="Weekly Holiday"
                value={gross_breakdown.weekly_holiday_pay.amount.formatted}
                formula={gross_breakdown.weekly_holiday_pay.is_proportional
                  ? `${hourlyWage.toLocaleString()}원 × (주근무시간/40) × 8시간 × 개근주 (비례계산)`
                  : `${hourlyWage.toLocaleString()}원 × 8시간 × 4.345주 = ${gross_breakdown.weekly_holiday_pay.amount.formatted}`}
              />
            ) : gross_breakdown.weekly_holiday_pay.calculation && (
              <DetailRow
                label="주휴수당"
                sublabel="Weekly Holiday"
                value="0원"
                formula={gross_breakdown.weekly_holiday_pay.calculation}
              />
            )}
            {gross_breakdown.overtime_allowances.overtime_pay.amount > 0 && (
              <DetailRow
                label="연장근로수당"
                sublabel="Overtime"
                value={gross_breakdown.overtime_allowances.overtime_pay.formatted}
                formula={`${hourlyWage.toLocaleString()}원 × 1.5배 × ${(gross_breakdown.overtime_allowances.overtime_hours.total_minutes / 60).toFixed(1)}시간`}
              />
            )}
            {gross_breakdown.overtime_allowances.night_pay.amount > 0 && (
              <DetailRow
                label="야간근로수당"
                sublabel="Night Work"
                value={gross_breakdown.overtime_allowances.night_pay.formatted}
                formula={`${hourlyWage.toLocaleString()}원 × 0.5배 × ${(gross_breakdown.overtime_allowances.night_hours.total_minutes / 60).toFixed(1)}시간 (22:00~06:00 가산분)`}
              />
            )}
            {gross_breakdown.overtime_allowances.holiday_pay.amount > 0 && (
              <DetailRow
                label="휴일근로수당"
                sublabel="Holiday Work"
                value={gross_breakdown.overtime_allowances.holiday_pay.formatted}
                formula={`${hourlyWage.toLocaleString()}원 × 1.5배 × ${(gross_breakdown.overtime_allowances.holiday_hours.total_minutes / 60).toFixed(1)}시간`}
              />
            )}
            {gross_breakdown.taxable_allowances.amount > 0 && (
              <DetailRow
                label="과세수당"
                sublabel="Taxable Allowance"
                value={gross_breakdown.taxable_allowances.formatted}
              />
            )}
            {gross_breakdown.non_taxable_allowances.amount > 0 && (
              <DetailRow
                label="비과세수당"
                sublabel="Non-taxable"
                value={gross_breakdown.non_taxable_allowances.formatted}
              />
            )}
            {guaranteeAllowance && guaranteeAllowance.amount > 0 && (
              <DetailRow
                label="계약보전수당"
                sublabel="Contract Guarantee"
                value={guaranteeAllowance.formatted}
                formula="계약월급 보장을 위한 차액 보전 (계약월급 - 실제계산액)"
              />
            )}
          </AccordionSection>

          {/* 공제 내역 */}
          <AccordionSection
            icon="remove_circle_outline"
            iconBg="bg-orange-50"
            iconColor="text-orange-600"
            title="공제 내역 (Deductions)"
            amount={`-${deductions_breakdown.total.formatted}`}
            amountColor="text-red-500"
          >
            <DetailRow
              label="국민연금"
              sublabel="National Pension"
              value={deductions_breakdown.insurance.national_pension.formatted}
              formula={`${taxableIncome.toLocaleString()}원 × ${RATES.pension}% = ${deductions_breakdown.insurance.national_pension.formatted}`}
            />
            <DetailRow
              label="건강보험"
              sublabel="Health Insurance"
              value={deductions_breakdown.insurance.health_insurance.formatted}
              formula={`${taxableIncome.toLocaleString()}원 × ${RATES.health}% = ${deductions_breakdown.insurance.health_insurance.formatted}`}
            />
            <DetailRow
              label="장기요양보험"
              sublabel="Care Insurance"
              value={deductions_breakdown.insurance.long_term_care.formatted}
              formula={`${deductions_breakdown.insurance.health_insurance.amount.toLocaleString()}원 × ${RATES.care}% = ${deductions_breakdown.insurance.long_term_care.formatted}`}
            />
            <DetailRow
              label="고용보험"
              sublabel="Employment Ins."
              value={deductions_breakdown.insurance.employment_insurance.formatted}
              formula={`${taxableIncome.toLocaleString()}원 × ${RATES.employment}% = ${deductions_breakdown.insurance.employment_insurance.formatted}`}
            />
            <DetailRow
              label="소득세"
              sublabel="Income Tax"
              value={deductions_breakdown.tax.income_tax.formatted}
              formula="간이세액표 기준 (과세소득, 부양가족 수 반영)"
            />
            <DetailRow
              label="지방소득세"
              sublabel="Local Tax"
              value={deductions_breakdown.tax.local_income_tax.formatted}
              formula={`${deductions_breakdown.tax.income_tax.amount.toLocaleString()}원 × 10% = ${deductions_breakdown.tax.local_income_tax.formatted}`}
            />
          </AccordionSection>

          {/* 계산 근거 */}
          <AccordionSection
            icon="calculate"
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            title="계산 근거 (Calculation Basis)"
          >
            <div className="pt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  통상시급 {isHourlyWage ? '(시급제)' : '계산'}
                </p>
                <div className="bg-blue-50 p-3 rounded text-sm text-blue-700 font-mono space-y-1">
                  {isHourlyWage ? (
                    <>
                      <p>시급제 직접 입력</p>
                      <p className="font-bold">통상시급 = {hourlyWage.toLocaleString()}원/시간</p>
                    </>
                  ) : (
                    <>
                      <p>통상시급 = 통상임금 ÷ 월 소정근로시간</p>
                      <p>= {gross_breakdown.regular_wage.amount.toLocaleString()}원 ÷ 월소정근로시간</p>
                      <p className="font-bold">= {hourlyWage.toLocaleString()}원/시간</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  4대보험 요율 ({result.calculation_metadata.insurance_year}년, 연금개혁 반영)
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 font-mono space-y-1">
                  <p>국민연금: {RATES.pension}% (상한 590만원, 하한 39만원)</p>
                  <p>건강보험: {RATES.health}%</p>
                  <p>장기요양: 건강보험료 × {RATES.care}%</p>
                  <p>고용보험: {RATES.employment}% (상한 1,350만원)</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  소득세 ({result.calculation_metadata.tax_year}년)
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 font-mono">
                  <p>간이세액표 적용</p>
                  <p>지방소득세: 소득세의 10%</p>
                </div>
              </div>
            </div>
          </AccordionSection>
        </div>

        {/* 법적 고지 */}
        <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500">
          <p className="font-medium mb-1">📋 법적 고지</p>
          <p>
            본 계산기는 참고용이며, 실제 급여 지급 시 노무사 또는 세무사와 상담하시기 바랍니다.
            계산 결과로 인한 법적 책임은 사용자에게 있습니다.
          </p>
        </div>

        {/* 워터마크 */}
        <div className="text-center text-xs text-gray-400 py-2">
          paytools.work - 한국 근로기준법 급여 계산기
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 sticky bottom-4 z-40">
        <ShareButtons
          url={typeof window !== 'undefined' ? window.location.href : 'https://paytools.work'}
          title={`${result.employee_name}님의 실수령액: ${net_pay.formatted}`}
          description="한국 근로기준법 급여 계산기로 정확한 실수령액을 확인하세요"
          captureTargetId={CAPTURE_ID}
          variant="stitch"
        />
      </div>

      {/* 문의 링크 */}
      <div className="text-center pb-4">
        <a
          href="/contact"
          className="text-sm text-gray-400 hover:text-primary underline decoration-dotted underline-offset-4"
        >
          계산에 문제가 있나요? 문의하기
        </a>
      </div>
    </div>
  );
}
