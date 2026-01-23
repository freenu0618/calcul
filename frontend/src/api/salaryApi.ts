/**
 * 급여 계산 API 서비스
 */
import { apiClient } from './client';
import type {
  SalaryCalculationRequest,
  SalaryCalculationResponse,
  ReverseSalaryRequest,
  ReverseSalaryResponse,
} from '../types/salary';

export const salaryApi = {
  /**
   * 급여 계산
   */
  calculateSalary: async (
    request: SalaryCalculationRequest
  ): Promise<SalaryCalculationResponse> => {
    const response = await apiClient.post<SalaryCalculationResponse>(
      '/salary/calculate',
      request
    );
    return response.data;
  },

  /**
   * 역산 계산 (실수령액 → 필요 기본급)
   */
  reverseCalculate: async (
    request: ReverseSalaryRequest
  ): Promise<ReverseSalaryResponse> => {
    const response = await apiClient.post<ReverseSalaryResponse>(
      '/salary/reverse-calculate',
      request
    );
    return response.data;
  },
};
