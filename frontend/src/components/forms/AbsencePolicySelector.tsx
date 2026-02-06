/**
 * 결근 공제 정책 선택 컴포넌트
 */
import type { AbsencePolicy } from '../../types/salary';

interface AbsencePolicySelectorProps {
  absencePolicy: AbsencePolicy;
  onAbsencePolicyChange: (policy: AbsencePolicy) => void;
}

const OPTIONS: { value: AbsencePolicy; label: string; desc: string }[] = [
  { value: 'STRICT', label: '엄격 (STRICT)', desc: '결근일 일급 공제 + 해당 주 주휴수당 미지급' },
  { value: 'MODERATE', label: '보통 (MODERATE)', desc: '해당 주 주휴수당만 미지급' },
  { value: 'LENIENT', label: '관대 (LENIENT)', desc: '공제 없음 (사정 참작)' },
];

export default function AbsencePolicySelector({
  absencePolicy,
  onAbsencePolicyChange,
}: AbsencePolicySelectorProps) {
  return (
    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
      <p className="text-sm font-semibold text-gray-800 mb-3">결근 공제 정책</p>
      <div className="space-y-2">
        {OPTIONS.map((opt) => (
          <label key={opt.value} className="flex items-start cursor-pointer">
            <input
              type="radio"
              checked={absencePolicy === opt.value}
              onChange={() => onAbsencePolicyChange(opt.value)}
              className="mt-1 mr-3"
            />
            <div>
              <span className="font-medium text-sm">{opt.label}</span>
              <p className="text-xs text-gray-500">{opt.desc}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
