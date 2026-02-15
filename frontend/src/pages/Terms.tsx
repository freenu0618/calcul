/**
 * 이용약관 페이지
 */

import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import PageHelmet from '../components/common/PageHelmet';

const Terms = () => {
  return (
    <>
    <PageHelmet
      title="이용약관"
      description="PayTools 급여 계산기 이용약관입니다. 서비스 이용, 면책 조항, 저작권 등의 권리와 의무를 안내합니다."
      path="/terms"
    />
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">이용약관</h1>
        <p className="text-sm text-gray-600 mb-8">최종 수정일: 2026년 1월 20일</p>

        <Card title="제1조 (목적)">
          <p className="text-gray-700">
            본 약관은 급여계산기(이하 "서비스")의 이용과 관련하여 서비스 제공자와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
          </p>
        </Card>

        <Card title="제2조 (정의)" className="mt-6">
          <ul className="list-decimal list-inside space-y-2 text-gray-700">
            <li>"서비스"란 급여계산기 웹사이트에서 제공하는 급여 계산 서비스를 의미합니다.</li>
            <li>"이용자"란 본 서비스에 접속하여 본 약관에 따라 서비스를 이용하는 자를 의미합니다.</li>
          </ul>
        </Card>

        <Card title="제3조 (서비스의 제공)" className="mt-6">
          <p className="text-gray-700 mb-3">서비스는 다음과 같은 기능을 제공합니다:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>근로자 급여 계산</li>
            <li>4대 보험료 계산</li>
            <li>소득세 계산</li>
            <li>연장·야간·휴일 수당 계산</li>
            <li>급여 관련 정보 제공</li>
          </ul>
        </Card>

        <Card title="제4조 (서비스의 중단)" className="mt-6">
          <p className="text-gray-700 mb-3">
            서비스 제공자는 다음 각 호에 해당하는 경우 서비스 제공을 일시적으로 중단할 수 있습니다:
          </p>
          <ul className="list-decimal list-inside space-y-2 text-gray-700">
            <li>서비스 설비의 보수, 점검, 교체 등이 필요한 경우</li>
            <li>정전, 통신 장애 등 불가항력적 사유가 발생한 경우</li>
            <li>기타 서비스 제공이 어려운 합리적 사유가 있는 경우</li>
          </ul>
        </Card>

        <Card title="제5조 (이용자의 의무)" className="mt-6">
          <p className="text-gray-700 mb-3">이용자는 다음 행위를 하여서는 안 됩니다:</p>
          <ul className="list-decimal list-inside space-y-2 text-gray-700">
            <li>타인의 정보를 도용하는 행위</li>
            <li>서비스의 안정적 운영을 방해하는 행위</li>
            <li>서비스를 통해 얻은 정보를 무단으로 복제, 배포하는 행위</li>
            <li>기타 법령 또는 공서양속에 반하는 행위</li>
          </ul>
        </Card>

        <Card title="제6조 (면책 조항)" className="mt-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ 중요</h4>
            <ul className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
              <li>본 서비스의 계산 결과는 참고용이며, 실제 급여 지급 시 노무사 또는 세무사와 상담하시기 바랍니다.</li>
              <li>서비스 제공자는 이용자가 서비스를 이용하여 얻은 정보의 정확성, 완전성에 대해 보증하지 않습니다.</li>
              <li>서비스 이용으로 발생한 손해에 대해 서비스 제공자는 책임을 지지 않습니다.</li>
              <li>법령 개정, 정책 변경 등으로 인한 계산 오차에 대해 서비스 제공자는 책임을 지지 않습니다.</li>
            </ul>
          </div>
        </Card>

        <Card title="제7조 (저작권)" className="mt-6">
          <p className="text-gray-700">
            서비스에서 제공하는 모든 콘텐츠(텍스트, 이미지, 코드 등)의 저작권은 서비스 제공자에게 있습니다.
            이용자는 서비스 제공자의 사전 승낙 없이 콘텐츠를 복제, 배포, 전송할 수 없습니다.
          </p>
        </Card>

        <Card title="제8조 (약관의 개정)" className="mt-6">
          <p className="text-gray-700">
            서비스 제공자는 필요한 경우 약관을 개정할 수 있으며, 개정된 약관은 웹사이트를 통해 공지합니다.
            이용자가 개정된 약관에 동의하지 않을 경우 서비스 이용을 중단할 수 있습니다.
          </p>
        </Card>

        <Card title="제9조 (준거법 및 관할법원)" className="mt-6">
          <p className="text-gray-700">
            본 약관과 서비스 이용에 관한 분쟁은 대한민국 법령을 준거법으로 하며, 관할법원은 서비스 제공자의 소재지 관할법원으로 합니다.
          </p>
        </Card>
      </div>
    </MainLayout>
    </>
  );
};

export default Terms;
