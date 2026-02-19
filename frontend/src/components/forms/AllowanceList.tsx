/**
 * 수당 목록 입력 컴포넌트
 */
import type { Allowance } from '../../types/models';
import Button from '../common/Button';
import { ALLOWANCE_PRESETS } from './AllowancePresets';

interface AllowanceListProps {
  allowances: Allowance[];
  onAllowancesChange: (allowances: Allowance[]) => void;
}

const formatWithComma = (value: number): string => {
  if (value === 0) return '';
  return value.toLocaleString('ko-KR');
};

const parseNumber = (value: string): number =>
  parseInt(value.replace(/,/g, ''), 10) || 0;

export default function AllowanceList({
  allowances,
  onAllowancesChange,
}: AllowanceListProps) {
  const addAllowance = () => {
    onAllowancesChange([
      ...allowances,
      {
        name: '',
        amount: 0,
        is_taxable: true,
        is_includable_in_minimum_wage: true,
        is_fixed: true,
        is_included_in_regular_wage: true,
      },
    ]);
  };

  const updateAllowance = (
    index: number,
    field: keyof Allowance,
    value: string | number | boolean
  ) => {
    const updated = [...allowances];
    updated[index] = { ...updated[index], [field]: value };
    onAllowancesChange(updated);
  };

  const removeAllowance = (index: number) => {
    onAllowancesChange(allowances.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-medium text-gray-800">수당 목록</h4>
        <div className="flex items-center gap-2">
          <select
            onChange={(e) => {
              const preset = ALLOWANCE_PRESETS[Number(e.target.value)];
              if (preset) {
                onAllowancesChange([...allowances, { ...preset.defaults, amount: 0 }]);
                e.target.value = '';
              }
            }}
            className="text-sm border border-gray-300 rounded-md px-2 py-1.5"
            defaultValue=""
          >
            <option value="" disabled>프리셋 추가</option>
            {ALLOWANCE_PRESETS.map((p, i) => (
              <option key={i} value={i}>{p.label}</option>
            ))}
          </select>
          <Button variant="secondary" onClick={addAllowance} type="button">
            + 직접 추가
          </Button>
        </div>
      </div>

      {allowances.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">수당이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {allowances.map((allowance, index) => (
            <div
              key={index}
              className={`border rounded-md p-4 ${
                allowance.name === '직무수당(임의)'
                  ? 'bg-green-50 border-green-300'
                  : 'bg-gray-50 border-gray-300'
              }`}
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    수당 이름
                  </label>
                  <input
                    type="text"
                    value={allowance.name}
                    onChange={(e) => updateAllowance(index, 'name', e.target.value)}
                    placeholder="직책수당"
                    disabled={allowance.name === '기타수당(차액)'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    금액
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatWithComma(allowance.amount)}
                    onChange={(e) =>
                      updateAllowance(index, 'amount', parseNumber(e.target.value))
                    }
                    placeholder="300,000"
                    disabled={allowance.name === '기타수당(차액)'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { field: 'is_taxable' as const, label: '과세 대상' },
                  { field: 'is_included_in_regular_wage' as const, label: '통상임금 포함' },
                  { field: 'is_includable_in_minimum_wage' as const, label: '최저임금 산입' },
                  { field: 'is_fixed' as const, label: '고정 지급' },
                ].map(({ field, label }) => (
                  <label key={field} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={allowance[field] as boolean}
                      onChange={(e) => updateAllowance(index, field, e.target.checked)}
                      className="mr-2"
                      disabled={
                        field === 'is_taxable' && allowance.name === '기타수당(차액)'
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>

              {allowance.name !== '기타수당(차액)' && (
                <div className="mt-3">
                  <Button
                    variant="secondary"
                    onClick={() => removeAllowance(index)}
                    type="button"
                    className="text-sm text-red-600 hover:bg-red-50"
                  >
                    삭제
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
