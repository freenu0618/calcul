/**
 * 급여 계산기 페이지 (리팩토링 버전)
 *
 * 개선사항:
 * - useState 20개 → useReducer 1개 (관심사 분리)
 * - 커스텀 훅으로 로직 분리 (useCalculation, usePayrollSave)
 * - useCallback 의존성 11개 → 0개 (모두 useReducer actions로 통합)
 */

import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import { CalculatorIcon, EmptyState } from '../../components/illustrations';
import EmployeeInfoForm from '../../components/forms/EmployeeInfoForm';
import SalaryForm from '../../components/forms/SalaryForm';
import { SalaryResult, AllowanceEditor } from '../../components/ResultDisplay';
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
import PayPeriodSelector from '../../components/forms/PayPeriodSelector';
import UpgradeModal from '../../components/UpgradeModal';

const WIZARD_STEPS: WizardStep[] = [
  { id: 'employee', title: '근로자 정보', description: '고용형태, 사업장' },
  { id: 'salary', title: '급여/수당', description: '기본급, 수당 입력' },
  { id: 'shift', title: '근무시프트', description: '근무시간 입력' },
];

const dateModified = '2026-06-05';
const calculatorInputChecklist = [
  ['급여유형', '월급제, 시급제, 시급기반 월급제 중 실제 계약 방식에 맞는 유형'],
  ['사업장 규모와 고용형태', '5인 이상 여부, 정규직·파트타임·외국인 근로자 여부 등 공제와 가산수당에 영향을 주는 조건'],
  ['기본급 또는 시급', '월 고정급, 통상시급, 계약 월급처럼 지급 총액 계산의 기준이 되는 금액'],
  ['근무일과 근무시간', '소정근로일, 일 근무시간, 정산 기간, 실제 시프트와 주 15시간 이상 여부'],
  ['과세·비과세 수당', '식대, 교통비, 직책수당 등 과세 여부에 따라 실수령액을 바꾸는 수당'],
  ['4대보험과 부양가족', '국민연금·건강보험·고용보험 적용 여부, 부양가족 수, 20세 이하 자녀 수'],
  ['연장·야간·휴일근로', '가산수당과 휴일연장 계산에 필요한 시간대와 사업장 규모 조건'],
];

const calculatorAnswerGuidance = [
  {
    title: '월급 또는 시급만 알고 있을 때',
    body: '급여유형, 사업장 규모, 소정근로시간, 4대보험 적용 여부, 부양가족 수를 함께 확인해야 실수령액 오차를 줄일 수 있습니다.',
  },
  {
    title: '알바·시프트 급여를 볼 때',
    body: '주 15시간 이상 여부, 소정근로일 개근, 주휴수당 포함 여부, 야간·휴일근로 시간을 먼저 분리해 입력하세요.',
  },
  {
    title: '결과를 해석할 때',
    body: '계산값은 2026년 기준 참고용 추정치입니다. 비과세 수당, 회사별 공제, 분쟁 판단은 전문가 검토가 필요합니다.',
  },
  {
    title: '최저임금·체불이 의심될 때',
    body: '환산시급, 주휴수당, 가산수당을 따로 확인하되 실제 위반 판단은 근로시간·휴게시간·계약 조건을 함께 검토해야 합니다.',
  },
];

const calculatorStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PayTools 급여 계산기',
    alternateName: ['2026년 급여 실수령액 계산기', '4대보험 주휴수당 계산기'],
    url: 'https://paytools.work/calculator',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    inLanguage: 'ko-KR',
    isAccessibleForFree: true,
    dateModified,
    description:
      '2026년 최저임금, 4대보험, 소득세, 주휴수당, 연장·야간·휴일수당을 반영해 월급과 알바 급여 실수령액을 계산하는 무료 급여 계산기입니다.',
    keywords:
      '급여 계산기, 월급 실수령액 계산기, 알바 급여 계산기, 4대보험 계산기, 주휴수당 계산, 연장근로수당, 2026년 최저임금',
    featureList: [
      '월급제·시급제·시급기반 월급제 계산',
      '국민연금·건강보험·장기요양·고용보험 공제 반영',
      '소득세와 지방소득세 자동 계산',
      '주휴수당과 연장·야간·휴일수당 계산',
      '급여명세서 PDF와 급여대장 관리 흐름 지원',
    ],
    audience: {
      '@type': 'Audience',
      audienceType: '소규모 사업장, HR 담당자, 근로자, 아르바이트생',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'PayTools',
      url: 'https://paytools.work',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'PayTools에서 월급 실수령액 계산하는 방법',
    description:
      '근로자 정보, 급여와 수당, 근무시간을 입력해 2026년 기준 공제액과 실수령액을 확인하는 3단계 계산 흐름입니다.',
    totalTime: 'PT3M',
    inLanguage: 'ko-KR',
    dateModified,
    tool: [{ '@type': 'HowToTool', name: 'PayTools 급여 계산기' }],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: '근로자 정보 입력',
        text: '고용형태, 사업장 규모, 소정근로일과 일 근무시간을 입력합니다.',
        url: 'https://paytools.work/calculator',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: '급여와 수당 입력',
        text: '월급 또는 시급, 과세·비과세 수당, 4대보험 적용 조건을 입력합니다.',
        url: 'https://paytools.work/calculator',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: '근무시간과 결과 확인',
        text: '정산 기간과 시프트를 확인한 뒤 지급 총액, 공제 총액, 실수령액을 검토합니다.',
        url: 'https://paytools.work/calculator',
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'PayTools 급여 실수령액 계산 입력 체크리스트',
    description:
      '월급·알바 실수령액, 4대보험, 주휴수당, 연장·야간·휴일수당 계산 전에 확인해야 하는 핵심 입력값입니다.',
    inLanguage: 'ko-KR',
    dateModified,
    numberOfItems: calculatorInputChecklist.length,
    itemListElement: calculatorInputChecklist.map(([name, description], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      description,
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    dateModified,
    mainEntity: [
      {
        '@type': 'Question',
        name: 'PayTools 급여 계산기는 어떤 공제를 반영하나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '2026년 기준 국민연금, 건강보험, 장기요양보험, 고용보험, 소득세와 지방소득세를 반영해 실수령액을 추정합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '알바 급여와 주휴수당도 계산할 수 있나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '네. 시급제와 시프트 입력을 지원하며 주 15시간 이상 등 조건에 따라 주휴수당과 가산수당을 함께 확인할 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        name: '계산 결과를 최종 급여 지급 기준으로 써도 되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '계산 결과는 참고용 추정치입니다. 실제 지급, 비과세 항목, 회사별 공제, 분쟁 판단은 노무사 또는 세무 전문가와 확인하는 것이 안전합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '월급이나 시급만 알고 있어도 계산할 수 있나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '대략적인 추정은 가능하지만 급여유형, 사업장 규모, 근무시간, 부양가족 수, 4대보험 적용 여부, 과세·비과세 수당을 함께 입력해야 실수령액 차이를 줄일 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        name: '최저임금 위반 여부도 바로 판단할 수 있나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'PayTools는 2026년 최저시급과 입력값을 기준으로 환산시급과 수당을 점검하는 참고용 계산을 제공합니다. 실제 위반 판단은 근로시간, 휴게시간, 수당 산입 범위, 사업장 조건을 함께 확인하고 전문가 검토가 필요합니다.',
        },
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: 'https://paytools.work',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '급여 계산기',
        item: 'https://paytools.work/calculator',
      },
    ],
  },
];

