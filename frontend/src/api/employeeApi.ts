/**
 * Employee API 클라이언트
 */

import { apiClient, transformToCamelCase, transformToSnakeCase } from './client';
import type { EmployeeRequest, EmployeeResponse, EmployeeListResponse } from '../types/employee';

export const employeeApi = {
  /**
   * 근무자 등록
   */
  createEmployee: async (request: EmployeeRequest): Promise<EmployeeResponse> => {
    const response = await apiClient.post('/employees', transformToCamelCase(request));
    return transformToSnakeCase(response.data) as EmployeeResponse;
  },

  /**
   * 근무자 목록 조회
   */
  getEmployees: async (): Promise<EmployeeListResponse> => {
    const response = await apiClient.get('/employees');
    return transformToSnakeCase(response.data) as EmployeeListResponse;
  },

  /**
   * 근무자 상세 조회
   */
  getEmployee: async (id: string): Promise<EmployeeResponse> => {
    const response = await apiClient.get(`/employees/${id}`);
    return transformToSnakeCase(response.data) as EmployeeResponse;
  },

  /**
   * 근무자 정보 수정
   */
  updateEmployee: async (id: string, request: EmployeeRequest): Promise<EmployeeResponse> => {
    const response = await apiClient.put(`/employees/${id}`, transformToCamelCase(request));
    return transformToSnakeCase(response.data) as EmployeeResponse;
  },

  /**
   * 근무자 삭제
   */
  deleteEmployee: async (id: string): Promise<void> => {
    await apiClient.delete(`/employees/${id}`);
  },

  /**
   * 근무자 이름 검색
   */
  searchEmployeesByName: async (name: string): Promise<EmployeeListResponse> => {
    const response = await apiClient.get('/employees/search', { params: { name } });
    return transformToSnakeCase(response.data) as EmployeeListResponse;
  },

  /**
   * 국민연금 비대상자 조회 (만 60세 이상)
   */
  getPensionIneligibleEmployees: async (): Promise<EmployeeListResponse> => {
    const response = await apiClient.get('/employees/pension-ineligible');
    return transformToSnakeCase(response.data) as EmployeeListResponse;
  },
};
