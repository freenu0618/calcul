/**
 * 급여 계산 API 서비스
 */
import { apiClient } from './client';
import type { SalaryCalculationRequest, SalaryCalculationResponse } from '../types/salary';

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
};
