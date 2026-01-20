/**
 * 기본급 및 수당 입력 폼 컴포넌트
 * 시급 기반 자동 계산 모드 지원
 */

import { useState, useEffect } from 'react';
import type { Allowance } from '../../types/models';
import Input from '../common/Input';
import Button from '../common/Button';

interface SalaryFormProps {
  baseSalary: number;
  allowances: Allowance[];
  onBaseSalaryChange: (value: number) => void;
  onAllowancesChange: (allowances: Allowance[]) => void;
}

// 상수 (GPT 역산 로직 기준)
const WEEKS_PER_MONTH = 4.345; // 365 ÷ 7 ÷ 12
const MIN_WAGE_HOURS = 209;    // 최저임금 월 환산 기준 (주40 + 주휴8)
const MIN_WAGE_2026 = 10320;   // 2026년 최저시급

export default function SalaryForm({
  baseSalary,
  allowances,
  onBaseSalaryChange,
  onAllowancesChange,
}: SalaryFormProps) {
  // 입력 모드: 'direct' | 'hourly' | 'reverse'
  const [inputMode, setInputMode] = useState<'direct' | 'hourly' | 'reverse'>('direct');

  // 시급 기반 입력
  const [hourlyWage, setHourlyWage] = useState(MIN_WAGE_2026);
  const [weeklyHours, setWeeklyHours] = useState(48); // 주6일 48시간
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

  // 시급 기반 자동 계산 (GPT 역산 로직)
  useEffect(() => {
    if (inputMode === 'hourly' || inputMode === 'reverse') {
      // Step 1. 기본급 = 최저시급 × 209시간
      const calculatedBaseSalary = Math.round(hourlyWage * MIN_WAGE_HOURS);

      // Step 2. 주휴수당 = 8시간 × 시급 × 4.345주
      const weeklyHolidayPay = Math.round(8 * hourlyWage * WEEKS_PER_MONTH);

      // Step 3. 연장 가산분 (0.5배만) = 시급 × 0.5 × 연장시간 × 4.345
      const overtimeHours = Math.max(0, weeklyHours - 40);
      const overtimeAddition = Math.round(hourlyWage * 0.5 * overtimeHours * WEEKS_PER_MONTH);

      // Step 4. 법정 최소선 합계
      const legalMinimum = calculatedBaseSalary + weeklyHolidayPay + overtimeAddition;

      // Step 5. 임의수당 = 계약급여 - 법정합계
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
  }, [inputMode, hourlyWage, weeklyHours, contractSalary]);

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
        <Input
          type="number"
          label="기본급 (월)"
          value={baseSalary}
          onChange={(e) => onBaseSalaryChange(parseInt(e.target.value) || 0)}
          min={0}
          placeholder="2500000"
          required
        />
      )}

      {/* 시급 기반 모드 */}
      {inputMode === 'hourly' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Input
              type="number"
              label="시급"
              value={hourlyWage}
              onChange={(e) => setHourlyWage(parseInt(e.target.value) || 0)}
              min={0}
            />
            <Input
              type="number"
              label="주 근무시간"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(parseInt(e.target.value) || 0)}
              min={1}
              max={84}
            />
            <Input
              type="number"
              label="계약 월급"
              value={contractSalary}
              onChange={(e) => setContractSalary(parseInt(e.target.value) || 0)}
              min={0}
            />
          </div>

          {/* 자동 계산 결과 (GPT 역산 로직) */}
          <div className={`p-4 rounded-lg border ${autoCalc.isValid ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
            <p className="text-sm font-semibold mb-2">📊 법정 구성 분해 (GPT 역산 로직)</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">기본급 (시급 × 209시간):</span>
                <span className="font-medium">{formatMoney(autoCalc.baseSalary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">주휴수당 (8h × 시급 × 4.345주):</span>
                <span className="font-medium">{formatMoney(autoCalc.weeklyHolidayPay)}</span>
              </div>
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
                  <Input
                    type="text"
                    label="수당 이름"
                    value={allowance.name}
                    onChange={(e) => updateAllowance(index, 'name', e.target.value)}
                    placeholder="직책수당"
                    disabled={allowance.name === '기타수당(차액)'}
                  />
                  <Input
                    type="number"
                    label="금액"
                    value={allowance.amount}
                    onChange={(e) => updateAllowance(index, 'amount', parseInt(e.target.value) || 0)}
                    min={0}
                    placeholder="300000"
                    disabled={allowance.name === '기타수당(차액)'}
                  />
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

