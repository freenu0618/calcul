/**
 * 급여대장 API 클라이언트
 */

import { apiClient, transformToCamelCase, transformToSnakeCase } from './client';
import type {
  PayrollPeriodResponse,
  PayrollPeriodListResponse,
  PayrollPeriodCreateRequest,
  PayrollPeriodStatusRequest,
  PayrollLedgerResponse,
  PayrollEntryResponse,
  PayrollEntryRequest,
  WorkShiftResponse,
  WorkShiftCreateRequest,
  WorkContractResponse,
  WorkContractCreateRequest,
} from '../types/payroll';

export const payrollApi = {
  // ==================== 급여 기간 ====================

  /** 급여 기간 생성 */
  createPeriod: async (request: PayrollPeriodCreateRequest): Promise<PayrollPeriodResponse> => {
    const response = await apiClient.post('/payroll/periods', transformToCamelCase(request));
    return transformToSnakeCase(response.data) as PayrollPeriodResponse;
  },

  /** 급여 기간 목록 조회 */
  getPeriods: async (): Promise<PayrollPeriodListResponse> => {
    const response = await apiClient.get('/payroll/periods');
    return transformToSnakeCase(response.data) as PayrollPeriodListResponse;
  },

  /** 급여대장 조회 (기간 + 엔트리) */
  getLedger: async (periodId: number): Promise<PayrollLedgerResponse> => {
    const response = await apiClient.get(`/payroll/periods/${periodId}`);
    return transformToSnakeCase(response.data) as PayrollLedgerResponse;
  },

  /** 급여 기간 상태 변경 */
  updatePeriodStatus: async (
    periodId: number,
    request: PayrollPeriodStatusRequest
  ): Promise<PayrollPeriodResponse> => {
    const response = await apiClient.patch(
      `/payroll/periods/${periodId}/status`,
      transformToCamelCase(request)
    );
    return transformToSnakeCase(response.data) as PayrollPeriodResponse;
  },

  /** 급여 기간 삭제 */
  deletePeriod: async (periodId: number): Promise<void> => {
    await apiClient.delete(`/payroll/periods/${periodId}`);
  },

  // ==================== 급여 엔트리 ====================

  /** 급여 엔트리 추가 */
  addEntry: async (periodId: number, request: PayrollEntryRequest): Promise<PayrollEntryResponse> => {
    const response = await apiClient.post(
      `/payroll/periods/${periodId}/entries`,
      transformToCamelCase(request)
    );
    return transformToSnakeCase(response.data) as PayrollEntryResponse;
  },

  /** 급여 엔트리 삭제 */
  removeEntry: async (periodId: number, entryId: number): Promise<void> => {
    await apiClient.delete(`/payroll/periods/${periodId}/entries/${entryId}`);
  },

  // ==================== 출퇴근 기록 ====================

  /** 출퇴근 기록 추가 */
  addShift: async (request: WorkShiftCreateRequest): Promise<WorkShiftResponse> => {
    const response = await apiClient.post('/payroll/shifts', transformToCamelCase(request));
    return transformToSnakeCase(response.data) as WorkShiftResponse;
  },

  /** 출퇴근 기록 조회 */
  getShifts: async (
    employeeId: string,
    year: number,
    month: number
  ): Promise<WorkShiftResponse[]> => {
    const response = await apiClient.get('/payroll/shifts', {
      params: { employeeId, year, month },
    });
    return (transformToSnakeCase(response.data) as WorkShiftResponse[]) || [];
  },

  // ==================== 근무 계약 ====================

  /** 근무 계약 등록 */
  addContract: async (request: WorkContractCreateRequest): Promise<WorkContractResponse> => {
    const response = await apiClient.post('/payroll/contracts', transformToCamelCase(request));
    return transformToSnakeCase(response.data) as WorkContractResponse;
  },

  /** 근무 계약 목록 조회 */
  getContracts: async (employeeId: string): Promise<WorkContractResponse[]> => {
    const response = await apiClient.get('/payroll/contracts', {
      params: { employeeId },
    });
    return (transformToSnakeCase(response.data) as WorkContractResponse[]) || [];
  },
};
