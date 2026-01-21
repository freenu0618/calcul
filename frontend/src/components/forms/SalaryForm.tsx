/**
 * 기본급 및 수당 입력 폼 컴포넌트
 * 시급 기반 자동 계산 모드 지원
 */

import { useState, useEffect } from 'react';
import type { Allowance } from '../../types/models';
import Button from '../common/Button';

interface SalaryFormProps {
  baseSalary: number;
  allowances: Allowance[];
  onBaseSalaryChange: (value: number) => void;
  onAllowancesChange: (allowances: Allowance[]) => void;
}

// 상수
const WEEKS_PER_MONTH = 4.345;       // 365 ÷ 7 ÷ 12
const MONTHLY_HOURS_209 = 209;       // 최저임금 월 환산 (주40 + 주휴8 포함)
const MONTHLY_HOURS_174 = 174;       // 실근로시간 (주휴 제외)
const MIN_WAGE_2026 = 10320;         // 2026년 최저시급

// 콤마 포맷팅 함수
const formatWithComma = (value: number): string => {
  if (value === 0) return '';
  return value.toLocaleString('ko-KR');
};

const parseNumber = (value: string): number => {
  return parseInt(value.replace(/,/g, ''), 10) || 0;
};

export default function SalaryForm({
  baseSalary,
  allowances,
  onBaseSalaryChange,
  onAllowancesChange,
}: SalaryFormProps) {
  // 입력 모드: 'direct' | 'hourly'
  const [inputMode, setInputMode] = useState<'direct' | 'hourly'>('direct');

  // 급여 구성 방식: 'included' (209시간, 주휴 포함) | 'separated' (174시간, 주휴 분리)
  const [calcMode, setCalcMode] = useState<'included' | 'separated'>('included');

  // 시급 기반 입력
  const [hourlyWage, setHourlyWage] = useState(MIN_WAGE_2026);
  const [weeklyHours, setWeeklyHours] = useState(40);
  const [contractSalary, setContractSalary] = useState(2800000);

  // 자동 계산 결과
  const [autoCalc, setAutoCalc] = useState({
    baseSalary: 0,
    weeklyHolidayPay: 0,
    overtimeAddition: 0, // 연장 가산분(0.5배)
    legalMinimum: 0,     // 법정 최소선
    otherAllowance: 0,   // 임의수당
    isValid: true,
  });

  // 시급 기반 자동 계산
  useEffect(() => {
    if (inputMode === 'hourly') {
      let calculatedBaseSalary: number;
      let weeklyHolidayPay: number;

      if (calcMode === 'included') {
        // 209시간 방식: 기본급에 주휴수당 포함
        calculatedBaseSalary = Math.round(hourlyWage * MONTHLY_HOURS_209);
        weeklyHolidayPay = Math.round(8 * hourlyWage * WEEKS_PER_MONTH); // 참고용 표시
      } else {
        // 174시간 방식: 기본급과 주휴수당 분리
        calculatedBaseSalary = Math.round(hourlyWage * MONTHLY_HOURS_174);
        weeklyHolidayPay = Math.round(8 * hourlyWage * WEEKS_PER_MONTH);
      }

      // 연장 가산분 (0.5배만) = 시급 × 0.5 × 연장시간 × 4.345
      const overtimeHours = Math.max(0, weeklyHours - 40);
      const overtimeAddition = Math.round(hourlyWage * 0.5 * overtimeHours * WEEKS_PER_MONTH);

      // 법정 최소선 계산 (두 방식 모두 총액은 동일해야 함)
      const legalMinimum = calcMode === 'included'
        ? calculatedBaseSalary + weeklyHolidayPay + overtimeAddition
        : calculatedBaseSalary + weeklyHolidayPay + overtimeAddition;

      // 임의수당 = 계약급여 - 법정합계
      const otherAllowance = contractSalary - legalMinimum;
      const isValid = otherAllowance >= 0;

      setAutoCalc({
        baseSalary: calculatedBaseSalary,
        weeklyHolidayPay,
        overtimeAddition,
        legalMinimum,
        otherAllowance,
        isValid,
      });

      // 기본급 업데이트
      onBaseSalaryChange(calculatedBaseSalary);

      // 임의수당이 양수면 수당에 추가
      if (otherAllowance > 0) {
        updateOtherAllowance(otherAllowance);
      } else {
        removeOtherAllowance();
      }
    }
  }, [inputMode, calcMode, hourlyWage, weeklyHours, contractSalary]);

  // 기타수당 자동 업데이트
  const updateOtherAllowance = (amount: number) => {
    const existingIndex = allowances.findIndex(a => a.name === '직무수당(임의)');

    const otherAllowance: Allowance = {
      name: '직무수당(임의)',
      amount: amount,
      is_taxable: true,
      is_includable_in_minimum_wage: false, // 최저임금 미산입
      is_fixed: true,
      is_included_in_regular_wage: false,
    };

    if (existingIndex >= 0) {
      const updated = [...allowances];
      updated[existingIndex] = otherAllowance;
      onAllowancesChange(updated);
    } else {
      onAllowancesChange([...allowances, otherAllowance]);
    }
  };

  // 기타수당 삭제
  const removeOtherAllowance = () => {
    const existingIndex = allowances.findIndex(a => a.name === '직무수당(임의)');
    if (existingIndex >= 0) {
      onAllowancesChange(allowances.filter((_, i) => i !== existingIndex));
    }
  };

  const addAllowance = () => {
    const newAllowance: Allowance = {
      name: '',
      amount: 0,
      is_taxable: true,
      is_includable_in_minimum_wage: true,
      is_fixed: true,
      is_included_in_regular_wage: true,
    };
    onAllowancesChange([...allowances, newAllowance]);
  };

  const updateAllowance = (index: number, field: keyof Allowance, value: string | number | boolean) => {
    const updated = [...allowances];
    updated[index] = { ...updated[index], [field]: value };
    onAllowancesChange(updated);
  };

  const removeAllowance = (index: number) => {
    onAllowancesChange(allowances.filter((_, i) => i !== index));
  };

  const formatMoney = (amount: number) =>
    amount.toLocaleString('ko-KR') + '원';

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">기본급 및 수당</h3>

      {/* 입력 방식 선택 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-2">급여 입력 방식</p>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={inputMode === 'direct'}
              onChange={() => setInputMode('direct')}
              className="mr-2"
            />
            기본급 직접 입력
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={inputMode === 'hourly'}
              onChange={() => setInputMode('hourly')}
              className="mr-2"
            />
            시급 기반 자동 계산
          </label>
        </div>
      </div>

      {/* 직접 입력 모드 */}
      {inputMode === 'direct' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">기본급 (월)</label>
          <input
            type="text"
            inputMode="numeric"
            value={formatWithComma(baseSalary)}
            onChange={(e) => onBaseSalaryChange(parseNumber(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="2,500,000"
            required
          />
        </div>
      )}

      {/* 시급 기반 모드 */}
      {inputMode === 'hourly' && (
        <div className="space-y-4">
          {/* 급여 구성 방식 선택 */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm font-semibold text-gray-800 mb-3">📋 급여 구성 방식</p>
            <div className="space-y-2">
              <label className="flex items-start cursor-pointer">
                <input
                  type="radio"
                  checked={calcMode === 'included'}
                  onChange={() => setCalcMode('included')}
                  className="mt-1 mr-3"
                />
                <div>
                  <span className="font-medium">기본급에 주휴수당 포함 (209시간)</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    최저임금 계산기와 동일한 방식. 기본급 하나로 간단히 표시됩니다.
                  </p>
                </div>
              </label>
              <label className="flex items-start cursor-pointer">
                <input
                  type="radio"
                  checked={calcMode === 'separated'}
                  onChange={() => setCalcMode('separated')}
                  className="mt-1 mr-3"
                />
                <div>
                  <span className="font-medium">기본급과 주휴수당 분리 (174시간)</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    급여명세서 작성용. 기본급(실근로)과 주휴수당을 별도로 표시합니다.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시급</label>
              <input
                type="text"
                inputMode="numeric"
                value={formatWithComma(hourlyWage)}
                onChange={(e) => setHourlyWage(parseNumber(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10,320"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">주 근무시간</label>
              <input
                type="number"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(parseInt(e.target.value) || 0)}
                min={1}
                max={84}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">계약 월급</label>
              <input
                type="text"
                inputMode="numeric"
                value={formatWithComma(contractSalary)}
                onChange={(e) => setContractSalary(parseNumber(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2,800,000"
              />
            </div>
          </div>

          {/* 자동 계산 결과 */}
          <div className={`p-4 rounded-lg border ${autoCalc.isValid ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
            <p className="text-sm font-semibold mb-2">
              📊 법정 구성 분해 ({calcMode === 'included' ? '209시간 방식' : '174시간 방식'})
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  기본급 (시급 × {calcMode === 'included' ? '209' : '174'}시간)
                  {calcMode === 'included' && <span className="text-xs ml-1">(주휴 포함)</span>}:
                </span>
                <span className="font-medium">{formatMoney(autoCalc.baseSalary)}</span>
              </div>
              {calcMode === 'separated' ? (
                <div className="flex justify-between">
                  <span className="text-gray-600">주휴수당 (8h × 시급 × 4.345주):</span>
                  <span className="font-medium">{formatMoney(autoCalc.weeklyHolidayPay)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-gray-400 text-xs">
                  <span>└ 주휴수당 (참고: 기본급에 포함됨):</span>
                  <span>{formatMoney(autoCalc.weeklyHolidayPay)}</span>
                </div>
              )}
              {autoCalc.overtimeAddition > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">연장 가산분 (0.5배 × {weeklyHours - 40}h):</span>
                  <span className="font-medium">{formatMoney(autoCalc.overtimeAddition)}</span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-1 mt-1"></div>
              <div className="flex justify-between font-semibold">
                <span>법정 최소선:</span>
                <span className="text-blue-700">{formatMoney(autoCalc.legalMinimum)}</span>
              </div>
              <div className="border-t border-gray-300 pt-1 mt-1"></div>
              <div className="flex justify-between">
                <span className="text-gray-600">직무수당 (임의배치 가능):</span>
                <span className={`font-bold ${autoCalc.otherAllowance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatMoney(autoCalc.otherAllowance)}
                  {autoCalc.otherAllowance < 0 && ' ❌'}
                </span>
              </div>
            </div>
            {calcMode === 'included' && (
              <p className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                ℹ️ 209시간 = 174시간(실근로) + 35시간(주휴). 기본급에 주휴수당이 포함되어 있습니다.
              </p>
            )}
            {calcMode === 'separated' && (
              <p className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                ℹ️ 174시간 방식은 기본급과 주휴수당을 분리 표시합니다. 급여명세서 작성에 적합합니다.
              </p>
            )}
            {!autoCalc.isValid && (
              <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                ❌ 목표 월급 &lt; 법정 최소선. 구조적으로 불가능합니다.
                <br />→ 계약 월급을 올리거나 근무시간을 줄이세요.
              </div>
            )}
            {autoCalc.isValid && autoCalc.otherAllowance > 0 && (
              <p className="mt-2 text-xs text-green-700">
                ✅ 직무수당 {formatMoney(autoCalc.otherAllowance)}을 자유롭게 배치할 수 있습니다.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 수당 목록 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-medium text-gray-800">수당 목록</h4>
          <Button variant="secondary" onClick={addAllowance} type="button">
            + 수당 추가
          </Button>
        </div>

        {allowances.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            수당이 없습니다.
          </p>
        ) : (
          <div className="space-y-4">
            {allowances.map((allowance, index) => (
              <div key={index} className={`border rounded-md p-4 ${allowance.name === '직무수당(임의)' ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'
                }`}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">수당 이름</label>
                    <input
                      type="text"
                      value={allowance.name}
                      onChange={(e) => updateAllowance(index, 'name', e.target.value)}
                      placeholder="직책수당"
                      disabled={allowance.name === '기타수당(차액)'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">금액</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatWithComma(allowance.amount)}
                      onChange={(e) => updateAllowance(index, 'amount', parseNumber(e.target.value))}
                      placeholder="300,000"
                      disabled={allowance.name === '기타수당(차액)'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={allowance.is_taxable}
                      onChange={(e) => updateAllowance(index, 'is_taxable', e.target.checked)}
                      className="mr-2"
                      disabled={allowance.name === '기타수당(차액)'}
                    />
                    과세 대상
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={allowance.is_included_in_regular_wage}
                      onChange={(e) => updateAllowance(index, 'is_included_in_regular_wage', e.target.checked)}
                      className="mr-2"
                    />
                    통상임금 포함
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={allowance.is_includable_in_minimum_wage}
                      onChange={(e) => updateAllowance(index, 'is_includable_in_minimum_wage', e.target.checked)}
                      className="mr-2"
                    />
                    최저임금 산입
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={allowance.is_fixed}
                      onChange={(e) => updateAllowance(index, 'is_fixed', e.target.checked)}
                      className="mr-2"
                    />
                    고정 지급
                  </label>
                </div>

                {allowance.name !== '기타수당(차액)' && (
                  <div className="mt-3">
                    <Button
                      variant="secondary"
                      onClick={() => removeAllowance(index)}
                      type="button"
                      className="text-sm text-red-600 hover:bg-red-50"
                    >
                      삭제
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

