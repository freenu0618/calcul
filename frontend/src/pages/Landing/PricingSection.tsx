/**
 * Pricing Section - 요금제 비교표
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const plans = [
  {
    name: 'Free',
    price: 0,
    originalPrice: null,
    period: '월',
    description: '소규모 사업장을 위한 기본 플랜',
    features: [
      '직원 5명까지',
      '기본 급여 계산',
      'AI 상담 월 10회',
      '3개월 기록 보관',
    ],
    cta: '무료로 시작',
    highlighted: false,
    popular: false,
  },
  {
    name: 'Starter',
    price: 4900,
    originalPrice: null,
    period: '월',
    description: 'PDF 명세서가 필요한 사업장',
    features: [
      '직원 5명까지',
      'PDF 급여명세서',
      'AI 상담 월 30회',
      '12개월 기록 보관',
    ],
    cta: '시작하기',
    highlighted: false,
    popular: false,
  },
  {
    name: 'Basic',
    price: 14900,
    originalPrice: 39900,
    period: '월',
    description: '성장하는 사업장을 위한 플랜',
    features: [
      '직원 10명까지',
      'AI 상담 월 100회',
      '계산 근거 상세 설명',
      '무제한 기록 보관',
    ],
    cta: '가장 인기',
    highlighted: true,
    popular: true,
  },
  {
    name: 'Pro',
    price: 29900,
    originalPrice: 79900,
    period: '월',
    description: '전문적인 급여 관리가 필요한 곳',
    features: [
      '직원 30명까지',
      'AI 상담 무제한',
      '법령 검색 및 맞춤 분석',
      '엑셀 내보내기',
    ],
    cta: '시작하기',
    highlighted: false,
    popular: false,
  },
];

export default function PricingSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            합리적인 가격, 강력한 기능
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            노무사 비용의 1/10로 전문적인 급여 관리를 시작하세요.
            <br />
            <span className="text-blue-600 font-medium">런칭 특가</span>로 최대 60% 할인 중입니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl p-6 ${
                plan.highlighted
                  ? 'ring-2 ring-blue-600 shadow-xl scale-105'
                  : 'border border-gray-200 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                    추천
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  {plan.originalPrice && (
                    <span className="text-gray-400 line-through text-lg mr-2">
                      {plan.originalPrice.toLocaleString()}원
                    </span>
                  )}
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price === 0 ? '무료' : `${plan.price.toLocaleString()}`}
                  </span>
                  {plan.price > 0 && <span className="text-gray-500">원/{plan.period}</span>}
                </div>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className={`block w-full text-center py-3 rounded-lg font-medium transition-colors ${
                  plan.highlighted
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                {isAuthenticated ? '대시보드' : plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            * 결제 정보 없이 무료 플랜으로 시작할 수 있습니다.
            <br />
            Enterprise 요금제가 필요하시면{' '}
            <Link to="/contact" className="text-blue-600 hover:underline">
              문의하기
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
