/**
 * Calculator 상태 관리 커스텀 훅
 * useState 20개 → useReducer 1개로 통합
 */
import { useReducer, useCallback } from 'react';
import type {
  SalaryCalculationResponse,
  WorkShiftRequest,
  WageType,
  AbsencePolicy,
  InsuranceOptions as InsuranceOptionsType,
  InclusiveWageOptions as InclusiveWageOptionsType,
} from '../types/salary';
import type { GuaranteeDistributionItem } from '../components/forms/GuaranteeAllowanceDistribution';
import { DEFAULT_INSURANCE_OPTIONS, DEFAULT_INCLUSIVE_WAGE_OPTIONS } from '../types/salary';
import type { Employee, Allowance } from '../types/models';
import type { PayrollPeriodResponse } from '../types/payroll';
import type { EmployeeResponse } from '../types/employee';

// ============================================
// 상태 타입 정의 (관심사 분리)
// ============================================

export interface CalculatorState {
  // 1. 입력 상태 (Input State)
  input: {
    employee: Employee;
    baseSalary: number;
    allowances: Allowance[];
    workShifts: WorkShiftRequest[];
    wageType: WageType;
    hourlyWage: number;
    calculationMonth: string;
    periodStart: string;        // 정산기간 시작 "YYYY-MM-DD"
    periodEnd: string;          // 정산기간 종료 "YYYY-MM-DD"
    attributionMonth: string;   // 귀속월 "YYYY-MM"
    absencePolicy: AbsencePolicy;
    hoursMode: '174' | '209';
    contractSalary: number;
    contractMonthlySalary: number;
    guaranteeDistribution: GuaranteeDistributionItem[];
    insuranceOptions: InsuranceOptionsType;
    inclusiveWageOptions: InclusiveWageOptionsType;
  };

  // 2. 계산 결과 상태 (Result State)
  result: {
    current: SalaryCalculationResponse | null;
    adjusted: {
      originalNetPay: number;
      adjustedNetPay: number;
      additionalAllowances: Array<{
        name: string;
        amount: number;
        isTaxable: boolean;
      }>;
    } | null;
  };

  // 3. UI 상태 (UI State)
  ui: {
    isLoading: boolean;
    error: string | null;
    saveStatus: 'idle' | 'saving' | 'success' | 'error';
    saveError: string;
  };

  // 4. 급여대장 관련 상태 (Payroll State)
  payroll: {
    periods: PayrollPeriodResponse[];
    registeredEmployees: EmployeeResponse[];
    selectedPeriodId: string;
    selectedEmployeeId: string;
  };
}

// ============================================
// 액션 타입 정의
// ============================================

export type CalculatorAction =
  // 입력 상태 액션
  | { type: 'SET_EMPLOYEE'; payload: Employee }
  | { type: 'SET_BASE_SALARY'; payload: number }
  | { type: 'SET_ALLOWANCES'; payload: Allowance[] }
  | { type: 'ADD_ALLOWANCES'; payload: Allowance[] }
  | { type: 'SET_WORK_SHIFTS'; payload: WorkShiftRequest[] }
  | { type: 'SET_WAGE_TYPE'; payload: WageType }
  | { type: 'SET_HOURLY_WAGE'; payload: number }
  | { type: 'SET_CALCULATION_MONTH'; payload: string }
  | { type: 'SET_PAY_PERIOD'; payload: { periodStart: string; periodEnd: string } }
  | { type: 'SET_ATTRIBUTION_MONTH'; payload: string }
  | { type: 'SET_ABSENCE_POLICY'; payload: AbsencePolicy }
  | { type: 'SET_HOURS_MODE'; payload: '174' | '209' }
  | { type: 'SET_CONTRACT_SALARY'; payload: number }
  | { type: 'SET_CONTRACT_MONTHLY_SALARY'; payload: number }
  | { type: 'SET_GUARANTEE_DISTRIBUTION'; payload: GuaranteeDistributionItem[] }
  | { type: 'SET_INSURANCE_OPTIONS'; payload: InsuranceOptionsType }
  | { type: 'SET_INCLUSIVE_WAGE_OPTIONS'; payload: InclusiveWageOptionsType }
  | { type: 'RESET_INPUT' }

  // 계산 결과 액션
  | { type: 'SET_RESULT'; payload: SalaryCalculationResponse }
  | { type: 'SET_ADJUSTED_RESULT'; payload: CalculatorState['result']['adjusted'] }
  | { type: 'CLEAR_RESULT' }

  // UI 상태 액션
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SAVE_STATUS'; payload: CalculatorState['ui']['saveStatus'] }
  | { type: 'SET_SAVE_ERROR'; payload: string }

  // 급여대장 액션
  | { type: 'SET_PERIODS'; payload: PayrollPeriodResponse[] }
  | { type: 'SET_REGISTERED_EMPLOYEES'; payload: EmployeeResponse[] }
  | { type: 'SET_SELECTED_PERIOD_ID'; payload: string }
  | { type: 'SET_SELECTED_EMPLOYEE_ID'; payload: string };

