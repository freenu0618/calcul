/**
 * 소득세 가이드 페이지
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import PageHelmet from '../../components/common/PageHelmet';

// GA 타입 선언
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
}

const TaxGuide = () => {
  // GA4 이벤트 전송
  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'guide_view', {
        event_category: 'engagement',
        event_label: '소득세 계산법',
        page_path: '/guide/tax',
      });
    }
  }, []);

  return (
    <>
    <PageHelmet
      title="소득세 계산법 | 간이세액표 활용 가이드"
      description="근로소득세 간이세액표와 부양가족 공제를 활용한 소득세 계산 방법. 2026년 세율, 원천징수 방법을 상세히 안내합니다."
      path="/guide/tax"
    />
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <Link to="/guide" className="hover:text-blue-600">가이드</Link>
            <span className="mx-2">/</span>
            <span>소득세 계산법</span>
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            소득세 계산법
          </h1>
          <p className="text-lg text-gray-600">
            근로소득세 간이세액표와 부양가족 공제를 활용한 소득세 계산 방법을 알아봅니다.
          </p>
        </div>

        <Card title="근로소득세란?">
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              근로소득세는 근로자가 근로 제공의 대가로 받는 소득에 대해 부과되는 세금입니다.
              매월 급여에서 원천징수되며, 연말정산을 통해 정산됩니다.
            </p>
          </div>
        </Card>

        <Card title="간이세액표" className="mt-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">간이세액표란?</h3>
            <p className="text-gray-700 mb-4">
              간이세액표는 매월 급여에서 원천징수할 소득세를 간편하게 계산하기 위한 표입니다.
              월 급여액과 부양가족 수에 따라 세액이 결정됩니다.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">소득세율 구조 (2026년)</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">과세표준</th>
                    <th className="text-right py-2">세율</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">1,400만원 이하</td>
                    <td className="text-right">6%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">1,400만원 초과 ~ 5,000만원 이하</td>
                    <td className="text-right">15%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">5,000만원 초과 ~ 8,800만원 이하</td>
                    <td className="text-right">24%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">8,800만원 초과 ~ 1억 5천만원 이하</td>
                    <td className="text-right">35%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">1억 5천만원 초과 ~ 3억원 이하</td>
                    <td className="text-right">38%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">3억원 초과 ~ 5억원 이하</td>
                    <td className="text-right">40%</td>
                  </tr>
                  <tr>
                    <td className="py-2">5억원 초과 ~ 10억원 이하</td>
                    <td className="text-right">42%</td>
                  </tr>
                  <tr>
                    <td className="py-2">10억원 초과</td>
                    <td className="text-right">45%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <Card title="부양가족 공제" className="mt-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">부양가족이란?</h3>
            <p className="text-gray-700 mb-4">
              부양가족은 근로자가 생계를 책임지는 가족으로, 소득세 계산 시 공제 대상이 됩니다.
              부양가족이 많을수록 소득세가 줄어듭니다.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">부양가족 요건</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>배우자:</strong> 연간 소득 100만원 이하</li>
              <li><strong>직계존속 (부모, 조부모):</strong> 만 60세 이상, 연간 소득 100만원 이하</li>
              <li><strong>직계비속 (자녀, 손자녀):</strong> 만 20세 이하, 연간 소득 100만원 이하</li>
              <li><strong>형제자매:</strong> 만 20세 이하 또는 만 60세 이상, 연간 소득 100만원 이하</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">20세 이하 자녀 추가 공제</h3>
            <p className="text-gray-700 mb-4">
              20세 이하 자녀가 있는 경우 추가 세액공제가 적용되어 소득세가 더 감소합니다.
              자녀 1명당 월 12,500원의 세액공제를 받을 수 있습니다.
            </p>
          </div>
        </Card>

        <Card title="지방소득세" className="mt-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              지방소득세는 소득세의 <strong>10%</strong>로 계산됩니다.
              소득세와 함께 원천징수되어 급여에서 공제됩니다.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <code className="text-sm block">
                지방소득세 = 소득세 × 10%
              </code>
            </div>
          </div>
        </Card>

        <Card title="소득세 계산 예시" className="mt-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              월 급여 300만원, 부양가족 1명 (본인만)
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <ul className="space-y-2 text-sm">
                <li>과세 대상 금액: 3,000,000원 - 4대 보험료 283,816원 = 2,716,184원</li>
                <li>간이세액표 적용: 소득세 약 40,000원</li>
                <li>지방소득세: 40,000원 × 10% = 4,000원</li>
                <li><strong>총 세금: 44,000원</strong></li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              월 급여 300만원, 부양가족 3명 (배우자, 자녀 2명)
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="space-y-2 text-sm">
                <li>과세 대상 금액: 2,716,184원 (동일)</li>
                <li>간이세액표 적용 (부양가족 3명): 소득세 약 10,000원</li>
                <li>20세 이하 자녀 공제: 12,500원 × 2명 = 25,000원 감면</li>
                <li>실제 소득세: 0원 (최소 0원)</li>
                <li>지방소득세: 0원</li>
                <li><strong>총 세금: 0원</strong></li>
              </ul>
            </div>
            <p className="text-gray-700 mt-4">
              부양가족이 많을수록 세금 부담이 크게 줄어듭니다.
            </p>
          </div>
        </Card>

        <Card title="연말정산" className="mt-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">연말정산이란?</h3>
            <p className="text-gray-700 mb-4">
              연말정산은 한 해 동안 원천징수된 소득세를 정산하는 절차입니다.
              매월 간이세액표로 징수한 세금과 실제 납부해야 할 세금을 비교하여 차액을 환급하거나 추가 징수합니다.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">주요 공제 항목</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>근로소득공제:</strong> 총 급여액에 따라 자동 적용</li>
              <li><strong>인적공제:</strong> 본인, 배우자, 부양가족 1인당 150만원</li>
              <li><strong>특별세액공제:</strong> 보험료, 의료비, 교육비, 주택자금 등</li>
              <li><strong>신용카드 등 사용액 공제:</strong> 총 급여의 25% 초과분</li>
              <li><strong>주택 관련 공제:</strong> 월세, 주택담보대출 이자 등</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">연말정산 시기</h3>
            <p className="text-gray-700 mb-4">
              매년 1월에 전년도 소득에 대해 연말정산을 진행하며, 2월 급여에 환급 또는 추가 징수가 반영됩니다.
            </p>
          </div>
        </Card>

        <Card title="자주 묻는 질문" className="mt-6">
          <div className="prose max-w-none">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Q. 왜 매월 세금을 내는데 연말정산을 해야 하나요?
                </h4>
                <p className="text-gray-700">
                  A. 매월 원천징수되는 세금은 간이세액표를 기반으로 한 '예상 세금'입니다.
                  연말정산을 통해 실제 소득과 공제 항목을 반영하여 정확한 세금을 계산하고 정산합니다.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Q. 연말정산에서 환급을 많이 받으려면?
                </h4>
                <p className="text-gray-700">
                  A. 신용카드 사용, 의료비 지출, 교육비, 기부금 등 공제 가능한 항목을 적극 활용하세요.
                  특히 신용카드는 총 급여의 25% 이상 사용해야 공제가 시작됩니다.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Q. 부양가족을 잘못 신고하면 어떻게 되나요?
                </h4>
                <p className="text-gray-700">
                  A. 부양가족 요건을 충족하지 않는데 공제를 받은 경우, 연말정산에서 추가 세금을 납부해야 하며,
                  고의적인 경우 가산세가 부과될 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">관련 가이드</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/guide/insurance" className="text-blue-600 hover:text-blue-700">
                🏥 4대 보험 이해하기
              </Link>
            </li>
            <li>
              <Link to="/guide/overtime" className="text-blue-600 hover:text-blue-700">
                ⏰ 연장·야간·휴일 수당
              </Link>
            </li>
            <li>
              <Link to="/" className="text-blue-600 hover:text-blue-700">
                🧮 급여 계산기로 돌아가기
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </MainLayout>
    </>
  );
};

export default TaxGuide;
