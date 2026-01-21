/**
 * 교대근무 근로자 계산 사례
 */

import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';

const ShiftWorkExample = () => {
  return (
    <MainLayout>
      <Helmet>
        <title>교대근무 근로자 급여 계산 사례 (3교대) | 급여계산기</title>
        <meta name="description" content="야간근무를 포함한 3교대 근로자의 연장·야간·휴일 수당 계산 사례. 복합 가산수당 계산 방법을 확인하세요." />
        <meta name="keywords" content="교대근무 급여, 야간수당, 휴일근로, 3교대, 가산수당 계산" />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* 브레드크럼 */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">홈</Link>
          <span className="mx-2">/</span>
          <Link to="/examples" className="hover:text-blue-600">계산 사례</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">교대근무 근로자</span>
        </nav>

        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">🌙</span>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">교대근무 근로자 급여 계산 사례</h1>
              <p className="text-lg text-gray-600 mt-2">3교대 근무로 야간·휴일 근로를 포함한 제조업 근로자</p>
            </div>
          </div>
        </div>

        {/* 시나리오 */}
        <Card title="📋 근로자 프로필">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">업종</span>
                <p className="font-semibold text-gray-900">제조업 (생산직)</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">사업장 규모</span>
                <p className="font-semibold text-gray-900">50명 (5인 이상)</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">근무 형태</span>
                <p className="font-semibold text-gray-900">3교대 (주간/야간 교대)</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">월 기본급</span>
                <p className="font-semibold text-blue-600">3,000,000원</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">부양가족</span>
                <p className="font-semibold text-gray-900">2명 (배우자 + 자녀 1명)</p>
              </div>
            </div>
          </div>
        </Card>

        {/* 교대 스케줄 */}
        <Card title="📅 한 달 근무 스케줄 (샘플)">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="border rounded p-3 bg-yellow-50">
                <h5 className="font-semibold text-gray-900 mb-2">주간조 (Day)</h5>
                <p className="text-gray-700">08:00 ~ 16:00 (8시간)</p>
                <p className="text-gray-600">휴게 1시간 포함</p>
              </div>
              <div className="border rounded p-3 bg-blue-50">
                <h5 className="font-semibold text-gray-900 mb-2">야간조 (Night)</h5>
                <p className="text-gray-700">22:00 ~ 06:00 (8시간)</p>
                <p className="text-gray-600">휴게 1시간 포함</p>
              </div>
              <div className="border rounded p-3 bg-gray-50">
                <h5 className="font-semibold text-gray-900 mb-2">비번 (Off)</h5>
                <p className="text-gray-700">휴무</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h5 className="font-semibold text-gray-900 mb-2">월간 근무 현황</h5>
              <ul className="space-y-1 text-gray-700">
                <li>• 주간조: 10일 (80시간)</li>
                <li>• 야간조: 10일 (80시간 중 야간 70시간)</li>
                <li>• 일요일 특근: 1일 (8시간)</li>
                <li>• 총 근로시간: 168시간</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 입력 데이터 */}
        <Card title="💰 급여 구성 요소">
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">기본급</h4>
              <p className="text-2xl font-bold text-blue-600">3,000,000원</p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">통상시급 계산</h4>
              <p className="text-gray-700">3,000,000원 ÷ 174시간 = <span className="font-bold text-green-600">17,241원</span></p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">이번 달 가산수당</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• 야간근로 (70시간 × 0.5배): 603,935원</li>
                <li>• 휴일근로 (8시간 × 1.5배): 206,892원</li>
              </ul>
              <p className="text-xl font-bold text-purple-600 mt-2">810,827원</p>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-semibold text-gray-900 mb-2">총 지급액 (세전)</h4>
              <p className="text-3xl font-bold text-gray-900">3,810,827원</p>
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
                <h4 className="font-semibold text-gray-900">야간수당 계산 (가산분만)</h4>
              </div>
              <div className="pl-10 space-y-2">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="font-mono text-sm">야간 시간: 22:00 ~ 06:00 (8시간 중 7시간이 야간)</p>
                  <p className="font-mono text-sm">야간조 10일 × 7시간 = 70시간</p>
                  <p className="font-mono text-sm mt-2">야간수당 = 통상시급 × 0.5 × 야간시간</p>
                  <p className="font-mono text-sm">= 17,241원 × 0.5 × 70시간</p>
                  <p className="font-bold text-blue-600 text-lg mt-2">= 603,935원</p>
                </div>
                <p className="text-sm text-gray-600">💡 야간수당은 가산분(0.5배)만 추가 지급됩니다. 기본 시급은 별도입니다.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full">2</span>
                <h4 className="font-semibold text-gray-900">휴일근로수당 계산</h4>
              </div>
              <div className="pl-10 space-y-2">
                <div className="bg-green-50 p-3 rounded">
                  <p className="font-mono text-sm">일요일 특근: 8시간</p>
                  <p className="font-mono text-sm">휴일수당 = 통상시급 × 1.5 × 근로시간</p>
                  <p className="font-mono text-sm">= 17,241원 × 1.5 × 8시간</p>
                  <p className="font-bold text-green-600 text-lg mt-2">= 206,892원</p>
                </div>
                <p className="text-sm text-gray-600">💡 5인 이상 사업장에서 휴일근로 8시간 초과 시 2.0배가 적용됩니다.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full">3</span>
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
                      <td className="px-4 py-2 text-right font-mono">3,810,827 × 4.5%</td>
                      <td className="px-4 py-2 text-right font-semibold">171,487원</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">건강보험</td>
                      <td className="px-4 py-2 text-right">3.545%</td>
                      <td className="px-4 py-2 text-right font-mono">3,810,827 × 3.545%</td>
                      <td className="px-4 py-2 text-right font-semibold">135,104원</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">장기요양보험</td>
                      <td className="px-4 py-2 text-right">12.95%</td>
                      <td className="px-4 py-2 text-right font-mono">135,104 × 12.95%</td>
                      <td className="px-4 py-2 text-right font-semibold">17,496원</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">고용보험</td>
                      <td className="px-4 py-2 text-right">0.9%</td>
                      <td className="px-4 py-2 text-right font-mono">3,810,827 × 0.9%</td>
                      <td className="px-4 py-2 text-right font-semibold">34,297원</td>
                    </tr>
                    <tr className="bg-blue-50 font-bold">
                      <td colSpan={3} className="px-4 py-2">합계</td>
                      <td className="px-4 py-2 text-right text-blue-600">358,384원</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step 4 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full">4</span>
                <h4 className="font-semibold text-gray-900">소득세 계산</h4>
              </div>
              <div className="pl-10 space-y-2">
                <p className="text-gray-700">
                  과세표준 = 3,810,827원 (부양가족 2명)
                </p>
                <div className="bg-green-50 p-3 rounded">
                  <p className="font-mono text-sm">소득세 (부양가족 2명 기준): 110,500원</p>
                  <p className="font-mono text-sm">지방소득세 (소득세의 10%): 11,050원</p>
                  <p className="font-bold text-green-600 text-lg mt-2">합계: 121,550원</p>
                </div>
                <p className="text-sm text-gray-600">💡 간이세액표 적용 (부양가족 2명)</p>
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
                  <span className="font-semibold">3,000,000원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>야간수당 (70시간 × 0.5배)</span>
                  <span className="font-semibold">603,935원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>휴일근로수당 (8시간 × 1.5배)</span>
                  <span className="font-semibold">206,892원</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>총 지급액</span>
                  <span className="text-blue-600">3,810,827원</span>
                </div>
              </div>
            </div>

            {/* 공제 내역 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">공제 내역</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>국민연금</span>
                  <span className="font-semibold">171,487원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>건강보험</span>
                  <span className="font-semibold">135,104원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>장기요양보험</span>
                  <span className="font-semibold">17,496원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>고용보험</span>
                  <span className="font-semibold">34,297원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>소득세</span>
                  <span className="font-semibold">110,500원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>지방소득세</span>
                  <span className="font-semibold">11,050원</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>총 공제액</span>
                  <span className="text-red-600">479,934원</span>
                </div>
              </div>
            </div>

            {/* 실수령액 */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">실수령액</span>
                <span className="text-4xl font-bold text-blue-600">3,330,893원</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                공제율: 12.6% (총 지급액 대비)
              </p>
            </div>
          </div>
        </Card>

        {/* 가산수당 중복 적용 */}
        <Card title="🔄 가산수당 중복 적용 사례">
          <div className="space-y-4">
            <p className="text-gray-700">
              야간근로와 휴일근로가 동시에 발생하면 가산율이 <strong>중복 적용</strong>됩니다.
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h5 className="font-semibold text-gray-900 mb-2">예시: 일요일 야간 근무 (22:00 ~ 06:00, 8시간)</h5>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">1. 기본 시급: 17,241원 × 8시간 = 137,928원</p>
                <p className="text-gray-700">2. 휴일 가산 (1.5배): 17,241원 × 1.5 × 8시간 = 206,892원</p>
                <p className="text-gray-700">3. 야간 가산 (0.5배): 17,241원 × 0.5 × 7시간 = 60,343원</p>
                <p className="font-bold text-gray-900">총 급여: 137,928 + 206,892 + 60,343 = <span className="text-blue-600">405,163원</span></p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              💡 휴일근로와 야간근로가 중복되면 통상시급의 <strong>3배</strong> (1.0 + 1.5 + 0.5)를 받을 수 있습니다.
            </p>
          </div>
        </Card>

        {/* 주의사항 */}
        <Card title="⚠️ 주의사항 및 법적 포인트">
          <div className="prose max-w-none">
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>야간수당 계산</strong>: 22:00~06:00 구간만 가산 (0.5배 추가)</li>
              <li>• <strong>휴일근로 8시간 초과</strong>: 5인 이상 사업장만 2.0배 적용 (5인 미만은 1.5배)</li>
              <li>• <strong>가산수당 중복</strong>: 야간 + 휴일 동시 발생 시 가산율 중복 적용 ✅</li>
              <li>• <strong>주 52시간 제한</strong>: 연장근로는 주 12시간까지만 가능 (기본 40시간 + 연장 12시간)</li>
              <li>• <strong>교대제 근무</strong>: 통상임금에 교대제 수당이 포함되어 있는지 확인 필요</li>
              <li>• <strong>보건 조치</strong>: 야간근로자에게 건강진단 실시 의무 (연 1회)</li>
            </ul>
          </div>
        </Card>

        {/* 자주 하는 질문 */}
        <Card title="💬 자주 하는 질문">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Q: 야간수당은 왜 0.5배인가요?</h4>
              <p className="text-gray-700">
                A: 야간근로에 대한 기본 시급은 이미 지급되고, 야간 가산분(0.5배)만 추가로 지급됩니다. 따라서 야간근로 시 총 1.5배의 임금을 받게 됩니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Q: 일요일 야간 근무 시 가산율은?</h4>
              <p className="text-gray-700">
                A: 휴일 가산(1.5배) + 야간 가산(0.5배) = 총 3배 (기본 1.0 + 1.5 + 0.5)를 받습니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Q: 교대근무 수당은 별도인가요?</h4>
              <p className="text-gray-700">
                A: 교대근무 수당은 회사 내규에 따라 다릅니다. 통상임금에 포함되어 있거나 별도로 지급될 수 있습니다.
              </p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-lg text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            복잡한 교대근무 급여도 쉽게 계산하세요
          </h3>
          <p className="text-gray-700 mb-6">
            야간·휴일 근로를 포함한 정확한 실수령액을 계산해드립니다.
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
            to="/examples/parttime"
            className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← 파트타임 사례
          </Link>
          <Link
            to="/examples"
            className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            사례 목록으로
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default ShiftWorkExample;
