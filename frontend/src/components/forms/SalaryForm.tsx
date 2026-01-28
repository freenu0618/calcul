/**
 * 기본급 및 수당 입력 폼 컴포넌트
 * 시급 기반 자동 계산 모드 지원
 */

import { useState, useEffect } from 'react';
import type { Allowance } from '../../types/models';
import type { WageType, AbsencePolicy, HoursMode } from '../../types/salary';
import Button from '../common/Button';
import Tooltip from '../common/Tooltip';

interface SalaryFormProps {
  baseSalary: number;
  allowances: Allowance[];
  onBaseSalaryChange: (value: number) => void;
  onAllowancesChange: (allowances: Allowance[]) => void;
  scheduledWorkDays?: number;
  dailyWorkHours?: number;
  wageType: WageType;
  onWageTypeChange: (type: WageType) => void;
  hourlyWage: number;
  onHourlyWageChange: (wage: number) => void;
  absencePolicy: AbsencePolicy;
  onAbsencePolicyChange: (policy: AbsencePolicy) => void;
  hoursMode: HoursMode;
  onHoursModeChange: (mode: HoursMode) => void;
}

// 상수
const WEEKS_PER_MONTH = 4.345;       // 365 ÷ 7 ÷ 12
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
  scheduledWorkDays = 5,
  dailyWorkHours = 8,
  wageType,
  onWageTypeChange,
  hourlyWage: hourlyWageProp,
  onHourlyWageChange,
  absencePolicy,
  onAbsencePolicyChange,
  hoursMode,
  onHoursModeChange,
}: SalaryFormProps) {
  // 입력 모드: 'direct' | 'hourly'
  const [inputMode, setInputMode] = useState<'direct' | 'hourly'>('direct');

  // 급여 구성 방식: hoursMode prop과 동기화
  const calcMode = hoursMode === '209' ? 'included' : 'separated';
  const setCalcMode = (mode: 'included' | 'separated') => {
    onHoursModeChange(mode === 'included' ? '209' : '174');
  };

  // 시급 기반 입력
  const [hourlyWage, setHourlyWage] = useState(MIN_WAGE_2026);
  // 주 근무시간: 소정근로일 × 일 근무시간
  const defaultWeeklyHours = scheduledWorkDays * dailyWorkHours;
  const [weeklyHours, setWeeklyHours] = useState(defaultWeeklyHours);
  const [contractSalary, setContractSalary] = useState(2800000);

  // 소정근로일/일근무시간 변경 시 주 근무시간 자동 업데이트
  useEffect(() => {
    if (inputMode === 'hourly') {
      setWeeklyHours(scheduledWorkDays * dailyWorkHours);
    }
  }, [scheduledWorkDays, dailyWorkHours, inputMode]);

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
      const capped = Math.min(weeklyHours, 40);
      const weeklyHolidayHours = capped / 40 * 8; // 비례 주휴시간
      let calculatedBaseSalary: number;
      let weeklyHolidayPay: number;

      if (calcMode === 'included') {
        // 209방식: 기본급에 주휴수당 포함
        const monthlyHours = Math.round((capped + weeklyHolidayHours) * WEEKS_PER_MONTH);
        calculatedBaseSalary = Math.round(hourlyWage * monthlyHours);
        weeklyHolidayPay = Math.round(weeklyHolidayHours * hourlyWage * WEEKS_PER_MONTH);
      } else {
        // 174방식: 기본급과 주휴수당 분리
        const monthlyHours = Math.round(capped * WEEKS_PER_MONTH);
        calculatedBaseSalary = Math.round(hourlyWage * monthlyHours);
        weeklyHolidayPay = Math.round(weeklyHolidayHours * hourlyWage * WEEKS_PER_MONTH);
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

      {/* 급여 형태 선택 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm font-medium text-gray-700">급여 형태</p>
          <Tooltip
            content={
              <div className="space-y-2">
                <p><strong>월급제:</strong> 고정 월급 기반. 기본급을 직접 입력하거나 시급 기반으로 자동 계산할 수 있습니다.</p>
                <p><strong>시급제:</strong> 시급 × 실제 근무시간으로 계산. 시프트 입력 기반으로 정확한 급여를 산출합니다.</p>
                <p className="text-gray-300 text-xs mt-1">※ 계약총액 역산은 월급제 → 시급 기반 자동 계산에서 사용 가능</p>
              </div>
            }
            position="right"
            maxWidth={350}
          >
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs text-gray-500 bg-gray-200 rounded-full cursor-help hover:bg-gray-300 transition-colors">
              ?
            </span>
          </Tooltip>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={wageType === 'MONTHLY'}
              onChange={() => onWageTypeChange('MONTHLY')}
              className="mr-2"
            />
            월급제
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={wageType === 'HOURLY'}
              onChange={() => onWageTypeChange('HOURLY')}
              className="mr-2"
            />
            시급제
          </label>
        </div>
      </div>

      {/* 시급제: 시급 입력 */}
      {wageType === 'HOURLY' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">시급</label>
          <input
            type="text"
            inputMode="numeric"
            value={formatWithComma(hourlyWageProp)}
            onChange={(e) => onHourlyWageChange(parseNumber(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="10,320"
          />
          <p className="mt-1 text-xs text-gray-500">2026년 최저시급: {formatWithComma(MIN_WAGE_2026)}원</p>
        </div>
      )}

      {/* 월급제: 입력 방식 선택 */}
      {wageType === 'MONTHLY' && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-medium text-gray-700">기본급 입력 방식</p>
            <Tooltip
              content={
                <div className="space-y-2">
                  <p><strong>직접 입력:</strong> 기본급을 원하는 금액으로 직접 입력합니다.</p>
                  <p><strong>시급 기반 자동 계산:</strong> 시급과 계약 월급을 입력하면 기본급, 주휴수당, 법정 최소선을 자동 계산합니다.</p>
                  <p className="text-yellow-300 text-xs">💡 계약총액 역산: 계약 월급에서 법정 구성분을 제외한 잔여 금액을 수당으로 배분할 수 있습니다.</p>
                </div>
              }
              position="right"
              maxWidth={350}
            >
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs text-gray-500 bg-gray-200 rounded-full cursor-help hover:bg-gray-300 transition-colors">
                ?
              </span>
            </Tooltip>
          </div>
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
              시급 기반 자동 계산 (계약총액 역산)
            </label>
          </div>
        </div>
      )}

      {/* 통상시급 계산 방식 (월급제 공통) */}
      {wageType === 'MONTHLY' && (
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-semibold text-gray-800">통상시급 계산 기준</p>
            <Tooltip
              content={
                <div className="space-y-2">
                  <p><strong>174시간 (주휴 분리):</strong> 기본급과 주휴수당을 분리 표시. 급여명세서 작성에 적합합니다.</p>
                  <p><strong>209시간 (주휴 포함):</strong> 기본급에 주휴수당이 포함된 방식. 최저임금 월 환산 기준입니다.</p>
                  <p className="text-gray-300 text-xs mt-1">※ 어떤 방식을 선택해도 총 급여액은 동일합니다.</p>
                </div>
              }
              position="right"
              maxWidth={350}
            >
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs text-gray-500 bg-indigo-200 rounded-full cursor-help hover:bg-indigo-300 transition-colors">
                ?
              </span>
            </Tooltip>
          </div>
          <div className="flex gap-4 mb-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                checked={calcMode === 'separated'}
                onChange={() => setCalcMode('separated')}
                className="mr-2"
              />
              <span className="text-sm">174시간 방식 (주휴 분리)</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                checked={calcMode === 'included'}
                onChange={() => setCalcMode('included')}
                className="mr-2"
              />
              <span className="text-sm">209시간 방식 (주휴 포함)</span>
            </label>
          </div>
          {(() => {
            const wh = scheduledWorkDays * dailyWorkHours;
            const capped = Math.min(wh, 40);
            const monthlyHours = calcMode === 'included'
              ? Math.round((capped + capped / 40 * 8) * 4.345)
              : Math.round(capped * 4.345);
            return (
              <p className="text-xs text-indigo-700">
                주 {wh}시간 → 월 소정근로시간: <strong>{monthlyHours}시간</strong>
                {baseSalary > 0 && inputMode === 'direct' && (
                  <span className="ml-2">
                    (통상시급 ≈ {formatMoney(Math.round(baseSalary / monthlyHours))})
                  </span>
                )}
              </p>
            );
          })()}
        </div>
      )}

      {/* 직접 입력 모드 (월급제) */}
      {wageType === 'MONTHLY' && inputMode === 'direct' && (
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

      {/* 시급 기반 모드 (월급제) */}
      {wageType === 'MONTHLY' && inputMode === 'hourly' && (
        <div className="space-y-4">
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
            {(() => {
              const capped = Math.min(weeklyHours, 40);
              const dispMonthly = calcMode === 'included'
                ? Math.round((capped + capped / 40 * 8) * WEEKS_PER_MONTH)
                : Math.round(capped * WEEKS_PER_MONTH);
              return (
                <>
            <p className="text-sm font-semibold mb-2">
              📊 법정 구성 분해 ({dispMonthly}시간 방식)
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  기본급 (시급 × {dispMonthly}시간)
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
                ℹ️ {dispMonthly}시간 = {Math.round(capped * WEEKS_PER_MONTH)}시간(실근로) + {dispMonthly - Math.round(capped * WEEKS_PER_MONTH)}시간(주휴). 기본급에 주휴수당이 포함되어 있습니다.
              </p>
            )}
            {calcMode === 'separated' && (
              <p className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                ℹ️ {dispMonthly}시간 방식은 기본급과 주휴수당을 분리 표시합니다. 급여명세서 작성에 적합합니다.
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
              </>
              );
            })()}
          </div>
        </div>
      )}

      {/* 결근 공제 정책 (월급제 전용) */}
      {wageType === 'MONTHLY' && (
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <p className="text-sm font-semibold text-gray-800 mb-3">결근 공제 정책</p>
          <div className="space-y-2">
            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                checked={absencePolicy === 'STRICT'}
                onChange={() => onAbsencePolicyChange('STRICT')}
                className="mt-1 mr-3"
              />
              <div>
                <span className="font-medium text-sm">엄격 (STRICT)</span>
                <p className="text-xs text-gray-500">결근일 일급 공제 + 해당 주 주휴수당 미지급</p>
              </div>
            </label>
            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                checked={absencePolicy === 'MODERATE'}
                onChange={() => onAbsencePolicyChange('MODERATE')}
                className="mt-1 mr-3"
              />
              <div>
                <span className="font-medium text-sm">보통 (MODERATE)</span>
                <p className="text-xs text-gray-500">해당 주 주휴수당만 미지급 (일급 미공제)</p>
              </div>
            </label>
            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                checked={absencePolicy === 'LENIENT'}
                onChange={() => onAbsencePolicyChange('LENIENT')}
                className="mt-1 mr-3"
              />
              <div>
                <span className="font-medium text-sm">관대 (LENIENT)</span>
                <p className="text-xs text-gray-500">공제 없음 (사정 참작)</p>
              </div>
            </label>
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

