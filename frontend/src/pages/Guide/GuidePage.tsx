/**
 * 가이드 메인 페이지
 * - 서비스 사용 가이드 (상단 강조)
 * - 급여 계산 참고 가이드 (법률 교육)
 */

import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import PageHelmet from '../../components/common/PageHelmet';
import { InsuranceIcon, TaxIcon, OvertimeIcon, GuideIcon } from '../../components/illustrations';

const lawGuides = [
  {
    title: '4대 보험 이해하기',
    path: '/guide/insurance',
    description: '국민연금, 건강보험, 장기요양보험, 고용보험의 개념과 계산 방법을 설명합니다.',
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

const wageTypes = [
  { label: '월급제', desc: '매달 같은 금액', icon: 'account_balance', color: 'bg-blue-50 border-blue-200' },
  { label: '시급제', desc: '시급 × 근무시간', icon: 'schedule', color: 'bg-green-50 border-green-200' },
  { label: '시급기반 월급제', desc: '시급 + 월급 보장', icon: 'verified', color: 'bg-purple-50 border-purple-200' },
];

const GuidePage = () => (
  <>
    <PageHelmet
      title="급여 계산 가이드 - 사용법, 4대보험, 소득세, 수당"
      description="PayTools 사용법과 한국 근로기준법에 따른 급여 계산의 모든 것을 알아보세요."
      path="/guide"
    />
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <GuideIcon size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">가이드</h1>
            <p className="text-gray-600">서비스 사용법과 급여 계산 참고 자료를 확인하세요.</p>
          </div>
        </div>

        {/* 서비스 사용 가이드 - 강조 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">rocket_launch</span>
            서비스 사용 가이드
          </h2>
          <Link to="/guide/how-to-use">
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border-2 border-primary/20 rounded-2xl p-6 hover:shadow-lg transition-shadow mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                어떤 급여유형을 선택해야 할까요?
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                내 상황에 맞는 급여유형을 찾고, 단계별 사용법을 확인하세요.
              </p>
              <span className="text-sm font-bold text-primary">사용법 보기 →</span>
            </div>
          </Link>
          <div className="grid grid-cols-3 gap-3">
            {wageTypes.map((w) => (
              <Link key={w.label} to="/guide/how-to-use" className={`${w.color} border rounded-xl p-4 hover:shadow-md transition-shadow`}>
                <span className="material-symbols-outlined text-[24px] mb-2">{w.icon}</span>
                <p className="font-medium text-sm">{w.label}</p>
                <p className="text-xs text-gray-500">{w.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 법률 참고 가이드 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-500">menu_book</span>
            급여 계산 참고 가이드
          </h2>
          <div className="grid gap-4">
            {lawGuides.map((guide) => (
              <Link key={guide.path} to={guide.path}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">{guide.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{guide.title}</h3>
                      <p className="text-sm text-gray-600">{guide.description}</p>
                      <span className="inline-block mt-2 text-sm text-blue-600 font-medium">
                        자세히 보기 →
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 다음 단계 */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <h3 className="font-semibold text-blue-900 mb-2">바로 시작하기</h3>
          <div className="flex gap-4">
            <Link to="/calculator" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              급여 계산기 →
            </Link>
            <Link to="/examples" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              계산 사례 보기 →
            </Link>
            <Link to="/faq" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              자주 묻는 질문 →
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  </>
);

export default GuidePage;
