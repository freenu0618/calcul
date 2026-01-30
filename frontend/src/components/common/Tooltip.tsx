/**
 * 툴팁 컴포넌트
 * 마우스 호버/터치 시 설명 텍스트를 표시
 * 모바일에서 화면 밖으로 나가지 않도록 자동 조정
 */

import { useState, useRef, useEffect, useCallback } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: number;
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  maxWidth = 280,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [adjustedStyle, setAdjustedStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // 위치 조정 (화면 밖으로 나가지 않도록)
  const adjustPosition = useCallback(() => {
    if (!tooltipRef.current || !triggerRef.current) return;

    const tooltip = tooltipRef.current.getBoundingClientRect();
    const trigger = triggerRef.current.getBoundingClientRect();
    const padding = 8;
    const style: React.CSSProperties = {};
    const screenWidth = window.innerWidth;
    const effectiveMaxWidth = Math.min(maxWidth, screenWidth - padding * 2);
    style.maxWidth = effectiveMaxWidth;
    style.minWidth = Math.min(200, effectiveMaxWidth); // 최소 너비 보장

    // left/right 포지션: 좌우 경계 체크 스킵 (세로 표시 방지)
    if (position === 'left' || position === 'right') {
      setAdjustedStyle(style);
      return;
    }

    // top/bottom 포지션: 좌우 경계 체크
    if (tooltip.left < padding) {
      style.left = -trigger.left + padding;
      style.transform = 'translateX(0)';
    } else if (tooltip.right > screenWidth - padding) {
      style.left = 'auto';
      style.right = -(screenWidth - trigger.right - padding);
      style.transform = 'translateX(0)';
    }

    setAdjustedStyle(style);
  }, [maxWidth, position]);

  useEffect(() => {
    if (isVisible) {
      // 약간의 딜레이 후 위치 조정 (렌더링 완료 후)
      requestAnimationFrame(adjustPosition);
    }
  }, [isVisible, adjustPosition]);

  // 터치 디바이스 지원
  const handleTouchStart = () => {
    setIsVisible(true);
  };

  const handleTouchEnd = () => {
    // 터치 후 2초 뒤 자동 닫힘
    setTimeout(() => setIsVisible(false), 2000);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-y-transparent border-l-transparent',
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${positionClasses[position]}`}
          style={adjustedStyle}
        >
          <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-lg whitespace-normal break-words">
            {content}
          </div>
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
}
