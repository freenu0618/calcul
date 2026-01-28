/**
 * Pricing Section - 요금제 안내
 * pricing-policy.md 기준 (2026-01-28)
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

type BillingCycle = 'monthly' | 'annual';

interface PricingPlan {
  name: string;
  description: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  employees: string;
  features: string[];
  cta: string;
  ctaLink: string;
  popular?: boolean;
  disabled?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: 'Free',
    description: '소규모 사업장 시작',
    monthlyPrice: 0,
    annualPrice: 0,
    employees: '5명',
    features: [
      '월 5회 급여 계산',
      '4대보험 + 소득세 자동 계산',
      '연장/야간/휴일 수당',
      '주휴수당 비례 계산',
    ],
    cta: '무료로 시작',
    ctaLink: '/register',
  },
  {
    name: 'Basic',
    description: '성장하는 사업장',
    monthlyPrice: 14900,
    annualPrice: 148900,
    employees: '10명',
    features: [
      '무제한 급여 계산',
      'Free 플랜의 모든 기능',
      '급여대장 관리',
      'PDF 급여명세서',
      '이메일 지원',
    ],
    cta: '시작하기',
    ctaLink: '/register',
    popular: true,
  },
  {
    name: 'Pro',
    description: '전문적인 관리',
    monthlyPrice: 29900,
    annualPrice: 298900,
    employees: '30명',
    features: [
      'Basic 플랜의 모든 기능',
      'AI 노무 상담',
      'Excel 내보내기',
      '우선 지원',
      '맞춤 리포트',
    ],
    cta: '시작하기',
    ctaLink: '/register',
  },
  {
    name: 'Enterprise',
    description: '대규모 사업장',
    monthlyPrice: null,
    annualPrice: null,
    employees: '30명+',
    features: [
      'Pro 플랜의 모든 기능',
      '무제한 직원',
      '전담 매니저',
      'API 연동',
      'SLA 보장',
    ],
    cta: '문의하기',
    ctaLink: '/contact',
    disabled: true,
  },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price);
}

export default function PricingSection() {
  const { isAuthenticated } = useAuth();
  const [billing, setBilling] = useState<BillingCycle>('monthly');

  const getPrice = (plan: PricingPlan): string => {
    if (plan.monthlyPrice === null) return '문의';
    if (plan.monthlyPrice === 0) return '0';

    if (billing === 'annual' && plan.annualPrice) {
      const monthlyEquivalent = Math.floor(plan.annualPrice / 12);
      return formatPrice(monthlyEquivalent);
    }
    return formatPrice(plan.monthlyPrice);
  };

  const getAnnualSavings = (plan: PricingPlan): number | null => {
    if (!plan.monthlyPrice || !plan.annualPrice) return null;
    const fullYearPrice = plan.monthlyPrice * 12;
    return fullYearPrice - plan.annualPrice;
  };

  return (
    <section className="py-20 lg:py-28 bg-gray-50" id="pricing">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-text-main sm:text-4xl mb-4">
            합리적인 요금제
          </h2>
          <p className="text-lg text-text-sub">
            사업장 규모에 맞는 최적의 플랜을 선택하세요
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-white rounded-xl p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                billing === 'monthly'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              월간 결제
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                billing === 'annual'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              연간 결제
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                2개월 무료
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl p-6 flex flex-col ${
                plan.popular
                  ? 'border-2 border-primary shadow-lg ring-1 ring-primary/20'
                  : 'border border-gray-200 shadow-sm'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                  가장 인기
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-text-main mb-1">{plan.name}</h3>
                <p className="text-sm text-text-sub">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-text-main">
                    {plan.monthlyPrice === null ? '' : '₩'}
                    {getPrice(plan)}
                  </span>
                  {plan.monthlyPrice !== null && (
                    <span className="text-sm text-text-sub">/월</span>
                  )}
                </div>
                {billing === 'annual' && getAnnualSavings(plan) && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    연 ₩{formatPrice(getAnnualSavings(plan)!)} 절약
                  </p>
                )}
                <p className="text-sm text-primary font-bold mt-2">
                  직원 {plan.employees}까지
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-text-sub">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
                      check_circle
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {plan.disabled ? (
                <button
                  disabled
                  className="w-full h-11 rounded-xl bg-gray-100 text-gray-500 font-bold cursor-not-allowed"
                >
                  {plan.cta}
                </button>
              ) : (
                <Link
                  to={isAuthenticated ? '/dashboard' : plan.ctaLink}
                  className={`w-full h-11 rounded-xl font-bold transition-colors flex items-center justify-center ${
                    plan.popular
                      ? 'bg-primary text-white hover:bg-primary-600'
                      : 'bg-gray-100 text-text-main hover:bg-gray-200'
                  }`}
                >
                  {isAuthenticated ? '대시보드' : plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-text-sub mt-8">
          모든 유료 플랜은 7일 이내 전액 환불 가능합니다.{' '}
          <Link to="/terms" className="text-primary hover:underline">
            환불 정책 보기
          </Link>
        </p>
      </div>
    </section>
  );
}
