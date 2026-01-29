/**
 * Google AdSense 광고 배너 컴포넌트
 * 수동 광고 배치를 위한 컴포넌트
 */

import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense 로드 실패:', err);
    }
  }, []);

  // 개발 환경에서는 플레이스홀더 표시
  if (import.meta.env.DEV) {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 ${className}`}>
        <p className="text-sm">광고 영역 (개발 환경)</p>
        <p className="text-xs">slot: {slot}</p>
      </div>
    );
  }

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={{ display: 'block' }}
      data-ad-client="ca-pub-4812271687474025"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={fullWidthResponsive.toString()}
    />
  );
}
