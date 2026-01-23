/**
 * 근무 요약 및 결근 공제 표시 컴포넌트
 */

import type { WorkSummaryResponse, AbsenceBreakdown } from '../../types/salary';

interface WorkSummaryProps {
  summary: WorkSummaryResponse;
  absence?: AbsenceBreakdown;
}

const POLICY_LABELS: Record<string, string> = {
  STRICT: '엄격 (일급 공제 + 주휴 미지급)',
  MODERATE: '보통 (주휴수당만 미지급)',
  LENIENT: '관대 (공제 없음)',
};

export default function WorkSummary({ summary, absence }: WorkSummaryProps) {
  return (
    <div className="space-y-4">
      {/* 근무 요약 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          근무 요약 ({summary.calculation_month})
        </h3>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <SummaryCard label="소정근로일" value={`${summary.scheduled_days}일`} />
          <SummaryCard label="실제 근무일" value={`${summary.actual_work_days}일`} />
          <SummaryCard
            label="결근일"
            value={`${summary.absent_days}일`}
            highlight={summary.absent_days > 0}
          />
        </div>

        {/* 시간 상세 */}
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-medium text-gray-500 mb-2">근로시간 상세</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <HoursRow label="총 근무시간" value={summary.total_work_hours.formatted} />
            <HoursRow label="소정근로시간" value={summary.regular_hours.formatted} />
            <HoursRow label="연장근로" value={summary.overtime_hours.formatted} />
            <HoursRow label="야간근로" value={summary.night_hours.formatted} />
            <HoursRow label="휴일근로" value={summary.holiday_hours.formatted} />
            <HoursRow
              label="주휴수당 발생"
              value={`${summary.weekly_holiday_weeks}/${summary.total_weeks}주`}
            />
          </div>
        </div>
      </div>

      {/* 결근 공제 상세 */}
      {absence && absence.absent_days > 0 && (
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
          <h3 className="text-sm font-semibold text-orange-800 mb-3">결근 공제 내역</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">적용 정책</span>
              <span className="font-medium">{POLICY_LABELS[absence.absence_policy] || absence.absence_policy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">일급</span>
              <span>{absence.daily_wage.formatted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">일급 공제 ({absence.absent_days}일)</span>
              <span className="text-red-600">-{absence.wage_deduction.formatted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">주휴수당 미지급</span>
              <span className="text-red-600">-{absence.holiday_pay_loss.formatted}</span>
            </div>
            <div className="flex justify-between border-t border-orange-200 pt-2 font-semibold">
              <span>총 결근 공제액</span>
              <span className="text-red-700">-{absence.total_deduction.formatted}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, highlight = false }: {
  label: string; value: string; highlight?: boolean;
}) {
  return (
    <div className={`text-center p-2 rounded-lg ${highlight ? 'bg-red-50' : 'bg-gray-50'}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-red-600' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}

function HoursRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-2 py-1">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
