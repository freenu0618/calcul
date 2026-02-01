/**
 * 인증 상태 관리 Context
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { API_CONFIG } from '../config/api.config';

/** 요금제 타입 */
export type UserPlan = 'FREE' | 'TRIAL' | 'BASIC' | 'PRO' | 'ENTERPRISE';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  plan: UserPlan;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  setTokenDirectly: (token: string, name?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  /** 유료 사용자 여부 (PRO 또는 ENTERPRISE) */
  isPaidUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드 시 localStorage에서 토큰 및 사용자 정보 복구
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setToken(storedToken);
      setUser({
        ...parsedUser,
        plan: parsedUser.subscriptionTier || parsedUser.plan || 'FREE',
      });
    }
    setIsLoading(false);
  }, []);

  // 로그인
  const login = async (email: string, password: string) => {
    const response = await fetch(API_CONFIG.getApiUrl('/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '로그인에 실패했습니다.');
    }

    const result = await response.json();
    const authToken = result.data.accessToken;
    const userData: User = {
      ...result.data.user,
      plan: result.data.user.subscriptionTier || result.data.user.plan || 'FREE',
    };

    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  // 회원가입
  const register = async (email: string, password: string, fullName: string) => {
    const response = await fetch(API_CONFIG.getApiUrl('/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        email,
        password,
        name: fullName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '회원가입에 실패했습니다.');
    }

    const result = await response.json();
    const authToken = result.data.accessToken;
    const userData: User = {
      ...result.data.user,
      plan: result.data.user.subscriptionTier || result.data.user.plan || 'FREE',
    };

    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  // 로그아웃
  const logout = () => {
    // 현재 사용자의 채팅 내역 삭제 (보안)
    if (user?.id) {
      localStorage.removeItem(`chat_messages_${user.id}`);
      sessionStorage.removeItem(`chat_session_id_${user.id}`);
    }
    // 비로그인 사용자 채팅도 삭제
    localStorage.removeItem('chat_messages_anonymous');
    sessionStorage.removeItem('chat_session_id_anonymous');

    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  };

  // 사용자 정보 새로고침 (결제 후 플랜 갱신 등)
  const refreshUser = async () => {
    if (!token) return;

    try {
      const response = await fetch(API_CONFIG.getApiUrl('/auth/me'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const userData: User = {
          ...result.data,
          plan: result.data.subscriptionTier || result.data.plan || 'FREE',
        };
        localStorage.setItem('auth_user', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  // OAuth 콜백용: JWT 토큰 직접 설정 후 서버에서 전체 사용자 정보 조회
  const setTokenDirectly = async (authToken: string, nameFromUrl?: string) => {
    try {
      // JWT payload 디코딩 (기본 정보만)
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      const basicUserData: User = {
        id: parseInt(payload.sub, 10) || 0,
        email: payload.email || '',
        name: nameFromUrl || payload.name || payload.email?.split('@')[0] || '',
        role: payload.role || 'USER',
        plan: 'FREE', // 임시값, 아래에서 서버 조회로 갱신
      };

      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(basicUserData));
      setToken(authToken);
      setUser(basicUserData);

      // 서버에서 전체 사용자 정보 조회 (subscriptionTier 포함)
      const response = await fetch(API_CONFIG.getApiUrl('/auth/me'), {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (response.ok) {
        const result = await response.json();
        const fullUserData: User = {
          ...result.data,
          plan: result.data.subscriptionTier || result.data.plan || 'FREE',
        };
        localStorage.setItem('auth_user', JSON.stringify(fullUserData));
        setUser(fullUserData);
      }
    } catch (e) {
      console.error('JWT 토큰 파싱 실패:', e);
      throw new Error('유효하지 않은 토큰입니다.');
    }
  };

  // 유료 사용자 여부 (TRIAL, BASIC, PRO, ENTERPRISE)
  const isPaidUser = user?.plan !== 'FREE' && user?.plan !== undefined;

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    setTokenDirectly,
    refreshUser,
    isAuthenticated: !!token && !!user,
    isPaidUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
