/**
 * 급여 구조 시뮬레이션 페이지
 * - 같은 총 급여액에서 기본급/수당 배분에 따른 인건비 차이 비교
 */

import { useState, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { simulationApi } from '../../api/simulationApi';
import type { SimulationCompareResponse, SimulationCompareRequest } from '../../types/simulation';
import { DEFAULT_SIMULATION_REQUEST } from '../../types/simulation';

const SCENARIO_PRESETS: Array<{ label: string; description: string; values: SimulationCompareRequest }> = [
  {
    label: '기본 사무직',
    description: '주 40시간 · 연장 없음',
    values: {
      monthly_total: 2500000,
      weekly_hours: 40,
      expected_overtime_hours: 0,
      expected_night_hours: 0,
      expected_holiday_hours: 0,
      base_salary_ratio_a: 1.0,
      base_salary_ratio_b: 0.6,
    },
  },
  {
    label: '매장/서비스직',
    description: '연장·휴일근로 반영',
    values: {
      monthly_total: 2800000,
      weekly_hours: 40,
      expected_overtime_hours: 12,
      expected_night_hours: 4,
      expected_holiday_hours: 8,
      base_salary_ratio_a: 1.0,
      base_salary_ratio_b: 0.6,
    },
  },
  {
    label: '교대근무',
    description: '야간·휴일근로 비중 높음',
    values: {
      monthly_total: 3200000,
      weekly_hours: 40,
      expected_overtime_hours: 10,
      expected_night_hours: 16,
      expected_holiday_hours: 8,
      base_salary_ratio_a: 1.0,
      base_salary_ratio_b: 0.7,
    },
  },
];

const STRUCTURE_PRESETS = [
  { label: '100% vs 60%', a: 1.0, b: 0.6 },
  { label: '90% vs 70%', a: 0.9, b: 0.7 },
  { label: '80% vs 50%', a: 0.8, b: 0.5 },
];

const currency = new Intl.NumberFormat('ko-KR');

export default function SalarySimulation() {
  const [request, setRequest] = useState<SimulationCompareRequest>(DEFAULT_SIMULATION_REQUEST);
  const [result, setResult] = useState<SimulationCompareResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof SimulationCompareRequest, value: number) => {
    setRequest(prev => ({ ...prev, [field]: value }));
  };

  const applyPreset = (preset: SimulationCompareRequest) => {
    setRequest(preset);
    setResult(null);
    setError(null);
  };

  const applyStructurePreset = (a: number, b: number) => {
    setRequest(prev => ({
      ...prev,
      base_salary_ratio_a: a,
      base_salary_ratio_b: b,
    }));
    setResult(null);
    setError(null);
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

  const summary = useMemo(() => {
    if (!result) return null;

    const aCost = result.plan_a.annual_employer_cost.amount;
    const bCost = result.plan_b.annual_employer_cost.amount;
    const cheaperPlan = aCost <= bCost ? result.plan_a : result.plan_b;
    const monthlyDiff = Math.round(Math.abs(result.difference.annual_cost_diff.amount) / 12);
    const overtimeGap = Math.abs(result.difference.overtime_pay_diff.amount);
    const severanceGap = Math.abs(result.difference.severance_pay_diff.amount);

    return {
      cheaperPlan,
      monthlyDiff,
      overtimeGap,
      severanceGap,
    };
  }, [result]);

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

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="text-lg font-semibold mb-3">빠른 시나리오</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {SCENARIO_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset.values)}
                    className="rounded-lg border border-gray-200 p-4 text-left transition hover:border-primary-500 hover:bg-primary-50"
                  >
                    <p className="font-semibold text-gray-900">{preset.label}</p>
                    <p className="mt-1 text-sm text-gray-500">{preset.description}</p>
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold mb-3">비교 템플릿</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {STRUCTURE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyStructurePreset(preset.a, preset.b)}
                    className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-500 hover:text-primary-700"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-6">
                기본급 비율이 높을수록 통상시급·연장수당·퇴직금·연차수당 기준이 함께 올라갑니다.
                여러 비율을 빠르게 비교해 사업장 구조에 맞는 안을 검토해보세요.
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

                <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900">
                  비교 포인트: 총 급여를 유지한 채 기본급 비율만 바꾸면 연장·야간·휴일수당과 퇴직금 기준이 어떻게 달라지는지 바로 확인할 수 있습니다.
                </div>

                <Button
                  onClick={handleSimulate}
                  disabled={isLoading}
                  className="w-full py-3"
                >
                  {isLoading ? '계산 중...' : '시뮬레이션 실행'}
                </Button>
              </div>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {result && summary && (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-green-50 border border-green-200">
                      <p className="text-sm text-green-700 mb-1">연간 인건비가 더 낮은 안</p>
                      <p className="text-xl font-semibold text-green-900">{summary.cheaperPlan.name}</p>
                    </Card>
                    <Card className="bg-slate-50 border border-slate-200">
                      <p className="text-sm text-slate-600 mb-1">월 환산 인건비 차이</p>
                      <p className="text-xl font-semibold text-slate-900">약 {currency.format(summary.monthlyDiff)}원</p>
                    </Card>
                    <Card className="bg-amber-50 border border-amber-200">
                      <p className="text-sm text-amber-700 mb-1">퇴직금 기준 차이</p>
                      <p className="text-xl font-semibold text-amber-900">{currency.format(summary.severanceGap)}원</p>
                    </Card>
                  </div>

                  <Card className="bg-blue-50 border-blue-200">
                    <h2 className="text-lg font-semibold mb-2 text-blue-900">핵심 해석</h2>
                    <p className="text-blue-800 leading-7">
                      {summary.cheaperPlan.name}이 연간 인건비 기준으로 더 유리합니다. 다만 연장수당 차이는 {currency.format(summary.overtimeGap)}원,
                      퇴직금 기준 차이는 {currency.format(summary.severanceGap)}원 수준이므로 비용 절감과 법적/운영상 안정성 사이의 균형을 함께 보시는 게 좋습니다.
                    </p>
                  </Card>

                  <Card>
                    <h2 className="text-lg font-semibold mb-4">급여 구조 비교</h2>
                    <ComparisonTable result={result} />
                  </Card>

                  <Card>
                    <h2 className="text-lg font-semibold mb-4">차이 분석</h2>
                    <DifferenceAnalysis result={result} />
                  </Card>

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
