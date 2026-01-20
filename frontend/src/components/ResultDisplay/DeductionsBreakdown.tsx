/**
 * 공제 내역 상세 컴포넌트
 * 4대 보험 + 세금 표시
 */

import type { DeductionsBreakdown as DeductionsType } from '../../types/salary';

interface DeductionsBreakdownProps {
    breakdown: DeductionsType;
}

export default function DeductionsBreakdown({ breakdown }: DeductionsBreakdownProps) {
    const { insurance, tax } = breakdown;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                공제 내역
            </h4>

            <div className="space-y-3 text-sm">
                {/* 4대 보험 */}
                <div className="text-gray-500 text-xs font-medium">4대 보험</div>

                <div className="flex justify-between pl-2">
                    <span className="text-gray-600">국민연금 (4.5%)</span>
                    <span className="font-medium">{insurance.national_pension.formatted}</span>
                </div>

                <div className="flex justify-between pl-2">
                    <span className="text-gray-600">건강보험 (3.595%)</span>
                    <span className="font-medium">{insurance.health_insurance.formatted}</span>
                </div>

                <div className="flex justify-between pl-2">
                    <span className="text-gray-600">장기요양보험</span>
                    <span className="font-medium">{insurance.long_term_care.formatted}</span>
                </div>

                <div className="flex justify-between pl-2">
                    <span className="text-gray-600">고용보험 (0.9%)</span>
                    <span className="font-medium">{insurance.employment_insurance.formatted}</span>
                </div>

                <div className="flex justify-between pl-2 text-gray-700">
                    <span>보험료 소계</span>
                    <span>{insurance.total.formatted}</span>
                </div>

                {/* 세금 */}
                <div className="text-gray-500 text-xs font-medium pt-2">세금</div>

                <div className="flex justify-between pl-2">
                    <span className="text-gray-600">소득세 (간이세액표)</span>
                    <span className="font-medium">{tax.income_tax.formatted}</span>
                </div>

                <div className="flex justify-between pl-2">
                    <span className="text-gray-600">지방소득세 (10%)</span>
                    <span className="font-medium">{tax.local_income_tax.formatted}</span>
                </div>

                <div className="flex justify-between pl-2 text-gray-700">
                    <span>세금 소계</span>
                    <span>{tax.total.formatted}</span>
                </div>

                {/* 총 공제액 */}
                <div className="flex justify-between pt-3 border-t border-gray-200 font-semibold text-base">
                    <span>총 공제액</span>
                    <span className="text-red-600">{breakdown.total.formatted}</span>
                </div>
            </div>
        </div>
    );
}
