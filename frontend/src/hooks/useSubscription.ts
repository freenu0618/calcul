/**
 * useSubscription - 구독/요금제 제한 관리 훅
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../api/client';

// 요금제 타입
export type SubscriptionTier = 'FREE' | 'TRIAL' | 'BASIC' | 'PRO' | 'ENTERPRISE';

// 요금제별 제한
export const PLAN_LIMITS = {
  FREE: {
    maxEmployees: 3,
    aiChatsPerMonth: 10,
    salaryCalcsPerMonth: 5,
    hasPdfExport: false,
    hasExcelExport: false,
    recordRetentionMonths: 3,
  },
  TRIAL: {
    maxEmployees: 10,
    aiChatsPerMonth: 30,
    salaryCalcsPerMonth: Infinity,
    hasPdfExport: true,
    hasExcelExport: false,
    recordRetentionMonths: Infinity,
  },
  BASIC: {
    maxEmployees: 10,
    aiChatsPerMonth: 30,
    salaryCalcsPerMonth: Infinity,
    hasPdfExport: true,
    hasExcelExport: false,
    recordRetentionMonths: Infinity,
  },
  PRO: {
    maxEmployees: 30,
    aiChatsPerMonth: Infinity,
    salaryCalcsPerMonth: Infinity,
    hasPdfExport: true,
    hasExcelExport: true,
    recordRetentionMonths: Infinity,
  },
  ENTERPRISE: {
    maxEmployees: Infinity,
    aiChatsPerMonth: Infinity,
    salaryCalcsPerMonth: Infinity,
    hasPdfExport: true,
    hasExcelExport: true,
    recordRetentionMonths: Infinity,
  },
} as const;

interface Usage {
  aiChats: number;
  salaryCalcs: number;
  employees: number;
  pdfExports: number;
  excelExports: number;
}

interface SubscriptionState {
  tier: SubscriptionTier;
  limits: typeof PLAN_LIMITS[SubscriptionTier];
  usage: Usage;
  isLoading: boolean;
  canAddEmployee: () => boolean;
  canUseAiChat: () => boolean;
  canCalculateSalary: () => boolean;
  canExportPdf: () => boolean;
  canExportExcel: () => boolean;
  remainingAiChats: () => number;
  remainingSalaryCalcs: () => number;
  remainingEmployeeSlots: () => number;
  tierLabel: string;
  refetch: () => void;
}

export function useSubscription(): SubscriptionState {
  const { user, isAuthenticated } = useAuth();
  const [employeeCount, setEmployeeCount] = useState(0);
  const [usageData, setUsageData] = useState({ aiChats: 0, salaryCalcs: 0, pdfExports: 0, excelExports: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // 직원 수 조회
  const fetchEmployeeCount = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await apiClient.get('/employees');
      const data = response.data;
      const count = data?.totalCount ?? data?.employees?.length ?? 0;
      setEmployeeCount(count);
    } catch (error) {
      console.error('Failed to fetch employee count:', error);
    }
  };

  // 사용량 조회 (AI 상담, 급여 계산 등)
  const fetchUsage = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await apiClient.get('/subscription/usage');
      const data = response.data?.data;
      if (data) {
        setUsageData({
          aiChats: data.aiChats ?? 0,
          salaryCalcs: data.salaryCalcs ?? 0,
          pdfExports: data.pdfExports ?? 0,
          excelExports: data.excelExports ?? 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    }
  };

  const hasLoaded = useRef(false);

  const refetch = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    await Promise.all([fetchEmployeeCount(), fetchUsage()]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated || hasLoaded.current) return;
    hasLoaded.current = true;
    refetch();
  }, [isAuthenticated]);

  // user.subscriptionTier (API), user.plan (AuthContext) 둘 다 지원
  const tier: SubscriptionTier = (user as any)?.subscriptionTier || (user as any)?.plan || 'FREE';
  const limits = PLAN_LIMITS[tier];

  const usage: Usage = {
    aiChats: usageData.aiChats,
    salaryCalcs: usageData.salaryCalcs,
    employees: employeeCount,
    pdfExports: usageData.pdfExports,
    excelExports: usageData.excelExports,
  };

  const tierLabels: Record<SubscriptionTier, string> = {
    FREE: 'Free',
    TRIAL: 'Basic (체험)',
    BASIC: 'Basic',
    PRO: 'Pro',
    ENTERPRISE: 'Enterprise',
  };

  return {
    tier,
    limits,
    usage,
    isLoading,
    canAddEmployee: () => usage.employees < limits.maxEmployees,
    canUseAiChat: () => usage.aiChats < limits.aiChatsPerMonth,
    canCalculateSalary: () => usage.salaryCalcs < limits.salaryCalcsPerMonth,
    canExportPdf: () => limits.hasPdfExport,
    canExportExcel: () => limits.hasExcelExport,
    remainingAiChats: () => Math.max(0, limits.aiChatsPerMonth - usage.aiChats),
    remainingSalaryCalcs: () => Math.max(0, limits.salaryCalcsPerMonth - usage.salaryCalcs),
    remainingEmployeeSlots: () => Math.max(0, limits.maxEmployees - usage.employees),
    tierLabel: tierLabels[tier],
    refetch,
  };
}
