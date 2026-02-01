/**
 * 결제 API 클라이언트 (Polar)
 */

import { apiClient } from './client';

// Types
export type PlanType = 'basic' | 'basic_annual' | 'pro' | 'pro_annual';

export interface CheckoutResponse {
  checkoutUrl: string;
  checkoutId: string;
}

export interface CancelResponse {
  success: boolean;
  message: string;
}

// API 호출 함수들
export const paymentApi = {
  /**
   * Checkout 세션 생성 (결제 페이지 URL 반환)
   */
  createCheckout: async (plan: PlanType, successUrl?: string): Promise<CheckoutResponse> => {
    const response = await apiClient.post<{ data: CheckoutResponse }>('/payment/checkout', {
      plan,
      successUrl
    });
    return response.data.data;
  },

  /**
   * 구독 취소
   */
  cancelSubscription: async (): Promise<CancelResponse> => {
    const response = await apiClient.post<{ data: CancelResponse }>('/payment/cancel');
    return response.data.data;
  },

  /**
   * 결제 페이지로 리다이렉트
   */
  redirectToCheckout: async (plan: PlanType): Promise<void> => {
    const { checkoutUrl } = await paymentApi.createCheckout(plan);
    window.location.href = checkoutUrl;
  }
};

// 플랜 정보 상수
export const PLAN_INFO: Record<PlanType, {
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  description: string;
}> = {
  basic: {
    name: 'Basic',
    price: 9900,
    interval: 'monthly',
    description: '소규모 사업장용'
  },
  basic_annual: {
    name: 'Basic (연간)',
    price: 99000,
    interval: 'yearly',
    description: '소규모 사업장용 (2개월 무료)'
  },
  pro: {
    name: 'Pro',
    price: 29900,
    interval: 'monthly',
    description: '성장하는 사업장용'
  },
  pro_annual: {
    name: 'Pro (연간)',
    price: 299000,
    interval: 'yearly',
    description: '성장하는 사업장용 (2개월 무료)'
  }
};

export default paymentApi;
