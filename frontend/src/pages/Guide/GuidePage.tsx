/**
 * 가이드 메인 페이지
 * - 서비스 사용 가이드 (상단 강조)
 * - 급여 계산 참고 가이드 (법률 교육)
 */

import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import PageHelmet from '../../components/common/PageHelmet';
import { InsuranceIcon, TaxIcon, OvertimeIcon, GuideIcon } from '../../components/illustrations';

const lawGuides = [
  {
    title: '4대 보험 이해하기',
    path: '/guide/insurance',
    description: '국민연금, 건강보험, 장기요양보험, 고용보험의 개념과 계산 방법을 설명합니다.',
    icon: <InsuranceIcon size="sm" />,
  },
  {
    title: '소득세 계산법',
    path: '/guide/tax',
    description: '간이세액표를 활용한 소득세 계산 방법과 부양가족 공제에 대해 알아봅니다.',
    icon: <TaxIcon size="sm" />,
  },
  {
    title: '연장·야간·휴일 수당',
    path: '/guide/overtime',
    description: '근로기준법에 따른 가산수당 계산 방법과 통상시급의 개념을 이해합니다.',
    icon: <OvertimeIcon size="sm" />,
  },
  {
    title: '퇴직금 계산 가이드',
    path: '/guide/severance',
    description: '2026년 기준 퇴직금 계산법, 평균임금 산정 방법, 구체적인 계산 예시를 확인하세요.',
    icon: <span className="material-symbols-outlined text-[40px] text-amber-600">savings</span>,
  },
  {
    title: '연차수당 완벽 가이드',
    path: '/guide/annual-leave',
    description: '연차 발생 기준, 연차수당 계산법, 미사용 연차 처리 방법을 상세히 안내합니다.',
    icon: <span className="material-symbols-outlined text-[40px] text-green-600">event_available</span>,
  },
  {
    title: '주휴수당 완벽 가이드',
    path: '/guide/weekly-holiday',
    description: '주휴수당 개념, 발생 조건, 파트타임 계산법을 2026년 기준으로 정리했습니다.',
    icon: <span className="material-symbols-outlined text-[40px] text-purple-600">weekend</span>,
  },
];

const wageTypes = [
  { label: '월급제', desc: '매달 같은 금액', icon: 'account_balance', color: 'bg-blue-50 border-blue-200' },
  { label: '시급제', desc: '시급 × 근무시간', icon: 'schedule', color: 'bg-green-50 border-green-200' },
  { label: '시급기반 월급제', desc: '시급 + 월급 보장', icon: 'verified', color: 'bg-purple-50 border-purple-200' },
];

const preCalculationChecks = [
  {
    label: '급여유형과 기준시간',
    detail: '월급제, 시급제, 시급기반 월급제와 174시간/209시간 기준을 먼저 맞춥니다.',
    path: '/guide/how-to-use',
  },
  {
    label: '사업장 규모와 근무시간',
    detail: '5인 이상 여부, 주 소정근로시간, 야간·휴일·연장근로 시간을 분리합니다.',
    path: '/guide/overtime',
  },
  {
    label: '공제와 참고용 한계',
    detail: '4대보험, 소득세, 비과세 수당, 회사별 공제는 실제 실수령액을 바꿀 수 있습니다.',
    path: '/guide/insurance',
  },
];

