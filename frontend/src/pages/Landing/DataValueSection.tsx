/**
 * Data Value Section - "쓸수록 쌓이는 급여 데이터베이스"
 * 데이터 누적 가치 인식 마케팅
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const timeline = [
  {
    month: '1개월', icon: 'calculate', title: '정확한 급여 계산',
    desc: '4대보험·소득세·주휴수당 자동 계산으로 실수 없는 급여 관리',
    color: 'from-blue-500 to-blue-600',
    bars: [30, 0, 0, 0, 0, 0], barColor: 'bg-blue-400/40',
  },
  {
    month: '6개월', icon: 'trending_up', title: '인건비 추이 파악',
    desc: '월별 인건비 변동, 직원별 급여 이력을 한눈에 분석',
    color: 'from-primary to-primary-600',
    bars: [30, 45, 40, 55, 50, 65], barColor: 'bg-primary/40',
  },
  {
    month: '1년', icon: 'verified_user', title: '완벽한 증빙 자료',
    desc: '세무신고·노무감사 대비 연간 급여 기록 자동 확보',
    color: 'from-violet-500 to-violet-600',
    bars: [30, 45, 40, 55, 50, 65, 60, 75, 70, 85, 80, 95], barColor: 'bg-violet-400/40',
  },
];

const benefits = [
  { icon: 'history', text: '직원별 급여 이력 자동 저장' },
  { icon: 'bar_chart', text: '월별 인건비 추이 분석' },
  { icon: 'description', text: '세무·노무 감사 증빙 자료' },
  { icon: 'autorenew', text: '법령 변경 시 자동 재계산' },
];

export default function DataValueSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <span className="material-symbols-outlined text-[14px]">database</span>
            데이터가 자산이 됩니다
          </span>
          <h2 className="text-3xl font-bold text-text-main sm:text-4xl mb-3">
            계산기가 아닙니다.<br className="sm:hidden" /> 급여 관리 시스템입니다.
          </h2>
          <p className="text-text-sub max-w-xl mx-auto">
            매달 쌓이는 급여 데이터가 사업장의 소중한 자산이 됩니다.
          </p>
        </div>

        {/* 타임라인 */}
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {timeline.map((item, i) => (
            <div key={item.month} className="relative">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-white text-[20px]">{item.icon}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                    {item.month}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-main mb-2">{item.title}</h3>
                <p className="text-sm text-text-sub leading-relaxed mb-4">{item.desc}</p>
                {/* 데이터 누적 시각화 바 */}
                <div className="flex items-end gap-0.5 h-6">
                  {item.bars.map((h, j) => (
                    <div key={j} className={`flex-1 ${item.barColor} rounded-t transition-all`} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              {/* 연결 화살표 (모바일 숨김) */}
              {i < timeline.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                  <span className="material-symbols-outlined text-gray-300 text-[20px]">arrow_forward</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 혜택 그리드 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((b) => (
              <div key={b.icon} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors">
                <span className="material-symbols-outlined text-primary text-[24px]">{b.icon}</span>
                <span className="text-sm font-medium text-text-main">{b.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-primary-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              {isAuthenticated ? '대시보드에서 확인하기' : '무료로 시작하기'}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
