import { Link } from 'react-router-dom';

const basisCards = [
  {
    icon: 'fact_check',
    title: '2026년 기준값',
    description: '최저시급 10,320원, 209시간 기준 월 환산액 2,156,880원, 4대보험 근로자 부담 요율을 기준 정보로 안내합니다.',
  },
  {
    icon: 'tune',
    title: '결과를 바꾸는 입력값',
    description: '급여유형, 사업장 규모, 부양가족 수, 비과세 수당, 소정근로시간과 실제 시프트가 실수령액에 영향을 줍니다.',
  },
  {
    icon: 'verified_user',
    title: '안전한 활용 범위',
    description: '계산 결과는 급여 협의와 사전 검토용 추정치입니다. 최종 지급, 분쟁, 세무 신고는 노무·세무 전문가 검토가 필요합니다.',
  },
  {
    icon: 'privacy_tip',
    title: '민감정보 불필요',
    description: '공개 계산에는 이름, 주민등록번호, 계좌번호, 급여명세서 원본 대신 급여유형, 금액, 근무시간 같은 조건만 입력합니다.',
  },
];

const quickChecks = [
  '월급제는 209시간 기준 포함 여부와 주휴수당 분리 여부를 확인하세요.',
  '시급제·알바는 실제 근무일, 야간·휴일 여부, 주 15시간 이상 여부가 중요합니다.',
  '목표 실수령액에서 역산할 때는 비과세 수당과 회사별 공제 항목을 별도로 점검하세요.',
];

const answerRoutes = [
  {
    label: '정방향 계산',
    title: '월급·알바 실수령액을 바로 계산',
    description: '기본급, 시급, 수당, 근무시간을 입력해 4대보험·소득세·주휴수당을 함께 확인합니다.',
    to: '/calculator',
  },
  {
    label: '역산 계산',
    title: '목표 실수령액에서 세전 급여 역산',
    description: '원하는 월 실수령액을 기준으로 필요한 세전 월급과 예상 공제액을 먼저 잡습니다.',
    to: '/reverse-calculator',
  },
  {
    label: '기준 학습',
    title: '2026년 급여 기준과 예외 확인',
    description: '4대보험, 소득세, 주휴수당, 가산수당처럼 결과를 바꾸는 기준을 가이드에서 검토합니다.',
    to: '/guide',
  },
  {
    label: '시뮬레이션',
    title: '복수 급여안과 수당 구조 비교',
    description: '인상 전후, 기본급 비율, 수당 배분, 고용형태 차이를 나눠 예상 결과를 비교합니다.',
    to: '/simulation',
  },
];

export default function CalculationBasisSection() {
  return (
    <section className="py-16 lg:py-24 bg-white" aria-labelledby="calculation-basis-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-sm font-bold text-primary mb-3">계산 전제 한눈에 보기</p>
          <h2 id="calculation-basis-title" className="text-3xl font-bold text-text-main sm:text-4xl mb-4">
            실수령액 답변 전에 기준값을 먼저 확인하세요
          </h2>
          <p className="text-lg text-text-sub leading-relaxed">
            PayTools는 AI 검색과 사용자 화면 모두에서 같은 전제를 반복 안내해, 계산 결과를 과신하지 않고 다음 행동을 고르도록 돕습니다.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {basisCards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-gray-100 bg-background-light p-6 shadow-sm">
              <span className="material-symbols-outlined mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
                {card.icon}
              </span>
              <h3 className="text-lg font-bold text-text-main mb-3">{card.title}</h3>
              <p className="text-sm text-text-sub leading-relaxed">{card.description}</p>
            </article>
          ))}
        </div>

        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5 sm:p-6">
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-text-main">
            <span className="material-symbols-outlined text-primary" aria-hidden="true">checklist</span>
            계산 전 빠른 점검
          </h3>
          <ul className="grid gap-3 md:grid-cols-3">
            {quickChecks.map((check) => (
              <li key={check} className="flex gap-2 text-sm leading-relaxed text-text-sub">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span>{check}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 rounded-2xl border border-gray-100 bg-background-light p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold text-primary mb-2">AI 답변용 빠른 경로</p>
              <h3 className="text-xl font-bold text-text-main">질문 의도에 맞춰 바로 안내할 페이지</h3>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-text-sub">
              단일 계산 결과만 강조하기보다 정방향 계산, 목표 실수령액 역산, 기준 학습을 구분해 안내하면 사용자와 검색엔진 모두 다음 행동을 명확히 이해할 수 있습니다.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {answerRoutes.map((route) => (
              <Link
                key={route.to}
                to={route.to}
                aria-label={`${route.label}: ${route.title}`}
                className="group rounded-xl border border-white bg-white p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <p className="text-xs font-bold text-primary">{route.label}</p>
                <h4 className="mt-2 text-sm font-bold text-text-main">{route.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-text-sub">{route.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:text-primary-600">
                  바로 확인하기
                  <span className="material-symbols-outlined text-[18px] transition group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
