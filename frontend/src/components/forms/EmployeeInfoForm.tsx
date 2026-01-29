/**
 * 근로자 정보 입력 폼 컴포넌트
 * - 로그인 사용자: 등록된 근무자 불러오기 기능 제공
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Employee, EmploymentType, CompanySize, VisaType } from '../../types/models';
import type { EmployeeResponse } from '../../types/employee';
import { useAuth } from '../../contexts/AuthContext';
import { employeeApi } from '../../api/employeeApi';
import Input from '../common/Input';

interface EmployeeInfoFormProps {
  employee: Employee;
  onChange: (employee: Employee) => void;
}

export default function EmployeeInfoForm({ employee, onChange }: EmployeeInfoFormProps) {
  const { isAuthenticated } = useAuth();
  const [savedEmployees, setSavedEmployees] = useState<EmployeeResponse[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  // 로그인 상태일 때 등록된 근무자 목록 조회
  useEffect(() => {
    if (isAuthenticated) {
      loadSavedEmployees();
    }
  }, [isAuthenticated]);

  const loadSavedEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      const response = await employeeApi.getEmployees();
      setSavedEmployees(response.employees || []);
    } catch {
      console.error('근무자 목록 조회 실패');
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  // 저장된 근무자 선택 시 정보 자동 입력
  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    if (!employeeId) return;

    const selected = savedEmployees.find(e => e.id === employeeId);
    if (selected) {
      onChange({
        ...employee,
        name: selected.name,
        employment_type: selected.employment_type,
        company_size: selected.company_size,
        scheduled_work_days: selected.weekly_work_days,
        daily_work_hours: selected.daily_work_hours,
      });
    }
  };

  const handleChange = (field: keyof Employee, value: string | number | boolean) => {
    setSelectedEmployeeId(''); // 수동 변경 시 선택 해제
    onChange({ ...employee, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">근로자 정보</h3>

      {/* 로그인 사용자: 저장된 근무자 불러오기 */}
      {isAuthenticated && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <label className="block text-sm font-medium text-blue-900 mb-2">
            <span className="material-symbols-outlined text-[16px] align-middle mr-1">person_search</span>
            저장된 근무자 불러오기
          </label>
          {isLoadingEmployees ? (
            <p className="text-sm text-blue-600">불러오는 중...</p>
          ) : savedEmployees.length > 0 ? (
            <select
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={selectedEmployeeId}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
            >
              <option value="">-- 근무자 선택 --</option>
              {savedEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employment_type === 'FULL_TIME' ? '정규직' : '시간제'}, {emp.work_start_time}~{emp.work_end_time})
                </option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-blue-600">
              등록된 근무자가 없습니다.{' '}
              <Link to="/employees/new" className="underline font-medium">
                근무자 등록하기
              </Link>
            </div>
          )}
          {selectedEmployeeId && (
            <p className="mt-2 text-xs text-blue-700">
              ✓ 근무자 정보가 자동으로 입력되었습니다
            </p>
          )}
        </div>
      )}

      <Input
        type="text"
        label="이름"
        value={employee.name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder="홍길동"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          고용 형태
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={employee.employment_type}
          onChange={(e) => handleChange('employment_type', e.target.value as EmploymentType)}
        >
          <option value="FULL_TIME">정규직 </option>
          <option value="PART_TIME">시간제 (단시간 근로)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          사업장 규모
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={employee.company_size}
          onChange={(e) => handleChange('company_size', e.target.value as CompanySize)}
        >
          <option value="OVER_5">5인 이상 사업장</option>
          <option value="UNDER_5">5인 미만 사업장</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          휴일근로 8시간 초과 시 가산율에 영향
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          주 소정근로일 (계약)
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={employee.scheduled_work_days}
          onChange={(e) => handleChange('scheduled_work_days', parseInt(e.target.value))}
        >
          <option value={4}>주 4일</option>
          <option value={5}>주 5일</option>
          <option value={6}>주 6일</option>
          <option value={7}>주 7일</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          개근 여부 판단 기준 (실제 근무일 ≥ 소정근로일 → 주휴수당)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          1일 소정근로시간
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={employee.daily_work_hours}
          onChange={(e) => handleChange('daily_work_hours', parseInt(e.target.value))}
        >
          {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
            <option key={h} value={h}>{h}시간</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-blue-600 font-medium">
          → 주 소정근로시간: {employee.scheduled_work_days * employee.daily_work_hours}시간
        </p>
      </div>

      <Input
        type="number"
        label="부양가족 수 (본인 포함)"
        value={employee.dependents_count}
        onChange={(e) => handleChange('dependents_count', parseInt(e.target.value) || 0)}
        min={1}
        placeholder="2"
        required
      />

      <Input
        type="number"
        label="20세 이하 자녀 수"
        value={employee.children_under_20}
        onChange={(e) => handleChange('children_under_20', parseInt(e.target.value) || 0)}
        min={0}
        placeholder="1"
      />
      <p className="text-xs text-gray-500 -mt-2">
        자녀세액공제 적용 (부양가족 수 이하)
      </p>

      {/* 만 나이 (60세 이상 국민연금 제외 안내용) */}
      <Input
        type="number"
        label="만 나이 (선택)"
        value={employee.age || ''}
        onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
        min={15}
        max={100}
        placeholder="30"
      />
      {employee.age && employee.age >= 60 && (
        <p className="text-xs text-amber-600 -mt-2">
          ⚠️ 만 60세 이상: 국민연금 의무가입 대상 아님
        </p>
      )}

      {/* 외국인 여부 */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={employee.is_foreigner || false}
            onChange={(e) => {
              handleChange('is_foreigner', e.target.checked);
              if (!e.target.checked) {
                handleChange('visa_type', undefined as unknown as string);
              }
            }}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm text-gray-700">외국인 근로자</span>
        </label>
      </div>

      {/* 체류자격 (외국인만) */}
      {employee.is_foreigner && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            체류자격
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={employee.visa_type || ''}
            onChange={(e) => handleChange('visa_type', e.target.value as VisaType)}
          >
            <option value="">-- 선택 --</option>
            <option value="F-2">F-2 (거주)</option>
            <option value="F-4">F-4 (재외동포)</option>
            <option value="F-5">F-5 (영주)</option>
            <option value="F-6">F-6 (결혼이민)</option>
            <option value="E-9">E-9 (비전문취업)</option>
            <option value="H-2">H-2 (방문취업)</option>
            <option value="D-7">D-7 (주재)</option>
            <option value="D-8">D-8 (기업투자)</option>
            <option value="D-9">D-9 (무역경영)</option>
            <option value="OTHER">기타</option>
          </select>
          <p className="mt-1 text-xs text-blue-600">
            체류자격에 따라 4대 보험 적용이 달라집니다
          </p>
        </div>
      )}
    </div>
  );
}