// ============================================
// 정산기간 헬퍼
// ============================================

function getDefaultPeriod() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-indexed
  const firstDay = new Date(y, m, 1);
  const lastDay = new Date(y, m + 1, 0);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const ym = `${y}-${String(m + 1).padStart(2, '0')}`;
  return { periodStart: fmt(firstDay), periodEnd: fmt(lastDay), attributionMonth: ym };
}

// ============================================
// 초기 상태
// ============================================

const defaultPeriod = getDefaultPeriod();

const initialState: CalculatorState = {
  input: {
    employee: {
      name: '',
      dependents_count: 1,
      children_under_20: 0,
      employment_type: 'FULL_TIME',
      company_size: 'OVER_5',
      scheduled_work_days: 5,
      daily_work_hours: 8,
    },
    baseSalary: 2500000,
    allowances: [],
    workShifts: [],
    wageType: 'MONTHLY_FIXED',
    hourlyWage: 0,
    calculationMonth: '',
    periodStart: defaultPeriod.periodStart,
    periodEnd: defaultPeriod.periodEnd,
    attributionMonth: defaultPeriod.attributionMonth,
    absencePolicy: 'STRICT',
    hoursMode: '174',
    contractSalary: 0,
    contractMonthlySalary: 0,
    guaranteeDistribution: [],
    insuranceOptions: DEFAULT_INSURANCE_OPTIONS,
    inclusiveWageOptions: DEFAULT_INCLUSIVE_WAGE_OPTIONS,
  },
  result: {
    current: null,
    adjusted: null,
  },
  ui: {
    isLoading: false,
    error: null,
    saveStatus: 'idle',
    saveError: '',
  },
  payroll: {
    periods: [],
    registeredEmployees: [],
    selectedPeriodId: '',
    selectedEmployeeId: '',
  },
};

// ============================================
// Reducer 함수
// ============================================

