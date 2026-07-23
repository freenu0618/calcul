/**
 * 연장·야간·휴일 수당 가이드 페이지
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import PageHelmet from '../../components/common/PageHelmet';
import AdBanner from '../../components/common/AdBanner';

// GA 타입 선언
declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void;
  }
}

const OvertimeGuide = () => {
  // GA4 이벤트 전송
  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'guide_view', {
        event_category: 'engagement',
        event_label: '연장·야간·휴일 수당',
        page_path: '/guide/overtime',
      });
    }
  }, []);

  return (
    <>
    <PageHelmet
      title="연장·야간·휴일 수당 계산법 | 5인 이상 가산수당 가이드"
      description="근로기준법 제56조 기준의 연장·야간·휴일 수당 계산 방법. 통상시급, 5인 이상 여부, 가산율 적용, 중복 가산을 안내합니다."
      path="/guide/overtime"
    />
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <Link to="/guide" className="hover:text-blue-600">가이드</Link>
            <span className="mx-2">/</span>
            <span>연장·야간·휴일 수당</span>
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            연장·야간·휴일 수당
          </h1>
          <p className="text-lg text-gray-600">
            근로기준법상 5인 이상 사업장 가산수당 계산 방법과 통상시급의 개념을 이해합니다.
          </p>
        </div>

        <Card title="통상시급이란?">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">개념</h3>
            <p className="text-gray-700 mb-4">
              통상시급은 모든 가산수당 계산의 기준이 되는 시급입니다.
              통상임금을 월 소정근로시간(174시간)으로 나누어 계산합니다.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <code className="text-sm block mb-2">
                통상시급 = 통상임금 ÷ 174시간
              </code>
              <code className="text-sm block">
                통상임금 = 기본급 + 고정 수당 (통상임금 산입 수당)
              </code>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">계산 예시</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="space-y-2 text-sm">
                <li>기본급: 2,500,000원</li>
                <li>직책수당 (고정): 200,000원</li>
                <li>통상임금: 2,500,000 + 200,000 = 2,700,000원</li>
                <li><strong>통상시급: 2,700,000 ÷ 174 = 15,517원</strong></li>
              </ul>
            </div>
          </div>
        </Card>

        <Card title="연장근로 수당" className="mt-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">연장근로란?</h3>
            <p className="text-gray-700 mb-4">
              연장근로는 법정 근로시간(주 40시간)을 초과하여 근무한 시간을 의미합니다.
              상시근로자 5인 이상 사업장의 법정 가산수당 기준에서는 통상시급의 <strong>1.5배</strong>를 지급합니다.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">계산 방법</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <code className="text-sm block">
                연장근로 수당 = 통상시급 × 1.5 × 연장근로시간
              </code>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">계산 예시</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <ul className="space-y-2 text-sm">
                <li>통상시급: 15,517원</li>
                <li>주 40시간 초과 근무: 10시간</li>
                <li>연장근로 수당: 15,517 × 1.5 × 10 = 232,755원</li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">주 52시간 제한</h3>
            <p className="text-gray-700 mb-4">
              근로기준법에 따라 1주 최대 근로시간은 52시간(법정 40시간 + 연장 12시간)입니다.
              이를 위반하면 사업주는 형사 처벌을 받을 수 있습니다.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>주의:</strong> 주 52시간 한도와 가산수당 적용 여부는 상시근로자 수, 업종,
                근로자 유형, 특례·예외 여부에 따라 달라질 수 있으므로 실제 분쟁 판단은 근무기록과 전문가 검토를 함께 확인하세요.
              </p>
            </div>
          </div>
        </Card>

        <Card title="야간근로 수당" className="mt-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">야간근로란?</h3>
            <p className="text-gray-700 mb-4">
              야간근로는 22:00부터 익일 06:00까지의 근무를 의미합니다.
              상시근로자 5인 이상 사업장의 법정 가산수당 기준에서는 통상시급의 <strong>0.5배 (50%)</strong>를 가산하여 지급합니다.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">계산 방법</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <code className="text-sm block">
                야간근로 수당 = 통상시급 × 0.5 × 야간근로시간
              </code>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">계산 예시</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <ul className="space-y-2 text-sm">
                <li>근무 시간: 21:00 ~ 06:00 (9시간)</li>
                <li>야간 구간 (22:00 ~ 06:00): 8시간</li>
                <li>통상시급: 15,517원</li>
                <li>기본 임금: 15,517 × 9시간 = 139,653원</li>
                <li>야간 가산 수당: 15,517 × 0.5 × 8시간 = 62,068원</li>
                <li><strong>총 지급액: 139,653 + 62,068 = 201,721원</strong></li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">중요 사항</h3>
            <p className="text-gray-700">
              야간근로 수당은 <strong>가산분만</strong> 지급하는 것이 아니라, 기본 임금 + 가산 수당을 합산하여 지급합니다.
              즉, 야간 시간대 근무 시 통상시급의 1.5배(기본 1.0 + 가산 0.5)를 받게 됩니다.
            </p>
          </div>
        </Card>

        <Card title="휴일근로 수당" className="mt-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">휴일근로란?</h3>
            <p className="text-gray-700 mb-4">
              휴일근로는 주휴일이나 법정 공휴일에 근무하는 것을 의미합니다.
              상시근로자 5인 이상 사업장의 법정 가산수당 기준에서는 근로기준법 제56조에 따라 가산 수당을 지급합니다.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">계산 방법</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <ul className="space-y-2 text-sm">
                <li><strong>8시간 이하:</strong> 통상시급 × 1.5</li>
                <li><strong>8시간 초과:</strong> 통상시급 × 2.0 (5인 이상 사업장만)</li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">계산 예시 (5인 이상 사업장)</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <ul className="space-y-2 text-sm">
                <li>일요일 근무: 10시간</li>
                <li>통상시급: 15,517원</li>
                <li>8시간 이하: 15,517 × 1.5 × 8 = 186,204원</li>
                <li>8시간 초과: 15,517 × 2.0 × 2 = 62,068원</li>
                <li><strong>총 휴일근로 수당: 248,272원</strong></li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">5인 미만 사업장</h3>
            <p className="text-gray-700 mb-4">
              상시근로자 5인 미만 사업장은 근로기준법 제56조의 연장·야간·휴일 가산수당 규정이 일반적으로 적용되지 않습니다.
              다만 실제 근로한 시간에 대한 기본 임금, 최저임금, 주휴수당, 근로계약이나 취업규칙으로 정한 약정 수당은 별도로 확인해야 합니다.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="space-y-2 text-sm">
                <li>일요일 근무: 10시간</li>
                <li>법정 가산수당: 일반적으로 적용 제외</li>
                <li>확인 필요: 실제 근로시간 기본 임금, 최저임금 충족 여부, 계약상 휴일수당 약정</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card title="중복 가산" className="mt-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">연장 + 야간 중복</h3>
            <p className="text-gray-700 mb-4">
              연장근로와 야간근로가 중복되는 경우, 두 가산율을 합산하여 적용합니다.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <code className="text-sm block mb-2">
                연장 + 야간 = 통상시급 × (1.5 + 0.5) = 통상시급 × 2.0
              </code>
              <p className="text-xs text-gray-600 mt-2">
                * 기본 임금(1.0) + 연장 가산(0.5) + 야간 가산(0.5) = 2.0배
              </p>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">휴일 + 야간 중복</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <code className="text-sm block mb-2">
                휴일 + 야간 (8시간 이하) = 통상시급 × (1.5 + 0.5) = 통상시급 × 2.0
              </code>
              <code className="text-sm block">
                휴일 + 야간 (8시간 초과) = 통상시급 × (2.0 + 0.5) = 통상시급 × 2.5
              </code>
            </div>
          </div>
        </Card>

        <Card title="주휴수당" className="mt-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">주휴수당이란?</h3>
            <p className="text-gray-700 mb-4">
              주휴수당은 1주일 동안 소정근로일을 개근한 근로자에게 지급하는 유급 휴일 수당입니다.
              근로기준법 제55조에 따라 5인 미만 사업장도 의무 적용됩니다.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">지급 요건</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>주 15시간 이상 근무</li>
              <li>1주 소정근로일 개근</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">계산 방법</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <code className="text-sm block">
                주휴수당 = (1주 소정근로시간 ÷ 40) × 8 × 통상시급
              </code>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">계산 예시</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm font-semibold mb-2">주 5일 (40시간) 근무</p>
              <ul className="space-y-1 text-sm">
                <li>주휴수당 = (40 ÷ 40) × 8 × 15,517 = 124,136원</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">주 3일 (24시간) 근무</p>
              <ul className="space-y-1 text-sm">
                <li>주휴수당 = (24 ÷ 40) × 8 × 15,517 = 74,482원</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card title="자주 묻는 질문" className="mt-6">
          <div className="prose max-w-none">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Q. 야간근로 수당은 22시부터인가요, 22시 이후부터인가요?
                </h4>
                <p className="text-gray-700">
                  A. 22:00부터 익일 06:00까지입니다. 즉, 22:00:00부터 야간근로로 인정됩니다.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Q. 연장근로는 하루 8시간 초과를 의미하나요?
                </h4>
                <p className="text-gray-700">
                  A. 아닙니다. 연장근로는 <strong>주 40시간</strong>을 초과한 근무를 의미합니다.
                  하루 10시간 근무해도 주 40시간 이내면 연장근로가 아닙니다.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Q. 주휴수당은 주 15시간 미만 근무자도 받나요?
                </h4>
                <p className="text-gray-700">
                  A. 주 15시간 미만 근무자는 주휴수당 대상이 아닙니다.
                  다만, 1주일 소정근로일을 개근한 경우 비례하여 지급받을 수 있습니다.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Q. 5인 미만 사업장도 가산수당을 받나요?
                </h4>
                <p className="text-gray-700">
                  A. 근로기준법 제56조의 법정 연장·야간·휴일 가산수당은 일반적으로 5인 이상 사업장 기준입니다.
                  5인 미만 사업장은 법정 가산수당 적용이 제외될 수 있지만, 실제 일한 시간의 기본 임금과 최저임금,
                  근로계약·취업규칙상 약정 수당은 따로 확인해야 합니다.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* 광고 배너 */}
        <AdBanner slot="5678901234" format="auto" className="mt-8 mb-4" />

        <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">관련 가이드</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/guide/insurance" className="text-blue-600 hover:text-blue-700">
                🏥 4대 보험 이해하기
              </Link>
            </li>
            <li>
              <Link to="/guide/tax" className="text-blue-600 hover:text-blue-700">
                💰 소득세 계산법
              </Link>
            </li>
            <li>
              <Link to="/legal" className="text-blue-600 hover:text-blue-700">
                ⚖️ 법률 정보와 참고용 계산 한계
              </Link>
            </li>
            <li>
              <Link to="/examples" className="text-blue-600 hover:text-blue-700">
                📊 계산 사례 보기
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

export default OvertimeGuide;
