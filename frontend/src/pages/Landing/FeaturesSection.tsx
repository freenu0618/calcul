/**
 * Features Section - 왜 페이툴즈인가요?
 */

export default function FeaturesSection() {
  const features = [
    {
      icon: 'calculate',
      iconBg: 'bg-green-50',
      iconColor: 'text-primary',
      title: '정확한 계산',
      description: '최신 세법과 4대보험 요율을 실시간으로 반영합니다. 수기 계산으로 인한 1원의 오차도 허용하지 않습니다.',
    },
    {
      icon: 'security',
      iconBg: 'bg-blue-50',
      iconColor: 'text-secondary',
      title: '법적 안전',
      description: '매년 바뀌는 근로기준법을 자동으로 체크합니다. 노무 리스크를 사전에 차단하여 안전하게 운영하세요.',
    },
    {
      icon: 'receipt_long',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
      title: '투명한 내역',
      description: '상세한 급여 명세서가 자동으로 생성되어 근로자에게 발송됩니다. 모든 지급 내역은 클라우드에 안전하게 보관됩니다.',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-background-light" id="features">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-text-main sm:text-4xl mb-4">
            왜 페이툴즈인가요?
          </h2>
          <p className="text-lg text-text-sub">
            복잡한 급여 업무, 페이툴즈 하나면 전문가처럼 쉽고 정확하게 처리할 수 있습니다.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center ${feature.iconColor} mb-6`}>
                <span className="material-symbols-outlined text-[32px]">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-text-main mb-3">{feature.title}</h3>
              <p className="text-text-sub leading-relaxed text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
