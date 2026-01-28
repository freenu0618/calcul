/**
 * OAuth 콜백 처리 페이지
 * 소셜 로그인 성공 후 JWT 토큰을 저장하고 리다이렉트
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTokenDirectly } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const name = searchParams.get('name');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('소셜 로그인에 실패했습니다: ' + decodeURIComponent(errorParam));
      return;
    }

    if (token) {
      // JWT 토큰 저장 및 사용자 정보 로드 (name은 URL 파라미터에서 가져옴)
      setTokenDirectly(token, name ? decodeURIComponent(name) : undefined);
      navigate('/', { replace: true });
    } else {
      setError('인증 토큰을 받지 못했습니다.');
    }
  }, [searchParams, navigate, setTokenDirectly]);

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto mt-12 text-center">
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 text-blue-600 hover:underline"
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-md mx-auto mt-12 text-center">
        <div className="animate-pulse">
          <p className="text-gray-600">로그인 처리 중...</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default OAuthCallback;
