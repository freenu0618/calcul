/**
 * 연차수당 가이드 페이지
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

const AnnualLeaveGuide = () => {
  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'guide_view', {
        event_category: 'engagement',
        event_label: '연차수당 가이드',
        page_path: '/guide/annual-leave',
      });
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>연차수당 완벽 가이드 | 2026년 연차 발생 기준 및 계산법 | 급여 계산기</title>
        <meta name="description" content="2026년 기준 연차 발생 조건, 연차수당 계산법, 미사용 연차수당 지급 기준을 상세히 안내합니다. 1년 미만 월차부터 80% 이상 출근 기준까지 완벽 정리." />
        <link rel="canonical" href="https://paytools.work/guide/annual-leave" />
        <meta property="og:title" content="연차수당 완벽 가이드 | 2026년 연차 발생 기준 및 계산법" />
        <meta property="og:description" content="연차 발생 조건, 연차수당 계산법, 미사용 연차수당 처리 방법을 상세히 안내합니다." />
        <meta property="og:url" content="https://paytools.work/guide/annual-leave" />
      </Helmet>

      <MainLayout>
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <nav className="text-sm text-gray-500 mb-4">
              <Link to="/guide" className="hover:text-blue-600">가이드</Link>
              <span className="mx-2">/</span>
              <span>연차수당 가이드</span>
            </nav>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              연차수당 완벽 가이드
            </h1>
            <p className="text-lg text-gray-600">
              2026년 기준 연차 발생 조건부터 연차수당 계산법, 미사용 연차 처리까지 상세히 안내합니다.
            </p>
          </div>

          {/* 연차휴가란 */}
          <Card title="연차휴가란?">
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                연차유급휴가(연차)는 근로기준법 제60조에 따라 근로자가 일정 조건을 충족했을 때 유급으로 쉴 수 있는
                권리입니다. 쉬는 날에도 임금이 지급되므로 "유급"휴가라고 합니다.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="font-semibold text-blue-900">✅ 연차휴가 적용 대상</p>
                <ul className="text-blue-800 text-sm mt-2 space-y-1">
                  <li>• 주 소정 근로시간 15시간 이상 근로자</li>
                  <li>• 상시 근로자 5인 이상 사업장 (5인 미만 적용 제외)</li>
                  <li>• 정규직, 계약직, 파트타임 모두 조건 충족 시 해당</li>
                </ul>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <p className="text-yellow-800 font-medium">⚠️ 5인 미만 사업장</p>
                <p className="text-yellow-700 text-sm mt-1">
                  상시 근로자 5인 미만 사업장은 근로기준법상 연차 규정이 적용되지 않습니다.
                  단, 취업규칙이나 근로계약으로 연차를 부여하는 경우는 해당 약정이 적용됩니다.
                </p>
              </div>
            </div>
          </Card>

          <AdBanner slot="7890123456" className="my-6" />

          {/* 연차 발생 기준 */}
          <Card title="연차 발생 기준" className="mt-6">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. 입사 1년 미만 (월차)</h3>
              <p className="text-gray-700 mb-3">
                입사 후 1년이 되지 않은 근로자는 <strong>매월 개근</strong>하면 다음 달 1일의 유급휴가가 발생합니다.
                최대 11개의 유급휴가(월차)를 사용할 수 있습니다.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">월차 발생 예시 (2025년 3월 1일 입사)</p>
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-1 text-left">근무 기간</th>
                      <th className="px-3 py-1 text-left">발생 월차</th>
                      <th className="px-3 py-1 text-left">발생일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['3월 개근', '1일', '4월 1일'],
                      ['4월 개근', '1일', '5월 1일'],
                      ['5월 개근', '1일', '6월 1일'],
                      ['...', '...', '...'],
                      ['1월 개근', '1일', '2월 1일'],
                    ].map(([period, days, date], i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-1">{period}</td>
                        <td className="px-3 py-1">{days}</td>
                        <td className="px-3 py-1">{date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-gray-500 mt-2">※ 11개월 개근 시 최대 11일 발생</p>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. 입사 1년 이상 (연차)</h3>
              <p className="text-gray-700 mb-3">
                1년간 <strong>80% 이상 출근</strong>한 근로자에게 15일의 유급휴가가 발생합니다.
                이후 2년마다 1일씩 추가되어 최대 25일까지 늘어납니다.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-center">
                <p className="font-bold text-green-900 text-lg">
                  연차 일수 = 15일 + {'{'}(근속연수 - 1) ÷ 2{'}'}일 (최대 25일)
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left border-b">근속 연수</th>
                      <th className="px-4 py-2 text-left border-b">연차 일수</th>
                      <th className="px-4 py-2 text-left border-b">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['1년', '15일', '기본'],
                      ['2년', '15일', ''],
                      ['3년', '16일', '+1일'],
                      ['5년', '17일', '+1일'],
                      ['7년', '18일', '+1일'],
                      ['9년', '19일', '+1일'],
                      ['11년', '20일', '+1일'],
                      ['13년', '21일', '+1일'],
                      ['15년', '22일', '+1일'],
                      ['17년', '23일', '+1일'],
                      ['19년', '24일', '+1일'],
                      ['21년+', '25일', '최대 상한'],
                    ].map(([years, days, note], i) => (
                      <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                        <td className="px-4 py-2 border-b">{years}</td>
                        <td className="px-4 py-2 border-b font-medium text-blue-700">{days}</td>
                        <td className="px-4 py-2 border-b text-gray-500 text-xs">{note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">3. 80% 출근율 계산 방법</h3>
              <p className="text-gray-700 mb-3">
                80% 출근율은 다음과 같이 계산합니다.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                <p className="font-semibold text-blue-900 text-center">
                  출근율 = 실제 출근일수 ÷ 소정 근로일수 × 100
                </p>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
                <li>소정 근로일수: 근로계약에서 정한 근무일 수</li>
                <li><strong>출근으로 인정:</strong> 연차휴가, 출산휴가, 육아휴직, 업무상 부상·질병 휴업</li>
                <li><strong>소정 근로일수에서 제외:</strong> 적법한 쟁의행위 기간, 육아휴직 기간</li>
                <li>무단결근, 개인 사정 결근은 출근으로 인정 안 됨</li>
              </ul>
            </div>
          </Card>

          {/* 연차수당 계산 */}
          <Card title="연차수당 계산법" className="mt-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                연차수당은 미사용 연차에 대해 지급하는 금전적 보상입니다.
                <strong>통상임금</strong>을 기준으로 계산합니다.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
                <p className="font-bold text-green-900 text-xl mb-2">연차수당 계산 공식</p>
                <p className="text-green-800 text-lg">
                  연차수당 = 1일 통상임금 × 미사용 연차 일수
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">1일 통상임금 계산</h3>
              <p className="text-gray-700 mb-3">
                월급제의 경우 1일 통상임금은 다음과 같이 계산합니다.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-center text-gray-700">
                  1일 통상임금 = 월 통상임금 ÷ (월 소정 근로시간 ÷ 8시간)
                </p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  또는: 월 통상임금 × 12 ÷ (연간 소정 근로일수)
                </p>
              </div>
              <p className="text-gray-700 mb-4 text-sm">
                주 5일, 하루 8시간 근무 기준으로 월 소정 근로시간은 <strong>209시간</strong>이며,
                1일 통상임금 = 월 통상임금 ÷ 209 × 8로 계산할 수 있습니다.
              </p>
            </div>
          </Card>

          {/* 계산 예시 */}
          <Card title="연차수당 계산 예시" className="mt-6">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">예시 1: 월급 300만 원, 미사용 연차 5일</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">월 통상임금</span>
                    <span className="font-medium">3,000,000원</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">시간당 통상임금</span>
                    <span className="font-medium">14,354원 (3,000,000 ÷ 209)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">1일 통상임금 (8시간)</span>
                    <span className="font-medium">114,833원 (14,354 × 8)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">미사용 연차</span>
                    <span className="font-medium">5일</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-blue-700 text-base">
                    <span>연차수당 합계</span>
                    <span>574,165원 (114,833 × 5)</span>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">예시 2: 최저임금(10,320원), 미사용 연차 10일</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-3">2026년 최저임금 10,320원 적용</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">시간당 통상임금 (최저임금)</span>
                    <span className="font-medium">10,320원</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">1일 통상임금 (8시간)</span>
                    <span className="font-medium">82,560원 (10,320 × 8)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">미사용 연차</span>
                    <span className="font-medium">10일</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-blue-700 text-base">
                    <span>연차수당 합계</span>
                    <span>825,600원 (82,560 × 10)</span>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">예시 3: 입사 1년 미만, 미사용 월차 3개</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-3">월급 250만 원, 11개월 근무 중 8개 사용, 3개 미사용</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">1일 통상임금</span>
                    <span className="font-medium">95,694원 (2,500,000 ÷ 209 × 8)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">미사용 월차</span>
                    <span className="font-medium">3일</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-blue-700 text-base">
                    <span>연차수당 합계</span>
                    <span>287,082원 (95,694 × 3)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 미사용 연차 처리 */}
          <Card title="미사용 연차 처리 방법" className="mt-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                연차는 발생일로부터 <strong>1년 내에</strong> 사용해야 합니다.
                사용하지 못한 연차는 소멸되지만, 사업주에게 수당 지급 의무가 생깁니다.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">연차 소멸과 연차수당</h3>
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-900 mb-2">연차 소멸 시기</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 발생일로부터 1년 경과 시</li>
                    <li>• 미사용 연차는 소멸</li>
                    <li>• 단, 수당 청구권은 3년간 유지</li>
                  </ul>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-green-900 mb-2">수당 지급 의무</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• 사업주가 사용 촉진을 하지 않은 경우</li>
                    <li>• 미사용 연차에 대해 수당 지급</li>
                    <li>• 퇴직 시에도 미사용분 지급</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">연차 사용 촉진 제도</h3>
              <p className="text-gray-700 mb-3">
                사업주가 법정 절차에 따라 연차 사용을 촉진한 경우, 근로자가 미사용해도 수당을 지급하지 않아도 됩니다.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-sm">
                <p className="font-medium text-gray-700 mb-2">사용 촉진 절차 (2단계)</p>
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold text-xs">1단계</span>
                    <div>
                      <p className="font-medium">연차 사용 시기 지정 요청</p>
                      <p className="text-gray-500">연차 소멸 6개월 전까지, 사용 시기를 서면으로 알림</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold text-xs">2단계</span>
                    <div>
                      <p className="font-medium">사업주의 시기 지정</p>
                      <p className="text-gray-500">근로자가 시기를 정하지 않으면, 사업주가 소멸 2개월 전까지 서면으로 시기 지정</p>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">퇴직 시 미사용 연차</h3>
              <p className="text-gray-700 mb-2">
                퇴직할 때 남은 연차는 모두 수당으로 정산됩니다. 퇴직일 이전에 사용하지 못한 연차는
                퇴직금과 함께 지급됩니다.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg text-sm">
                <p className="text-yellow-800">
                  퇴직 시 연차수당은 퇴직일로부터 14일 이내에 지급해야 합니다 (당사자 합의로 연장 가능).
                </p>
              </div>
            </div>
          </Card>

          {/* 자주 묻는 질문 */}
          <Card title="자주 묻는 질문 (FAQ)" className="mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Q. 입사 첫 해에도 연차를 쓸 수 있나요?</h3>
                <p className="text-gray-700 mt-1 text-sm">
                  A. 네. 입사 1년 미만 근로자는 매월 개근 시 1일씩 월차(유급휴가)가 발생합니다.
                  1년 미만 기간에 발생한 월차는 2년째부터 주어지는 15일 연차에서 차감되지 않습니다 (2020년 개정).
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Q. 반차(반일 연차)는 어떻게 계산하나요?</h3>
                <p className="text-gray-700 mt-1 text-sm">
                  A. 반차는 연차 0.5일로 처리됩니다. 법적으로 반차제도가 강제되지는 않지만,
                  대부분의 회사에서 취업규칙으로 허용하고 있습니다.
                  반차 사용 시 연차수당은 0.5일분의 통상임금이 지급됩니다.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Q. 육아휴직 기간에도 연차가 발생하나요?</h3>
                <p className="text-gray-700 mt-1 text-sm">
                  A. 육아휴직 기간은 출근한 것으로 간주됩니다. 따라서 육아휴직 후 복직 시에도
                  80% 출근율에 영향을 받지 않고 연차가 발생합니다.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Q. 연차수당을 미리 포기(사전 합의)할 수 있나요?</h3>
                <p className="text-gray-700 mt-1 text-sm">
                  A. 사전에 연차수당을 포기하는 합의는 무효입니다. 연차는 근로기준법이 보장하는 권리로,
                  근로자에게 불리한 합의는 법적 효력이 없습니다. 미사용 연차에 대한 수당은 발생 시점에 청구할 수 있습니다.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Q. 연차수당 청구 시효는 얼마나 되나요?</h3>
                <p className="text-gray-700 mt-1 text-sm">
                  A. 연차수당 청구권의 소멸시효는 <strong>3년</strong>입니다. 수당 지급 사유가 발생한 날(연차 소멸일 또는 퇴직일)부터
                  3년 이내에 청구해야 합니다.
                </p>
              </div>
            </div>
          </Card>

          <AdBanner slot="7890123456" className="my-6" />

          {/* 관련 링크 */}
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <h3 className="font-semibold text-blue-900 mb-2">관련 가이드 및 계산기</h3>
            <div className="flex flex-wrap gap-4">
              <Link to="/calculator" className="text-sm text-blue-600 hover:text-blue-700 font-medium">급여 계산기 →</Link>
              <Link to="/guide/severance" className="text-sm text-blue-600 hover:text-blue-700 font-medium">퇴직금 계산 가이드 →</Link>
              <Link to="/guide/weekly-holiday" className="text-sm text-blue-600 hover:text-blue-700 font-medium">주휴수당 가이드 →</Link>
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

export default AnnualLeaveGuide;
