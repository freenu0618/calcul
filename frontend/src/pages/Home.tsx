/**
 * 급여 계산기 메인 페이지 (Step Wizard 적용)
 */

import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import PageHelmet from '../components/common/PageHelmet';
import EmployeeInfoForm from '../components/forms/EmployeeInfoForm';
import SalaryForm from '../components/forms/SalaryForm';
import type { GuaranteeDistributionItem } from '../components/forms/GuaranteeAllowanceDistribution';
import { SalaryResult } from '../components/ResultDisplay';
import { ShiftInput } from '../components/ShiftInput';
import { StepWizard, useWizard, type WizardStep } from '../components/wizard';
import { salaryApi } from '../api';
import type { Employee, Allowance } from '../types/models';
import type { SalaryCalculationResponse, WorkShiftRequest, WageType, AbsencePolicy, HoursMode } from '../types/salary';

const WIZARD_STEPS: WizardStep[] = [
  { id: 'employee', title: '근로자 정보', description: '고용형태, 사업장' },
  { id: 'salary', title: '급여/수당', description: '기본급, 수당 입력' },
  { id: 'shift', title: '근무시프트', description: '근무시간 입력' },
];

const homeStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PayTools 급여 계산기',
    alternateName: ['한국 급여 계산기', '4대보험 실수령액 계산기'],
    url: 'https://paytools.work',
    inLanguage: 'ko-KR',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    description:
      '2026년 최저임금, 4대보험, 소득세, 연장·야간·휴일수당을 반영해 월급과 시급제 근로자의 예상 실수령액을 계산하는 무료 웹앱입니다.',
    featureList: [
      '월급제·시급제·시급기반 월급제 계산',
      '2026년 4대보험 근로자 부담액 계산',
      '소득세와 지방소득세 추정',
      '연장·야간·휴일근로 가산수당 계산',
      '주휴수당과 근무시프트 입력 지원',
    ],
    audience: {
      '@type': 'Audience',
      audienceType: '소규모 사업장, HR 담당자, 급여 담당자, 아르바이트·근로자',
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
    name: 'PayTools로 월급 실수령액 계산하는 방법',
    description: '근로자 정보, 급여·수당, 근무시프트를 입력해 예상 실수령액을 확인하는 3단계 흐름입니다.',
    totalTime: 'PT3M',
    tool: [{ '@type': 'HowToTool', name: 'PayTools 급여 계산기' }],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: '근로자 정보 입력',
        text: '고용형태, 사업장 규모, 소정근로일과 일 근무시간을 입력합니다.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: '급여와 수당 입력',
        text: '월급 또는 시급, 기본급, 통상임금 포함 수당, 급여유형을 선택합니다.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: '근무시프트와 계산월 확인',
        text: '계산월과 실제 근무시간을 입력해 4대보험, 소득세, 가산수당이 반영된 예상 실수령액을 확인합니다.',
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'PayTools 급여 계산기는 무료인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '네. 기본 급여 계산과 실수령액 확인은 무료로 사용할 수 있으며, 직원 관리와 저장 기능은 플랜에 따라 확장됩니다.',
        },
      },
      {
        '@type': 'Question',
        name: '2026년 4대보험 요율이 반영되어 있나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '서비스 계산 기준으로 국민연금 4.75%, 건강보험 3.595%, 장기요양보험 건강보험료의 13.14%, 고용보험 0.9%를 반영합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '계산 결과를 최종 급여 지급 기준으로 사용해도 되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '계산 결과는 참고용 추정치입니다. 비과세 수당, 회사별 공제, 예외 정책, 분쟁 가능성이 있는 사안은 노무사 또는 세무 전문가와 검토하는 것이 안전합니다.',
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
    ],
  },
];

function Home() {
  const [employee, setEmployee] = useState<Employee>({
    name: '',
    dependents_count: 1,
    children_under_20: 0,
    employment_type: 'FULL_TIME',
    company_size: 'OVER_5',
    scheduled_work_days: 5,
    daily_work_hours: 8,
  });
  const [baseSalary, setBaseSalary] = useState<number>(2500000);
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [workShifts, setWorkShifts] = useState<WorkShiftRequest[]>([]);
  const [wageType, setWageType] = useState<WageType>('MONTHLY');
  const [hourlyWage, setHourlyWage] = useState<number>(10320);
  const [calculationMonth, setCalculationMonth] = useState<string>('');
  const [absencePolicy, setAbsencePolicy] = useState<AbsencePolicy>('STRICT');
  const [hoursMode, setHoursMode] = useState<HoursMode>('174');
  const [contractMonthlySalary, setContractMonthlySalary] = useState<number>(0);
  const [guaranteeDistribution, setGuaranteeDistribution] = useState<GuaranteeDistributionItem[]>([]);
  const [result, setResult] = useState<SalaryCalculationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await salaryApi.calculateSalary({
        employee,
        base_salary: baseSalary,
        allowances,
        work_shifts: workShifts,
        wage_type: wageType,
        hourly_wage: hourlyWage,
        calculation_month: calculationMonth,
        absence_policy: absencePolicy,
        hours_mode: hoursMode,
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
  }, [employee, baseSalary, allowances, workShifts, wageType, hourlyWage, calculationMonth, absencePolicy, hoursMode]);

  // Step 1 검증: 이름 필수
  const isStep1Valid = employee.name.trim().length > 0;

  const wizard = useWizard({
    steps: WIZARD_STEPS,
    onComplete: handleCalculate,
  });

  // 단계별 검증
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
            contractMonthlySalary={contractMonthlySalary}
            onContractMonthlySalaryChange={setContractMonthlySalary}
            guaranteeDistribution={guaranteeDistribution}
            onGuaranteeDistributionChange={setGuaranteeDistribution}
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
      <PageHelmet
        title="한국 근로기준법 급여 계산기 - 2026년 4대보험 실수령액"
        description="기본급, 수당, 4대보험, 소득세, 연장·야간·휴일수당을 자동 계산해 2026년 기준 예상 실수령액을 확인하세요."
        path=""
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(homeStructuredData)}</script>
      </Helmet>

      <MainLayout>
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-8 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              한국 근로기준법에 완벽히 맞춘 급여 계산기
            </h1>
            <p className="text-lg mb-4 text-blue-50">
              4대 보험, 소득세, 가산수당을 자동 계산하여 정확한 실수령액을 확인하세요
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">2026년 최신 세율</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">연장·야간·휴일 수당</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">100% 무료</span>
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
          {result && (
            <div className="mt-8">
              <Card title="계산 결과">
                <SalaryResult result={result} />
              </Card>
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
}

export default Home;
