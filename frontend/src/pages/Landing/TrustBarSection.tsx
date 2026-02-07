/**
 * Trust Bar Section - 권위 편향 + 밴드웨건
 * 카운트업 애니메이션 (IntersectionObserver)
 */

import { useState, useEffect, useRef } from 'react';

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setCount(Math.floor(eased * target));
            if (p < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

const stats = [
  { target: 2026, suffix: '년', label: '최신 법령 반영' },
  { target: 20, suffix: '개', label: '검증 테스트 통과' },
  { target: 8, suffix: '개', label: '법률 · 규정 반영' },
];

const laws = [
  '근로기준법', '최저임금법', '국민연금법', '건강보험법',
  '고용보험법', '소득세법', '근로자퇴직급여보장법', '산재보험법',
];

export default function TrustBarSection() {
  return (
    <section className="border-y border-gray-200 bg-gray-50/80 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 숫자 지표 */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-6">
          {stats.map((s) => (
            <StatItem key={s.label} {...s} />
          ))}
        </div>

        {/* 법률명 나열 (권위 편향) - 모바일에서 숨김 */}
        <p className="hidden sm:block text-center text-xs text-text-sub">
          {laws.join(' · ')}
        </p>
      </div>
    </section>
  );
}

function StatItem({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(target);
  return (
    <div ref={ref} className="text-center">
      <p className="text-2xl sm:text-3xl font-bold text-text-main">
        {count.toLocaleString('ko-KR')}
        <span className="text-lg">{suffix}</span>
      </p>
      <p className="text-sm text-text-sub mt-0.5">{label}</p>
    </div>
  );
}
