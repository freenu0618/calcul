/**
 * How It Works Section - 서비스 사용 흐름 안내
 * 3-step 카드 + SVG 일러스트로 시각화
 */

import { Link } from 'react-router-dom';

/** 각 스텝의 미니 일러스트 SVG */
function StepIllust({ step }: { step: number }) {
  const common = 'w-full h-24 flex items-center justify-center mb-3';
  if (step === 1) {
    return (
      <div className={common}>
        <svg viewBox="0 0 120 80" className="w-28 h-20" fill="none">
          <rect x="10" y="10" width="100" height="60" rx="8" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.5" />
          <rect x="20" y="22" width="40" height="6" rx="3" fill="#93C5FD" />
          <rect x="20" y="34" width="60" height="6" rx="3" fill="#DBEAFE" />
          <rect x="20" y="46" width="50" height="6" rx="3" fill="#DBEAFE" />
          <circle cx="90" cy="35" r="12" fill="#3B82F6" opacity="0.2" />
          <path d="M86 35l3 3 5-5" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (step === 2) {
    return (
      <div className={common}>
        <svg viewBox="0 0 120 80" className="w-28 h-20" fill="none">
          <rect x="10" y="10" width="100" height="60" rx="8" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="1.5" />
          <text x="22" y="30" fontSize="8" fill="#16A34A" fontWeight="600">₩ 2,800,000</text>
          <rect x="20" y="36" width="80" height="4" rx="2" fill="#BBF7D0" />
          <rect x="20" y="36" width="55" height="4" rx="2" fill="#22C55E" />
          <rect x="20" y="46" width="35" height="6" rx="3" fill="#DCFCE7" />
          <rect x="60" y="46" width="35" height="6" rx="3" fill="#DCFCE7" />
          <text x="22" y="60" fontSize="7" fill="#6B7280">174h mode</text>
        </svg>
      </div>
    );
  }
  return (
    <div className={common}>
      <svg viewBox="0 0 120 80" className="w-28 h-20" fill="none">
        <rect x="10" y="10" width="100" height="60" rx="8" fill="#FAF5FF" stroke="#C4B5FD" strokeWidth="1.5" />
        <text x="22" y="28" fontSize="7" fill="#7C3AED" fontWeight="600">실수령액</text>
        <text x="22" y="42" fontSize="11" fill="#7C3AED" fontWeight="700">₩2,443,200</text>
        <rect x="20" y="50" width="16" height="12" rx="2" fill="#C4B5FD" opacity="0.5" />
        <rect x="40" y="46" width="16" height="16" rx="2" fill="#A78BFA" opacity="0.5" />
        <rect x="60" y="48" width="16" height="14" rx="2" fill="#C4B5FD" opacity="0.5" />
        <rect x="80" y="44" width="16" height="18" rx="2" fill="#8B5CF6" opacity="0.4" />
      </svg>
    </div>
  );
}

const STEPS = [
  { num: 1, icon: 'person', title: '근로자 정보 입력', desc: '고용형태, 사업장 규모, 근로일수를 선택하세요',
    color: 'bg-blue-50 text-blue-600 border-blue-200', badge: 'bg-blue-600' },
  { num: 2, icon: 'payments', title: '급여/수당 설정', desc: '급여유형을 선택하고 기본급과 수당을 입력하세요',
    color: 'bg-green-50 text-green-600 border-green-200', badge: 'bg-green-600' },
  { num: 3, icon: 'receipt_long', title: '결과 확인', desc: '실수령액, 4대보험, 소득세 내역을 확인하세요',
    color: 'bg-purple-50 text-purple-600 border-purple-200', badge: 'bg-purple-600' },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-text-main sm:text-4xl mb-4">3단계로 간단하게</h2>
          <p className="text-lg text-text-sub">복잡한 급여 계산, 이렇게 쉽게 할 수 있습니다</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-16 -right-3 w-6 text-gray-300">
                  <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
                </div>
              )}
              <div className={`rounded-2xl border p-6 ${step.color} h-full`}>
                <StepIllust step={step.num} />
                <div className={`w-10 h-10 ${step.badge} text-white rounded-full flex items-center justify-center font-bold text-lg mb-3`}>
                  {step.num}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                </div>
                <p className="text-sm opacity-80">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/calculator" className="inline-flex items-center gap-2 h-12 px-8 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-colors">
            지금 계산 시작하기
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
          <Link to="/guide/how-to-use" className="inline-flex items-center gap-2 h-12 px-8 bg-white border border-gray-200 text-text-main font-bold rounded-xl hover:bg-gray-50 transition-colors">
            급여유형별 사용법 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
