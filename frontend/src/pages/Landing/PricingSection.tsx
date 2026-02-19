/**
 * Pricing Section - 미끼 효과 + 중앙 무대 + 앵커링 + 프레이밍
 * Polar 결제 연동 유지
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { paymentApi, type PlanType } from '../../api/paymentApi';

type BillingCycle = 'monthly' | 'annual';

interface Plan {
  name: string;
  desc: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  employees: string;
  features: string[];
  excluded?: string[];
  cta: string;
  ctaLink: string;
  popular?: boolean;
  planId?: PlanType;
  annualPlanId?: PlanType;
  daily?: string;
}

const plans: Plan[] = [
  {
    name: 'Free',
    desc: '소규모 사업장 시작',
    monthlyPrice: 0,
    annualPrice: 0,
    employees: '5명',
    features: [
      '급여 계산기',
      'AI 노무 상담 (월 10회)',
      '4대보험 + 소득세 자동 계산',
    ],
    excluded: ['급여대장 관리', '급여명세서 PDF'],
    cta: '무료로 시작',
    ctaLink: '/register',
  },
  {
    name: 'Basic',
    desc: '성장하는 사업장',
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    employees: '20명',
    features: [
      '급여 계산기 무제한',
      'AI 노무 상담 무제한',
      '급여대장 관리',
      '급여명세서 PDF',
      'Excel/CSV 내보내기',
      '이메일 지원',
    ],
    cta: '3일 무료 체험',
    ctaLink: '/register',
    popular: true,
    planId: 'basic',
    annualPlanId: 'basic_annual',
    daily: '하루 330원',
  },
  {
    name: 'Pro',
    desc: '전문적인 관리',
    monthlyPrice: 14.99,
    annualPrice: 149.99,
    employees: '무제한',
    features: [
      'Basic 전체 기능',
      '다중 사업장',
      '맞춤 리포트',
      '우선 지원',
    ],
    cta: '시작하기',
    ctaLink: '/register',
    planId: 'pro',
    annualPlanId: 'pro_annual',
  },
];

function fmtPrice(p: number) {
  return p % 1 === 0 ? p.toString() : p.toFixed(2);
}

export default function PricingSection() {
  const { isAuthenticated } = useAuth();
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handlePayment = async (plan: Plan) => {
    if (!isAuthenticated) { window.location.href = '/register'; return; }
    const id = billing === 'annual' ? plan.annualPlanId : plan.planId;
    if (!id) return;
    setLoadingPlan(plan.name);
    try { await paymentApi.redirectToCheckout(id); }
    catch { alert('결제 연결 실패. 잠시 후 다시 시도해주세요.'); setLoadingPlan(null); }
  };

  const getPrice = (plan: Plan) => {
    if (plan.monthlyPrice === null) return '문의';
    if (plan.monthlyPrice === 0) return '0';
    if (billing === 'annual' && plan.annualPrice)
      return fmtPrice(Math.floor(plan.annualPrice / 12));
    return fmtPrice(plan.monthlyPrice);
  };

  return (
    <section className="py-20 lg:py-28 bg-white" id="pricing">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-4">
          <h2 className="text-3xl font-bold text-text-main sm:text-4xl mb-4">
            합리적인 가격으로 시작하세요
          </h2>
          {/* 앵커링: 노무사 비용 비교 */}
          <p className="text-text-sub">
            노무사 월 <s className="text-red-400">30~50만원</s> &rarr;
            페이툴즈는 <strong className="text-primary">월 $9.99</strong>부터
          </p>
        </div>

        {/* 결제 주기 토글 */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="inline-flex items-center bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 sm:px-6 py-3 sm:py-2.5 rounded-lg text-sm font-bold transition-all ${
                billing === 'monthly' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              월간 결제
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-5 sm:px-6 py-3 sm:py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                billing === 'annual' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              연간 결제
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">2개월 무료</span>
            </button>
          </div>
        </div>

        {/* 3단 요금 카드 */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl p-6 flex flex-col transition-all duration-200 ${
                plan.popular
                  ? 'border-2 border-primary shadow-xl ring-1 ring-primary/20 md:-mt-4 md:pb-10 md:scale-105'
                  : 'border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-primary/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                  가장 인기
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-lg font-bold text-text-main mb-1">{plan.name}</h3>
                <p className="text-sm text-text-sub">{plan.desc}</p>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-text-main">
                    {plan.monthlyPrice !== null ? '$' : ''}{getPrice(plan)}
                  </span>
                  {plan.monthlyPrice !== null && <span className="text-sm text-text-sub">/월</span>}
                </div>
                {/* 프레이밍: 일 단위 */}
                {plan.daily && (
                  <p className="text-xs text-primary font-medium mt-1">{plan.daily}</p>
                )}
                <p className="text-sm text-primary font-bold mt-2">직원 {plan.employees}까지</p>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-sub">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
                    {f}
                  </li>
                ))}
                {plan.excluded?.map((f, i) => (
                  <li key={`ex-${i}`} className="flex items-start gap-2 text-sm text-gray-400 line-through">
                    <span className="material-symbols-outlined text-gray-300 text-[18px] mt-0.5">cancel</span>
                    {f}
                  </li>
                ))}
              </ul>

              {plan.planId ? (
                <button
                  onClick={() => handlePayment(plan)}
                  disabled={loadingPlan === plan.name}
                  className={`w-full h-11 rounded-xl font-bold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary to-primary-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50'
                      : 'bg-gray-100 text-text-main hover:bg-gray-200 disabled:bg-gray-50'
                  }`}
                >
                  {loadingPlan === plan.name ? '처리 중...' : plan.cta}
                </button>
              ) : (
                <Link
                  to={isAuthenticated ? '/dashboard' : plan.ctaLink}
                  className={`w-full h-11 rounded-xl font-bold transition-all duration-200 flex items-center justify-center ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary to-primary-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                      : 'bg-gray-100 text-text-main hover:bg-gray-200'
                  }`}
                >
                  {isAuthenticated ? '대시보드' : plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* 보답 기대: 무료 체험 안내 */}
        <p className="text-center text-sm text-text-sub mt-8">
          모든 유료 플랜은 <strong>3일 무료 체험</strong> 후 결제됩니다. 체험 기간 중 언제든 취소 가능.
        </p>
      </div>
    </section>
  );
}
