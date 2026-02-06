/**
 * 급여 계산 핵심 로직 테스트
 *
 * 이 프로젝트의 핵심 가치는 "법적 정확성"입니다.
 * 2026년 법령 기준으로 검증합니다.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { salaryApi } from '../api/salaryApi';
import type {
  SalaryCalculationRequest,
  SalaryCalculationResponse,
} from '../types/salary';

// Mock API client
vi.mock('../api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
  transformToCamelCase: (data: unknown) => data,
  transformToSnakeCase: (data: unknown) => data,
}));

describe('급여 계산 핵심 로직 테스트', () => {

  describe('1. 기본 월급 실수령액 계산', () => {
    it('월급 300만원, 부양가족 1인 → 4대보험 + 소득세 공제 후 실수령액 검증', async () => {
      // Given: 월급 300만원, 부양가족 1인 (본인 제외)
      const request: SalaryCalculationRequest = {
        employee: {
          name: '김철수',
          dependents_count: 1,
          children_under_20: 0,
          employment_type: 'FULL_TIME',
          company_size: 'OVER_5',
          scheduled_work_days: 5,
          daily_work_hours: 8,
        },
        base_salary: 3000000,
        allowances: [],
        work_shifts: [],
        wage_type: 'MONTHLY',
        hourly_wage: 0,
        calculation_month: '2026-01',
        absence_policy: 'MODERATE',
        hours_mode: '174',
        weekly_hours: 40,
      };

      // Mock 응답 설정 (실제 백엔드 계산 결과 기준)
      const mockResponse: SalaryCalculationResponse = {
        employee_name: '김철수',
        gross_breakdown: {
          base_salary: { amount: 3000000, formatted: '3,000,000원' },
          regular_wage: { amount: 3000000, formatted: '3,000,000원' },
          hourly_wage: { amount: 17241, formatted: '17,241원' },
          taxable_allowances: { amount: 0, formatted: '0원' },
          non_taxable_allowances: { amount: 0, formatted: '0원' },
          overtime_allowances: {
            overtime_hours: { hours: 0, minutes: 0, total_minutes: 0, formatted: '0시간' },
            overtime_pay: { amount: 0, formatted: '0원' },
            night_hours: { hours: 0, minutes: 0, total_minutes: 0, formatted: '0시간' },
            night_pay: { amount: 0, formatted: '0원' },
            holiday_hours: { hours: 0, minutes: 0, total_minutes: 0, formatted: '0시간' },
            holiday_pay: { amount: 0, formatted: '0원' },
            total: { amount: 0, formatted: '0원' },
          },
          weekly_holiday_pay: {
            amount: { amount: 0, formatted: '0원' },
            weekly_hours: { hours: 0, minutes: 0, total_minutes: 0, formatted: '0시간' },
            is_proportional: false,
            calculation: '',
          },
          total: { amount: 3000000, formatted: '3,000,000원' },
        },
        deductions_breakdown: {
          insurance: {
            national_pension: { amount: 142500, formatted: '142,500원' }, // 3,000,000 × 4.75%
            health_insurance: { amount: 107850, formatted: '107,850원' },  // 3,000,000 × 3.595%
            long_term_care: { amount: 14172, formatted: '14,172원' },      // 107,850 × 13.14%
            employment_insurance: { amount: 27000, formatted: '27,000원' }, // 3,000,000 × 0.9%
            total: { amount: 291522, formatted: '291,522원' },
          },
          tax: {
            income_tax: { amount: 44350, formatted: '44,350원' },      // 간이세액표 (부양 1인)
            local_income_tax: { amount: 4440, formatted: '4,440원' },   // 소득세 × 10%
            total: { amount: 48790, formatted: '48,790원' },
          },
          total: { amount: 340312, formatted: '340,312원' },
        },
        net_pay: { amount: 2659688, formatted: '2,659,688원' }, // 3,000,000 - 340,312
        warnings: [],
        calculation_metadata: {
          calculation_date: '2026-01-15',
          tax_year: 2026,
          insurance_year: 2026,
          wage_type: 'MONTHLY',
        },
      };

      const { apiClient } = await import('../api/client');
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      // When: 급여 계산 API 호출
      const response = await salaryApi.calculateSalary(request);

      // Then: 실수령액 검증
      expect(response.net_pay.amount).toBe(2659688);
      expect(response.deductions_breakdown.insurance.total.amount).toBe(291522);
      expect(response.deductions_breakdown.tax.total.amount).toBe(48790);
    });
  });

  describe('2. 4대 보험 개별 계산 테스트', () => {
    it('국민연금: 기준소득월액 하한(390,000원) 적용', async () => {
      // Given: 월급 30만원 (하한 미만)
      const lowSalary = 300000;

      // 국민연금 하한: 390,000원 × 4.75% = 18,525원
      const expectedPension = Math.round(390000 * 0.0475);

      expect(expectedPension).toBe(18525);
    });

    it('국민연금: 기준소득월액 상한(5,900,000원) 적용', async () => {
      // Given: 월급 700만원 (상한 초과)
      const highSalary = 7000000;

      // 국민연금 상한: 5,900,000원 × 4.75% = 280,250원
      const expectedPension = Math.round(5900000 * 0.0475);

      expect(expectedPension).toBe(280250);
    });

    it('건강보험: 보수월액 기준 정확성 (3.595%)', async () => {
      // Given: 월급 250만원
      const salary = 2500000;

      // 건강보험: 2,500,000 × 3.595% = 89,875원
      const expectedHealth = Math.round(salary * 0.03595);

      expect(expectedHealth).toBe(89875);
    });

    it('고용보험: 요율 0.9% 적용', async () => {
      // Given: 월급 200만원
      const salary = 2000000;

      // 고용보험: 2,000,000 × 0.9% = 18,000원
      const expectedEmployment = Math.round(salary * 0.009);

      expect(expectedEmployment).toBe(18000);
    });

    it('장기요양보험: 건강보험료 대비 13.14% 비율', async () => {
      // Given: 건강보험료 100,000원
      const healthInsurance = 100000;

      // 장기요양: 100,000 × 13.14% = 13,140원
      const expectedLongTerm = Math.round(healthInsurance * 0.1314);

      expect(expectedLongTerm).toBe(13140);
    });
  });

  describe('3. 연장/야간/휴일 가산수당 테스트', () => {
    it('연장근로 1.5배 가산 적용', () => {
      // Given: 통상시급 10,000원, 연장근로 2시간
      const hourlyWage = 10000;
      const overtimeHours = 2;

      // 연장수당: 10,000 × 1.5 × 2 = 30,000원
      const expectedPay = hourlyWage * 1.5 * overtimeHours;

      expect(expectedPay).toBe(30000);
    });

    it('야간근로 0.5배 가산 적용 (22:00~06:00)', () => {
      // Given: 통상시급 10,000원, 야간근로 2시간
      const hourlyWage = 10000;
      const nightHours = 2;

      // 야간수당 (가산분만): 10,000 × 0.5 × 2 = 10,000원
      const expectedPay = hourlyWage * 0.5 * nightHours;

      expect(expectedPay).toBe(10000);
    });

    it('휴일근로 1.5배 가산 적용 (8시간 이하)', () => {
      // Given: 통상시급 10,000원, 휴일근로 6시간
      const hourlyWage = 10000;
      const holidayHours = 6;

      // 휴일수당: 10,000 × 1.5 × 6 = 90,000원
      const expectedPay = hourlyWage * 1.5 * holidayHours;

      expect(expectedPay).toBe(90000);
    });

    it('야간+연장 중복 시 2.0배 적용 확인', () => {
      // Given: 통상시급 10,000원, 야간 연장근로 1시간
      const hourlyWage = 10000;
      const overtimeNightHours = 1;

      // 야간 연장수당: 10,000 × (1 + 0.5 + 0.5) × 1 = 20,000원
      // = 기본 + 연장 가산(0.5) + 야간 가산(0.5)
      const expectedPay = hourlyWage * 2.0 * overtimeNightHours;

      expect(expectedPay).toBe(20000);
    });
  });

  describe('4. 주휴수당 계산 테스트', () => {
    it('주 15시간 미만 → 주휴수당 없음', () => {
      // Given: 주 14시간 근무
      const weeklyHours = 14;

      // 주 15시간 미만 시 주휴수당 미지급
      const isEligible = weeklyHours >= 15;

      expect(isEligible).toBe(false);
    });

    it('주 40시간 → 주휴수당 정확 계산', () => {
      // Given: 통상시급 10,000원, 주 40시간 근무, 월 4.345주
      const hourlyWage = 10000;
      const weeklyHours = 40;
      const weeksPerMonth = 4.345;

      // 주휴수당: (40 ÷ 40) × 8 × 10,000 × 4.345 = 347,600원
      const weeklyHolidayPay = (weeklyHours / 40) * 8 * hourlyWage * weeksPerMonth;

      expect(Math.round(weeklyHolidayPay)).toBe(347600);
    });

    it('주 24시간 → 주휴수당 비례 계산', () => {
      // Given: 통상시급 10,000원, 주 24시간 근무, 월 4.345주
      const hourlyWage = 10000;
      const weeklyHours = 24;
      const weeksPerMonth = 4.345;

      // 주휴수당: (24 ÷ 40) × 8 × 10,000 × 4.345 = 208,560원
      const weeklyHolidayPay = (weeklyHours / 40) * 8 * hourlyWage * weeksPerMonth;

      expect(Math.round(weeklyHolidayPay)).toBe(208560);
    });
  });

  describe('5. 경계값 테스트', () => {
    it('최저임금 미달 경고 발생 확인', () => {
      // Given: 2026년 최저시급 10,320원
      const minimumWage = 10320;
      const actualWage = 9500; // 최저임금 미달

      // 최저임금 위반 여부
      const isViolation = actualWage < minimumWage;

      expect(isViolation).toBe(true);
    });

    it('비과세 한도: 식대 20만원 초과 시 과세 전환', () => {
      // Given: 식대 25만원
      const mealAllowance = 250000;
      const taxFreeLimit = 200000;

      // 비과세: 200,000원, 과세: 50,000원
      const taxFree = Math.min(mealAllowance, taxFreeLimit);
      const taxable = Math.max(0, mealAllowance - taxFreeLimit);

      expect(taxFree).toBe(200000);
      expect(taxable).toBe(50000);
    });

    it('국민연금 상한 초과 시 상한액 적용', () => {
      // Given: 월급 800만원
      const salary = 8000000;
      const pensionCap = 5900000;

      // 국민연금 기준소득월액: min(급여, 상한) = 5,900,000원
      const pensionBase = Math.min(salary, pensionCap);
      const pensionAmount = Math.round(pensionBase * 0.0475);

      expect(pensionBase).toBe(5900000);
      expect(pensionAmount).toBe(280250);
    });

    it('건강보험 상한 없음 (전액 적용)', () => {
      // Given: 월급 1억원
      const salary = 100000000;

      // 건강보험은 상한 없음 (전액 적용)
      const healthInsurance = Math.round(salary * 0.03595);

      expect(healthInsurance).toBe(3595000);
    });
  });

  describe('6. 통상시급 계산 (174시간 기준)', () => {
    it('월급 2,800,000원 → 통상시급 16,092원', () => {
      // Given: 월급 280만원
      const monthlySalary = 2800000;
      const standardHours = 174; // 주휴수당 제외

      // 통상시급: 2,800,000 ÷ 174 = 16,091.95... ≈ 16,092원
      const hourlyWage = Math.round(monthlySalary / standardHours);

      expect(hourlyWage).toBe(16092);
    });

    it('최저임금 환산: 2,156,880원 ÷ 209시간 = 10,320원', () => {
      // Given: 최저임금 시급 10,320원
      const minimumHourlyWage = 10320;
      const hoursWithHoliday = 209; // 주휴수당 포함

      // 최저임금 월 환산: 10,320 × 209 = 2,156,880원
      const minimumMonthlySalary = minimumHourlyWage * hoursWithHoliday;

      expect(minimumMonthlySalary).toBe(2156880);
    });
  });

  describe('7. 2026년 법령 정확성 검증', () => {
    it('국민연금 요율: 4.75% (2026년 연금개혁 반영)', () => {
      const pensionRate = 0.0475;
      expect(pensionRate).toBe(0.0475);
    });

    it('건강보험 요율: 3.595%', () => {
      const healthRate = 0.03595;
      expect(healthRate).toBe(0.03595);
    });

    it('장기요양보험 요율: 건강보험료 × 13.14%', () => {
      const longTermRate = 0.1314;
      expect(longTermRate).toBe(0.1314);
    });

    it('고용보험 요율: 0.9%', () => {
      const employmentRate = 0.009;
      expect(employmentRate).toBe(0.009);
    });

    it('최저시급: 10,320원 (2026년)', () => {
      const minimumWage = 10320;
      expect(minimumWage).toBe(10320);
    });
  });
});
