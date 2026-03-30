/**
 * FAQ 페이지
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import { FAQIcon } from '../components/illustrations';
import AdBanner from '../components/common/AdBanner';

// GA 타입 선언
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
}

interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

const FAQ = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // FAQ 아코디언 토글 핸들러
  const handleToggle = (index: number, question: string) => {
    const newExpandedIndex = expandedIndex === index ? null : index;
    setExpandedIndex(newExpandedIndex);

    // GA4 이벤트 전송 (확장 시에만)
    if (newExpandedIndex === index && typeof window.gtag !== 'undefined') {
      window.gtag('event', 'faq_expand', {
        event_category: 'engagement',
        event_label: question,
        value: 1,
      });
    }
  };

  const faqData: FAQItem[] = [
    // 기본급 및 수당
    {
      category: '기본급 및 수당',
      question: '기본급과 통상임금의 차이는 무엇인가요?',
      answer: '기본급은 근로계약서에 명시된 기본 임금입니다. 통상임금은 기본급에 고정 수당(직책수당, 자격수당 등)을 더한 금액으로, 연장·야간·휴일 수당 계산의 기준이 됩니다. 예를 들어 기본급이 250만원이고 고정 직책수당이 20만원이면, 통상임금은 270만원입니다.',
    },
    {
      category: '기본급 및 수당',
      question: '통상시급은 어떻게 계산하나요?',
      answer: '통상시급 = 통상임금 ÷ 174시간(주 40시간 기준 월 소정근로시간)으로 계산합니다. 예를 들어 통상임금이 270만원이면, 통상시급은 270만원 ÷ 174 = 15,517원입니다.',
    },
    {
      category: '기본급 및 수당',
      question: '수당 중에서 통상임금에 포함되는 것과 제외되는 것은 무엇인가요?',
      answer: '고정 수당(직책수당, 자격수당 등)은 통상임금에 포함됩니다. 변동 수당(연장수당, 야간수당, 실적급 등)과 복리후생비(식대, 교통비 등)는 제외됩니다. 통상임금에 포함된 수당만이 가산수당 계산의 기준이 됩니다.',
    },
    {
      category: '기본급 및 수당',
      question: '식대는 최저임금에 포함되나요?',
      answer: '식대는 월 20만원까지는 최저임금 산입 범위에 제외되며, 20만원을 초과하는 금액만 최저임금 계산에 포함됩니다. 예를 들어 식대가 25만원이면 5만원만 최저임금 계산에 포함됩니다.',
    },
    {
      category: '기본급 및 수당',
      question: '주휴수당은 무엇인가요?',
      answer: '주휴수당은 1주일 동안 소정근로일을 개근한 근로자에게 지급하는 유급 휴일 수당입니다. 주 15시간 이상 근무하고 소정근로일을 개근하면 지급받을 수 있으며, 5인 미만 사업장도 의무 적용됩니다.',
    },

    // 4대 보험
    {
      category: '4대 보험',
      question: '4대 보험은 누가 납부하나요?',
      answer: '4대 보험은 근로자와 사업주가 공동으로 부담합니다. 국민연금(4.75%), 건강보험(3.595%), 고용보험(0.9%)은 근로자와 사업주가 각각 부담하고, 장기요양보험은 건강보험료의 13.14%를 부담합니다.',
    },
    {
      category: '4대 보험',
      question: '국민연금 상·하한이 있나요?',
      answer: '네, 2026년 기준 국민연금은 기준소득월액 하한 39만원, 상한 590만원이 적용됩니다. 즉, 월 급여가 590만원을 초과해도 국민연금은 590만원 기준으로 계산됩니다.',
    },
    {
      category: '4대 보험',
      question: '건강보험과 장기요양보험은 어떻게 계산하나요?',
      answer: '건강보험은 월 급여의 3.595%이며, 장기요양보험은 건강보험료의 13.14%입니다. 예를 들어 월 급여 300만원이면 건강보험은 107,850원, 장기요양보험은 14,171원입니다.',
    },
    {
      category: '4대 보험',
      question: '고용보험은 무엇에 사용되나요?',
      answer: '고용보험은 실직 시 실업급여를 받거나, 육아휴직·출산휴가 급여, 직업훈련 지원 등에 사용됩니다. 근로자는 월 급여의 0.9%를 부담합니다.',
    },
    {
      category: '4대 보험',
      question: '프리랜서도 4대 보험에 가입할 수 있나요?',
      answer: '프리랜서는 지역가입자로 국민연금과 건강보험에 가입할 수 있으나, 직장 가입자와는 보험료 산정 방식이 다릅니다. 고용보험은 예술인·노무제공자 고용보험을 별도로 신청할 수 있습니다.',
    },

    // 소득세
    {
      category: '소득세',
      question: '소득세는 어떻게 계산하나요?',
      answer: '소득세는 간이세액표를 사용하여 월 급여액과 부양가족 수에 따라 계산됩니다. 4대 보험료를 제외한 과세 대상 금액에 간이세액표를 적용하여 산출합니다.',
    },
    {
      category: '소득세',
      question: '부양가족이 많으면 세금이 줄어드나요?',
      answer: '네, 부양가족이 많을수록 소득세가 줄어듭니다. 부양가족 1인당 월 약 5만원~10만원 정도의 세금이 감소합니다. 특히 20세 이하 자녀가 있으면 추가 세액공제를 받을 수 있습니다.',
    },
    {
      category: '소득세',
      question: '지방소득세는 무엇인가요?',
      answer: '지방소득세는 소득세의 10%로 계산되는 지방세입니다. 예를 들어 소득세가 4만원이면 지방소득세는 4천원입니다.',
    },
    {
      category: '소득세',
      question: '연말정산은 언제 하나요?',
      answer: '연말정산은 매년 1월에 전년도 소득에 대해 진행하며, 2월 급여에 환급 또는 추가 징수가 반영됩니다. 신용카드 사용액, 의료비, 교육비 등을 공제받을 수 있습니다.',
    },
    {
      category: '소득세',
      question: '연말정산에서 환급을 많이 받으려면?',
      answer: '신용카드는 총 급여의 25% 이상 사용해야 공제가 시작되므로, 가능하면 체크카드나 현금영수증을 적극 활용하세요. 의료비, 교육비, 기부금 등도 공제 대상입니다.',
    },

    // 연장·야간·휴일 근로
    {
      category: '연장·야간·휴일 근로',
      question: '연장근로는 하루 8시간 초과를 의미하나요?',
      answer: '아닙니다. 연장근로는 주 40시간을 초과한 근무를 의미합니다. 하루 10시간 근무해도 주 40시간 이내면 연장근로가 아닙니다. 연장근로 수당은 통상시급의 1.5배입니다.',
    },
    {
      category: '연장·야간·휴일 근로',
      question: '야간근로 시간은 언제부터 언제까지인가요?',
      answer: '야간근로는 22:00부터 익일 06:00까지입니다. 이 시간대에 근무하면 통상시급의 0.5배(50%)를 가산하여 받습니다. 즉, 야간 시간대는 통상시급의 1.5배(기본 1.0 + 가산 0.5)를 받습니다.',
    },
    {
      category: '연장·야간·휴일 근로',
      question: '휴일근로 수당은 얼마나 받나요?',
      answer: '휴일근로는 8시간 이하 시 통상시급의 1.5배를 받습니다. 5인 이상 사업장에서 8시간 초과 시에는 2.0배를 받지만, 5인 미만 사업장은 1.5배만 받습니다.',
    },
    {
      category: '연장·야간·휴일 근로',
      question: '연장과 야간이 중복되면 어떻게 되나요?',
      answer: '연장근로와 야간근로가 중복되면 두 가산율을 합산하여 통상시급의 2.0배(기본 1.0 + 연장 0.5 + 야간 0.5)를 받습니다. 예를 들어 23시~24시 근무 시 2.0배를 받습니다.',
    },
    {
      category: '연장·야간·휴일 근로',
      question: '주 52시간을 초과하면 어떻게 되나요?',
      answer: '근로기준법에 따라 1주 최대 근로시간은 52시간(법정 40시간 + 연장 12시간)입니다. 이를 위반하면 사업주는 2년 이하의 징역 또는 2천만원 이하의 벌금에 처해질 수 있습니다.',
    },

    // 최저임금
    {
      category: '최저임금',
      question: '2026년 최저임금은 얼마인가요?',
      answer: '2026년 최저임금은 시급 10,320원입니다. 월 환산액은 10,320원 × 174시간 = 1,795,680원입니다.',
    },
    {
      category: '최저임금',
      question: '최저임금 계산에 포함되는 수당은 무엇인가요?',
      answer: '기본급과 고정 수당(직책수당 등)은 최저임금 계산에 포함됩니다. 연장·야간·휴일 가산분, 식대(20만원 한도), 실비변상 수당(교통비 등)은 제외됩니다.',
    },
    {
      category: '최저임금',
      question: '최저임금 미달이면 어떻게 하나요?',
      answer: '최저임금 미달은 불법이며, 근로자는 노동청에 신고할 수 있습니다. 사업주는 3년 이하의 징역 또는 2천만원 이하의 벌금에 처해질 수 있습니다.',
    },
    {
      category: '최저임금',
      question: '수습 기간에도 최저임금을 받나요?',
      answer: '수습 기간(3개월 이내)에는 최저임금의 90%까지 감액할 수 있습니다. 단, 1년 미만 단기 근로계약이나 5인 미만 사업장 제외 등 일부 제한이 있습니다.',
    },
    {
      category: '최저임금',
      question: '파트타임 근로자도 최저임금을 받나요?',
      answer: '네, 파트타임 근로자도 최저임금을 받습니다. 근로시간에 관계없이 모든 근로자는 최저임금 이상의 임금을 받을 권리가 있습니다.',
    },

    // 법적 권리
    {
      category: '법적 권리',
      question: '급여명세서를 받을 권리가 있나요?',
      answer: '네, 근로자는 급여명세서를 받을 법적 권리가 있습니다. 사업주는 근로자에게 임금 지급 시 지급 내역을 서면으로 교부해야 합니다(근로기준법 제48조).',
    },
    {
      category: '법적 권리',
      question: '임금 체불 시 어떻게 대응하나요?',
      answer: '임금 체불 시 노동청에 진정·고소를 제기할 수 있습니다. 사업주는 3년 이하의 징역 또는 3천만원 이하의 벌금에 처해질 수 있으며, 근로자는 체불 임금과 지연 이자를 받을 수 있습니다.',
    },
    {
      category: '법적 권리',
      question: '퇴직금은 언제 받을 수 있나요?',
      answer: '1년 이상 계속 근로한 근로자는 퇴직 시 퇴직금을 받을 수 있습니다. 퇴직금은 퇴직 전 평균 임금의 30일분 × 근속 연수로 계산됩니다.',
    },
    {
      category: '법적 권리',
      question: '연차휴가는 어떻게 계산하나요?',
      answer: '1년 근무 시 15일의 연차가 발생하며, 3년 이상 근무 시 2년마다 1일씩 추가되어 최대 25일까지 받을 수 있습니다. 미사용 연차는 임금으로 보상받을 수 있습니다.',
    },
    {
      category: '법적 권리',
      question: '계약서를 작성하지 않았는데 문제가 되나요?',
      answer: '사업주는 근로계약서를 작성하여 근로자에게 교부할 법적 의무가 있습니다. 계약서 미작성 시 사업주는 500만원 이하의 벌금에 처해질 수 있습니다.',
    },
  ];

  const categories = ['전체', ...Array.from(new Set(faqData.map(item => item.category)))];
  const filteredFAQ = selectedCategory === '전체'
    ? faqData
    : faqData.filter(item => item.category === selectedCategory);

  // FAQPage 구조화된 데이터 (schema.org)
  const faqSchemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <>
      <Helmet>
        <title>자주 묻는 질문 (FAQ) | PayTools 급여 계산기</title>
        <meta name="description" content="급여 계산, 4대 보험, 소득세, 연장수당, 최저임금, 법적 권리에 대한 30개의 자주 묻는 질문과 답변을 확인하세요." />
        <link rel="canonical" href="https://paytools.work/faq" />
        <meta property="og:title" content="자주 묻는 질문 (FAQ) - 급여 계산기" />
        <meta property="og:description" content="급여 계산, 4대 보험, 소득세, 연장수당, 최저임금에 대한 30개의 FAQ." />
        <meta property="og:url" content="https://paytools.work/faq" />
        <script type="application/ld+json">
          {JSON.stringify(faqSchemaData)}
        </script>
      </Helmet>

      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center gap-4">
            <FAQIcon size="lg" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1">
                자주 묻는 질문 (FAQ)
              </h1>
              <p className="text-lg text-gray-600">
                급여 계산과 관련하여 자주 묻는 질문들을 확인하세요.
              </p>
            </div>
          </div>

        {/* 카테고리 필터 */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ 목록 (아코디언) */}
        <div className="space-y-4">
          {filteredFAQ.map((item, index) => (
            <Card key={index}>
              <button
                onClick={() => handleToggle(index, item.question)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start mb-2">
                      <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded mr-3">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Q. {item.question}
                    </h3>
                  </div>
                  <svg
                    className={`w-6 h-6 text-gray-500 transition-transform ml-4 flex-shrink-0 ${
                      expandedIndex === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {expandedIndex === index && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-gray-700">
                    A. {item.answer}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* 추가 도움말 */}
        {/* 광고 배너 */}
        <AdBanner slot="6789012345" format="auto" className="mt-8 mb-4" />

        <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">더 궁금한 사항이 있으신가요?</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/guide" className="text-blue-600 hover:text-blue-700">
                📚 가이드에서 자세한 정보 확인하기
              </Link>
            </li>
            <li>
              <Link to="/examples" className="text-blue-600 hover:text-blue-700">
                📊 계산 사례 둘러보기
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-blue-600 hover:text-blue-700">
                ✉️ 문의하기
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </MainLayout>
    </>
  );
};

export default FAQ;
