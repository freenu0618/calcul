/**
 * 개인정보처리방침 페이지
 */

import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';

const Privacy = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">개인정보처리방침</h1>
        <p className="text-sm text-gray-600 mb-8">최종 수정일: 2026년 1월 20일</p>

        <Card title="1. 개인정보의 수집">
          <p className="text-gray-700">
            급여계산기는 사용자의 개인정보를 수집하지 않습니다. 모든 급여 계산은 브라우저에서 수행되며, 서버에 데이터가 저장되지 않습니다.
          </p>
        </Card>

        <Card title="2. 쿠키 사용" className="mt-6">
          <p className="text-gray-700 mb-3">
            본 서비스는 사용자 경험 개선을 위해 다음과 같은 쿠키를 사용할 수 있습니다:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>필수 쿠키:</strong> 서비스 운영에 필요한 최소한의 쿠키</li>
            <li><strong>분석 쿠키:</strong> Google Analytics를 통한 방문 통계 분석</li>
          </ul>
        </Card>

        <Card title="3. Google Analytics" className="mt-6">
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

        <Card title="4. 데이터 보관" className="mt-6">
          <p className="text-gray-700">
            사용자가 입력한 급여 정보는 서버에 저장되지 않으며, 브라우저를 닫으면 자동으로 삭제됩니다.
          </p>
        </Card>

        <Card title="5. 제3자 제공" className="mt-6">
          <p className="text-gray-700">
            본 서비스는 사용자의 개인정보를 제3자에게 제공하지 않습니다.
          </p>
        </Card>

        <Card title="6. 사용자 권리" className="mt-6">
          <p className="text-gray-700 mb-3">
            사용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>쿠키 차단 또는 삭제</li>
            <li>Google Analytics 추적 거부 (브라우저 설정)</li>
          </ul>
        </Card>

        <Card title="7. 개인정보 보호책임자" className="mt-6">
          <p className="text-gray-700">
            개인정보 보호와 관련한 문의사항은 <a href="/contact" className="text-blue-600 hover:underline">연락처 페이지</a>를 통해 문의해 주시기 바랍니다.
          </p>
        </Card>

        <Card title="8. 개정" className="mt-6">
          <p className="text-gray-700">
            본 개인정보처리방침은 법령 또는 서비스 정책 변경에 따라 개정될 수 있습니다. 개정 시 웹사이트를 통해 공지합니다.
          </p>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Privacy;
