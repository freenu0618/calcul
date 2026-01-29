/**
 * 지급 내역 상세 컴포넌트
 * 기본급, 수당, 연장/야간/휴일수당, 주휴수당 + 계산식 Accordion
 */

import type { GrossBreakdown as GrossBreakdownType } from '../../types/salary';
import Accordion from '../common/Accordion';

interface GrossBreakdownProps {
    breakdown: GrossBreakdownType;
}

export default function GrossBreakdown({ breakdown }: GrossBreakdownProps) {
    const { overtime_allowances, weekly_holiday_pay } = breakdown;
    const hourlyWage = breakdown.hourly_wage.amount;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                지급 내역
            </h4>

            <div className="space-y-3 text-sm">
                {/* 기본급 Accordion */}
                <Accordion
                    title="기본급 (Base Pay)"
                    badge={breakdown.base_salary.formatted}
                    icon={<span>💵</span>}
                    defaultOpen
                >
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">기본급</span>
                            <span className="font-medium">{breakdown.base_salary.formatted}</span>
                        </div>
                        <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
                            <p className="font-medium text-gray-600 mb-1">📐 통상시급</p>
                            <p className="text-blue-600 font-medium text-sm">
                                통상시급 = {breakdown.regular_wage.amount.toLocaleString()}원 ÷ {Math.round(breakdown.regular_wage.amount / hourlyWage)}시간 = {breakdown.hourly_wage.formatted}/시간
                            </p>
                        </div>
                    </div>
                </Accordion>

                {/* 과세 수당 */}
                {breakdown.taxable_allowances.amount > 0 && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">과세 수당</span>
                        <span className="font-medium">{breakdown.taxable_allowances.formatted}</span>
                    </div>
                )}

                {/* 비과세 수당 */}
                {breakdown.non_taxable_allowances.amount > 0 && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">비과세 수당</span>
                        <span className="font-medium">{breakdown.non_taxable_allowances.formatted}</span>
                    </div>
                )}

                {/* 가산수당 Accordion */}
                {overtime_allowances.total.amount > 0 && (
                    <Accordion
                        title="가산수당 상세"
                        badge={overtime_allowances.total.formatted}
                        icon={<span>⏰</span>}
                    >
                        <div className="space-y-3 text-sm">
                            {/* 연장근로수당 */}
                            {overtime_allowances.overtime_hours.total_minutes > 0 && (
                                <div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            연장근로수당 ({overtime_allowances.overtime_hours.formatted})
                                        </span>
                                        <span className="font-medium">{overtime_allowances.overtime_pay.formatted}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 bg-gray-50 p-2 rounded">
                                        계산식: {hourlyWage.toLocaleString()}원 × 1.5 × {(overtime_allowances.overtime_hours.total_minutes / 60).toFixed(1)}시간
                                    </div>
                                </div>
                            )}

                            {/* 야간근로수당 */}
                            {overtime_allowances.night_hours.total_minutes > 0 && (
                                <div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            야간근로수당 ({overtime_allowances.night_hours.formatted})
                                        </span>
                                        <span className="font-medium">{overtime_allowances.night_pay.formatted}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 bg-gray-50 p-2 rounded">
                                        계산식: {hourlyWage.toLocaleString()}원 × 0.5 × {(overtime_allowances.night_hours.total_minutes / 60).toFixed(1)}시간 (22:00~06:00 가산분)
                                    </div>
                                </div>
                            )}

                            {/* 휴일근로수당 */}
                            {overtime_allowances.holiday_hours.total_minutes > 0 && (
                                <div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            휴일근로수당 ({overtime_allowances.holiday_hours.formatted})
                                        </span>
                                        <span className="font-medium">{overtime_allowances.holiday_pay.formatted}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 bg-gray-50 p-2 rounded">
                                        계산식: {hourlyWage.toLocaleString()}원 × 1.5 × {(overtime_allowances.holiday_hours.total_minutes / 60).toFixed(1)}시간
                                    </div>
                                </div>
                            )}
                        </div>
                    </Accordion>
                )}

                {/* 주휴수당 Accordion */}
                {weekly_holiday_pay.amount.amount > 0 && (
                    <Accordion
                        title={`주휴수당 (Holiday Work)${weekly_holiday_pay.is_proportional ? ' - 비례' : ''}`}
                        badge={weekly_holiday_pay.amount.formatted}
                        icon={<span>🗓️</span>}
                    >
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">주휴수당</span>
                                <span className="font-medium">{weekly_holiday_pay.amount.formatted}</span>
                            </div>
                            <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
                                <p className="font-medium text-gray-600 mb-1">📐 주휴수당 계산</p>
                                <p className="text-blue-600 font-medium">
                                    {weekly_holiday_pay.calculation}
                                </p>
                                <p className="mt-2 text-gray-500 text-xs">
                                    = 1일 평균 근로시간 × 통상시급 × 4.345주
                                </p>
                            </div>
                            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                ℹ️ 주 15시간 이상 근무 + 소정근로일 개근 시 지급
                                {weekly_holiday_pay.is_proportional && (
                                    <span className="block mt-1 text-amber-600">
                                        ⚠️ 단시간 근로자: 주 소정근로시간 비례 적용
                                    </span>
                                )}
                            </div>
                        </div>
                    </Accordion>
                )}

                {/* 총 지급액 */}
                <div className="flex justify-between pt-3 border-t border-gray-200 font-semibold text-base">
                    <span>총 지급액</span>
                    <span className="text-blue-600">{breakdown.total.formatted}</span>
                </div>
            </div>
        </div>
    );
}
