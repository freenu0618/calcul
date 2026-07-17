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
    gtag: (command: string, ...args: unknown[]) => void;
  }
}

interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

interface CategorySummary {
  title: string;
  description: string;
}

const categorySummaries: CategorySummary[] = [
  {
    title: '계산 전 준비 정보',
    description: '급여유형, 금액, 근무시간, 수당, 부양가족 수, 사업장 규모처럼 결과를 바꾸는 조건만 준비하면 개인정보 없이도 예상액을 확인할 수 있습니다.',
  },
  {
    title: '4대 보험·실수령액 핵심',
    description: '근로자 부담 보험료와 간이세액표 원천징수를 함께 계산해야 월급에서 실제로 받는 실수령액을 확인할 수 있습니다.',
  },
  {
    title: '주휴수당·최저임금 확인',
    description: '주 15시간 이상 근무하고 소정근로일을 개근했다면 주휴수당 대상이며, 2026년 최저임금과 월 환산액 기준도 같이 점검해야 합니다.',
  },
  {
    title: '연장·야간·휴일수당 기준',
    description: '통상시급을 기준으로 연장·야간·휴일 가산율을 더해 계산하며, 중복되는 시간대는 가산분을 합산해 판단합니다.',
  },
  {
    title: '정방향·역산 계산기 선택',
    description: '기본급·시급·근무시간을 알고 있으면 급여 계산기를, 목표 실수령액에서 필요한 세전 급여를 알고 싶으면 역산 계산기를 먼저 사용합니다.',
  },
  {
    title: '급여명세서 차이 점검',
    description: '계산 결과와 실제 명세서가 다르면 비과세 수당, 상여, 회사별 공제, 정산 기간, 주휴·가산수당 조건을 같은 순서로 다시 확인합니다.',
  },
  {
    title: '근태·휴게시간 점검',
    description: '출퇴근 기록, 휴게시간, 결근·지각·조퇴, 무급휴가가 계산 입력값과 다르면 실근로시간과 공제액이 달라질 수 있습니다.',
  },
  {
    title: '급여 인상·소급 정산',
    description: '인상 적용일, 기존 급여, 변경 급여, 정산 기간, 수당, 4대보험·세액 조정 여부를 분리해 단순 차액과 실수령액 차이를 구분합니다.',
  },
  {
    title: '중도 입퇴사·일할 계산',
    description: '입사일·퇴사일이 월 중간에 있으면 월급 전체가 아니라 재직일, 소정근로일, 실제 근무시간, 주휴·가산수당 조건을 나눠 예상액을 확인합니다.',
  },
  {
    title: '지급 전 최종 점검',
    description: '실제 지급 전에 근로계약서, 출퇴근 기록, 휴게시간, 정산 기간, 비과세 수당, 회사별 공제가 계산 입력값과 맞는지 확인해야 합니다.',
  },
  {
    title: '참고용 계산·공식 문의',
    description: '실제 지급, 체불, 예외 공제처럼 판단이 필요한 사안은 계산 결과를 참고용으로 보고 법률 정보나 문의 경로를 함께 확인해야 합니다.',
  },
  {
    title: '개인정보 최소 입력',
    description: '공개 계산과 FAQ 확인에는 이름, 주민등록번호, 계좌번호 같은 민감정보가 필요하지 않으며 계산 조건만 분리해 확인합니다.',
  },
  {
    title: '소규모 사업장 계산 순서',
    description: '카페·학원·스타트업처럼 직원 수가 적은 사업장은 5인 이상 여부, 급여유형, 주휴수당 대상, 가산수당 조건을 먼저 분리해야 합니다.',
  },
];

