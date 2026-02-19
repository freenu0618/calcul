/**
 * UpgradeModal - 이용 한도 도달 시 플랜 업그레이드 유도 모달
 * Polar 결제로 직접 연결
 */

import { useState } from 'react';
import { useSubscription, PLAN_LIMITS } from '../hooks/useSubscription';
import { useAuth } from '../contexts/AuthContext';
import { paymentApi } from '../api/paymentApi';

export type UpgradeReason = 'employees' | 'ai_chat' | 'salary_calc' | 'pdf' | 'excel';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: UpgradeReason;
}

const REASON_INFO: Record<UpgradeReason, { title: string; desc: string; icon: string }> = {
  employees: { title: '직원 등록 한도 도달', desc: '더 많은 직원을 등록하려면 플랜을 업그레이드하세요.', icon: 'group' },
  ai_chat: { title: 'AI 상담 횟수 소진', desc: '이번 달 AI 상담 횟수를 모두 사용했습니다.', icon: 'smart_toy' },
  salary_calc: { title: '급여 계산 횟수 소진', desc: '이번 달 급여 계산 횟수를 모두 사용했습니다.', icon: 'calculate' },
  pdf: { title: 'PDF 내보내기 제한', desc: 'PDF 급여명세서는 Basic 플랜부터 사용 가능합니다.', icon: 'picture_as_pdf' },
  excel: { title: '엑셀 내보내기 제한', desc: '엑셀 내보내기는 Pro 플랜부터 사용 가능합니다.', icon: 'table_view' },
};

const BASIC_FEATURES = [
  `직원 ${PLAN_LIMITS.BASIC.maxEmployees}명`,
  '무제한 급여 계산',
  `AI 상담 월 ${PLAN_LIMITS.BASIC.aiChatsPerMonth}회`,
  'PDF 급여명세서',
  '3일 무료 체험',
];

const PRO_FEATURES = [
  `직원 ${PLAN_LIMITS.PRO.maxEmployees}명`,
  '무제한 급여 계산',
  '무제한 AI 상담',
  'PDF + 엑셀 내보내기',
];

export default function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  const { tier, usage, limits } = useSubscription();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const info = REASON_INFO[reason];

  const recommendPro = reason === 'excel' || (reason === 'ai_chat' && tier === 'BASIC');
  const plan = recommendPro ? 'pro' : 'basic';
  const features = recommendPro ? PRO_FEATURES : BASIC_FEATURES;
  const price = recommendPro ? '29,900' : '9,900';

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      window.location.href = '/register';
      return;
    }
    setIsLoading(true);
    try {
      await paymentApi.redirectToCheckout(plan);
    } catch {
      window.location.href = '/#pricing';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-slide-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* 아이콘 + 제목 */}
        <div className="text-center mb-5">
          <div className="w-16 h-16 mx-auto mb-3 bg-amber-50 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-500 text-[32px]">{info.icon}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{info.title}</h2>
          <p className="text-sm text-gray-600 mt-1">{info.desc}</p>
        </div>

        {/* 현재 사용량 */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-600 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="font-medium text-gray-900">{usage.employees}/{limits.maxEmployees}</p>
            <p>직원</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">{usage.salaryCalcs}/{limits.salaryCalcsPerMonth === Infinity ? '∞' : limits.salaryCalcsPerMonth}</p>
            <p>계산</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">{usage.aiChats}/{limits.aiChatsPerMonth === Infinity ? '∞' : limits.aiChatsPerMonth}</p>
            <p>AI 상담</p>
          </div>
        </div>

        {/* 추천 플랜 */}
        <div className="border-2 border-primary/30 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">추천</span>
              <span className="font-bold text-gray-900">{recommendPro ? 'Pro' : 'Basic'} 플랜</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-gray-900">{price}</span>
              <span className="text-xs text-gray-500">원/월</span>
            </div>
          </div>
          <ul className="space-y-1.5">
            {features.map((f, i) => (
              <li key={i} className="flex items-center text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-500 text-[16px] mr-2">check_circle</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA 버튼 */}
        <button
          onClick={handleUpgrade}
          disabled={isLoading}
          className="w-full py-3 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl transition-colors disabled:bg-gray-300"
        >
          {isLoading ? '결제 페이지 이동 중...' : !recommendPro ? '3일 무료 체험 시작하기' : 'Pro 플랜 시작하기'}
        </button>
        <button onClick={onClose} className="w-full py-2 mt-2 text-sm text-gray-500 hover:text-gray-700">
          나중에 할게요
        </button>
      </div>
    </div>
  );
}
