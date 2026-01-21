/**
 * 중앙 API 설정 모듈
 *
 * 모든 API 클라이언트가 이 설정을 사용하여 일관된 baseURL을 보장합니다.
 */

const getBaseUrl = (): string => {
  let envUrl = import.meta.env.VITE_API_BASE_URL;

  // 환경변수가 명시적으로 설정된 경우
  if (envUrl && envUrl.trim() !== '') {
    // ⚠️ 콤마 포함 여부 확인 (잘못된 환경변수 설정)
    if (envUrl.includes(',')) {
      console.warn(
        '⚠️ VITE_API_BASE_URL에 콤마(,)가 포함되어 있습니다.\n' +
        '첫 번째 URL만 사용합니다: ' + envUrl.split(',')[0] + '\n' +
        'Cloudflare Pages에서 환경변수를 수정하세요.'
      );
      // 첫 번째 URL만 추출
      envUrl = envUrl.split(',')[0].trim();
    }

    // 끝의 슬래시 제거하여 중복 슬래시 방지
    return envUrl.replace(/\/$/, '');
  }

  // 개발 환경: 로컬 백엔드 사용
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }

  // 프로덕션 환경에서 환경변수 미설정 시 에러
  throw new Error(
    '⚠️ VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.\n' +
    'Cloudflare Pages → Settings → Environment variables에서 설정하세요.\n' +
    '예: VITE_API_BASE_URL=https://paytools.work'
  );
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  API_VERSION: '/api/v1',
  TIMEOUT: 10000,

  /**
   * API 전체 URL 생성
   * @param path - API 경로 (예: '/auth/register', '/salary/calculate')
   * @returns 전체 URL (예: 'http://localhost:8000/api/v1/auth/register')
   */
  getApiUrl: (path: string = ''): string => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${cleanPath}`;
  }
} as const;

// 개발 환경에서 설정 출력 (디버깅용)
if (import.meta.env.DEV) {
  console.log('[API Config]', {
    BASE_URL: API_CONFIG.BASE_URL,
    API_VERSION: API_CONFIG.API_VERSION,
    SAMPLE_URL: API_CONFIG.getApiUrl('/auth/register')
  });
}
