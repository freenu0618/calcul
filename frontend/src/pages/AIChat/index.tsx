/**
 * AI 채팅 메인 페이지 - follaw.co.kr 스타일
 * 화면 중앙에 채팅 인터페이스
 */

import { Helmet } from 'react-helmet-async';
import { useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import type { ChatMessage } from '../../hooks/useChat';
import MessageBubble from '../../components/Chat/MessageBubble';
import AIChatInput from './AIChatInput';

const QUICK_QUESTIONS = [
  { icon: '💰', text: '최저임금이 얼마인가요?' },
  { icon: '⏰', text: '연장근로 수당은 어떻게 계산하나요?' },
  { icon: '🏥', text: '4대보험료 계산 방법' },
  { icon: '🏖️', text: '연차휴가 일수 계산' },
  { icon: '📋', text: '퇴직금 계산 방법' },
  { icon: '💵', text: '주휴수당이란?' },
];

export default function AIChatPage() {
  const { messages, isLoading, error, sendMessage, stopGeneration, clearMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const welcomeMessage: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    content:
      '안녕하세요! **페이봇**입니다.\n\n급여 계산, 4대보험, 노동법 등 노무 관련 질문에 답변해 드려요. 궁금한 점을 자유롭게 물어보세요!',
    timestamp: new Date(),
  };

  const allMessages = messages.length === 0 ? [welcomeMessage] : messages;
  const hasStarted = messages.length > 0;

  return (
    <>
      <Helmet>
        <title>페이봇 - AI 노무 상담 | PayTools</title>
        <meta name="description" content="AI 노무 상담 챗봇. 급여, 4대보험, 노동법 질문에 즉시 답변해드립니다." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        {/* 헤더 */}
        <header className="py-4 px-6 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🤖</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">페이봇</h1>
              <p className="text-xs text-gray-500">AI 노무 상담</p>
            </div>
          </div>
          {hasStarted && (
            <button
              onClick={clearMessages}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              새 대화
            </button>
          )}
        </header>

        {/* 메인 채팅 영역 */}
        <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4">
          {!hasStarted ? (
            /* 초기 화면 */
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🤖</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">무엇이든 물어보세요</h2>
                <p className="text-gray-600">급여, 4대보험, 노동법 관련 질문에 답변해 드려요</p>
              </div>

              {/* 빠른 질문 그리드 */}
              <div className="w-full max-w-lg grid grid-cols-2 gap-3 mb-8">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q.text)}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
                  >
                    <span className="text-2xl">{q.icon}</span>
                    <span className="text-sm text-gray-700 group-hover:text-blue-700">{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* 대화 진행 중 */
            <div className="flex-1 overflow-y-auto py-6 space-y-4">
              {allMessages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* 에러 표시 */}
          {error && (
            <div className="mx-4 mb-2 px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* 입력창 */}
          <AIChatInput onSend={sendMessage} onStop={stopGeneration} isLoading={isLoading} />
        </main>

        {/* 면책 조항 */}
        <footer className="py-3 text-center">
          <p className="text-xs text-gray-400">
            페이봇의 답변은 참고용이며, 실제 적용 시 전문가 상담을 권장합니다.
          </p>
        </footer>
      </div>
    </>
  );
}
