/**
 * 연락처 페이지
 */

import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';

const Contact = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">연락처</h1>
        <p className="text-lg text-gray-600 mb-8">
          급여계산기에 대한 문의사항이 있으시면 언제든지 연락해 주세요.
        </p>

        <Card title="이메일">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📧</span>
            <div>
              <p className="text-gray-700">
                <a href="mailto:contact@salary-calculator.kr" className="text-blue-600 hover:underline">
                  contact@salary-calculator.kr
                </a>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                일반 문의, 개선 제안, 버그 리포트 등
              </p>
            </div>
          </div>
        </Card>

        <Card title="문의 시 포함 사항" className="mt-6">
          <p className="text-gray-700 mb-3">
            원활한 답변을 위해 다음 정보를 포함해 주시면 감사하겠습니다:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>문의 유형 (일반 문의, 버그 리포트, 개선 제안 등)</li>
            <li>구체적인 문의 내용</li>
            <li>버그의 경우: 발생 상황, 브라우저 정보, 스크린샷 등</li>
            <li>연락 가능한 이메일 주소</li>
          </ul>
        </Card>

        <Card title="FAQ 먼저 확인해 보세요" className="mt-6">
          <p className="text-gray-700 mb-3">
            자주 묻는 질문은 FAQ 페이지에서 확인하실 수 있습니다.
          </p>
          <a
            href="/faq"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            FAQ 바로가기
          </a>
        </Card>

        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">응답 시간</h3>
          <p className="text-gray-700 mb-2">
            평일: 영업일 기준 1-2일 이내 답변
          </p>
          <p className="text-gray-700">
            주말 및 공휴일: 다음 영업일에 순차적으로 답변
          </p>
        </div>

        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">개인정보 보호</h3>
          <p className="text-sm text-gray-700">
            문의 시 제공해 주신 개인정보는 답변 목적으로만 사용되며, 제3자에게 제공되지 않습니다.
            자세한 내용은 <a href="/privacy" className="text-blue-600 hover:underline">개인정보처리방침</a>을 참고해 주세요.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Contact;
