/**
 * 수당 편집 컴포넌트 (결과 상단 배치)
 * - 잠금 항목: 기본급, 주휴수당, 연장/야간/휴일 수당
 * - 편집 가능: 사용자 수당, 계약보전수당
 * - 추가/수정/삭제 후 자동 재계산 트리거
 */

import { useState } from 'react';
import type { SalaryCalculationResponse } from '../../types/salary';
import type { Allowance } from '../../types/models';

interface AllowanceEditorProps {
  result: SalaryCalculationResponse;
  allowances: Allowance[];
  onAllowancesChange: (allowances: Allowance[]) => void;
  onRecalculate: () => void;
  isRecalculating?: boolean;
  onRemoveGuarantee?: () => void;  // 계약보전수당 제거 콜백
}

const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);
const parse = (v: string) => parseInt(v.replace(/,/g, ''), 10) || 0;

/** 잠금 항목 (자동 계산) */
function LockedItem({ label, amount, formula }: { label: string; amount: number; formula?: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">&#128274;</span>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <div className="text-right">
        <span className="text-sm font-medium text-gray-700">{fmt(amount)}원</span>
        {formula && <p className="text-xs text-gray-400">{formula}</p>}
      </div>
    </div>
  );
}

/** 편집 가능 항목 */
function EditableItem({
  allowance,
  index,
  onEdit,
  onDelete,
}: {
  allowance: Allowance;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-white border border-gray-100 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-800">{allowance.name}</span>
        {!allowance.is_taxable && (
          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">비과세</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{fmt(allowance.amount)}원</span>
        <button
          type="button"
          onClick={() => onEdit(index)}
          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
          title="수정"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
          title="삭제"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}

/** 수당 편집 모달 */
function EditModal({
  allowance,
  onSave,
  onClose,
}: {
  allowance: Allowance;
  onSave: (updated: Allowance) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(allowance.name);
  const [amount, setAmount] = useState(allowance.amount);
  const [isTaxFree, setIsTaxFree] = useState(!allowance.is_taxable);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5 space-y-4">
        <h3 className="text-lg font-semibold">수당 수정</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">수당명</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">금액</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={amount === 0 ? '' : fmt(amount)}
              onChange={(e) => setAmount(parse(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <span className="text-sm text-gray-500">원</span>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isTaxFree}
            onChange={(e) => setIsTaxFree(e.target.checked)}
            className="rounded"
          />
          비과세
        </label>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
            취소
          </button>
          <button
            type="button"
            onClick={() => {
              onSave({ ...allowance, name, amount, is_taxable: !isTaxFree });
              onClose();
            }}
            disabled={!name || amount <= 0}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

const PRESETS = [
  { name: '식대', amount: 200000, is_taxable: false },
  { name: '교통비', amount: 200000, is_taxable: false },
  { name: '직책수당', amount: 200000, is_taxable: true },
];

export default function AllowanceEditor({
  result,
  allowances,
  onAllowancesChange,
  onRecalculate,
  isRecalculating,
  onRemoveGuarantee,
}: AllowanceEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const gb = result.gross_breakdown;
  const guarantee = result.contract_guarantee_allowance;
  const totalAllowances = allowances.reduce((s, a) => s + a.amount, 0)
    + (guarantee?.amount || 0);

  const handleEdit = (index: number) => setEditingIndex(index);

  const handleSave = (updated: Allowance) => {
    const next = [...allowances];
    next[editingIndex!] = updated;
    onAllowancesChange(next);
    setEditingIndex(null);
    onRecalculate();
  };

  const handleDelete = (index: number) => {
    onAllowancesChange(allowances.filter((_, i) => i !== index));
    onRecalculate();
  };

  const handleAdd = (preset: typeof PRESETS[0]) => {
    const newAllowance: Allowance = {
      name: preset.name,
      amount: preset.amount,
      is_taxable: preset.is_taxable,
      is_includable_in_minimum_wage: false,
      is_fixed: true,
      is_included_in_regular_wage: false,
    };
    onAllowancesChange([...allowances, newAllowance]);
    onRecalculate();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* 헤더 (접기/펼치기) */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-[20px]">tune</span>
          <span className="font-medium text-gray-800">수당 편집</span>
        </div>
        <div className="flex items-center gap-3">
          {!isExpanded && (
            <span className="text-sm text-gray-500">
              수당 {allowances.length}건, 합계 {fmt(totalAllowances)}원
            </span>
          )}
          <span className="material-symbols-outlined text-gray-400 text-[20px]">
            {isExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 space-y-2 pt-3">
          {/* 잠금 항목 */}
          <LockedItem
            label="기본급"
            amount={gb.base_salary.amount}
            formula="자동 계산"
          />
          {gb.weekly_holiday_pay.amount.amount > 0 && (
            <LockedItem
              label="주휴수당"
              amount={gb.weekly_holiday_pay.amount.amount}
              formula="자동 계산"
            />
          )}
          {gb.overtime_allowances.total.amount > 0 && (
            <LockedItem
              label="연장/야간/휴일 수당"
              amount={gb.overtime_allowances.total.amount}
              formula="자동 계산"
            />
          )}
          {guarantee && guarantee.amount > 0 && (
            <div className="flex items-center justify-between py-2 px-3 bg-purple-50 border border-purple-100 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-purple-700">계약보전수당</span>
                <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">자동</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-purple-700">{fmt(guarantee.amount)}원</span>
                {onRemoveGuarantee && (
                  <button
                    type="button"
                    onClick={() => { onRemoveGuarantee(); onRecalculate(); }}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="계약보전수당 제거 (계약월급 설정 해제)"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 편집 가능 항목 */}
          {allowances.map((a, i) => (
            <EditableItem key={i} allowance={a} index={i} onEdit={handleEdit} onDelete={handleDelete} />
          ))}

          {/* 빠른 추가 */}
          <div className="flex flex-wrap gap-2 pt-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleAdd(p)}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
              >
                + {p.name}
              </button>
            ))}
          </div>

          {/* 재계산 중 */}
          {isRecalculating && (
            <div className="text-center py-2 text-sm text-blue-600">재계산 중...</div>
          )}

          <p className="text-xs text-gray-400 pt-1">
            수당을 변경하면 아래 결과가 자동으로 재계산됩니다.
          </p>
        </div>
      )}

      {/* 편집 모달 */}
      {editingIndex !== null && (
        <EditModal
          allowance={allowances[editingIndex]}
          onSave={handleSave}
          onClose={() => setEditingIndex(null)}
        />
      )}
    </div>
  );
}
