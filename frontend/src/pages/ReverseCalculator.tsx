/**
 * 역산 계산기 페이지 (실수령액 → 필요 기본급)
 */
import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import { salaryApi } from '../api';
import type { ReverseSalaryResponse, EmploymentType, CompanySize } from '../types/salary';

function ReverseCalculator() {
  const [targetNetPay, setTargetNetPay] = useState<number>(3000000);
  const [dependentsCount, setDependentsCount] = useState<number>(1);
  const [childrenUnder20, setChildrenUnder20] = useState<number>(0);
  const [companySize, setCompanySize] = useState<CompanySize>('OVER_5');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('FULL_TIME');

  const [result, setResult] = useState<ReverseSalaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <title>실수령액 역산 계산기 | 월급 역산</title>
        <meta name="description" content="원하는 실수령액을 입력하면 필요한 기본급을 역산합니다." />
      </Helmet>
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg p-8 mb-8">
            <h1 className="text-3xl font-bold mb-2">실수령액 역산 계산기</h1>
            <p className="text-purple-100">
              원하는 실수령액을 입력하면 필요한 월 기본급을 계산합니다
            </p>
          </div>

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

          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {result && <ReverseResult result={result} />}
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
