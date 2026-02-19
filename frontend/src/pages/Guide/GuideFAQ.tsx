/**
 * 서비스 사용 FAQ 컴포넌트
 * 계산기 필드에 특화된 맥락적 Q&A
 */
import { useState } from 'react';

interface FAQItem { q: string; a: string; category: string; }

const CATEGORIES = ['전체', '급여유형', '시프트', '수당', '보험·세금'];

const FAQ_ITEMS: FAQItem[] = [
  {
    category: '급여유형',
    q: '174시간과 209시간의 차이가 뭔가요?',
    a: '174시간은 실제 근로시간(주 40시간 × 4.35주)이고, 209시간은 주휴시간까지 포함한 시간입니다. 174시간 모드에서는 주휴수당을 별도로 계산하고, 209시간 모드에서는 기본급에 주휴수당이 이미 포함된 것으로 처리합니다. 대부분의 경우 174시간 모드가 적합합니다.',
  },
  {
    category: '급여유형',
    q: '어떤 급여유형을 선택해야 하나요?',
    a: '매달 같은 기본급을 받으면 "월급제", 시급으로 계약했으면 "시급제", 시급 계약이지만 월 보장액이 있으면 "시급기반 월급제"를 선택하세요. 페이지 상단의 의사결정 도우미를 이용하면 더 쉽게 선택할 수 있습니다.',
  },
  {
    category: '시프트',
    q: '시프트를 꼭 입력해야 하나요?',
    a: '시급제는 반드시 입력해야 합니다. 시프트가 없으면 근무시간을 알 수 없어 급여가 0원으로 계산됩니다. 월급제와 시급기반 월급제는 선택사항으로, 시프트를 입력하지 않으면 전일 개근으로 처리됩니다. 연장·야간근로가 있을 때만 입력하세요.',
  },
  {
    category: '시프트',
    q: '템플릿 기능은 어떻게 사용하나요?',
    a: '시프트 입력 화면에서 "월간 템플릿" 버튼을 누르면 요일별 반복 근무를 한 번에 설정할 수 있습니다. 예를 들어 월~금 09:00~18:00으로 설정하면 해당 월의 평일에 자동으로 시프트가 채워집니다.',
  },
  {
    category: '수당',
    q: '수당 체크박스(과세/비과세/통상임금)는 뭔가요?',
    a: '수당마다 4가지 속성을 설정합니다. "과세"는 소득세 부과 여부, "최저임금 산입"은 최저임금 충족 계산에 포함 여부, "고정"은 매월 정기 지급 여부, "통상임금 포함"은 연장·야간수당 계산의 기준이 되는지 여부입니다.',
  },
  {
    category: '보험·세금',
    q: '4대보험은 어떻게 계산되나요?',
    a: '2026년 기준 근로자 부담분: 국민연금 4.75%, 건강보험 3.595%, 장기요양보험 건강보험료의 13.14%, 고용보험 0.9%입니다. 과세 대상 급여를 기준으로 자동 계산됩니다.',
  },
  {
    category: '보험·세금',
    q: '외국인 근로자도 사용할 수 있나요?',
    a: '네, 계산 로직은 동일하게 적용됩니다. 다만 외국인 근로자의 4대보험 가입 의무는 체류자격에 따라 다를 수 있으므로, 실제 공제 항목은 노무사와 상담하시기 바랍니다.',
  },
];

export default function GuideFAQ() {
  const [activeCategory, setActiveCategory] = useState('전체');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = activeCategory === '전체'
    ? FAQ_ITEMS
    : FAQ_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[24px]">help</span>
        <h3 className="text-lg font-bold text-gray-900">자주 묻는 질문</h3>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ list */}
      <div className="space-y-2">
        {filtered.map((item) => {
          const globalIndex = FAQ_ITEMS.indexOf(item);
          const isOpen = openIndex === globalIndex;
          return (
            <div key={globalIndex} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-primary font-bold text-sm">Q</span>
                <span className="flex-1 text-sm font-medium text-gray-900">{item.q}</span>
                <span className={`material-symbols-outlined text-gray-400 text-[18px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-4 pl-11">
                  <p className="text-sm text-gray-700 leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
