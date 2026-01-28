/**
 * 계약총액제 - 계약 급여액 기준으로 수당 분배 컴포넌트
 * 계약 급여액을 입력하면 계산된 급여와의 차액을 보여주고, 그 차액을 수당으로 분배
 */

import { useState, useEffect } from 'react';
import type { SalaryCalculationResponse } from '../../types/salary';

interface AdditionalAllowance {
  id: string;
  name: string;
  amount: number;
  isTaxable: boolean;
}

interface AllowanceAdjustmentProps {
  result: SalaryCalculationResponse;
  onAdjustedResult: (adjustedResult: AdjustedResult) => void;
  initialContractAmount?: number; // Step 2에서 입력한 계약 월급
}

export interface AdjustedResult {
  originalNetPay: number;
  contractAmount: number;
  additionalAllowances: AdditionalAllowance[];
  additionalGross: number;
  additionalDeductions: number;
  adjustedNetPay: number;
  remainingToAllocate: number;
}

// 간이세액 계산 (약식)
const estimateIncomeTax = (taxableIncome: number): number => {
  if (taxableIncome <= 1060000) return 0;
  if (taxableIncome <= 1500000) return Math.round(taxableIncome * 0.02);
  if (taxableIncome <= 3000000) return Math.round(taxableIncome * 0.05);
  if (taxableIncome <= 5000000) return Math.round(taxableIncome * 0.08);
  return Math.round(taxableIncome * 0.12);
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('ko-KR').format(amount) + '원';

export default function AllowanceAdjustment({ result, onAdjustedResult, initialContractAmount = 0 }: AllowanceAdjustmentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contractAmount, setContractAmount] = useState<number>(initialContractAmount); // 계약 급여액

  // initialContractAmount가 변경되면 contractAmount 업데이트
  useEffect(() => {
    if (initialContractAmount > 0) {
      setContractAmount(initialContractAmount);
    }
  }, [initialContractAmount]);
  const [additionalAllowances, setAdditionalAllowances] = useState<AdditionalAllowance[]>([]);
  const [newAllowance, setNewAllowance] = useState({ name: '', amount: 0, isTaxable: true });

  // 계산된 지급총액
  const calculatedGross = result.gross_breakdown.total.amount;
  // 차액 (계약 급여액 - 계산된 지급총액)
  const difference = contractAmount - calculatedGross;

  // 추가 수당 합계
  const additionalTaxable = additionalAllowances
    .filter(a => a.isTaxable)
    .reduce((sum, a) => sum + a.amount, 0);
  const additionalNonTaxable = additionalAllowances
    .filter(a => !a.isTaxable)
    .reduce((sum, a) => sum + a.amount, 0);
  const additionalGross = additionalTaxable + additionalNonTaxable;

  // 남은 분배 가능 금액
  const remainingToAllocate = Math.max(0, difference - additionalGross);

  // 추가 공제 계산 (4대보험 + 소득세)
  const insuranceRate = 0.0945;
  const additionalInsurance = Math.round(additionalTaxable * insuranceRate);
  const additionalTax = estimateIncomeTax(additionalTaxable) - estimateIncomeTax(0);
  const additionalLocalTax = Math.round(additionalTax * 0.1);
  const additionalDeductions = additionalInsurance + additionalTax + additionalLocalTax;

  // 조정된 실수령액
  const adjustedNetPay = result.net_pay.amount + additionalGross - additionalDeductions;

  // 결과 전달
  useEffect(() => {
    if (contractAmount > 0 || additionalAllowances.length > 0) {
      onAdjustedResult({
        originalNetPay: result.net_pay.amount,
        contractAmount,
        additionalAllowances,
        additionalGross,
        additionalDeductions,
        adjustedNetPay,
        remainingToAllocate,
      });
    }
  }, [contractAmount, additionalAllowances, additionalGross, additionalDeductions, adjustedNetPay, remainingToAllocate]);

  const handleAddAllowance = () => {
    if (newAllowance.name && newAllowance.amount > 0) {
      const allowance: AdditionalAllowance = {
        id: Date.now().toString(),
        name: newAllowance.name,
        amount: newAllowance.amount,
        isTaxable: newAllowance.isTaxable,
      };
      setAdditionalAllowances([...additionalAllowances, allowance]);
      setNewAllowance({ name: '', amount: 0, isTaxable: true });
    }
  };

  const handleRemoveAllowance = (id: string) => {
    setAdditionalAllowances(additionalAllowances.filter(a => a.id !== id));
  };

  // 남은 금액 전액을 비과세 수당으로 추가
  const handleAddRemainingAsAllowance = () => {
    if (remainingToAllocate > 0) {
      const allowance: AdditionalAllowance = {
        id: Date.now().toString(),
        name: '기타수당',
        amount: remainingToAllocate,
        isTaxable: false, // 기본값 비과세
      };
      setAdditionalAllowances([...additionalAllowances, allowance]);
    }
  };

  // 빠른 추가 버튼용 프리셋
  const presets = [
    { name: '식대', amount: 200000, isTaxable: false },
    { name: '교통비', amount: 100000, isTaxable: false },
    { name: '직책수당', amount: 200000, isTaxable: true },
    { name: '성과급', amount: 500000, isTaxable: true },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* 토글 헤더 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">
            {isExpanded ? 'expand_less' : 'add_circle'}
          </span>
          <span className="font-medium text-gray-800">수당 추가 (계약총액제)</span>
          {additionalAllowances.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              {additionalAllowances.length}개
            </span>
          )}
        </div>
        {additionalGross > 0 && (
          <span className="text-sm text-green-600 font-medium">
            +{formatMoney(additionalGross)}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* 계약 급여액 입력 */}
          <div className="mt-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              계약 급여액 (월 총액)
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="예: 3500000"
                value={contractAmount || ''}
                onChange={(e) => setContractAmount(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-sm text-gray-500">원</span>
            </div>
          </div>

          {/* 차액 표시 */}
          {contractAmount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">계약 급여액</span>
                  <span className="font-medium">{formatMoney(contractAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">계산된 지급총액</span>
                  <span className="font-medium">{formatMoney(calculatedGross)}</span>
                </div>
              </div>
              <div className="border-t border-amber-200 mt-2 pt-2 flex justify-between items-center">
                <span className="font-medium text-gray-800">차액 (추가 분배 가능)</span>
                <span className={`font-bold text-lg ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {difference >= 0 ? '+' : ''}{formatMoney(difference)}
                </span>
              </div>
              {difference > 0 && remainingToAllocate > 0 && (
                <div className="mt-2 flex justify-between items-center text-sm">
                  <span className="text-gray-600">남은 분배 금액</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-blue-600">{formatMoney(remainingToAllocate)}</span>
                    <button
                      onClick={handleAddRemainingAsAllowance}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      전액 수당 추가
                    </button>
                  </div>
                </div>
              )}
              {difference < 0 && (
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ 계약 급여액이 계산된 급여보다 적습니다. 최저임금 위반 가능성을 확인하세요.
                </p>
              )}
            </div>
          )}

          {/* 안내 문구 */}
          <p className="text-xs text-gray-500 mb-4">
            추가 수당을 입력하면 공제액과 실수령액이 자동으로 재계산됩니다.
            비과세 수당(식대 20만원 한도, 교통비 등)은 공제 없이 전액 지급됩니다.
          </p>

          {/* 빠른 추가 버튼 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setNewAllowance(preset)}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
              >
                + {preset.name}
              </button>
            ))}
          </div>

          {/* 수당 입력 폼 */}
          <div className="grid grid-cols-12 gap-2 mb-4">
            <input
              type="text"
              placeholder="수당명"
              value={newAllowance.name}
              onChange={(e) => setNewAllowance({ ...newAllowance, name: e.target.value })}
              className="col-span-4 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="number"
              placeholder="금액"
              value={newAllowance.amount || ''}
              onChange={(e) => setNewAllowance({ ...newAllowance, amount: Number(e.target.value) })}
              className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <label className="col-span-3 flex items-center gap-1 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={!newAllowance.isTaxable}
                onChange={(e) => setNewAllowance({ ...newAllowance, isTaxable: !e.target.checked })}
                className="rounded"
              />
              비과세
            </label>
            <button
              onClick={handleAddAllowance}
              disabled={!newAllowance.name || newAllowance.amount <= 0}
              className="col-span-2 bg-blue-600 text-white rounded-lg text-sm disabled:bg-gray-300"
            >
              추가
            </button>
          </div>

          {/* 추가된 수당 목록 */}
          {additionalAllowances.length > 0 && (
            <div className="space-y-2 mb-4">
              {additionalAllowances.map((allowance) => (
                <div
                  key={allowance.id}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{allowance.name}</span>
                    {!allowance.isTaxable && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                        비과세
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{formatMoney(allowance.amount)}</span>
                    <button
                      onClick={() => handleRemoveAllowance(allowance.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 조정 결과 요약 */}
          {additionalGross > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">기존 실수령액</span>
                <span>{formatMoney(result.net_pay.amount)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>+ 추가 수당</span>
                <span>+{formatMoney(additionalGross)}</span>
              </div>
              <div className="flex justify-between text-sm text-red-600">
                <span>- 추가 공제 (보험/세금)</span>
                <span>-{formatMoney(additionalDeductions)}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between font-bold">
                <span>조정 실수령액</span>
                <span className="text-blue-700">{formatMoney(adjustedNetPay)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * 추가 공제는 예상치이며, 실제 공제액은 다를 수 있습니다.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
