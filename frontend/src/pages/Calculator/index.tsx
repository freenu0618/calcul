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
import { SalaryResult, AllowanceAdjustment } from '../../components/ResultDisplay';
import type { AdjustedResult } from '../../components/ResultDisplay';
import { ShiftInput } from '../../components/ShiftInput';
import { StepWizard, useWizard, type WizardStep } from '../../components/wizard';
import { salaryApi, payrollApi, employeeApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import type { Employee, Allowance } from '../../types/models';
import type { SalaryCalculationResponse, WorkShiftRequest, WageType, AbsencePolicy } from '../../types/salary';
import type { PayrollPeriodResponse } from '../../types/payroll';
import type { EmployeeResponse } from '../../types/employee';

const WIZARD_STEPS: WizardStep[] = [
  { id: 'employee', title: '근로자 정보', description: '고용형태, 사업장' },
  { id: 'salary', title: '급여/수당', description: '기본급, 수당 입력' },
  { id: 'shift', title: '근무시프트', description: '근무시간 입력' },
];

export default function CalculatorPage() {
  const { isAuthenticated } = useAuth();
  const [periods, setPeriods] = useState<PayrollPeriodResponse[]>([]);
  const [registeredEmployees, setRegisteredEmployees] = useState<EmployeeResponse[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string>('');
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
  const [contractSalary, setContractSalary] = useState<number>(0); // 계약 월급 (계약총액제)
  const [result, setResult] = useState<SalaryCalculationResponse | null>(null);
  const [adjustedResult, setAdjustedResult] = useState<AdjustedResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 로그인 시 급여 기간 및 직원 목록 로드
  useEffect(() => {
    if (isAuthenticated) {
      payrollApi.getPeriods().then((data) => setPeriods(data.periods || [])).catch(() => {});
      employeeApi.getEmployees().then((data) => setRegisteredEmployees(data.employees || [])).catch(() => {});
    }
  }, [isAuthenticated]);

  // 시프트에서 근무 분 계산
  const calcMinutes = (s: WorkShiftRequest) => {
    const [sh, sm] = s.start_time.split(':').map(Number);
    const [eh, em] = s.end_time.split(':').map(Number);
    return Math.max(0, (eh * 60 + em) - (sh * 60 + sm) - s.break_minutes);
  };

  // 급여대장에 저장
  const handleSaveToPayroll = async () => {
    if (!selectedPeriodId || !selectedEmployeeId || !result) return;
    setSaveStatus('saving');
    setSaveError('');
    try {
      const totalMins = workShifts.reduce((sum, s) => sum + calcMinutes(s), 0);
      const holidayMins = workShifts.filter((s) => s.is_holiday_work).reduce((sum, s) => sum + calcMinutes(s), 0);
      await payrollApi.addEntry(Number(selectedPeriodId), {
        employee_id: selectedEmployeeId,
        base_salary: result.gross_breakdown.base_salary.amount,
        total_work_minutes: totalMins,
        overtime_minutes: result.work_summary?.overtime_hours?.total_minutes || 0,
        night_minutes: result.work_summary?.night_hours?.total_minutes || 0,
        holiday_minutes: holidayMins,
        // 계산 결과 전달
        total_gross: result.gross_breakdown.total.amount,
        net_pay: result.net_pay.amount,
        total_deductions: result.deductions_breakdown.total.amount,
        overtime_pay: result.gross_breakdown.overtime_allowances.overtime_pay.amount,
        night_pay: result.gross_breakdown.overtime_allowances.night_pay.amount,
        holiday_pay: result.gross_breakdown.overtime_allowances.holiday_pay.amount,
        weekly_holiday_pay: result.gross_breakdown.weekly_holiday_pay.amount.amount,
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: unknown) {
      setSaveStatus('error');
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('이미') || msg.includes('존재')) {
        setSaveError('이미 해당 직원의 급여가 등록되어 있습니다.');
      } else if (msg.includes('확정')) {
        setSaveError('확정된 급여 기간은 수정할 수 없습니다.');
      } else {
        setSaveError(msg || '저장에 실패했습니다.');
      }
    }
  };

  const handleCalculate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAdjustedResult(null); // 새 계산 시 조정 결과 초기화
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
            dailyWorkHours={employee.daily_work_hours}
            wageType={wageType}
            onWageTypeChange={setWageType}
            hourlyWage={hourlyWage}
            onHourlyWageChange={setHourlyWage}
            absencePolicy={absencePolicy}
            onAbsencePolicyChange={setAbsencePolicy}
            hoursMode={hoursMode}
            onHoursModeChange={setHoursMode}
            contractSalary={contractSalary}
            onContractSalaryChange={setContractSalary}
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

              {/* 계약총액제 - 수당 조정 */}
              <AllowanceAdjustment
                result={result}
                onAdjustedResult={(adjusted) => setAdjustedResult(adjusted)}
                initialContractAmount={contractSalary}
              />

              {/* 조정된 실수령액 표시 */}
              {adjustedResult && adjustedResult.additionalAllowances.length > 0 && (
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">수당 추가 후 실수령액</p>
                      <p className="text-2xl font-bold">
                        {new Intl.NumberFormat('ko-KR').format(adjustedResult.adjustedNetPay)}원
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-green-200">
                        기존 대비 +{new Intl.NumberFormat('ko-KR').format(
                          adjustedResult.adjustedNetPay - adjustedResult.originalNetPay
                        )}원
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 급여대장 저장 (로그인 사용자만) */}
              {isAuthenticated && (
                <Card title="급여대장에 저장">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={selectedPeriodId}
                        onChange={(e) => setSelectedPeriodId(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">급여 기간 선택</option>
                        {periods.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.status !== 'DRAFT'}>
                            {p.year}년 {p.month}월 {p.status !== 'DRAFT' ? `(${p.status === 'CONFIRMED' ? '확정' : '지급완료'})` : ''}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">직원 선택</option>
                        {registeredEmployees.map((emp) => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleSaveToPayroll}
                      disabled={!selectedPeriodId || !selectedEmployeeId || saveStatus === 'saving'}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
                    >
                      {saveStatus === 'saving' ? '저장 중...' : saveStatus === 'success' ? '✓ 저장됨' : '급여대장에 저장'}
                    </button>
                    {registeredEmployees.length === 0 && (
                      <p className="text-sm text-amber-600">등록된 직원이 없습니다. 먼저 직원을 등록해주세요.</p>
                    )}
                    {periods.filter((p) => p.status === 'DRAFT').length === 0 && periods.length > 0 && (
                      <p className="text-sm text-amber-600">저장 가능한 급여 기간이 없습니다. 급여대장에서 새 기간을 만들거나 기존 기간을 수정 상태로 변경해주세요.</p>
                    )}
                  </div>
                  {saveStatus === 'error' && <p className="mt-2 text-sm text-red-500">{saveError}</p>}
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
