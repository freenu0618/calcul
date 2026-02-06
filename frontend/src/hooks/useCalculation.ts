/**
 * 급여 계산 API 호출 커스텀 훅
 * handleCalculate 로직 분리 → useCallback 의존성 문제 해결
 */
import { useCallback } from 'react';
import { salaryApi } from '../api';
import type { CalculatorState } from './useCalculatorState';

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
  const calculate = useCallback(async () => {
    onLoadingChange(true);
    onError('');
    clearAdjustedResult();

    try {
      // 주 근무시간 계산
      const weeklyHours = input.employee.scheduled_work_days * input.employee.daily_work_hours;

      // 시급 기반 자동 계산 모드 감지
      const isAutoHourlyMode = input.wageType === 'MONTHLY' && input.hourlyWage > 0;
      const effectiveWageType = isAutoHourlyMode ? 'HOURLY' : input.wageType;

      const response = await salaryApi.calculateSalary({
        employee: input.employee,
        base_salary: effectiveWageType === 'MONTHLY' ? input.baseSalary : 0,
        allowances: input.allowances,
        work_shifts: input.workShifts,
        wage_type: effectiveWageType,
        hourly_wage: effectiveWageType === 'HOURLY' ? input.hourlyWage : 0,
        calculation_month: input.calculationMonth,
        absence_policy: input.absencePolicy,
        hours_mode: input.hoursMode,
        insurance_options: input.insuranceOptions,
        weekly_hours: weeklyHours,
        inclusive_wage_options:
          input.wageType === 'MONTHLY' ? input.inclusiveWageOptions : undefined,
      });

      onSuccess(response);

      // Google Analytics 이벤트
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'calculate_salary', {
          event_category: 'engagement',
          employment_type: input.employee.employment_type,
        });
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : '계산 중 오류가 발생했습니다.');
    } finally {
      onLoadingChange(false);
    }
  }, [input, onSuccess, onError, onLoadingChange, clearAdjustedResult]);

  return { calculate };
}
