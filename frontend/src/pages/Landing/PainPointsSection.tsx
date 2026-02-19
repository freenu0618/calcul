/**
 * Pain Points Section - 공감 간격 + 부정 편향
 * 그라디언트 아이콘으로 고통을 시각화, 다음 섹션(해결책) 관심 유도
 */

const painPoints = [
  {
    icon: 'edit_note',
    gradient: 'from-red-400 to-rose-500',
    quote: '주휴수당 계산이 맞는지 확신이 없어서\n매달 불안해요',
  },
  {
    icon: 'menu_book',
    gradient: 'from-amber-400 to-orange-500',
    quote: '4대보험 요율이 바뀔 때마다\n엑셀 수식을 다 고쳐야 해요',
  },
  {
    icon: 'warning',
    gradient: 'from-violet-400 to-purple-500',
    quote: '직원이 급여명세서 보고 물어보면\n설명을 못 하겠어요',
  },
];

export default function PainPointsSection() {
  return (
    <section className="py-20 lg:py-24 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-text-main text-center sm:text-4xl mb-12">
          혹시 이런 경험 있으신가요?
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {painPoints.map((p, i) => (
            <div
              key={i}
              className="bg-red-50/60 border border-red-100 rounded-2xl p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${p.gradient} rounded-2xl flex items-center justify-center shadow-md`}>
                <span className="material-symbols-outlined text-white text-[32px]">{p.icon}</span>
              </div>
              <p className="text-text-main text-sm leading-relaxed whitespace-pre-line font-medium">
                &ldquo;{p.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-text-sub">
          노무사 없이 급여를 직접 관리하는 <strong className="text-text-main">소규모 사업장</strong>이라면,
          정확한 계산기가 필요합니다.
        </p>
      </div>
    </section>
  );
}
