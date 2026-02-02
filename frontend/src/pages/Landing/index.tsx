/**
 * Landing Page - Stitch 디자인 기반 마케팅 랜딩페이지
 */

import { Helmet } from 'react-helmet-async';
import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import FeaturesSection from './FeaturesSection';
import PricingSection from './PricingSection';
import FAQSection from './FAQSection';
import FinalCTASection from './FinalCTASection';

export default function LandingPage() {
  return (
    <>
      <Helmet>
        <title>급여계산기 - 4대보험 주휴수당 자동계산 | PayTools</title>
        <meta
          name="description"
          content="4대보험, 소득세, 주휴수당, 연장·야간·휴일 수당 자동 계산. 2026년 최신 법령 반영. 186개 테스트로 검증된 정확성. 직원 3명까지 무료."
        />
        <meta name="keywords" content="급여계산기,4대보험계산기,주휴수당계산,연장근로수당,실수령액계산,급여명세서" />
        <link rel="canonical" href="https://paytools.work" />
        <meta property="og:title" content="급여계산기 - 4대보험 주휴수당 자동계산 | PayTools" />
        <meta
          property="og:description"
          content="4대보험, 소득세, 주휴수당 자동 계산. 2026년 최신 법령 반영. 노무사 비용의 1/7."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://paytools.work" />
        <meta property="og:site_name" content="PayTools" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="급여계산기 - 4대보험 주휴수당 자동계산" />
        <meta name="twitter:description" content="급여 계산 30분 → 3분. 2026년 최신 법령 자동 반영." />
      </Helmet>

      <div className="overflow-hidden">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <PricingSection />
        <FAQSection />
        <FinalCTASection />
      </div>
    </>
  );
}
