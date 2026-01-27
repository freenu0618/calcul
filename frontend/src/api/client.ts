/**
 * API 클라이언트 설정
 */
import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

/**
 * snake_case → camelCase 변환 유틸리티
 */
const snakeToCamel = (str: string): string =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

/**
 * 객체의 모든 키를 snake_case → camelCase로 변환
 */
export const transformToCamelCase = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map(transformToCamelCase);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj as Record<string, unknown>).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [snakeToCamel(key)]: transformToCamelCase(value),
      }),
      {}
    );
  }
  return obj;
};

export const apiClient = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT,
});

// 요청 인터셉터 (JWT 토큰 자동 추가)
apiClient.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰 가져오기
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (401 에러 처리)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);

      // 401 Unauthorized - 토큰 만료 또는 유효하지 않음
      if (error.response.status === 401) {
        localStorage.removeItem('auth_token');
        // 로그인 페이지로 리다이렉트는 AuthContext에서 처리
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);
