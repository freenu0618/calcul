/**
 * 근로자 정보 섹션
 */

import Input from '../../../components/common/Input';
import type { LaborContract } from '../../../types/contract';

interface Props {
  employee: LaborContract['employee'];
  onChange: (employee: LaborContract['employee']) => void;
}

export default function EmployeeSection({ employee, onChange }: Props) {
  const handleChange = (field: keyof LaborContract['employee'], value: string) => {
    onChange({ ...employee, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="성명"
        value={employee.name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder="김철수"
        required
      />
      <Input
        label="주민등록번호 (앞 7자리)"
        value={employee.resident_id_prefix}
        onChange={(e) => handleChange('resident_id_prefix', e.target.value)}
        placeholder="900101-1"
        maxLength={8}
        required
      />
      <Input
        label="연락처"
        type="tel"
        value={employee.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        placeholder="010-1234-5678"
      />
      <div className="md:col-span-2">
        <Input
          label="주소"
          value={employee.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="서울특별시 서초구 서초대로 456"
        />
      </div>
    </div>
  );
}
