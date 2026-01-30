/**
 * Hero Section - AI 채팅 통합 버전
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import HeroChatBox from './HeroChatBox';

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
                AI에게 물어보세요
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
              </span>
            </h1>

            <p className="text-lg font-normal text-text-sub leading-relaxed max-w-2xl mx-auto lg:mx-0">
              복잡한 노동법, 4대보험, 수당 계산... <br className="sm:hidden" />
              페이봇 AI가 즉시 답변해 드립니다.
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

          {/* AI 채팅 박스 */}
          <HeroChatBox />
        </div>
      </div>
    </section>
  );
}
