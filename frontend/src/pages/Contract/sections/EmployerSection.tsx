/**
 * 사업주 정보 섹션
 */

import Input from '../../../components/common/Input';
import type { LaborContract } from '../../../types/contract';

interface Props {
  employer: LaborContract['employer'];
  onChange: (employer: LaborContract['employer']) => void;
}

export default function EmployerSection({ employer, onChange }: Props) {
  const handleChange = (field: keyof LaborContract['employer'], value: string) => {
    onChange({ ...employer, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="상호 (회사명)"
        value={employer.company_name}
        onChange={(e) => handleChange('company_name', e.target.value)}
        placeholder="(주)페이툴스"
        required
      />
      <Input
        label="대표자명"
        value={employer.representative_name}
        onChange={(e) => handleChange('representative_name', e.target.value)}
        placeholder="홍길동"
        required
      />
      <Input
        label="사업자등록번호"
        value={employer.business_number}
        onChange={(e) => handleChange('business_number', e.target.value)}
        placeholder="123-45-67890"
        required
      />
      <Input
        label="연락처"
        type="tel"
        value={employer.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        placeholder="02-1234-5678"
      />
      <div className="md:col-span-2">
        <Input
          label="사업장 주소"
          value={employer.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="서울특별시 강남구 테헤란로 123"
          required
        />
      </div>
    </div>
  );
}
