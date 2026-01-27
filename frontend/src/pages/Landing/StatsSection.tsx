/**
 * Stats Section - 신뢰도 통계
 */

export default function StatsSection() {
  const stats = [
    { value: '1,250+', label: '이용 중인 사업장' },
    { value: '98%', label: '고객 만족도' },
    { value: '100%', label: '급여 정산 정확도' },
    { value: '0원', label: '초기 도입 비용' },
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
