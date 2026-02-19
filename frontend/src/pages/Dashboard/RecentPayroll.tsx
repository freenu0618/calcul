/**
 * 대시보드 - 최근 급여대장 위젯
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { payrollApi } from '../../api/payrollApi';
import type { PayrollPeriodResponse } from '../../types/payroll';
import { formatNumber } from '../../utils/formatters';
import PageLoader from '../../components/common/PageLoader';

const STATUS_LABELS: Record<string, { text: string; className: string }> = {
  DRAFT: { text: '작성중', className: 'bg-gray-100 text-gray-700' },
  CONFIRMED: { text: '확정', className: 'bg-blue-100 text-blue-700' },
  PAID: { text: '지급완료', className: 'bg-green-100 text-green-700' },
};

export default function RecentPayroll() {
  const [periods, setPeriods] = useState<PayrollPeriodResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    payrollApi
      .getPeriods()
      .then((res) => setPeriods((res.periods || []).slice(0, 3)))
      .catch(() => setPeriods([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <PageLoader minHeight="min-h-[100px]" />;

  if (periods.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="font-medium">아직 급여 기록이 없습니다</p>
        <p className="text-sm text-gray-400 mt-1">급여를 계산하면 여기에 기록이 표시됩니다</p>
        <Link to="/calculator" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
          첫 급여 계산하기 →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {periods.map((period) => (
        <Link
          key={period.id}
          to={`/payroll/${period.id}`}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div>
            <p className="font-medium text-gray-900">
              {period.year}년 {period.month}월
            </p>
            <p className="text-sm text-gray-500">
              {period.employee_count}명 · ₩{formatNumber(period.total_net_pay)}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_LABELS[period.status]?.className || ''}`}>
            {STATUS_LABELS[period.status]?.text || period.status}
          </span>
        </Link>
      ))}
      <Link to="/payroll" className="block text-center text-sm text-blue-600 hover:underline pt-2">
        전체 보기 →
      </Link>
    </div>
  );
}
