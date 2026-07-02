/**
 * 연락처 페이지
 */

import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import PageHelmet from '../components/common/PageHelmet';
import { Helmet } from 'react-helmet-async';

const contactTopics = [
  {
    title: '계산 결과 문의',
    description: '급여유형, 기본급 또는 시급, 근무시간, 수당, 4대보험 적용 여부만 정리해 주세요. 이름·주민등록번호·계좌번호는 보내지 않아도 됩니다.',
  },
  {
    title: '버그 리포트',
    description: '발생한 페이지, 입력값, 브라우저, 기대한 결과와 실제 결과를 적어 주시면 확인이 빠릅니다.',
  },
  {
    title: '법령·기준 확인',
    description: '최저임금, 주휴수당, 4대보험, 가산수당처럼 확인하려는 기준과 적용 상황을 알려 주세요.',
  },
  {
    title: '도입·기능 제안',
    description: '직원 수, 급여유형 혼합 여부, 필요한 급여명세서·급여대장 흐름을 함께 남겨 주세요.',
  },
];

const contactStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'PayTools 문의하기',
    url: 'https://paytools.work/contact',
    inLanguage: 'ko-KR',
    dateModified: '2026-07-03',
    description: 'PayTools 급여 계산기 문의, 버그 리포트, 기능 제안, 계산 기준 확인을 위한 공식 연락처 페이지입니다. 공개 문의에는 이름, 주민등록번호, 계좌번호 같은 민감정보가 필요하지 않습니다.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'PayTools',
      url: 'https://paytools.work',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@salary-calculator.kr',
      contactType: 'customer support',
      availableLanguage: ['Korean'],
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'PayTools 문의 전 확인 항목',
    url: 'https://paytools.work/contact',
    inLanguage: 'ko-KR',
    dateModified: '2026-07-03',
    numberOfItems: contactTopics.length,
    itemListElement: contactTopics.map((topic, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: topic.title,
      description: topic.description,
    })),
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
        name: '연락처',
        item: 'https://paytools.work/contact',
      },
    ],
  },
];

const Contact = () => {
  return (
    <>
    <PageHelmet
      title="연락처 - 문의하기"
      description="PayTools 급여 계산기에 대한 문의사항, 버그 리포트, 개선 제안은 이메일로 연락해 주세요."
      path="/contact"
    />
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(contactStructuredData)}
      </script>
    </Helmet>
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">연락처</h1>
        <p className="text-lg text-gray-600 mb-8">
          급여계산기에 대한 문의사항이 있으시면 언제든지 연락해 주세요.
        </p>

        <Card title="이메일">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📧</span>
            <div>
              <p className="text-gray-700">
                <a href="mailto:contact@salary-calculator.kr" className="text-blue-600 hover:underline">
                  contact@salary-calculator.kr
                </a>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                일반 문의, 개선 제안, 버그 리포트 등
              </p>
            </div>
          </div>
        </Card>

        <section className="mt-6 rounded-lg border border-blue-100 bg-blue-50/70 p-5" aria-labelledby="contact-topics-title">
          <h2 id="contact-topics-title" className="text-xl font-bold text-gray-900 mb-3">
            문의 전 정리하면 좋은 내용
          </h2>
          <p className="text-sm text-gray-700 mb-4">
            계산 기준이나 버그 상황을 함께 보내 주시면 반복 확인 없이 더 정확히 답변할 수 있습니다.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {contactTopics.map((topic) => (
              <article key={topic.title} className="rounded-md bg-white p-4 shadow-sm">
                <h3 className="text-sm font-bold text-blue-700 mb-2">{topic.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{topic.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-amber-100 bg-amber-50/70 p-5" aria-labelledby="contact-privacy-title">
          <h2 id="contact-privacy-title" className="text-xl font-bold text-gray-900 mb-3">
            민감정보는 제외해 주세요
          </h2>
          <p className="text-sm leading-relaxed text-gray-700">
            공개 문의나 버그 리포트에는 이름, 주민등록번호, 계좌번호, 급여명세서 원본이 필요하지 않습니다.
            계산 조건을 설명할 때는 급여유형, 금액, 근무시간, 수당, 공제 조건처럼 결과를 바꾸는 입력값만 남겨 주세요.
          </p>
        </section>

        <Card title="문의 시 포함 사항" className="mt-6">
          <p className="text-gray-700 mb-3">
            원활한 답변을 위해 다음 정보를 포함해 주시면 감사하겠습니다:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>문의 유형 (일반 문의, 버그 리포트, 개선 제안 등)</li>
            <li>구체적인 문의 내용</li>
            <li>버그의 경우: 발생 상황, 브라우저 정보, 스크린샷 등</li>
            <li>연락 가능한 이메일 주소</li>
          </ul>
        </Card>

        <Card title="FAQ 먼저 확인해 보세요" className="mt-6">
          <p className="text-gray-700 mb-3">
            자주 묻는 질문은 FAQ 페이지에서 확인하실 수 있습니다.
          </p>
          <a
            href="/faq"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            FAQ 바로가기
          </a>
        </Card>

        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">응답 시간</h3>
          <p className="text-gray-700 mb-2">
            평일: 영업일 기준 1-2일 이내 답변
          </p>
          <p className="text-gray-700">
            주말 및 공휴일: 다음 영업일에 순차적으로 답변
          </p>
        </div>

        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">개인정보 보호</h3>
          <p className="text-sm text-gray-700">
            문의 시 제공해 주신 개인정보는 답변 목적으로만 사용되며, 제3자에게 제공되지 않습니다.
            자세한 내용은 <a href="/privacy" className="text-blue-600 hover:underline">개인정보처리방침</a>을 참고해 주세요.
          </p>
        </div>
      </div>
    </MainLayout>
    </>
  );
};

export default Contact;
