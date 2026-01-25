/**
 * 네비게이션 컴포넌트
 */

import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  // 랜딩페이지 여부 확인 (투명 네비게이션용)
  const isLandingPage = location.pathname === '/';

  // 로그인 상태에 따른 메뉴 분기
  const navItems = isAuthenticated
    ? [
        { path: '/dashboard', label: '대시보드' },
        { path: '/calculator', label: '급여 계산' },
        { path: '/guide', label: '가이드' },
      ]
    : [
        { path: '/calculator', label: '급여 계산' },
        { path: '/#pricing', label: '요금제' },
        { path: '/guide', label: '가이드' },
        { path: '/examples', label: '사례' },
      ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className={`${isLandingPage ? 'bg-transparent absolute top-0 left-0 right-0 z-50' : 'bg-white shadow-md'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className={`text-2xl font-bold ${isLandingPage ? 'text-white' : 'text-blue-600'}`}>
                paytools
              </span>
            </Link>
          </div>

          {/* 데스크탑 메뉴 */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? isLandingPage
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-50 text-blue-600'
                    : isLandingPage
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* 인증 상태에 따른 버튼 */}
            {isAuthenticated ? (
              <div className={`flex items-center space-x-2 ml-2 pl-2 border-l ${isLandingPage ? 'border-white/30' : 'border-gray-300'}`}>
                <span className={`text-sm ${isLandingPage ? 'text-white/80' : 'text-gray-700'}`}>
                  {user?.name || user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isLandingPage ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className={`flex items-center space-x-2 ml-2 pl-2 border-l ${isLandingPage ? 'border-white/30' : 'border-gray-300'}`}>
                <Link
                  to="/login"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isLandingPage ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  로그인
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    isLandingPage
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  무료 시작
                </Link>
              </div>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none ${
                isLandingPage ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="메뉴"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* 모바일 인증 버튼 */}
            <div className="border-t border-gray-200 pt-2 mt-2">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-700">
                    {user?.name || user?.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