function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction
): CalculatorState {
  switch (action.type) {
    // 입력 상태
    case 'SET_EMPLOYEE':
      return { ...state, input: { ...state.input, employee: action.payload } };
    case 'SET_BASE_SALARY':
      return { ...state, input: { ...state.input, baseSalary: action.payload } };
    case 'SET_ALLOWANCES':
      return { ...state, input: { ...state.input, allowances: action.payload } };
    case 'ADD_ALLOWANCES':
      return {
        ...state,
        input: {
          ...state.input,
          allowances: [...state.input.allowances, ...action.payload],
        },
      };
    case 'SET_WORK_SHIFTS':
      return { ...state, input: { ...state.input, workShifts: action.payload } };
    case 'SET_WAGE_TYPE':
      return { ...state, input: { ...state.input, wageType: action.payload, guaranteeDistribution: [] } };
    case 'SET_HOURLY_WAGE':
      return { ...state, input: { ...state.input, hourlyWage: action.payload } };
    case 'SET_CALCULATION_MONTH':
      return { ...state, input: { ...state.input, calculationMonth: action.payload } };
    case 'SET_PAY_PERIOD':
      return { ...state, input: {
        ...state.input,
        periodStart: action.payload.periodStart,
        periodEnd: action.payload.periodEnd,
      } };
    case 'SET_ATTRIBUTION_MONTH':
      return { ...state, input: { ...state.input, attributionMonth: action.payload } };
    case 'SET_ABSENCE_POLICY':
      return { ...state, input: { ...state.input, absencePolicy: action.payload } };
    case 'SET_HOURS_MODE':
      return { ...state, input: { ...state.input, hoursMode: action.payload } };
    case 'SET_CONTRACT_SALARY':
      return { ...state, input: { ...state.input, contractSalary: action.payload } };
    case 'SET_CONTRACT_MONTHLY_SALARY':
      return { ...state, input: { ...state.input, contractMonthlySalary: action.payload } };
    case 'SET_GUARANTEE_DISTRIBUTION':
      return { ...state, input: { ...state.input, guaranteeDistribution: action.payload } };
    case 'SET_INSURANCE_OPTIONS':
      return { ...state, input: { ...state.input, insuranceOptions: action.payload } };
    case 'SET_INCLUSIVE_WAGE_OPTIONS':
      return { ...state, input: { ...state.input, inclusiveWageOptions: action.payload } };
    case 'RESET_INPUT':
      return { ...state, input: initialState.input };

    // 계산 결과
    case 'SET_RESULT':
      return {
        ...state,
        result: { ...state.result, current: action.payload },
        ui: { ...state.ui, isLoading: false, error: null },
      };
    case 'SET_ADJUSTED_RESULT':
      return { ...state, result: { ...state.result, adjusted: action.payload } };
    case 'CLEAR_RESULT':
      return { ...state, result: { current: null, adjusted: null } };

    // UI 상태
    case 'SET_LOADING':
      return { ...state, ui: { ...state.ui, isLoading: action.payload } };
    case 'SET_ERROR':
      return {
        ...state,
        ui: { ...state.ui, error: action.payload, isLoading: false },
        // 기존 결과 유지 — 재계산 에러 시 이전 결과를 보존하여 깜빡임 방지
        ...(action.payload ? {} : {}),
      };
    case 'SET_SAVE_STATUS':
      return { ...state, ui: { ...state.ui, saveStatus: action.payload } };
    case 'SET_SAVE_ERROR':
      return { ...state, ui: { ...state.ui, saveError: action.payload } };

    // 급여대장
    case 'SET_PERIODS':
      return { ...state, payroll: { ...state.payroll, periods: action.payload } };
    case 'SET_REGISTERED_EMPLOYEES':
      return { ...state, payroll: { ...state.payroll, registeredEmployees: action.payload } };
    case 'SET_SELECTED_PERIOD_ID':
      return { ...state, payroll: { ...state.payroll, selectedPeriodId: action.payload } };
    case 'SET_SELECTED_EMPLOYEE_ID':
      return { ...state, payroll: { ...state.payroll, selectedEmployeeId: action.payload } };

    default:
      return state;
  }
}

// ============================================
// 커스텀 훅
// ============================================