const scenarioRoutes = [
  {
    label: '급여유형을 모르겠어요',
    detail: '월급제, 시급제, 시급기반 월급제와 174시간/209시간 기준을 먼저 고릅니다.',
    path: '/guide/how-to-use',
  },
  {
    label: '알바·시프트 급여가 궁금해요',
    detail: '주휴수당 대상 여부와 야간·휴일·연장근로 시간을 분리한 뒤 계산기로 이어갑니다.',
    path: '/guide/weekly-holiday',
  },
  {
    label: '목표 실수령액에서 세전 급여를 찾고 싶어요',
    detail: '연봉 협상이나 이직 제안 검토처럼 세후 목표 금액만 있을 때는 역산 계산기로 기준선을 잡습니다.',
    path: '/reverse-calculator',
  },
  {
    label: '명세서와 계산 결과가 달라요',
    detail: '비과세 수당, 상여, 회사별 공제, 정산 기간처럼 차이를 만드는 항목을 FAQ에서 점검합니다.',
    path: '/faq',
  },
  {
    label: '급여일 전 최종 검산이 필요해요',
    detail: '정산월 예상액을 먼저 계산한 뒤 입퇴사일, 근태, 휴게시간, 수당, 4대보험 취득·상실 시점을 같은 순서로 맞춥니다.',
    path: '/faq',
  },
  {
    label: '여러 급여안을 비교하고 싶어요',
    detail: '인상 전후, 수당 배분, 고용형태 변화는 시뮬레이션에서 같은 기준으로 비교합니다.',
    path: '/simulation',
  },
  {
    label: '상여·성과급 지급월 실수령액을 확인해요',
    detail: '비정기 지급액, 비과세 한도, 원천징수 변동을 분리하고 소득세 가이드와 계산기를 함께 확인합니다.',
    path: '/guide/tax',
  },
  {
    label: '퇴사월·연차수당을 확인해요',
    detail: '마지막 급여, 미사용 연차수당, 퇴직금, 4대보험 상실 시점을 항목별로 나눕니다.',
    path: '/guide/annual-leave',
  },
  {
    label: '분쟁·체불 판단이 필요해요',
    detail: '계산값만으로 단정하지 않고 법률 전제와 공식 문의 경로를 함께 확인합니다.',
    path: '/legal',
  },
];

const dateModified = '2026-08-23';

const guideStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'PayTools 급여 계산 가이드',
    url: 'https://paytools.work/guide',
    inLanguage: 'ko-KR',
    dateModified,
    description:
      'PayTools 사용법, 계산 전 확인 체크리스트, 급여유형 선택, 4대보험, 소득세, 연장·야간·휴일수당, 퇴직금, 연차수당, 주휴수당 계산 가이드를 모은 허브 페이지입니다.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'PayTools',
      url: 'https://paytools.work',
    },
    mainEntity: {
      '@type': 'ItemList',
      name: '급여 계산 가이드 목록',
      numberOfItems: lawGuides.length + scenarioRoutes.length + 2,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '급여유형별 PayTools 사용법',
          url: 'https://paytools.work/guide/how-to-use',
          description: '월급제, 시급제, 시급기반 월급제 중 어떤 입력 흐름을 선택해야 하는지 안내합니다.',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '계산 전 확인 체크리스트',
          url: 'https://paytools.work/guide',
          description: '급여유형, 기준시간, 사업장 규모, 근무시간, 공제 조건을 계산 전에 확인합니다.',
        },
        ...lawGuides.map((guide, index) => ({
          '@type': 'ListItem',
          position: index + 3,
          name: guide.title,
          url: `https://paytools.work${guide.path}`,
          description: guide.description,
        })),
        ...scenarioRoutes.map((route, index) => ({
          '@type': 'ListItem',
          position: lawGuides.length + index + 3,
          name: route.label,
          url: `https://paytools.work${route.path}`,
          description: route.detail,
        })),
      ],
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    dateModified,
    mainEntity: [
      {
        '@type': 'Question',
        name: '급여 계산 전에 무엇을 먼저 확인해야 하나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '급여유형, 174시간/209시간 기준, 사업장 규모, 근무시간, 과세·비과세 수당, 4대보험 적용 여부를 먼저 맞춘 뒤 계산기로 이동하는 것이 좋습니다.',
        },
      },
      {
        '@type': 'Question',
        name: '처음 급여를 계산할 때 어떤 가이드부터 보면 되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '먼저 급여유형별 사용법에서 월급제, 시급제, 시급기반 월급제 중 내 계약에 맞는 입력 방식을 고른 뒤 급여 계산기로 이동하는 것을 권장합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '4대보험과 소득세는 따로 봐야 하나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '월급 실수령액은 4대보험과 소득세·지방소득세를 함께 반영해야 하므로, 개념은 각각의 가이드에서 확인하고 실제 금액은 급여 계산기에서 함께 계산하는 것이 좋습니다.',
        },
      },
      {
        '@type': 'Question',
        name: '상여나 성과급이 있는 달은 어디에서 확인하나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '상여·성과급 지급월은 과세 대상 금액, 비과세 한도, 원천징수 세액 변동을 분리해 소득세 가이드에서 기준을 확인하고, 실제 예상 실수령액은 급여 계산기에서 다시 계산하는 흐름이 안전합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '급여 지급일 직전에는 무엇을 확인해야 하나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '먼저 급여 계산기에서 정산월 예상 지급액과 공제액을 확인한 뒤 입퇴사일, 실제 근무일, 휴게시간, 주휴·가산수당, 상여·비과세 수당, 4대보험 취득·상실 시점, 부양가족 수가 입력값과 같은지 순서대로 맞추는 것이 좋습니다.',
        },
      },
      {
        '@type': 'Question',
        name: '가이드 내용만으로 최종 급여 지급 판단을 해도 되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '아니요. PayTools 가이드는 참고용 정보입니다. 실제 지급, 분쟁, 예외 공제, 회사별 정책은 노무사 또는 세무 전문가와 검토하는 것이 안전합니다.',
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
      {
        '@type': 'ListItem',
        position: 2,
        name: '가이드',
        item: 'https://paytools.work/guide',
      },
    ],
  },
];

