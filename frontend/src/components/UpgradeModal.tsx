/**
 * UpgradeModal - 요금제 업그레이드 유도 모달
 */

import { Link } from 'react-router-dom';
import { useSubscription, PLAN_LIMITS } from '../hooks/useSubscription';
import type { SubscriptionTier } from '../hooks/useSubscription';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: 'employees' | 'ai_chat' | 'salary_calc' | 'pdf' | 'excel';
}

const reasonMessages = {
  employees: {
    title: '직원 등록 한도 도달',
    description: '현재 플랜의 직원 등록 한도에 도달했습니다.',
    icon: '👥',
  },
  ai_chat: {
    title: 'AI 상담 횟수 소진',
    description: '이번 달 AI 상담 횟수를 모두 사용했습니다.',
    icon: '🤖',
  },
  salary_calc: {
    title: '급여 계산 횟수 소진',
    description: '이번 달 급여 계산 횟수를 모두 사용했습니다.',
    icon: '🧮',
  },
  pdf: {
    title: 'PDF 내보내기 제한',
    description: 'PDF 급여명세서 출력은 Basic 플랜부터 가능합니다.',
    icon: '📄',
  },
  excel: {
    title: '엑셀 내보내기 제한',
    description: '엑셀 내보내기는 Pro 플랜부터 가능합니다.',
    icon: '📊',
  },
};

const planFeatures: Record<SubscriptionTier, string[]> = {
  FREE: [],
  TRIAL: [],
  BASIC: [
    '3일 무료 체험',
    `직원 ${PLAN_LIMITS.BASIC.maxEmployees}명`,
    '무제한 급여 계산',
    'PDF 급여명세서',
    `AI 상담 월 ${PLAN_LIMITS.BASIC.aiChatsPerMonth}회`,
  ],
  PRO: [
    `직원 ${PLAN_LIMITS.PRO.maxEmployees}명`,
    '무제한 급여 계산',
    'PDF + 엑셀 내보내기',
    '무제한 AI 상담',
    '우선 고객 지원',
  ],
  ENTERPRISE: [],
};

export default function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  const { tier } = useSubscription();
  const message = reasonMessages[reason];

  // 추천 플랜 결정
  const recommendedPlan: SubscriptionTier = reason === 'excel' ? 'PRO' : 'BASIC';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* 모달 */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 아이콘 */}
        <div className="text-center mb-4">
          <span className="text-5xl">{message.icon}</span>
        </div>

        {/* 제목 & 설명 */}
        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
          {message.title}
        </h2>
        <p className="text-center text-gray-600 mb-6">
          {message.description}
        </p>

        {/* 현재 플랜 */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center">
          <span className="text-sm text-gray-500">현재 플랜: </span>
          <span className="font-semibold text-gray-900">{tier}</span>
        </div>

        {/* 추천 플랜 */}
        <div className="border-2 border-blue-500 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex gap-2 items-center">
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                  추천
                </span>
                {recommendedPlan === 'BASIC' && (
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">
                    3일 무료
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-1">
                {recommendedPlan} 플랜
              </h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                ${recommendedPlan === 'PRO' ? '14.99' : '9.99'}
              </p>
              <p className="text-xs text-gray-500">/월</p>
            </div>
          </div>
          <ul className="space-y-2">
            {planFeatures[recommendedPlan].map((feature, i) => (
              <li key={i} className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <Link
            to="/#pricing"
            onClick={onClose}
            className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold rounded-lg transition-colors"
          >
            {recommendedPlan === 'BASIC' ? '3일 무료 체험 시작' : '요금제 확인하기'}
          </Link>
          <button
            onClick={onClose}
            className="block w-full py-3 text-gray-600 hover:text-gray-900 text-center font-medium transition-colors"
          >
            나중에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}
