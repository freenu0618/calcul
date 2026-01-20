/**
 * 서비스 소개 페이지
 */

import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';

const About = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">서비스 소개</h1>
        <p className="text-lg text-gray-600 mb-8">
          한국 근로기준법에 따른 정확한 실수령액 계산 서비스
        </p>

        <Card title="급여계산기란?">
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              급여계산기는 대한민국 근로기준법 및 세법에 따라 근로자의 실수령액을 정확하게 계산하는 무료 웹 서비스입니다.
              복잡한 4대 보험료, 소득세, 가산수당 계산을 쉽고 빠르게 수행할 수 있습니다.
            </p>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">목표 사용자</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>영세 사업장 사업주:</strong> 직원 급여를 정확히 계산하고 싶은 소규모 사업자</li>
              <li><strong>근로자:</strong> 자신의 급여 구조를 이해하고 검증하고 싶은 모든 근로자</li>
              <li><strong>노무사 보조 도구:</strong> 급여 계산 업무를 지원하는 보조 도구</li>
            </ul>
          </div>
        </Card>

        <Card title="핵심 기능" className="mt-6">
          <div className="prose max-w-none">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">💰 정확한 급여 계산</h4>
                <p className="text-sm text-gray-700">
                  2026년 기준 4대 보험 요율, 간이세액표, 최저임금을 적용하여 정확히 계산합니다.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">⏰ 가산수당 자동 계산</h4>
                <p className="text-sm text-gray-700">
                  연장·야간·휴일 근로 시간을 입력하면 자동으로 가산수당을 계산합니다.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">📊 투명한 계산 과정</h4>
                <p className="text-sm text-gray-700">
                  모든 계산 과정을 상세히 표시하여 급여 구조를 명확히 이해할 수 있습니다.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">⚠️ 법적 경고</h4>
                <p className="text-sm text-gray-700">
                  최저임금 미달, 주 52시간 위반 등 법적 문제를 자동으로 감지하여 경고합니다.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="기술 스택" className="mt-6">
          <div className="prose max-w-none">
            <h4 className="font-semibold text-gray-900 mb-3">백엔드</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li><strong>Python:</strong> 도메인 주도 설계(DDD) 적용</li>
              <li><strong>FastAPI:</strong> 고성능 REST API</li>
              <li><strong>Decimal:</strong> 정확한 금액 계산</li>
            </ul>
            <h4 className="font-semibold text-gray-900 mb-3">프론트엔드</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>React + TypeScript:</strong> 타입 안전성과 생산성</li>
              <li><strong>Tailwind CSS:</strong> 모던한 UI 디자인</li>
              <li><strong>React Router:</strong> 다중 페이지 구조</li>
            </ul>
          </div>
        </Card>

        <Card title="개발 원칙" className="mt-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              법적 정확성 &gt; 기능 풍부함
            </h3>
            <p className="text-gray-700 mb-4">
              틀린 계산보다 없는 기능이 낫습니다. 모든 계산은 근로기준법과 세법을 철저히 준수합니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>모든 계산 로직은 순수 함수로 작성하여 사이드 이펙트 방지</li>
              <li>Decimal 기반 금액 계산으로 부동소수점 오류 제거</li>
              <li>179개 테스트를 통해 계산 정확성 검증</li>
              <li>법 조문 주석을 통한 계산 근거 명시</li>
            </ul>
          </div>
        </Card>

        <Card title="면책 조항" className="mt-6">
          <div className="prose max-w-none">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ 법적 고지</h4>
              <p className="text-sm text-yellow-800 mb-2">
                본 계산기는 참고용이며, 실제 급여 지급 시 노무사 또는 세무사와 상담하시기 바랍니다.
              </p>
              <p className="text-sm text-yellow-800">
                계산 결과로 인한 법적 책임은 사용자에게 있습니다.
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">시작하기</h3>
          <p className="text-gray-700 mb-3">
            지금 바로 급여 계산을 시작해 보세요.
          </p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            급여 계산기 사용하기
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;
