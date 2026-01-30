/**
 * 히어로 섹션 내 AI 채팅 박스
 */

import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';

const QUICK_QUESTIONS = [
  { icon: '💰', text: '2026년 최저임금은?' },
  { icon: '⏰', text: '연장근로 수당 계산법' },
  { icon: '🏥', text: '4대보험 공제율' },
];

/** 간단한 마크다운 포맷팅 */
function formatMessage(text: string) {
  // 줄바꿈 처리
  const lines = text.split('\n');

  return lines.map((line, i) => {
    // 번호 목록 (1. 2. 3.)
    const listMatch = line.match(/^(\d+)\.\s*\*\*(.+?)\*\*:?\s*(.*)$/);
    if (listMatch) {
      return (
        <div key={i} className="mb-2">
          <span className="font-bold text-primary">{listMatch[1]}. {listMatch[2]}</span>
          {listMatch[3] && <span className="text-gray-600">: {listMatch[3]}</span>}
        </div>
      );
    }

    // 굵은 텍스트만 있는 경우
    const boldMatch = line.match(/^\*\*(.+?)\*\*:?\s*(.*)$/);
    if (boldMatch) {
      return (
        <div key={i} className="mb-1">
          <span className="font-bold">{boldMatch[1]}</span>
          {boldMatch[2] && <span>: {boldMatch[2]}</span>}
        </div>
      );
    }

    // - 로 시작하는 목록
    if (line.startsWith('- ')) {
      const content = line.slice(2).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
      return (
        <div key={i} className="ml-2 mb-1 flex gap-1">
          <span className="text-primary">•</span>
          <span dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      );
    }

    // 일반 텍스트 (굵은 글씨 처리)
    if (line.trim()) {
      const formatted = line.replace(/\*\*(.+?)\*\*/g, '<b class="text-gray-800">$1</b>');
      return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: formatted }} />;
    }

    return <br key={i} />;
  });
}

export default function HeroChatBox() {
  const [input, setInput] = useState('');
  const { messages, isLoading, sendMessage, stopGeneration } = useChat();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasMessages = messages.length > 0;

  // 채팅 박스 내부만 스크롤 (전체 페이지 스크롤 방지)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative lg:h-auto flex items-center justify-center">
      {/* Background Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/10 via-blue-50 to-white rounded-full blur-3xl opacity-60 pointer-events-none" />

      {/* Chat Box */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary to-blue-600">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">🤖</span>
          </div>
          <div>
            <h3 className="text-white font-bold">페이봇 AI</h3>
            <p className="text-blue-100 text-xs">노무 상담 챗봇</p>
          </div>
        </div>

        {/* Messages Area */}
        <div ref={messagesContainerRef} className="h-64 overflow-y-auto p-4 bg-gray-50">
          {!hasMessages ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-3xl">💬</span>
              </div>
              <p className="text-gray-600 font-medium mb-1">무엇이든 물어보세요!</p>
              <p className="text-gray-400 text-sm">급여, 4대보험, 노동법 질문에 답해드려요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-md'
                        : 'bg-white border border-gray-200 text-gray-700 rounded-bl-md'
                    }`}
                  >
                    {msg.role === 'user' ? msg.content : formatMessage(msg.content)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Questions */}
        {!hasMessages && (
          <div className="px-4 py-3 border-t border-gray-100 bg-white">
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q.text)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-primary/10 hover:text-primary text-gray-600 text-xs rounded-full transition-colors"
                >
                  <span>{q.icon}</span>
                  <span>{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="질문을 입력하세요..."
              rows={1}
              className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              disabled={isLoading}
            />
            {isLoading ? (
              <button
                onClick={stopGeneration}
                className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2.5 bg-primary hover:bg-primary-600 disabled:bg-gray-200 text-white rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center">
            참고용 정보입니다. 실제 적용 시 전문가 상담 권장
          </p>
        </div>
      </div>

      {/* Floating Badge */}
      <div className="absolute -bottom-4 -right-2 md:right-4 bg-white p-2.5 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 animate-float">
        <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600">
          <span className="material-symbols-outlined text-[18px]">verified</span>
        </div>
        <div>
          <p className="text-[10px] text-gray-400">2026년 법령</p>
          <p className="text-xs font-bold text-text-main">최신 반영</p>
        </div>
      </div>
    </div>
  );
}
