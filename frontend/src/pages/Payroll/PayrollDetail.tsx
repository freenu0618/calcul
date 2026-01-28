/**
 * 급여대장 상세 페이지
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { payrollApi } from '../../api/payrollApi';
import { employeeApi } from '../../api/employeeApi';
import type { PayrollLedgerResponse, PayrollEntryResponse, PayrollStatus } from '../../types/payroll';
import type { EmployeeResponse } from '../../types/employee';
import { formatNumber } from '../../utils/formatters';

const STATUS_LABELS: Record<string, { text: string; className: string; icon: string }> = {
  DRAFT: { text: '작성중', className: 'bg-gray-100 text-gray-700', icon: 'edit_note' },
  CONFIRMED: { text: '확정', className: 'bg-blue-100 text-blue-700', icon: 'check_circle' },
  PAID: { text: '지급완료', className: 'bg-green-100 text-green-700', icon: 'paid' },
};

export default function PayrollDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ledger, setLedger] = useState<PayrollLedgerResponse | null>(null);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [baseSalary, setBaseSalary] = useState('');

  useEffect(() => {
    if (id) {
      loadData(Number(id));
    }
  }, [id]);

  const loadData = async (periodId: number) => {
    setIsLoading(true);
    try {
      const [ledgerRes, employeesRes] = await Promise.all([
        payrollApi.getLedger(periodId),
        employeeApi.getEmployees(),
      ]);
      setLedger(ledgerRes);
      setEmployees(employeesRes.employees || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: PayrollStatus) => {
    if (!id || !ledger) return;
    try {
      const updated = await payrollApi.updatePeriodStatus(Number(id), { status: newStatus });
      setLedger({ ...ledger, period: { ...ledger.period, status: updated.status } });
    } catch (err: any) {
      alert(err.response?.data?.message || '상태 변경에 실패했습니다.');
    }
  };

  const handleAddEntry = async () => {
    if (!id || !selectedEmployeeId || !baseSalary) return;
    try {
      const entry = await payrollApi.addEntry(Number(id), {
        employee_id: selectedEmployeeId,
        base_salary: Number(baseSalary),
      });
      setLedger((prev) =>
        prev ? { ...prev, entries: [...prev.entries, entry] } : null
      );
      setShowAddModal(false);
      setSelectedEmployeeId('');
      setBaseSalary('');
    } catch (err: any) {
      alert(err.response?.data?.message || '직원 추가에 실패했습니다.');
    }
  };

  const handleRemoveEntry = async (entryId: number) => {
    if (!id || !confirm('이 직원의 급여 정보를 삭제하시겠습니까?')) return;
    try {
      await payrollApi.removeEntry(Number(id), entryId);
      setLedger((prev) =>
        prev ? { ...prev, entries: prev.entries.filter((e) => e.id !== entryId) } : null
      );
    } catch (err: any) {
      alert(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  // 이미 추가된 직원 제외
  const availableEmployees = employees.filter(
    (emp) => !ledger?.entries.some((e) => e.employee_id === emp.id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!ledger) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">급여대장을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const { period, entries } = ledger;
  const statusInfo = STATUS_LABELS[period.status];
  const isDraft = period.status === 'DRAFT';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/payroll')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {period.year}년 {period.month}월 급여대장
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}>
                <span className="material-symbols-outlined text-sm align-middle mr-1">
                  {statusInfo.icon}
                </span>
                {statusInfo.text}
              </span>
              {period.employee_count}명 등록
            </div>
          </div>
        </div>

        {/* 상태 변경 버튼 */}
        <div className="flex gap-2">
          {isDraft && entries.length > 0 && (
            <button
              onClick={() => handleStatusChange('CONFIRMED')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <span className="material-symbols-outlined">check</span>
              확정
            </button>
          )}
          {period.status === 'CONFIRMED' && (
            <>
              <button
                onClick={() => handleStatusChange('DRAFT')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                수정
              </button>
              <button
                onClick={() => handleStatusChange('PAID')}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <span className="material-symbols-outlined">paid</span>
                지급 완료
              </button>
            </>
          )}
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">총 지급액</p>
          <p className="text-2xl font-bold text-gray-900">
            ₩{formatNumber(period.total_gross)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">총 실수령액</p>
          <p className="text-2xl font-bold text-primary-600">
            ₩{formatNumber(period.total_net_pay)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">총 공제액</p>
          <p className="text-2xl font-bold text-red-600">
            ₩{formatNumber(period.total_gross - period.total_net_pay)}
          </p>
        </div>
      </div>

      {/* 직원 추가 버튼 */}
      {isDraft && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowAddModal(true)}
            disabled={availableEmployees.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">person_add</span>
            직원 추가
          </button>
        </div>
      )}

      {/* 급여 테이블 */}
      {entries.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <span className="material-symbols-outlined text-6xl text-gray-300">
            group_add
          </span>
          <p className="mt-4 text-gray-500">등록된 직원이 없습니다</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 text-primary-600 hover:underline"
          >
            직원 추가하기
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">이름</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">기본급</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">수당</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">총 지급액</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">공제액</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">실수령액</th>
                  {isDraft && <th className="px-4 py-3 w-10"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    isDraft={isDraft}
                    onRemove={() => handleRemoveEntry(entry.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 직원 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">직원 추가</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  직원 선택
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- 선택 --</option>
                  {availableEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employment_type === 'FULL_TIME' ? '정규직' : '시간제'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  기본급 (원)
                </label>
                <input
                  type="number"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  placeholder="2800000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleAddEntry}
                disabled={!selectedEmployeeId || !baseSalary}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 급여 행 컴포넌트
function EntryRow({
  entry,
  isDraft,
  onRemove,
}: {
  entry: PayrollEntryResponse;
  isDraft: boolean;
  onRemove: () => void;
}) {
  const totalAllowances = (entry.overtime_pay || 0) + (entry.night_pay || 0) +
    (entry.holiday_pay || 0) + (entry.weekly_holiday_pay || 0);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <span className="font-medium text-gray-900">{entry.employee_name || '이름 없음'}</span>
      </td>
      <td className="px-4 py-3 text-right text-gray-700">
        ₩{formatNumber(entry.base_salary)}
      </td>
      <td className="px-4 py-3 text-right text-blue-600">
        +₩{formatNumber(totalAllowances)}
      </td>
      <td className="px-4 py-3 text-right font-medium text-gray-900">
        ₩{formatNumber(entry.total_gross || entry.base_salary)}
      </td>
      <td className="px-4 py-3 text-right text-red-600">
        -₩{formatNumber(entry.total_deductions || 0)}
      </td>
      <td className="px-4 py-3 text-right font-bold text-primary-600">
        ₩{formatNumber(entry.net_pay || entry.base_salary)}
      </td>
      {isDraft && (
        <td className="px-4 py-3">
          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-500 rounded"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </td>
      )}
    </tr>
  );
}
