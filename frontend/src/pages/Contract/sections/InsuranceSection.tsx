/**
 * 4대 보험 섹션
 */

import type { LaborContract } from '../../../types/contract';

interface Props {
  insurance: LaborContract['social_insurance'];
  onChange: (insurance: LaborContract['social_insurance']) => void;
}

export default function InsuranceSection({ insurance, onChange }: Props) {
  const handleChange = (field: keyof typeof insurance, checked: boolean) => {
    onChange({ ...insurance, [field]: checked });
  };

  const insuranceItems = [
    { key: 'national_pension', label: '국민연금' },
    { key: 'health_insurance', label: '건강보험' },
    { key: 'employment_insurance', label: '고용보험' },
    { key: 'industrial_accident', label: '산재보험' },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {insuranceItems.map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={insurance[key]}
              onChange={(e) => handleChange(key, e.target.checked)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
        <p className="font-medium mb-1">4대 보험 요율 안내 (2026년)</p>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>국민연금: 근로자 4.75% + 사업주 4.75%</li>
          <li>건강보험: 근로자 3.595% + 사업주 3.595%</li>
          <li>고용보험: 근로자 0.9% + 사업주 0.9~1.65%</li>
          <li>산재보험: 사업주 전액 부담</li>
        </ul>
      </div>
    </div>
  );
}
