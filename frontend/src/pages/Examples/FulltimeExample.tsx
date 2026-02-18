/**
 * 풀타임 근로자 계산 사례
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

const FulltimeExample = () => {
  // GA4 이벤트 전송
  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'example_view', {
        event_category: 'engagement',
        event_label: '풀타임 근로자',
        page_path: '/examples/fulltime',
      });
    }
  }, []);

  return (
    <MainLayout>
      <Helmet>
        <title>풀타임 근로자 급여 계산 사례 (주 5일) | 급여계산기</title>
        <meta name="description" content="월급 250만원, 주 5일 근무하는 정규직 근로자의 실수령액 계산 사례. 4대 보험, 소득세, 주휴수당을 포함한 상세한 급여 계산 방법을 확인하세요." />
        <meta name="keywords" content="풀타임 급여, 정규직 실수령액, 월급 계산, 주 5일 근무, 4대 보험" />
        <link rel="canonical" href="https://paytools.work/examples/fulltime" />
        <meta property="og:title" content="풀타임 근로자 급여 계산 사례" />
        <meta property="og:description" content="월급 250만원, 주 5일 근무하는 정규직 근로자의 실수령액 계산 사례." />
        <meta property="og:url" content="https://paytools.work/examples/fulltime" />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* 브레드크럼 */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">홈</Link>
          <span className="mx-2">/</span>
          <Link to="/examples" className="hover:text-blue-600">계산 사례</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">풀타임 근로자</span>
        </nav>

        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">💼</span>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">풀타임 근로자 급여 계산 사례</h1>
              <p className="text-lg text-gray-600 mt-2">주 5일, 하루 8시간 근무하는 정규직 근로자</p>
            </div>
          </div>
        </div>

        {/* 시나리오 */}
        <Card title="📋 근로자 프로필">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">업종</span>
                <p className="font-semibold text-gray-900">제조업 (일반 사무직)</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">사업장 규모</span>
                <p className="font-semibold text-gray-900">30명 (5인 이상)</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">근무 형태</span>
                <p className="font-semibold text-gray-900">주 5일 (월~금)</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">근무 시간</span>
                <p className="font-semibold text-gray-900">09:00 ~ 18:00 (휴게 1시간)</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">월 기본급</span>
                <p className="font-semibold text-blue-600">2,500,000원</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">부양가족</span>
                <p className="font-semibold text-gray-900">1명 (배우자)</p>
              </div>
            </div>
          </div>
        </Card>

        {/* 입력 데이터 */}
        <Card title="💰 급여 구성 요소">
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">기본급</h4>
              <p className="text-2xl font-bold text-blue-600">2,500,000원</p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">고정 수당</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• 식대: 100,000원 (비과세, 20만원 이하)</li>
                <li>• 교통비: 100,000원 (비과세)</li>
              </ul>
              <p className="text-xl font-bold text-green-600 mt-2">200,000원</p>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-semibold text-gray-900 mb-2">총 지급액 (세전)</h4>
              <p className="text-3xl font-bold text-gray-900">2,700,000원</p>
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
                <h4 className="font-semibold text-gray-900">통상시급 계산</h4>
              </div>
              <div className="pl-10 space-y-2">
                <p className="text-gray-700">
                  통상시급 = 통상임금 ÷ 월 소정근로시간 (174시간)
                </p>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="font-mono text-sm">통상임금 = 기본급 + 고정수당 (비과세 제외)</p>
                  <p className="font-mono text-sm">= 2,500,000원 + 0원 = 2,500,000원</p>
                  <p className="font-mono text-sm mt-2">통상시급 = 2,500,000원 ÷ 174시간</p>
                  <p className="font-bold text-blue-600 text-lg mt-2">= 14,368원</p>
                </div>
                <p className="text-sm text-gray-600">💡 비과세 수당(식대, 교통비)은 통상임금에서 제외됩니다.</p>
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
                      <td className="px-4 py-2 text-right font-mono">2,700,000 × 4.5%</td>
                      <td className="px-4 py-2 text-right font-semibold">121,500원</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">건강보험</td>
                      <td className="px-4 py-2 text-right">3.545%</td>
                      <td className="px-4 py-2 text-right font-mono">2,700,000 × 3.545%</td>
                      <td className="px-4 py-2 text-right font-semibold">95,715원</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">장기요양보험</td>
                      <td className="px-4 py-2 text-right">12.95%</td>
                      <td className="px-4 py-2 text-right font-mono">95,715 × 12.95%</td>
                      <td className="px-4 py-2 text-right font-semibold">12,395원</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">고용보험</td>
                      <td className="px-4 py-2 text-right">0.9%</td>
                      <td className="px-4 py-2 text-right font-mono">2,700,000 × 0.9%</td>
                      <td className="px-4 py-2 text-right font-semibold">24,300원</td>
                    </tr>
                    <tr className="bg-blue-50 font-bold">
                      <td colSpan={3} className="px-4 py-2">합계</td>
                      <td className="px-4 py-2 text-right text-blue-600">253,910원</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-sm text-gray-600 mt-2">💡 4대 보험은 비과세 수당을 포함한 총 지급액 기준으로 계산됩니다.</p>
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
                  과세표준 = 총 지급액 - 비과세 수당 = 2,700,000 - 200,000 = 2,500,000원
                </p>
                <div className="bg-green-50 p-3 rounded">
                  <p className="font-mono text-sm">소득세 (부양가족 1명 기준): 56,660원</p>
                  <p className="font-mono text-sm">지방소득세 (소득세의 10%): 5,666원</p>
                  <p className="font-bold text-green-600 text-lg mt-2">합계: 62,326원</p>
                </div>
                <p className="text-sm text-gray-600">💡 간이세액표 적용 (부양가족 1명)</p>
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
                  <span>기본급</span>
                  <span className="font-semibold">2,500,000원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>식대 (비과세)</span>
                  <span className="font-semibold">100,000원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>교통비 (비과세)</span>
                  <span className="font-semibold">100,000원</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>총 지급액</span>
                  <span className="text-blue-600">2,700,000원</span>
                </div>
              </div>
            </div>

            {/* 공제 내역 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">공제 내역</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>국민연금</span>
                  <span className="font-semibold">121,500원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>건강보험</span>
                  <span className="font-semibold">95,715원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>장기요양보험</span>
                  <span className="font-semibold">12,395원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>고용보험</span>
                  <span className="font-semibold">24,300원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>소득세</span>
                  <span className="font-semibold">56,660원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>지방소득세</span>
                  <span className="font-semibold">5,666원</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>총 공제액</span>
                  <span className="text-red-600">316,236원</span>
                </div>
              </div>
            </div>

            {/* 실수령액 */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">실수령액</span>
                <span className="text-4xl font-bold text-blue-600">2,383,764원</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                공제율: 11.7% (총 지급액 대비)
              </p>
            </div>
          </div>
        </Card>

        {/* 주의사항 */}
        <Card title="⚠️ 주의사항">
          <div className="prose max-w-none">
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>최저임금 충족</strong>: 통상시급 14,368원 &gt; 최저임금 10,320원 ✅</li>
              <li>• <strong>주휴수당</strong>: 기본급에 이미 포함되어 있습니다 (월급제)</li>
              <li>• <strong>비과세 수당</strong>: 식대 20만원 이하, 자가운전보조금 20만원 이하는 소득세 비과세</li>
              <li>• <strong>연장근로</strong>: 주 40시간 초과 시 연장수당(1.5배) 별도 지급</li>
              <li>• <strong>부양가족 수</strong>: 부양가족이 많을수록 소득세가 감소합니다</li>
            </ul>
          </div>
        </Card>

        {/* 자주 하는 질문 */}
        <Card title="💬 자주 하는 질문">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Q: 월급 250만원이라고 했는데 실수령액이 다른가요?</h4>
              <p className="text-gray-700">
                A: 일반적으로 "월급 250만원"은 세전 금액을 의미합니다. 4대 보험과 소득세를 공제한 후의 실수령액은 약 215만원입니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Q: 비과세 수당은 왜 공제 대상에 포함되나요?</h4>
              <p className="text-gray-700">
                A: 비과세 수당은 소득세에서는 제외되지만, 4대 보험료는 비과세 수당을 포함한 총 지급액을 기준으로 계산됩니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Q: 주휴수당은 어디에 포함되어 있나요?</h4>
              <p className="text-gray-700">
                A: 월급제는 주휴수당이 기본급에 포함되어 있습니다. 시급제의 경우 별도로 지급됩니다.
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
            정확한 실수령액을 알고 싶다면 급여 계산기를 사용해보세요.
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
            to="/examples"
            className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← 사례 목록
          </Link>
          <Link
            to="/examples/parttime"
            className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            파트타임 사례 보기 →
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default FulltimeExample;
