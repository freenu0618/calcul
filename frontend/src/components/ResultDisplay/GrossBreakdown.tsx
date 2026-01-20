/**
 * 지급 내역 상세 컴포넌트
 * 기본급, 수당, 연장/야간/휴일수당, 주휴수당 표시
 */

import type { GrossBreakdown as GrossBreakdownType } from '../../types/salary';

interface GrossBreakdownProps {
    breakdown: GrossBreakdownType;
}

export default function GrossBreakdown({ breakdown }: GrossBreakdownProps) {
    const { overtime_allowances, weekly_holiday_pay } = breakdown;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                지급 내역
            </h4>

            <div className="space-y-3 text-sm">
                {/* 기본급 */}
                <div className="flex justify-between">
                    <span className="text-gray-600">기본급</span>
                    <span className="font-medium">{breakdown.base_salary.formatted}</span>
                </div>

                {/* 통상시급 (참고용) */}
                <div className="flex justify-between text-gray-500 text-xs">
                    <span>└ 통상시급</span>
                    <span>{breakdown.hourly_wage.formatted}/시간</span>
                </div>

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

                {/* 연장근로수당 */}
                {overtime_allowances.overtime_hours.total_minutes > 0 && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">
                            연장근로수당 ({overtime_allowances.overtime_hours.formatted})
                        </span>
                        <span className="font-medium">{overtime_allowances.overtime_pay.formatted}</span>
                    </div>
                )}

                {/* 야간근로수당 */}
                {overtime_allowances.night_hours.total_minutes > 0 && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">
                            야간근로수당 ({overtime_allowances.night_hours.formatted})
                        </span>
                        <span className="font-medium">{overtime_allowances.night_pay.formatted}</span>
                    </div>
                )}

                {/* 휴일근로수당 */}
                {overtime_allowances.holiday_hours.total_minutes > 0 && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">
                            휴일근로수당 ({overtime_allowances.holiday_hours.formatted})
                        </span>
                        <span className="font-medium">{overtime_allowances.holiday_pay.formatted}</span>
                    </div>
                )}

                {/* 주휴수당 */}
                {weekly_holiday_pay.amount.amount > 0 && (
                    <>
                        <div className="flex justify-between">
                            <span className="text-gray-600">
                                주휴수당 {weekly_holiday_pay.is_proportional && '(비례)'}
                            </span>
                            <span className="font-medium">{weekly_holiday_pay.amount.formatted}</span>
                        </div>
                        <div className="text-gray-500 text-xs pl-3">
                            {weekly_holiday_pay.calculation}
                        </div>
                    </>
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
