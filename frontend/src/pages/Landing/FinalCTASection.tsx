/**
 * Final CTA Section - 마지막 행동 유도
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function FinalCTASection() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          5분만 투자하세요.
          <br />
          급여 관리가 달라집니다.
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          복잡한 급여 계산, 법적 리스크 걱정에서 벗어나세요.
          <br />
          지금 시작하면 <strong className="text-white">직원 5명까지 무료</strong>입니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="inline-flex items-center justify-center px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
          >
            {isAuthenticated ? '대시보드로 이동' : '무료로 시작하기'}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            to="/calculator"
            className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/30 transition-all"
          >
            먼저 계산해보기
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            30초 회원가입
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            신용카드 불필요
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            언제든 해지 가능
          </div>
        </div>
      </div>
    </section>
  );
}
