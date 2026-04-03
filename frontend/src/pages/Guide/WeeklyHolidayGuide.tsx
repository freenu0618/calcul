/**
 * 주휴수당 가이드 페이지
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

const WeeklyHolidayGuide = () => {
  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'guide_view', {
        event_category: 'engagement',
        event_label: '주휴수당 가이드',
        page_path: '/guide/weekly-holiday',
      });
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>주휴수당 완벽 가이드 | 2026년 기준 주휴수당 계산법 | 급여 계산기</title>
        <meta name="description" content="2026년 기준 주휴수당 개념, 발생 조건, 계산법을 완벽하게 안내합니다. 파트타임·아르바이트 주휴수당 계산 예시, 최저임금 포함 여부까지 상세히 정리." />
        <link rel="canonical" href="https://paytools.work/guide/weekly-holiday" />
        <meta property="og:title" content="주휴수당 완벽 가이드 | 2026년 기준 주휴수당 계산법" />
        <meta property="og:description" content="주휴수당 개념, 발생 조건, 계산법, 파트타임 적용 방법을 상세히 안내합니다." />
        <meta property="og:url" content="https://paytools.work/guide/weekly-holiday" />
      </Helmet>

      <MainLayout>
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <nav className="text-sm text-gray-500 mb-4">
              <Link to="/guide" className="hover:text-blue-600">가이드</Link>
              <span className="mx-2">/</span>
              <span>주휴수당 가이드</span>
            </nav>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              주휴수당 완벽 가이드
            </h1>
            <p className="text-lg text-gray-600">
              2026년 기준 주휴수당 개념부터 파트타임 적용 방법, 구체적인 계산 예시까지 완벽하게 안내합니다.
            </p>
          </div>

          {/* 주휴수당이란 */}
          <Card title="주휴수당이란?">
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                주휴수당은 근로기준법 제55조에 따라 1주일 동안 소정 근로일을 개근한 근로자에게
                <strong> 1주에 평균 1회 이상의 유급 휴일(주휴일)</strong>을 부여하는 제도에서 발생하는 수당입니다.
                쉽게 말해, 일주일에 정해진 날을 모두 출근하면 하루 더 일한 것처럼 돈을 받는 것입니다.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="font-semibold text-blue-900 mb-2">📌 주휴수당 핵심 요약</p>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• 1주에 15시간 이상 근무하는 모든 근로자에게 적용</li>
                  <li>• 주 소정 근로일을 <strong>개근</strong>해야 발생</li>
                  <li>• 주휴일 하루치 임금(1일 소정 근로시간 × 시급) 지급</li>
                  <li>• 정규직, 계약직, 아르바이트 모두 조건 충족 시 해당</li>
                  <li>• 5인 미만 사업장도 적용 (근로기준법 전면 적용)</li>
                </ul>
              </div>
              <p className="text-gray-700 mb-3">
                많은 아르바이트 근로자들이 주휴수당을 모르거나, 사용자가 지급하지 않는 경우가 많습니다.
                하지만 주휴수당은 법적으로 보장된 권리이며, 지급하지 않을 경우 사용자에게 형사 처벌이 가능합니다.
              </p>
            </div>
          </Card>

          <AdBanner className="my-6" />

          {/* 주휴수당 발생 조건 */}
          <Card title="주휴수당 발생 조건" className="mt-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                주휴수당이 발생하려면 다음 두 가지 조건을 모두 충족해야 합니다.
              </p>

              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <h4 className="font-bold text-green-900 text-lg mb-2">조건 1</h4>
                  <p className="font-semibold text-green-800">주 소정 근로시간 15시간 이상</p>
                  <p className="text-sm text-green-700 mt-2">
                    근로계약서에 명시된 주당 근로시간이 15시간 이상이어야 합니다.
                    실제 근무시간이 아닌 '소정' 근로시간 기준입니다.
                  </p>
                </div>
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <h4 className="font-bold text-green-900 text-lg mb-2">조건 2</h4>
                  <p className="font-semibold text-green-800">소정 근로일 개근</p>
                  <p className="text-sm text-green-700 mt-2">
                    해당 주의 소정 근로일을 모두 출근해야 합니다.
                    무단결근, 개인 사유 결근 시 해당 주 주휴수당이 발생하지 않습니다.
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">주휴수당이 발생하지 않는 경우</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>주 소정 근로시간이 15시간 미만인 경우 (초단시간 근로자)</li>
                <li>해당 주에 무단결근이나 개인 사정으로 결근한 경우</li>
                <li>해당 주의 마지막 근무일에 퇴직하는 경우 (퇴직 주에는 미발생 가능)</li>
              </ul>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-4">
                <p className="text-yellow-800 font-medium">⚠️ 초단시간 근로자 주의</p>
                <p className="text-yellow-700 text-sm mt-1">
                  주 소정 근로시간이 15시간 미만인 초단시간 근로자는 주휴수당뿐만 아니라
                  연차휴가, 퇴직금도 발생하지 않습니다. 단, 4대 보험은 별도 기준으로 가입해야 합니다.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">개근 인정 기준</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left border-b">구분</th>
                      <th className="px-4 py-2 text-left border-b">개근 인정 여부</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['연차휴가 사용', '✅ 인정'],
                      ['유급 병가', '✅ 인정'],
                      ['법정 공휴일 (유급)', '✅ 인정'],
                      ['지각 (소정 근로일 출근)', '✅ 인정 (소정 근로일 출근으로 봄)'],
                      ['무단결근', '❌ 불인정'],
                      ['개인 사정 결근 (무급)', '❌ 불인정'],
                      ['파업 등 쟁의행위', '❌ 불인정'],
                    ].map(([situation, result], i) => (
                      <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                        <td className="px-4 py-2 border-b">{situation}</td>
                        <td className="px-4 py-2 border-b">{result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* 주휴수당 계산법 */}
          <Card title="주휴수당 계산법" className="mt-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                주휴수당은 <strong>1주의 소정 근로시간에 비례</strong>하여 지급됩니다.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">주 40시간 만근 근로자 (풀타임)</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
                <p className="font-bold text-green-900 text-xl mb-2">주 40시간 기준</p>
                <p className="text-green-800 text-lg">
                  주휴수당 = 시급 × 8시간
                </p>
                <p className="text-green-700 text-sm mt-2">
                  주 40시간 근무 시 주휴일의 소정 근로시간은 8시간
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">주 40시간 미만 파트타임 근로자</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-center">
                <p className="font-bold text-blue-900 text-xl mb-2">파트타임 계산 공식</p>
                <p className="text-blue-800 text-lg">
                  주휴수당 = 시급 × (주 소정 근로시간 ÷ 40) × 8시간
                </p>
              </div>

              <p className="text-gray-700 mb-4 text-sm">
                위 공식은 주 소정 근로시간이 40시간 미만인 경우, 비례하여 계산하는 방식입니다.
                예를 들어 주 20시간 근무 시: 시급 × (20 ÷ 40) × 8 = 시급 × 4시간 분의 주휴수당이 발생합니다.
              </p>
            </div>
          </Card>

          {/* 계산 예시 */}
          <Card title="주휴수당 계산 예시" className="mt-6">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">예시 1: 최저임금 풀타임 (주 40시간)</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-3">조건: 2026년 최저임금 10,320원, 주 5일 8시간 근무</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">시급</span>
                    <span className="font-medium">10,320원</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">주 소정 근로시간</span>
                    <span className="font-medium">40시간</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">주휴 시간 (8시간)</span>
                    <span className="font-medium">8시간</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-blue-700 text-base">
                    <span>주휴수당 (1주)</span>
                    <span>82,560원 (10,320 × 8)</span>
                  </div>
                  <div className="flex justify-between py-1 text-gray-600">
                    <span>월 주휴수당 (약 4.345주)</span>
                    <span>358,730원 (82,560 × 4.345)</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  ※ 월 환산 급여: (40h + 8h) × 4.345주 × 10,320원 = 2,156,880원 (최저임금 고시 월 환산액 기준)
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">예시 2: 아르바이트 파트타임 (주 25시간)</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-3">조건: 시급 12,000원, 주 5일 5시간 근무 (주 25시간)</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">시급</span>
                    <span className="font-medium">12,000원</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">주 소정 근로시간</span>
                    <span className="font-medium">25시간</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">주휴 시간 (25 ÷ 40 × 8)</span>
                    <span className="font-medium">5시간</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-blue-700 text-base">
                    <span>주휴수당 (1주)</span>
                    <span>60,000원 (12,000 × 5)</span>
                  </div>
                  <div className="flex justify-between py-1 text-gray-600">
                    <span>주당 총 급여 (주휴 포함)</span>
                    <span>360,000원 (25h × 12,000 + 60,000)</span>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">예시 3: 주 3일 근무 (주 24시간)</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-3">조건: 시급 11,000원, 주 3일 8시간 근무 (주 24시간)</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">시급</span>
                    <span className="font-medium">11,000원</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">주 소정 근로시간</span>
                    <span className="font-medium">24시간 (3일 × 8시간)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">주휴 시간 (24 ÷ 40 × 8)</span>
                    <span className="font-medium">4.8시간</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-blue-700 text-base">
                    <span>주휴수당 (1주)</span>
                    <span>52,800원 (11,000 × 4.8)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 최저임금과 주휴수당 */}
          <Card title="최저임금과 주휴수당의 관계" className="mt-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                2026년 최저임금은 <strong>시간당 10,320원</strong>입니다. 최저임금 준수 여부를 판단할 때
                주휴수당을 어떻게 처리하는지에 대해 혼란이 있습니다.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">최저임금 위반 판단 기준</h3>
              <p className="text-gray-700 mb-3">
                최저임금 위반 여부는 <strong>시급으로만 판단</strong>합니다. 주휴수당을 따로 지급하지 않고
                시급에 포함시키는 "포괄임금제" 방식은 원칙적으로 허용되지만,
                시급 자체가 최저임금(10,320원) 이상이어야 합니다.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="font-medium text-gray-700 mb-3">2026년 기준 주휴수당 포함 실질 시급</p>
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">계약 시급</th>
                      <th className="px-3 py-2 text-left">주휴수당 포함 실질 시급</th>
                      <th className="px-3 py-2 text-left">최저임금 준수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['10,320원', '12,384원', '✅'],
                      ['11,000원', '13,200원', '✅'],
                      ['9,000원', '10,800원', '❌ 미준수'],
                      ['8,500원', '10,200원', '❌ 미준수'],
                    ].map(([contractWage, realWage, compliant], i) => (
                      <tr key={i} className={`border-t ${compliant.includes('❌') ? 'bg-red-50' : ''}`}>
                        <td className="px-3 py-2">{contractWage}</td>
                        <td className="px-3 py-2 font-medium">{realWage}</td>
                        <td className="px-3 py-2">{compliant}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-gray-500 mt-2">
                  ※ 주휴수당 포함 실질 시급 = 계약 시급 × (1 + 1/5) = 계약 시급 × 1.2 (주 5일 기준)
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">월급에서 주휴수당 역산하기</h3>
              <p className="text-gray-700 mb-3">
                월급에는 이미 주휴수당이 포함되어 있습니다. 주 40시간 근무 기준 최저임금 월 환산액은
                <strong> 2,156,880원</strong>입니다.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3 text-sm">
                <p className="font-medium text-blue-900 mb-2">월급 최저임금 환산 계산 (2026년)</p>
                <p className="text-blue-800">
                  (주 40시간 + 주휴 8시간) × 4.345주/월 × 10,320원 = <strong>2,156,880원</strong>
                </p>
                <p className="text-blue-700 text-xs mt-2">
                  ※ 4.345주 = 365일 ÷ 12개월 ÷ 7일
                </p>
              </div>
            </div>
          </Card>

          {/* 자주 묻는 질문 */}
          <Card title="자주 묻는 질문 (FAQ)" className="mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Q. 주휴수당을 안 주면 어떻게 되나요?</h3>
                <p className="text-gray-700 mt-1 text-sm">
                  A. 주휴수당 미지급은 근로기준법 위반입니다. 사업주는 2년 이하의 징역 또는 2천만 원 이하의 벌금에 처해질 수 있습니다.
                  미지급 수당은 고용노동부에 진정을 통해 청구할 수 있으며, 소멸시효는 3년입니다.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Q. 주 15시간 이하로 쪼개서 고용하면 주휴수당을 안 줘도 되나요?</h3>
                <p className="text-gray-700 mt-1 text-sm">
                  A. 단지 주휴수당을 회피할 목적으로 계약상 근로시간을 15시간 미만으로 쪼갰다고 해도,
                  실제 근무시간이 15시간 이상이라면 주휴수당이 발생할 수 있습니다.
                  고용노동부와 법원은 실질적인 근로 관계를 기준으로 판단합니다.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Q. 지각하면 주휴수당이 없어지나요?</h3>
                <p className="text-gray-700 mt-1 text-sm">
                  A. 지각은 소정 근로일에 출근한 것으로 봅니다. 따라서 지각했더라도 해당 주의 소정 근로일을 모두 출근했다면
                  주휴수당이 발생합니다. 단, 지각으로 인한 감급은 별도로 처리될 수 있습니다.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Q. 퇴직하는 주에도 주휴수당이 발생하나요?</h3>
                <p className="text-gray-700 mt-1 text-sm">
                  A. 퇴직일이 포함된 주의 주휴수당은 원칙적으로 다음 주의 근로 의무가 없으므로 발생하지 않습니다.
                  단, 퇴직 전 주에 해당하는 주휴일은 이미 발생한 것이므로 지급해야 합니다.
                  구체적인 상황에 따라 다를 수 있으므로 고용노동부에 확인하는 것이 좋습니다.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Q. 주 2회 근무, 각 7시간(주 14시간)이면 주휴수당이 없나요?</h3>
                <p className="text-gray-700 mt-1 text-sm">
                  A. 주 소정 근로시간이 14시간으로 15시간 미만이므로 원칙적으로 주휴수당이 발생하지 않습니다.
                  주휴수당 혜택을 받으려면 주 소정 근로시간을 15시간 이상으로 계약해야 합니다.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Q. 주 15시간 근무 시 주휴수당은 얼마인가요?</h3>
                <p className="text-gray-700 mt-1 text-sm">
                  A. 시급 10,320원 기준: 10,320 × (15 ÷ 40) × 8 = 10,320 × 3 = 30,960원/주입니다.
                  파트타임 최저 기준의 주휴수당 계산 예시입니다.
                </p>
              </div>
            </div>
          </Card>

          {/* 주휴수당 미지급 대응 */}
          <Card title="주휴수당 미지급 시 대응 방법" className="mt-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                주휴수당을 받지 못했다면 다음과 같은 방법으로 권리를 찾을 수 있습니다.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-sm flex-shrink-0">1단계</span>
                  <div>
                    <p className="font-medium text-gray-900">증거 수집</p>
                    <p className="text-sm text-gray-600">
                      근로계약서, 급여명세서, 근태 기록(출퇴근 기록), 급여 이체 내역 등을 확보합니다.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-sm flex-shrink-0">2단계</span>
                  <div>
                    <p className="font-medium text-gray-900">사업주와 협의</p>
                    <p className="text-sm text-gray-600">
                      먼저 사업주에게 주휴수당 지급을 요청합니다. 문자나 카카오톡 등 기록이 남는 방식으로 요청하는 것이 좋습니다.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-sm flex-shrink-0">3단계</span>
                  <div>
                    <p className="font-medium text-gray-900">고용노동부 진정 제기</p>
                    <p className="text-sm text-gray-600">
                      협의가 안 될 경우 고용노동부 민원마당(minjwon.moel.go.kr) 또는 방문을 통해
                      진정을 제기할 수 있습니다. 전화 상담: 고용노동부 1350
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-sm flex-shrink-0">4단계</span>
                  <div>
                    <p className="font-medium text-gray-900">소액심판·민사소송</p>
                    <p className="text-sm text-gray-600">
                      금액이 크지 않으면 소액심판(3,000만 원 이하)으로 신속하게 해결할 수 있습니다.
                      법원 전자소송 포털(ecfs.courts.go.kr)에서 신청 가능합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <AdBanner className="my-6" />

          {/* 관련 링크 */}
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <h3 className="font-semibold text-blue-900 mb-2">관련 가이드 및 계산기</h3>
            <div className="flex flex-wrap gap-4">
              <Link to="/calculator" className="text-sm text-blue-600 hover:text-blue-700 font-medium">급여 계산기 →</Link>
              <Link to="/guide/severance" className="text-sm text-blue-600 hover:text-blue-700 font-medium">퇴직금 계산 가이드 →</Link>
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

export default WeeklyHolidayGuide;
