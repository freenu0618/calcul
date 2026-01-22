/**
 * 아코디언 컴포넌트
 * 접히고 펼쳐지는 콘텐츠 영역
 */

import { useState, useRef, useEffect, type ReactNode } from 'react';

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
  badge?: string | number;
}

export default function Accordion({
  title,
  children,
  defaultOpen = false,
  icon,
  badge,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(defaultOpen ? undefined : 0);

  useEffect(() => {
    if (isOpen) {
      const contentHeight = contentRef.current?.scrollHeight;
      setHeight(contentHeight);
      // 애니메이션 후 auto로 변경 (동적 콘텐츠 대응)
      const timer = setTimeout(() => setHeight(undefined), 300);
      return () => clearTimeout(timer);
    } else {
      setHeight(contentRef.current?.scrollHeight);
      requestAnimationFrame(() => setHeight(0));
    }
  }, [isOpen]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-gray-500">{icon}</span>}
          <span className="font-medium text-gray-700">{title}</span>
          {badge !== undefined && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        ref={contentRef}
        style={{ height: height !== undefined ? `${height}px` : 'auto' }}
        className="transition-[height] duration-300 ease-in-out overflow-hidden"
      >
        <div className="p-4 bg-white">{children}</div>
      </div>
    </div>
  );
}
