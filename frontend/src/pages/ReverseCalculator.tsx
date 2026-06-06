/**
 * 역산 계산기 페이지 (실수령액 → 필요 기본급)
 */
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import { ReverseIcon, EmptyState } from '../components/illustrations';
import { salaryApi } from '../api';
import type { ReverseSalaryResponse, EmploymentType, CompanySize } from '../types/salary';

const reverseDateModified = '2026-06-07';

const reverseAssumptionCards = [
  {
    title: '역산에 꼭 필요한 값',
    body: '목표 실수령액, 본인 포함 부양가족 수, 20세 이하 자녀 수, 사업장 규모와 고용형태를 먼저 입력합니다.',
  },
  {
    title: '결과에 아직 빠진 항목',
    body: '비과세 수당, 상여, 회사별 공제, 실제 시프트와 연장·야간·휴일근로는 상세 급여 계산기에서 다시 확인하는 것이 안전합니다.',
  },
  {
    title: '활용하기 좋은 상황',
    body: '연봉 협상, 이직 제안 검토, 목표 저축액 기준 월급 기준선을 잡을 때 빠른 참고값으로 사용하세요.',
  },
];

function ReverseCalculator() {
  const [targetNetPay, setTargetNetPay] = useState<number>(3000000);
  const [dependentsCount, setDependentsCount] = useState<number>(1);
  const [childrenUnder20, setChildrenUnder20] = useState<number>(0);
  const [companySize, setCompanySize] = useState<CompanySize>('OVER_5');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('FULL_TIME');

  const [result, setResult] = useState<ReverseSalaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverseCalculatorStructuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: '실수령액 역산 계산기',
      alternateName: '목표 실수령액 세전 월급 계산기',
      url: 'https://paytools.work/reverse-calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'ko-KR',
      isAccessibleForFree: true,
      dateModified: reverseDateModified,
      description:
        '목표 월 실수령액을 입력하면 2026년 4대보험, 소득세, 지방소득세를 반영해 필요한 세전 월급과 기본급을 추정하는 무료 역산 계산기입니다.',
      keywords:
        '실수령액 역산 계산기, 세전 월급 계산, 목표 월급 계산기, 4대보험 공제, 소득세 계산, 월급 실수령액',
      featureList: [
        '목표 실수령액 기준 필요 세전 급여 추정',
        '국민연금·건강보험·장기요양·고용보험 반영',
        '소득세와 지방소득세 공제 반영',
        '부양가족 수와 사업장 규모 조건 반영',
      ],
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
      name: '목표 실수령액에 맞는 세전 월급 계산 방법',
      description:
        '원하는 월 실수령액, 부양가족 수, 사업장 규모를 입력해 4대보험과 세금을 반영한 필요 세전 급여를 확인하는 방법입니다.',
      totalTime: 'PT2M',
      inLanguage: 'ko-KR',
      dateModified: reverseDateModified,
      tool: [{ '@type': 'HowToTool', name: 'PayTools 실수령액 역산 계산기' }],
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: '목표 실수령액 입력',
          text: '매달 실제로 받고 싶은 금액을 원 단위로 입력합니다.',
          url: 'https://paytools.work/reverse-calculator',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: '공제 조건 선택',
          text: '본인 포함 부양가족 수, 20세 이하 자녀 수, 사업장 규모와 고용형태를 선택합니다.',
          url: 'https://paytools.work/reverse-calculator',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: '필요 세전 급여 확인',
          text: '역산 결과의 필요 월 기본급, 실제 실수령액 오차, 4대보험과 세금 공제 내역을 확인합니다.',
          url: 'https://paytools.work/reverse-calculator',
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      dateModified: reverseDateModified,
      mainEntity: [
        {
          '@type': 'Question',
          name: '실수령액 역산 계산기는 무엇을 계산하나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '원하는 월 실수령액을 기준으로 4대보험, 소득세, 지방소득세를 차감했을 때 필요한 세전 월급과 기본급을 추정합니다.',
          },
        },
        {
          '@type': 'Question',
          name: '부양가족 수를 왜 입력해야 하나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '근로소득 간이세액표에서 부양가족 수와 20세 이하 자녀 수는 소득세 원천징수액에 영향을 줄 수 있어 역산 정확도를 높이는 조건입니다.',
          },
        },
        {
          '@type': 'Question',
          name: '역산 결과를 실제 급여 계약에 그대로 써도 되나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '계산 결과는 참고용 추정치입니다. 실제 급여 계약, 비과세 수당, 공제 예외, 회사 정책은 노무사 또는 세무 전문가와 확인하는 것이 안전합니다.',
          },
        },
        {
          '@type': 'Question',
          name: '목표 실수령액만 알면 정확한 세전 월급을 바로 알 수 있나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '목표 실수령액만으로는 빠른 기준선은 잡을 수 있지만 비과세 수당, 상여, 실제 근무시간, 회사별 공제는 결과를 바꿀 수 있습니다. 역산 결과 확인 후 상세 급여 계산기에서 수당과 시프트를 다시 검토하는 것이 안전합니다.',
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
          name: '실수령액 역산 계산기',
          item: 'https://paytools.work/reverse-calculator',
        },
      ],
    },
  ];

  const handleCalculate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await salaryApi.reverseCalculate({
        target_net_pay: targetNetPay,
        employee: {
          name: '역산',
          dependents_count: dependentsCount,
          children_under_20: childrenUnder20,
          employment_type: employmentType,
          company_size: companySize,
          scheduled_work_days: 5,
          daily_work_hours: 8, // 추가
        },
        allowances: [],
        work_shifts: [],
        wage_type: 'MONTHLY',
        calculation_month: '',
        absence_policy: 'STRICT',
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : '계산 중 오류가 발생했습니다.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [targetNetPay, dependentsCount, childrenUnder20, companySize, employmentType]);

  return (
    <>
      <Helmet>
        <title>실수령액 역산 계산기 - 목표 월급에 맞는 세전 급여 계산 | PayTools</title>
        <meta name="description" content="원하는 실수령액을 입력하면 필요한 세전 월급과 기본급을 역산합니다. 4대보험, 소득세, 지방소득세를 반영한 2026년 기준 월급 역산 계산기입니다." />
        <link rel="canonical" href="https://paytools.work/reverse-calculator" />
        <meta property="og:title" content="실수령액 역산 계산기 - 목표 월급에 맞는 세전 급여 계산 | PayTools" />
        <meta property="og:description" content="목표 실수령액에 맞춰 필요한 세전 월급을 역산하세요. 4대보험과 소득세를 반영한 무료 월급 역산 계산기입니다." />
        <meta property="og:url" content="https://paytools.work/reverse-calculator" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://paytools.work/og-image.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify(reverseCalculatorStructuredData)}
        </script>
      </Helmet>
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center gap-4">
              <ReverseIcon size="lg" />
              <div>
                <h1 className="text-3xl font-bold mb-1">실수령액 역산 계산기</h1>
                <p className="text-purple-100">
                  원하는 실수령액을 입력하면 필요한 월 기본급을 계산합니다
                </p>
              </div>
            </div>
          </div>

          <section className="mb-6 rounded-lg border border-purple-100 bg-purple-50 p-4" aria-labelledby="reverse-assumptions-title">
            <h2 id="reverse-assumptions-title" className="mb-3 text-sm font-semibold text-purple-900">
              역산 전 확인하면 좋은 기준
            </h2>
            <div className="grid gap-3 md:grid-cols-3">
              {reverseAssumptionCards.map((item) => (
                <div key={item.title} className="rounded-md bg-white p-3 text-sm">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">{item.body}</p>
                </div>
              ))}
            </div>
            <Link
              to="/calculator"
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900"
            >
              수당과 시프트까지 상세 계산하기
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
            </Link>
          </section>

          <Card>
            <div className="space-y-4">
              {/* 목표 실수령액 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  목표 실수령액 (원)
                </label>
                <input
                  type="number"
                  value={targetNetPay}
                  onChange={(e) => setTargetNetPay(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  min={0}
                  step={10000}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {targetNetPay.toLocaleString()}원
                </p>
              </div>

              {/* 부양가족 수 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    부양가족 수 (본인 포함)
                  </label>
                  <input
                    type="number"
                    value={dependentsCount}
                    onChange={(e) => setDependentsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min={1} max={11}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    20세 이하 자녀 수
                  </label>
                  <input
                    type="number"
                    value={childrenUnder20}
                    onChange={(e) => setChildrenUnder20(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min={0}
                  />
                </div>
              </div>

              {/* 사업장/고용형태 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사업장 규모
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value as CompanySize)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="OVER_5">5인 이상</option>
                    <option value="UNDER_5">5인 미만</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    고용형태
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="FULL_TIME">정규직</option>
                    <option value="PART_TIME">파트타임</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCalculate}
                disabled={isLoading || targetNetPay <= 0}
                className="w-full py-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '계산 중...' : '역산 계산하기'}
              </button>
            </div>
          </Card>

          <Card title="역산 전에 확인할 조건" className="mt-4">
            <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
              <li>실수령액은 4대보험, 소득세, 지방소득세를 공제한 뒤의 예상 수령액입니다.</li>
              <li>비과세 식대, 상여, 수당 구조가 있으면 실제 급여명세서와 차이가 날 수 있습니다.</li>
              <li>정방향 계산이 필요하면 <Link to="/calculator" className="text-purple-600 hover:underline font-medium">급여 계산기</Link>에서 지급 항목별 공제 내역을 확인하세요.</li>
              <li>공제 기준이 헷갈리면 <Link to="/guide/insurance" className="text-purple-600 hover:underline font-medium">4대보험 가이드</Link>와 <Link to="/guide/tax" className="text-purple-600 hover:underline font-medium">소득세 가이드</Link>를 함께 참고하세요.</li>
            </ul>
          </Card>

          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {result ? (
            <ReverseResult result={result} />
          ) : !error && !isLoading && (
            <Card>
              <EmptyState type="no-result" message="목표 실수령액을 입력하고 계산하면 필요한 기본급이 여기에 표시됩니다" />
            </Card>
          )}
        </div>
      </MainLayout>
    </>
  );
}

function ReverseResult({ result }: { result: ReverseSalaryResponse }) {
  const calc = result.calculation_result;
  return (
    <div className="mt-6 space-y-4">
      {/* 핵심 결과 */}
      <Card>
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-1">필요 월 기본급</p>
          <p className="text-4xl font-bold text-purple-600">
            {result.required_base_salary.formatted}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            실수령액: {result.actual_net_pay.formatted}
            (오차: ±{result.difference.formatted})
          </p>
        </div>
      </Card>

      {/* 상세 내역 */}
      <Card title="급여 내역">
        <div className="divide-y divide-gray-100 text-sm">
          <Row label="기본급" value={calc.gross_breakdown.base_salary.formatted} />
          <Row label="통상시급" value={calc.gross_breakdown.hourly_wage.formatted} />
          <Row label="주휴수당" value={calc.gross_breakdown.weekly_holiday_pay.amount.formatted} />
          <Row label="총 지급액" value={calc.gross_breakdown.total.formatted} bold />
        </div>
      </Card>

      <Card title="공제 내역">
        <div className="divide-y divide-gray-100 text-sm">
          <Row label="국민연금" value={calc.deductions_breakdown.insurance.national_pension.formatted} />
          <Row label="건강보험" value={calc.deductions_breakdown.insurance.health_insurance.formatted} />
          <Row label="장기요양" value={calc.deductions_breakdown.insurance.long_term_care.formatted} />
          <Row label="고용보험" value={calc.deductions_breakdown.insurance.employment_insurance.formatted} />
          <Row label="소득세" value={calc.deductions_breakdown.tax.income_tax.formatted} />
          <Row label="지방소득세" value={calc.deductions_breakdown.tax.local_income_tax.formatted} />
          <Row label="총 공제액" value={calc.deductions_breakdown.total.formatted} bold />
        </div>
      </Card>

      {/* 경고 */}
      {result.warnings.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          {result.warnings.map((w, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <p className="font-medium text-yellow-800">{w.message}</p>
              {w.detail && <p className="text-sm text-yellow-700">{w.detail}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between py-2 ${bold ? 'font-semibold' : ''}`}>
      <span className="text-gray-600">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default ReverseCalculator;
