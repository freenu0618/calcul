import React, { useMemo } from 'react';

interface MonthlyWageSimulationProps {
  hourlyWage: number;
  contractMonthlySalary: number;
  scheduledWorkDays: number;
  dailyWorkHours: number;
  hoursMode: '174' | '209';
  year?: number;
}

const PUBLIC_HOLIDAYS_2026 = [
  '2026-01-01', '2026-01-29', '2026-01-30', '2026-01-31',
  '2026-03-01', '2026-03-02',
  '2026-05-01', '2026-05-05', '2026-05-24',
  '2026-06-06',
  '2026-08-15', '2026-08-17',
  '2026-09-24', '2026-09-25', '2026-09-26',
  '2026-10-03', '2026-10-05', '2026-10-09',
  '2026-12-25',
];

const MINIMUM_WAGE_2026 = 10320;

/**
 * MonthlyWageSimulation
 *
 * 시급제 월급환산 방식(HOURLY_BASED_MONTHLY) 전용 12개월 시뮬레이션 컴포넌트
 * 각 월의 근무일 수에 따라 유급시간과 시급환산 금액을 계산하여 최저임금 판정
 */
const MonthlyWageSimulation: React.FC<MonthlyWageSimulationProps> = ({
  hourlyWage,
  contractMonthlySalary,
  scheduledWorkDays,
  dailyWorkHours,
  hoursMode,
  year = 2026,
}) => {
  const monthlyData = useMemo(() => {
    const holidays = new Set(PUBLIC_HOLIDAYS_2026);

    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const daysInMonth = new Date(year, month, 0).getDate();

      // 근무일 계산
      let workDays = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, i, day);
        const dayOfWeek = date.getDay(); // 0=일, 6=토
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // 공휴일 제외
        if (holidays.has(dateStr)) continue;

        // 주 5일제: 토일 제외
        if (scheduledWorkDays === 5 && (dayOfWeek === 0 || dayOfWeek === 6)) continue;
        // 주 6일제: 일요일만 제외
        if (scheduledWorkDays === 6 && dayOfWeek === 0) continue;
        // 주 4일제: 금토일 제외
        if (scheduledWorkDays === 4 && (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6)) continue;

        workDays++;
      }

      // 주휴시간 계산 (주 단위 환산)
      const weeksInMonth = workDays / scheduledWorkDays;
      const weeklyHolidayHours = weeksInMonth * 8;

      // 유급시간 = 실근무 + 주휴
      const actualWorkHours = workDays * dailyWorkHours;
      const paidHours = actualWorkHours + weeklyHolidayHours;

      // 시급환산 = 계약월급 / 유급시간
      const convertedHourlyWage = paidHours > 0 ? contractMonthlySalary / paidHours : 0;

      // 실제 계산 금액 = (실근무 × 시급) + (주휴시간 × 시급)
      const actualCalculated = (actualWorkHours * hourlyWage) + (weeklyHolidayHours * hourlyWage);

      // 적용 모드 판정
      const appliedSalary = Math.max(contractMonthlySalary, actualCalculated);
      const appliedMode = actualCalculated > contractMonthlySalary ? '실제' : '계약';

      // 최저임금 판정
      const isAboveMinimum = convertedHourlyWage >= MINIMUM_WAGE_2026;

      return {
        month,
        workDays,
        paidHours: Math.round(paidHours * 10) / 10,
        convertedHourlyWage: Math.round(convertedHourlyWage),
        isAboveMinimum,
        appliedMode,
        appliedSalary: Math.round(appliedSalary),
      };
    });
  }, [year, scheduledWorkDays, dailyWorkHours, contractMonthlySalary, hourlyWage]);

  // 안전 월급 추천 (가장 근무일 많은 달 기준)
  const safeMonthlySalary = useMemo(() => {
    const maxPaidHours = Math.max(...monthlyData.map(d => d.paidHours));
    const recommended = maxPaidHours * MINIMUM_WAGE_2026;
    return Math.ceil(recommended / 10000) * 10000; // 만원 단위 올림
  }, [monthlyData]);

  const hasViolation = monthlyData.some(d => !d.isAboveMinimum);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          12개월 최저임금 시뮬레이션
        </h3>
        <span className="text-sm text-gray-500">
          {hoursMode === '174' ? '174시간 기준' : '209시간 기준'}
        </span>
      </div>

      {hasViolation && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">
            <strong>경고:</strong> 일부 월에서 최저임금(시급 {MINIMUM_WAGE_2026.toLocaleString()}원) 미달이 발생합니다.
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">월</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">근무일</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">유급시간</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">시급환산</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">판정</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">적용모드</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {monthlyData.map((data) => (
              <tr key={data.month} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">{data.month}월</td>
                <td className="px-4 py-3 text-right text-gray-700">{data.workDays}일</td>
                <td className="px-4 py-3 text-right text-gray-700">{data.paidHours}시간</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {data.convertedHourlyWage.toLocaleString()}원
                </td>
                <td className="px-4 py-3 text-center">
                  {data.isAboveMinimum ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      적정
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      미달
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    data.appliedMode === '실제'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {data.appliedMode}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">안전 월급 추천</h4>
            <p className="text-sm text-blue-700">
              연중 모든 달에서 최저임금을 충족하려면 <strong>{safeMonthlySalary.toLocaleString()}원</strong> 이상으로 계약월급을 설정하세요.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>• 유급시간 = (근무일 × 1일근무시간) + 주휴시간</p>
        <p>• 시급환산 = 계약월급 ÷ 유급시간</p>
        <p>• 적용모드: 실제 계산 금액과 계약월급 중 큰 값을 적용</p>
        <p>• 공휴일 제외: 2026년 법정 공휴일 19일 반영</p>
      </div>
    </div>
  );
};

export default MonthlyWageSimulation;
