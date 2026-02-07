/**
 * Pain Points Section - 공감 간격 + 부정 편향
 * 인용문 형태로 고통을 상기시켜 다음 섹션(해결책)에 대한 관심 유도
 */

const painPoints = [
  {
    emoji: '\uD83D\uDE30',
    quote: '\uC8FC\uD734\uC218\uB2F9 \uACC4\uC0B0\uC774 \uB9DE\uB294\uC9C0 \uD655\uC2E0\uC774 \uC5C6\uC5B4\uC11C\n\uB9E4\uB2EC \uBD88\uC548\uD574\uC694',
  },
  {
    emoji: '\uD83D\uDE24',
    quote: '4\uB300\uBCF4\uD5D8 \uC694\uC728\uC774 \uBC14\uB014 \uB54C\uB9C8\uB2E4\n\uC5D1\uC140 \uC218\uC2DD\uC744 \uB2E4 \uACE0\uCCD0\uC57C \uD574\uC694',
  },
  {
    emoji: '\uD83D\uDE25',
    quote: '\uC9C1\uC6D0\uC774 \uAE09\uC5EC\uBA85\uC138\uC11C \uBCF4\uACE0 \uBB3C\uC5B4\uBCF4\uBA74\n\uC124\uBA85\uC744 \uBABB \uD558\uACA0\uC5B4\uC694',
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
              <span className="text-4xl block mb-4">{p.emoji}</span>
              <p className="text-text-main text-sm leading-relaxed whitespace-pre-line font-medium">
                &ldquo;{p.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>

        {/* 전환 문구 */}
        <p className="text-center text-text-sub">
          노무사 없이 급여를 직접 관리하는 <strong className="text-text-main">소규모 사업장</strong>이라면,
          정확한 계산기가 필요합니다.
        </p>
      </div>
    </section>
  );
}
