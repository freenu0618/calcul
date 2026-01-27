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
                <span>자동 급여 계산 및 명세서 발송</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-text-sub">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span>연차 및 근태 관리 기본</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-text-sub">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span>4대보험 취득/상실 신고 지원</span>
              </li>
            </ul>

            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary-600 transition-colors flex items-center justify-center"
            >
              {isAuthenticated ? '대시보드로 이동' : '무료로 시작하기'}
            </Link>
          </div>

          {/* Business Plan */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-text-main mb-2">비즈니스</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-text-main">5,900원</span>
                <span className="text-sm text-text-sub">/월 (1인당)</span>
              </div>
              <p className="text-sm text-gray-400 font-medium mt-2">인원 제한 없음</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-text-sub">
                <span className="material-symbols-outlined text-gray-400 text-[20px]">check_circle</span>
                <span>무료 플랜의 모든 기능 포함</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-text-sub">
                <span className="material-symbols-outlined text-gray-400 text-[20px]">check_circle</span>
                <span>전문 노무사 1:1 채팅 상담</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-text-sub">
                <span className="material-symbols-outlined text-gray-400 text-[20px]">check_circle</span>
                <span>퇴직금 자동 정산 및 관리</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-text-sub">
                <span className="material-symbols-outlined text-gray-400 text-[20px]">check_circle</span>
                <span>전자 근로계약서 무제한</span>
              </li>
            </ul>

            <Link
              to="/contact"
              className="w-full h-12 rounded-xl bg-white border border-gray-300 text-text-main font-bold hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              도입 문의하기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
