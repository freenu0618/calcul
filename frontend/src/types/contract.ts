/**
 * 근로계약서 관련 타입 정의
 * 참조: 고용노동부 표준근로계약서 양식
 */

/**
 * 임금 지급 방법
 */
export type PaymentMethod = 'BANK_TRANSFER' | 'CASH' | 'OTHER';

/**
 * 수당 항목
 */
export interface ContractAllowance {
  name: string;
  amount: number;
  is_taxable: boolean;
  is_included_in_regular_wage: boolean;
}

/**
 * 근로계약서 데이터
 */
export interface LaborContract {
  // 계약 당사자
  employer: {
    company_name: string;
    representative_name: string;
    business_number: string;
    address: string;
    phone: string;
  };
  employee: {
    name: string;
    resident_id_prefix: string; // 주민번호 앞 7자리
    address: string;
    phone: string;
  };

  // 계약 기간
  contract_date: string; // 계약 체결일 (YYYY-MM-DD)
  contract_start_date: string; // 근로 시작일
  contract_end_date?: string; // 근로 종료일 (무기계약은 null)
  is_indefinite: boolean; // 무기계약 여부

  // 수습 기간
  has_probation: boolean;
  probation_months: number;
  probation_rate: number; // 수습 급여 비율 (%)

  // 근무 장소 및 업무
  workplace: string; // 근무 장소
  job_title: string; // 직위/직책
  job_description: string; // 담당 업무

  // 근로 시간
  work_start_time: string; // 시업 시각 (HH:mm)
  work_end_time: string; // 종업 시각 (HH:mm)
  break_minutes: number; // 휴게 시간 (분)
  weekly_work_days: number; // 주 소정근로일수
  weekly_holiday: string; // 주휴일 (예: '일요일')

  // 연장/야간/휴일 근로
  overtime_agreement: boolean; // 연장근로 합의 여부
  overtime_rate: number; // 연장근로 가산율 (1.5 = 150%)
  night_rate: number; // 야간근로 가산율
  holiday_rate: number; // 휴일근로 가산율

  // 임금
  wage_type: 'MONTHLY' | 'HOURLY' | 'DAILY'; // 급여 형태
  base_salary: number; // 기본급
  hourly_wage?: number; // 시급 (시급제의 경우)
  allowances: ContractAllowance[]; // 수당 목록

  // 임금 지급
  pay_day: number; // 급여 지급일 (1~31)
  payment_method: PaymentMethod;
  bank_name?: string;
  account_number?: string;
  account_holder?: string;

  // 기타
  social_insurance: {
    national_pension: boolean;
    health_insurance: boolean;
    employment_insurance: boolean;
    industrial_accident: boolean;
  };
  annual_leave_info: string; // 연차휴가 안내
  other_terms?: string; // 기타 약정사항
}

/**
 * 계약서 폼 초기값
 */
export const DEFAULT_CONTRACT: LaborContract = {
  employer: {
    company_name: '',
    representative_name: '',
    business_number: '',
    address: '',
    phone: '',
  },
  employee: {
    name: '',
    resident_id_prefix: '',
    address: '',
    phone: '',
  },
  contract_date: new Date().toISOString().split('T')[0],
  contract_start_date: new Date().toISOString().split('T')[0],
  is_indefinite: true,
  has_probation: false,
  probation_months: 3,
  probation_rate: 100,
  workplace: '',
  job_title: '',
  job_description: '',
  work_start_time: '09:00',
  work_end_time: '18:00',
  break_minutes: 60,
  weekly_work_days: 5,
  weekly_holiday: '일요일',
  overtime_agreement: true,
  overtime_rate: 1.5,
  night_rate: 0.5,
  holiday_rate: 1.5,
  wage_type: 'MONTHLY',
  base_salary: 0,
  allowances: [],
  pay_day: 10,
  payment_method: 'BANK_TRANSFER',
  social_insurance: {
    national_pension: true,
    health_insurance: true,
    employment_insurance: true,
    industrial_accident: true,
  },
  annual_leave_info:
    '근로기준법에 따라 1년간 80% 이상 출근 시 15일의 유급휴가 부여',
};

/**
 * 요일 옵션
 */
export const WEEKDAY_OPTIONS = [
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
  '일요일',
];
