/**
 * Hero Section - 랜딩페이지 최상단 가치 제안
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { HeroIllustration } from '../../components/illustrations';

export default function HeroSection() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 좌측: 텍스트 */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-8">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              2026년 최신 법령 반영
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              급여 계산 <span className="text-emerald-400">30분</span> →{' '}
              <span className="text-emerald-400">3분</span>으로
            </h1>

            <p className="text-lg md:text-xl text-blue-100 max-w-xl mb-8">
              4대보험, 소득세, 연장·야간·휴일 수당까지 자동 계산
              <br />
              <strong className="text-white">AI 노무 상담</strong>으로 법적 리스크까지 관리하세요
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="inline-flex items-center justify-center px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
              >
                {isAuthenticated ? '대시보드로 이동' : '지금 무료로 시작하기'}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/calculator"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/30 transition-all"
              >
                계산기 바로 사용
              </Link>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-blue-200">
              {['신용카드 불필요', '5명까지 무료', '181개 테스트 검증'].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* 우측: 일러스트 */}
          <div className="hidden lg:flex justify-center">
            <HeroIllustration className="w-full max-w-md" />
          </div>
        </div>
      </div>
    </section>
  );
}
