/**
 * useSubscription - 구독/요금제 제한 관리 훅
 */

import { useAuth } from '../contexts/AuthContext';

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
    // Basic과 동일한 제한 (3일 무료 체험)
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
  // 제한 체크 함수들
  canAddEmployee: () => boolean;
  canUseAiChat: () => boolean;
  canCalculateSalary: () => boolean;
  canExportPdf: () => boolean;
  canExportExcel: () => boolean;
  // 남은 횟수
  remainingAiChats: () => number;
  remainingSalaryCalcs: () => number;
  remainingEmployeeSlots: () => number;
  // 요금제 표시
  tierLabel: string;
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();

  // TODO: 백엔드에서 실제 구독 정보 조회
  // 현재는 Free 플랜 기본값
  const tier: SubscriptionTier = (user as any)?.subscriptionTier || 'FREE';
  const limits = PLAN_LIMITS[tier];

  // TODO: 백엔드에서 실제 사용량 조회
  const usage: Usage = {
    aiChats: 0,
    salaryCalcs: 0,
    employees: 0,
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
    canAddEmployee: () => usage.employees < limits.maxEmployees,
    canUseAiChat: () => usage.aiChats < limits.aiChatsPerMonth,
    canCalculateSalary: () => usage.salaryCalcs < limits.salaryCalcsPerMonth,
    canExportPdf: () => limits.hasPdfExport,
    canExportExcel: () => limits.hasExcelExport,
    remainingAiChats: () => Math.max(0, limits.aiChatsPerMonth - usage.aiChats),
    remainingSalaryCalcs: () => Math.max(0, limits.salaryCalcsPerMonth - usage.salaryCalcs),
    remainingEmployeeSlots: () => Math.max(0, limits.maxEmployees - usage.employees),
    tierLabel: tierLabels[tier],
  };
}
