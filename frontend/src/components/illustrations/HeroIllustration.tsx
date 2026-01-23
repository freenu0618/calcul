/**
 * 랜딩페이지 히어로 일러스트 - 급여 대시보드 목업
 */
export default function HeroIllustration({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* 메인 카드 - 급여명세서 목업 */}
      <div className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl transform perspective-1000 rotate-y-[-3deg] rotate-x-[2deg]">
        {/* 상단 바 */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="ml-2 text-xs text-white/60">paytools - 급여 계산 결과</span>
        </div>

        {/* 급여 요약 */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/70 text-sm">총 지급액</span>
            <span className="text-white font-bold text-lg">₩3,245,800</span>
          </div>
          <div className="h-px bg-white/20" />
          <div className="flex justify-between items-center">
            <span className="text-white/70 text-sm">4대보험</span>
            <span className="text-red-300 text-sm">-₩298,450</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70 text-sm">소득세</span>
            <span className="text-red-300 text-sm">-₩125,200</span>
          </div>
          <div className="h-px bg-white/20" />
          <div className="flex justify-between items-center">
            <span className="text-emerald-300 text-sm font-medium">실수령액</span>
            <span className="text-emerald-300 font-bold text-xl">₩2,822,150</span>
          </div>
        </div>

        {/* 하단 차트 미니 */}
        <div className="mt-4 flex items-end gap-1 h-8">
          {[40, 65, 55, 80, 70, 90, 75].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-emerald-400/60 rounded-t"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* 떠다니는 3D 아이콘 - 계산기 */}
      <div className="absolute -top-4 -right-4 bg-blue-500 rounded-xl p-3 shadow-lg animate-float">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>

      {/* 떠다니는 3D 아이콘 - 보안 */}
      <div className="absolute -bottom-3 -left-3 bg-emerald-500 rounded-xl p-3 shadow-lg animate-float-delayed">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
    </div>
  );
}
