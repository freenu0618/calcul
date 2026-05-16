import { Link } from 'react-router-dom';

const routes = [
  {
    label: '정방향 계산',
    title: '월급·알바 실수령액을 계산하고 싶어요',
    description: '기본급, 시급, 수당, 근무시간을 입력해 4대보험·소득세·주휴수당이 반영된 예상 실수령액을 확인합니다.',
    to: '/calculator',
    icon: 'calculate',
    tone: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  {
    label: '역산 계산',
    title: '목표 실수령액에 필요한 세전 월급이 궁금해요',
    description: '원하는 월 실수령액을 기준으로 필요한 기본급과 예상 공제액을 빠르게 역산합니다.',
    to: '/reverse-calculator',
    icon: 'sync_alt',
    tone: 'bg-purple-50 text-purple-700 border-purple-100',
  },
  {
    label: '기준 확인',
    title: '주휴수당·4대보험·가산수당 기준을 먼저 알고 싶어요',
    description: '급여유형별 입력법과 2026년 보험료, 소득세, 연장·야간·휴일수당 가이드를 확인합니다.',
    to: '/guide',
    icon: 'menu_book',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
];

export default function DecisionRouteSection() {
  return (
    <section className="py-16 lg:py-24 bg-white" aria-labelledby="decision-route-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-sm font-bold text-primary mb-3">상황별 빠른 선택</p>
          <h2 id="decision-route-title" className="text-3xl font-bold text-text-main sm:text-4xl mb-4">
            지금 필요한 급여 답변으로 바로 이동하세요
          </h2>
          <p className="text-lg text-text-sub leading-relaxed">
            PayTools는 “얼마를 지급해야 하는지”, “세전 월급이 얼마여야 하는지”, “어떤 기준이 적용되는지”를 나눠 안내해 계산 전 이탈을 줄입니다.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {routes.map((route) => (
            <Link
              key={route.to}
              to={route.to}
              className="group rounded-2xl border border-gray-100 bg-background-light p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-lg"
            >
              <div className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${route.tone}`}>
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">{route.icon}</span>
                {route.label}
              </div>
              <h3 className="text-lg font-bold text-text-main mb-3 leading-snug">{route.title}</h3>
              <p className="text-sm text-text-sub leading-relaxed mb-5">{route.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:text-primary-600">
                바로 확인하기
                <span className="material-symbols-outlined text-[18px] transition group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
