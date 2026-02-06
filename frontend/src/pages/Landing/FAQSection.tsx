/**
 * FAQ Section - 반발감 해소 + 탈출 경로
 * 전환 장벽이 높은 순서대로 질문 배치 (Schema.org FAQPage 마크업)
 */

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

interface FAQItem { question: string; answer: string; }

const faqs: FAQItem[] = [
  {
    question: '정말 무료인가요?',
    answer:
      '네, 직원 5명까지는 완전 무료입니다. 급여 계산기, 4대보험·소득세 자동 계산, AI 노무 상담(월 10회)을 무료로 이용하실 수 있습니다. 신용카드 등록도 필요 없습니다.',
  },
  {
    question: '계산 결과를 믿을 수 있나요?',
    answer:
      '181개의 실제 급여 케이스로 검증했으며, 근로기준법·최저임금법·국민연금법·건강보험법·고용보험법·소득세법·근로자퇴직급여보장법·산재보험법 등 8개 법률을 정밀 반영합니다. 매년 법령 변경 시 즉시 업데이트됩니다.',
  },
  {
    question: '내 데이터는 안전한가요?',
    answer:
      'SSL 암호화 통신, 데이터베이스 암호화 저장, 개인정보보호법 준수 등 엔터프라이즈급 보안을 적용하고 있습니다. 급여 데이터는 서버에 안전하게 보관되며, 원하시면 언제든 삭제할 수 있습니다.',
  },
  {
    question: '직원 수가 늘어나면 어떻게 되나요?',
    answer:
      'Free 플랜(5명)에서 Basic 플랜(20명)이나 Pro 플랜(무제한)으로 업그레이드하시면 됩니다. 기존 데이터는 모두 유지되며, 언제든 플랜을 변경할 수 있습니다.',
  },
  {
    question: '기존 엑셀 데이터를 가져올 수 있나요?',
    answer:
      'Basic 플랜 이상에서 Excel/CSV 내보내기를 지원합니다. 기존 엑셀 데이터 가져오기(import) 기능은 현재 개발 중이며, 곧 제공될 예정입니다.',
  },
  {
    question: '법률이 바뀌면 자동으로 반영되나요?',
    answer:
      '네, 매년 1월 변경되는 최저임금, 4대보험 요율, 소득세율 등을 즉시 업데이트합니다. 2026년 연금개혁(국민연금 4.75%)도 이미 반영되어 있습니다.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <section className="py-20 lg:py-28 bg-background-light" id="faq">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-main sm:text-4xl mb-4">
              자주 묻는 질문
            </h2>
            <p className="text-text-sub">
              궁금한 점이 있으시면 확인해 보세요
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  aria-expanded={openIndex === i}
                >
                  <span className="font-semibold text-text-main pr-4">{faq.question}</span>
                  <span className="material-symbols-outlined text-gray-400 flex-shrink-0">
                    {openIndex === i ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {openIndex === i && (
                  <div className="px-6 pb-5">
                    <p className="text-text-sub leading-relaxed text-sm">{faq.answer}</p>
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
