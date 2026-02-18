/**
 * 서비스 사용 가이드 페이지 (/guide/how-to-use)
 * 급여유형별 사용법 + 의사결정 도우미
 */

import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import PageHelmet from '../../components/common/PageHelmet';
import WageTypeDecisionHelper from './WageTypeDecisionHelper';
import WageTypeGuideCards from './WageTypeGuideCards';

export default function HowToUseGuide() {
  return (
    <>
      <PageHelmet
        title="서비스 사용법 - PayTools 급여 계산기"
        description="PayTools 급여 계산기를 급여유형별로 어떻게 사용하는지 안내합니다. 월급제, 시급제, 시급기반 월급제 사용법."
        path="/guide/how-to-use"
      />
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6">
            <Link to="/guide" className="hover:text-blue-600">가이드</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">서비스 사용법</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              PayTools 사용 가이드
            </h1>
            <p className="text-gray-600">
              급여유형에 맞는 사용법을 확인하고 정확한 실수령액을 계산하세요.
            </p>
          </div>

          {/* Decision Helper */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              어떤 급여유형을 선택해야 하나요?
            </h2>
            <WageTypeDecisionHelper />
          </section>

          {/* Wage Type Guides */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              급여유형별 사용법
            </h2>
            <WageTypeGuideCards />
          </section>

          {/* Common Tips */}
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
            <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">tips_and_updates</span>
              공통 안내사항
            </h3>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">-</span>
                <span>각 입력 필드의 <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-200 rounded-full">?</span> 아이콘을 클릭하면 상세 설명을 볼 수 있습니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">-</span>
                <span>174시간 모드는 주휴수당을 별도 계산, 209시간 모드는 기본급에 포함된 것으로 처리합니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">-</span>
                <span>계산 결과에서 수당을 추가하거나 수정한 후 재계산할 수 있습니다.</span>
              </li>
            </ul>
          </section>

          {/* CTA */}
          <div className="text-center">
            <Link
              to="/calculator"
              className="inline-flex items-center gap-2 h-12 px-8 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-colors"
            >
              급여 계산 시작하기
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
