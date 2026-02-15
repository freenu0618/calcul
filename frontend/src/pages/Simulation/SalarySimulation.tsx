/**
 * 급여 구조 시뮬레이션 페이지
 * - 같은 총 급여액에서 기본급/수당 배분에 따른 인건비 차이 비교
 */

import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { simulationApi } from '../../api/simulationApi';
import type { SimulationCompareResponse, SimulationCompareRequest } from '../../types/simulation';
import { DEFAULT_SIMULATION_REQUEST } from '../../types/simulation';

export default function SalarySimulation() {
  const [request, setRequest] = useState<SimulationCompareRequest>(DEFAULT_SIMULATION_REQUEST);
  const [result, setResult] = useState<SimulationCompareResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof SimulationCompareRequest, value: number) => {
    setRequest(prev => ({ ...prev, [field]: value }));
  };

  const handleSimulate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await simulationApi.compareStructures(request);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : '시뮬레이션 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  return (
    <>
      <Helmet>
        <title>급여 구조 시뮬레이션 | PayTools</title>
        <meta name="description" content="같은 총 급여액에서 기본급과 수당 배분에 따른 인건비 차이를 비교 시뮬레이션합니다." />
        <link rel="canonical" href="https://paytools.work/simulation" />
        <meta property="og:title" content="급여 구조 시뮬레이션" />
        <meta property="og:description" content="기본급·수당 배분에 따른 인건비 차이 비교 시뮬레이션." />
        <meta property="og:url" content="https://paytools.work/simulation" />
      </Helmet>
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">급여 구조 시뮬레이션</h1>
          <p className="text-gray-600 mb-6">
            같은 총 급여액에서 기본급/수당 배분에 따른 인건비 차이를 비교합니다.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 입력 폼 */}
            <Card className="lg:col-span-1">
              <h2 className="text-lg font-semibold mb-4">시뮬레이션 조건</h2>

              <div className="space-y-4">
                <Input
                  type="number"
                  label="월 총 급여액"
                  value={request.monthly_total}
                  onChange={(e) => handleChange('monthly_total', parseInt(e.target.value) || 0)}
                  min={0}
                  required
                />

                <Input
                  type="number"
                  label="주 소정근로시간"
                  value={request.weekly_hours}
                  onChange={(e) => handleChange('weekly_hours', parseInt(e.target.value) || 40)}
                  min={15}
                  max={60}
                />

                <Input
                  type="number"
                  label="예상 월 연장근로시간"
                  value={request.expected_overtime_hours}
                  onChange={(e) => handleChange('expected_overtime_hours', parseFloat(e.target.value) || 0)}
                  min={0}
                />

                <Input
                  type="number"
                  label="예상 월 야간근로시간"
                  value={request.expected_night_hours}
                  onChange={(e) => handleChange('expected_night_hours', parseFloat(e.target.value) || 0)}
                  min={0}
                />

                <Input
                  type="number"
                  label="예상 월 휴일근로시간"
                  value={request.expected_holiday_hours}
                  onChange={(e) => handleChange('expected_holiday_hours', parseFloat(e.target.value) || 0)}
                  min={0}
                />

                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    A안 기본급 비율: {Math.round(request.base_salary_ratio_a * 100)}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={request.base_salary_ratio_a * 100}
                    onChange={(e) => handleChange('base_salary_ratio_a', parseInt(e.target.value) / 100)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    B안 기본급 비율: {Math.round(request.base_salary_ratio_b * 100)}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={request.base_salary_ratio_b * 100}
                    onChange={(e) => handleChange('base_salary_ratio_b', parseInt(e.target.value) / 100)}
                    className="w-full"
                  />
                </div>

                <button
                  onClick={handleSimulate}
                  disabled={isLoading}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                >
                  {isLoading ? '계산 중...' : '시뮬레이션 실행'}
                </button>
              </div>
            </Card>

            {/* 결과 표시 */}
            <div className="lg:col-span-2 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {result && (
                <>
                  {/* 비교표 */}
                  <Card>
                    <h2 className="text-lg font-semibold mb-4">급여 구조 비교</h2>
                    <ComparisonTable result={result} />
                  </Card>

                  {/* 차이 분석 */}
                  <Card>
                    <h2 className="text-lg font-semibold mb-4">차이 분석</h2>
                    <DifferenceAnalysis result={result} />
                  </Card>

                  {/* 추천 의견 */}
                  <Card className="bg-blue-50 border-blue-200">
                    <h2 className="text-lg font-semibold mb-2 text-blue-900">추천 의견</h2>
                    <p className="text-blue-800">{result.recommendation}</p>
                  </Card>
                </>
              )}

              {!result && !error && (
                <Card className="text-center py-12 text-gray-500">
                  <p>시뮬레이션 조건을 입력하고 실행 버튼을 클릭하세요.</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}

function ComparisonTable({ result }: { result: SimulationCompareResponse }) {
  const rows = [
    { label: '기본급', a: result.plan_a.base_salary, b: result.plan_b.base_salary },
    { label: '수당 합계', a: result.plan_a.allowances, b: result.plan_b.allowances },
    { label: '통상시급', a: result.plan_a.hourly_wage, b: result.plan_b.hourly_wage, highlight: true },
    { label: '연장근로수당', a: result.plan_a.overtime_pay, b: result.plan_b.overtime_pay },
    { label: '야간근로수당', a: result.plan_a.night_pay, b: result.plan_b.night_pay },
    { label: '휴일근로수당', a: result.plan_a.holiday_pay, b: result.plan_b.holiday_pay },
    { label: '퇴직금 기준', a: result.plan_a.severance_pay, b: result.plan_b.severance_pay },
    { label: '연차수당(1일)', a: result.plan_a.annual_leave_pay, b: result.plan_b.annual_leave_pay },
    { label: '연간 인건비', a: result.plan_a.annual_employer_cost, b: result.plan_b.annual_employer_cost, highlight: true },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-3">항목</th>
            <th className="text-right py-2 px-3 bg-blue-50">{result.plan_a.name}</th>
            <th className="text-right py-2 px-3 bg-green-50">{result.plan_b.name}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className={`border-b ${row.highlight ? 'bg-yellow-50 font-medium' : ''}`}>
              <td className="py-2 px-3">{row.label}</td>
              <td className="text-right py-2 px-3">{row.a.formatted}</td>
              <td className="text-right py-2 px-3">{row.b.formatted}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DifferenceAnalysis({ result }: { result: SimulationCompareResponse }) {
  const diff = result.difference;
  const isPositive = diff.annual_cost_diff.amount > 0;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-500">통상시급 차이</p>
        <p className="text-lg font-semibold">{diff.hourly_wage_diff.formatted}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-500">연장수당 차이</p>
        <p className="text-lg font-semibold">{diff.overtime_pay_diff.formatted}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-500">퇴직금 차이</p>
        <p className="text-lg font-semibold">{diff.severance_pay_diff.formatted}</p>
      </div>
      <div className={`p-4 rounded-lg ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
        <p className="text-sm text-gray-500">연간 인건비 차이</p>
        <p className={`text-lg font-semibold ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
          {diff.annual_cost_diff.formatted}
          <span className="text-sm ml-1">({diff.annual_cost_diff_percent > 0 ? '+' : ''}{diff.annual_cost_diff_percent}%)</span>
        </p>
      </div>
    </div>
  );
}
