/**
 * 비로그인 사용자용 키워드 FAQ 패널
 * 정적 답변으로 AI API 호출 없이 즉시 응답
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';

interface FAQItem {
  keyword: string;
  icon: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    keyword: '최저임금',
    icon: '💰',
    question: '2026년 최저임금은 얼마인가요?',
    answer:
      '2026년 최저임금은 시급 10,320원입니다.\n\n월 환산액(209시간 기준): 2,156,880원\n\n주 40시간 근무, 주휴수당 포함 기준이며, 이보다 적게 지급하면 최저임금법 위반입니다.',
  },
  {
    keyword: '4대보험',
    icon: '🏥',
    question: '4대보험 요율이 어떻게 되나요?',
    answer:
      '2026년 4대보험 근로자 부담률:\n\n• 국민연금: 4.75% (연금개혁 반영)\n• 건강보험: 3.595%\n• 장기요양보험: 건강보험료 × 13.14%\n• 고용보험: 0.9%\n\n예) 월급 300만원 → 약 30만원 공제',
  },
  {
    keyword: '주휴수당',
    icon: '📅',
    question: '주휴수당은 어떻게 계산하나요?',
    answer:
      '주휴수당 = (1주 소정근로시간 ÷ 40) × 8 × 시급\n\n• 주 40시간 근무: 시급 × 8시간\n• 주 24시간 근무: 시급 × 4.8시간 (비례)\n• 조건: 주 15시간 이상, 소정근로일 개근\n• 5인 미만 사업장도 의무 적용',
  },
  {
    keyword: '연장근로',
    icon: '⏰',
    question: '연장·야간·휴일 수당 계산법은?',
    answer:
      '가산수당 (통상시급 기준):\n\n• 연장근로: 1.5배 (주 40시간 초과)\n• 야간근로: 0.5배 가산 (22:00~06:00)\n• 휴일근로: 1.5배 (8시간 이하)\n• 휴일 8시간 초과: 2.0배 (5인 이상)\n\n주 52시간(연장 12시간) 한도 주의',
  },
  {
    keyword: '소득세',
    icon: '📋',
    question: '소득세는 어떻게 계산되나요?',
    answer:
      '근로소득 간이세액표에 따라 원천징수합니다.\n\n• 월급·부양가족 수에 따라 달라짐\n• 지방소득세: 소득세의 10% 별도\n• 연말정산 시 과부족 정산\n\n정확한 계산은 급여계산기를 이용해보세요!',
  },
];

interface Props {
  onClose: () => void;
}

export default function QuickFAQPanel({ onClose }: Props) {
  const [selected, setSelected] = useState<FAQItem | null>(null);

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
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {!selected ? (
          <div className="space-y-3">
            <p className="text-sm text-text-sub text-center mb-4">
              궁금한 키워드를 선택해보세요
            </p>
            {FAQ_ITEMS.map((item) => (
              <button
                key={item.keyword}
                onClick={() => setSelected(item)}
                className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary/40 hover:shadow-sm transition-all text-left"
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
            ))}
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
            {/* 뒤로가기 */}
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1 text-sm text-primary hover:underline mx-auto"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              다른 질문 보기
            </button>
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
