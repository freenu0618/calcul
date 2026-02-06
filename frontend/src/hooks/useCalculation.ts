/**
 * 급여 계산 API 호출 커스텀 훅
 * handleCalculate 로직 분리 → useCallback 의존성 문제 해결
 *
 * 개선사항:
 * - 중복 요청 방지 (429 에러 해결)
 * - 1초 쿨다운 적용
 */
import { useCallback, useRef } from 'react';
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
  // 마지막 요청 시간 추적 (중복 요청 방지)
  const lastRequestTimeRef = useRef<number>(0);
  const isCalculatingRef = useRef<boolean>(false);

  const calculate = useCallback(async () => {
    // 중복 요청 방지: 이미 계산 중이면 무시
    if (isCalculatingRef.current) {
      console.warn('이미 계산 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    // 쿨다운 체크: 마지막 요청 후 1초 이내면 무시 (429 에러 방지)
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    if (timeSinceLastRequest < 1000) {
      console.warn('너무 빠른 요청입니다. 1초 후 다시 시도해주세요.');
      onError('잠시 후 다시 시도해주세요. (쿨다운: 1초)');
      return;
    }

    isCalculatingRef.current = true;
    lastRequestTimeRef.current = now;
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
      // 429 에러 처리
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
