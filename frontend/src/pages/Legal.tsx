/**
 * 법률 정보 페이지
 */

import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import PageHelmet from '../components/common/PageHelmet';

const Legal = () => {
  return (
    <>
    <PageHelmet
      title="근로기준법 핵심 조항 - 법률 정보"
      description="급여 계산에 필요한 근로기준법, 최저임금법, 소득세법의 핵심 조항을 쉽게 정리했습니다."
      path="/legal"
    />
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">근로기준법 핵심 조항</h1>
        <p className="text-lg text-gray-600 mb-8">
          근로자의 권리와 급여 계산에 필요한 주요 법률 조항을 안내합니다.
        </p>

        <Card title="근로기준법 제43조 (임금 지급)">
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              임금은 통화로 직접 근로자에게 그 전액을 지급하여야 한다. 다만, 법령 또는 단체협약에 특별한 규정이 있는 경우에는 임금의 일부를 공제하거나 통화 이외의 것으로 지급할 수 있다.
            </p>
            <p className="text-gray-700 mb-4">
              임금은 매월 1회 이상 일정한 날짜를 정하여 지급하여야 한다.
            </p>
            <h4 className="font-semibold text-gray-900 mt-4 mb-2">주요 내용</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>임금은 근로자에게 직접 지급해야 함 (제3자에게 지급 금지)</li>
              <li>임금은 전액을 지급해야 함 (법정 공제 제외)</li>
              <li>매월 1회 이상, 정해진 날짜에 지급해야 함</li>
            </ul>
          </div>
        </Card>

        <Card title="근로기준법 제48조 (임금대장 및 명세서)" className="mt-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              사용자는 각 사업장별로 임금대장을 작성하고 임금과 가족수당 계산의 기초가 되는 사항, 임금액, 그 밖에 대통령령으로 정하는 사항을 임금을 지급할 때마다 적어야 한다.
            </p>
            <p className="text-gray-700 mb-4">
              사용자는 임금을 지급하는 때에는 근로자에게 임금의 구성항목·계산방법, 제43조제1항 단서에 따라 임금의 일부를 공제한 경우의 내역 등 대통령령으로 정하는 사항을 적은 임금명세서를 서면으로 교부하여야 한다.
            </p>
            <h4 className="font-semibold text-gray-900 mt-4 mb-2">주요 내용</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>사용자는 임금대장을 작성·보관해야 함</li>
              <li>임금 지급 시 근로자에게 급여명세서를 교부해야 함</li>
              <li>급여명세서에는 구성항목, 계산방법, 공제 내역이 포함되어야 함</li>
            </ul>
          </div>
        </Card>

        <Card title="근로기준법 제55조 (휴일)" className="mt-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              사용자는 근로자에게 1주일에 평균 1회 이상의 유급휴일을 보장하여야 한다.
            </p>
            <h4 className="font-semibold text-gray-900 mt-4 mb-2">주요 내용</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>1주일에 1회 이상 유급 휴일(주휴일) 보장</li>
              <li>주휴일에도 임금을 지급해야 함 (주휴수당)</li>
              <li>5인 미만 사업장도 주휴일 의무 적용</li>
            </ul>
          </div>
        </Card>

        <Card title="근로기준법 제56조 (연장·야간·휴일 근로)" className="mt-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              사용자는 연장근로(제53조·제59조 및 제69조 단서에 따라 연장된 시간의 근로), 야간근로(오후 10시부터 다음 날 오전 6시까지 사이의 근로) 또는 휴일근로에 대하여는 통상임금의 100분의 50 이상을 가산하여 근로자에게 지급하여야 한다.
            </p>
            <h4 className="font-semibold text-gray-900 mt-4 mb-2">주요 내용</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>연장근로:</strong> 통상임금의 50% 가산 (1.5배)</li>
              <li><strong>야간근로:</strong> 통상임금의 50% 가산 (22:00~06:00)</li>
              <li><strong>휴일근로:</strong> 통상임금의 50% 가산</li>
              <li>중복 적용 시 가산율 합산 (예: 연장+야간 = 2.0배)</li>
            </ul>
          </div>
        </Card>

        <Card title="최저임금법 제6조 (최저임금의 효력)" className="mt-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              사용자는 최저임금의 적용을 받는 근로자에게 최저임금액 이상의 임금을 지급하여야 한다.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>2026년 최저임금:</strong> 시급 10,320원 (월 환산액 1,795,680원)
            </p>
            <h4 className="font-semibold text-gray-900 mt-4 mb-2">주요 내용</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>모든 근로자는 최저임금 이상 받을 권리가 있음</li>
              <li>최저임금 미달 시 사용자는 형사 처벌 대상</li>
              <li>수습 기간(3개월 이내)은 최저임금의 90% 적용 가능</li>
            </ul>
          </div>
        </Card>

        <Card title="소득세법 (간이세액표)" className="mt-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              근로소득에 대한 소득세는 간이세액표를 적용하여 원천징수하며, 연말정산을 통해 정산합니다.
            </p>
            <h4 className="font-semibold text-gray-900 mt-4 mb-2">소득세율 (2026년)</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="space-y-1 text-sm text-gray-700">
                <li>1,400만원 이하: 6%</li>
                <li>1,400만원 초과 ~ 5,000만원 이하: 15%</li>
                <li>5,000만원 초과 ~ 8,800만원 이하: 24%</li>
                <li>8,800만원 초과 ~ 1억 5천만원 이하: 35%</li>
                <li>1억 5천만원 초과 ~ 3억원 이하: 38%</li>
                <li>3억원 초과 ~ 5억원 이하: 40%</li>
                <li>5억원 초과 ~ 10억원 이하: 42%</li>
                <li>10억원 초과: 45%</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">⚠️ 법적 고지</h3>
          <p className="text-sm text-yellow-800">
            본 페이지는 근로기준법 및 관련 법률의 주요 조항을 요약한 것입니다.
            실제 법률 해석 및 적용은 법원, 노동위원회, 노무사 등 전문가와 상담하시기 바랍니다.
          </p>
        </div>

        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">관련 링크</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/guide" className="text-blue-600 hover:text-blue-700">
                📚 급여 계산 가이드
              </Link>
            </li>
            <li>
              <Link to="/faq" className="text-blue-600 hover:text-blue-700">
                ❓ 자주 묻는 질문
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

export default Legal;
