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
      '20개의 실제 급여 케이스 테스트로 검증했으며, 근로기준법·최저임금법·국민연금법·건강보험법·고용보험법·소득세법·근로자퇴직급여보장법·산재보험법 등 8개 법률을 반영합니다. 매년 법령 변경 시 업데이트됩니다.',
  },
  {
    question: '내 데이터는 안전한가요?',
    answer:
      'SSL 암호화 통신과 개인정보보호법을 준수합니다. 급여 데이터는 서버에 안전하게 보관되며, 원하시면 언제든 삭제할 수 있습니다.',
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
    question: '실수령액 기준으로 세전 월급을 역산할 수도 있나요?',
    answer:
      '네, 가능합니다. PayTools의 실수령액 역산 계산기를 이용하면 목표 실수령액을 기준으로 필요한 세전 월급을 빠르게 확인할 수 있어, 채용 제안이나 급여 협의 전에 기준선을 잡는 데 도움이 됩니다.',
  },
  {
    question: '법률이 바뀌면 자동으로 반영되나요?',
    answer:
      '네, 매년 1월 변경되는 최저임금, 4대보험 요율, 소득세율 등을 즉시 업데이트합니다. 2026년 연금개혁(국민연금 4.75%)도 이미 반영되어 있습니다.',
  },
  {
    question: '계산 결과를 급여 지급 근거로 바로 써도 되나요?',
    answer:
      'PayTools 결과는 급여 조건을 점검하는 참고용 예상액입니다. 실제 지급 전에는 근로계약서, 근무기록, 비과세 수당, 회사별 공제, 정산 기간이 같은지 확인하고 분쟁 가능성이 있으면 노무사 또는 세무 전문가 검토를 함께 진행하는 것이 안전합니다.',
  },
  {
    question: '카페나 학원처럼 소규모 사업장은 첫 급여를 어떻게 준비하나요?',
    answer:
      '먼저 상시근로자 5인 이상 여부, 월급제·시급제·시급기반 월급제 중 계약 방식, 주 소정근로시간, 주휴수당 대상 여부를 나누세요. 그다음 기본급 또는 시급, 과세·비과세 수당, 실제 시프트, 부양가족 수, 4대보험 적용 여부를 PayTools에 입력해 예상 실수령액과 사업주 부담을 검토하는 흐름이 안전합니다.',
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
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              const triggerId = `landing-faq-trigger-${i}`;
              const panelId = `landing-faq-panel-${i}`;

              return (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button
                    id={triggerId}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full px-4 sm:px-6 py-5 sm:py-5 min-h-[56px] text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                  >
                    <span className="font-semibold text-text-main pr-4">{faq.question}</span>
                    <span className="material-symbols-outlined text-gray-400 flex-shrink-0" aria-hidden="true">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      className="px-6 pb-5"
                    >
                      <p className="text-text-sub leading-relaxed text-sm">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
