/**
 * 근로자 정보 입력 폼 컴포넌트
 */

import type { Employee, EmploymentType, CompanySize } from '../../types/models';
import Input from '../common/Input';

interface EmployeeInfoFormProps {
  employee: Employee;
  onChange: (employee: Employee) => void;
}

export default function EmployeeInfoForm({ employee, onChange }: EmployeeInfoFormProps) {
  const handleChange = (field: keyof Employee, value: string | number) => {
    onChange({ ...employee, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">근로자 정보</h3>

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
    </div>
  );
}
