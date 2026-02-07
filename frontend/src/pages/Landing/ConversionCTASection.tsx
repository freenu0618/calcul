/**
 * Conversion CTA Section - 보답 기대 + 손실 회피 + 결핍
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const valueProps = [
  { icon: 'schedule', text: '급여 계산 시간 대폭 단축' },
  { icon: 'calculate', text: '4대보험·소득세 자동 계산' },
  { icon: 'shield', text: '법령 기반 정확한 계산으로 실수 방지' },
];

export default function ConversionCTASection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-text-main sm:text-4xl mb-10">
          급여 계산, 이제 걱정 없이
        </h2>

        {/* 가치 제안 (손실 회피) */}
        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          {valueProps.map((v) => (
            <div key={v.icon} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[24px]">{v.icon}</span>
              </div>
              <p className="text-sm text-text-sub">{v.text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          to={isAuthenticated ? '/calculator' : '/register'}
          className="inline-flex items-center gap-2 h-14 px-10 bg-primary text-white text-lg font-bold rounded-xl shadow-lg hover:bg-primary-600 hover:-translate-y-0.5 transition-all duration-200"
        >
          {isAuthenticated ? '계산기 사용하기' : '무료로 시작하기'}
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </Link>

        {/* 결핍 + 탈출 경로 */}
        <p className="text-sm text-text-sub mt-4">
          무료 플랜은 직원 5명까지 · 신용카드 불필요 · 1분 가입
        </p>
        <p className="text-xs text-gray-400 mt-2">
          언제든 해지 가능 · 약정 없음
        </p>
      </div>
    </section>
  );
}
