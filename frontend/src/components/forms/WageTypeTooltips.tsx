/**
 * 급여형태 상세 툴팁 컴포넌트
 * 각 급여형태에 대한 설명/예시를 팝오버로 표시
 */
import { useState, useRef, useEffect } from 'react';
import type { WageType } from '../../types/salary';

interface TooltipData {
  title: string;
  summary: string;
  details: string[];
  example: string;
  bestFor: string;
}

const WAGE_TYPE_TOOLTIPS: Record<string, TooltipData> = {
  MONTHLY_FIXED: {
    title: '월급제 (고정)',
    summary: '매월 동일한 급여를 지급하고, 결근 시에만 공제합니다.',
    details: [
      '기본급이 매월 고정',
      '결근 시 일할 공제 (정책 선택 가능)',
      '통상시급 = 통상임금 / 월 소정근로시간',
    ],
    example: '월 280만원 고정, 결근 1일 → 일할 공제',
    bestFor: '정규직, 사무직 등 월급 근로자',
  },
  HOURLY_MONTHLY: {
    title: '시급제 (월정산)',
    summary: '시급 x 실제 근무시간으로 매월 정산합니다.',
    details: [
      '기본급 = 시급 x 소정근로시간 (연장 제외)',
      '연장/야간/휴일은 별도 가산',
      '주휴수당 별도 계산',
    ],
    example: '시급 12,000원 x 월 160시간 = 192만원 + 주휴수당',
    bestFor: '파트타임, 아르바이트, 일용직',
  },
  HOURLY_BASED_MONTHLY: {
    title: '시급기반 월급제',
    summary: '계약월급과 실제계산 중 큰 금액을 적용합니다.',
    details: [
      'MAX(계약월급, 시급x실근무+주휴수당)',
      '계약월급 > 실제 → 차액을 계약보전수당으로 지급',
      '실제 > 계약월급 → 실제 계산 금액 적용',
    ],
    example: '계약 250만, 실제 230만 → 250만 적용 (보전수당 20만)',
    bestFor: '최저임금 기반 계약직, 프랜차이즈',
  },
};

interface WageTypeTooltipProps {
  wageType: WageType;
  isOpen: boolean;
  onToggle: () => void;
}

export default function WageTypeTooltip({
  wageType,
  isOpen,
  onToggle,
}: WageTypeTooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const data = WAGE_TYPE_TOOLTIPS[wageType];
  if (!data) return null;

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onToggle();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onToggle]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="ml-1 text-gray-400 hover:text-blue-500 transition-colors"
        aria-label={`${data.title} 설명`}
      >
        <svg className="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-50 left-0 top-6 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-left">
          <p className="font-semibold text-gray-900 text-sm mb-1">{data.title}</p>
          <p className="text-xs text-gray-600 mb-2">{data.summary}</p>
          <ul className="text-xs text-gray-700 space-y-1 mb-2">
            {data.details.map((d, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="text-blue-500 mt-0.5">-</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
          <div className="bg-blue-50 rounded p-2 text-xs text-blue-800 mb-2">
            <span className="font-medium">예시:</span> {data.example}
          </div>
          <p className="text-xs text-gray-500">
            <span className="font-medium">적합:</span> {data.bestFor}
          </p>
        </div>
      )}
    </div>
  );
}
