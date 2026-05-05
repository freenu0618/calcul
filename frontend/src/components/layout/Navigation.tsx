/**
 * 네비게이션 컴포넌트
 */

import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ChatWindow from '../Chat/ChatWindow';

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  // 랜딩페이지 여부 확인 (fixed 네비게이션용)
  const isLandingPage = location.pathname === '/';

  // 로그인 상태에 따른 메뉴 분기
  const navItems = isAuthenticated
    ? [
        { path: '/dashboard', label: '대시보드' },
        { path: '/calculator', label: '급여 계산' },
        { path: '/simulation', label: '시뮬레이션' },
        { path: '/employees', label: '직원 관리' },
        { path: '/payroll', label: '급여대장' },
        { path: '/guide', label: '가이드' },
      ]
    : [
        { path: '/calculator', label: '급여 계산' },
        { path: '/simulation', label: '시뮬레이션' },
        { path: '/#pricing', label: '요금제' },
        { path: '/guide', label: '가이드' },
      ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`${isLandingPage ? 'bg-white/90 backdrop-blur-sm shadow-sm fixed top-0 left-0 right-0 z-50' : 'bg-white shadow-md'}`}
      aria-label="주요 메뉴"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">
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
                aria-current={isActive(item.path) ? 'page' : undefined}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* AI 채팅 버튼 */}
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-primary to-blue-600 text-white hover:from-primary-600 hover:to-blue-700 transition-all"
              aria-label="AI 노무 상담 열기"
            >
              <span>🤖</span>
              <span>AI 상담</span>
            </button>

            {/* 인증 상태에 따른 버튼 */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-gray-300">
                <Link
                  to="/mypage"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{user?.name || '마이페이지'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-gray-300">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  로그인
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-primary hover:bg-primary-600 text-white"
                >
                  무료 시작
                </Link>
              </div>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md focus:outline-none text-gray-700 hover:bg-gray-100"
              aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
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
        <div id="mobile-navigation" className="md:hidden">
          <div className="px-2 pt-2 pb-3 bg-white border-t">
            {/* 내 서비스 */}
            {isAuthenticated && (
              <>
                <p className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">내 서비스</p>
                {navItems.filter(i => ['/dashboard', '/employees', '/payroll'].includes(i.path)).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={isActive(item.path) ? 'page' : undefined}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </>
            )}

            {/* 도구 */}
            <p className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">도구</p>
            {navItems.filter(i => ['/calculator', '/simulation'].includes(i.path)).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActive(item.path) ? 'page' : undefined}
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {item.label}
              </Link>
            ))}

            {/* 정보 */}
            <p className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">정보</p>
            {navItems.filter(i => ['/guide', '/#pricing'].includes(i.path)).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActive(item.path) ? 'page' : undefined}
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {item.label}
              </Link>
            ))}

            {/* 모바일 AI 채팅 버튼 */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => { setIsChatOpen(true); setIsMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-primary to-blue-600 text-white"
                aria-label="AI 노무 상담 열기"
              >
                <span>🤖</span>
                <span>AI 상담</span>
              </button>
            </div>

            {/* 모바일 인증 버튼 */}
            <div className="border-t border-gray-200 pt-2 mt-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/mypage"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    마이페이지
                  </Link>
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

      {/* AI 채팅 모달 */}
      {isChatOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-[60] backdrop-blur-sm"
            onClick={() => setIsChatOpen(false)}
          />
          <div className="fixed inset-4 sm:inset-auto sm:top-20 sm:right-6 sm:w-[480px] sm:h-[600px] md:w-[540px] md:h-[680px] z-[70] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <ChatWindow onClose={() => setIsChatOpen(false)} isModal />
          </div>
        </>
      )}
    </nav>
  );
};

export default Navigation;
