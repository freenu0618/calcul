/**
 * 계산 사례 메인 페이지
 */

import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';

const ExamplesPage = () => {
  const examples = [
    {
      title: '풀타임 근로자 (주 5일)',
      path: '/examples/fulltime',
      description: '월급 250만원, 주 5일 근무하는 일반적인 정규직 근로자의 실수령액 계산 사례',
      salary: '250만원',
      netPay: '약 215만원',
      icon: '💼',
    },
    {
      title: '파트타임 근로자 (주 3일)',
      path: '/examples/parttime',
      description: '시급 10,320원, 주 3일 근무하는 단시간 근로자의 급여 계산 사례',
      salary: '시급 10,320원',
      netPay: '약 72만원',
      icon: '⏱️',
    },
    {
      title: '교대근무 (3교대)',
      path: '/examples/shift-work',
      description: '야간근무를 포함한 3교대 근로자의 연장·야간·휴일 수당 계산 사례',
      salary: '300만원 + 수당',
      netPay: '약 320만원',
      icon: '🌙',
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            급여 계산 사례
          </h1>
          <p className="text-lg text-gray-600">
            다양한 근무 형태별 실제 급여 계산 사례를 통해 급여 구조를 이해해 보세요.
          </p>
        </div>

        <div className="grid gap-6 mb-12">
          {examples.map((example) => (
            <Link key={example.path} to={example.path}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{example.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {example.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{example.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-700">
                        <strong>총 지급:</strong> {example.salary}
                      </span>
                      <span className="text-blue-600 font-semibold">
                        <strong>실수령:</strong> {example.netPay}
                      </span>
                    </div>
                    <span className="inline-block mt-3 text-blue-600 hover:text-blue-700 font-medium">
                      상세 보기 →
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <Card title="사례 활용 가이드">
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              각 사례는 2026년 기준 최저임금, 4대 보험 요율, 간이세액표를 적용하여 계산되었습니다.
              실제 급여는 개인의 상황(부양가족 수, 추가 공제 등)에 따라 달라질 수 있습니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>모든 계산은 근로기준법 및 세법에 따라 정확히 산출되었습니다</li>
              <li>4대 보험은 근로자 부담분만 표시되어 있습니다</li>
              <li>소득세는 부양가족 1명 기준으로 계산되었습니다</li>
              <li>실제 급여 지급 시에는 개인별 상황을 반영해야 합니다</li>
            </ul>
          </div>
        </Card>

        <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">직접 계산해 보세요</h3>
          <p className="text-gray-700 mb-3">
            내 급여를 정확히 계산하고 싶다면 급여 계산기를 사용해 보세요.
          </p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            급여 계산기로 이동
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default ExamplesPage;
