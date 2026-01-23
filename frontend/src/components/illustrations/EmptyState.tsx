/**
 * 빈 상태 일러스트레이션
 */

interface EmptyStateProps {
  type?: 'no-result' | 'no-data' | 'error';
  message?: string;
  className?: string;
}

export default function EmptyState({
  type = 'no-result',
  message,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="mb-4">{illustrations[type]}</div>
      {message && <p className="text-gray-500 text-sm text-center">{message}</p>}
    </div>
  );
}

const illustrations = {
  'no-result': (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      {/* 빈 문서 */}
      <rect x="30" y="20" width="60" height="80" rx="4" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
      <rect x="40" y="35" width="30" height="3" rx="1.5" fill="#CBD5E1" />
      <rect x="40" y="44" width="40" height="3" rx="1.5" fill="#CBD5E1" />
      <rect x="40" y="53" width="25" height="3" rx="1.5" fill="#CBD5E1" />
      <rect x="40" y="65" width="35" height="3" rx="1.5" fill="#E2E8F0" />
      <rect x="40" y="74" width="20" height="3" rx="1.5" fill="#E2E8F0" />
      {/* 돋보기 */}
      <circle cx="78" cy="78" r="14" fill="white" stroke="#3B82F6" strokeWidth="3" />
      <path d="M88 88L96 96" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
      <path d="M74 78H82M78 74V82" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  'no-data': (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      {/* 빈 차트 */}
      <rect x="20" y="30" width="80" height="60" rx="4" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
      <path d="M30 80L50 65L65 72L80 50L90 55" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
      {/* 물음표 풍선 */}
      <circle cx="90" cy="30" r="15" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
      <text x="90" y="36" textAnchor="middle" fill="#3B82F6" fontSize="16" fontWeight="bold">?</text>
    </svg>
  ),
  error: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      {/* 경고 삼각형 */}
      <path d="M60 25L95 85H25L60 25Z" fill="#FEF2F2" stroke="#F87171" strokeWidth="2" />
      <path d="M60 50V65" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="73" r="2" fill="#EF4444" />
      {/* 장식 원 */}
      <circle cx="25" cy="40" r="4" fill="#FECACA" opacity="0.5" />
      <circle cx="95" cy="45" r="3" fill="#FECACA" opacity="0.5" />
    </svg>
  ),
};
