/**
 * Solution Section - 피드포워드 + 시각적 계층
 * 핵심 기능(급여 계산) 크게, 부가 기능 작게 배치
 */

import { Link } from 'react-router-dom';

export default function SolutionSection() {
  return (
    <section className="py-20 lg:py-28 bg-background-light">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-text-main sm:text-4xl mb-4">
            페이툴즈 하나면 전부 해결됩니다
          </h2>
          <p className="text-lg text-text-sub">
            복잡한 급여 업무를 몇 번의 클릭만으로 완료하세요
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 핵심 기능: 가장 크게 (시각적 계층) */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border-2 border-primary/20 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[28px]">calculate</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-main">정확한 급여 자동 계산</h3>
                <span className="text-xs text-primary font-bold">핵심 기능</span>
              </div>
            </div>
            <p className="text-text-sub mb-6 leading-relaxed">
              기본급, 연장·야간·휴일수당, 4대보험, 소득세까지
              입력만 하면 <strong className="text-text-main">3분 안에 실수령액</strong>을 확인할 수 있습니다.
              181개 테스트 케이스로 검증된 정확성.
            </p>
            <Link
              to="/calculator"
              className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-600 transition-colors"
            >
              지금 계산해보기
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          {/* 부가 기능: 작게 */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex-1">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-secondary text-[24px]">smart_toy</span>
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">AI 노무 상담</h3>
              <p className="text-sm text-text-sub leading-relaxed">
                주휴수당? 연차? 퇴직금? 복잡한 노동법 질문에 즉시 답변
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex-1">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-orange-500 text-[24px]">description</span>
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">급여대장 자동 관리</h3>
              <p className="text-sm text-text-sub leading-relaxed">
                직원별 급여 이력 자동 저장, 급여명세서 PDF 다운로드
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
