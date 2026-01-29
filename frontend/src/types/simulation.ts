/**
 * 급여 구조 시뮬레이션 타입 정의
 */

import type { MoneyResponse } from './salary';

/**
 * 시뮬레이션 계산식 상세
 */
export interface SimulationCalculation {
  hourly_wage_formula: string;
  overtime_formula: string;
  severance_formula: string;
  annual_cost_formula: string;
}

/**
 * 시뮬레이션 플랜
 */
export interface SimulationPlan {
  name: string;
  base_salary: MoneyResponse;
  allowances: MoneyResponse;
  monthly_total: MoneyResponse;
  hourly_wage: MoneyResponse;
  overtime_pay: MoneyResponse;
  night_pay: MoneyResponse;
  holiday_pay: MoneyResponse;
  weekly_holiday_pay: MoneyResponse;
  severance_pay: MoneyResponse;
  annual_leave_pay: MoneyResponse;
  annual_employer_cost: MoneyResponse;
  calculation: SimulationCalculation;
}

/**
 * 플랜 간 차이 분석
 */
export interface SimulationDifference {
  hourly_wage_diff: MoneyResponse;
  overtime_pay_diff: MoneyResponse;
  severance_pay_diff: MoneyResponse;
  annual_cost_diff: MoneyResponse;
  annual_cost_diff_percent: number;
}

/**
 * 급여 구조 비교 시뮬레이션 응답
 */
export interface SimulationCompareResponse {
  plan_a: SimulationPlan;
  plan_b: SimulationPlan;
  difference: SimulationDifference;
  recommendation: string;
}

/**
 * 급여 구조 비교 시뮬레이션 요청
 */
export interface SimulationCompareRequest {
  monthly_total: number;
  weekly_hours: number;
  expected_overtime_hours: number;
  expected_night_hours: number;
  expected_holiday_hours: number;
  base_salary_ratio_a: number;
  base_salary_ratio_b: number;
}

/**
 * 단일 플랜 시뮬레이션 요청
 */
export interface SimulationSingleRequest {
  monthly_total: number;
  base_salary_ratio: number;
  weekly_hours: number;
  expected_overtime_hours: number;
  expected_night_hours: number;
  expected_holiday_hours: number;
}

/**
 * 기본 시뮬레이션 요청 값
 */
export const DEFAULT_SIMULATION_REQUEST: SimulationCompareRequest = {
  monthly_total: 2500000,
  weekly_hours: 40,
  expected_overtime_hours: 0,
  expected_night_hours: 0,
  expected_holiday_hours: 0,
  base_salary_ratio_a: 1.0,
  base_salary_ratio_b: 0.6,
};