const answerRouteCards = [
  {
    title: '월급·알바 실수령액 계산',
    description: '기본급, 시급, 근무시간, 수당, 부양가족 수처럼 실제 입력값이 있을 때는 정방향 급여 계산기를 먼저 사용합니다.',
    to: '/calculator',
    label: '급여 계산기',
  },
  {
    title: '목표 실수령액에서 역산',
    description: '월 실수령액 목표만 있거나 연봉 협상 기준선을 잡을 때는 역산 계산기로 필요 세전 급여를 먼저 추정합니다.',
    to: '/reverse-calculator',
    label: '역산 계산기',
  },
  {
    title: '여러 급여안 비교',
    description: '인상 전후, 수당 배분, 고용형태 변화처럼 복수 시나리오를 비교할 때는 시뮬레이션 흐름이 적합합니다.',
    to: '/simulation',
    label: '시뮬레이션',
  },
  {
    title: '급여 인상·소급분 검토',
    description: '적용 시작일, 정산 기간, 기존·변경 급여와 수당을 나눠 보고, 실수령액 비교는 시뮬레이션 후 계산기에서 월별 공제액을 다시 확인합니다.',
    to: '/simulation',
    label: '인상안 비교',
  },
  {
    title: '계산 결과와 명세서 차이',
    description: '실제 급여명세서와 다르면 급여유형, 정산 기간, 174시간/209시간 기준, 비과세 수당, 상여, 회사별 공제를 같은 순서로 다시 확인합니다.',
    to: '/calculator',
    label: '결과 재검토',
  },
  {
    title: '지급 전 최종 검토',
    description: '사업주가 지급액을 확정하기 전에는 근로계약서, 출퇴근 기록, 휴게시간, 4대보험 취득·상실 시점, 부양가족 조건을 입력값과 맞춰 봅니다.',
    to: '/legal',
    label: '지급 전 확인',
  },
  {
    title: '법률 전제와 분쟁 가능성',
    description: '최저임금 위반, 체불, 예외 공제처럼 판단이 필요한 질문은 계산값을 참고용으로 보고 법률 정보와 전문가 검토를 함께 확인합니다.',
    to: '/legal',
    label: '법률 정보',
  },
  {
    title: '소규모 사업장 첫 급여 설정',
    description: '직원 수가 적은 사업장은 5인 이상 여부와 주휴·가산수당 조건을 먼저 나누고 사용 가이드에서 입력 흐름을 확인합니다.',
    to: '/guide/how-to-use',
    label: '사용 가이드',
  },
];

