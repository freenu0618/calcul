/**
 * 채팅 위젯 (플로팅 버튼 + 모달)
 * - 로그인 사용자: AI 채팅 (ChatWindow)
 * - 비로그인 사용자: 키워드 FAQ 정적 답변
 * - 모바일: fullscreen 모달
 */

import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import ChatWindow from './ChatWindow';
import QuickFAQPanel from './QuickFAQPanel';

export default function ChatWidget() {
  const { isOpen, toggleChat, closeChat } = useChat();
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-600 hover:to-blue-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-2xl"
        aria-label={isOpen ? '채팅 닫기' : 'AI 상담 열기'}
      >
        {isOpen ? (
          <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-xl sm:text-2xl">🤖</span>
        )}
      </button>

      {/* 배경 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={closeChat}
        />
      )}

      {/* 모달 - 모바일: fullscreen / 데스크탑: 우하단 */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[480px] sm:h-[600px] md:w-[540px] md:h-[680px] z-50 bg-white sm:rounded-2xl shadow-2xl sm:border border-gray-200 flex flex-col overflow-hidden">
          {isAuthenticated ? (
            <ChatWindow onClose={closeChat} isModal />
          ) : (
            <QuickFAQPanel onClose={closeChat} />
          )}
        </div>
      )}
    </>
  );
}
