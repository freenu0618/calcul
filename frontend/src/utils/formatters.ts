/**
 * 포맷팅 유틸리티 함수
 */

/**
 * 금액을 한국 원화 형식으로 포맷팅
 * @param amount 금액 (원)
 * @returns 포맷팅된 문자열 (예: "2,800,000원")
 */
export function formatMoney(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

/**
 * 근로시간을 시간:분 형식으로 포맷팅
 * @param hours 시간
 * @param minutes 분
 * @returns 포맷팅된 문자열 (예: "8시간 30분")
 */
export function formatWorkingHours(hours: number, minutes: number): string {
  if (hours === 0 && minutes === 0) {
    return '0분';
  }

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}시간`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}분`);
  }

  return parts.join(' ');
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 * @param date Date 객체
 * @returns YYYY-MM-DD 문자열
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 시간을 HH:MM:SS 형식으로 변환
 * @param hours 시간 (0-23)
 * @param minutes 분 (0-59)
 * @param seconds 초 (0-59), 기본값 0
 * @returns HH:MM:SS 문자열
 */
export function formatTime(hours: number, minutes: number, seconds: number = 0): string {
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

/**
 * 퍼센트 포맷팅
 * @param value 값 (0.1 = 10%)
 * @param decimals 소수점 자리수 (기본값 2)
 * @returns 포맷팅된 문자열 (예: "4.50%")
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 숫자를 천 단위 콤마로 구분
 * @param value 숫자
 * @returns 포맷팅된 문자열 (예: "2,800,000")
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('ko-KR');
}
