/**
 * 기본급 및 수당 입력 폼 컴포넌트
 * 3분류 WageType: MONTHLY_FIXED / HOURLY_MONTHLY / HOURLY_BASED_MONTHLY
 */
import type { Allowance } from '../../types/models';
import type { WageType, AbsencePolicy, HoursMode } from '../../types/salary';
import WageTypeSelector from './WageTypeSelector';
import AllowanceList from './AllowanceList';
import HourlyAutoCalc from './HourlyAutoCalc';
import HoursModeSelector from './HoursModeSelector';
import AbsencePolicySelector from './AbsencePolicySelector';

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
  contractMonthlySalary: number;
  onContractMonthlySalaryChange: (value: number) => void;
}

const fmt = (v: number): string => (v === 0 ? '' : v.toLocaleString('ko-KR'));
const parse = (v: string): number => parseInt(v.replace(/,/g, ''), 10) || 0;

/** 정규화: MONTHLY→MONTHLY_FIXED, HOURLY→HOURLY_MONTHLY */
function normalize(wt: WageType): WageType {
  if (wt === 'MONTHLY') return 'MONTHLY_FIXED';
  if (wt === 'HOURLY') return 'HOURLY_MONTHLY';
  return wt;
}

export default function SalaryForm({
  baseSalary,
  allowances,
  onBaseSalaryChange,
  onAllowancesChange,
  scheduledWorkDays = 5,
  dailyWorkHours = 8,
  wageType,
  onWageTypeChange,
  hourlyWage,
  onHourlyWageChange,
  absencePolicy,
  onAbsencePolicyChange,
  hoursMode,
  onHoursModeChange,
  contractMonthlySalary,
  onContractMonthlySalaryChange,
}: SalaryFormProps) {
  const normalized = normalize(wageType);
  const isMonthly = normalized === 'MONTHLY_FIXED';
  const isHourlyMonthly = normalized === 'HOURLY_MONTHLY';
  const isHourlyBased = normalized === 'HOURLY_BASED_MONTHLY';

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">기본급 및 수당</h3>

      {/* 급여 형태 3분류 선택 */}
      <WageTypeSelector wageType={wageType} onWageTypeChange={onWageTypeChange} />

      {/* 시급 입력 (시급제 월정산) */}
      {isHourlyMonthly && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">시급</label>
          <input
            type="text"
            inputMode="numeric"
            value={fmt(hourlyWage)}
            onChange={(e) => onHourlyWageChange(parse(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="10,320"
          />
          <p className="mt-1 text-xs text-gray-500">
            2026년 최저시급: {fmt(10320)}원
          </p>
        </div>
      )}

      {/* 시급기반 월급제: 시급 + 계약월급 + 법정 분해 */}
      {isHourlyBased && (
        <HourlyAutoCalc
          hourlyWage={hourlyWage}
          onHourlyWageChange={onHourlyWageChange}
          contractMonthlySalary={contractMonthlySalary}
          onContractMonthlySalaryChange={onContractMonthlySalaryChange}
          onBaseSalaryChange={onBaseSalaryChange}
          scheduledWorkDays={scheduledWorkDays}
          dailyWorkHours={dailyWorkHours}
          hoursMode={hoursMode}
          allowances={allowances}
          onAllowancesChange={onAllowancesChange}
        />
      )}

      {/* 통상시급 계산 기준 (월급제 전용) */}
      {isMonthly && (
        <HoursModeSelector
          hoursMode={hoursMode}
          onHoursModeChange={onHoursModeChange}
          scheduledWorkDays={scheduledWorkDays}
          dailyWorkHours={dailyWorkHours}
          baseSalary={baseSalary}
        />
      )}

      {/* 기본급 직접 입력 (월급제 고정) */}
      {isMonthly && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            기본급 (월)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={fmt(baseSalary)}
            onChange={(e) => onBaseSalaryChange(parse(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="2,500,000"
            required
          />
        </div>
      )}

      {/* 결근 공제 정책 (월급제 전용) */}
      {isMonthly && (
        <AbsencePolicySelector
          absencePolicy={absencePolicy}
          onAbsencePolicyChange={onAbsencePolicyChange}
        />
      )}

      {/* 수당 목록 */}
      <AllowanceList
        allowances={allowances}
        onAllowancesChange={onAllowancesChange}
      />
    </div>
  );
}

