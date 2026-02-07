/**
 * Social Proof Section - 검증 가능한 사실 기반 신뢰 + 타겟 고객
 */

const trustFacts = [
  {
    icon: 'science',
    number: '20개',
    label: '실제 급여 케이스 검증 테스트',
    detail: '다양한 근무형태·수당 조합을 검증',
  },
  {
    icon: 'gavel',
    number: '8개',
    label: '반영된 법률 및 규정',
    detail: '근로기준법, 최저임금법, 국민연금법 등',
  },
  {
    icon: 'update',
    number: '2026년',
    label: '최신 법령 및 요율 반영',
    detail: '최저임금 10,320원, 국민연금 4.75% 등',
  },
];

const targetUsers = [
  {
    icon: 'store',
    title: '소규모 사업장 대표',
    desc: '직원 1~10명, 노무사 없이 직접 급여를 관리하는 분',
  },
  {
    icon: 'local_cafe',
    title: '카페·음식점 운영자',
    desc: '아르바이트생 주휴수당, 야간수당 계산이 필요한 분',
  },
  {
    icon: 'business_center',
    title: '스타트업 경영지원',
    desc: 'HR 전담 인력 없이 급여 업무를 겸하는 분',
  },
];

const badges = [
  { icon: 'lock', label: 'SSL 암호화' },
  { icon: 'shield', label: '개인정보보호법 준수' },
  { icon: 'verified', label: '2026년 법령 적용' },
];

export default function SocialProofSection() {
  return (
    <section className="py-20 lg:py-28 bg-background-light">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 검증 가능한 사실 기반 신뢰 */}
        <h2 className="text-3xl font-bold text-text-main text-center sm:text-4xl mb-12">
          신뢰할 수 있는 급여 계산
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {trustFacts.map((f) => (
            <div key={f.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <span className="material-symbols-outlined text-primary text-[40px] mb-3 block">{f.icon}</span>
              <p className="text-2xl sm:text-3xl font-bold text-text-main mb-1">{f.number}</p>
              <p className="text-sm font-medium text-text-main mb-2">{f.label}</p>
              <p className="text-xs text-text-sub">{f.detail}</p>
            </div>
          ))}
        </div>

        {/* 타겟 고객 설명 */}
        <h3 className="text-2xl font-bold text-text-main text-center mb-8">
          이런 분들이 사용합니다
        </h3>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {targetUsers.map((u) => (
            <div key={u.title} className="flex items-start gap-4 bg-white rounded-xl p-5 border border-gray-100">
              <span className="material-symbols-outlined text-primary text-[28px] mt-0.5 flex-shrink-0">{u.icon}</span>
              <div>
                <p className="font-semibold text-text-main mb-1">{u.title}</p>
                <p className="text-sm text-text-sub">{u.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 신뢰 배지 */}
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
