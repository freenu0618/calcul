/**
 * 급여대장 저장 커스텀 훅
 * 급여대장 관련 로직 분리
 */
import { useCallback } from 'react';
import { payrollApi } from '../api';
import type { SalaryCalculationResponse, WorkShiftRequest } from '../types/salary';

interface UsePayrollSaveProps {
  selectedPeriodId: string;
  selectedEmployeeId: string;
  result: SalaryCalculationResponse | null;
  workShifts: WorkShiftRequest[];
  onSaveStatusChange: (status: 'idle' | 'saving' | 'success' | 'error') => void;
  onSaveError: (error: string) => void;
}

export function usePayrollSave({
  selectedPeriodId,
  selectedEmployeeId,
  result,
  workShifts,
  onSaveStatusChange,
  onSaveError,
}: UsePayrollSaveProps) {
  // 시프트에서 근무 분 계산
  const calcMinutes = useCallback((shift: WorkShiftRequest) => {
    const [sh, sm] = shift.start_time.split(':').map(Number);
    const [eh, em] = shift.end_time.split(':').map(Number);
    return Math.max(0, (eh * 60 + em) - (sh * 60 + sm) - shift.break_minutes);
  }, []);

  const saveToPayroll = useCallback(async () => {
    if (!selectedPeriodId || !selectedEmployeeId || !result) return;

    onSaveStatusChange('saving');
    onSaveError('');

    try {
      const totalMins = workShifts.reduce((sum, s) => sum + calcMinutes(s), 0);
      const holidayMins = workShifts
        .filter((s) => s.is_holiday_work)
        .reduce((sum, s) => sum + calcMinutes(s), 0);

      await payrollApi.addEntry(Number(selectedPeriodId), {
        employee_id: selectedEmployeeId,
        base_salary: result.gross_breakdown.base_salary.amount,
        total_work_minutes: totalMins,
        overtime_minutes: result.work_summary?.overtime_hours?.total_minutes || 0,
        night_minutes: result.work_summary?.night_hours?.total_minutes || 0,
        holiday_minutes: holidayMins,
        total_gross: result.gross_breakdown.total.amount,
        net_pay: result.net_pay.amount,
        total_deductions: result.deductions_breakdown.total.amount,
        overtime_pay: result.gross_breakdown.overtime_allowances.overtime_pay.amount,
        night_pay: result.gross_breakdown.overtime_allowances.night_pay.amount,
        holiday_pay: result.gross_breakdown.overtime_allowances.holiday_pay.amount,
        weekly_holiday_pay: result.gross_breakdown.weekly_holiday_pay.amount.amount,
      });

      onSaveStatusChange('success');
      setTimeout(() => onSaveStatusChange('idle'), 3000);
    } catch (err: unknown) {
      onSaveStatusChange('error');
      const msg = err instanceof Error ? err.message : '';

      if (msg.includes('이미') || msg.includes('존재')) {
        onSaveError('이미 해당 직원의 급여가 등록되어 있습니다.');
      } else if (msg.includes('확정')) {
        onSaveError('확정된 급여 기간은 수정할 수 없습니다.');
      } else {
        onSaveError(msg || '저장에 실패했습니다.');
      }
    }
  }, [
    selectedPeriodId,
    selectedEmployeeId,
    result,
    workShifts,
    calcMinutes,
    onSaveStatusChange,
    onSaveError,
  ]);

  return { saveToPayroll };
}
