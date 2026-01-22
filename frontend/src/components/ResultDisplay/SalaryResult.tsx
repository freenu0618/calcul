/**
 * 급여 계산 결과 메인 컴포넌트
 * 도넛 차트로 지급/공제 비율 시각화
 */

import type { SalaryCalculationResponse } from '../../types/salary';
import WarningAlert from './WarningAlert';
import GrossBreakdown from './GrossBreakdown';
import DeductionsBreakdown from './DeductionsBreakdown';
import { ShareButtons } from '../common/ShareButtons';
import { DonutChart, type DonutChartData } from '../charts';

interface SalaryResultProps {
    result: SalaryCalculationResponse;
}

// 차트 색상 팔레트
const CHART_COLORS = {
    baseSalary: '#3b82f6',      // blue-500 (기본급)
    weeklyHoliday: '#10b981',   // emerald-500 (주휴수당)
    overtime: '#8b5cf6',        // violet-500 (연장수당)
    allowance: '#06b6d4',       // cyan-500 (기타수당)
    deduction: '#ef4444',       // red-500 (공제)
    netPay: '#22c55e',          // green-500 (실수령)
};

export default function SalaryResult({ result }: SalaryResultProps) {
    const { gross_breakdown, deductions_breakdown, net_pay } = result;

    // 지급 항목 차트 데이터
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
    ];

    // 실수령 vs 공제 차트 데이터
    const netVsDeductionData: DonutChartData[] = [
        { name: '실수령액', value: net_pay.amount, color: CHART_COLORS.netPay },
        { name: '공제합계', value: deductions_breakdown.total.amount, color: CHART_COLORS.deduction },
    ];

    return (
        <div className="space-y-4">
            {/* 경고 메시지 */}
            <WarningAlert warnings={result.warnings} />

            {/* 실수령액 강조 + 도넛 차트 */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    {/* 실수령액 텍스트 */}
                    <div className="text-center lg:text-left">
                        <p className="text-blue-100 text-sm mb-1">실수령액</p>
                        <p className="text-4xl font-bold">{net_pay.formatted}</p>
                        <p className="text-blue-200 text-xs mt-2">
                            {result.employee_name} | {result.calculation_metadata.calculation_date}
                        </p>
                    </div>

                    {/* 실수령 vs 공제 도넛 차트 */}
                    <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                        <DonutChart
                            data={netVsDeductionData}
                            centerLabel="실수령"
                            centerValue={`${((net_pay.amount / gross_breakdown.total.amount) * 100).toFixed(1)}%`}
                            size="sm"
                        />
                    </div>
                </div>
            </div>

            {/* 지급 구성 차트 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">지급 구성</h3>
                <div className="flex justify-center">
                    <DonutChart
                        data={grossChartData}
                        centerLabel="지급총액"
                        centerValue={gross_breakdown.total.formatted}
                        size="md"
                    />
                </div>
            </div>

            {/* 지급/공제 breakdown */}
            <div className="grid md:grid-cols-2 gap-4">
                <GrossBreakdown breakdown={gross_breakdown} />
                <DeductionsBreakdown breakdown={deductions_breakdown} />
            </div>

            {/* 법적 고지 */}
            <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500">
                <p className="font-medium mb-1">⚠️ 법적 고지</p>
                <p>
                    본 계산기는 참고용이며, 실제 급여 지급 시 노무사 또는 세무사와 상담하시기 바랍니다.
                    계산 결과로 인한 법적 책임은 사용자에게 있습니다.
                </p>
                <p className="mt-1 text-gray-400">
                    적용 기준: {result.calculation_metadata.tax_year}년 세법, {result.calculation_metadata.insurance_year}년 보험요율
                </p>
            </div>

            {/* SNS 공유 버튼 */}
            <ShareButtons
                url={typeof window !== 'undefined' ? window.location.href : 'https://paytools.work'}
                title={`${result.employee_name}님의 실수령액: ${net_pay.formatted}`}
                description="한국 근로기준법 급여 계산기로 정확한 실수령액을 확인하세요"
            />
        </div>
    );
}
