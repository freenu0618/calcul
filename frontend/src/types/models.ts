/**
 * 도메인 모델 TypeScript 타입 정의
 * 백엔드 Entity/Value Object와 일치
 */

// 고용 형태
export type EmploymentType = 'FULL_TIME' | 'PART_TIME';

// 사업장 규모
export type CompanySize = 'UNDER_5' | 'OVER_5';

// 근로자 정보
export interface Employee {
  name: string;
  dependents_count: number;
  children_under_20: number;
  employment_type: EmploymentType;
  company_size: CompanySize;
  scheduled_work_days: number; // 주 소정근로일 (1~7)
}

// 근무 시프트
export interface WorkShift {
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  break_minutes: number;
  is_holiday_work: boolean;
}

// 수당
export interface Allowance {
  name: string;
  amount: number;
  is_taxable: boolean;
  is_includable_in_minimum_wage: boolean;
  is_fixed: boolean;
  is_included_in_regular_wage: boolean;
}

// 금액 응답 (포맷팅 포함)
export interface MoneyResponse {
  amount: number;
  formatted: string;
}

// 근로시간 응답
export interface WorkingHoursResponse {
  hours: number;
  minutes: number;
  total_minutes: number;
  formatted: string;
}
