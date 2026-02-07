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
 * 7. 요금제 — 미끼 효과 + 중앙 무대 + 앵커링
 * 8. 전환 CTA — 보답 기대 + 손실 회피 + 결핍
 * 9. FAQ — 반발감 해소 + 탈출 경로
 * 10. 최종 CTA — 피크엔드 규칙
 */

import { Helmet } from 'react-helmet-async';
import HeroSection from './HeroSection';
import TrustBarSection from './TrustBarSection';
import PainPointsSection from './PainPointsSection';
import SolutionSection from './SolutionSection';
import LiveDemoSection from './LiveDemoSection';
import SocialProofSection from './SocialProofSection';
import PricingSection from './PricingSection';
import ConversionCTASection from './ConversionCTASection';
import FAQSection from './FAQSection';
import FinalCTASection from './FinalCTASection';

export default function LandingPage() {
  return (
    <>
      <Helmet>
        <title>급여계산기 - 4대보험 주휴수당 자동계산 | PayTools</title>
        <meta
          name="description"
          content="4대보험, 소득세, 주휴수당, 연장·야간·휴일 수당 자동 계산. 2026년 최신 법령 반영. 8개 법률 기반 정확한 계산. 직원 5명까지 무료."
        />
        <meta name="keywords" content="급여계산기,4대보험계산기,주휴수당계산,연장근로수당,실수령액계산,급여명세서" />
        <link rel="canonical" href="https://paytools.work" />
        <meta property="og:title" content="급여계산기 - 4대보험 주휴수당 자동계산 | PayTools" />
        <meta property="og:description" content="4대보험, 소득세, 주휴수당 자동 계산. 2026년 최신 법령 반영." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://paytools.work" />
        <meta property="og:site_name" content="PayTools" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="급여계산기 - 4대보험 주휴수당 자동계산" />
        <meta name="twitter:description" content="4대보험, 소득세, 주휴수당 자동 계산. 2026년 최신 법령 자동 반영." />
      </Helmet>

      <div className="overflow-hidden">
        <HeroSection />
        <TrustBarSection />
        <PainPointsSection />
        <SolutionSection />
        <LiveDemoSection />
        <SocialProofSection />
        <PricingSection />
        <ConversionCTASection />
        <FAQSection />
        <FinalCTASection />
      </div>
    </>
  );
}
