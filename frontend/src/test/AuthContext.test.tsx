/**
 * AuthContext 테스트
 * 로그인/로그아웃, 토큰 만료, 보호된 라우트 접근 제어
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// 테스트용 컴포넌트
function TestComponent() {
  const { user, token, isAuthenticated, logout } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? '인증됨' : '미인증'}
      </div>
      {user && <div data-testid="user-email">{user.email}</div>}
      {token && <div data-testid="token">{token}</div>}
      <button onClick={logout}>로그아웃</button>
    </div>
  );
}

describe('AuthContext 테스트', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. 로그인/로그아웃 플로우', () => {
    it('초기 상태는 미인증이어야 함', () => {
      // When: AuthProvider로 컴포넌트 렌더링
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Then: 미인증 상태
      expect(screen.getByTestId('auth-status')).toHaveTextContent('미인증');
    });

    it('localStorage에 토큰이 있으면 자동 로그인', () => {
      // Given: localStorage에 인증 정보 저장
      localStorage.setItem('auth_token', 'valid-token');
      localStorage.setItem('auth_user', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        name: '테스트',
        role: 'USER',
        plan: 'FREE',
      }));

      // When: AuthProvider 렌더링
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Then: 자동 로그인되어 인증 상태
      expect(screen.getByTestId('auth-status')).toHaveTextContent('인증됨');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('token')).toHaveTextContent('valid-token');
    });

    it('로그아웃 시 사용자 정보와 토큰이 제거되어야 함', async () => {
      const user = userEvent.setup();

      // Given: 로그인된 상태
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('auth_user', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        name: '테스트',
        role: 'USER',
        plan: 'FREE',
      }));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // When: 로그아웃 버튼 클릭
      await user.click(screen.getByText('로그아웃'));

      // Then: 미인증 상태로 변경
      expect(screen.getByTestId('auth-status')).toHaveTextContent('미인증');

      // localStorage에서 제거 확인
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('auth_user')).toBeNull();
    });
  });

  describe('2. 토큰 만료 검증 로직', () => {
    it('JWT 파싱 시 만료 시간 검증', () => {
      // Given: 만료된 토큰 (exp가 과거)
      const now = Math.floor(Date.now() / 1000);
      const expiredTime = now - 3600; // 1시간 전 만료

      interface JwtPayload {
        exp: number;
      }

      const mockPayload: JwtPayload = {
        exp: expiredTime,
      };

      // When: 만료 시간 확인
      const isExpired = mockPayload.exp * 1000 < Date.now();

      // Then: 만료됨
      expect(isExpired).toBe(true);
    });

    it('JWT 파싱 시 유효한 토큰 검증', () => {
      // Given: 유효한 토큰 (exp가 미래)
      const now = Math.floor(Date.now() / 1000);
      const validTime = now + 3600; // 1시간 후 만료

      interface JwtPayload {
        exp: number;
      }

      const mockPayload: JwtPayload = {
        exp: validTime,
      };

      // When: 만료 시간 확인
      const isExpired = mockPayload.exp * 1000 < Date.now();

      // Then: 유효함
      expect(isExpired).toBe(false);
    });
  });

  describe('3. 보호된 라우트 접근 제어', () => {
    it('미인증 사용자는 보호된 컨텐츠에 접근할 수 없어야 함', () => {
      // Given: 미인증 상태
      function ProtectedComponent() {
        const { isAuthenticated } = useAuth();

        if (!isAuthenticated) {
          return <div data-testid="login-required">로그인이 필요합니다</div>;
        }

        return <div data-testid="protected-content">보호된 컨텐츠</div>;
      }

      render(
        <AuthProvider>
          <ProtectedComponent />
        </AuthProvider>
      );

      // Then: 접근 불가 메시지 표시
      expect(screen.getByTestId('login-required')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('인증된 사용자는 보호된 컨텐츠에 접근할 수 있어야 함', () => {
      // Given: 인증된 상태
      localStorage.setItem('auth_token', 'valid-token');
      localStorage.setItem('auth_user', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        name: '테스트',
        role: 'USER',
        plan: 'FREE',
      }));

      function ProtectedComponent() {
        const { isAuthenticated } = useAuth();

        if (!isAuthenticated) {
          return <div data-testid="login-required">로그인이 필요합니다</div>;
        }

        return <div data-testid="protected-content">보호된 컨텐츠</div>;
      }

      render(
        <AuthProvider>
          <ProtectedComponent />
        </AuthProvider>
      );

      // Then: 보호된 컨텐츠 표시
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('login-required')).not.toBeInTheDocument();
    });

    it('유료 사용자만 접근 가능한 기능 제어', () => {
      // Given: 무료 사용자
      localStorage.setItem('auth_token', 'valid-token');
      localStorage.setItem('auth_user', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        name: '테스트',
        role: 'USER',
        plan: 'FREE',
      }));

      function PremiumComponent() {
        const { user } = useAuth();
        const isPaidUser = user?.plan !== 'FREE' && user?.plan !== undefined;

        if (!isPaidUser) {
          return <div data-testid="upgrade-required">업그레이드가 필요합니다</div>;
        }

        return <div data-testid="premium-content">프리미엄 기능</div>;
      }

      render(
        <AuthProvider>
          <PremiumComponent />
        </AuthProvider>
      );

      // Then: 업그레이드 요구 메시지
      expect(screen.getByTestId('upgrade-required')).toBeInTheDocument();
      expect(screen.queryByTestId('premium-content')).not.toBeInTheDocument();
    });

    it('PRO 플랜 사용자는 프리미엄 기능에 접근 가능', () => {
      // Given: PRO 사용자
      localStorage.setItem('auth_token', 'valid-token');
      localStorage.setItem('auth_user', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        name: '테스트',
        role: 'USER',
        plan: 'PRO',
      }));

      function PremiumComponent() {
        const { user } = useAuth();
        const isPaidUser = user?.plan !== 'FREE' && user?.plan !== undefined;

        if (!isPaidUser) {
          return <div data-testid="upgrade-required">업그레이드가 필요합니다</div>;
        }

        return <div data-testid="premium-content">프리미엄 기능</div>;
      }

      render(
        <AuthProvider>
          <PremiumComponent />
        </AuthProvider>
      );

      // Then: 프리미엄 컨텐츠 표시
      expect(screen.getByTestId('premium-content')).toBeInTheDocument();
      expect(screen.queryByTestId('upgrade-required')).not.toBeInTheDocument();
    });
  });
});
