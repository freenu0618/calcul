/**
 * 계약보전수당 배분 컴포넌트
 * HOURLY_BASED_MONTHLY에서 차액을 비과세 수당으로 재배분
 */

export interface GuaranteeDistributionItem {
  id: string;
  name: string;
  amount: number;
  isTaxFree: boolean;
}

interface Props {
  totalGuarantee: number;
  items: GuaranteeDistributionItem[];
  onChange: (items: GuaranteeDistributionItem[]) => void;
}

const PRESETS = [
  { name: '식대', defaultAmount: 200000, isTaxFree: true, maxTaxFree: 200000 },
  { name: '교통비', defaultAmount: 200000, isTaxFree: true, maxTaxFree: 200000 },
  { name: '직책수당', defaultAmount: 0, isTaxFree: false },
];

const fmt = (v: number) => v.toLocaleString('ko-KR');
const parse = (v: string) => parseInt(v.replace(/,/g, ''), 10) || 0;

export default function GuaranteeAllowanceDistribution({
  totalGuarantee,
  items,
  onChange,
}: Props) {
  const distributed = items.reduce((s, i) => s + i.amount, 0);
  const remaining = totalGuarantee - distributed;
  const isOver = remaining < 0;
  const taxFreeTotal = items.filter((i) => i.isTaxFree).reduce((s, i) => s + i.amount, 0);

  const addPreset = (preset: (typeof PRESETS)[number]) => {
    if (items.some((i) => i.name === preset.name)) return;
    const maxAdd = totalGuarantee - distributed;
    const amount = preset.defaultAmount > 0 ? Math.min(preset.defaultAmount, maxAdd) : 0;
    onChange([
      ...items,
      { id: Date.now().toString(), name: preset.name, amount, isTaxFree: preset.isTaxFree },
    ]);
  };

  const addCustom = () => {
    onChange([
      ...items,
      { id: Date.now().toString(), name: '', amount: 0, isTaxFree: false },
    ]);
  };

  const update = (id: string, patch: Partial<GuaranteeDistributionItem>) => {
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));

  // 비과세 한도 경고
  const getTaxFreeWarning = (item: GuaranteeDistributionItem): string | null => {
    if (!item.isTaxFree) return null;
    const preset = PRESETS.find((p) => p.name === item.name);
    if (preset?.maxTaxFree && item.amount > preset.maxTaxFree) {
      return `${item.name} 비과세 한도는 월 ${fmt(preset.maxTaxFree)}원입니다`;
    }
    return null;
  };

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-purple-800">계약보전수당 배분</p>
        <span className="text-xs text-purple-600">차액: {fmt(totalGuarantee)}원</span>
      </div>
      <p className="text-xs text-gray-600">
        비과세 수당으로 배분하면 실수령액이 높아집니다.
      </p>

      {/* 배분 항목 목록 */}
      {items.map((item) => {
        const warning = getTaxFreeWarning(item);
        return (
          <div key={item.id} className="bg-white rounded-md p-3 border border-purple-100 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) => update(item.id, { name: e.target.value })}
                placeholder="수당명"
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <input
                type="text"
                inputMode="numeric"
                value={item.amount > 0 ? fmt(item.amount) : ''}
                onChange={(e) => update(item.id, { amount: parse(e.target.value) })}
                placeholder="금액"
                className="w-28 px-2 py-1 text-sm border border-gray-300 rounded text-right"
              />
              <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={item.isTaxFree}
                  onChange={(e) => update(item.id, { isTaxFree: e.target.checked })}
                  className="rounded"
                />
                비과세
              </label>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="text-red-400 hover:text-red-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>
            {warning && <p className="text-xs text-amber-600">{warning}</p>}
          </div>
        );
      })}

      {/* 빠른 추가 버튼 */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            disabled={isOver || items.some((i) => i.name === p.name) || remaining <= 0}
            onClick={() => addPreset(p)}
            className="px-3 py-1 text-xs rounded-full border border-purple-300 text-purple-700 hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + {p.name}
          </button>
        ))}
        <button
          type="button"
          disabled={isOver || remaining <= 0}
          onClick={addCustom}
          className="px-3 py-1 text-xs rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + 직접 입력
        </button>
      </div>

      {/* 합계 */}
      <div className="bg-white rounded-md p-3 border border-purple-100 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">배분 합계:</span>
          <span className={`font-medium ${isOver ? 'text-red-600' : ''}`}>{fmt(distributed)}원</span>
        </div>
        {remaining > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">잔여 보전수당 (과세):</span>
            <span className="font-medium text-gray-800">{fmt(remaining)}원</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-1 flex justify-between font-semibold">
          <span>차액 합계:</span>
          <span className={isOver ? 'text-red-600' : 'text-green-600'}>
            {fmt(totalGuarantee)}원 {!isOver && items.length > 0 ? '✓' : ''}
          </span>
        </div>
        {isOver && (
          <p className="text-xs text-red-600 mt-1">배분 합계가 차액을 초과합니다.</p>
        )}
      </div>

      {/* 절세 효과 안내 */}
      {taxFreeTotal > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 text-xs text-green-800">
          <p className="font-medium">비과세 배분 효과</p>
          <p>비과세 합계: {fmt(taxFreeTotal)}원 → 예상 절세: 약 {fmt(Math.round(taxFreeTotal * 0.085))}원/월</p>
        </div>
      )}
    </div>
  );
}
