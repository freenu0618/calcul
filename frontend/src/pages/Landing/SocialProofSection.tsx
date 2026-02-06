/**
 * Social Proof Section - 밴드웨건 + 사회적 증거 + 후광 효과
 */

const testimonials = [
  {
    quote: '매달 엑셀로 2시간씩 걸리던 급여 계산이 10분으로 줄었어요. 특히 4대보험 자동 계산이 정말 편해요.',
    name: '김OO',
    desc: '직원 8명 제조업 대표',
  },
  {
    quote: '알바생 5명 주휴수당 계산이 항상 헷갈렸는데, 여기서 한 번에 정확하게 나와요.',
    name: '이OO',
    desc: '카페 2호점 운영',
  },
  {
    quote: '노무사 비용 아끼면서 더 정확한 급여 관리가 가능해졌어요. AI 상담도 웬만한 건 다 답변해줘요.',
    name: '박OO',
    desc: '스타트업 대표, 직원 12명',
  },
];

const badges = [
  { icon: 'lock', label: 'SSL 암호화' },
  { icon: 'gavel', label: '법률 검토 완료' },
  { icon: 'shield', label: '개인정보보호법 준수' },
  { icon: 'verified', label: '2026년 법령 적용' },
];

export default function SocialProofSection() {
  return (
    <section className="py-20 lg:py-28 bg-background-light">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-text-main text-center sm:text-4xl mb-12">
          이미 많은 사업장이 선택했습니다
        </h2>

        {/* 후기 카드 - 모바일: 가로 스와이프 / 데스크탑: 3열 그리드 */}
        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 mb-12 overflow-x-auto snap-x snap-mandatory pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {testimonials.map((t) => (
            <div key={t.name} className="min-w-[280px] sm:min-w-[320px] md:min-w-0 snap-center bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-shrink-0 md:flex-shrink">
              {/* 별점 */}
              <div className="flex gap-0.5 mb-4 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                ))}
              </div>
              <p className="text-sm text-text-sub leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-text-sub">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-main">{t.name}</p>
                  <p className="text-xs text-text-sub">{t.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 신뢰 배지 (후광 효과) */}
        <div className="flex flex-wrap justify-center gap-4">
          {badges.map((b) => (
            <div
              key={b.label}
              className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-sm text-text-sub"
            >
              <span className="material-symbols-outlined text-primary text-[18px]">{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
