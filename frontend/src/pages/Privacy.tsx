/**
 * 개인정보처리방침 페이지
 */

import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import PageHelmet from '../components/common/PageHelmet';

const Privacy = () => {
  return (
    <>
    <PageHelmet
      title="개인정보처리방침"
      description="PayTools 급여 계산기의 개인정보처리방침입니다. 공개 계산 입력값, 계정 기능 데이터, 쿠키 사용, 데이터 보관 정책을 안내합니다."
      path="/privacy"
    />
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">개인정보처리방침</h1>
        <p className="text-sm text-gray-600 mb-8">최종 수정일: 2026년 6월 11일</p>

        <Card title="1. 개인정보의 수집">
          <p className="text-gray-700 mb-3">
            PayTools의 공개 급여 계산기에서 입력하는 급여유형, 금액, 근무시간, 수당, 공제 조건은 계산 결과를 보여주기 위한 목적으로 사용됩니다.
            로그인하지 않은 공개 계산 흐름에서는 입력값을 서버에 저장하지 않는 것을 원칙으로 합니다.
          </p>
          <p className="text-gray-700">
            회원가입, 직원 관리, 급여대장, 구독 관리처럼 계정 기반 기능을 이용하는 경우에는 서비스 제공을 위해 이메일, 인증 정보, 직원 및 급여 관련 입력 데이터가 저장될 수 있습니다.
          </p>
        </Card>

        <Card title="2. 계정 기능 데이터" className="mt-6">
          <p className="text-gray-700 mb-3">
            계정 기능에서 저장되는 데이터는 급여 계산 기록, 직원 관리, 급여명세서 및 급여대장 관리 등 사용자가 요청한 기능을 제공하기 위해 사용됩니다.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>회원 식별 및 로그인 상태 유지</li>
            <li>직원별 급여 계산 기록과 급여대장 관리</li>
            <li>구독 상태 확인 및 결제 완료 처리</li>
            <li>오류 확인, 문의 대응, 서비스 품질 개선</li>
          </ul>
        </Card>

        <Card title="3. 쿠키 사용" className="mt-6">
          <p className="text-gray-700 mb-3">
            본 서비스는 사용자 경험 개선을 위해 다음과 같은 쿠키를 사용할 수 있습니다:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>필수 쿠키:</strong> 서비스 운영에 필요한 최소한의 쿠키</li>
            <li><strong>인증 쿠키:</strong> 로그인 상태 유지와 계정 보안을 위한 쿠키</li>
            <li><strong>분석 쿠키:</strong> Google Analytics를 통한 방문 통계 분석</li>
          </ul>
        </Card>

        <Card title="4. Google Analytics" className="mt-6">
          <p className="text-gray-700 mb-3">
            본 서비스는 서비스 개선을 위해 Google Analytics를 사용합니다. Google Analytics는 다음과 같은 정보를 수집할 수 있습니다:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-3">
            <li>방문 페이지 및 체류 시간</li>
            <li>사용 기기 정보 (브라우저, OS 등)</li>
            <li>유입 경로</li>
          </ul>
          <p className="text-gray-700">
            Google Analytics의 개인정보 처리 방침은 <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google 개인정보처리방침</a>에서 확인하실 수 있습니다.
          </p>
        </Card>

        <Card title="5. 데이터 보관" className="mt-6">
          <p className="text-gray-700 mb-3">
            공개 계산기에서 로그인 없이 입력한 급여 정보는 브라우저 화면에서 계산 결과를 표시하는 데 사용되며, 계정 데이터로 저장되지 않습니다.
          </p>
          <p className="text-gray-700">
            계정 기반 기능에서 사용자가 저장한 정보는 회원 탈퇴, 삭제 요청, 서비스 제공 목적 달성 등 보관 필요가 없어질 때까지 보관될 수 있습니다.
          </p>
        </Card>

        <Card title="6. 제3자 제공" className="mt-6">
          <p className="text-gray-700">
            PayTools는 사용자의 개인정보를 임의로 제3자에게 판매하거나 제공하지 않습니다. 다만 법령상 의무, 결제·인증 등 서비스 제공에 필요한 외부 처리, 사용자의 요청이 있는 경우에는 필요한 범위에서 처리될 수 있습니다.
          </p>
        </Card>

        <Card title="7. 사용자 권리" className="mt-6">
          <p className="text-gray-700 mb-3">
            사용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>계정 정보와 저장된 급여 데이터의 열람, 정정, 삭제 요청</li>
            <li>쿠키 차단 또는 삭제</li>
            <li>Google Analytics 추적 거부 (브라우저 설정)</li>
          </ul>
        </Card>

        <Card title="8. 개인정보 보호책임자" className="mt-6">
          <p className="text-gray-700">
            개인정보 보호와 관련한 문의사항은 <a href="/contact" className="text-blue-600 hover:underline">연락처 페이지</a>를 통해 문의해 주시기 바랍니다.
          </p>
        </Card>

        <Card title="9. 개정" className="mt-6">
          <p className="text-gray-700">
            본 개인정보처리방침은 법령 또는 서비스 정책 변경에 따라 개정될 수 있습니다. 개정 시 웹사이트를 통해 공지합니다.
          </p>
        </Card>
      </div>
    </MainLayout>
    </>
  );
};

export default Privacy;
