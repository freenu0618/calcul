import React, { useState, useEffect } from 'react';
import type { EmployeeRequest, EmploymentType, CompanySize } from '../../types/salary';
import FormField from './FormField';
import RadioGroup from './RadioGroup';

/**
 * 근로자 정보 입력 폼 컴포넌트
 *
 * @description 근로자의 기본 정보를 입력받는 폼.
 * 입력 검증 및 실시간 에러 표시 기능 포함.
 *
 * @example
 * <EmployeeForm
 *   onChange={(data) => console.log(data)}
 *   initialData={{ name: '홍길동', dependents_count: 2 }}
 * />
 */
interface EmployeeFormProps {
  onChange: (data: EmployeeRequest) => void;
  initialData?: Partial<EmployeeRequest>;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ onChange, initialData }) => {
  const [formData, setFormData] = useState<EmployeeRequest>({
    name: initialData?.name || '',
    dependents_count: initialData?.dependents_count || 0,
    children_under_20: initialData?.children_under_20 || 0,
    employment_type: initialData?.employment_type || 'FULL_TIME',
    company_size: initialData?.company_size || 'OVER_5',
    scheduled_work_days: initialData?.scheduled_work_days || 5,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeRequest, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof EmployeeRequest, boolean>>>({});

  // 검증 함수
  const validateForm = (data: EmployeeRequest): Partial<Record<keyof EmployeeRequest, string>> => {
    const newErrors: Partial<Record<keyof EmployeeRequest, string>> = {};

    if (!data.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (data.dependents_count < 0) {
      newErrors.dependents_count = '부양가족 수는 0 이상이어야 합니다.';
    }

    if (data.children_under_20 < 0) {
      newErrors.children_under_20 = '20세 이하 자녀 수는 0 이상이어야 합니다.';
    }

    if (data.children_under_20 > data.dependents_count) {
      newErrors.children_under_20 = '20세 이하 자녀 수는 부양가족 수를 초과할 수 없습니다.';
    }

    return newErrors;
  };

  // 폼 데이터 변경 시 검증 및 부모 컴포넌트에 전달
  useEffect(() => {
    const newErrors = validateForm(formData);
    setErrors(newErrors);

    // 에러가 없으면 부모에게 전달
    if (Object.keys(newErrors).length === 0) {
      onChange(formData);
    }
  }, [formData, onChange]);

  const handleInputChange = (field: keyof EmployeeRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: keyof EmployeeRequest) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const employmentTypeOptions = [
    { value: 'FULL_TIME', label: '정규직' },
    { value: 'PART_TIME', label: '비정규직' },
  ];

  const companySizeOptions = [
    { value: 'UNDER_5', label: '5인 미만' },
    { value: 'OVER_5', label: '5인 이상' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">근로자 정보</h2>

      {/* 이름 입력 */}
      <FormField
        id="name"
        label="이름"
        type="text"
        value={formData.name}
        onChange={(value) => handleInputChange('name', value)}
        onBlur={() => handleBlur('name')}
        error={errors.name}
        touched={touched.name}
        required
        placeholder="예: 홍길동"
      />

      {/* 부양가족 수 입력 */}
      <FormField
        id="dependents_count"
        label="부양가족 수 (본인 제외)"
        type="number"
        value={formData.dependents_count}
        onChange={(value) => handleInputChange('dependents_count', parseInt(value) || 0)}
        onBlur={() => handleBlur('dependents_count')}
        error={errors.dependents_count}
        touched={touched.dependents_count}
        min={0}
      />

      {/* 20세 이하 자녀 수 입력 */}
      <FormField
        id="children_under_20"
        label="20세 이하 자녀 수"
        type="number"
        value={formData.children_under_20}
        onChange={(value) => handleInputChange('children_under_20', parseInt(value) || 0)}
        onBlur={() => handleBlur('children_under_20')}
        error={errors.children_under_20}
        touched={touched.children_under_20}
        min={0}
        max={formData.dependents_count}
      />

      {/* 고용 형태 선택 */}
      <RadioGroup
        name="employment_type"
        legend="고용 형태"
        options={employmentTypeOptions}
        value={formData.employment_type}
        onChange={(value) => handleInputChange('employment_type', value as EmploymentType)}
      />

      {/* 사업장 규모 선택 */}
      <RadioGroup
        name="company_size"
        legend="사업장 규모"
        options={companySizeOptions}
        value={formData.company_size}
        onChange={(value) => handleInputChange('company_size', value as CompanySize)}
      />
    </div>
  );
};

export default EmployeeForm;
