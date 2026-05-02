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
import LiveDemoSection from './LiveDemoSection';
import SocialProofSection from './SocialProofSection';
import DataValueSection from './DataValueSection';
import PricingSection from './PricingSection';
import ConversionCTASection from './ConversionCTASection';
import FAQSection from './FAQSection';
import FinalCTASection from './FinalCTASection';

const landingStructuredData = [
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
