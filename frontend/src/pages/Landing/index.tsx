/**
 * Landing Page - 심리효과 기반 전환 최적화 (18개 심리효과 적용)
 *
 * 섹션 흐름:
 * 1. 히어로 — 호기심의 틈 + 손실 회피 + 프레이밍
 * 2. 신뢰 지표 바 — 권위 편향 + 밴드웨건
 * 3. 문제 제기 — 공감 간격 + 부정 편향
 * 4. 해결책 — 피드포워드 + 시각적 계층
 * 5. 계산 미리보기 — 아하 모먼트 + 호기심의 틈
 * 6. 사회적 증거 — 밴드웨건 + 후광 효과
 * 7. 데이터 누적 가치 — 쓸수록 쌓이는 자산 인식
 * 8. 요금제 — 미끼 효과 + 중앙 무대 + 앵커링
 * 9. 전환 CTA — 보답 기대 + 손실 회피 + 결핍
 * 10. FAQ — 반발감 해소 + 탈출 경로
 * 11. 최종 CTA — 피크엔드 규칙
 */

import { Helmet } from 'react-helmet-async';
import HeroSection from './HeroSection';
import TrustBarSection from './TrustBarSection';
import PainPointsSection from './PainPointsSection';
import SolutionSection from './SolutionSection';
import HowItWorksSection from './HowItWorksSection';
import DecisionRouteSection from './DecisionRouteSection';
import LiveDemoSection from './LiveDemoSection';
import SocialProofSection from './SocialProofSection';
import DataValueSection from './DataValueSection';
import PricingSection from './PricingSection';
import ConversionCTASection from './ConversionCTASection';
import FAQSection from './FAQSection';
import FinalCTASection from './FinalCTASection';

const payrollCalculationHowTo = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'PayTools로 2026년 급여 실수령액 계산하는 방법',
  description:
    '급여유형을 선택하고 근무시간, 수당, 4대보험 조건을 입력해 월급·알바 실수령액을 확인하는 3분 계산 흐름입니다.',
  totalTime: 'PT3M',
  inLanguage: 'ko-KR',
  tool: [
    {
      '@type': 'HowToTool',
      name: 'PayTools 급여 계산기',
    },
  ],
  supply: [
    { '@type': 'HowToSupply', name: '기본급 또는 시급' },
    { '@type': 'HowToSupply', name: '근무일·근무시간 또는 시프트 정보' },
    { '@type': 'HowToSupply', name: '4대보험 적용 여부와 부양가족 수' },
  ],
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: '급여유형 선택',
      text: '월급제, 시급제, 시급기반 월급제 중 실제 계약 방식에 맞는 급여유형을 선택합니다.',
      url: 'https://paytools.work/calculator',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: '근무시간과 수당 입력',
      text: '기본급 또는 시급, 소정근로일, 일 근무시간, 연장·야간·휴일근로와 과세·비과세 수당을 입력합니다.',
      url: 'https://paytools.work/calculator',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: '공제 조건 확인',
      text: '국민연금, 건강보험, 장기요양보험, 고용보험, 소득세 계산에 필요한 적용 조건과 부양가족 수를 확인합니다.',
      url: 'https://paytools.work/guide/insurance',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: '실수령액과 급여명세서 검토',
      text: '지급 총액, 공제 총액, 실수령액을 확인하고 필요한 경우 급여명세서 PDF 또는 급여대장 저장 흐름으로 이어갑니다.',
      url: 'https://paytools.work/calculator',
    },
  ],
};

const landingStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'PayTools 2026 급여 계산기 랜딩 페이지',
    url: 'https://paytools.work',
    inLanguage: 'ko-KR',
    description:
      '2026년 최저임금, 4대보험, 소득세, 주휴수당, 연장·야간·휴일수당을 함께 확인하려는 사업장과 근로자를 위한 PayTools 대표 페이지입니다.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'PayTools',
      url: 'https://paytools.work',
    },
    about: [
      '2026년 급여 계산',
      '월급 실수령액 계산',
      '알바 시급과 주휴수당',
      '4대보험 공제액',
      '연장·야간·휴일수당',
    ],
    primaryEntity: {
      '@type': 'SoftwareApplication',
      name: 'PayTools 급여 계산기',
      url: 'https://paytools.work/calculator',
      applicationCategory: 'FinanceApplication',
    },
    potentialAction: {
      '@type': 'UseAction',
      name: '무료 급여 계산기 사용',
      target: 'https://paytools.work/calculator',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PayTools',
    url: 'https://paytools.work',
    inLanguage: 'ko-KR',
    description:
      '2026년 한국 급여 계산, 4대보험, 소득세, 주휴수당, 연장·야간·휴일수당을 계산하는 웹 기반 급여 계산 서비스입니다.',
    potentialAction: {
      '@type': 'UseAction',
      target: 'https://paytools.work/calculator',
      name: '무료 급여 계산기 사용',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PayTools 급여 계산기',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://paytools.work/calculator',
    inLanguage: 'ko-KR',
    description:
      '월급, 알바 시급, 4대보험, 소득세, 주휴수당과 연장·야간·휴일수당을 2026년 기준으로 계산하는 무료 급여 계산기입니다.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
      description: '직원 5명까지 무료로 급여 계산과 기본 관리 기능을 사용할 수 있습니다.',
    },
    featureList: [
      '2026년 최저임금 기준 급여 계산',
      '4대보험 및 소득세 자동 계산',
      '주휴수당 계산',
      '연장·야간·휴일수당 계산',
      '실수령액 역산 계산',
      '급여명세서 및 급여대장 관리',
    ],
    audience: {
      '@type': 'Audience',
      audienceType: '소규모 사업장, HR 담당자, 노무사, 근로자',
    },
  },
  payrollCalculationHowTo,
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'PayTools 상황별 급여 계산 경로',
    description: '급여 실수령액 계산, 목표 실수령액 역산, 급여 기준 학습 중 사용자 상황에 맞는 공개 페이지를 안내합니다.',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '월급·알바 실수령액 계산',
        url: 'https://paytools.work/calculator',
        description: '기본급, 시급, 수당, 근무시간을 입력해 4대보험·소득세·주휴수당이 반영된 예상 실수령액을 계산합니다.',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '목표 실수령액 역산',
        url: 'https://paytools.work/reverse-calculator',
        description: '원하는 월 실수령액을 기준으로 필요한 세전 월급과 공제액을 역산합니다.',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: '급여 계산 기준 가이드',
        url: 'https://paytools.work/guide',
        description: '급여유형별 입력법, 4대보험, 소득세, 연장·야간·휴일수당 기준을 확인합니다.',
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'PayTools는 어떤 급여 계산에 적합한가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '월급제, 시급제, 시급기반 월급제 근로자의 예상 실수령액, 4대보험, 소득세, 주휴수당, 연장·야간·휴일수당을 함께 확인할 때 적합합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '2026년 최저임금 기준을 반영하나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '네. PayTools는 2026년 최저시급 10,320원과 월 환산액 2,156,880원 정보를 기준 콘텐츠에 반영하고, 급여 계산 흐름에서 최신 4대보험 기준을 함께 안내합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '계산 결과는 법적 판단으로 사용할 수 있나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '아니요. 계산 결과는 참고용 추정치이며, 실제 지급, 분쟁, 예외 공제, 회사별 정책은 노무사 또는 세무 전문가 검토가 필요합니다.',
        },
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: 'https://paytools.work',
      },
    ],
  },
];

export default function LandingPage() {
  return (
    <>
      <Helmet>
        <title>2026 급여 계산기 | 월급·알바 실수령액, 4대보험·주휴수당 | PayTools</title>
        <meta
          name="description"
          content="2026년 최저임금 10,320원 기준 월급, 알바 시급, 연장·야간·휴일수당, 4대보험, 소득세, 주휴수당까지 한 번에 계산하세요. 월 환산액과 실수령액 확인 후 급여명세서와 급여대장 관리까지 이어집니다. 직원 5명까지 무료."
        />
        <meta name="keywords" content="2026년최저임금,최저시급10320원,급여계산기,알바급여계산기,월급실수령액,4대보험계산기,주휴수당계산,연장근로수당,실수령액계산,급여명세서,급여대장" />
        <link rel="canonical" href="https://paytools.work" />
        <meta property="og:title" content="2026 급여 계산기 - 월급·알바 실수령액, 4대보험·주휴수당 | PayTools" />
        <meta property="og:description" content="월급, 알바 시급, 4대보험, 소득세, 주휴수당, 연장·야간·휴일수당까지 자동 계산하고 급여 관리까지 이어지는 무료 도구입니다." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://paytools.work" />
        <meta property="og:site_name" content="PayTools" />
        <meta property="og:image" content="https://paytools.work/og-image.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="2026 급여 계산기 - 월급·알바 실수령액 | PayTools" />
        <meta name="twitter:description" content="2026년 월급, 알바 시급, 4대보험, 소득세, 주휴수당을 한 번에 계산하세요. 직원 5명까지 무료." />
        <meta name="twitter:image" content="https://paytools.work/og-image.svg" />
        <script type="application/ld+json">
          {JSON.stringify(landingStructuredData)}
        </script>
      </Helmet>

      <div className="overflow-hidden">
        <HeroSection />
        <TrustBarSection />
        <PainPointsSection />
        <SolutionSection />
        <HowItWorksSection />
        <DecisionRouteSection />
        <LiveDemoSection />
        <SocialProofSection />
        <DataValueSection />
        <PricingSection />
        <ConversionCTASection />
        <FAQSection />
        <FinalCTASection />
      </div>
    </>
  );
}
