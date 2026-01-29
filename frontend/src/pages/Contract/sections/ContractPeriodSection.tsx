/**
 * 계약 기간 섹션
 */

import Input from '../../../components/common/Input';
import type { LaborContract } from '../../../types/contract';

interface Props {
  contract: LaborContract;
  onChange: (updates: Partial<LaborContract>) => void;
}

export default function ContractPeriodSection({ contract, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="계약 체결일"
          type="date"
          value={contract.contract_date}
          onChange={(e) => onChange({ contract_date: e.target.value })}
          required
        />
        <Input
          label="근로 시작일"
          type="date"
          value={contract.contract_start_date}
          onChange={(e) => onChange({ contract_start_date: e.target.value })}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            계약 형태
          </label>
          <div className="flex items-center gap-4 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={contract.is_indefinite}
                onChange={() => onChange({ is_indefinite: true })}
              />
              <span>무기계약</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!contract.is_indefinite}
                onChange={() => onChange({ is_indefinite: false })}
              />
              <span>기간제</span>
            </label>
          </div>
        </div>
      </div>

      {!contract.is_indefinite && (
        <Input
          label="근로 종료일"
          type="date"
          value={contract.contract_end_date || ''}
          onChange={(e) => onChange({ contract_end_date: e.target.value })}
          required
        />
      )}

      <div className="border-t pt-4 mt-4">
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={contract.has_probation}
            onChange={(e) => onChange({ has_probation: e.target.checked })}
          />
          <span className="font-medium">수습 기간 적용</span>
        </label>

        {contract.has_probation && (
          <div className="grid grid-cols-2 gap-4 ml-6">
            <Input
              label="수습 기간 (개월)"
              type="number"
              min={1}
              max={6}
              value={contract.probation_months}
              onChange={(e) =>
                onChange({ probation_months: parseInt(e.target.value) || 3 })
              }
            />
            <Input
              label="수습 급여 비율 (%)"
              type="number"
              min={90}
              max={100}
              value={contract.probation_rate}
              onChange={(e) =>
                onChange({ probation_rate: parseInt(e.target.value) || 100 })
              }
            />
            <p className="col-span-2 text-sm text-gray-500">
              ※ 최저임금의 90% 미만 지급 불가 (최저임금법 제5조의2)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
