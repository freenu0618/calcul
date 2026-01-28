/**
 * 급여대장 상세 페이지
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { payrollApi } from '../../api/payrollApi';
import { employeeApi } from '../../api/employeeApi';
import type { PayrollLedgerResponse, PayrollEntryResponse, PayrollStatus } from '../../types/payroll';
import type { EmployeeResponse } from '../../types/employee';
import type { WorkShiftRequest } from '../../types/salary';
import { formatNumber } from '../../utils/formatters';
import MonthlyTemplate from '../../components/ShiftInput/MonthlyTemplate';

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
  const [workShifts, setWorkShifts] = useState<WorkShiftRequest[]>([]);

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

  // 시프트 데이터에서 근무시간 계산
  const calculateWorkMinutes = (shifts: WorkShiftRequest[]) => {
    let totalWorkMinutes = 0;
    let overtimeMinutes = 0;
    let nightMinutes = 0;
    let holidayMinutes = 0;

    shifts.forEach((shift) => {
      const [sh, sm] = shift.start_time.split(':').map(Number);
      const [eh, em] = shift.end_time.split(':').map(Number);
      const breakMin = shift.break_minutes || 0;
      const workMin = (eh * 60 + em) - (sh * 60 + sm) - breakMin;

      totalWorkMinutes += workMin;

      // 야간근로 계산 (22:00~06:00)
      const startMinutes = sh * 60 + sm;
      const endMinutes = eh * 60 + em;
      const nightStart = 22 * 60; // 22:00
      const nightEnd = 6 * 60; // 06:00

      if (endMinutes > nightStart) {
        nightMinutes += Math.min(endMinutes, 24 * 60) - Math.max(startMinutes, nightStart);
      }
      if (startMinutes < nightEnd) {
        nightMinutes += Math.min(endMinutes, nightEnd) - startMinutes;
      }

      // 휴일근로
      if (shift.is_holiday_work) {
        holidayMinutes += workMin;
      }
    });

    // 연장근로 계산 (주 40시간 초과)
    const weeklyStandardMinutes = 40 * 60;
    const weeksInMonth = shifts.length / 5; // 대략적 계산
    const monthlyStandardMinutes = weeklyStandardMinutes * weeksInMonth;
    if (totalWorkMinutes > monthlyStandardMinutes) {
      overtimeMinutes = totalWorkMinutes - Math.round(monthlyStandardMinutes);
    }

    return { totalWorkMinutes, overtimeMinutes, nightMinutes, holidayMinutes };
  };

  const handleAddEntry = async () => {
    if (!id || !selectedEmployeeId || !baseSalary) return;

    // 시프트에서 근무시간 계산
    const workMinutes = calculateWorkMinutes(workShifts);

    try {
      const entry = await payrollApi.addEntry(Number(id), {
        employee_id: selectedEmployeeId,
        base_salary: Number(baseSalary),
        total_work_minutes: workMinutes.totalWorkMinutes,
        overtime_minutes: workMinutes.overtimeMinutes,
        night_minutes: workMinutes.nightMinutes,
        holiday_minutes: workMinutes.holidayMinutes,
      });
      setLedger((prev) =>
        prev ? { ...prev, entries: [...prev.entries, entry] } : null
      );
      setShowAddModal(false);
      resetAddForm();
    } catch (err: any) {
      alert(err.response?.data?.message || '직원 추가에 실패했습니다.');
    }
  };

  const resetAddForm = () => {
    setSelectedEmployeeId('');
    setBaseSalary('');
    setWorkShifts([]);
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

  const handleApplyTemplate = (shifts: WorkShiftRequest[]) => {
    setWorkShifts(shifts);
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

  // 시프트 요약
  const shiftSummary = workShifts.length > 0 ? calculateWorkMinutes(workShifts) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/payroll')} className="p-2 hover:bg-gray-100 rounded-lg">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {period.year}년 {period.month}월 급여대장
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}>
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
              확정
            </button>
          )}
          {period.status === 'CONFIRMED' && (
            <>
              <button
                onClick={() => handleStatusChange('DRAFT')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                수정
              </button>
              <button
                onClick={() => handleStatusChange('PAID')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
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
          <p className="text-2xl font-bold text-gray-900">₩{formatNumber(period.total_gross)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">총 실수령액</p>
          <p className="text-2xl font-bold text-primary-600">₩{formatNumber(period.total_net_pay)}</p>
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
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">person_add</span>
            직원 추가
          </button>
        </div>
      )}

      {/* 급여 테이블 */}
      {entries.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <span className="material-symbols-outlined text-6xl text-gray-300">group_add</span>
          <p className="mt-4 text-gray-500">등록된 직원이 없습니다</p>
          <button onClick={() => setShowAddModal(true)} className="mt-4 text-primary-600 hover:underline">
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
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">근무시간</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">기본급</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">수당</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">총 지급액</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">실수령액</th>
                  {isDraft && <th className="px-4 py-3 w-10"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((entry) => (
                  <EntryRow key={entry.id} entry={entry} isDraft={isDraft} onRemove={() => handleRemoveEntry(entry.id)} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 직원 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">직원 급여 추가</h2>

            <div className="space-y-6">
              {/* 직원 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">직원 선택</label>
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

              {/* 기본급 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">계약 기본급 (원)</label>
                <input
                  type="number"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  placeholder="2800000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">계약된 월 기본급을 입력하세요</p>
              </div>

              {/* 근무 시프트 템플릿 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">실제 근무 시간 설정</label>
                <MonthlyTemplate year={period.year} month={period.month} onApply={handleApplyTemplate} />
              </div>

              {/* 시프트 요약 */}
              {shiftSummary && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">근무시간 요약</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-blue-600">총 근무시간:</span>{' '}
                      <span className="font-medium">{Math.floor(shiftSummary.totalWorkMinutes / 60)}시간 {shiftSummary.totalWorkMinutes % 60}분</span>
                    </div>
                    <div>
                      <span className="text-blue-600">근무일수:</span>{' '}
                      <span className="font-medium">{workShifts.length}일</span>
                    </div>
                    {shiftSummary.overtimeMinutes > 0 && (
                      <div>
                        <span className="text-orange-600">연장근로:</span>{' '}
                        <span className="font-medium">{Math.floor(shiftSummary.overtimeMinutes / 60)}시간</span>
                      </div>
                    )}
                    {shiftSummary.nightMinutes > 0 && (
                      <div>
                        <span className="text-purple-600">야간근로:</span>{' '}
                        <span className="font-medium">{Math.floor(shiftSummary.nightMinutes / 60)}시간</span>
                      </div>
                    )}
                    {shiftSummary.holidayMinutes > 0 && (
                      <div>
                        <span className="text-red-600">휴일근로:</span>{' '}
                        <span className="font-medium">{Math.floor(shiftSummary.holidayMinutes / 60)}시간</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetAddForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleAddEntry}
                disabled={!selectedEmployeeId || !baseSalary || workShifts.length === 0}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
              >
                급여 계산 및 추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 급여 행 컴포넌트
function EntryRow({ entry, isDraft, onRemove }: { entry: PayrollEntryResponse; isDraft: boolean; onRemove: () => void }) {
  const totalAllowances =
    (entry.overtime_pay || 0) + (entry.night_pay || 0) + (entry.holiday_pay || 0) + (entry.weekly_holiday_pay || 0);
  const workHours = Math.floor((entry.total_work_minutes || 0) / 60);
  const workMins = (entry.total_work_minutes || 0) % 60;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <span className="font-medium text-gray-900">{entry.employee_name || '이름 없음'}</span>
      </td>
      <td className="px-4 py-3 text-right text-gray-600">
        {workHours > 0 ? `${workHours}시간 ${workMins > 0 ? `${workMins}분` : ''}` : '-'}
      </td>
      <td className="px-4 py-3 text-right text-gray-700">₩{formatNumber(entry.base_salary)}</td>
      <td className="px-4 py-3 text-right text-blue-600">+₩{formatNumber(totalAllowances)}</td>
      <td className="px-4 py-3 text-right font-medium text-gray-900">₩{formatNumber(entry.total_gross || entry.base_salary)}</td>
      <td className="px-4 py-3 text-right font-bold text-primary-600">₩{formatNumber(entry.net_pay || entry.base_salary)}</td>
      {isDraft && (
        <td className="px-4 py-3">
          <button onClick={onRemove} className="p-1 text-gray-400 hover:text-red-500 rounded">
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </td>
      )}
    </tr>
  );
}
