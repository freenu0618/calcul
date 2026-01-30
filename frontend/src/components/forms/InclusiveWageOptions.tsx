/**
 * 포괄임금제 옵션 컴포넌트
 * Phase 3.6.3: 연장수당 고정금액 + 월 예정 연장시간
 */

import { useState, useEffect } from 'react';
import type { InclusiveWageOptions as InclusiveWageOptionsType } from '../../types/salary';
import Tooltip from '../common/Tooltip';

interface InclusiveWageOptionsProps {
  options: InclusiveWageOptionsType;
  onChange: (options: InclusiveWageOptionsType) => void;
  baseSalary: number; // 기본급 (최저임금 검증용)
  monthlyHours: number; // 월 소정근로시간
}

const MIN_WAGE_2026 = 10320;
const formatMoney = (n: number) => n.toLocaleString('ko-KR') + '원';

export default function InclusiveWageOptions({
  options,
  onChange,
  baseSalary,
  monthlyHours,
}: InclusiveWageOptionsProps) {
  const [validation, setValidation] = useState<{
    isValid: boolean;
    effectiveHourlyRate: number;
    message: string | null;
  }>({ isValid: true, effectiveHourlyRate: 0, message: null });

  // 최저임금 위반 검증
  useEffect(() => {
    if (!options.enabled || options.fixed_overtime_hourly_rate <= 0) {
      setValidation({ isValid: true, effectiveHourlyRate: 0, message: null });
      return;
    }

    const fixedOvertimePay = options.fixed_overtime_hourly_rate * options.monthly_expected_overtime_hours;
    const totalPay = baseSalary + fixedOvertimePay;
    const totalHours = monthlyHours + options.monthly_expected_overtime_hours;

    const effectiveHourlyRate = totalHours > 0 ? Math.round(totalPay / totalHours) : 0;
    const isValid = effectiveHourlyRate >= MIN_WAGE_2026;

    setValidation({
      isValid,
      effectiveHourlyRate,
      message: isValid ? null : `환산시급 ${formatMoney(effectiveHourlyRate)} < 최저시급 ${formatMoney(MIN_WAGE_2026)}`,
    });
  }, [options, baseSalary, monthlyHours]);

  const handleChange = (field: keyof InclusiveWageOptionsType, value: boolean | number) => {
    onChange({ ...options, [field]: value });
  };

  const monthlyFixedPay = options.fixed_overtime_hourly_rate * options.monthly_expected_overtime_hours;

  return (
    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
            />
            <span className="text-sm font-semibold text-gray-800">포괄임금제 적용</span>
          </label>
          <Tooltip
            content={
              <div className="space-y-2">
                <p><strong>포괄임금제:</strong> 연장/야간/휴일근로 수당을 고정 금액으로 지급하는 방식입니다.</p>
                <p className="text-yellow-300">주의: 고정 수당이 실제 초과근로에 비해 부족하면 최저임금 위반이 될 수 있습니다.</p>
                <p className="text-gray-300 text-xs">실제 연장근로가 예정 시간을 초과하면 차액을 지급해야 합니다.</p>
              </div>
            }
            position="right"
            maxWidth={350}
          >
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs text-gray-500 bg-amber-200 rounded-full cursor-help hover:bg-amber-300">
              ?
            </span>
          </Tooltip>
        </div>
      </div>

      {options.enabled && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연장수당 시간당 금액
              </label>
              <input
                type="number"
                value={options.fixed_overtime_hourly_rate || ''}
                onChange={(e) => handleChange('fixed_overtime_hourly_rate', parseInt(e.target.value) || 0)}
                placeholder="10500"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                예: 10,500원/시간
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                월 예정 연장시간
              </label>
              <input
                type="number"
                value={options.monthly_expected_overtime_hours || ''}
                onChange={(e) => handleChange('monthly_expected_overtime_hours', Math.min(52, parseInt(e.target.value) || 0))}
                placeholder="20"
                min="0"
                max="52"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                계약서상 예정 연장시간 (최대 52시간)
              </p>
            </div>
          </div>

          {/* 계산 결과 */}
          {options.fixed_overtime_hourly_rate > 0 && options.monthly_expected_overtime_hours > 0 && (
            <div className={`p-3 rounded-lg ${validation.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">월 고정 연장수당:</span>
                  <span className="font-medium">
                    {formatMoney(options.fixed_overtime_hourly_rate)} × {options.monthly_expected_overtime_hours}h = {formatMoney(monthlyFixedPay)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">환산 시급:</span>
                  <span className={`font-medium ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    ({formatMoney(baseSalary)} + {formatMoney(monthlyFixedPay)}) ÷ ({monthlyHours} + {options.monthly_expected_overtime_hours})h = {formatMoney(validation.effectiveHourlyRate)}
                  </span>
                </div>
              </div>
              {!validation.isValid && (
                <p className="mt-2 text-xs text-red-700 font-medium">
                  ⚠️ 최저임금 위반 위험: {validation.message}
                </p>
              )}
              {validation.isValid && (
                <p className="mt-2 text-xs text-green-700">
                  ✓ 환산 시급이 최저임금 이상입니다
                </p>
              )}
            </div>
          )}

          <p className="text-xs text-amber-700 bg-amber-100 p-2 rounded">
            ⚠️ 포괄임금제는 실제 연장근로가 예정 시간을 초과하면 차액을 지급해야 합니다.
            또한 최저임금 위반 시 노동청 신고 가능 사항입니다.
          </p>
        </div>
      )}
    </div>
  );
}
