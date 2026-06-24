/**
 * 비로그인 사용자용 키워드 FAQ 패널
 * 정적 답변으로 AI API 호출 없이 즉시 응답
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

interface FAQItem {
  keyword: string;
  icon: string;
  question: string;
  answer: string;
  relatedPath: string;
  relatedLabel: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    keyword: '최저임금',
    icon: '💰',
    question: '2026년 최저임금은 얼마인가요?',
    answer:
      '2026년 최저임금은 시급 10,320원입니다.\n\n월 환산액(209시간 기준): 2,156,880원\n\n주 40시간 근무, 주휴수당 포함 기준이며, 이보다 적게 지급되는지 보려면 근로시간, 수당 산입 범위, 휴게시간을 함께 확인해야 합니다.',
    relatedPath: '/guide',
    relatedLabel: '최저임금 기준 더 보기',
  },
  {
    keyword: '4대보험',
    icon: '🏥',
    question: '4대보험 요율이 어떻게 되나요?',
    answer:
      '2026년 4대보험 근로자 부담률:\n\n• 국민연금: 4.75% (연금개혁 반영)\n• 건강보험: 3.595%\n• 장기요양보험: 건강보험료 × 13.14%\n• 고용보험: 0.9%\n\n예) 월급 300만원 → 약 30만원 공제',
    relatedPath: '/guide/insurance',
    relatedLabel: '4대보험 가이드 보기',
  },
  {
    keyword: '주휴수당',
    icon: '📅',
    question: '주휴수당은 어떻게 계산하나요?',
    answer:
      '주휴수당 = (1주 소정근로시간 ÷ 40) × 8 × 시급\n\n• 주 40시간 근무: 시급 × 8시간\n• 주 24시간 근무: 시급 × 4.8시간 (비례)\n• 조건: 주 15시간 이상, 소정근로일 개근\n• 5인 미만 사업장도 의무 적용',
    relatedPath: '/guide/weekly-holiday',
    relatedLabel: '주휴수당 가이드 보기',
  },
  {
    keyword: '연장근로',
    icon: '⏰',
    question: '연장·야간·휴일 수당 계산법은?',
    answer:
      '가산수당 (통상시급 기준):\n\n• 연장근로: 1.5배 (주 40시간 초과)\n• 야간근로: 0.5배 가산 (22:00~06:00)\n• 휴일근로: 1.5배 (8시간 이하)\n• 휴일 8시간 초과: 2.0배 (5인 이상)\n\n주 52시간(연장 12시간) 한도 주의',
    relatedPath: '/guide/overtime',
    relatedLabel: '연장·야간·휴일 가이드 보기',
  },
  {
    keyword: '소득세',
    icon: '📋',
    question: '소득세는 어떻게 계산되나요?',
    answer:
      '근로소득 간이세액표에 따라 원천징수합니다.\n\n• 월급·부양가족 수에 따라 달라짐\n• 지방소득세: 소득세의 10% 별도\n• 연말정산 시 과부족 정산\n\n정확한 계산은 급여계산기를 이용해보세요!',
    relatedPath: '/guide/tax',
    relatedLabel: '소득세 가이드 보기',
  },
  {
    keyword: '계산기선택',
    icon: '🧭',
    question: '급여 계산기, 역산 계산기, 시뮬레이션 중 무엇을 써야 하나요?',
    answer:
      '이미 기본급, 시급, 근무시간, 수당을 알고 있다면 급여 계산기를 먼저 사용하세요.\n\n목표 월 실수령액에서 필요한 세전 급여를 거꾸로 알고 싶다면 역산 계산기가 적합합니다.\n\n여러 급여안, 인상 전후, 수당 배분을 비교하려면 시뮬레이션에서 조건을 나눠 보는 것이 좋습니다.',
    relatedPath: '/faq',
    relatedLabel: 'FAQ에서 계산기 선택 기준 보기',
  },
  {
    keyword: '개인정보',
    icon: '🔒',
    question: '계산 전에 개인정보가 필요한가요?',
    answer:
      '아니요. 공개 FAQ와 계산기에서는 이름, 주민등록번호, 계좌번호, 회사 내부 급여대장 같은 민감정보가 필요하지 않습니다.\n\n급여유형, 기본급 또는 시급, 근무시간, 수당, 부양가족 수, 4대보험 적용 여부처럼 계산 조건만 분리해 입력하세요.',
    relatedPath: '/faq',
    relatedLabel: 'FAQ에서 안전 입력 원칙 보기',
  },
  {
    keyword: '체불판단',
    icon: '⚖️',
    question: '체불이나 최저임금 위반인지 바로 판단할 수 있나요?',
    answer:
      'PayTools 계산 결과는 참고용 추정치입니다.\n\n체불, 최저임금 위반, 예외 공제처럼 판단이 필요한 사안은 계약서, 근무기록, 휴게시간, 수당 산입 범위, 사업장 규모를 함께 확인해야 합니다.\n\n분쟁 가능성이 있으면 계산 결과만으로 단정하지 말고 법률 정보와 공식 상담 경로를 함께 확인하세요.',
    relatedPath: '/legal',
    relatedLabel: '법률 정보와 한계 보기',
  },
];

interface Props {
  onClose: () => void;
}

export default function QuickFAQPanel({ onClose }: Props) {
  const [selected, setSelected] = useState<FAQItem | null>(null);
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return FAQ_ITEMS;

    return FAQ_ITEMS.filter((item) =>
      [item.keyword, item.question, item.answer].some((value) =>
        value.toLowerCase().includes(keyword)
      )
    );
  }, [query]);

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h3 className="font-bold text-lg">페이봇 AI</h3>
            <p className="text-blue-100 text-sm">자주 묻는 질문</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors" aria-label="FAQ 패널 닫기">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {!selected ? (
          <div className="space-y-3">
            <p className="text-sm text-text-sub text-center">
              궁금한 키워드를 선택하거나 검색해보세요
            </p>
            <label className="block">
              <span className="sr-only">FAQ 검색</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="예: 최저임금, 계산기선택, 4대보험"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-text-main placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="FAQ 검색"
              />
            </label>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <button
                  key={item.keyword}
                  onClick={() => setSelected(item)}
                  className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary/40 hover:shadow-sm transition-all text-left"
                  aria-label={`${item.keyword} FAQ 보기`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-text-main text-sm">{item.keyword}</p>
                    <p className="text-xs text-text-sub">{item.question}</p>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 ml-auto text-[18px]">
                    chevron_right
                  </span>
                </button>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-6 text-center text-sm text-text-sub">
                검색 결과가 없습니다. 다른 키워드로 다시 찾아보세요.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* 질문 (유저 버블) */}
            <div className="flex justify-end">
              <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md bg-primary text-white text-sm">
                {selected.question}
              </div>
            </div>
            {/* 답변 (봇 버블) */}
            <div className="flex justify-start">
              <div className="max-w-[90%] px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-gray-200 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {selected.answer}
              </div>
            </div>
            <Link
              to={selected.relatedPath}
              className="flex items-center justify-center gap-1 text-sm text-primary hover:underline mx-auto"
            >
              {selected.relatedLabel}
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </Link>
            {/* 뒤로가기 */}
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1 text-sm text-primary hover:underline mx-auto"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              다른 질문 보기
            </button>
            <Link
              to="/calculator"
              className="flex items-center justify-center gap-1 text-sm text-text-sub hover:text-primary transition-colors mx-auto"
            >
              계산기로 바로 확인하기
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </Link>
          </div>
        )}
      </div>

      {/* 하단 CTA */}
      <div className="p-4 border-t border-gray-200 bg-white space-y-2">
        <Link
          to="/register"
          className="block w-full h-11 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          무료 가입하고 AI 상담 이용하기
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
        <p className="text-[10px] text-gray-400 text-center">
          가입 후 월 10회 AI 노무 상담 무료
        </p>
      </div>
    </div>
  );
}
