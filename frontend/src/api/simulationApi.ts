/**
 * 급여 구조 시뮬레이션 API 클라이언트
 */

import { apiClient } from './client';
import type {
  SimulationCompareRequest,
  SimulationCompareResponse,
  SimulationSingleRequest,
  SimulationPlan,
} from '../types/simulation';

/**
 * 급여 구조 비교 시뮬레이션
 */
export async function compareStructures(
  request: SimulationCompareRequest
): Promise<SimulationCompareResponse> {
  // API 요청 시 snake_case → camelCase 변환
  const apiRequest = {
    monthlyTotal: request.monthly_total,
    weeklyHours: request.weekly_hours,
    expectedOvertimeHours: request.expected_overtime_hours,
    expectedNightHours: request.expected_night_hours,
    expectedHolidayHours: request.expected_holiday_hours,
    baseSalaryRatioA: request.base_salary_ratio_a,
    baseSalaryRatioB: request.base_salary_ratio_b,
  };

  const response = await apiClient.post<SimulationCompareResponse>(
    '/api/v1/simulation/compare',
    apiRequest
  );

  // API 응답 camelCase → snake_case 변환
  return transformCompareResponse(response);
}

/**
 * 단일 플랜 시뮬레이션
 */
export async function simulateSingle(
  request: SimulationSingleRequest
): Promise<SimulationPlan> {
  const apiRequest = {
    monthlyTotal: request.monthly_total,
    baseSalaryRatio: request.base_salary_ratio,
    weeklyHours: request.weekly_hours,
    expectedOvertimeHours: request.expected_overtime_hours,
    expectedNightHours: request.expected_night_hours,
    expectedHolidayHours: request.expected_holiday_hours,
  };

  const response = await apiClient.post<SimulationPlan>(
    '/api/v1/simulation/single',
    apiRequest
  );

  return transformPlanResponse(response);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformPlanResponse(data: any): SimulationPlan {
  return {
    name: data.name,
    base_salary: transformMoney(data.baseSalary),
    allowances: transformMoney(data.allowances),
    monthly_total: transformMoney(data.monthlyTotal),
    hourly_wage: transformMoney(data.hourlyWage),
    overtime_pay: transformMoney(data.overtimePay),
    night_pay: transformMoney(data.nightPay),
    holiday_pay: transformMoney(data.holidayPay),
    weekly_holiday_pay: transformMoney(data.weeklyHolidayPay),
    severance_pay: transformMoney(data.severancePay),
    annual_leave_pay: transformMoney(data.annualLeavePay),
    annual_employer_cost: transformMoney(data.annualEmployerCost),
    calculation: {
      hourly_wage_formula: data.calculation.hourlyWageFormula,
      overtime_formula: data.calculation.overtimeFormula,
      severance_formula: data.calculation.severanceFormula,
      annual_cost_formula: data.calculation.annualCostFormula,
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformCompareResponse(data: any): SimulationCompareResponse {
  return {
    plan_a: transformPlanResponse(data.planA),
    plan_b: transformPlanResponse(data.planB),
    difference: {
      hourly_wage_diff: transformMoney(data.difference.hourlyWageDiff),
      overtime_pay_diff: transformMoney(data.difference.overtimePayDiff),
      severance_pay_diff: transformMoney(data.difference.severancePayDiff),
      annual_cost_diff: transformMoney(data.difference.annualCostDiff),
      annual_cost_diff_percent: data.difference.annualCostDiffPercent,
    },
    recommendation: data.recommendation,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformMoney(data: any) {
  return {
    amount: data.amount,
    formatted: data.formatted,
  };
}

export const simulationApi = {
  compareStructures,
  simulateSingle,
};
