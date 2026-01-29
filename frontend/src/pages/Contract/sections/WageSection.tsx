/**
 * 임금 섹션
 */

import { useState } from 'react';
import Input from '../../../components/common/Input';
import type { LaborContract, ContractAllowance } from '../../../types/contract';

interface Props {
  contract: LaborContract;
  onChange: (updates: Partial<LaborContract>) => void;
}

export default function WageSection({ contract, onChange }: Props) {
  const [newAllowance, setNewAllowance] = useState<ContractAllowance>({
    name: '',
    amount: 0,
    is_taxable: true,
    is_included_in_regular_wage: false,
  });

  const addAllowance = () => {
    if (!newAllowance.name || newAllowance.amount <= 0) return;
    onChange({ allowances: [...contract.allowances, newAllowance] });
    setNewAllowance({ name: '', amount: 0, is_taxable: true, is_included_in_regular_wage: false });
  };

  const removeAllowance = (index: number) => {
    onChange({ allowances: contract.allowances.filter((_, i) => i !== index) });
  };

  const formatWon = (value: number) => value.toLocaleString('ko-KR');

  return (
    <div className="space-y-4">
      {/* 급여 형태 */}
      <div className="flex gap-4">
        {(['MONTHLY', 'HOURLY', 'DAILY'] as const).map((type) => (
          <label key={type} className="flex items-center gap-2">
            <input
              type="radio"
              checked={contract.wage_type === type}
              onChange={() => onChange({ wage_type: type })}
            />
            <span>
              {type === 'MONTHLY' ? '월급제' : type === 'HOURLY' ? '시급제' : '일급제'}
            </span>
          </label>
        ))}
      </div>

      {/* 기본급 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={contract.wage_type === 'HOURLY' ? '시급 (원)' : '기본급 (원)'}
          type="number"
          min={0}
          value={contract.base_salary}
          onChange={(e) => onChange({ base_salary: parseInt(e.target.value) || 0 })}
          required
        />
        <div className="flex items-end text-lg font-medium text-gray-700">
          {formatWon(contract.base_salary)}원
        </div>
      </div>

      {/* 수당 목록 */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">수당 항목</h4>
        {contract.allowances.length > 0 && (
          <div className="space-y-2 mb-4">
            {contract.allowances.map((allowance, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                <span className="flex-1">{allowance.name}</span>
                <span className="font-medium">{formatWon(allowance.amount)}원</span>
                <button
                  type="button"
                  onClick={() => removeAllowance(index)}
                  className="text-red-500 hover:text-red-700 px-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 수당 추가 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <input
            type="text"
            placeholder="수당명"
            value={newAllowance.name}
            onChange={(e) => setNewAllowance({ ...newAllowance, name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="number"
            placeholder="금액"
            value={newAllowance.amount || ''}
            onChange={(e) => setNewAllowance({ ...newAllowance, amount: parseInt(e.target.value) || 0 })}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={newAllowance.is_included_in_regular_wage}
              onChange={(e) => setNewAllowance({ ...newAllowance, is_included_in_regular_wage: e.target.checked })}
            />
            통상임금
          </label>
          <button
            type="button"
            onClick={addAllowance}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
          >
            추가
          </button>
        </div>
      </div>

      {/* 지급 정보 */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">임금 지급</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="급여 지급일 (매월)"
            type="number"
            min={1}
            max={31}
            value={contract.pay_day}
            onChange={(e) => onChange({ pay_day: parseInt(e.target.value) || 10 })}
          />
          <Input
            label="은행명"
            value={contract.bank_name || ''}
            onChange={(e) => onChange({ bank_name: e.target.value })}
            placeholder="국민은행"
          />
          <Input
            label="계좌번호"
            value={contract.account_number || ''}
            onChange={(e) => onChange({ account_number: e.target.value })}
            placeholder="123-456-789012"
          />
        </div>
      </div>
    </div>
  );
}
