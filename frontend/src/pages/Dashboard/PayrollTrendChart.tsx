/**
 * 대시보드 - 인건비 추이 차트 위젯
 * 기존 급여대장 데이터로 월별 추이 시각화
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { payrollApi } from '../../api/payrollApi';
import type { PayrollPeriodResponse } from '../../types/payroll';
import LineChart from '../../components/charts/LineChart';
import { formatNumber } from '../../utils/formatters';

export default function PayrollTrendChart() {
  const [periods, setPeriods] = useState<PayrollPeriodResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    payrollApi
      .getPeriods()
      .then((res) => {
        const sorted = (res.periods || [])
          .sort((a, b) => a.year * 100 + a.month - (b.year * 100 + b.month))
          .slice(-6);
        setPeriods(sorted);
      })
      .catch(() => setPeriods([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (periods.length < 2) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 mx-auto mb-3 bg-gray-100 rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-gray-400 text-[28px]">trending_up</span>
        </div>
        <p className="text-gray-500 text-sm">2개월 이상 급여대장이 있으면</p>
        <p className="text-gray-500 text-sm mb-3">인건비 추이를 확인할 수 있습니다.</p>
        <Link to="/payroll" className="text-primary hover:underline text-sm">
          급여대장 만들기 →
        </Link>
      </div>
    );
  }

  const chartData = periods.map((p) => ({
    name: `${p.month}월`,
    총지급액: p.total_gross,
    실수령액: p.total_net_pay,
  }));

  const latestGross = periods[periods.length - 1].total_gross;
  const prevGross = periods[periods.length - 2].total_gross;
  const diff = prevGross > 0 ? ((latestGross - prevGross) / prevGross) * 100 : 0;
  const diffFormatted = diff >= 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900">₩{formatNumber(latestGross)}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            diff >= 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
            {diffFormatted}
          </span>
        </div>
        <span className="text-xs text-gray-400">최근 {periods.length}개월</span>
      </div>
      <LineChart
        data={chartData}
        lines={[
          { dataKey: '총지급액', color: '#3b82f6', name: '총지급액', strokeWidth: 2 },
          { dataKey: '실수령액', color: '#0dba7d', name: '실수령액', strokeWidth: 2 },
        ]}
        height={200}
        showLegend={true}
        showGrid={false}
      />
    </div>
  );
}
