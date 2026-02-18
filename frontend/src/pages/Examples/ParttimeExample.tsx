/**
 * 파트타임 근로자 계산 사례
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';

// GA 타입 선언
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
}

const ParttimeExample = () => {
  // GA4 이벤트 전송
  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'example_view', {
        event_category: 'engagement',
        event_label: '파트타임 근로자',
        page_path: '/examples/parttime',
      });
    }
  }, []);

  return (
    <MainLayout>
      <Helmet>
        <title>파트타임 근로자 급여 계산 사례 (주 3일) | 급여계산기</title>
        <meta name="description" content="시급 10,320원, 주 3일 근무하는 단시간 근로자의 실수령액 계산 사례. 주휴수당 비례 계산과 4대 보험 적용 기준을 확인하세요." />
        <meta name="keywords" content="파트타임 급여, 단시간 근로, 주휴수당, 시급 계산, 알바 실수령액" />
        <link rel="canonical" href="https://paytools.work/examples/parttime" />
        <meta property="og:title" content="파트타임 근로자 급여 계산 사례" />
        <meta property="og:description" content="시급 10,320원, 주 3일 근무하는 단시간 근로자의 실수령액 계산 사례." />
        <meta property="og:url" content="https://paytools.work/examples/parttime" />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* 브레드크럼 */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">홈</Link>
          <span className="mx-2">/</span>
          <Link to="/examples" className="hover:text-blue-600">계산 사례</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">파트타임 근로자</span>
        </nav>

        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">⏱️</span>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">파트타임 근로자 급여 계산 사례</h1>
              <p className="text-lg text-gray-600 mt-2">주 3일, 하루 5시간 근무하는 단시간 근로자</p>
            </div>
          </div>
        </div>

        {/* 시나리오 */}
        <Card title="📋 근로자 프로필">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">업종</span>
                <p className="font-semibold text-gray-900">카페 (서비스업)</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">사업장 규모</span>
                <p className="font-semibold text-gray-900">3명 (5인 미만)</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">근무 형태</span>
                <p className="font-semibold text-gray-900">주 3일 (월/수/금)</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">근무 시간</span>
                <p className="font-semibold text-gray-900">14:00 ~ 19:00 (5시간)</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">시급</span>
                <p className="font-semibold text-blue-600">10,320원 (2026 최저임금)</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">부양가족</span>
                <p className="font-semibold text-gray-900">0명 (본인만)</p>
              </div>
            </div>
          </div>
        </Card>

        {/* 입력 데이터 */}
        <Card title="💰 급여 구성 요소">
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">주 소정근로시간</h4>
              <p className="text-gray-700">주 3일 × 5시간 = <span className="font-bold text-blue-600">15시간</span></p>
              <p className="text-sm text-gray-600 mt-1">💡 주 15시간 이상이므로 주휴수당 및 4대 보험 의무 가입 대상</p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">월 기본 급여 (4.345주 기준)</h4>
              <div className="space-y-1 text-gray-700">
                <p>시급 10,320원 × 15시간/주 × 4.345주</p>
                <p className="text-xl font-bold text-green-600">= 672,606원</p>
              </div>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">주휴수당 (비례 계산)</h4>
              <div className="space-y-1 text-gray-700">
                <p>주휴수당 = (15시간 ÷ 40시간) × 8시간 × 10,320원</p>
                <p>= 0.375 × 8 × 10,320원 = 30,960원/주</p>
                <p className="text-xl font-bold text-purple-600">= 134,521원/월</p>
              </div>
              <p className="text-sm text-gray-600 mt-2">💡 주 15시간 근무는 주 40시간의 37.5%이므로 주휴수당도 37.5%만 받습니다</p>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-semibold text-gray-900 mb-2">총 지급액 (세전)</h4>
              <p className="text-3xl font-bold text-gray-900">807,127원</p>
            </div>
          </div>
        </Card>

        {/* 계산 과정 */}
        <Card title="🧮 단계별 계산 과정">
          <div className="space-y-6">
            {/* Step 1 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full">1</span>
                <h4 className="font-semibold text-gray-900">주휴수당 비례 계산</h4>
              </div>
              <div className="pl-10 space-y-2">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="font-mono text-sm">주 소정근로시간 비율 = 15시간 ÷ 40시간 = 0.375 (37.5%)</p>
                  <p className="font-mono text-sm">주휴수당 = 0.375 × 8시간 × 10,320원</p>
                  <p className="font-mono text-sm">= 3시간 × 10,320원 = 30,960원/주</p>
                  <p className="font-bold text-blue-600 text-lg mt-2">월 주휴수당 = 30,960 × 4.345 = 134,521원</p>
                </div>
                <p className="text-sm text-gray-600">💡 풀타임(주 40시간)은 주휴수당 8시간을 모두 받지만, 파트타임은 근무시간 비율만큼만 받습니다.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full">2</span>
                <h4 className="font-semibold text-gray-900">4대 보험료 계산</h4>
              </div>
              <div className="pl-10">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">보험</th>
                      <th className="px-4 py-2 text-right">요율</th>
                      <th className="px-4 py-2 text-right">계산식</th>
                      <th className="px-4 py-2 text-right">근로자 부담</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-2">국민연금</td>
                      <td className="px-4 py-2 text-right">4.5%</td>
                      <td className="px-4 py-2 text-right font-mono">807,127 × 4.5%</td>
                      <td className="px-4 py-2 text-right font-semibold">36,321원</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">건강보험</td>
                      <td className="px-4 py-2 text-right">3.545%</td>
                      <td className="px-4 py-2 text-right font-mono">807,127 × 3.545%</td>
                      <td className="px-4 py-2 text-right font-semibold">28,613원</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">장기요양보험</td>
                      <td className="px-4 py-2 text-right">12.95%</td>
                      <td className="px-4 py-2 text-right font-mono">28,613 × 12.95%</td>
                      <td className="px-4 py-2 text-right font-semibold">3,705원</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">고용보험</td>
                      <td className="px-4 py-2 text-right">0.9%</td>
                      <td className="px-4 py-2 text-right font-mono">807,127 × 0.9%</td>
                      <td className="px-4 py-2 text-right font-semibold">7,264원</td>
                    </tr>
                    <tr className="bg-blue-50 font-bold">
                      <td colSpan={3} className="px-4 py-2">합계</td>
                      <td className="px-4 py-2 text-right text-blue-600">75,903원</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-sm text-gray-600 mt-2">💡 주 15시간 이상 근무자는 4대 보험 의무 가입 대상입니다.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full">3</span>
                <h4 className="font-semibold text-gray-900">소득세 계산</h4>
              </div>
              <div className="pl-10 space-y-2">
                <p className="text-gray-700">
                  과세표준 = 807,127원 (부양가족 0명)
                </p>
                <div className="bg-green-50 p-3 rounded">
                  <p className="font-mono text-sm">소득세: 6,850원</p>
                  <p className="font-mono text-sm">지방소득세 (소득세의 10%): 685원</p>
                  <p className="font-bold text-green-600 text-lg mt-2">합계: 7,535원</p>
                </div>
                <p className="text-sm text-gray-600">💡 간이세액표 적용 (부양가족 0명). 소득이 낮아 세금 부담이 적습니다.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* 최종 결과 */}
        <Card title="✅ 최종 급여 명세서">
          <div className="space-y-6">
            {/* 지급 내역 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">지급 내역</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>기본 급여 (주 15시간 × 4.345주)</span>
                  <span className="font-semibold">672,606원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>주휴수당 (비례)</span>
                  <span className="font-semibold">134,521원</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>총 지급액</span>
                  <span className="text-blue-600">807,127원</span>
                </div>
              </div>
            </div>

            {/* 공제 내역 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">공제 내역</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>국민연금</span>
                  <span className="font-semibold">36,321원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>건강보험</span>
                  <span className="font-semibold">28,613원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>장기요양보험</span>
                  <span className="font-semibold">3,705원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>고용보험</span>
                  <span className="font-semibold">7,264원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>소득세</span>
                  <span className="font-semibold">6,850원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>지방소득세</span>
                  <span className="font-semibold">685원</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>총 공제액</span>
                  <span className="text-red-600">83,438원</span>
                </div>
              </div>
            </div>

            {/* 실수령액 */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">실수령액</span>
                <span className="text-4xl font-bold text-blue-600">723,689원</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                공제율: 10.4% (총 지급액 대비)
              </p>
            </div>
          </div>
        </Card>

        {/* 주의사항 */}
        <Card title="⚠️ 주의사항 및 법적 포인트">
          <div className="prose max-w-none">
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>최저임금 충족</strong>: 시급 10,320원 = 2026 최저임금 ✅</li>
              <li>• <strong>주휴수당 비례 적용</strong>: 주 15시간 근무 시 37.5% 지급 (법정 의무)</li>
              <li>• <strong>4대 보험 가입</strong>: 주 15시간 이상 근무 시 의무 가입 대상</li>
              <li>• <strong>주 14시간 이하</strong>: 주휴수당 및 4대 보험 의무 없음</li>
              <li>• <strong>개근 필수</strong>: 소정근로일(월/수/금)에 모두 출근해야 주휴수당 지급</li>
              <li>• <strong>5인 미만 사업장</strong>: 연차휴가는 1년 근무 후부터 발생 (5인 이상은 즉시)</li>
            </ul>
          </div>
        </Card>

        {/* 풀타임 vs 파트타임 비교 */}
        <Card title="📊 풀타임 vs 파트타임 비교">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">구분</th>
                  <th className="px-4 py-2 text-right">풀타임 (주 40시간)</th>
                  <th className="px-4 py-2 text-right">파트타임 (주 15시간)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-2">기본 급여</td>
                  <td className="px-4 py-2 text-right">2,500,000원</td>
                  <td className="px-4 py-2 text-right">672,606원</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">주휴수당</td>
                  <td className="px-4 py-2 text-right">포함 (8시간)</td>
                  <td className="px-4 py-2 text-right">134,521원 (3시간)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">4대 보험</td>
                  <td className="px-4 py-2 text-right">의무</td>
                  <td className="px-4 py-2 text-right">의무 (주 15시간 이상)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">연차휴가</td>
                  <td className="px-4 py-2 text-right">즉시 발생 (비례)</td>
                  <td className="px-4 py-2 text-right">1년 후 (5인 미만)</td>
                </tr>
                <tr className="bg-blue-50 font-bold">
                  <td className="px-4 py-2">실수령액</td>
                  <td className="px-4 py-2 text-right text-blue-600">약 2,380,000원</td>
                  <td className="px-4 py-2 text-right text-blue-600">723,689원</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* 자주 하는 질문 */}
        <Card title="💬 자주 하는 질문">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Q: 주 14시간 근무하면 주휴수당을 못 받나요?</h4>
              <p className="text-gray-700">
                A: 네, 주 15시간 미만 근무 시 주휴수당 지급 의무가 없습니다. 4대 보험도 가입 의무가 없습니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Q: 하루 결근하면 주휴수당을 못 받나요?</h4>
              <p className="text-gray-700">
                A: 네, 소정근로일(월/수/금)에 모두 출근해야 주휴수당을 받을 수 있습니다. 단, 연차휴가 사용은 개근으로 인정됩니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Q: 파트타임도 연차휴가가 있나요?</h4>
              <p className="text-gray-700">
                A: 네, 주 15시간 이상 근무하면 연차휴가가 발생합니다. 단, 5인 미만 사업장은 1년 근무 후부터 발생합니다.
              </p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-lg text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            내 급여도 직접 계산해보세요
          </h3>
          <p className="text-gray-700 mb-6">
            시급과 근무시간을 입력하면 정확한 실수령액을 알 수 있습니다.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            급여 계산기 사용하기 →
          </Link>
        </div>

        {/* 관련 링크 */}
        <div className="mt-8 flex gap-4">
          <Link
            to="/examples/fulltime"
            className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← 풀타임 사례
          </Link>
          <Link
            to="/examples/shift-work"
            className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            교대근무 사례 →
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default ParttimeExample;