const GuidePage = () => (
  <>
    <PageHelmet
      title="급여 계산 가이드 - 사용법, 4대보험, 소득세, 수당"
      description="급여유형 선택, 계산 전 체크리스트, 실수령액 역산, 2026년 4대보험·소득세·주휴수당·가산수당 기준과 상황별 추천 경로를 한곳에서 확인하세요."
      path="/guide"
    />
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(guideStructuredData)}</script>
    </Helmet>
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <GuideIcon size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">가이드</h1>
            <p className="text-gray-600">서비스 사용법과 급여 계산 참고 자료를 확인하세요.</p>
          </div>
        </div>

        {/* 서비스 사용 가이드 - 강조 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">rocket_launch</span>
            서비스 사용 가이드
          </h2>
          <Link to="/guide/how-to-use">
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border-2 border-primary/20 rounded-2xl p-6 hover:shadow-lg transition-shadow mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                어떤 급여유형을 선택해야 할까요?
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                내 상황에 맞는 급여유형을 찾고, 단계별 사용법을 확인하세요.
              </p>
              <span className="text-sm font-bold text-primary">사용법 보기 →</span>
            </div>
          </Link>
          <div className="grid gap-3 sm:grid-cols-3">
            {wageTypes.map((w) => (
              <Link key={w.label} to="/guide/how-to-use" className={`${w.color} border rounded-xl p-4 hover:shadow-md transition-shadow`}>
                <span className="material-symbols-outlined text-[24px] mb-2">{w.icon}</span>
                <p className="font-medium text-sm">{w.label}</p>
                <p className="text-xs text-gray-500">{w.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 계산 전 확인 체크리스트 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">fact_check</span>
            계산 전 확인 체크리스트
          </h2>
          <div className="grid gap-3">
            {preCalculationChecks.map((item, index) => (
              <Link key={item.label} to={item.path}>
                <Card className="border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{item.label}</h3>
                      <p className="mt-1 text-sm text-gray-600">{item.detail}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 상황별 추천 경로 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">route</span>
            질문 유형별 추천 경로
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {scenarioRoutes.map((route) => (
              <Link key={route.label} to={route.path}>
                <Card className="h-full border border-primary/10 hover:shadow-md transition-shadow">
                  <h3 className="text-base font-bold text-gray-900">{route.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{route.detail}</p>
                  <span className="mt-3 inline-flex items-center text-sm font-medium text-blue-600">
                    경로 확인 →
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 법률 참고 가이드 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-500">menu_book</span>
            급여 계산 참고 가이드
          </h2>
          <div className="grid gap-4">
            {lawGuides.map((guide) => (
              <Link key={guide.path} to={guide.path}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">{guide.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{guide.title}</h3>
                      <p className="text-sm text-gray-600">{guide.description}</p>
                      <span className="inline-block mt-2 text-sm text-blue-600 font-medium">
                        자세히 보기 →
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 다음 단계 */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <h3 className="font-semibold text-blue-900 mb-2">바로 시작하기</h3>
          <div className="flex flex-wrap gap-4">
            <Link to="/calculator" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              급여 계산기 →
            </Link>
            <Link to="/examples" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              계산 사례 보기 →
            </Link>
            <Link to="/faq" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              자주 묻는 질문 →
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  </>
);

export default GuidePage;
