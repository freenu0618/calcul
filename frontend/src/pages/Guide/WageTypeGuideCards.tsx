/**
 * 급여유형별 사용법 카드 컴포넌트
 * 각 급여유형(월급제, 시급제, 시급기반월급제)의 3-step 사용 가이드
 */

interface StepInfo {
  num: number;
  title: string;
  details: string[];
}

interface WageGuide {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  borderColor: string;
  badgeColor: string;
  steps: StepInfo[];
  tip: string;
}

const GUIDES: WageGuide[] = [
  {
    id: 'monthly-fixed',
    icon: 'account_balance',
    title: '월급제 (고정)',
    subtitle: '매달 동일한 기본급을 받는 정규직/계약직',
    color: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeColor: 'bg-blue-600',
    steps: [
      { num: 1, title: '근로자 정보', details: ['고용형태: 정규직 또는 계약직', '사업장 규모 선택 (5인 이상/미만)', '주 소정근로일: 5일, 일 근로시간: 8시간'] },
      { num: 2, title: '급여 설정', details: ['급여유형: "월급제 (고정)" 선택', '기본급 입력 (예: 2,500,000원)', '174시간/209시간 중 선택 (보통 174시간)'] },
      { num: 3, title: '결과 확인', details: ['시프트 미입력 = 전일 개근으로 자동 계산', '연장/야간근로 있을 때만 시프트 입력', '결과: 기본급 - 4대보험 - 소득세 = 실수령액'] },
    ],
    tip: '월급제는 시프트를 입력하지 않으면 전일 개근으로 계산됩니다. 연장·야간·휴일근로가 있는 경우에만 해당 시프트를 입력하세요.',
  },
  {
    id: 'hourly-monthly',
    icon: 'schedule',
    title: '시급제 (월정산)',
    subtitle: '시급 기반, 실제 근무시간에 따라 급여 변동',
    color: 'bg-green-50',
    borderColor: 'border-green-200',
    badgeColor: 'bg-green-600',
    steps: [
      { num: 1, title: '근로자 정보', details: ['고용형태 선택', '주 소정근로일/일 근로시간 설정', '(파트타임이면 실제 근로 조건 입력)'] },
      { num: 2, title: '급여 설정', details: ['급여유형: "시급제" 선택', '시급 입력 (예: 12,000원)', '주휴수당 자동 계산됨 (주 15시간 이상)'] },
      { num: 3, title: '시프트 입력 (필수)', details: ['실제 근무한 날짜·시간을 모두 입력', '야간(22~06시) 자동 분리 계산', '결과: 시급×시간 + 주휴 + 가산 - 공제'] },
    ],
    tip: '시급제는 반드시 실제 근무 시프트를 입력해야 정확한 계산이 가능합니다. 템플릿 기능으로 반복 근무를 빠르게 입력할 수 있습니다.',
  },
  {
    id: 'hourly-based',
    icon: 'verified',
    title: '시급기반 월급제',
    subtitle: '시급 계약이지만 매달 고정 월급이 보장되는 형태',
    color: 'bg-purple-50',
    borderColor: 'border-purple-200',
    badgeColor: 'bg-purple-600',
    steps: [
      { num: 1, title: '근로자 정보', details: ['고용형태, 사업장 규모 선택', '주 소정근로일/일 근로시간 설정'] },
      { num: 2, title: '급여 설정', details: ['급여유형: "시급기반 월급제" 선택', '시급 입력 + 계약 월급(보장액) 입력', '시스템이 자동으로 유리한 금액 적용'] },
      { num: 3, title: '결과 확인', details: ['시프트 입력은 선택 사항', 'MAX(계약월급, 실제계산액) 자동 비교', '어떤 방식이 적용되었는지 표시됨'] },
    ],
    tip: '계약 월급과 실제 계산액(시급×시간+주휴) 중 근로자에게 유리한 금액이 자동으로 적용됩니다.',
  },
];

export default function WageTypeGuideCards() {
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
                      <span className="text-gray-400 mt-0.5">-</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div className="bg-white/60 rounded-lg px-4 py-3 flex items-start gap-2">
            <span className="material-symbols-outlined text-amber-500 text-[18px] mt-0.5">lightbulb</span>
            <p className="text-xs text-gray-700">{guide.tip}</p>
          </div>
        </div>
      ))}
    </div>
  );
}