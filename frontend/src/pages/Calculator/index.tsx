/**
 * 급여 계산기 페이지 (기존 Home.tsx 이동)
 */

import { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import { CalculatorIcon, EmptyState } from '../../components/illustrations';
import EmployeeInfoForm from '../../components/forms/EmployeeInfoForm';
import SalaryForm from '../../components/forms/SalaryForm';
import { SalaryResult } from '../../components/ResultDisplay';
import { ShiftInput } from '../../components/ShiftInput';
import { StepWizard, useWizard, type WizardStep } from '../../components/wizard';
import { salaryApi, payrollApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import type { Employee, Allowance } from '../../types/models';
import type { SalaryCalculationResponse, WorkShiftRequest, WageType, AbsencePolicy } from '../../types/salary';
import type { PayrollPeriodResponse } from '../../types/payroll';

const WIZARD_STEPS: WizardStep[] = [
  { id: 'employee', title: '근로자 정보', description: '고용형태, 사업장' },
  { id: 'salary', title: '급여/수당', description: '기본급, 수당 입력' },
  { id: 'shift', title: '근무시프트', description: '근무시간 입력' },
];

export default function CalculatorPage() {
  const { isAuthenticated } = useAuth();
  const [periods, setPeriods] = useState<PayrollPeriodResponse[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [employee, setEmployee] = useState<Employee>({
    name: '',
    dependents_count: 1,
    children_under_20: 0,
    employment_type: 'FULL_TIME',
    company_size: 'OVER_5',
    scheduled_work_days: 5,
    daily_work_hours: 8, // 추가: 1일 소정근로시간
  });
  const [baseSalary, setBaseSalary] = useState<number>(2500000);
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [workShifts, setWorkShifts] = useState<WorkShiftRequest[]>([]);
  const [wageType, setWageType] = useState<WageType>('MONTHLY');
  const [hourlyWage, setHourlyWage] = useState<number>(0);
  const [calculationMonth, setCalculationMonth] = useState<string>('');
  const [absencePolicy, setAbsencePolicy] = useState<AbsencePolicy>('STRICT');
  const [hoursMode, setHoursMode] = useState<'174' | '209'>('174'); // 추가: 시간 계산 방식
  const [result, setResult] = useState<SalaryCalculationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 로그인 시 급여 기간 목록 로드
  useEffect(() => {
    if (isAuthenticated) {
      payrollApi.getPeriods().then((res) => setPeriods(res.periods || [])).catch(() => {});
    }
  }, [isAuthenticated]);

  // 급여대장에 저장
  const handleSaveToPayroll = async () => {
    if (!selectedPeriodId || !result) return;
    setSaveStatus('saving');
    try {
      await payrollApi.addEntry(Number(selectedPeriodId), {
        employee_id: '', // 임시 직원 ID (추후 직원 선택 UI 추가 가능)
        base_salary: result.gross_salary,
        total_work_minutes: workShifts.reduce((sum, s) => sum + (s.work_minutes || 0), 0),
        overtime_minutes: workShifts.filter((s) => s.is_overtime).reduce((sum, s) => sum + (s.work_minutes || 0), 0),
        night_minutes: workShifts.filter((s) => s.is_night).reduce((sum, s) => sum + (s.work_minutes || 0), 0),
        holiday_minutes: workShifts.filter((s) => s.is_holiday).reduce((sum, s) => sum + (s.work_minutes || 0), 0),
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    }
  };

  const handleCalculate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await salaryApi.calculateSalary({
        employee,
        base_salary: wageType === 'MONTHLY' ? baseSalary : 0,
        allowances,
        work_shifts: workShifts,
        wage_type: wageType,
        hourly_wage: wageType === 'HOURLY' ? hourlyWage : 0,
        calculation_month: calculationMonth,
        absence_policy: absencePolicy,
        hours_mode: hoursMode, // 추가: 시간 계산 방식
      });
      setResult(response);
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'calculate_salary', {
          event_category: 'engagement',
          employment_type: employee.employment_type,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '계산 중 오류가 발생했습니다.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [employee, baseSalary, allowances, workShifts, wageType, hourlyWage, calculationMonth, absencePolicy]);

  const isStep1Valid = employee.name.trim().length > 0;

  const wizard = useWizard({
    steps: WIZARD_STEPS,
    onComplete: handleCalculate,
  });

  const canProceed = (): boolean => {
    if (wizard.currentStep === 0) return isStep1Valid;
    return true;
  };

  const handleNext = () => {
    if (canProceed()) {
      wizard.nextStep();
    }
  };

  const renderStepContent = () => {
    switch (wizard.currentStep) {
      case 0:
        return (
          <>
            <EmployeeInfoForm employee={employee} onChange={setEmployee} />
            {!isStep1Valid && employee.name === '' && (
              <p className="mt-2 text-sm text-red-500">* 이름을 입력해주세요</p>
            )}
          </>
        );
      case 1:
        return (
          <SalaryForm
            baseSalary={baseSalary}
            allowances={allowances}
            onBaseSalaryChange={setBaseSalary}
            onAllowancesChange={setAllowances}
            scheduledWorkDays={employee.scheduled_work_days}
            wageType={wageType}
            onWageTypeChange={setWageType}
            hourlyWage={hourlyWage}
            onHourlyWageChange={setHourlyWage}
            absencePolicy={absencePolicy}
            onAbsencePolicyChange={setAbsencePolicy}
            hoursMode={hoursMode}
            onHoursModeChange={setHoursMode}
          />
        );
      case 2:
        return (
          <ShiftInput
            onChange={setWorkShifts}
            initialShifts={workShifts}
            calculationMonth={calculationMonth}
            onCalculationMonthChange={setCalculationMonth}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>급여 계산기 | paytools - 4대보험, 소득세 자동 계산</title>
        <meta name="description" content="기본급, 수당, 4대보험, 소득세를 자동 계산. 2026년 최신 세율 적용." />
      </Helmet>

      <MainLayout>
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8 flex items-center gap-4">
            <CalculatorIcon size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">급여 계산기</h1>
              <p className="text-gray-600">
                4대 보험, 소득세, 가산수당을 자동 계산하여 정확한 실수령액을 확인하세요
              </p>
            </div>
          </div>

          {/* Step Wizard Form */}
          <Card>
            <StepWizard
              steps={WIZARD_STEPS}
              currentStep={wizard.currentStep}
              onStepClick={wizard.goToStep}
              onPrev={wizard.prevStep}
              onNext={handleNext}
              isFirstStep={wizard.isFirstStep}
              isLastStep={wizard.isLastStep}
              completeLabel={isLoading ? '계산 중...' : '급여 계산하기'}
              isNextDisabled={isLoading || !canProceed()}
            >
              {renderStepContent()}
            </StepWizard>
          </Card>

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
              <p className="font-medium">오류</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* 계산 결과 */}
          {result ? (
            <div className="mt-8 space-y-4">
              <Card title="계산 결과">
                <SalaryResult result={result} />
              </Card>

              {/* 급여대장 저장 (로그인 사용자만) */}
              {isAuthenticated && (
                <Card title="급여대장에 저장">
                  <div className="flex items-center gap-4">
                    <select
                      value={selectedPeriodId}
                      onChange={(e) => setSelectedPeriodId(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">급여 기간 선택</option>
                      {periods.map((p) => (
                        <option key={p.id} value={p.id}>{p.year}년 {p.month}월</option>
                      ))}
                    </select>
                    <button
                      onClick={handleSaveToPayroll}
                      disabled={!selectedPeriodId || saveStatus === 'saving'}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
                    >
                      {saveStatus === 'saving' ? '저장 중...' : saveStatus === 'success' ? '✓ 저장됨' : '저장'}
                    </button>
                  </div>
                  {saveStatus === 'error' && <p className="mt-2 text-sm text-red-500">저장 실패. 다시 시도해주세요.</p>}
                </Card>
              )}
            </div>
          ) : !error && !isLoading && (
            <div className="mt-8">
              <Card>
                <EmptyState type="no-result" message="위 정보를 입력하고 계산하면 결과가 여기에 표시됩니다" />
              </Card>
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
}
