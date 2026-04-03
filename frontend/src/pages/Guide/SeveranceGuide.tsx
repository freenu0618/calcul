/**
 * 퇴직금 계산 가이드 페이지
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import AdBanner from '../../components/common/AdBanner';

declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
}

const SeveranceGuide = () => {
  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'guide_view', {
        event_category: 'engagement',
        event_label: '퇴직금 계산 가이드',
        page_path: '/guide/severance',
      });
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>퇴직금 계산 가이드 | 2026년 기준 퇴직금 계산법 완벽 정리 | 급여 계산기</title>
        <meta name="description" content="2026년 기준 퇴직금 계산법을 완벽하게 안내합니다. 평균임금 산정 방법, 퇴직금 계산 공식, 구체적인 계산 예시와 주의사항을 확인하세요." />
        <link rel="canonical" href="https://paytools.work/guide/severance" />
        <meta property="og:title" content="퇴직금 계산 가이드 | 2026년 기준 퇴직금 계산법 완벽 정리" />
        <meta property="og:description" content="2026년 기준 퇴직금 계산법을 완벽하게 안내합니다. 평균임금 산정, 계산 공식, 예시 포함." />
        <meta property="og:url" content="https://paytools.work/guide/severance" />
      </Helmet>

      <MainLayout>
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <nav className="text-sm text-gray-500 mb-4">
              <Link to="/guide" className="hover:text-blue-600">가이드</Link>
              <span className="mx-2">/</span>
              <span>퇴직금 계산 가이드</span>
            </nav>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              퇴직금 계산 가이드
            </h1>
            <p className="text-lg text-gray-600">
              2026년 기준 퇴직금 계산법과 법적 기준을 상세히 설명합니다. 평균임금 산정부터 구체적인 계산 예시까지 완벽하게 안내합니다.
            </p>
          </div>

          {/* 퇴직금이란 */}
          <Card title="퇴직금이란?">
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                퇴직금은 근로자가 일정 기간 이상 근무하고 퇴직할 때 사용자(고용주)가 지급해야 하는 금전적 급여입니다.
                근로자퇴직급여 보장법에 의해 법적으로 보장되며, 퇴직 후 노후 생활을 위한 중요한 재원이 됩니다.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">퇴직금 지급 의무 대상</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>계속 근로 기간이 <strong>1년 이상</strong>인 근로자</li>
                <li>주당 소정 근로시간이 <strong>15시간 이상</strong>인 근로자</li>
                <li>사업 규모와 관계없이 <strong>모든 사업장</strong>에 적용</li>
              </ul>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-4">
                <p className="text-yellow-800 font-medium">⚠️ 주의사항</p>
                <p className="text-yellow-700 text-sm mt-1">
                  아르바이트나 파트타임 근로자도 1년 이상 근무하고 주 15시간 이상 일했다면 퇴직금을 받을 권리가 있습니다.
                  근로 형태에 관계없이 퇴직금 지급 의무가 발생합니다.
                </p>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">퇴직금 지급 방식</h3>
              <p className="text-gray-700 mb-2">
                퇴직금 지급 방식은 크게 두 가지로 나뉩니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>퇴직금 제도:</strong> 퇴직 시 일시에 지급하는 전통적인 방식</li>
                <li><strong>퇴직연금 제도 (DC/DB/IRP):</strong> 사전에 적립 후 퇴직 시 연금 또는 일시금으로 수령</li>
              </ul>
            </div>
          </Card>

          <AdBanner className="my-6" />

          {/* 평균임금 계산 */}
          <Card title="평균임금 계산 방법" className="mt-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                퇴직금 계산의 핵심은 <strong>평균임금</strong>입니다. 평균임금은 퇴직일 이전 3개월 동안 지급된
                임금 총액을 3개월의 총 일수로 나눈 금액입니다.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="font-semibold text-blue-900 text-center text-lg">
                  평균임금 = 퇴직일 이전 3개월 임금 총액 ÷ 3개월 총 일수
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">평균임금에 포함되는 항목</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>기본급 (월급, 시급 기반 임금)</li>
                <li>연장·야간·휴일 근로 수당</li>
                <li>통상적으로 지급되는 상여금 (연간 총액의 3/12)</li>
                <li>연차수당 (연간 총액의 3/12)</li>
                <li>식대, 교통비 등 고정적으로 지급되는 수당</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">평균임금에서 제외되는 항목</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>임시·불규칙적으로 지급된 금품</li>
                <li>결혼축하금, 재해위로금 등 은혜적 급여</li>
                <li>출장비, 실비 변상적 성질의 금품</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">통상임금과의 비교</h3>
              <p className="text-gray-700 mb-2">
                평균임금이 통상임금보다 낮을 경우, 통상임금을 평균임금으로 사용합니다.
                이는 근로자를 보호하기 위한 규정입니다.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left border-b">구분</th>
                      <th className="px-4 py-2 text-left border-b">평균임금</th>
                      <th className="px-4 py-2 text-left border-b">통상임금</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border-b">산정 기간</td>
                      <td className="px-4 py-2 border-b">퇴직 전 3개월</td>
                      <td className="px-4 py-2 border-b">소정 근로 기준</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">포함 항목</td>
                      <td className="px-4 py-2 border-b">실제 지급된 전체 임금</td>
                      <td className="px-4 py-2 border-b">정기적·일률적 고정 임금</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">주요 용도</td>
                      <td className="px-4 py-2">퇴직금, 재해보상</td>
                      <td className="px-4 py-2">연장·야간·휴일 수당</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* 퇴직금 계산 공식 */}
          <Card title="퇴직금 계산 공식" className="mt-6">
            <div className="prose max-w-none">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
                <p className="font-bold text-green-900 text-xl mb-2">퇴직금 계산 공식</p>
                <p className="text-green-800 text-lg">
                  퇴직금 = 평균임금 × 30일 × (총 근로 일수 ÷ 365)
                </p>
              </div>
              <p className="text-gray-700 mb-4">
                위 공식을 풀어서 설명하면, <strong>1년 근무</strong>할 때마다 <strong>30일분의 평균임금</strong>을
                퇴직금으로 받는다는 의미입니다. 즉, 근속 연수 1년당 한 달치 급여가 퇴직금으로 적립됩니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li><strong>평균임금:</strong> 퇴직 전 3개월 일 평균 임금</li>
                <li><strong>30일:</strong> 법령에서 정한 퇴직금 산정 기준일</li>
                <li><strong>총 근로 일수 ÷ 365:</strong> 근속 연수 (소수점 포함)</li>
              </ul>
            </div>
          </Card>

          {/* 계산 예시 */}
          <Card title="퇴직금 계산 예시" className="mt-6">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">예시 1: 월급 300만 원, 3년 근무</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-3">조건: 월급 3,000,000원, 근무 기간 3년 (1,095일)</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">3개월 임금 총액</span>
                    <span className="font-medium">9,000,000원 (300만 × 3개월)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">3개월 총 일수</span>
                    <span className="font-medium">92일 (31+30+31일)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">1일 평균임금</span>
                    <span className="font-medium">97,826원 (9,000,000 ÷ 92)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">근속 일수</span>
                    <span className="font-medium">1,095일 (3년)</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-blue-700 text-base">
                    <span>퇴직금 합계</span>
                    <span>9,000,000원 (97,826 × 30 × 1,095 ÷ 365)</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">※ 월 30일 기준으로 산정 시 300만 × 3년 = 900만원과 동일</p>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">예시 2: 시급 10,320원(최저임금), 주 40시간, 1년 2개월 근무</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-3">
                  조건: 2026년 최저임금 10,320원, 주 40시간 근무, 1년 2개월(425일) 근무
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">월 환산 임금</span>
                    <span className="font-medium">2,156,880원 (10,320 × 209시간)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">3개월 임금 총액</span>
                    <span className="font-medium">6,470,640원</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">1일 평균임금</span>
                    <span className="font-medium">70,333원 (6,470,640 ÷ 92)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">근속 일수</span>
                    <span className="font-medium">425일 (1년 2개월)</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-blue-700 text-base">
                    <span>퇴직금 합계</span>
                    <span>약 2,453,561원 (70,333 × 30 × 425 ÷ 365)</span>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">예시 3: 상여금 포함 고임금 근로자</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  조건: 기본급 400만, 연간 상여금 600만, 5년 근무
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">3개월 기본급</span>
                    <span className="font-medium">12,000,000원</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">상여금 산입분 (600만 × 3/12)</span>
                    <span className="font-medium">1,500,000원</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">3개월 임금 합계</span>
                    <span className="font-medium">13,500,000원</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">1일 평균임금</span>
                    <span className="font-medium">146,739원 (13,500,000 ÷ 92)</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-blue-700 text-base">
                    <span>퇴직금 합계</span>
                    <span>약 30,000,000원 (5년 × 300만 + 상여 반영)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 퇴직연금 제도 */}
          <Card title="퇴직연금 제도 (DC/DB/IRP)" className="mt-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                2005년 도입된 퇴직연금 제도는 기존 퇴직금 제도의 한계를 보완하기 위해 만들어졌습니다.
                사업주 도산 시에도 근로자의 퇴직급여를 보호할 수 있습니다.
              </p>
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-900 mb-2">확정급여형 (DB)</h4>
                  <p className="text-sm text-blue-800">
                    퇴직 시 받을 금액이 미리 확정. 사업주가 운용 책임.
                    근속 연수와 최종 임금에 따라 급여 결정.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-green-900 mb-2">확정기여형 (DC)</h4>
                  <p className="text-sm text-green-800">
                    사업주 부담금이 확정. 근로자가 직접 운용.
                    연 임금의 1/12 이상을 납입해야 함.
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-bold text-purple-900 mb-2">개인형 퇴직연금 (IRP)</h4>
                  <p className="text-sm text-purple-800">
                    퇴직 시 수령한 퇴직금을 이전하거나 추가 납입 가능.
                    세액공제 혜택 있음 (연 900만원 한도).
                  </p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-bold text-orange-900 mb-2">중간정산</h4>
                  <p className="text-sm text-orange-800">
                    원칙적으로 불가. 단, 주택 구입, 의료비 등
                    법령에서 정한 사유에 해당하는 경우만 가능.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 퇴직금 세금 */}
          <Card title="퇴직금 세금 (퇴직소득세)" className="mt-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                퇴직금에는 퇴직소득세가 부과됩니다. 일반 근로소득세와는 별도로 계산되며,
                장기 근속자를 우대하는 방식으로 설계되어 있습니다.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">퇴직소득세 특징</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li><strong>근속연수 공제:</strong> 근속 연수가 길수록 공제액이 커져 세금 부담 감소</li>
                <li><strong>환산급여 공제:</strong> 퇴직금을 근속 연수로 나눠 1년치 환산 후 적용</li>
                <li><strong>분리과세:</strong> 다른 소득과 합산하지 않고 별도 과세</li>
                <li><strong>IRP 이전 시 과세 이연:</strong> IRP로 이전하면 세금을 나중에 납부</li>
              </ul>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">근속연수 공제 기준 (2026년)</h4>
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">근속 연수</th>
                      <th className="px-3 py-2 text-left">공제액</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-3 py-2">5년 이하</td>
                      <td className="px-3 py-2">30만원 × 근속연수</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-2">6~10년</td>
                      <td className="px-3 py-2">150만원 + 50만원 × (근속연수 - 5)</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-2">11~20년</td>
                      <td className="px-3 py-2">400만원 + 80만원 × (근속연수 - 10)</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-2">20년 초과</td>
                      <td className="px-3 py-2">1,200만원 + 120만원 × (근속연수 - 20)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* 자주 묻는 질문 */}
          <Card title="자주 묻는 질문 (FAQ)" className="mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Q. 1년 미만 근무 시 퇴직금을 받을 수 없나요?</h3>
                <p className="text-gray-700 mt-1 text-sm">
                  A. 원칙적으로 1년 이상 근무해야 퇴직금이 발생합니다. 11개월 29일 근무 후 퇴직 시에는 퇴직금이 발생하지 않습니다.
                  단, 회사 취업규칙이나 근로계약에서 1년 미만 근무자에게도 퇴직금을 지급하기로 정한 경우에는 예외입니다.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Q. 퇴직금 지급 기한은 언제인가요?</h3>
                <p className="text-gray-700 mt-1 text-sm">
                  A. 퇴직금은 퇴직일로부터 14일 이내에 지급해야 합니다. 당사자 합의로 지급일을 연장할 수 있으나,
                  합의 없이 14일을 초과하면 연 20%의 지연이자가 발생합니다.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Q. 계약직(기간제) 근로자도 퇴직금을 받을 수 있나요?</h3>
                <p className="text-gray-700 mt-1 text-sm">
                  A. 네, 계약직도 1년 이상, 주 15시간 이상 근무했다면 퇴직금을 받을 권리가 있습니다.
                  계약 기간이 끝나거나 중도에 퇴직하더라도 조건을 충족하면 퇴직금을 청구할 수 있습니다.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Q. 사직서를 제출하면 퇴직금을 못 받나요?</h3>
                <p className="text-gray-700 mt-1 text-sm">
                  A. 아닙니다. 자발적 퇴직(사직)이든 해고든 퇴직금은 동일하게 지급됩니다.
                  단, 중대한 귀책사유로 인한 해고의 경우에도 퇴직금 자체는 지급됩니다 (실업급여와는 별개).
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Q. 퇴직금을 안 주면 어떻게 해야 하나요?</h3>
                <p className="text-gray-700 mt-1 text-sm">
                  A. 사업주가 퇴직금을 지급하지 않으면 고용노동부 지방관서에 진정(고발)을 제기할 수 있습니다.
                  근로자퇴직급여 보장법 위반으로 3년 이하 징역 또는 3천만원 이하 벌금에 처해질 수 있습니다.
                </p>
              </div>
            </div>
          </Card>

          <AdBanner className="my-6" />

          {/* 관련 링크 */}
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <h3 className="font-semibold text-blue-900 mb-2">관련 가이드 및 계산기</h3>
            <div className="flex flex-wrap gap-4">
              <Link to="/calculator" className="text-sm text-blue-600 hover:text-blue-700 font-medium">급여 계산기 →</Link>
              <Link to="/guide/annual-leave" className="text-sm text-blue-600 hover:text-blue-700 font-medium">연차수당 가이드 →</Link>
              <Link to="/guide/overtime" className="text-sm text-blue-600 hover:text-blue-700 font-medium">연장근로 수당 가이드 →</Link>
              <Link to="/faq" className="text-sm text-blue-600 hover:text-blue-700 font-medium">자주 묻는 질문 →</Link>
            </div>
          </div>

          {/* 법적 고지 */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500">
            <p>
              본 가이드는 일반적인 정보 제공을 목적으로 하며, 법적 조언이 아닙니다.
              구체적인 사안에 대해서는 고용노동부(1350) 또는 법률 전문가에게 문의하시기 바랍니다.
              2026년 기준으로 작성되었으며, 법령 개정 시 내용이 달라질 수 있습니다.
            </p>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default SeveranceGuide;
