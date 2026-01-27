/**
 * Stats Section - 신뢰도 통계
 */

export default function StatsSection() {
  const stats = [
    { value: '181개', label: '테스트 케이스 통과' },
    { value: '2026년', label: '최신 법령 반영' },
    { value: '8개', label: '지원 법률/규정' },
    { value: '0원', label: '기본 사용료' },
  ];

  return (
    <section className="border-y border-gray-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`flex flex-col gap-1 ${index > 0 ? 'md:border-l md:border-gray-100' : ''}`}
            >
              <p className="text-3xl font-bold text-text-main">{stat.value}</p>
              <p className="text-sm text-text-sub">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
