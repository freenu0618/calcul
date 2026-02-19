/**
 * 급여형태 3분류 선택기 컴포넌트
 * MONTHLY_FIXED / HOURLY_MONTHLY / HOURLY_BASED_MONTHLY
 */
import { useState } from 'react';
import type { WageType } from '../../types/salary';
import WageTypeTooltip from './WageTypeTooltips';

interface WageTypeSelectorProps {
  wageType: WageType;
  onWageTypeChange: (type: WageType) => void;
}

const WAGE_TYPE_OPTIONS: {
  value: WageType;
  label: string;
  desc: string;
  icon: string;
}[] = [
  {
    value: 'MONTHLY_FIXED',
    label: '월급제 (고정)',
    desc: '고정 월급 기반 계산',
    icon: '💰',
  },
  {
    value: 'HOURLY_MONTHLY',
    label: '시급제 (월정산)',
    desc: '시급 x 실제 근무시간',
    icon: '⏱️',
  },
  {
    value: 'HOURLY_BASED_MONTHLY',
    label: '시급기반 월급제',
    desc: 'MAX(계약월급, 실제계산)',
    icon: '📊',
  },
];

export default function WageTypeSelector({
  wageType,
  onWageTypeChange,
}: WageTypeSelectorProps) {
  const [openTooltip, setOpenTooltip] = useState<WageType | null>(null);

  const normalized =
    wageType === 'MONTHLY'
      ? 'MONTHLY_FIXED'
      : wageType === 'HOURLY'
        ? 'HOURLY_MONTHLY'
        : wageType;

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      {/* 급여 형태 가이드 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
        <p className="text-xs font-semibold text-amber-800 mb-1">어떤 유형을 선택할까요?</p>
        <ul className="text-xs text-amber-700 space-y-0.5">
          <li>계약서에 <strong>"월 OOO만원"</strong> → 월급제</li>
          <li>계약서에 <strong>"시급 OO,OOO원"</strong> → 시급제</li>
          <li>계약서에 <strong>"시급 기준 월 OOO만원"</strong> → 시급기반 월급제</li>
        </ul>
      </div>
      <p className="text-sm font-medium text-gray-700 mb-3">급여 형태</p>
      <div className="grid grid-cols-3 gap-2">
        {WAGE_TYPE_OPTIONS.map((opt) => {
          const isSelected = normalized === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onWageTypeChange(opt.value)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-lg">{opt.icon}</span>
                <WageTypeTooltip
                  wageType={opt.value}
                  isOpen={openTooltip === opt.value}
                  onToggle={() =>
                    setOpenTooltip(openTooltip === opt.value ? null : opt.value)
                  }
                />
              </div>
              <p
                className={`text-sm font-semibold mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}
              >
                {opt.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
