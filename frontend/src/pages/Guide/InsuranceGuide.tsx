/**
 * 4대 보험 가이드 페이지
 */

import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';

const InsuranceGuide = () => {
  return (
    <>
      <Helmet>
        <title>4대 보험 이해하기 | 2026년 요율 및 계산 방법 | 급여 계산기</title>
        <meta name="description" content="국민연금, 건강보험, 장기요양보험, 고용보험의 2026년 요율과 계산 방법을 상세히 안내합니다. 상·하한 기준소득월액, 공제 계산 예시 포함." />
      </Helmet>

      <MainLayout>
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <nav className="text-sm text-gray-500 mb-4">
              <Link to="/guide" className="hover:text-blue-600">가이드</Link>
              <span className="mx-2">/</span>
              <span>4대 보험 이해하기</span>
            </nav>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              4대 보험 이해하기
            </h1>
            <p className="text-lg text-gray-600">
              국민연금, 건강보험, 장기요양보험, 고용보험의 개념과 2026년 요율 기준 계산 방법을 알아봅니다.
            </p>
          </div>

        {/* 4대 보험 개요 */}
        <Card title="4대 보험이란?">
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              4대 보험은 대한민국의 사회보장제도로, 근로자와 사업주가 공동으로 부담하는 의무 보험입니다.
              질병, 실업, 노령 등의 사회적 위험으로부터 국민을 보호하는 것이 목적입니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>국민연금:</strong> 노후 소득 보장</li>
              <li><strong>건강보험:</strong> 의료비 부담 경감</li>
              <li><strong>장기요양보험:</strong> 노인 장기 요양 보장</li>
              <li><strong>고용보험:</strong> 실업급여 및 고용안정 지원</li>
            </ul>
          </div>
        </Card>

        {/* 국민연금 */}
        <Card title="1. 국민연금" className="mt-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">개념</h3>
            <p className="text-gray-700 mb-4">
              국민연금은 노후 소득 보장을 위한 사회보험으로, 만 18세 이상 60세 미만 국민이 의무 가입 대상입니다.
              근로자와 사업주가 각각 기준소득월액의 4.5%씩 부담합니다.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">2026년 요율</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <ul className="space-y-2 text-sm">
                <li>보험료율: <strong>9% (근로자 4.5% + 사업주 4.5%)</strong></li>
                <li>기준소득월액 상한: <strong>590만원</strong></li>
                <li>기준소득월액 하한: <strong>39만원</strong></li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">계산 방법</h3>
            <p className="text-gray-700 mb-4">
              국민연금 보험료는 기준소득월액에 요율을 곱하여 계산합니다. 기준소득월액은 통상 월 급여액을 기준으로 하되, 상·하한이 적용됩니다.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <code className="text-sm block mb-2">
                월 급여 300만원인 경우:
              </code>
              <code className="text-sm block">
                국민연금 = 3,000,000원 × 4.5% = 135,000원
              </code>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <code className="text-sm block mb-2">
                월 급여 600만원인 경우 (상한 적용):
              </code>
              <code className="text-sm block">
                국민연금 = 5,900,000원 × 4.5% = 265,500원
              </code>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">수급 요건</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>최소 10년 이상 가입</li>
              <li>만 62세부터 수령 시작 (1969년생 이후 출생자 기준)</li>
              <li>조기수령 (만 57세~61세): 감액 지급</li>
              <li>연기수령 (만 66세~70세): 가산 지급</li>
            </ul>
          </div>
        </Card>

        {/* 건강보험 */}
        <Card title="2. 건강보험" className="mt-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">개념</h3>
            <p className="text-gray-700 mb-4">
              건강보험은 질병이나 부상으로 인한 의료비 부담을 경감하기 위한 사회보험입니다.
              모든 국민이 의무 가입 대상이며, 병원 진료 시 본인부담금만 지불하면 됩니다.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">2026년 요율</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <ul className="space-y-2 text-sm">
                <li>보험료율: <strong>7.19% (근로자 3.595% + 사업주 3.595%)</strong></li>
                <li>상·하한 없음 (전액 기준)</li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">계산 방법</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <code className="text-sm block mb-2">
                월 급여 300만원인 경우:
              </code>
              <code className="text-sm block">
                건강보험 = 3,000,000원 × 3.595% = 107,850원
              </code>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">급여 혜택</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>외래 진료: 본인부담금 30~60%</li>
              <li>입원 진료: 본인부담금 20%</li>
              <li>약국: 본인부담금 30~40%</li>
              <li>건강검진: 2년마다 무료 (직장 가입자)</li>
            </ul>
          </div>
        </Card>

        {/* 장기요양보험 */}
        <Card title="3. 장기요양보험" className="mt-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">개념</h3>
            <p className="text-gray-700 mb-4">
              장기요양보험은 고령이나 노인성 질병 등으로 일상생활이 어려운 노인에게 요양서비스를 제공하는 제도입니다.
              건강보험 가입자는 자동으로 장기요양보험에도 가입됩니다.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">2026년 요율</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <ul className="space-y-2 text-sm">
                <li>보험료율: <strong>건강보험료 × 12.95%</strong></li>
                <li>건강보험료에 비례하여 자동 산정</li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">계산 방법</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <code className="text-sm block mb-2">
                월 급여 300만원인 경우:
              </code>
              <code className="text-sm block mb-1">
                건강보험 = 3,000,000원 × 3.595% = 107,850원
              </code>
              <code className="text-sm block">
                장기요양보험 = 107,850원 × 12.95% = 13,966원
              </code>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">수급 대상</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>만 65세 이상 노인</li>
              <li>만 65세 미만이지만 치매, 뇌혈관질환 등 노인성 질병을 가진 자</li>
              <li>장기요양 등급 판정 (1~5등급, 인지지원등급)</li>
            </ul>
          </div>
        </Card>

        {/* 고용보험 */}
        <Card title="4. 고용보험" className="mt-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">개념</h3>
            <p className="text-gray-700 mb-4">
              고용보험은 실직 시 생활 안정을 지원하고, 재취업을 촉진하기 위한 사회보험입니다.
              근로자는 실업급여 보험료만 부담하며, 사업주는 실업급여와 고용안정·직업능력개발사업 비용을 부담합니다.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">2026년 요율</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <ul className="space-y-2 text-sm">
                <li>근로자 부담률: <strong>0.9%</strong></li>
                <li>사업주 부담률: <strong>1.05~1.55%</strong> (사업 규모에 따라 차등)</li>
                <li>상한액: <strong>월 1,350만원</strong></li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">계산 방법</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <code className="text-sm block mb-2">
                월 급여 300만원인 경우:
              </code>
              <code className="text-sm block">
                고용보험 = 3,000,000원 × 0.9% = 27,000원
              </code>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">실업급여 수급 요건</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>이직 전 18개월 동안 180일 이상 고용보험 가입</li>
              <li>비자발적 이직 (회사 사정, 계약 만료 등)</li>
              <li>재취업 의사와 능력이 있는 경우</li>
              <li>적극적인 구직 활동 (월 2회 이상)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">실업급여 금액</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <code className="text-sm block mb-2">
                일 평균임금 × 60% × 지급일수
              </code>
              <ul className="space-y-1 text-sm mt-3">
                <li>최소: 일 66,600원 (2026년 최저임금의 80%)</li>
                <li>최대: 일 66,600원 (최저임금 수준 상한)</li>
                <li>지급기간: 120~270일 (가입 기간 및 연령에 따라 차등)</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 4대 보험 계산 예시 */}
        <Card title="종합 계산 예시" className="mt-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              월 급여 300만원 근로자의 4대 보험료
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">보험</th>
                    <th className="text-right py-2">요율</th>
                    <th className="text-right py-2">보험료</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">국민연금</td>
                    <td className="text-right">4.5%</td>
                    <td className="text-right">135,000원</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">건강보험</td>
                    <td className="text-right">3.595%</td>
                    <td className="text-right">107,850원</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">장기요양보험</td>
                    <td className="text-right">12.95% (건보)</td>
                    <td className="text-right">13,966원</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">고용보험</td>
                    <td className="text-right">0.9%</td>
                    <td className="text-right">27,000원</td>
                  </tr>
                  <tr className="font-bold">
                    <td className="py-2">합계</td>
                    <td className="text-right">-</td>
                    <td className="text-right">283,816원</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-700 mt-4">
              4대 보험료는 매월 급여에서 자동 공제되며, 사업주도 동일한 금액(고용보험 제외 시 더 많은 금액)을 부담합니다.
            </p>
          </div>
        </Card>

        {/* 자주 묻는 질문 */}
        <Card title="자주 묻는 질문" className="mt-6">
          <div className="prose max-w-none">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Q. 4대 보험 가입은 의무인가요?
                </h4>
                <p className="text-gray-700">
                  A. 네, 근로자를 고용한 모든 사업장은 4대 보험 가입이 의무입니다.
                  단, 월 근로시간이 60시간 미만인 단시간 근로자는 일부 보험 적용이 제외될 수 있습니다.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Q. 프리랜서도 4대 보험에 가입할 수 있나요?
                </h4>
                <p className="text-gray-700">
                  A. 프리랜서는 지역가입자로 국민연금과 건강보험에 가입할 수 있으나, 직장 가입자와는 보험료 산정 방식이 다릅니다.
                  고용보험은 예술인·노무제공자 고용보험을 별도로 신청할 수 있습니다.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Q. 두 곳 이상 직장이 있을 때 4대 보험은 어떻게 되나요?
                </h4>
                <p className="text-gray-700">
                  A. 각 직장에서 받는 소득을 합산하여 보험료를 산정합니다.
                  국민연금과 건강보험은 합산 소득 기준으로 보험료가 부과되며, 고용보험은 주된 직장에서만 가입합니다.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Q. 4대 보험료를 회사가 안 떼는데, 이게 맞나요?
                </h4>
                <p className="text-gray-700">
                  A. 아닙니다. 4대 보험 가입은 법적 의무이므로, 회사가 임의로 가입하지 않거나 보험료를 공제하지 않는 것은 불법입니다.
                  이런 경우 국민연금공단이나 근로복지공단에 신고할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* 관련 링크 */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">관련 가이드</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/guide/tax" className="text-blue-600 hover:text-blue-700">
                💰 소득세 계산법
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

export default InsuranceGuide;
