/**
 * 급여 계산 API 호출 커스텀 훅
 * 3분류 WageType 직접 전달 (isAutoHourlyMode 핵 제거)
 */
import { useCallback, useRef } from 'react';
import { salaryApi } from '../api';
import type { CalculatorState } from './useCalculatorState';
import type { WageType } from '../types/salary';

/** 하위 호환: MONTHLY→MONTHLY_FIXED, HOURLY→HOURLY_MONTHLY */
function normalizeWageType(wageType: WageType): WageType {
  if (wageType === 'MONTHLY') return 'MONTHLY_FIXED';
  if (wageType === 'HOURLY') return 'HOURLY_MONTHLY';
  return wageType;
}

/** 시급 기반 유형 여부 */
function isHourlyBased(wageType: WageType): boolean {
  const normalized = normalizeWageType(wageType);
  return normalized === 'HOURLY_MONTHLY' || normalized === 'HOURLY_BASED_MONTHLY';
}

/** 월급제 고정 여부 */
function isMonthlyFixed(wageType: WageType): boolean {
  return normalizeWageType(wageType) === 'MONTHLY_FIXED';
}

interface UseCalculationProps {
  input: CalculatorState['input'];
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  onLoadingChange: (loading: boolean) => void;
  clearAdjustedResult: () => void;
}

export function useCalculation({
  input,
  onSuccess,
  onError,
  onLoadingChange,
  clearAdjustedResult,
}: UseCalculationProps) {
  const lastRequestTimeRef = useRef<number>(0);
  const isCalculatingRef = useRef<boolean>(false);

  const calculate = useCallback(async () => {
    if (isCalculatingRef.current) return;

    const now = Date.now();
    if (now - lastRequestTimeRef.current < 1000) {
      onError('잠시 후 다시 시도해주세요. (쿨다운: 1초)');
      return;
    }

    isCalculatingRef.current = true;
    lastRequestTimeRef.current = now;
    onLoadingChange(true);
    onError('');
    clearAdjustedResult();

    try {
      const weeklyHours = input.employee.scheduled_work_days * input.employee.daily_work_hours;
      const effectiveWageType = normalizeWageType(input.wageType);

      // 보전수당 배분 항목을 allowances에 합류
      const guaranteeAllowances = input.guaranteeDistribution
        .filter((item) => item.amount > 0 && item.name)
        .map((item) => ({
          name: item.name,
          amount: item.amount,
          is_taxable: !item.isTaxFree,
          is_includable_in_minimum_wage: false,
          is_fixed: true,
          is_included_in_regular_wage: false,
        }));
      const allAllowances = [...input.allowances, ...guaranteeAllowances];

      // 정산 기간 내 시프트만 필터링
      const filteredShifts = input.workShifts.filter(
        (s) => s.date >= input.periodStart && s.date <= input.periodEnd
      );
      if (filteredShifts.length === 0 && input.workShifts.length > 0) {
        onError('선택한 정산 기간에 근무시프트가 없습니다.');
        return;
      }

      // 귀속월을 calculation_month로 전달 (설정값 우선)
      const effectiveMonth = input.attributionMonth || input.calculationMonth;

      const response = await salaryApi.calculateSalary({
        employee: input.employee,
        base_salary: isMonthlyFixed(input.wageType) ? input.baseSalary : 0,
        allowances: allAllowances,
        work_shifts: filteredShifts,
        wage_type: effectiveWageType,
        hourly_wage: isHourlyBased(input.wageType) ? input.hourlyWage : 0,
        calculation_month: effectiveMonth,
        absence_policy: input.absencePolicy,
        hours_mode: input.hoursMode,
        insurance_options: input.insuranceOptions,
        weekly_hours: weeklyHours,
        inclusive_wage_options:
          isMonthlyFixed(input.wageType) ? input.inclusiveWageOptions : undefined,
        contract_monthly_salary:
          effectiveWageType === 'HOURLY_BASED_MONTHLY'
            ? input.contractMonthlySalary
            : undefined,
      });

      onSuccess(response);

      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'calculate_salary', {
          event_category: 'engagement',
          employment_type: input.employee.employment_type,
          wage_type: effectiveWageType,
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('429') || err.message.includes('Too Many Requests')) {
          onError('요청이 너무 많습니다. 1분 후 다시 시도해주세요.');
        } else {
          onError(err.message);
        }
      } else {
        onError('계산 중 오류가 발생했습니다.');
      }
    } finally {
      onLoadingChange(false);
      isCalculatingRef.current = false;
    }
  }, [input, onSuccess, onError, onLoadingChange, clearAdjustedResult]);

  return { calculate };
}
