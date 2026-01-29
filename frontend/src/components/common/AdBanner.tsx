/**
 * Google AdSense 광고 배너 컴포넌트
 * 수동 광고 배치를 위한 컴포넌트
 * - 유료 사용자(PRO/ENTERPRISE)에게는 광고 미표시
 * - 콘텐츠 하단에만 배치 (탐색 혼동 방지)
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdBannerProps {
  /** 광고 슬롯 ID (AdSense에서 발급) */
  slot: string;
  /** 광고 형식 */
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  /** 전체 폭 반응형 여부 */
  fullWidthResponsive?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 수동 광고 배치용 컴포넌트
 * - 무료 사용자: 광고 표시
 * - 유료 사용자: 광고 숨김
 * @example
 * <AdBanner slot="1234567890" format="auto" />
 */
export default function AdBanner({
  slot,
  format = 'auto',
  fullWidthResponsive = true,
  className = '',
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const { isPaidUser } = useAuth();

  useEffect(() => {
    // 유료 사용자는 광고 로드 안함
    if (isPaidUser) return;

    try {
      if (typeof window !== 'undefined' && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense 로드 실패:', err);
    }
  }, [isPaidUser]);

  // 유료 사용자는 광고 미표시
  if (isPaidUser) {
    return null;
  }

  // 개발 환경에서는 플레이스홀더 표시
  if (import.meta.env.DEV) {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 ${className}`}>
        <p className="text-sm">광고 영역 (개발 환경 - 무료 사용자)</p>
        <p className="text-xs">slot: {slot}</p>
        <p className="text-xs text-blue-500">PRO 업그레이드 시 광고 제거</p>
      </div>
    );
  }

  return (
    <div className={`ad-container ${className}`}>
      <p className="text-xs text-gray-400 text-center mb-1">광고</p>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-4812271687474025"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}
