/**
 * 급여 계산기 페이지 (리팩토링 버전)
 *
 * 개선사항:
 * - useState 20개 → useReducer 1개 (관심사 분리)
 * - 커스텀 훅으로 로직 분리 (useCalculation, usePayrollSave)
 * - useCallback 의존성 11개 → 0개 (모두 useReducer actions로 통합)
 */

import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import { CalculatorIcon, EmptyState } from '../../components/illustrations';
import EmployeeInfoForm from '../../components/forms/EmployeeInfoForm';
import SalaryForm from '../../components/forms/SalaryForm';
import { SalaryResult, AllowanceAdjustment } from '../../components/ResultDisplay';
import PDFExport from '../../components/ResultDisplay/PDFExport';
import { ShiftInput } from '../../components/ShiftInput';
import { StepWizard, useWizard, type WizardStep } from '../../components/wizard';
import { payrollApi, employeeApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useCalculatorState, useCalculation, usePayrollSave } from '../../hooks';
import InsuranceOptions from '../../components/forms/InsuranceOptions';
import InclusiveWageOptions from '../../components/forms/InclusiveWageOptions';
import MonthlyWageSimulation from '../../components/forms/MonthlyWageSimulation';
import TutorialOverlay from '../../components/Onboarding/TutorialOverlay';

const WIZARD_STEPS: WizardStep[] = [
  { id: 'employee', title: '근로자 정보', description: '고용형태, 사업장' },
  { id: 'salary', title: '급여/수당', description: '기본급, 수당 입력' },
  { id: 'shift', title: '근무시프트', description: '근무시간 입력' },
];

