/**
 * 서비스 사용 가이드 페이지 (/guide/how-to-use)
 * 의사결정 도우미 + 급여유형 가이드 + 필드 비교 + 시나리오 + FAQ
 */

import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../../components/layout/MainLayout';
import PageHelmet from '../../components/common/PageHelmet';
import WageTypeDecisionHelper from './WageTypeDecisionHelper';
import WageTypeGuideCards from './WageTypeGuideCards';
import WageTypeFieldMap from './WageTypeFieldMap';
import QuickStartScenarios from './QuickStartScenarios';
import GuideFAQ from './GuideFAQ';

const HOW_TO_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'PayTools 급여 계산기 사용법',
  description: '월급제, 시급제, 시급기반 월급제 중 내 상황에 맞는 급여유형을 선택하고 실수령액을 계산하는 절차입니다.',
  totalTime: 'PT3M',
  supply: [
    { '@type': 'HowToSupply', name: '기본급 또는 시급' },
    { '@type': 'HowToSupply', name: '근무일·근무시간 또는 시프트 정보' },
    { '@type': 'HowToSupply', name: '부양가족 수와 4대보험 적용 여부' },
  ],
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: '급여유형 선택',
      text: '매달 같은 기본급이면 월급제, 시급 계약이면 시급제, 시급 계약이지만 월 보장액이 있으면 시급기반 월급제를 선택합니다.',
      url: 'https://paytools.work/guide/how-to-use#decision-helper',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: '근무시간 입력',
      text: '월급제는 월 기준시간을 확인하고, 시급제는 시프트 또는 월간 템플릿으로 실제 근무시간을 입력합니다.',
      url: 'https://paytools.work/guide/how-to-use#wage-type-guides',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: '수당과 공제 조건 확인',
      text: '과세·비과세 수당, 통상임금 포함 여부, 4대보험과 부양가족 조건을 확인합니다.',
      url: 'https://paytools.work/guide/how-to-use#field-map',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: '계산 결과 검토',
      text: '지급 총액, 4대보험, 소득세, 지방소득세, 실수령액을 확인하고 필요한 경우 수당을 수정한 뒤 재계산합니다.',
      url: 'https://paytools.work/calculator',
    },
  ],
};

export default function HowToUseGuide() {
  return (
    <>
      <PageHelmet
        title="서비스 사용법 - PayTools 급여 계산기"
        description="PayTools 급여 계산기를 급여유형별로 어떻게 사용하는지 안내합니다. 월급제, 시급제, 시급기반 월급제 사용법."
        path="/guide/how-to-use"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(HOW_TO_SCHEMA)}</script>
      </Helmet>
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6">
            <Link to="/guide" className="hover:text-blue-600">가이드</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">서비스 사용법</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PayTools 사용 가이드</h1>
            <p className="text-gray-600">급여유형에 맞는 사용법을 확인하고 정확한 실수령액을 계산하세요.</p>
          </div>

          {/* 1. Decision Helper */}
          <section id="decision-helper" className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">어떤 급여유형을 선택해야 하나요?</h2>
            <WageTypeDecisionHelper />
          </section>

          {/* 2. Wage Type Guides */}
          <section id="wage-type-guides" className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">급여유형별 사용법</h2>
            <WageTypeGuideCards />
          </section>

          {/* 3. Field Comparison */}
          <section id="field-map" className="mb-10">
            <WageTypeFieldMap />
          </section>

          {/* 4. Quick Start Scenarios */}
          <section className="mb-10">
            <QuickStartScenarios />
          </section>

          {/* 5. FAQ */}
          <section className="mb-10">
            <GuideFAQ />
          </section>

          {/* Common Tips */}
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
            <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">tips_and_updates</span>
              공통 안내사항
            </h3>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">-</span>
                <span>각 입력 필드의 <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-200 rounded-full">?</span> 아이콘을 클릭하면 상세 설명을 볼 수 있습니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">-</span>
                <span>174시간 모드는 주휴수당을 별도 계산, 209시간 모드는 기본급에 포함된 것으로 처리합니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">-</span>
                <span>계산 결과에서 수당을 추가하거나 수정한 후 재계산할 수 있습니다.</span>
              </li>
            </ul>
          </section>

          {/* CTA */}
          <div className="text-center">
            <Link
              to="/calculator"
              className="inline-flex items-center gap-2 h-12 px-8 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-colors"
            >
              급여 계산 시작하기
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
