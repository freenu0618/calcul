/**
 * 시나리오별 빠른 시작 가이드
 * 실제 사례 기반으로 계산기 사용법을 안내
 */
import { useState } from 'react';

interface Scenario {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  inputs: { label: string; value: string }[];
  expectedResults: { label: string; value: string }[];
  keyPoints: string[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 'cafe-part-time', icon: 'local_cafe',
    title: '카페 주말 알바', description: '주 3일, 하루 5시간 근무하는 파트타임 알바생',
    color: 'green',
    inputs: [
      { label: '급여유형', value: '시급제' },
      { label: '시급', value: '10,320원 (2026 최저시급)' },
      { label: '주 소정근로일', value: '3일' },
      { label: '일 근로시간', value: '5시간' },
      { label: '시프트', value: '금·토·일 10:00~15:00 (휴게 0분)' },
    ],
    expectedResults: [
      { label: '기본 근로수당', value: '시급 × 실제 근무시간' },
      { label: '주휴수당', value: '주 15시간 이상이므로 발생' },
      { label: '4대보험', value: '각 항목별 공제' },
    ],
    keyPoints: [
      '시급제는 반드시 시프트를 입력해야 합니다',
      '주 15시간(3일×5시간) 이상이므로 주휴수당 발생',
      '휴게시간이 0분이면 별도 입력 불필요',
    ],
  },
  {
    id: 'full-time-office', icon: 'business_center',
    title: '정규직 사무직', description: '주 5일, 하루 8시간, 기본급 280만원',
    color: 'blue',
    inputs: [
      { label: '급여유형', value: '월급제 (고정)' },
      { label: '기본급', value: '2,800,000원' },
      { label: '시간 모드', value: '174시간 (주휴수당 별도 계산)' },
      { label: '주 소정근로일', value: '5일' },
      { label: '시프트', value: '입력하지 않음 (전일 개근 처리)' },
    ],
    expectedResults: [
      { label: '통상시급', value: '2,800,000 ÷ 174 = 약 16,092원' },
      { label: '주휴수당', value: '통상시급 × 8h × 4.345주' },
      { label: '실수령액', value: '기본급 + 주휴 - 4대보험 - 소득세' },
    ],
    keyPoints: [
      '시프트를 입력하지 않으면 전일 개근으로 자동 계산됩니다',
      '174시간 모드에서 주휴수당이 별도 계산되어 총지급액에 포함',
      '연장근로가 있으면 해당 날짜의 시프트를 추가 입력하세요',
    ],
  },
  {
    id: 'guaranteed-monthly', icon: 'verified',
    title: '월급 보장형 시급직', description: '시급 12,000원 계약, 월 220만원 보장',
    color: 'purple',
    inputs: [
      { label: '급여유형', value: '시급기반 월급제' },
      { label: '시급', value: '12,000원' },
      { label: '계약 월급', value: '2,200,000원' },
      { label: '주 소정근로일', value: '5일' },
      { label: '시프트', value: '선택 (입력하면 실제 계산액과 비교)' },
    ],
    expectedResults: [
      { label: '실제 계산액', value: '시급 × 시간 + 주휴수당' },
      { label: '적용 금액', value: 'MAX(계약 220만, 실제 계산액)' },
      { label: '적용방식', value: '어떤 방식이 적용되었는지 표시' },
    ],
    keyPoints: [
      '계약 월급과 실제 계산액 중 유리한 금액이 자동 적용',
      '결과에서 "적용방식"을 확인하면 어떤 기준인지 알 수 있음',
      '시프트를 입력하면 실제 계산액과의 차이를 비교 가능',
    ],
  },
];

export default function QuickStartScenarios() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[24px]">rocket_launch</span>
        <h3 className="text-lg font-bold text-gray-900">시나리오별 빠른 시작</h3>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        실제 사례를 통해 계산기 사용 방법을 알아보세요.
      </p>

      <div className="space-y-3">
        {SCENARIOS.map((s) => (
          <div key={s.id} className={`border rounded-xl overflow-hidden transition-all ${openId === s.id ? `border-${s.color}-300 bg-${s.color}-50/30` : 'border-gray-200'}`}>
            <button
              onClick={() => setOpenId(openId === s.id ? null : s.id)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-sm text-gray-900">{s.title}</span>
                <p className="text-xs text-gray-500 truncate">{s.description}</p>
              </div>
              <span className={`material-symbols-outlined text-gray-400 transition-transform ${openId === s.id ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {openId === s.id && (
              <div className="px-5 pb-5 grid md:grid-cols-3 gap-4">
                {/* Inputs */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">입력값</h4>
                  <div className="space-y-2">
                    {s.inputs.map((inp, i) => (
                      <div key={i} className="flex justify-between text-xs gap-2">
                        <span className="text-gray-500 shrink-0">{inp.label}</span>
                        <span className="text-gray-900 font-medium text-right">{inp.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expected Results */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">예상 결과</h4>
                  <div className="space-y-2">
                    {s.expectedResults.map((r, i) => (
                      <div key={i} className="flex justify-between text-xs gap-2">
                        <span className="text-gray-500 shrink-0">{r.label}</span>
                        <span className="text-gray-900 font-medium text-right">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Points */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">핵심 포인트</h4>
                  <ul className="space-y-2">
                    {s.keyPoints.map((p, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">*</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
