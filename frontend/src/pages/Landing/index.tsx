/**
 * Landing Page - Stitch 디자인 기반 마케팅 랜딩페이지
 */

import { Helmet } from 'react-helmet-async';
import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import FeaturesSection from './FeaturesSection';
import PricingSection from './PricingSection';
import FinalCTASection from './FinalCTASection';

export default function LandingPage() {
  return (
    <>
      <Helmet>
        <title>PayTools - 급여 계산 30분 → 3분으로 | 급여계산기</title>
        <meta
          name="description"
          content="4대보험, 소득세, 연장·야간·휴일 수당 자동 계산. 2026년 최신 법령 반영. 직원 5명까지 무료로 시작하세요."
        />
        <meta property="og:title" content="PayTools - 급여 계산 30분 → 3분으로" />
        <meta
          property="og:description"
          content="4대보험, 소득세, 가산수당 자동 계산. 2026년 최신 법령 반영, 181개 테스트 검증."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://paytools.work" />
      </Helmet>

      <div className="overflow-hidden">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <PricingSection />
        <FinalCTASection />
      </div>
    </>
  );
}
