/**
 * 급여유형별 입력 필드 비교도
 * 3개 급여유형의 Step 2 필드를 시각적으로 비교
 */

const FIELD_ROWS = [
  { label: '기본급 입력', monthly: true, hourly: false, hourlyBased: false },
  { label: '시급 입력', monthly: false, hourly: true, hourlyBased: true },
  { label: '계약 월급(보장액)', monthly: false, hourly: false, hourlyBased: true },
  { label: '174/209시간 모드', monthly: true, hourly: false, hourlyBased: false },
  { label: '시프트 입력', monthly: '선택', hourly: '필수', hourlyBased: '선택' },
  { label: '주휴수당', monthly: '별도 계산', hourly: '자동 계산', hourlyBased: '자동 계산' },
  { label: '연장/야간 수당', monthly: '시프트 필요', hourly: '자동 분리', hourlyBased: '시프트 필요' },
  { label: '적용방식 표시', monthly: false, hourly: false, hourlyBased: true },
];

const COLUMNS = [
  { key: 'monthly' as const, title: '월급제', color: 'blue', icon: 'account_balance' },
  { key: 'hourly' as const, title: '시급제', color: 'green', icon: 'schedule' },
  { key: 'hourlyBased' as const, title: '시급기반 월급제', color: 'purple', icon: 'verified' },
];

type FieldKey = 'monthly' | 'hourly' | 'hourlyBased';

function CellContent({ value }: { value: boolean | string }) {
  if (value === true) return <span className="text-green-600 font-bold">O</span>;
  if (value === false) return <span className="text-gray-300">-</span>;
  return <span className="text-xs text-gray-700 font-medium">{value}</span>;
}

export default function WageTypeFieldMap() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[24px]">compare</span>
        <h3 className="text-lg font-bold text-gray-900">급여유형별 입력 필드 비교</h3>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        어떤 유형을 선택하느냐에 따라 입력해야 하는 필드가 달라집니다.
      </p>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-sm font-medium text-gray-500 py-3 px-4 w-1/4">필드</th>
              {COLUMNS.map((col) => (
                <th key={col.key} className="text-center py-3 px-4">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">{col.icon}</span>
                    <span className="text-sm font-bold">{col.title}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FIELD_ROWS.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
                <td className="text-sm text-gray-700 py-3 px-4 font-medium">{row.label}</td>
                {COLUMNS.map((col) => (
                  <td key={col.key} className="text-center py-3 px-4">
                    <CellContent value={row[col.key]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {COLUMNS.map((col) => (
          <div key={col.key} className={`bg-${col.color}-50 border border-${col.color}-200 rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[20px]">{col.icon}</span>
              <span className="font-bold text-sm">{col.title}</span>
            </div>
            <div className="space-y-2">
              {FIELD_ROWS.map((row, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{row.label}</span>
                  <CellContent value={row[col.key as FieldKey]} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-blue-50 rounded-lg px-4 py-3">
        <p className="text-xs text-blue-800">
          <span className="font-medium">TIP:</span> 시프트가 "필수"인 시급제는 실제 근무 기록을 반드시 입력해야 합니다.
          월급제·시급기반 월급제는 연장/야간근로가 있을 때만 입력하면 됩니다.
        </p>
      </div>
    </div>
  );
}
