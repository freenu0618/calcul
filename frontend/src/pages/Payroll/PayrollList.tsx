/**
 * 급여대장 목록 페이지
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { payrollApi } from '../../api/payrollApi';
import type { PayrollPeriodResponse } from '../../types/payroll';
import { formatNumber } from '../../utils/formatters';
import { exportPayrollSummaryXlsx } from '../../utils/excelExport';

const STATUS_LABELS: Record<string, { text: string; className: string }> = {
  DRAFT: { text: '작성중', className: 'bg-gray-100 text-gray-700' },
  CONFIRMED: { text: '확정', className: 'bg-blue-100 text-blue-700' },
  PAID: { text: '지급완료', className: 'bg-green-100 text-green-700' },
};

export default function PayrollList() {
  const navigate = useNavigate();
  const [periods, setPeriods] = useState<PayrollPeriodResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPeriod, setNewPeriod] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  useEffect(() => {
    loadPeriods();
  }, []);

  const loadPeriods = async () => {
    setIsLoading(true);
    try {
      const response = await payrollApi.getPeriods();
      setPeriods(response.periods || []);
    } catch (err) {
      setError('급여 기간 목록을 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePeriod = async () => {
    try {
      const response = await payrollApi.createPeriod(newPeriod);
      setShowCreateModal(false);
      navigate(`/payroll/${response.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || '급여 기간 생성에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">급여대장</h1>
          <p className="text-gray-600 mt-1">월별 급여 내역을 관리합니다</p>
        </div>
        <div className="flex gap-2">
          {periods.length > 0 && (
            <button
              onClick={() => exportPayrollSummaryXlsx(periods)}
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Excel
            </button>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            새 급여 기간
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* 급여 기간 목록 */}
      {periods.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <span className="material-symbols-outlined text-6xl text-gray-300">
            description
          </span>
          <p className="mt-4 text-gray-500">등록된 급여 기간이 없습니다</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 text-primary-600 hover:underline"
          >
            새 급여 기간 만들기
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {periods.map((period) => (
            <Link
              key={period.id}
              to={`/payroll/${period.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-primary-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary-600">
                      calendar_month
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {period.year}년 {period.month}월
                    </h3>
                    <p className="text-sm text-gray-500">
                      {period.employee_count}명 | 총 지급액 ₩{formatNumber(period.total_gross)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      STATUS_LABELS[period.status]?.className || ''
                    }`}
                  >
                    {STATUS_LABELS[period.status]?.text || period.status}
                  </span>
                  <span className="material-symbols-outlined text-gray-400">
                    chevron_right
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 새 급여 기간 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              새 급여 기간 생성
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    연도
                  </label>
                  <select
                    value={newPeriod.year}
                    onChange={(e) =>
                      setNewPeriod({ ...newPeriod, year: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {[2024, 2025, 2026, 2027].map((year) => (
                      <option key={year} value={year}>
                        {year}년
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    월
                  </label>
                  <select
                    value={newPeriod.month}
                    onChange={(e) =>
                      setNewPeriod({ ...newPeriod, month: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>
                        {month}월
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleCreatePeriod}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
