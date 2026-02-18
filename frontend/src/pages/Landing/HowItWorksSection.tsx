/**
 * How It Works Section - 서비스 사용 흐름 안내
 * 3-step 시각적 가이드로 사용자에게 서비스 사용법 전달
 */

import { Link } from 'react-router-dom';

const STEPS = [
  {
    num: 1,
    icon: 'person',
    title: '근로자 정보 입력',
    desc: '고용형태, 사업장 규모, 근로일수를 선택하세요',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    badge: 'bg-blue-600',
  },
  {
    num: 2,
    icon: 'payments',
    title: '급여/수당 설정',
    desc: '급여유형을 선택하고 기본급과 수당을 입력하세요',
    color: 'bg-green-50 text-green-600 border-green-200',
    badge: 'bg-green-600',
  },
  {
    num: 3,
    icon: 'receipt_long',
    title: '결과 확인',
    desc: '실수령액, 4대보험, 소득세 내역을 확인하세요',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    badge: 'bg-purple-600',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-text-main sm:text-4xl mb-4">
            3단계로 간단하게
          </h2>
          <p className="text-lg text-text-sub">
            복잡한 급여 계산, 이렇게 쉽게 할 수 있습니다
          </p>
        </div>

        {/* 3-Step Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative">
              {/* Connector line (desktop) */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-12 -right-3 w-6 text-gray-300">
                  <span className="material-symbols-outlined text-[24px]">
                    arrow_forward
                  </span>
                </div>
              )}
              <div className={`rounded-2xl border p-6 ${step.color} h-full`}>
                <div className={`w-10 h-10 ${step.badge} text-white rounded-full flex items-center justify-center font-bold text-lg mb-4`}>
                  {step.num}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[20px]">
                    {step.icon}
                  </span>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                </div>
                <p className="text-sm opacity-80">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/calculator"
            className="inline-flex items-center gap-2 h-12 px-8 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-colors"
          >
            지금 계산 시작하기
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
          <Link
            to="/guide/how-to-use"
            className="inline-flex items-center gap-2 h-12 px-8 bg-white border border-gray-200 text-text-main font-bold rounded-xl hover:bg-gray-50 transition-colors"
          >
            급여유형별 사용법 보기
          </Link>
        </div>
      </div>
    </section>
  );
}