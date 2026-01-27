/**
 * Final CTA Section - 마지막 행동 유도 (Stitch 디자인)
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function FinalCTASection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="bg-secondary text-white py-20 lg:py-24 relative overflow-hidden">
      {/* Abstract Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
          급여 관리 스트레스, <br className="sm:hidden" />이제 그만 받으세요.
        </h2>
        <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
          지금 가입하시면 1개월 무료 체험 혜택을 드립니다. <br className="sm:hidden" />
          카드 등록 없이 바로 시작해보세요.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="h-14 px-8 rounded-xl bg-primary text-white text-lg font-bold shadow-lg hover:bg-primary-600 hover:scale-105 transition-all duration-200 flex items-center justify-center"
          >
            {isAuthenticated ? '대시보드로 이동' : '무료로 시작하기'}
          </Link>
          <Link
            to="/calculator"
            className="h-14 px-8 rounded-xl bg-transparent border border-white/30 text-white text-lg font-bold hover:bg-white/10 transition-colors flex items-center justify-center"
          >
            계산기 바로 사용
          </Link>
        </div>
      </div>
    </section>
  );
}
