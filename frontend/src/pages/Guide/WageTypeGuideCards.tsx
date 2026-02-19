/**
 * 급여유형별 사용법 카드 컴포넌트
 * 각 급여유형의 3-step 가이드 + 입력 필드 + 자주하는 실수
 */
import { useState } from 'react';

interface StepInfo { num: number; title: string; details: string[]; }
interface MistakeInfo { mistake: string; fix: string; }
interface WageGuide {
  id: string; icon: string; title: string; subtitle: string;
  color: string; borderColor: string; badgeColor: string;
  steps: StepInfo[]; tip: string;
  fieldsShown: string[];
  commonMistakes: MistakeInfo[];
}

const GUIDES: WageGuide[] = [
  {
    id: 'monthly-fixed', icon: 'account_balance',
    title: '월급제 (고정)', subtitle: '매달 동일한 기본급을 받는 정규직/계약직',
    color: 'bg-blue-50', borderColor: 'border-blue-200', badgeColor: 'bg-blue-600',
    steps: [
      { num: 1, title: '근로자 정보', details: ['고용형태: 정규직/계약직', '사업장 규모 (5인 이상/미만)', '주 소정근로일·시간 설정'] },
      { num: 2, title: '급여 설정', details: ['급여유형: "월급제 (고정)"', '기본급 입력 (예: 2,500,000원)', '174시간/209시간 모드 선택'] },
      { num: 3, title: '결과 확인', details: ['시프트 미입력 = 전일 개근', '연장/야간 있을 때만 시프트 입력', '기본급 - 공제 = 실수령액'] },
    ],
    tip: '월급제는 시프트를 입력하지 않으면 전일 개근으로 계산됩니다. 연장·야간·휴일근로가 있는 경우에만 시프트를 입력하세요.',
    fieldsShown: ['기본급', '174/209시간 모드', '수당 체크박스', '시프트 (선택)'],
    commonMistakes: [
      { mistake: '209시간 모드에서 주휴수당이 이중 계산됨', fix: '주휴수당을 별도 계산하려면 174시간 모드를 사용하세요' },
      { mistake: '시프트를 입력하지 않아 연장수당 누락', fix: '연장·야간근로가 있다면 해당 날짜의 시프트를 반드시 입력하세요' },
    ],
  },
  {
    id: 'hourly-monthly', icon: 'schedule',
    title: '시급제 (월정산)', subtitle: '시급 기반, 실제 근무시간에 따라 급여 변동',
    color: 'bg-green-50', borderColor: 'border-green-200', badgeColor: 'bg-green-600',
    steps: [
      { num: 1, title: '근로자 정보', details: ['고용형태 선택', '주 소정근로일/시간 설정', '파트타임은 실제 조건 입력'] },
      { num: 2, title: '급여 설정', details: ['급여유형: "시급제" 선택', '시급 입력 (예: 12,000원)', '주휴수당 자동 계산 (주 15h↑)'] },
      { num: 3, title: '시프트 입력 (필수)', details: ['실제 근무 날짜·시간 모두 입력', '야간(22~06시) 자동 분리', '시급×시간 + 주휴 + 가산 - 공제'] },
    ],
    tip: '시급제는 반드시 실제 근무 시프트를 입력해야 합니다. 템플릿 기능으로 반복 근무를 빠르게 입력하세요.',
    fieldsShown: ['시급', '시프트 (필수)', '주휴수당 자동계산', '수당 체크박스'],
    commonMistakes: [
      { mistake: '시프트를 입력하지 않아 급여가 0원으로 계산됨', fix: '시급제는 반드시 근무 시프트를 입력해야 합니다' },
      { mistake: '주 15시간 미만인데 주휴수당을 기대', fix: '주 소정근로시간이 15시간 미만이면 주휴수당이 발생하지 않습니다' },
    ],
  },
  {
    id: 'hourly-based', icon: 'verified',
    title: '시급기반 월급제', subtitle: '시급 계약이지만 매달 고정 월급이 보장되는 형태',
    color: 'bg-purple-50', borderColor: 'border-purple-200', badgeColor: 'bg-purple-600',
    steps: [
      { num: 1, title: '근로자 정보', details: ['고용형태, 사업장 규모 선택', '주 소정근로일/시간 설정'] },
      { num: 2, title: '급여 설정', details: ['"시급기반 월급제" 선택', '시급 + 계약 월급(보장액) 입력', '유리한 금액 자동 적용'] },
      { num: 3, title: '결과 확인', details: ['시프트 입력은 선택 사항', 'MAX(계약월급, 실제계산액) 비교', '적용 방식 표시됨'] },
    ],
    tip: '계약 월급과 실제 계산액 중 근로자에게 유리한 금액이 자동 적용됩니다.',
    fieldsShown: ['시급', '계약 월급(보장액)', '시프트 (선택)', '적용 방식 표시'],
    commonMistakes: [
      { mistake: '계약 월급을 입력하지 않음', fix: '시급기반 월급제는 보장 월급을 반드시 입력해야 비교 계산됩니다' },
      { mistake: '실제 계산액이 더 높은데 계약 월급만 지급', fix: '시스템이 자동으로 유리한 금액을 표시합니다. 결과의 적용방식을 확인하세요' },
    ],
  },
];

export default function WageTypeGuideCards() {
  const [openMistakes, setOpenMistakes] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {GUIDES.map((guide) => (
        <div key={guide.id} id={guide.id} className={`${guide.color} ${guide.borderColor} border rounded-2xl p-6`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-[28px]">{guide.icon}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{guide.title}</h3>
              <p className="text-sm text-gray-600">{guide.subtitle}</p>
            </div>
          </div>

          {/* Fields shown */}
          <div className="flex flex-wrap gap-2 mb-4">
            {guide.fieldsShown.map((f) => (
              <span key={f} className={`${guide.badgeColor} text-white text-xs px-2.5 py-1 rounded-full`}>{f}</span>
            ))}
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {guide.steps.map((step) => (
              <div key={step.num} className="bg-white/80 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-6 h-6 ${guide.badgeColor} text-white rounded-full flex items-center justify-center text-xs font-bold`}>
                    {step.num}
                  </span>
                  <span className="font-medium text-sm">{step.title}</span>
                </div>
                <ul className="space-y-1">
                  {step.details.map((d, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-gray-400 mt-0.5">-</span><span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div className="bg-white/60 rounded-lg px-4 py-3 flex items-start gap-2 mb-3">
            <span className="material-symbols-outlined text-amber-500 text-[18px] mt-0.5">lightbulb</span>
            <p className="text-xs text-gray-700">{guide.tip}</p>
          </div>

          {/* Common Mistakes (collapsible) */}
          <button
            onClick={() => setOpenMistakes(openMistakes === guide.id ? null : guide.id)}
            className="w-full flex items-center justify-between bg-white/40 hover:bg-white/60 rounded-lg px-4 py-2.5 transition-colors"
          >
            <span className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-red-400">warning</span>
              자주 하는 실수 ({guide.commonMistakes.length})
            </span>
            <span className={`material-symbols-outlined text-[16px] text-gray-400 transition-transform ${openMistakes === guide.id ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
          {openMistakes === guide.id && (
            <div className="mt-2 space-y-2">
              {guide.commonMistakes.map((m, i) => (
                <div key={i} className="bg-white/70 rounded-lg px-4 py-3">
                  <p className="text-xs text-red-600 font-medium mb-1">
                    <span className="text-red-400">X</span> {m.mistake}
                  </p>
                  <p className="text-xs text-green-700">
                    <span className="text-green-500">O</span> {m.fix}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
