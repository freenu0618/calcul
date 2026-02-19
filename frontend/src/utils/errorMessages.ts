/**
 * API 에러 메시지 파싱 유틸리티
 */

const STATUS_MESSAGES: Record<number, string> = {
  400: '입력값을 확인해주세요.',
  401: '로그인이 필요합니다.',
  403: '접근 권한이 없습니다.',
  404: '요청한 데이터를 찾을 수 없습니다.',
  409: '이미 존재하는 데이터입니다.',
  429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  500: '서버 오류입니다. 잠시 후 다시 시도해주세요.',
  502: '서버가 일시적으로 응답하지 않습니다.',
  503: '서비스 점검 중입니다. 잠시 후 다시 시도해주세요.',
};

export function parseApiError(err: unknown, fallback = '오류가 발생했습니다.'): string {
  if (err instanceof Error) {
    // axios-style response
    const axiosErr = err as any;
    const status = axiosErr.response?.status;
    const serverMsg = axiosErr.response?.data?.message;
    if (serverMsg) return serverMsg;
    if (status && STATUS_MESSAGES[status]) return STATUS_MESSAGES[status];
    return err.message || fallback;
  }
  return fallback;
}
