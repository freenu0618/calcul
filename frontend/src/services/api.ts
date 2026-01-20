/**
 * API 클라이언트 레이어
 * axios 기반 백엔드 API 통신
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  SalaryCalculationRequest,
  SalaryCalculationResponse,
  InsuranceRatesResponse,
  InsuranceCalculationRequest,
  InsuranceCalculationResponse,
  TaxCalculationRequest,
  TaxCalculationResponse,
  AnnualTaxEstimateRequest,
  AnnualTaxEstimateResponse,
} from '../types/api';

// axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃
});

// 요청 인터셉터 (로깅용)
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('[API Error Response]', error.response.data);
    } else if (error.request) {
      console.error('[API No Response]', error.request);
    } else {
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

// ========== Salary API ==========

/**
 * 급여 계산
 * @param request 급여 계산 요청
 * @returns 급여 계산 결과
 */
export async function calculateSalary(
  request: SalaryCalculationRequest
): Promise<SalaryCalculationResponse> {
  const response = await apiClient.post<SalaryCalculationResponse>(
    '/salary/calculate',
    request
  );
  return response.data;
}

// ========== Insurance API ==========

/**
 * 보험료율 조회 (2026년)
 * @returns 2026년 4대 보험 요율
 */
export async function getInsuranceRates(): Promise<InsuranceRatesResponse> {
  const response = await apiClient.get<InsuranceRatesResponse>('/insurance/rates');
  return response.data;
}

/**
 * 보험료 계산
 * @param request 보험료 계산 요청
 * @returns 보험료 계산 결과
 */
export async function calculateInsurance(
  request: InsuranceCalculationRequest
): Promise<InsuranceCalculationResponse> {
  const response = await apiClient.post<InsuranceCalculationResponse>(
    '/insurance/calculate',
    request
  );
  return response.data;
}

// ========== Tax API ==========

/**
 * 세금 계산 (간이세액표 기준)
 * @param request 세금 계산 요청
 * @returns 세금 계산 결과
 */
export async function calculateTax(
  request: TaxCalculationRequest
): Promise<TaxCalculationResponse> {
  const response = await apiClient.post<TaxCalculationResponse>(
    '/tax/calculate',
    request
  );
  return response.data;
}

/**
 * 연간 소득세 추정
 * @param request 연간 세금 추정 요청
 * @returns 연간 세금 추정 결과
 */
export async function estimateAnnualTax(
  request: AnnualTaxEstimateRequest
): Promise<AnnualTaxEstimateResponse> {
  const response = await apiClient.post<AnnualTaxEstimateResponse>(
    '/tax/estimate-annual',
    request
  );
  return response.data;
}

// API 클라이언트 인스턴스 export (필요 시 직접 사용 가능)
export default apiClient;
