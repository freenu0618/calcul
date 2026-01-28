/**
 * 급여대장 관련 타입 정의
 */

/** 급여 기간 상태 */
export type PayrollStatus = 'DRAFT' | 'CONFIRMED' | 'PAID';

/** 계약 유형 */
export type ContractType = 'MONTHLY' | 'HOURLY';

/** 근무 계약 응답 */
export interface WorkContractResponse {
  id: number;
  employee_id: string;
  contract_type: ContractType;
  base_amount: number;
  scheduled_hours_per_week: number;
  scheduled_days_per_week: number;
  effective_date: string;
  end_date: string | null;
  allowances_json: string;
  is_current: boolean;
  created_at: string;
}

/** 출퇴근 기록 응답 */
export interface WorkShiftResponse {
  id: number;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  is_holiday_work: boolean;
  working_minutes: number;
  night_minutes: number;
  memo: string | null;
}

/** 급여 기간 응답 */
export interface PayrollPeriodResponse {
  id: number;
  year: number;
  month: number;
  status: PayrollStatus;
  confirmed_at: string | null;
  paid_at: string | null;
  memo: string | null;
  employee_count: number;
  total_gross: number;
  total_net_pay: number;
  created_at: string;
}

/** 급여 엔트리 응답 */
export interface PayrollEntryResponse {
  id: number;
  payroll_period_id: number;
  employee_id: string;
  employee_name: string | null;
  base_salary: number;
  regular_wage: number | null;
  hourly_wage: number | null;
  overtime_pay: number | null;
  night_pay: number | null;
  holiday_pay: number | null;
  weekly_holiday_pay: number | null;
  total_gross: number | null;
  national_pension: number | null;
  health_insurance: number | null;
  long_term_care: number | null;
  employment_insurance: number | null;
  income_tax: number | null;
  local_income_tax: number | null;
  total_deductions: number | null;
  net_pay: number | null;
  total_work_minutes: number;
  overtime_minutes: number;
  night_minutes: number;
  holiday_minutes: number;
}

/** 급여대장 응답 (기간 + 엔트리 목록) */
export interface PayrollLedgerResponse {
  period: PayrollPeriodResponse;
  entries: PayrollEntryResponse[];
}

/** 급여 기간 목록 응답 */
export interface PayrollPeriodListResponse {
  periods: PayrollPeriodResponse[];
  total_count: number;
}

// ==================== 요청 타입 ====================

/** 급여 기간 생성 요청 */
export interface PayrollPeriodCreateRequest {
  year: number;
  month: number;
  memo?: string;
}

/** 급여 기간 상태 변경 요청 */
export interface PayrollPeriodStatusRequest {
  status: PayrollStatus;
}

/** 급여 엔트리 생성 요청 */
export interface PayrollEntryRequest {
  employee_id: string;
  contract_id?: number;
  base_salary: number;
  allowances_json?: string;
  total_work_minutes?: number;
  overtime_minutes?: number;
  night_minutes?: number;
  holiday_minutes?: number;
}

/** 출퇴근 기록 생성 요청 */
export interface WorkShiftCreateRequest {
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  break_minutes?: number;
  is_holiday_work?: boolean;
  memo?: string;
}

/** 근무 계약 생성 요청 */
export interface WorkContractCreateRequest {
  employee_id: string;
  contract_type: ContractType;
  base_amount: number;
  scheduled_hours_per_week?: number;
  scheduled_days_per_week?: number;
  effective_date: string;
  end_date?: string;
  allowances_json?: string;
}

/** 월간 템플릿 설정 */
export interface MonthlyTemplateConfig {
  days: boolean[]; // [일, 월, 화, 수, 목, 금, 토]
  start_time: string;
  end_time: string;
  break_minutes: number;
}