export default function CalculatorPage() {
  const { isAuthenticated } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);

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

  // 플랜 한도 에러 감지 → 업그레이드 모달 표시
  useEffect(() => {
    if (!state.ui.error?.includes('플랜')) return;
    const timer = window.setTimeout(() => setShowUpgrade(true), 0);
    return () => window.clearTimeout(timer);
  }, [state.ui.error]);

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
      case 2: {
        const isMonthlyFixed = state.input.wageType === 'MONTHLY_FIXED' || state.input.wageType === 'MONTHLY';
        return (
          <div className="space-y-4">
            {isMonthlyFixed && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-1">
                  월급제 안내
                </p>
                <p className="text-xs text-blue-700">
                  시프트를 입력하지 않으면 <strong>정상 출근(전일 개근)</strong>으로 계산됩니다.
                  연장/야간/휴일근로가 있는 경우에만 해당 시프트를 입력하세요.
                </p>
              </div>
            )}
            <PayPeriodSelector
              periodStart={state.input.periodStart}
              periodEnd={state.input.periodEnd}
              attributionMonth={state.input.attributionMonth}
              onPeriodChange={actions.setPayPeriod}
              onAttributionMonthChange={actions.setAttributionMonth}
            />
            <ShiftInput
              onChange={actions.setWorkShifts}
              initialShifts={state.input.workShifts}
              calculationMonth={state.input.calculationMonth}
              onCalculationMonthChange={actions.setCalculationMonth}
              payPeriodStart={state.input.periodStart}
              payPeriodEnd={state.input.periodEnd}
            />
          </div>
        );
      }
      default:
        return null;
    }
  };

  const showDesktopSplitLayout = wizard.currentStep === WIZARD_STEPS.length - 1 || !!state.result.current;

  // ============================================
  // 6. 렌더링
  // ============================================
  return (
    <>
      <Helmet>
        <title>급여 계산기 - 2026년 실수령액·4대보험·주휴수당 자동 계산 | PayTools</title>
        <meta name="description" content="기본급, 각종 수당, 4대보험, 소득세, 주휴수당, 연장·야간·휴일수당까지 자동 계산하세요. 2026년 최저임금 10,320원과 최신 요율을 반영한 무료 실수령액 계산기입니다." />
        <link rel="canonical" href="https://paytools.work/calculator" />
        <meta property="og:title" content="급여 계산기 - 2026년 실수령액·4대보험 자동 계산 | PayTools" />
        <meta property="og:description" content="기본급, 수당, 4대보험, 소득세, 주휴수당, 연장·야간·휴일수당을 한 번에 계산하는 2026년 기준 급여 계산기입니다." />
        <meta property="og:url" content="https://paytools.work/calculator" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://paytools.work/og-image.svg" />
        <meta property="og:image:alt" content="PayTools 급여 계산기 결과 미리보기" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="급여 계산기 - 2026년 실수령액 자동 계산 | PayTools" />
        <meta name="twitter:description" content="4대보험, 소득세, 주휴수당, 가산수당을 반영해 월급과 알바 급여 실수령액을 계산하세요." />
        <meta name="twitter:image" content="https://paytools.work/og-image.svg" />
        <meta name="twitter:image:alt" content="PayTools 급여 계산기 결과 미리보기" />
        <script type="application/ld+json">
          {JSON.stringify(calculatorStructuredData)}
        </script>
      </Helmet>

      <TutorialOverlay />
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} reason="salary_calc" />

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

          {/* 법령 기준 배지 */}
          <div className="mb-4">
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
              <span>✅</span> 2026년 법령 기준 반영 (최저시급 10,320원 / 국민연금 4.75%)
            </div>
          </div>

          <section className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4" aria-labelledby="calculator-answer-guidance">
            <h2 id="calculator-answer-guidance" className="mb-3 text-sm font-semibold text-blue-900">
              계산 전 확인하면 좋은 기준
            </h2>
            <div className="grid gap-3 md:grid-cols-4">
              {calculatorAnswerGuidance.map((item) => (
                <div key={item.title} className="rounded-md bg-white p-3 text-sm">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 예시로 채우기 버튼 */}
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">💡 예시로 채우기:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  actions.setEmployee({ ...state.input.employee, name: '홍길동', employment_type: 'FULL_TIME', company_size: 'OVER_5', scheduled_work_days: 5, daily_work_hours: 8, dependents_count: 1, children_under_20: 0 });
                  actions.setWageType('MONTHLY_FIXED');
                  actions.setBaseSalary(2500000);
                }}
                className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-400 transition-colors"
              >
                월급 250만원 정규직
              </button>
              <button
                type="button"
                onClick={() => {
                  actions.setEmployee({ ...state.input.employee, name: '김파트', employment_type: 'PART_TIME', company_size: 'OVER_5', scheduled_work_days: 5, daily_work_hours: 8, dependents_count: 1, children_under_20: 0 });
                  actions.setWageType('HOURLY_MONTHLY');
                  actions.setHourlyWage(10320);
                }}
                className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-400 transition-colors"
              >
                시급 10,320원 파트타임
              </button>
              <button
                type="button"
                onClick={() => {
                  actions.setEmployee({
                    ...state.input.employee,
                    name: '야간알바',
                    employment_type: 'PART_TIME',
                    company_size: 'UNDER_5',
                    scheduled_work_days: 3,
                    daily_work_hours: 6,
                    dependents_count: 0,
                    children_under_20: 0,
                  });
                  actions.setWageType('HOURLY_MONTHLY');
                  actions.setHourlyWage(12000);
                }}
                className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-400 transition-colors"
              >
                시급 12,000원 야간 알바
              </button>
              <button
                type="button"
                onClick={() => {
                  actions.setEmployee({ ...state.input.employee, name: '이포괄', employment_type: 'FULL_TIME', company_size: 'OVER_5', scheduled_work_days: 5, daily_work_hours: 8, dependents_count: 1, children_under_20: 0 });
                  actions.setWageType('MONTHLY_FIXED');
                  actions.setBaseSalary(3000000);
                  actions.setInclusiveWageOptions({ enabled: true, fixed_overtime_hourly_rate: 15000, monthly_expected_overtime_hours: 20 });
                }}
                className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-400 transition-colors"
              >
                포괄임금 300만원
              </button>
            </div>
          </div>

          {/* 기본은 단일 컬럼, 마지막 단계/결과에서만 데스크톱 2컬럼 */}
          <div className={showDesktopSplitLayout ? 'xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(380px,460px)] xl:gap-8 xl:items-start' : ''}>
            {/* 좌측: 입력 폼 */}
            <div>
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
                <div className={`mt-6 border-l-4 p-4 ${state.ui.error.includes('플랜') ? 'bg-amber-50 border-amber-400 text-amber-800' : 'bg-red-50 border-red-400 text-red-700'}`}>
                  <p className="font-medium">{state.ui.error.includes('플랜') ? '이용 한도 도달' : '오류'}</p>
                  <p className="text-sm">{state.ui.error}</p>
                  {state.ui.error.includes('플랜') && (
                    <a href="/#pricing" className="inline-block mt-2 text-sm font-bold text-primary hover:underline">
                      요금제 확인하기 →
                    </a>
                  )}
                </div>
              )}

              {/* 모바일/단일컬럼 전용: 결과 영역 */}
              <div className={showDesktopSplitLayout ? 'xl:hidden' : ''}>
                {state.result.current ? (
                  <div className="mt-8 space-y-4">
                    <AllowanceEditor
                      result={state.result.current}
                      allowances={state.input.allowances}
                      onAllowancesChange={actions.setAllowances}
                      onRecalculate={() => queueMicrotask(calculate)}
                      isRecalculating={state.ui.isLoading}
                      onRemoveGuarantee={() => actions.setContractMonthlySalary(0)}
                      contractMonthlySalary={state.input.contractMonthlySalary}
                    />
                    <Card title="계산 결과">
                      <div className="mb-3">
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                          <span>✅</span> 2026년 법령 기준 반영 (최저시급 10,320원 / 국민연금 4.75%)
                        </div>
                      </div>
                      <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">date_range</span>
                        <span>
                          귀속월: {state.input.attributionMonth.replace('-', '년 ')}월
                          <span className="text-blue-400 mx-2">|</span>
                          정산 기간: {state.input.periodStart} ~ {state.input.periodEnd}
                        </span>
                      </div>
                      <SalaryResult result={state.result.current} />
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <PDFExport
                          result={state.result.current}
                          employerName={state.input.employee.name ? `${state.input.employee.name} 급여명세서` : undefined}
                        />
                      </div>
                    </Card>
                    {isAuthenticated && (
                      <Card title="급여대장에 저장">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <select value={state.payroll.selectedPeriodId} onChange={(e) => actions.setSelectedPeriodId(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                              <option value="">급여 기간 선택</option>
                              {state.payroll.periods.map((p) => (
                                <option key={p.id} value={p.id} disabled={p.status !== 'DRAFT'}>
                                  {p.year}년 {p.month}월{p.status !== 'DRAFT' ? `(${p.status === 'CONFIRMED' ? '확정' : '지급완료'})` : ''}
                                </option>
                              ))}
                            </select>
                            <select value={state.payroll.selectedEmployeeId} onChange={(e) => actions.setSelectedEmployeeId(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                              <option value="">직원 선택</option>
                              {state.payroll.registeredEmployees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.name}</option>))}
                            </select>
                          </div>
                          <button onClick={saveToPayroll} disabled={!state.payroll.selectedPeriodId || !state.payroll.selectedEmployeeId || state.ui.saveStatus === 'saving'} className="w-full py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300">
                            {state.ui.saveStatus === 'saving' ? '저장 중...' : state.ui.saveStatus === 'success' ? '✓ 저장됨' : '급여대장에 저장'}
                          </button>
                        </div>
                        {state.ui.saveStatus === 'error' && <p className="mt-2 text-sm text-red-500">{state.ui.saveError}</p>}
                      </Card>
                    )}
                  </div>
                ) : (
                  !state.ui.error && !state.ui.isLoading && (
                    <div className="mt-8">
                      <Card>
                        <EmptyState type="no-result" message="위 정보를 입력하고 계산하면 결과가 여기에 표시됩니다" />
                      </Card>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* 우측: 실시간 결과 (마지막 단계/결과에서만 데스크톱 2컬럼) */}
            <div className="hidden xl:block xl:sticky xl:top-8">
              {state.result.current ? (
                <div className="space-y-4">
                  <AllowanceEditor
                    result={state.result.current}
                    allowances={state.input.allowances}
                    onAllowancesChange={actions.setAllowances}
                    onRecalculate={() => queueMicrotask(calculate)}
                    isRecalculating={state.ui.isLoading}
                    onRemoveGuarantee={() => actions.setContractMonthlySalary(0)}
                    contractMonthlySalary={state.input.contractMonthlySalary}
                  />
                  <Card title="계산 결과">
                    <div className="mb-3">
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                        <span>✅</span> 2026년 법령 기준 반영 (최저시급 10,320원 / 국민연금 4.75%)
                      </div>
                    </div>
                    <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">date_range</span>
                      <span>
                        귀속월: {state.input.attributionMonth.replace('-', '년 ')}월
                        <span className="text-blue-400 mx-2">|</span>
                        정산 기간: {state.input.periodStart} ~ {state.input.periodEnd}
                      </span>
                    </div>
                    <SalaryResult result={state.result.current} />
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <PDFExport
                        result={state.result.current}
                        employerName={state.input.employee.name ? `${state.input.employee.name} 급여명세서` : undefined}
                      />
                    </div>
                  </Card>
                  {isAuthenticated && (
                    <Card title="급여대장에 저장">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <select value={state.payroll.selectedPeriodId} onChange={(e) => actions.setSelectedPeriodId(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="">급여 기간 선택</option>
                            {state.payroll.periods.map((p) => (
                              <option key={p.id} value={p.id} disabled={p.status !== 'DRAFT'}>
                                {p.year}년 {p.month}월{p.status !== 'DRAFT' ? `(${p.status === 'CONFIRMED' ? '확정' : '지급완료'})` : ''}
                              </option>
                            ))}
                          </select>
                          <select value={state.payroll.selectedEmployeeId} onChange={(e) => actions.setSelectedEmployeeId(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="">직원 선택</option>
                            {state.payroll.registeredEmployees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.name}</option>))}
                          </select>
                        </div>
                        <button onClick={saveToPayroll} disabled={!state.payroll.selectedPeriodId || !state.payroll.selectedEmployeeId || state.ui.saveStatus === 'saving'} className="w-full py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300">
                          {state.ui.saveStatus === 'saving' ? '저장 중...' : state.ui.saveStatus === 'success' ? '✓ 저장됨' : '급여대장에 저장'}
                        </button>
                      </div>
                      {state.ui.saveStatus === 'error' && <p className="mt-2 text-sm text-red-500">{state.ui.saveError}</p>}
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                    <span className="material-symbols-outlined text-5xl mb-3 text-gray-300">calculate</span>
                    <p className="text-sm">입력하시면 여기에 결과가 표시됩니다</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
