/**
 * 급여유형 결정 도우미 - 의사결정 플로우
 * 사용자의 상황에 맞는 급여유형을 안내
 */

import { useState } from 'react';

type Decision = null | 'MONTHLY_FIXED' | 'HOURLY_MONTHLY' | 'HOURLY_BASED_MONTHLY';

const RESULTS: Record<Exclude<Decision, null>, { title: string; desc: string; anchor: string; color: string }> = {
  MONTHLY_FIXED: {
    title: '월급제 (고정)',
    desc: '매달 같은 기본급을 받고, 4대보험·소득세만 공제하면 됩니다.',
    anchor: '#monthly-fixed',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
  },
  HOURLY_MONTHLY: {
    title: '시급제 (월정산)',
    desc: '시급 기반으로 실제 근무시간에 따라 급여가 달라집니다.',
    anchor: '#hourly-monthly',
    color: 'bg-green-50 border-green-200 text-green-800',
  },
  HOURLY_BASED_MONTHLY: {
    title: '시급기반 월급제',
    desc: '시급으로 계약했지만 매달 고정 월급을 보장받는 형태입니다.',
    anchor: '#hourly-based',
    color: 'bg-purple-50 border-purple-200 text-purple-800',
  },
};

export default function WageTypeDecisionHelper() {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<Decision>(null);

  const reset = () => { setStep(0); setResult(null); };

  const handleQ1 = (fixed: boolean) => {
    if (fixed) {
      setResult('MONTHLY_FIXED');
    } else {
      setStep(1);
    }
  };

  const handleQ2 = (guaranteed: boolean) => {
    setResult(guaranteed ? 'HOURLY_BASED_MONTHLY' : 'HOURLY_MONTHLY');
  };

  if (result) {
    const r = RESULTS[result];
    return (
      <div className={`rounded-xl border p-5 ${r.color}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <p className="font-bold text-lg">{r.title}</p>
        </div>
        <p className="text-sm mb-3">{r.desc}</p>
        <div className="flex gap-3">
          <a href={r.anchor} className="text-sm font-medium underline">
            사용법 보기
          </a>
          <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700">
            다시 선택
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
      <p className="font-bold text-gray-900 mb-4">
        {step === 0 ? '급여를 어떻게 받고 있나요?' : '매달 고정 월급이 보장되나요?'}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {step === 0 ? (
          <>
            <button onClick={() => handleQ1(true)} className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left">
              <span className="material-symbols-outlined text-blue-600 mb-1">account_balance</span>
              <p className="font-medium text-sm">매달 같은 금액</p>
              <p className="text-xs text-gray-500">월급이 고정되어 있어요</p>
            </button>
            <button onClick={() => handleQ1(false)} className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-colors text-left">
              <span className="material-symbols-outlined text-green-600 mb-1">schedule</span>
              <p className="font-medium text-sm">시급 × 근무시간</p>
              <p className="text-xs text-gray-500">일한 시간만큼 받아요</p>
            </button>
          </>
        ) : (
          <>
            <button onClick={() => handleQ2(true)} className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-colors text-left">
              <span className="material-symbols-outlined text-purple-600 mb-1">verified</span>
              <p className="font-medium text-sm">네, 고정 월급 보장</p>
              <p className="text-xs text-gray-500">시급 계약 + 월급 보장</p>
            </button>
            <button onClick={() => handleQ2(false)} className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-colors text-left">
              <span className="material-symbols-outlined text-green-600 mb-1">trending_up</span>
              <p className="font-medium text-sm">아니오, 매달 달라요</p>
              <p className="text-xs text-gray-500">근무시간에 따라 변동</p>
            </button>
          </>
        )}
      </div>
    </div>
  );
}