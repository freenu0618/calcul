/**
 * useSubscription - 구독/요금제 제한 관리 훅
 */

import { useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);

  // 직원 수 조회
  const fetchEmployeeCount = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await apiClient.get('/employees');
      const employees = response.data?.data || response.data || [];
      setEmployeeCount(Array.isArray(employees) ? employees.length : 0);
    } catch (error) {
      console.error('Failed to fetch employee count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeCount();
  }, [isAuthenticated]);

  const tier: SubscriptionTier = (user as any)?.subscriptionTier || 'FREE';
  const limits = PLAN_LIMITS[tier];

  const usage: Usage = {
    aiChats: 0, // TODO: 백엔드 구독 API 연동
    salaryCalcs: 0,
    employees: employeeCount,
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
    refetch: fetchEmployeeCount,
  };
}
