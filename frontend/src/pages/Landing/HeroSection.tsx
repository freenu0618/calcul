/**
 * Hero Section - Stitch 디자인 기반 새 랜딩페이지 히어로
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 self-center lg:self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary ring-1 ring-inset ring-primary/20">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              2026년 최신 법령 적용
            </div>

            <h1 className="text-4xl font-black leading-[1.2] text-text-main sm:text-5xl lg:text-6xl tracking-tight">
              급여 계산,<br className="hidden lg:block" />
              이제{' '}
              <span className="text-primary relative inline-block">
                3분이면 끝
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
              </span>
            </h1>

            <p className="text-lg font-normal text-text-sub leading-relaxed max-w-2xl mx-auto lg:mx-0">
              2026년 최신 노동법 완벽 반영. <br className="sm:hidden" />
              복잡한 엑셀 수식 없이 클릭 몇 번으로 급여명세서까지 발송하세요.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="h-12 px-8 rounded-xl bg-primary text-white text-base font-bold shadow-sm hover:bg-primary-600 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isAuthenticated ? '대시보드로 이동' : '무료로 시작하기'}
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
              <Link
                to="/calculator"
                className="h-12 px-8 rounded-xl bg-white border border-gray-200 text-text-main text-base font-bold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center"
              >
                계산기 바로 사용
              </Link>
            </div>

            <div className="mt-4 flex items-center justify-center lg:justify-start gap-4 text-xs text-text-sub">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                직원 5명까지 무료
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                신용카드 불필요
              </div>
            </div>
          </div>

          {/* Hero Card Mockup */}
          <div className="relative lg:h-auto flex items-center justify-center">
            {/* Background Gradient */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/10 via-emerald-50 to-white rounded-full blur-3xl opacity-60 pointer-events-none" />

            {/* Card */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg border border-white/50 p-6 transform hover:scale-[1.02] transition-transform duration-500">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-400">person</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-main">김지수 사원</h3>
                    <p className="text-xs text-gray-400">개발팀 / 정규직</p>
                  </div>
                </div>
                <div className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-md">
                  지급 대기
                </div>
              </div>

              {/* Card Content */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">지급 총액</span>
                  <span className="text-sm font-bold">₩ 3,500,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">공제 총액 (4대보험+세금)</span>
                  <span className="text-sm font-bold text-red-500">- ₩ 425,320</span>
                </div>
                <div className="h-px bg-gray-100 my-2" />
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-base font-bold text-text-main">실 지급액</span>
                  <span className="text-xl font-black text-primary">₩ 3,074,680</span>
                </div>
              </div>

              {/* Card Action */}
              <div className="mt-6">
                <button className="w-full py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-600 transition-colors">
                  명세서 발송
                </button>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-4 md:right-8 bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 animate-float">
              <div className="bg-blue-50 p-2 rounded-lg text-secondary">
                <span className="material-symbols-outlined">verified</span>
              </div>
              <div>
                <p className="text-[10px] text-gray-400">테스트 검증</p>
                <p className="text-sm font-bold text-text-main">181개 통과</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
