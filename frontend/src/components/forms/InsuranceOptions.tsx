/**
 * 4대 보험 적용 옵션 컴포넌트
 * Phase 3.6.1: 개별 보험 체크박스 + 안내 메시지
 */

import { useState, useEffect } from 'react';
import type { InsuranceOptions as InsuranceOptionsType } from '../../types/salary';
import Tooltip from '../common/Tooltip';

interface InsuranceOptionsProps {
  options: InsuranceOptionsType;
  onChange: (options: InsuranceOptionsType) => void;
  age?: number; // 만 나이 (60세 이상 국민연금 제외 안내)
  weeklyHours?: number; // 주 근무시간 (15시간 미만 고용보험 제외 안내)
  isForigner?: boolean; // 외국인 여부
  visaType?: string; // 체류자격 (외국인만)
}

// 체류자격별 보험 자동 세팅 규칙 (Phase 3.6.2)
const VISA_INSURANCE_RULES: Record<string, Partial<InsuranceOptionsType>> = {
  'F-2': {}, // 전부 의무
  'F-5': {}, // 전부 의무
  'F-6': {}, // 전부 의무
  'E-9': { apply_national_pension: false, apply_employment_insurance: false }, // 임의
  'H-2': { apply_national_pension: false, apply_employment_insurance: false }, // 임의
  'F-4': { apply_national_pension: false, apply_employment_insurance: false }, // 재외동포 임의
  'D-7': { apply_national_pension: false }, // 상호주의 (기업투자)
  'D-8': { apply_national_pension: false }, // 상호주의 (무역경영)
  'D-9': { apply_national_pension: false }, // 상호주의 (구직)
};

export default function InsuranceOptions({
  options,
  onChange,
  age,
  weeklyHours,
  isForigner,
  visaType,
}: InsuranceOptionsProps) {
  const [showAdvice, setShowAdvice] = useState(false);

  // 외국인 체류자격 변경 시 자동 세팅
  useEffect(() => {
    if (isForigner && visaType && VISA_INSURANCE_RULES[visaType]) {
      const rules = VISA_INSURANCE_RULES[visaType];
      onChange({
        ...options,
        apply_national_pension: rules.apply_national_pension ?? true,
        apply_health_insurance: rules.apply_health_insurance ?? true,
        apply_long_term_care: rules.apply_long_term_care ?? true,
        apply_employment_insurance: rules.apply_employment_insurance ?? true,
      });
    }
  }, [isForigner, visaType]);

  // 건강보험 해제 시 장기요양보험도 자동 해제
  const handleHealthInsuranceChange = (checked: boolean) => {
    onChange({
      ...options,
      apply_health_insurance: checked,
      apply_long_term_care: checked ? options.apply_long_term_care : false,
    });
  };

  const handleChange = (field: keyof InsuranceOptionsType, checked: boolean) => {
    if (field === 'apply_health_insurance') {
      handleHealthInsuranceChange(checked);
    } else {
      onChange({ ...options, [field]: checked });
    }
  };

  const is60OrOlder = age !== undefined && age >= 60;
  const isUnder15Hours = weeklyHours !== undefined && weeklyHours < 15;

  return (
    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-gray-800">4대 보험 적용 설정</h4>
          <Tooltip
            content={
              <div className="space-y-2">
                <p><strong>국민연금:</strong> 만 60세 이상은 의무가입 대상 아님 (선택 가능)</p>
                <p><strong>건강보험:</strong> 직장가입자 필수 (외국인 체류자격별 임의)</p>
                <p><strong>장기요양:</strong> 건강보험료의 13.14% (건강보험 미적용 시 자동 제외)</p>
                <p><strong>고용보험:</strong> 주 15시간 미만 제외 가능</p>
              </div>
            }
            position="right"
            maxWidth={350}
          >
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs text-gray-500 bg-purple-200 rounded-full cursor-help hover:bg-purple-300">
              ?
            </span>
          </Tooltip>
        </div>
        <button
          type="button"
          onClick={() => setShowAdvice(!showAdvice)}
          className="text-xs text-purple-600 hover:text-purple-800"
        >
          {showAdvice ? '접기 ▲' : '안내 보기 ▼'}
        </button>
      </div>

      {showAdvice && (
        <div className="mb-3 p-2 bg-white rounded text-xs text-gray-600 space-y-1">
          {is60OrOlder && (
            <p className="text-amber-600">⚠️ 만 60세 이상: 국민연금 의무가입 대상 아님</p>
          )}
          {isUnder15Hours && (
            <p className="text-amber-600">⚠️ 주 15시간 미만: 고용보험 제외 가능</p>
          )}
          {isForigner && visaType && (
            <p className="text-blue-600">
              ℹ️ {visaType} 체류자격: {getVisaAdvice(visaType)}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* 국민연금 */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={options.apply_national_pension}
            onChange={(e) => handleChange('apply_national_pension', e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <span className={is60OrOlder && options.apply_national_pension ? 'text-amber-600' : ''}>
            국민연금 {is60OrOlder && <span className="text-xs">(60세+)</span>}
          </span>
        </label>

        {/* 건강보험 */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={options.apply_health_insurance}
            onChange={(e) => handleChange('apply_health_insurance', e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <span>건강보험</span>
        </label>

        {/* 장기요양보험 */}
        <label className={`flex items-center gap-2 text-sm ${!options.apply_health_insurance ? 'opacity-50' : 'cursor-pointer'}`}>
          <input
            type="checkbox"
            checked={options.apply_long_term_care}
            onChange={(e) => handleChange('apply_long_term_care', e.target.checked)}
            disabled={!options.apply_health_insurance}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 disabled:opacity-50"
          />
          <span>장기요양보험</span>
        </label>

        {/* 고용보험 */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={options.apply_employment_insurance}
            onChange={(e) => handleChange('apply_employment_insurance', e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <span className={isUnder15Hours && options.apply_employment_insurance ? 'text-amber-600' : ''}>
            고용보험 {isUnder15Hours && <span className="text-xs">(&lt;15h)</span>}
          </span>
        </label>
      </div>

      {/* 요약 */}
      <div className="mt-3 pt-2 border-t border-purple-200 text-xs text-gray-500">
        적용: {[
          options.apply_national_pension && '국민연금',
          options.apply_health_insurance && '건강보험',
          options.apply_long_term_care && '장기요양',
          options.apply_employment_insurance && '고용보험',
        ].filter(Boolean).join(', ') || '없음'}
      </div>
    </div>
  );
}

function getVisaAdvice(visaType: string): string {
  const rules = VISA_INSURANCE_RULES[visaType];
  if (!rules || Object.keys(rules).length === 0) {
    return '모든 보험 의무 적용';
  }
  const excluded = [];
  if (rules.apply_national_pension === false) excluded.push('국민연금(임의)');
  if (rules.apply_employment_insurance === false) excluded.push('고용보험(임의)');
  return excluded.length > 0 ? excluded.join(', ') : '모든 보험 의무 적용';
}
