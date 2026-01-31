/**
 * 구독 API 클라이언트
 */

import { apiClient } from './client';

// Types
export interface PlanLimits {
  maxEmployees: number;
  aiChatsPerMonth: number;
  salaryCalcsPerMonth: number;
  hasPdfExport: boolean;
  hasExcelExport: boolean;
  recordRetentionMonths: number;
}

export interface UsageInfo {
  aiChats: number;
  salaryCalcs: number;
  pdfExports: number;
  excelExports: number;
}

export interface SubscriptionInfo {
  tier: 'FREE' | 'TRIAL' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'TRIAL' | 'CANCELED' | 'PAST_DUE' | 'EXPIRED';
  endDate: string | null;
  limits: PlanLimits;
  usage: UsageInfo;
}

export interface TrialResponse {
  success: boolean;
  message: string;
  endDate: string | null;
}

// API 호출 함수들
export const subscriptionApi = {
  /**
   * 현재 구독 정보 조회
   */
  getSubscription: async (): Promise<SubscriptionInfo> => {
    const response = await apiClient.get<{ data: SubscriptionInfo }>('/subscription/me');
    return response.data.data;
  },

  /**
   * 사용량 조회
   */
  getUsage: async (): Promise<UsageInfo> => {
    const response = await apiClient.get<{ data: UsageInfo }>('/subscription/usage');
    return response.data.data;
  },

  /**
   * 사용 가능 여부 체크
   */
  canUse: async (type: 'AI_CHAT' | 'SALARY_CALC' | 'PDF_EXPORT' | 'EXCEL_EXPORT'): Promise<boolean> => {
    const response = await apiClient.get<{ data: { canUse: boolean } }>(
      `/subscription/can-use?type=${type}`
    );
    return response.data.data.canUse;
  },

  /**
   * 사용량 증가 (내부 API)
   */
  incrementUsage: async (
    type: 'AI_CHAT' | 'SALARY_CALC' | 'PDF_EXPORT' | 'EXCEL_EXPORT'
  ): Promise<{ allowed: boolean; message?: string }> => {
    const response = await apiClient.post<{ data: { allowed: boolean; message?: string } }>(
      `/subscription/usage/increment?type=${type}`
    );
    return response.data.data;
  },

  /**
   * Trial 시작
   */
  startTrial: async (): Promise<TrialResponse> => {
    const response = await apiClient.post<{ data: TrialResponse }>('/subscription/trial');
    return response.data.data;
  }
};

// 플랜별 제한 상수 (프론트엔드용)
export const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    maxEmployees: 3,
    aiChatsPerMonth: 10,
    salaryCalcsPerMonth: 5,
    hasPdfExport: false,
    hasExcelExport: false,
    recordRetentionMonths: 3
  },
  TRIAL: {
    maxEmployees: 10,
    aiChatsPerMonth: 30,
    salaryCalcsPerMonth: Infinity,
    hasPdfExport: true,
    hasExcelExport: false,
    recordRetentionMonths: Infinity
  },
  BASIC: {
    maxEmployees: 10,
    aiChatsPerMonth: 30,
    salaryCalcsPerMonth: Infinity,
    hasPdfExport: true,
    hasExcelExport: false,
    recordRetentionMonths: Infinity
  },
  PRO: {
    maxEmployees: 30,
    aiChatsPerMonth: Infinity,
    salaryCalcsPerMonth: Infinity,
    hasPdfExport: true,
    hasExcelExport: true,
    recordRetentionMonths: Infinity
  },
  ENTERPRISE: {
    maxEmployees: Infinity,
    aiChatsPerMonth: Infinity,
    salaryCalcsPerMonth: Infinity,
    hasPdfExport: true,
    hasExcelExport: true,
    recordRetentionMonths: Infinity
  }
};

export default subscriptionApi;
