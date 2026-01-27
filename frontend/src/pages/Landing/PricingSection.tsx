/**
 * Pricing Section - 합리적인 요금제
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function PricingSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-20 lg:py-28 bg-white" id="pricing">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-text-main sm:text-4xl mb-4">합리적인 요금제</h2>
          <p className="text-lg text-text-sub">사업장 규모에 맞는 최적의 플랜을 선택하세요.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="relative bg-white rounded-2xl p-8 border-2 border-primary shadow-lg flex flex-col">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full">
              가장 인기있는 플랜
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-text-main mb-2">소규모 사업장</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-text-main">0원</span>
                <span className="text-sm text-text-sub">/월</span>
              </div>
              <p className="text-sm text-primary font-bold mt-2">5인 이하 평생 무료</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-text-sub">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span>4대보험 + 소득세 자동 계산</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-text-sub">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span>연장/야간/휴일 수당 계산</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-text-sub">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span>주휴수당 비례 계산</span>
              </li>
            </ul>

            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary-600 transition-colors flex items-center justify-center"
            >
              {isAuthenticated ? '대시보드로 이동' : '무료로 시작하기'}
            </Link>
          </div>

          {/* Business Plan - Coming Soon */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
              준비 중
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-text-main mb-2">비즈니스</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-gray-400">추후 공개</span>
              </div>
              <p className="text-sm text-gray-400 font-medium mt-2">6인 이상 사업장용</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <span className="material-symbols-outlined text-gray-300 text-[20px]">schedule</span>
                <span>무료 플랜의 모든 기능 포함</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <span className="material-symbols-outlined text-gray-300 text-[20px]">schedule</span>
                <span>급여대장 일괄 관리</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <span className="material-symbols-outlined text-gray-300 text-[20px]">schedule</span>
                <span>AI 노무 상담 (개발 예정)</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <span className="material-symbols-outlined text-gray-300 text-[20px]">schedule</span>
                <span>PDF/Excel 내보내기</span>
              </li>
            </ul>

            <button
              disabled
              className="w-full h-12 rounded-xl bg-gray-200 text-gray-500 font-bold cursor-not-allowed flex items-center justify-center"
            >
              출시 알림 신청
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
