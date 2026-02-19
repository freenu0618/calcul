/**
 * Hero Section - 호기심의 틈 + 손실 회피 + 프레이밍
 * 2컬럼: 좌측 텍스트 + 우측 대시보드 일러스트
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import HeroIllustration from '../../components/illustrations/HeroIllustration';

export default function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative pt-16 pb-20 lg:pt-28 lg:pb-32 overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 좌측: 텍스트 */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary ring-1 ring-inset ring-primary/20 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              2026년 최신 법령 반영
            </div>

            <h1 className="text-4xl font-black leading-[1.15] text-text-main sm:text-5xl lg:text-6xl tracking-tight mb-6">
              우리 직원 실수령액,
              <br />
              <span className="text-primary">정확히 알고 계신가요?</span>
            </h1>

            <p className="text-lg text-text-sub leading-relaxed mb-2">
              4대보험·소득세·주휴수당, <strong className="text-text-main">수작업 계산은 실수가 잦습니다</strong>
            </p>
            <p className="text-base text-text-sub mb-6">
              잘못된 신고는 <strong className="text-red-600">과태료 부과</strong> 사유가 될 수 있습니다
            </p>

            <p className="text-base text-text-sub mb-8 bg-primary/5 inline-block px-4 py-2 rounded-lg">
              <strong className="text-primary">3분</strong>이면 정확한 실수령액, 4대보험, 소득세까지 한 번에
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
              <Link
                to="/calculator"
                className="h-14 px-8 rounded-xl bg-primary text-white text-lg font-bold shadow-lg hover:bg-primary-600 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                내 직원 실수령액 계산하기
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="hidden sm:flex h-14 px-8 rounded-xl bg-white border border-gray-200 text-text-main text-lg font-bold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 items-center justify-center"
                >
                  무료 회원가입
                </Link>
              )}
            </div>

            <p className="text-sm text-text-sub">
              가입 없이 바로 사용 · 완전 무료 · 신용카드 불필요
            </p>
          </div>

          {/* 우측: 대시보드 일러스트 */}
          <div className="hidden lg:flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 rounded-3xl blur-2xl" />
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4">
                <HeroIllustration />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
