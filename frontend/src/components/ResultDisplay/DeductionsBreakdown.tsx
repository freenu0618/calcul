/**
 * 공제 내역 상세 컴포넌트
 * 4대 보험 + 세금 + 계산식 Accordion
 */

import type { DeductionsBreakdown as DeductionsType } from '../../types/salary';
import Accordion from '../common/Accordion';

interface DeductionsBreakdownProps {
    breakdown: DeductionsType;
    taxableIncome?: number; // 과세소득 (계산식 표시용)
}

// 2026년 4대 보험 요율 (연금개혁 반영)
const RATES = {
    pension: 4.75,      // 2026년 인상 (기존 4.5%)
    health: 3.595,
    care: 13.14,        // 2026년 인상 (기존 12.95%)
    employment: 0.9,
};

export default function DeductionsBreakdown({ breakdown, taxableIncome }: DeductionsBreakdownProps) {
    const { insurance, tax } = breakdown;

    // 역산으로 과세소득 추정 (국민연금 기준)
    const estimatedTaxable = taxableIncome || Math.round(insurance.national_pension.amount / (RATES.pension / 100));

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                공제 내역
            </h4>

            <div className="space-y-3 text-sm">
                {/* 4대 보험 Accordion */}
                <Accordion
                    title="4대 보험"
                    badge={insurance.total.formatted}
                    icon={<span>🏥</span>}
                    defaultOpen
                >
                    <div className="space-y-3">
                        {/* 국민연금 */}
                        <div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">국민연금 ({RATES.pension}%)</span>
                                <span className="font-medium">{insurance.national_pension.formatted}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1 bg-gray-50 p-2 rounded">
                                <p>{estimatedTaxable.toLocaleString()}원 × {RATES.pension}% = {insurance.national_pension.formatted}</p>
                                <p className="text-gray-500 mt-1">(상한 590만원, 하한 39만원 적용)</p>
                            </div>
                        </div>

                        {/* 건강보험 */}
                        <div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">건강보험 ({RATES.health}%)</span>
                                <span className="font-medium">{insurance.health_insurance.formatted}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1 bg-gray-50 p-2 rounded">
                                {estimatedTaxable.toLocaleString()}원 × {RATES.health}% = {insurance.health_insurance.formatted}
                            </div>
                        </div>

                        {/* 장기요양보험 */}
                        <div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">장기요양보험 ({RATES.care}%)</span>
                                <span className="font-medium">{insurance.long_term_care.formatted}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1 bg-gray-50 p-2 rounded">
                                {insurance.health_insurance.amount.toLocaleString()}원 × {RATES.care}% = {insurance.long_term_care.formatted}
                            </div>
                        </div>

                        {/* 고용보험 */}
                        <div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">고용보험 ({RATES.employment}%)</span>
                                <span className="font-medium">{insurance.employment_insurance.formatted}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1 bg-gray-50 p-2 rounded">
                                <p>{estimatedTaxable.toLocaleString()}원 × {RATES.employment}% = {insurance.employment_insurance.formatted}</p>
                                <p className="text-gray-500 mt-1">(상한 1,350만원 적용)</p>
                            </div>
                        </div>

                        <div className="flex justify-between pt-2 border-t text-gray-700">
                            <span>보험료 소계</span>
                            <span className="font-medium">{insurance.total.formatted}</span>
                        </div>
                    </div>
                </Accordion>

                {/* 세금 Accordion */}
                <Accordion
                    title="세금"
                    badge={tax.total.formatted}
                    icon={<span>📋</span>}
                    defaultOpen
                >
                    <div className="space-y-3">
                        {/* 소득세 */}
                        <div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">소득세</span>
                                <span className="font-medium">{tax.income_tax.formatted}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1 bg-gray-50 p-2 rounded">
                                <p>간이세액표 기준 조회 결과</p>
                                <p className="text-gray-500 mt-1">(과세소득, 부양가족 수에 따라 결정)</p>
                            </div>
                        </div>

                        {/* 지방소득세 */}
                        <div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">지방소득세</span>
                                <span className="font-medium">{tax.local_income_tax.formatted}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1 bg-gray-50 p-2 rounded">
                                {tax.income_tax.amount.toLocaleString()}원 × 10% = {tax.local_income_tax.formatted}
                            </div>
                        </div>

                        <div className="flex justify-between pt-2 border-t text-gray-700">
                            <span>세금 소계</span>
                            <span className="font-medium">{tax.total.formatted}</span>
                        </div>
                    </div>
                </Accordion>

                {/* 총 공제액 */}
                <div className="flex justify-between pt-3 border-t border-gray-200 font-semibold text-base">
                    <span>총 공제액</span>
                    <span className="text-red-600">{breakdown.total.formatted}</span>
                </div>
            </div>
        </div>
    );
}
