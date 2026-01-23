/**
 * 급여 계산 API 타입 정의
 * 백엔드 API 스키마와 동기화
 */

export type EmploymentType = 'FULL_TIME' | 'PART_TIME';
export type CompanySize = 'UNDER_5' | 'OVER_5';
export type WageType = 'MONTHLY' | 'HOURLY';
export type AbsencePolicy = 'STRICT' | 'MODERATE' | 'LENIENT';
export type HoursMode = '174' | '209';

export interface MoneyResponse {
  amount: number;
  formatted: string;
}

export interface WorkingHoursResponse {
  hours: number;
  minutes: number;
  total_minutes: number;
  formatted: string;
}

export interface EmployeeRequest {
  name: string;
  dependents_count: number;
  children_under_20: number;
  employment_type: EmploymentType;
  company_size: CompanySize;
  scheduled_work_days: number; // 주 소정근로일 (계약상 주당 근무일 수)
  daily_work_hours: number; // 1일 소정근로시간 (기본 8)
}

export interface AllowanceRequest {
  name: string;
  amount: number;
  is_taxable: boolean;
  is_includable_in_minimum_wage: boolean;
  is_fixed: boolean;
  is_included_in_regular_wage: boolean;
}

export interface WorkShiftRequest {
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  break_minutes: number;
  is_holiday_work: boolean;
}

export interface OvertimeBreakdown {
  overtime_hours: WorkingHoursResponse;
  overtime_pay: MoneyResponse;
  night_hours: WorkingHoursResponse;
  night_pay: MoneyResponse;
  holiday_hours: WorkingHoursResponse;
  holiday_pay: MoneyResponse;
  total: MoneyResponse;
}

export interface WeeklyHolidayPayBreakdown {
  amount: MoneyResponse;
  weekly_hours: WorkingHoursResponse;
  is_proportional: boolean;
  calculation: string;
}

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

export interface InsuranceBreakdown {
  national_pension: MoneyResponse;
  health_insurance: MoneyResponse;
  long_term_care: MoneyResponse;
  employment_insurance: MoneyResponse;
  total: MoneyResponse;
}

export interface TaxBreakdown {
  income_tax: MoneyResponse;
  local_income_tax: MoneyResponse;
  total: MoneyResponse;
}

export interface DeductionsBreakdown {
  insurance: InsuranceBreakdown;
  tax: TaxBreakdown;
  total: MoneyResponse;
}

export interface SalaryCalculationRequest {
  employee: EmployeeRequest;
  base_salary: number;
  allowances: AllowanceRequest[];
  work_shifts: WorkShiftRequest[];
  wage_type: WageType;
  hourly_wage: number;
  calculation_month: string;
  absence_policy: AbsencePolicy;
  hours_mode: HoursMode;
}

export interface WorkSummaryResponse {
  calculation_month: string;
  wage_type: string;
  scheduled_days: number;
  actual_work_days: number;
  absent_days: number;
  total_work_hours: WorkingHoursResponse;
  regular_hours: WorkingHoursResponse;
  overtime_hours: WorkingHoursResponse;
  night_hours: WorkingHoursResponse;
  holiday_hours: WorkingHoursResponse;
  weekly_holiday_weeks: number;
  total_weeks: number;
}

export interface AbsenceBreakdown {
  scheduled_days: number;
  actual_work_days: number;
  absent_days: number;
  daily_wage: MoneyResponse;
  wage_deduction: MoneyResponse;
  holiday_pay_loss: MoneyResponse;
  total_deduction: MoneyResponse;
  absence_policy: string;
}

export interface WarningItem {
  level: 'critical' | 'warning' | 'info';
  message: string;
  detail: string;
}

export interface SalaryCalculationResponse {
  employee_name: string;
  gross_breakdown: GrossBreakdown;
  deductions_breakdown: DeductionsBreakdown;
  net_pay: MoneyResponse;
  work_summary?: WorkSummaryResponse;
  absence_breakdown?: AbsenceBreakdown;
  warnings: WarningItem[];
  calculation_metadata: {
    calculation_date: string;
    tax_year: number;
    insurance_year: number;
    wage_type?: string;
  };
}

export interface ReverseSalaryRequest {
  target_net_pay: number;
  employee: EmployeeRequest;
  allowances: AllowanceRequest[];
  work_shifts: WorkShiftRequest[];
  wage_type: WageType;
  calculation_month: string;
  absence_policy: AbsencePolicy;
}

export interface ReverseSalaryResponse {
  target_net_pay: MoneyResponse;
  required_base_salary: MoneyResponse;
  actual_net_pay: MoneyResponse;
  difference: MoneyResponse;
  iterations: number;
  calculation_result: SalaryCalculationResponse;
  warnings: WarningItem[];
}

export interface ErrorResponse {
  error: string;
  detail: string;
}
