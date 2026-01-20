/**
 * 급여 계산 결과 메인 컴포넌트
 */

import type { SalaryCalculationResponse } from '../../types/salary';
import WarningAlert from './WarningAlert';
import GrossBreakdown from './GrossBreakdown';
import DeductionsBreakdown from './DeductionsBreakdown';

interface SalaryResultProps {
    result: SalaryCalculationResponse;
}

export default function SalaryResult({ result }: SalaryResultProps) {
    return (
        <div className="space-y-4">
            {/* 경고 메시지 */}
            <WarningAlert warnings={result.warnings} />

            {/* 실수령액 강조 */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                <div className="text-center">
                    <p className="text-blue-100 text-sm mb-1">실수령액</p>
                    <p className="text-4xl font-bold">{result.net_pay.formatted}</p>
                    <p className="text-blue-200 text-xs mt-2">
                        {result.employee_name} | {result.calculation_metadata.calculation_date}
                    </p>
                </div>
            </div>

            {/* 지급/공제 breakdown */}
            <div className="grid md:grid-cols-2 gap-4">
                <GrossBreakdown breakdown={result.gross_breakdown} />
                <DeductionsBreakdown breakdown={result.deductions_breakdown} />
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
        </div>
    );
}