const dateModified = '2026-07-18';

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
    // 계산기 선택
    {
      category: '계산기 선택',
      question: '급여 계산기와 실수령액 역산 계산기는 언제 각각 사용하나요?',
      answer: '기본급, 시급, 근무시간, 수당, 부양가족 수처럼 실제 입력값을 알고 있다면 급여 계산기를 사용하세요. 반대로 "월 실수령액 300만원을 받으려면 세전 월급이 얼마여야 하나요?"처럼 목표 실수령액에서 거꾸로 계산하려면 실수령액 역산 계산기가 더 적합합니다. 역산 후 실제 수당, 시프트, 비과세 항목을 반영하려면 급여 계산기로 한 번 더 확인하는 것이 안전합니다.',
    },
    {
      category: '계산기 선택',
      question: '계산 전에 개인정보를 입력해야 하나요?',
      answer: '아니요. 공개 급여 계산과 FAQ 확인에는 이름, 주민등록번호, 계좌번호, 회사 내부 급여대장 같은 민감정보가 필요하지 않습니다. 급여유형, 기본급 또는 시급, 근무시간, 수당, 부양가족 수, 4대보험 적용 여부처럼 계산 조건만 분리해 입력하는 것이 안전합니다.',
    },
    {
      category: '계산기 선택',
      question: '급여 계산 전에 어떤 정보만 준비하면 되나요?',
      answer: '먼저 급여유형이 월급제, 시급제, 시급기반 월급제 중 무엇인지 정하고 기본급 또는 시급, 정산 기간, 근무일과 근무시간, 과세·비과세 수당, 부양가족 수, 4대보험 적용 여부, 사업장 규모를 준비하세요. 목표 실수령액만 알고 있다면 역산 계산기로 기준선을 잡고, 실제 수당과 시프트가 정리되면 급여 계산기에서 다시 확인하는 흐름이 좋습니다. 이름, 주민등록번호, 계좌번호, 급여명세서 원본은 공개 계산에 필요하지 않습니다.',
    },
    {
      category: '계산기 선택',
      question: 'PayTools 계산 결과와 실제 급여명세서가 다르면 무엇부터 확인해야 하나요?',
      answer: '먼저 급여유형, 정산 기간, 기본급 또는 시급, 174시간/209시간 기준이 실제 계약서와 같은지 확인하세요. 다음으로 비과세 수당, 상여, 회사별 공제, 4대보험 적용 여부, 부양가족 수, 주휴수당·연장·야간·휴일수당 조건을 분리해 다시 점검하는 것이 좋습니다. 그래도 차이가 크면 계산 결과는 참고용으로 두고 회사 담당자나 전문가 검토로 연결하세요.',
    },
    {
      category: '계산기 선택',
      question: '출퇴근 기록이나 휴게시간이 다르면 급여 계산도 달라지나요?',
      answer: '네. 실제 출퇴근 기록, 휴게시간, 결근·지각·조퇴, 무급휴가가 입력값과 다르면 실근로시간, 주휴수당 대상 여부, 연장·야간·휴일수당, 공제액이 달라질 수 있습니다. 급여명세서와 계산 결과가 다를 때는 금액만 비교하지 말고 정산 기간, 근무일, 휴게시간, 결근·지각·조퇴 처리 방식, 무급휴가 여부를 먼저 맞춰 보세요. 공개 문의나 AI 답변에는 이름·주민등록번호·계좌번호 대신 익명화한 근무 조건만 정리하는 것이 안전합니다.',
    },
    {
      category: '계산기 선택',
      question: '계산 결과를 실제 급여 지급 전에 어떻게 검토해야 하나요?',
      answer: 'PayTools 결과는 지급 전 검토 기준선으로 사용하세요. 실제 지급 전에 근로계약서의 급여유형, 정산 기간, 출퇴근 기록, 휴게시간, 비과세 수당, 상여, 회사별 공제, 4대보험 취득·상실 시점, 부양가족 수가 입력값과 같은지 확인해야 합니다. 체불, 최저임금 위반, 예외 공제처럼 판단이 필요한 사안은 계산값만으로 단정하지 말고 법률 정보나 전문가 검토로 분리하는 것이 안전합니다.',
    },
    {
      category: '계산기 선택',
      question: '급여명세서 차이를 문의할 때 어떤 정보만 정리하면 되나요?',
      answer: '민감정보 대신 계산 조건만 익명화해 정리하세요. 급여유형, 기본급 또는 시급, 정산 기간, 근무시간, 과세·비과세 수당, 부양가족 수, 4대보험 적용 여부, 사업장 규모, 174시간/209시간 기준, 주휴·가산수당 조건이면 차이를 검토하는 데 충분합니다. 이름, 주민등록번호, 계좌번호, 원본 급여대장 파일은 공개 문의나 AI 답변에 제공하지 않는 것이 안전합니다.',
    },
    {
      category: '계산기 선택',
      question: '카페나 학원처럼 소규모 사업장은 어떤 순서로 급여를 계산해야 하나요?',
      answer: '먼저 상시근로자 5인 이상 여부를 나누고, 급여유형이 월급제·시급제·시급기반 월급제 중 무엇인지 확인하세요. 다음으로 주 소정근로시간과 소정근로일 개근 여부로 주휴수당 대상을 확인하고, 5인 이상 사업장이라면 연장·야간·휴일 가산수당 조건을 분리해 입력하는 것이 좋습니다. 처음 설정하는 사업주는 /guide/how-to-use에서 174시간/209시간 기준을 확인한 뒤 /calculator에서 실제 금액을 계산하세요.',
    },
    {
      category: '계산기 선택',
      question: '급여 인상분이나 소급 정산액은 어떻게 확인하나요?',
      answer: '먼저 인상 적용 시작일, 정산 기간, 기존 급여, 변경 급여, 근무시간, 과세·비과세 수당, 4대보험 적용 여부를 분리하세요. 인상 전후 실수령액 비교는 시뮬레이션으로 기준선을 잡고, 특정 월의 예상 지급액과 공제액은 급여 계산기에서 다시 확인하는 흐름이 안전합니다. 소급분은 단순 차액만 보지 말고 소득세, 지방소득세, 4대보험, 비과세 수당, 정산월 차이가 실제 실수령액을 바꿀 수 있다고 봐야 합니다.',
    },
    {
      category: '계산기 선택',
      question: '월 중간에 입사하거나 퇴사한 경우 급여는 어떻게 계산하나요?',
      answer: '중도 입사·퇴사 월에는 먼저 정산 기간, 입사일 또는 퇴사일, 월급제·시급제 여부, 실제 근무일과 근무시간, 주휴수당 대상 여부를 분리하세요. 월급제는 회사의 일할 계산 기준에 따라 차이가 날 수 있고, 시급제는 실제 근무시간과 주휴·가산수당 조건이 중요합니다. PayTools에서는 개인정보 없이 계산 조건만 입력해 예상 실수령액을 확인하고, 실제 지급 기준은 근로계약서와 회사 규정 또는 전문가 검토로 확인하는 것이 안전합니다.',
    },
    // 기본급 및 수당
    {
      category: '기본급 및 수당',
      question: '기본급과 통상임금의 차이는 무엇인가요?',
      answer: '기본급은 근로계약서에 명시된 기본 임금입니다. 통상임금은 기본급에 고정 수당(직책수당, 자격수당 등)을 더한 금액으로, 연장·야간·휴일 수당 계산의 기준이 됩니다. 예를 들어 기본급이 250만원이고 고정 직책수당이 20만원이면, 통상임금은 270만원입니다.',
    },
    {
      category: '기본급 및 수당',
      question: '통상시급은 어떻게 계산하나요?',
      answer: '통상시급은 사업장에서 선택한 월 기준시간에 따라 계산합니다. PayTools의 174시간 모드는 주휴수당을 별도로 계산할 때 사용하며, 209시간 모드는 주휴수당이 기본급에 포함된 월급제·최저임금 월 환산 기준에 맞습니다. 예를 들어 통상임금이 270만원이면 174시간 기준 통상시급은 15,517원, 209시간 기준은 12,919원입니다.',
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
      answer: '연장근로는 법정근로시간인 1일 8시간 또는 1주 40시간을 초과한 근무를 기준으로 봅니다. 5인 이상 사업장의 법정 가산수당 기준에서는 연장근로 수당을 통상시급의 1.5배로 계산합니다.',
    },
    {
      category: '연장·야간·휴일 근로',
      question: '야간근로 시간은 언제부터 언제까지인가요?',
      answer: '야간근로는 22:00부터 익일 06:00까지입니다. 5인 이상 사업장의 법정 가산수당 기준에서는 이 시간대 근무에 통상시급의 0.5배(50%)를 가산해, 야간 시간대 임금을 통상시급의 1.5배(기본 1.0 + 가산 0.5)로 봅니다.',
    },
    {
      category: '연장·야간·휴일 근로',
      question: '휴일근로 수당은 얼마나 받나요?',
      answer: '5인 이상 사업장의 법정 가산수당 기준에서는 휴일근로 8시간 이하가 통상시급의 1.5배, 8시간 초과분이 2.0배입니다. 5인 미만 사업장은 법정 가산수당 적용 방식이 다를 수 있으므로 계약상 약정 수당, 실제 근무기록, 전문가 검토를 함께 확인하세요.',
    },
    {
      category: '연장·야간·휴일 근로',
      question: '5인 미만 사업장도 연장·야간·휴일 가산수당을 계산해야 하나요?',
      answer: '주휴수당과 최저임금은 5인 미만 사업장에도 적용되지만, 근로기준법상 연장·야간·휴일 가산수당 적용 방식은 5인 이상 사업장과 다를 수 있습니다. PayTools에서는 사업장 규모를 분리해 입력하고, 실제 지급·분쟁 판단은 근무기록, 계약서, 회사 수당 체계와 전문가 검토를 함께 확인하는 것이 안전합니다.',
    },
    {
      category: '연장·야간·휴일 근로',
      question: '연장과 야간이 중복되면 어떻게 되나요?',
      answer: '5인 이상 사업장의 법정 가산수당 기준에서는 연장근로와 야간근로가 중복될 때 두 가산율을 합산해 통상시급의 2.0배(기본 1.0 + 연장 0.5 + 야간 0.5)로 계산합니다. 예를 들어 주 40시간을 넘긴 23시~24시 근무라면 이 기준을 확인합니다.',
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
      answer: '2026년 최저임금은 시급 10,320원입니다. 주 40시간 근무자의 최저임금 고시 월 환산액은 주휴시간을 포함한 209시간 기준 2,156,880원입니다. PayTools에서 174시간 모드를 선택하면 기본 근로시간 임금과 주휴수당을 분리해 보여줍니다.',
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
      answer: '수습 기간에도 원칙적으로 최저임금 이상을 받아야 합니다. 다만 1년 이상 근로계약을 체결했고 수습 시작일부터 3개월 이내이며 단순노무업무가 아니라면 최저임금의 90%까지 적용될 수 있습니다. 1년 미만 계약, 3개월 초과 수습, 단순노무업무는 감액 대상에서 제외되므로 실제 판단은 계약서와 직무를 함께 확인하세요.',
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

  const getItemId = (index: number) => `faq-answer-${selectedCategory.replace(/\s+/g, '-')}-${index}`;

  // FAQPage 구조화된 데이터 (schema.org)
  const faqStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "2026년 급여 계산 FAQ",
      "url": "https://paytools.work/faq",
      "inLanguage": "ko-KR",
      "dateModified": dateModified,
      "description": "2026년 급여 계산, 4대보험, 실수령액, 주휴수당, 최저임금, 급여명세서 차이, 연장·야간·휴일수당, 근로자 권리 질문을 정리한 PayTools FAQ입니다.",
      "isPartOf": {
        "@type": "WebSite",
        "name": "PayTools",
        "url": "https://paytools.work"
      },
      "significantLink": [
        "https://paytools.work/calculator",
        "https://paytools.work/reverse-calculator",
        "https://paytools.work/guide",
        "https://paytools.work/examples",
        "https://paytools.work/legal",
        "https://paytools.work/contact"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "PayTools FAQ 핵심 주제",
      "inLanguage": "ko-KR",
      "dateModified": dateModified,
      "numberOfItems": categorySummaries.length,
      "itemListElement": categorySummaries.map((summary, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": summary.title,
        "description": summary.description
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "PayTools 질문별 추천 경로",
      "inLanguage": "ko-KR",
      "dateModified": dateModified,
      "numberOfItems": answerRouteCards.length,
      "itemListElement": answerRouteCards.map((route, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": route.title,
        "description": route.description,
        "url": `https://paytools.work${route.to}`
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "inLanguage": "ko-KR",
      "dateModified": dateModified,
      "mainEntity": faqData.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "홈",
          "item": "https://paytools.work"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "FAQ",
          "item": "https://paytools.work/faq"
        }
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>2026년 급여 계산 FAQ | 4대보험·실수령액·주휴수당 질문 모음 | PayTools</title>
        <meta name="description" content="2026년 급여 계산, 4대보험, 실수령액, 주휴수당, 최저임금, 급여명세서 차이, 연장·야간·휴일수당, 근로자 권리에 대한 자주 묻는 질문을 한 번에 확인하세요." />
        <link rel="canonical" href="https://paytools.work/faq" />
        <meta property="og:title" content="2026년 급여 계산 FAQ | 4대보험·실수령액·주휴수당 | PayTools" />
        <meta property="og:description" content="2026년 급여 계산과 4대보험, 주휴수당, 최저임금, 급여명세서 차이, 근로자 권리까지 자주 묻는 질문을 정리한 FAQ 페이지입니다." />
        <meta property="og:url" content="https://paytools.work/faq" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="2026년 급여 계산 FAQ | PayTools" />
        <meta name="twitter:description" content="실수령액, 4대보험, 주휴수당, 최저임금, 급여명세서 차이 관련 질문을 한 번에 확인하세요." />
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
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

          <section className="mb-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-5" aria-labelledby="faq-summary-title">
            <h2 id="faq-summary-title" className="text-xl font-bold text-gray-900 mb-3">
              급여 계산 FAQ 한눈에 보기
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              PayTools FAQ는 2026년 기준 실수령액, 4대보험, 소득세, 주휴수당, 최저임금, 급여명세서 차이, 연장·야간·휴일수당, 개인정보 최소 입력 원칙과 계산 결과의 참고용 한계를 빠르게 확인하도록 정리했습니다.
            </p>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {categorySummaries.map((summary) => (
                <div key={summary.title} className="rounded-xl bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-bold text-blue-700 mb-2">{summary.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{summary.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm" aria-labelledby="faq-routing-title">
            <h2 id="faq-routing-title" className="text-xl font-bold text-gray-900 mb-3">
              질문별로 먼저 볼 페이지
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              단일 금액 답변보다 입력값과 목적에 맞는 계산 흐름을 먼저 고르면 실수령액 오차와 법률 판단 오해를 줄일 수 있습니다.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {answerRouteCards.map((route) => (
                <Link
                  key={route.to}
                  to={route.to}
                  className="rounded-xl border border-gray-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  <h3 className="text-sm font-bold text-gray-900 mb-2">{route.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600 mb-3">{route.description}</p>
                  <span className="text-sm font-semibold text-blue-600">{route.label} 보기</span>
                </Link>
              ))}
            </div>
          </section>

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
          {filteredFAQ.map((item, index) => {
            const answerId = getItemId(index);
            const isExpanded = expandedIndex === index;

            return (
              <Card key={index}>
                <button
                  onClick={() => handleToggle(index, item.question)}
                  className="w-full text-left"
                  aria-expanded={isExpanded}
                  aria-controls={answerId}
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
                        isExpanded ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div
                  id={answerId}
                  className={`mt-4 pt-4 border-t border-gray-200 ${isExpanded ? 'block' : 'hidden'}`}
                >
                  <p className="text-gray-700 leading-relaxed">
                    A. {item.answer}
                  </p>
                </div>
              </Card>
            );
          })}
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
