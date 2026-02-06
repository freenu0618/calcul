/**
 * API 클라이언트 설정
 */
import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

/**
 * snake_case ↔ camelCase 변환 유틸리티
 */
const snakeToCamel = (str: string): string =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const camelToSnake = (str: string): string =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

/**
 * 객체의 모든 키를 snake_case → camelCase로 변환 + hoursMode 값 변환
 */
export const transformToCamelCase = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map(transformToCamelCase);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj as Record<string, unknown>).reduce(
      (acc, [key, value]) => {
        const camelKey = snakeToCamel(key);
        // hoursMode 값 변환: '174' → 'MODE_174'
        if (camelKey === 'hoursMode' && typeof value === 'string' && !value.startsWith('MODE_')) {
          return { ...acc, [camelKey]: `MODE_${value}` };
        }
        return { ...acc, [camelKey]: transformToCamelCase(value) };
      },
      {}
    );
  }
  return obj;
};

/**
 * 객체의 모든 키를 camelCase → snake_case로 변환 (응답 처리용)
 */
export const transformToSnakeCase = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map(transformToSnakeCase);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj as Record<string, unknown>).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [camelToSnake(key)]: transformToSnakeCase(value),
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

// 응답 인터셉터 (401, 429 에러 처리)
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
        window.location.href = '/login';
      }

      // 429 Too Many Requests - Rate Limiting
      if (error.response.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || '60';
        console.warn(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
        error.message = `요청이 너무 많습니다. ${retryAfter}초 후 다시 시도해주세요.`;
      }
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);
