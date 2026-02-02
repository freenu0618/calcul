/**
 * FAQ Section - GEO 최적화 (Schema.org FAQPage 마크업 포함)
 */

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: '주휴수당은 어떻게 계산하나요?',
    answer:
      '주휴수당은 1주 소정근로시간이 15시간 이상이고, 소정근로일을 개근한 경우 지급됩니다. 계산식: (1주 소정근로시간 ÷ 40) × 8 × 통상시급. 예를 들어 주 40시간 근무, 시급 10,320원이면 주휴수당은 82,560원입니다. PayTools는 이를 자동으로 계산해드립니다.',
  },
  {
    question: '4대보험료는 얼마나 공제되나요?',
    answer:
      '2026년 기준 4대보험 근로자 부담률: 국민연금 4.75%, 건강보험 3.595%, 장기요양보험(건강보험료의 13.14%), 고용보험 0.9%입니다. 월급 300만원 기준 약 28만원이 공제됩니다. PayTools는 최신 요율을 자동 반영합니다.',
  },
  {
    question: '연장근로수당 계산 방법이 궁금해요',
    answer:
      '연장근로수당은 1주 40시간(또는 1일 8시간)을 초과한 근로에 대해 통상시급의 1.5배를 지급합니다. 야간근로(22시~06시)는 추가로 0.5배, 휴일근로는 1.5배(8시간 이내) 또는 2.0배(8시간 초과)가 가산됩니다.',
  },
  {
    question: 'PayTools는 무료인가요?',
    answer:
      '네, 직원 3명까지는 완전 무료입니다. 무제한 계산, PDF 급여명세서가 필요하시면 Basic 플랜($9.99/월)을, 엑셀 내보내기와 AI 법령 검색이 필요하시면 Pro 플랜($14.99/월)을 추천드립니다. 3일 무료 체험도 가능합니다.',
  },
  {
    question: '최저임금 미달 여부를 확인할 수 있나요?',
    answer:
      '네, PayTools는 2026년 최저임금(시급 10,320원)을 기준으로 자동 검증합니다. 산입범위(기본급, 고정수당)와 제외항목(식대, 교통비 등)을 정확히 구분하여 최저임금 위반 여부를 알려드립니다.',
  },
  {
    question: '5인 미만 사업장도 사용할 수 있나요?',
    answer:
      '물론입니다. PayTools는 5인 미만/이상 사업장을 구분하여 계산합니다. 5인 미만은 연장·야간·휴일 가산수당 적용이 다르며, 해고예고수당 등 일부 규정이 다릅니다. 사업장 규모를 선택하시면 자동으로 반영됩니다.',
  },
];

// Schema.org FAQPage 구조화 데이터
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <section className="py-20 lg:py-28 bg-white" id="faq">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-main sm:text-4xl mb-4">
              자주 묻는 질문
            </h2>
            <p className="text-lg text-text-sub">
              급여 계산에 대해 궁금한 점을 확인하세요
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                  aria-expanded={openIndex === index}
                >
                  <span className="font-semibold text-text-main pr-4">
                    {faq.question}
                  </span>
                  <span className="material-symbols-outlined text-gray-500 flex-shrink-0">
                    {openIndex === index ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {openIndex === index && (
                  <div className="px-6 py-5 bg-white">
                    <p className="text-text-sub leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}