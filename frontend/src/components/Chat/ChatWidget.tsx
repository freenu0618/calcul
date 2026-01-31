/**
 * 채팅 위젯 (플로팅 버튼 + 큰 모달)
 * 로그인 사용자만 표시
 */

import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import ChatWindow from './ChatWindow';

export default function ChatWidget() {
  const { isOpen, toggleChat, closeChat } = useChat();
  const { isAuthenticated } = useAuth();

  // 비로그인 시 챗봇 버튼 숨김
  if (!isAuthenticated) return null;

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-600 hover:to-blue-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-2xl"
        aria-label={isOpen ? '채팅 닫기' : 'AI 상담 열기'}
      >
        {isOpen ? (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
      </button>

      {/* 배경 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={closeChat}
        />
      )}

      {/* 채팅 모달 - 크게 */}
      {isOpen && (
        <div className="fixed inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[480px] sm:h-[600px] md:w-[540px] md:h-[680px] z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <ChatWindow onClose={closeChat} isModal />
        </div>
      )}
    </>
  );
}
