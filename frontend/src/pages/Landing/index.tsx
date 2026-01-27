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
        <title>paytools - 영세 사업장을 위한 스마트 급여 관리</title>
        <meta
          name="description"
          content="4대보험, 소득세, 연장·야간·휴일 수당 자동 계산. AI 노무 상담까지. 직원 5명까지 무료로 시작하세요."
        />
        <meta property="og:title" content="paytools - 스마트 급여 관리 솔루션" />
        <meta
          property="og:description"
          content="급여 계산 30분을 3분으로. 2026년 최신 법령 반영, 181개 테스트 검증."
        />
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