export default function CalculatorPage() {
  const { isAuthenticated } = useAuth();

  // ============================================
  // 1. 상태 관리 (useReducer 통합)
  // ============================================
  const { state, actions } = useCalculatorState();

  // ============================================
  // 2. API 호출 로직 (커스텀 훅)
  // ============================================
  const { calculate } = useCalculation({
    input: state.input,
    onSuccess: actions.setResult,
    onError: actions.setError,
    onLoadingChange: actions.setLoading,
    clearAdjustedResult: () => actions.setAdjustedResult(null),
  });

  const { saveToPayroll } = usePayrollSave({
    selectedPeriodId: state.payroll.selectedPeriodId,
    selectedEmployeeId: state.payroll.selectedEmployeeId,
    result: state.result.current,
    workShifts: state.input.workShifts,
    onSaveStatusChange: actions.setSaveStatus,
    onSaveError: actions.setSaveError,
  });

  // ============================================
  // 3. 로그인 시 급여 기간 및 직원 목록 로드
  // ============================================
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const load = async () => {
      try {
        const [periodsData, empData] = await Promise.all([
          payrollApi.getPeriods().catch(() => ({ periods: [] })),
          employeeApi.getEmployees().catch(() => ({ employees: [] })),
        ]);
        if (!cancelled) {
          actions.setPeriods(periodsData.periods || []);
          actions.setRegisteredEmployees(empData.employees || []);
        }
      } catch { /* ignore */ }
    };
    load();
    return () => { cancelled = true; };
  }, [isAuthenticated]); // actions 제거 — useCallback이므로 안정적

  // ============================================
  // 4. Wizard 설정
  // ============================================
  const isStep1Valid = state.input.employee.name.trim().length > 0;

  const wizard = useWizard({
    steps: WIZARD_STEPS,
    onComplete: calculate,
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

  // ============================================
  // 5. Step 렌더링
  // ============================================
  const renderStepContent = () => {
    switch (wizard.currentStep) {
      case 0:
        return (
          <>
            <EmployeeInfoForm
              employee={state.input.employee}
              onChange={actions.setEmployee}
            />
            {!isStep1Valid && state.input.employee.name === '' && (
              <p className="mt-2 text-sm text-red-500">* 이름을 입력해주세요</p>
            )}
          </>
        );
      case 1:
        return (
          <div className="space-y-6">
            <SalaryForm
              key={`salary-${state.input.employee.scheduled_work_days}-${state.input.employee.daily_work_hours}`}
              baseSalary={state.input.baseSalary}
              allowances={state.input.allowances}
              onBaseSalaryChange={actions.setBaseSalary}
              onAllowancesChange={actions.setAllowances}
              scheduledWorkDays={state.input.employee.scheduled_work_days}
              dailyWorkHours={state.input.employee.daily_work_hours}
              wageType={state.input.wageType}
              onWageTypeChange={actions.setWageType}
              hourlyWage={state.input.hourlyWage}
              onHourlyWageChange={actions.setHourlyWage}
              absencePolicy={state.input.absencePolicy}
              onAbsencePolicyChange={actions.setAbsencePolicy}
              hoursMode={state.input.hoursMode}
              onHoursModeChange={actions.setHoursMode}
              contractMonthlySalary={state.input.contractMonthlySalary}
              onContractMonthlySalaryChange={actions.setContractMonthlySalary}
              guaranteeDistribution={state.input.guaranteeDistribution}
              onGuaranteeDistributionChange={actions.setGuaranteeDistribution}
            />
            <InsuranceOptions
              options={state.input.insuranceOptions}
              onChange={actions.setInsuranceOptions}
              age={state.input.employee.age}
              weeklyHours={
                state.input.employee.scheduled_work_days *
                state.input.employee.daily_work_hours
              }
              isForigner={state.input.employee.is_foreigner}
              visaType={state.input.employee.visa_type}
            />
            {(state.input.wageType === 'MONTHLY_FIXED' || state.input.wageType === 'MONTHLY') && (
              <InclusiveWageOptions
                options={state.input.inclusiveWageOptions}
                onChange={actions.setInclusiveWageOptions}
                baseSalary={state.input.baseSalary}
                monthlyHours={Math.round(
                  state.input.employee.scheduled_work_days *
                    state.input.employee.daily_work_hours *
                    4.345
                )}
              />
            )}
            {state.input.wageType === 'HOURLY_BASED_MONTHLY' && (
              <MonthlyWageSimulation
                hourlyWage={state.input.hourlyWage}
                contractMonthlySalary={state.input.contractMonthlySalary}
                scheduledWorkDays={state.input.employee.scheduled_work_days}
                dailyWorkHours={state.input.employee.daily_work_hours}
                hoursMode={state.input.hoursMode}
              />
            )}
          </div>
        );
      case 2:
        return (
          <ShiftInput
            onChange={actions.setWorkShifts}
            initialShifts={state.input.workShifts}
            calculationMonth={state.input.calculationMonth}
            onCalculationMonthChange={actions.setCalculationMonth}
          />
        );
      default:
        return null;
    }
  };

  // ============================================
  // 6. 렌더링
  // ============================================
  return (
    <>
      <Helmet>
        <title>급여 계산기 | paytools - 4대보험, 소득세 자동 계산</title>
        <meta
          name="description"
          content="기본급, 수당, 4대보험, 소득세를 자동 계산. 2026년 최신 세율 적용."
        />
      </Helmet>

      <TutorialOverlay />

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
              completeLabel={state.ui.isLoading ? '계산 중...' : '급여 계산하기'}
              isNextDisabled={state.ui.isLoading || !canProceed()}
            >
              {renderStepContent()}
            </StepWizard>
          </Card>

          {/* 에러 메시지 */}
          {state.ui.error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
              <p className="font-medium">오류</p>
              <p className="text-sm">{state.ui.error}</p>
            </div>
          )}

          {/* 계산 결과 */}
          {state.result.current ? (
            <div className="mt-8 space-y-4">
              <Card title="계산 결과">
                <SalaryResult result={state.result.current} />
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <PDFExport
                    result={state.result.current}
                    employerName={
                      state.input.employee.name
                        ? `${state.input.employee.name} 급여명세서`
                        : undefined
                    }
                  />
                </div>
              </Card>

              {/* 계약총액제 - 수당 조정 */}
              <AllowanceAdjustment
                result={state.result.current}
                onAdjustedResult={actions.setAdjustedResult}
                initialContractAmount={state.input.contractSalary}
                onApplyAllowances={(newAllowances) => {
                  const converted = newAllowances.map((a) => ({
                    name: a.name,
                    amount: a.amount,
                    is_taxable: a.isTaxable,
                    is_includable_in_minimum_wage: false,
                    is_fixed: true,
                    is_included_in_regular_wage: false,
                  }));
                  actions.addAllowances(converted);
                  setTimeout(() => calculate(), 100);
                }}
              />

              {/* 조정된 실수령액 표시 */}
              {state.result.adjusted &&
                state.result.adjusted.additionalAllowances.length > 0 && (
                  <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">수당 추가 후 실수령액</p>
                        <p className="text-2xl font-bold">
                          {new Intl.NumberFormat('ko-KR').format(
                            state.result.adjusted.adjustedNetPay
                          )}
                          원
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-green-200">
                          기존 대비 +
                          {new Intl.NumberFormat('ko-KR').format(
                            state.result.adjusted.adjustedNetPay -
                              state.result.adjusted.originalNetPay
                          )}
                          원
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
                        value={state.payroll.selectedPeriodId}
                        onChange={(e) => actions.setSelectedPeriodId(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">급여 기간 선택</option>
                        {state.payroll.periods.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.status !== 'DRAFT'}>
                            {p.year}년 {p.month}월{' '}
                            {p.status !== 'DRAFT'
                              ? `(${p.status === 'CONFIRMED' ? '확정' : '지급완료'})`
                              : ''}
                          </option>
                        ))}
                      </select>
                      <select
                        value={state.payroll.selectedEmployeeId}
                        onChange={(e) => actions.setSelectedEmployeeId(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">직원 선택</option>
                        {state.payroll.registeredEmployees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={saveToPayroll}
                      disabled={
                        !state.payroll.selectedPeriodId ||
                        !state.payroll.selectedEmployeeId ||
                        state.ui.saveStatus === 'saving'
                      }
                      className="w-full py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
                    >
                      {state.ui.saveStatus === 'saving'
                        ? '저장 중...'
                        : state.ui.saveStatus === 'success'
                        ? '✓ 저장됨'
                        : '급여대장에 저장'}
                    </button>
                    {state.payroll.registeredEmployees.length === 0 && (
                      <p className="text-sm text-amber-600">
                        등록된 직원이 없습니다. 먼저 직원을 등록해주세요.
                      </p>
                    )}
                    {state.payroll.periods.filter((p) => p.status === 'DRAFT').length === 0 &&
                      state.payroll.periods.length > 0 && (
                        <p className="text-sm text-amber-600">
                          저장 가능한 급여 기간이 없습니다. 급여대장에서 새 기간을 만들거나
                          기존 기간을 수정 상태로 변경해주세요.
                        </p>
                      )}
                  </div>
                  {state.ui.saveStatus === 'error' && (
                    <p className="mt-2 text-sm text-red-500">{state.ui.saveError}</p>
                  )}
                </Card>
              )}
            </div>
          ) : (
            !state.ui.error &&
            !state.ui.isLoading && (
              <div className="mt-8">
                <Card>
                  <EmptyState
                    type="no-result"
                    message="위 정보를 입력하고 계산하면 결과가 여기에 표시됩니다"
                  />
                </Card>
              </div>
            )
          )}
        </div>
      </MainLayout>
    </>
  );
}
