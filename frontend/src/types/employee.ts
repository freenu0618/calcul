/**
 * Employee 관련 타입 정의
 */

export type EmploymentType = 'FULL_TIME' | 'PART_TIME';
export type CompanySize = 'OVER_5' | 'UNDER_5';

/**
 * 체류자격 타입 (외국인 근로자)
 */
export type VisaType =
  | 'E-9' // 비전문취업
  | 'F-2' // 거주
  | 'F-4' // 재외동포
  | 'F-5' // 영주
  | 'F-6' // 결혼이민
  | 'H-2' // 방문취업
  | 'D-7' // 주재
  | 'D-8' // 기업투자
  | 'D-9'; // 무역경영

/**
 * 근무자 등록/수정 요청
 */
export interface EmployeeRequest {
  name: string;
  resident_id_prefix: string;
  contract_start_date: string; // YYYY-MM-DD
  employment_type: EmploymentType;
  company_size: CompanySize;
  visa_type?: string | null;
  work_start_time?: string; // HH:mm
  work_end_time?: string; // HH:mm
  break_minutes?: number;
  weekly_work_days?: number;
  daily_work_hours?: number;
  probation_months?: number;
  probation_rate?: number;
}

/**
 * 근무자 응답
 */
export interface EmployeeResponse {
  id: string;
  name: string;
  resident_id_prefix: string;
  birth_date: string;
  age: number;
  is_foreigner: boolean;
  visa_type: string | null;
  contract_start_date: string;
  employment_type: EmploymentType;
  company_size: CompanySize;
  work_start_time: string;
  work_end_time: string;
  break_minutes: number;
  weekly_work_days: number;
  daily_work_hours: number;
  probation_months: number;
  probation_rate: number;
  is_pension_eligible: boolean;
  is_in_probation: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 근무자 목록 응답
 */
export interface EmployeeListResponse {
  employees: EmployeeResponse[];
  total_count: number;
}

/**
 * 급여 기간 설정
 */
export interface PayrollConfig {
  period_start_day: number; // 급여 기간 시작일 (기본: 1)
  period_end_day: number; // 급여 기간 종료일 (기본: 0=말일)
  pay_day: number; // 급여 지급일 (기본: 20)
  weekly_holiday: number; // 주휴일 (0=일, 1=월, ..., 6=토)
  week_start_day: number; // 주 시작일 (0=일, 1=월)
}

/**
 * 체류자격별 보험 적용 규칙
 */
export const VISA_INSURANCE_RULES: Record<
  string,
  {
    national_pension: 'required' | 'optional' | 'reciprocal';
    health_insurance: 'required';
    employment_insurance: 'required' | 'optional' | 'reciprocal';
    industrial_accident: 'required';
  }
> = {
  'F-2': {
    national_pension: 'required',
    health_insurance: 'required',
    employment_insurance: 'required',
    industrial_accident: 'required',
  },
  'F-5': {
    national_pension: 'required',
    health_insurance: 'required',
    employment_insurance: 'required',
    industrial_accident: 'required',
  },
  'F-6': {
    national_pension: 'required',
    health_insurance: 'required',
    employment_insurance: 'required',
    industrial_accident: 'required',
  },
  'E-9': {
    national_pension: 'optional',
    health_insurance: 'required',
    employment_insurance: 'optional',
    industrial_accident: 'required',
  },
  'H-2': {
    national_pension: 'optional',
    health_insurance: 'required',
    employment_insurance: 'optional',
    industrial_accident: 'required',
  },
  'F-4': {
    national_pension: 'optional',
    health_insurance: 'required',
    employment_insurance: 'optional',
    industrial_accident: 'required',
  },
  'D-7': {
    national_pension: 'reciprocal',
    health_insurance: 'required',
    employment_insurance: 'reciprocal',
    industrial_accident: 'required',
  },
  'D-8': {
    national_pension: 'reciprocal',
    health_insurance: 'required',
    employment_insurance: 'reciprocal',
    industrial_accident: 'required',
  },
  'D-9': {
    national_pension: 'reciprocal',
    health_insurance: 'required',
    employment_insurance: 'reciprocal',
    industrial_accident: 'required',
  },
};
