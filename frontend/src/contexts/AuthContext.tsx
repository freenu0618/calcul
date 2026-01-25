/**
 * 인증 상태 관리 Context
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { API_CONFIG } from '../config/api.config';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
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
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
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

    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('auth_user', JSON.stringify(result.data.user));
    setToken(authToken);
    setUser(result.data.user);
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

    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('auth_user', JSON.stringify(result.data.user));
    setToken(authToken);
    setUser(result.data.user);
  };

  // 로그아웃
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
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
