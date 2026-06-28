/**
 * 계산 사례 메인 페이지
 */

import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import PageHelmet from '../../components/common/PageHelmet';

const dateModified = '2026-06-29';

const ExamplesPage = () => {
  const examples = [
    {
      title: '풀타임 근로자 (주 5일)',
      path: '/examples/fulltime',
      description: '월급 250만원, 주 5일 근무하는 일반적인 정규직 근로자의 실수령액 계산 사례',
      salary: '250만원',
      netPay: '약 215만원',
      icon: '💼',
    },
    {
      title: '파트타임 근로자 (주 3일)',
      path: '/examples/parttime',
      description: '시급 10,320원, 주 3일 근무하는 단시간 근로자의 급여 계산 사례',
      salary: '시급 10,320원',
      netPay: '약 72만원',
      icon: '⏱️',
    },
    {
      title: '교대근무 (3교대)',
      path: '/examples/shift-work',
      description: '야간근무를 포함한 3교대 근로자의 연장·야간·휴일 수당 계산 사례',
      salary: '300만원 + 수당',
      netPay: '약 320만원',
      icon: '🌙',
    },
  ];

  const exampleGuidance = [
    {
      title: '풀타임 월급제',
      description: '고정 월급과 주 5일 근무 조건에서 4대보험, 소득세, 주휴시간이 실수령액에 어떻게 반영되는지 볼 때 적합합니다.',
    },
    {
      title: '파트타임·알바',
      description: '시급, 주 소정근로시간, 주휴수당 대상 여부를 먼저 나누어 확인해야 할 때 참고하기 좋습니다.',
    },
    {
      title: '교대·야간근무',
      description: '야간·휴일·연장 시간이 겹치며 통상시급과 가산수당 기준을 함께 확인해야 할 때 사용합니다.',
    },
  ];

  const examplesStructuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'PayTools 급여 계산 사례',
      url: 'https://paytools.work/examples',
      inLanguage: 'ko-KR',
      dateModified,
      description:
        '풀타임, 파트타임, 교대근무 급여 계산 사례를 통해 2026년 기준 4대보험, 소득세, 주휴수당, 가산수당 계산 흐름을 확인하는 페이지입니다.',
      isPartOf: {
        '@type': 'WebSite',
        name: 'PayTools',
        url: 'https://paytools.work',
      },
      significantLink: [
        'https://paytools.work/examples/fulltime',
        'https://paytools.work/examples/parttime',
        'https://paytools.work/examples/shift-work',
        'https://paytools.work/calculator',
        'https://paytools.work/guide/how-to-use',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: '근무 형태별 급여 계산 사례',
      inLanguage: 'ko-KR',
      dateModified,
      numberOfItems: examples.length,
      itemListElement: examples.map((example, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: example.title,
        description: example.description,
        url: `https://paytools.work${example.path}`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: 'ko-KR',
      dateModified,
      mainEntity: [
        {
          '@type': 'Question',
          name: '급여 계산 사례는 언제 참고하면 좋나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '계산기 입력 전에 풀타임, 파트타임, 교대근무처럼 근무 형태별로 어떤 입력값과 공제 항목이 필요한지 확인할 때 유용합니다.',
          },
        },
        {
          '@type': 'Question',
          name: '사례의 실수령액을 그대로 적용해도 되나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '아니요. 사례는 2026년 기준 참고용 예시이며 실제 급여는 사업장 규모, 부양가족, 비과세 수당, 근무시간, 회사별 공제에 따라 달라질 수 있습니다.',
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
          name: '급여 계산 사례',
          item: 'https://paytools.work/examples',
        },
      ],
    },
  ];

  return (
    <>
    <PageHelmet
      title="급여 계산 사례 - 풀타임·파트타임·교대근무"
      description="다양한 근무 형태별 실제 급여 계산 사례. 풀타임, 파트타임, 교대근무의 4대보험, 소득세, 실수령액 계산 과정을 확인하세요."
      path="/examples"
    />
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(examplesStructuredData)}
      </script>
    </Helmet>
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            급여 계산 사례
          </h1>
          <p className="text-lg text-gray-600">
            다양한 근무 형태별 실제 급여 계산 사례를 통해 급여 구조를 이해해 보세요.
          </p>
        </div>

        <section className="mb-8 rounded-lg border border-blue-100 bg-blue-50 p-4" aria-labelledby="examples-guidance-title">
          <h2 id="examples-guidance-title" className="mb-3 text-lg font-bold text-gray-900">
            어떤 사례부터 보면 좋을까요?
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {exampleGuidance.map((item) => (
              <div key={item.title} className="rounded-md bg-white p-3">
                <h3 className="text-sm font-bold text-blue-700">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 mb-12">
          {examples.map((example) => (
            <Link key={example.path} to={example.path}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{example.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {example.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{example.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-700">
                        <strong>총 지급:</strong> {example.salary}
                      </span>
                      <span className="text-blue-600 font-semibold">
                        <strong>실수령:</strong> {example.netPay}
                      </span>
                    </div>
                    <span className="inline-block mt-3 text-blue-600 hover:text-blue-700 font-medium">
                      상세 보기 →
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <Card title="사례 활용 가이드">
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              각 사례는 2026년 기준 최저임금, 4대 보험 요율, 간이세액표를 적용하여 계산되었습니다.
              실제 급여는 개인의 상황(부양가족 수, 비과세 수당, 회사별 공제, 실제 근무시간 등)에 따라 달라질 수 있습니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>모든 계산은 공개 기준을 적용한 참고용 예시입니다</li>
              <li>4대 보험은 근로자 부담분만 표시되어 있습니다</li>
              <li>소득세는 부양가족 1명 기준으로 계산되었습니다</li>
              <li>실제 급여 지급·분쟁 판단 시에는 개인별 조건과 전문가 검토를 함께 반영해야 합니다</li>
            </ul>
          </div>
        </Card>

        <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">직접 계산해 보세요</h3>
          <p className="text-gray-700 mb-3">
            내 급여를 정확히 계산하고 싶다면 급여 계산기를 사용해 보세요.
          </p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            급여 계산기로 이동
          </Link>
        </div>
      </div>
    </MainLayout>
    </>
  );
};

export default ExamplesPage;
