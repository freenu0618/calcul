/**
 * 결제 성공 페이지
 */

import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { refreshUser } = useAuth();

  useEffect(() => {
    // 결제 완료 후 사용자 정보 새로고침
    refreshUser();
  }, [refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-green-600 text-5xl">
            check_circle
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-text-main mb-2">
          결제가 완료되었습니다!
        </h1>

        {/* Description */}
        <p className="text-text-sub mb-6">
          프리미엄 플랜이 활성화되었습니다.
          <br />
          모든 기능을 자유롭게 이용해보세요.
        </p>

        {/* Session ID (for debugging) */}
        {sessionId && (
          <p className="text-xs text-gray-400 mb-6">
            주문 ID: {sessionId.slice(0, 20)}...
          </p>
        )}

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link
            to="/dashboard"
            className="block w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-colors"
          >
            대시보드로 이동
          </Link>
          <Link
            to="/mypage"
            className="block w-full py-3 bg-gray-100 text-text-main font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            구독 정보 확인
          </Link>
        </div>

        {/* Help */}
        <p className="text-sm text-text-sub mt-6">
          문제가 있으신가요?{' '}
          <Link to="/contact" className="text-primary hover:underline">
            고객센터 문의
          </Link>
        </p>
      </div>
    </div>
  );
}
