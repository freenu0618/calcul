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
];

const quickChecks = [
  '월급제는 209시간 기준 포함 여부와 주휴수당 분리 여부를 확인하세요.',
  '시급제·알바는 실제 근무일, 야간·휴일 여부, 주 15시간 이상 여부가 중요합니다.',
  '목표 실수령액에서 역산할 때는 비과세 수당과 회사별 공제 항목을 별도로 점검하세요.',
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

        <div className="grid gap-4 md:grid-cols-3 mb-6">
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
      </div>
    </section>
  );
}
