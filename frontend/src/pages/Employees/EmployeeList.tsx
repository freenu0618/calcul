/**
 * 직원 목록 페이지
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { employeeApi } from '../../api/employeeApi';
import type { EmployeeResponse } from '../../types/employee';
import { exportEmployeeListXlsx } from '../../utils/excelExport';
import { useSubscription } from '../../hooks/useSubscription';
import UpgradeModal from '../../components/UpgradeModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageLoader from '../../components/common/PageLoader';

export default function EmployeeList() {
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchName, setSearchName] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const { canAddEmployee } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeApi.getEmployees();
      setEmployees(response.employees);
      setError(null);
    } catch (err) {
      setError('직원 목록을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchName.trim()) {
      loadEmployees();
      return;
    }
    try {
      setLoading(true);
      const response = await employeeApi.searchEmployeesByName(searchName);
      setEmployees(response.employees);
      setError(null);
    } catch (err) {
      setError('검색에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await employeeApi.deleteEmployee(deleteTarget.id);
      setEmployees(employees.filter((e) => e.id !== deleteTarget.id));
    } catch (err) {
      setError('삭제에 실패했습니다.');
      console.error(err);
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <Helmet>
        <title>직원 관리 - paytools</title>
      </Helmet>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} reason="employees" />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="직원 삭제"
        message={`정말 ${deleteTarget?.name} 직원을 삭제하시겠습니까?`}
        confirmLabel="삭제"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-main">직원 관리</h1>
            <p className="text-text-sub mt-1">등록된 직원: {employees.length}명</p>
          </div>
          <div className="flex gap-2">
            {employees.length > 0 && (
              <button
                onClick={() => exportEmployeeListXlsx(employees)}
                className="px-4 py-3 border border-gray-200 text-text-main rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                Excel
              </button>
            )}
            <button
              onClick={() => canAddEmployee() ? navigate('/employees/new') : setShowUpgrade(true)}
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-600 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined">person_add</span>
              직원 등록
            </button>
          </div>
        </div>

        {/* 검색 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="이름으로 검색..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-gray-100 text-text-main rounded-lg hover:bg-gray-200 transition-colors"
            >
              검색
            </button>
            {searchName && (
              <button
                onClick={() => {
                  setSearchName('');
                  loadEmployees();
                }}
                className="px-4 py-2 text-text-sub hover:text-text-main transition-colors"
              >
                초기화
              </button>
            )}
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* 로딩 */}
        {loading ? (
          <PageLoader minHeight="min-h-[200px]" />
        ) : employees.length === 0 ? (
          <EmptyState />
        ) : (
          <EmployeeTable employees={employees} onDelete={handleDelete} />
        )}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
      <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">group_off</span>
      <h3 className="text-lg font-semibold text-text-main mb-2">등록된 직원이 없습니다</h3>
      <p className="text-text-sub mb-2">직원을 등록하면 급여 계산과 급여대장 관리가 가능합니다</p>
      <p className="text-sm text-gray-400 mb-6">첫 번째 직원을 등록해보세요.</p>
      <Link
        to="/employees/new"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-600 transition-colors"
      >
        <span className="material-symbols-outlined">person_add</span>
        직원 등록하기
      </Link>
    </div>
  );
}

interface EmployeeTableProps {
  employees: EmployeeResponse[];
  onDelete: (id: string, name: string) => void;
}

function EmployeeTable({ employees, onDelete }: EmployeeTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-text-main">이름</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-text-main">나이</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-text-main">고용형태</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-text-main">근무시간</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-text-main">상태</th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-text-main">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {employees.map((employee) => (
            <EmployeeRow key={employee.id} employee={employee} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface EmployeeRowProps {
  employee: EmployeeResponse;
  onDelete: (id: string, name: string) => void;
}

function EmployeeRow({ employee, onDelete }: EmployeeRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold">{employee.name.charAt(0)}</span>
          </div>
          <div>
            <p className="font-medium text-text-main">{employee.name}</p>
            <p className="text-xs text-text-sub">
              {employee.is_foreigner && <span className="mr-1">🌏 {employee.visa_type}</span>}
              입사 {employee.contract_start_date}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-text-sub">만 {employee.age}세</td>
      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            employee.employment_type === 'FULL_TIME'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-orange-100 text-orange-700'
          }`}
        >
          {employee.employment_type === 'FULL_TIME' ? '정규직' : '파트타임'}
        </span>
      </td>
      <td className="px-6 py-4 text-text-sub text-sm">
        {employee.work_start_time.slice(0, 5)} - {employee.work_end_time.slice(0, 5)}
        <span className="text-xs ml-1">(휴게 {employee.break_minutes}분)</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          {employee.is_in_probation && (
            <span className="px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700 w-fit">
              수습중
            </span>
          )}
          {!employee.is_pension_eligible && (
            <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600 w-fit">
              연금제외
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          <Link
            to={`/employees/${employee.id}/edit`}
            className="p-2 text-text-sub hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
          </Link>
          <button
            onClick={() => onDelete(employee.id, employee.name)}
            className="p-2 text-text-sub hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-xl">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
