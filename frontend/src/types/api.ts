/**
 * API 요청/응답 TypeScript 타입 정의
 * 백엔드 Pydantic 스키마와 일치
 */

import type { Employee, WorkShift, Allowance, MoneyResponse, WorkingHoursResponse } from './models';

// ========== Salary API ==========

// 급여 계산 요청
export interface SalaryCalculationRequest {
  employee: Employee;
  base_salary: number;
  allowances: Allowance[];
  work_shifts: WorkShift[];
}

// 가산수당 상세
export interface OvertimeBreakdown {
  overtime_hours: WorkingHoursResponse;
  overtime_pay: MoneyResponse;
  night_hours: WorkingHoursResponse;
  night_pay: MoneyResponse;
  holiday_hours: WorkingHoursResponse;
  holiday_pay: MoneyResponse;
  total: MoneyResponse;
}

// 주휴수당 상세
export interface WeeklyHolidayPayBreakdown {
  amount: MoneyResponse;
  weekly_hours: WorkingHoursResponse;
  is_proportional: boolean;
  calculation: string;
}

// 총 급여 breakdown
export interface GrossBreakdown {
  base_salary: MoneyResponse;
  regular_wage: MoneyResponse;
  hourly_wage: MoneyResponse;
  taxable_allowances: MoneyResponse;
  non_taxable_allowances: MoneyResponse;
  overtime_allowances: OvertimeBreakdown;
  weekly_holiday_pay: WeeklyHolidayPayBreakdown;
  total: MoneyResponse;
}

// 보험료 breakdown
export interface InsuranceBreakdown {
  national_pension: MoneyResponse;
  health_insurance: MoneyResponse;
  long_term_care: MoneyResponse;
  employment_insurance: MoneyResponse;
  total: MoneyResponse;
}

// 세금 breakdown
export interface TaxBreakdown {
  income_tax: MoneyResponse;
  local_income_tax: MoneyResponse;
  total: MoneyResponse;
}

// 공제 breakdown
export interface DeductionsBreakdown {
  insurance: InsuranceBreakdown;
  tax: TaxBreakdown;
  total: MoneyResponse;
}

// 경고 메시지
export interface WarningItem {
  level: 'critical' | 'warning' | 'info';
  message: string;
  detail: string;
}

// 급여 계산 응답
export interface SalaryCalculationResponse {
  employee_name: string;
  gross_breakdown: GrossBreakdown;
  deductions_breakdown: DeductionsBreakdown;
  net_pay: MoneyResponse;
  warnings: WarningItem[];
  calculation_metadata: {
    calculation_date: string;
    tax_year: number;
    insurance_year: number;
  };
}

// ========== Insurance API ==========

// 보험료율 응답
export interface InsuranceRatesResponse {
  year: number;
  national_pension: {
    rate: number;
    lower_limit: number;
    upper_limit: number;
    description: string;
  };
  health_insurance: {
    rate: number;
    description: string;
  };
  long_term_care: {
    rate: number;
    description: string;
  };
  employment_insurance: {
    rate: number;
    upper_limit: number;
    description: string;
  };
}

// 보험료 계산 요청
export interface InsuranceCalculationRequest {
  gross_income: number;
}

// 보험료 계산 응답
export interface InsuranceCalculationResponse {
  national_pension: MoneyResponse;
  health_insurance: MoneyResponse;
  long_term_care: MoneyResponse;
  employment_insurance: MoneyResponse;
  total: number;
}

// ========== Tax API ==========

// 세금 계산 요청
export interface TaxCalculationRequest {
  taxable_income: number;
  dependents_count: number;
  children_under_20: number;
}

// 세금 계산 응답
export interface TaxCalculationResponse {
  income_tax: MoneyResponse;
  local_income_tax: MoneyResponse;
  total: number;
}

// 연간 세금 추정 요청
export interface AnnualTaxEstimateRequest {
  monthly_income: number;
  dependents_count: number;
  children_under_20: number;
}

// 연간 세금 추정 응답
export interface AnnualTaxEstimateResponse {
  monthly_tax: number;
  annual_tax: number;
  note: string;
}

// ========== Error Response ==========

export interface ErrorResponse {
  error: string;
  detail: string;
}
