/**
 * 급여 계산 가이드 메인 페이지
 */

import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import { InsuranceIcon, TaxIcon, OvertimeIcon, GuideIcon } from '../../components/illustrations';

const GuidePage = () => {
  const guides = [
    {
      title: '4대 보험 이해하기',
      path: '/guide/insurance',
      description: '국민연금, 건강보험, 장기요양보험, 고용보험의 개념과 계산 방법을 상세히 설명합니다.',
      icon: <InsuranceIcon size="sm" />,
    },
    {
      title: '소득세 계산법',
      path: '/guide/tax',
      description: '간이세액표를 활용한 소득세 계산 방법과 부양가족 공제에 대해 알아봅니다.',
      icon: <TaxIcon size="sm" />,
    },
    {
      title: '연장·야간·휴일 수당',
      path: '/guide/overtime',
      description: '근로기준법에 따른 가산수당 계산 방법과 통상시급의 개념을 이해합니다.',
      icon: <OvertimeIcon size="sm" />,
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <GuideIcon size="lg" />
          <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">
            급여 계산 완전 가이드
          </h1>
          <p className="text-lg text-gray-600">
            한국 근로기준법과 세법에 따른 급여 계산의 모든 것을 알아보세요.
          </p>
          </div>
        </div>

        {/* 가이드 목록 */}
        <div className="grid gap-6 mb-12">
          {guides.map((guide) => (
            <Link key={guide.path} to={guide.path}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">{guide.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {guide.title}
                    </h3>
                    <p className="text-gray-600">{guide.description}</p>
                    <span className="inline-block mt-3 text-blue-600 hover:text-blue-700 font-medium">
                      자세히 보기 →
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* 급여 계산 기초 */}
        <Card title="급여 계산의 기초">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              기본급과 통상임금의 차이
            </h3>
            <p className="text-gray-700 mb-4">
              <strong>기본급</strong>은 근로계약서에 명시된 기본 임금으로, 고정적으로 지급되는 금액입니다.
              <strong>통상임금</strong>은 기본급에 고정 수당을 더한 금액으로, 연장·야간·휴일 수당 계산의 기준이 됩니다.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
              통상시급 계산 방법
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <code className="text-sm">
                통상시급 = 통상임금 ÷ 174시간 (주 40시간 기준 월 소정근로시간)
              </code>
            </div>
            <p className="text-gray-700 mb-4">
              통상시급은 모든 가산수당 계산의 기준이 되므로 정확히 산출해야 합니다.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
              월 소정근로시간이란?
            </h3>
            <p className="text-gray-700 mb-4">
              주 40시간 근무 기준으로 한 달 평균 근로시간을 계산하면:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <code className="text-sm">
                40시간 × 52주 ÷ 12개월 = 173.33시간 ≈ 174시간
              </code>
            </div>
            <p className="text-gray-700 mb-4">
              이는 법정 근로시간 기준이며, 단시간 근로자의 경우 실제 계약 근로시간을 기준으로 비례 계산합니다.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
              실수령액 계산 순서
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>기본급 + 각종 수당 = <strong>총 지급액 (Gross Pay)</strong></li>
              <li>총 지급액 - 4대 보험료 = 과세 대상 금액</li>
              <li>과세 대상 금액 - 소득세 및 지방소득세 = <strong>실수령액 (Net Pay)</strong></li>
            </ol>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
              최저임금 검증
            </h3>
            <p className="text-gray-700 mb-4">
              2026년 최저임금은 시급 <strong>10,030원</strong>입니다. 월 환산액은 다음과 같이 계산합니다:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <code className="text-sm">
                10,030원 × 174시간 = 1,745,220원
              </code>
            </div>
            <p className="text-gray-700 mb-4">
              단, 최저임금 산입 범위에 포함되는 수당만 계산에 포함됩니다. 연장·야간·휴일 가산분, 식대(20만원 초과분) 등은 제외됩니다.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
              주휴수당이란?
            </h3>
            <p className="text-gray-700 mb-4">
              주휴수당은 주 15시간 이상 근무하고 소정근로일을 개근한 근로자에게 지급되는 유급 휴일 수당입니다.
              5인 미만 사업장도 의무 적용됩니다.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <code className="text-sm">
                주휴수당 = (1주 소정근로시간 ÷ 40) × 8 × 통상시급
              </code>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
              급여명세서 읽는 법
            </h3>
            <p className="text-gray-700 mb-4">
              급여명세서는 크게 <strong>지급 항목</strong>과 <strong>공제 항목</strong>으로 나뉩니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li><strong>지급 항목:</strong> 기본급, 연장수당, 야간수당, 휴일수당, 주휴수당, 기타 수당</li>
              <li><strong>공제 항목:</strong> 국민연금, 건강보험, 장기요양보험, 고용보험, 소득세, 지방소득세</li>
            </ul>
            <p className="text-gray-700">
              총 지급액에서 총 공제액을 뺀 금액이 실제로 계좌에 입금되는 <strong>실수령액</strong>입니다.
            </p>
          </div>
        </Card>

        {/* 관련 링크 */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">다음 단계</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/examples" className="text-blue-600 hover:text-blue-700">
                📊 실제 계산 사례 보기
              </Link>
            </li>
            <li>
              <Link to="/faq" className="text-blue-600 hover:text-blue-700">
                ❓ 자주 묻는 질문 확인하기
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
  );
};

export default GuidePage;