export function useCalculatorState() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);

  // 액션 생성자 (memoized)
  const actions = {
    // 입력 상태
    setEmployee: useCallback((employee: Employee) =>
      dispatch({ type: 'SET_EMPLOYEE', payload: employee }), []),
    setBaseSalary: useCallback((salary: number) =>
      dispatch({ type: 'SET_BASE_SALARY', payload: salary }), []),
    setAllowances: useCallback((allowances: Allowance[]) =>
      dispatch({ type: 'SET_ALLOWANCES', payload: allowances }), []),
    addAllowances: useCallback((allowances: Allowance[]) =>
      dispatch({ type: 'ADD_ALLOWANCES', payload: allowances }), []),
    setWorkShifts: useCallback((shifts: WorkShiftRequest[]) =>
      dispatch({ type: 'SET_WORK_SHIFTS', payload: shifts }), []),
    setWageType: useCallback((wageType: WageType) =>
      dispatch({ type: 'SET_WAGE_TYPE', payload: wageType }), []),
    setHourlyWage: useCallback((wage: number) =>
      dispatch({ type: 'SET_HOURLY_WAGE', payload: wage }), []),
    setCalculationMonth: useCallback((month: string) =>
      dispatch({ type: 'SET_CALCULATION_MONTH', payload: month }), []),
    setPayPeriod: useCallback((periodStart: string, periodEnd: string) =>
      dispatch({ type: 'SET_PAY_PERIOD', payload: { periodStart, periodEnd } }), []),
    setAttributionMonth: useCallback((month: string) =>
      dispatch({ type: 'SET_ATTRIBUTION_MONTH', payload: month }), []),
    setAbsencePolicy: useCallback((policy: AbsencePolicy) =>
      dispatch({ type: 'SET_ABSENCE_POLICY', payload: policy }), []),
    setHoursMode: useCallback((mode: '174' | '209') =>
      dispatch({ type: 'SET_HOURS_MODE', payload: mode }), []),
    setContractSalary: useCallback((salary: number) =>
      dispatch({ type: 'SET_CONTRACT_SALARY', payload: salary }), []),
    setContractMonthlySalary: useCallback((salary: number) =>
      dispatch({ type: 'SET_CONTRACT_MONTHLY_SALARY', payload: salary }), []),
    setGuaranteeDistribution: useCallback((items: GuaranteeDistributionItem[]) =>
      dispatch({ type: 'SET_GUARANTEE_DISTRIBUTION', payload: items }), []),
    setInsuranceOptions: useCallback((options: InsuranceOptionsType) =>
      dispatch({ type: 'SET_INSURANCE_OPTIONS', payload: options }), []),
    setInclusiveWageOptions: useCallback((options: InclusiveWageOptionsType) =>
      dispatch({ type: 'SET_INCLUSIVE_WAGE_OPTIONS', payload: options }), []),
    resetInput: useCallback(() => dispatch({ type: 'RESET_INPUT' }), []),

    // 계산 결과
    setResult: useCallback((result: SalaryCalculationResponse) =>
      dispatch({ type: 'SET_RESULT', payload: result }), []),
    setAdjustedResult: useCallback((adjusted: CalculatorState['result']['adjusted']) =>
      dispatch({ type: 'SET_ADJUSTED_RESULT', payload: adjusted }), []),
    clearResult: useCallback(() => dispatch({ type: 'CLEAR_RESULT' }), []),

    // UI 상태
    setLoading: useCallback((loading: boolean) =>
      dispatch({ type: 'SET_LOADING', payload: loading }), []),
    setError: useCallback((error: string | null) =>
      dispatch({ type: 'SET_ERROR', payload: error }), []),
    setSaveStatus: useCallback((status: CalculatorState['ui']['saveStatus']) =>
      dispatch({ type: 'SET_SAVE_STATUS', payload: status }), []),
    setSaveError: useCallback((error: string) =>
      dispatch({ type: 'SET_SAVE_ERROR', payload: error }), []),

    // 급여대장
    setPeriods: useCallback((periods: PayrollPeriodResponse[]) =>
      dispatch({ type: 'SET_PERIODS', payload: periods }), []),
    setRegisteredEmployees: useCallback((employees: EmployeeResponse[]) =>
      dispatch({ type: 'SET_REGISTERED_EMPLOYEES', payload: employees }), []),
    setSelectedPeriodId: useCallback((id: string) =>
      dispatch({ type: 'SET_SELECTED_PERIOD_ID', payload: id }), []),
    setSelectedEmployeeId: useCallback((id: string) =>
      dispatch({ type: 'SET_SELECTED_EMPLOYEE_ID', payload: id }), []),
  };

  return { state, actions };
}
