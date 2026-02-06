/**
 * 시급기반 월급제(HOURLY_BASED_MONTHLY) 전용 자동 계산 패널
 * 시급 + 계약월급 입력 → 법정 구성 분해
 */
import { useState, useEffect } from 'react';
import type { Allowance } from '../../types/models';
import type { HoursMode } from '../../types/salary';

interface HourlyAutoCalcProps {
  hourlyWage: number;
  onHourlyWageChange: (wage: number) => void;
  contractMonthlySalary: number;
  onContractMonthlySalaryChange: (salary: number) => void;
  onBaseSalaryChange: (salary: number) => void;
  scheduledWorkDays: number;
  dailyWorkHours: number;
  hoursMode: HoursMode;
  allowances: Allowance[];
  onAllowancesChange: (allowances: Allowance[]) => void;
  onOtherAllowanceChange?: (amount: number) => void;
}

const WEEKS_PER_MONTH = 4.345;
const MIN_WAGE_2026 = 10320;

const fmt = (v: number): string => (v === 0 ? '' : v.toLocaleString('ko-KR'));
const parse = (v: string): number => parseInt(v.replace(/,/g, ''), 10) || 0;
const fmtMoney = (v: number) => v.toLocaleString('ko-KR') + '원';

export default function HourlyAutoCalc({
  hourlyWage: hourlyWageProp,
  onHourlyWageChange,
  contractMonthlySalary,
  onContractMonthlySalaryChange,
  onBaseSalaryChange,
  scheduledWorkDays,
  dailyWorkHours,
  hoursMode,
  allowances,
  onAllowancesChange,
  onOtherAllowanceChange,
}: HourlyAutoCalcProps) {
  const [hourlyWage, setHourlyWage] = useState(hourlyWageProp || MIN_WAGE_2026);
  const weeklyHours = scheduledWorkDays * dailyWorkHours;
  const calcMode = hoursMode === '209' ? 'included' : 'separated';

  const [autoCalc, setAutoCalc] = useState({
    baseSalary: 0,
    weeklyHolidayPay: 0,
    overtimeAddition: 0,
    legalMinimum: 0,
    otherAllowance: 0,
    isValid: true,
  });

  useEffect(() => {
    const capped = Math.min(weeklyHours, 40);
    const weeklyHolidayHours = (capped / 40) * 8;
    const monthlyHours =
      calcMode === 'included'
        ? Math.round((capped + weeklyHolidayHours) * WEEKS_PER_MONTH)
        : Math.round(capped * WEEKS_PER_MONTH);
    const calculatedBase = Math.round(hourlyWage * monthlyHours);
    const weeklyHolidayPay = Math.round(
      weeklyHolidayHours * hourlyWage * WEEKS_PER_MONTH
    );
    const overtimeHours = Math.max(0, weeklyHours - 40);
    const overtimeAddition = Math.round(
      hourlyWage * 0.5 * overtimeHours * WEEKS_PER_MONTH
    );
    const legalMinimum = calculatedBase + weeklyHolidayPay + overtimeAddition;
    const otherAllowance = contractMonthlySalary - legalMinimum;

    setAutoCalc({
      baseSalary: calculatedBase,
      weeklyHolidayPay,
      overtimeAddition,
      legalMinimum,
      otherAllowance,
      isValid: otherAllowance >= 0,
    });

    onBaseSalaryChange(calculatedBase);
    onHourlyWageChange(hourlyWage);
    onOtherAllowanceChange?.(Math.max(0, otherAllowance));

    // 임의수당 자동 배치
    const idx = allowances.findIndex((a) => a.name === '직무수당(임의)');
    if (otherAllowance > 0) {
      const item: Allowance = {
        name: '직무수당(임의)',
        amount: otherAllowance,
        is_taxable: true,
        is_includable_in_minimum_wage: false,
        is_fixed: true,
        is_included_in_regular_wage: false,
      };
      if (idx >= 0) {
        const updated = [...allowances];
        updated[idx] = item;
        onAllowancesChange(updated);
      } else {
        onAllowancesChange([...allowances, item]);
      }
    } else if (idx >= 0) {
      onAllowancesChange(allowances.filter((_, i) => i !== idx));
    }
  }, [calcMode, hourlyWage, weeklyHours, contractMonthlySalary]);

  const capped = Math.min(weeklyHours, 40);
  const dispMonthly =
    calcMode === 'included'
      ? Math.round((capped + (capped / 40) * 8) * WEEKS_PER_MONTH)
      : Math.round(capped * WEEKS_PER_MONTH);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">시급</label>
          <input
            type="text"
            inputMode="numeric"
            value={fmt(hourlyWage)}
            onChange={(e) => setHourlyWage(parse(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="10,320"
          />
          <p className="mt-1 text-xs text-gray-500">
            2026년 최저시급: {fmt(MIN_WAGE_2026)}원
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            계약 월급
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={fmt(contractMonthlySalary)}
            onChange={(e) => onContractMonthlySalaryChange(parse(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="2,800,000"
          />
        </div>
      </div>

      {/* 법정 구성 분해 */}
      <div
        className={`p-4 rounded-lg border ${autoCalc.isValid ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}
      >
        <p className="text-sm font-semibold mb-2">법정 구성 분해 ({dispMonthly}시간)</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">기본급 (시급 x {dispMonthly}시간):</span>
            <span className="font-medium">{fmtMoney(autoCalc.baseSalary)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">주휴수당:</span>
            <span className="font-medium">{fmtMoney(autoCalc.weeklyHolidayPay)}</span>
          </div>
          {autoCalc.overtimeAddition > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">연장 가산분:</span>
              <span className="font-medium">{fmtMoney(autoCalc.overtimeAddition)}</span>
            </div>
          )}
          <div className="border-t border-gray-300 pt-1 mt-1" />
          <div className="flex justify-between font-semibold">
            <span>법정 최소선:</span>
            <span className="text-blue-700">{fmtMoney(autoCalc.legalMinimum)}</span>
          </div>
          <div className="border-t border-gray-300 pt-1 mt-1" />
          <div className="flex justify-between">
            <span className="text-gray-600">직무수당 (임의배치):</span>
            <span
              className={`font-bold ${autoCalc.otherAllowance < 0 ? 'text-red-600' : 'text-green-600'}`}
            >
              {fmtMoney(autoCalc.otherAllowance)}
            </span>
          </div>
        </div>
        {!autoCalc.isValid && (
          <p className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
            계약월급 &lt; 법정 최소선. 계약 월급을 올리거나 근무시간을 줄이세요.
          </p>
        )}
      </div>
    </div>
  );
}
