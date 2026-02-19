/**
 * 채팅창 컴포넌트 (모달/위젯 공용)
 */

import { useRef, useEffect, useState } from 'react';
import { useChat } from '../../hooks/useChat';
import type { ChatMessage } from '../../hooks/useChat';
import ChatInput from './ChatInput';
import UpgradeModal from '../UpgradeModal';

interface ChatWindowProps {
  onClose?: () => void;
  isModal?: boolean;
}

/** 메시지를 본문과 고정멘트로 분리 */
function splitMessage(text: string): { body: string; disclaimer: string | null } {
  const disclaimerMatch = text.match(/※\s*.+$/);
  if (disclaimerMatch) {
    return {
      body: text.slice(0, disclaimerMatch.index).trim(),
      disclaimer: disclaimerMatch[0],
    };
  }
  return { body: text, disclaimer: null };
}

/** 문단 포맷팅 */
function formatBody(text: string) {
  const paragraphs = text.split(/(?<=\.)\s+/).filter(p => p.trim());

  return paragraphs.map((para, i) => {
    // 번호 목록
    const listMatch = para.match(/^(\d+)\.\s*\*\*(.+?)\*\*:?\s*(.*)$/);
    if (listMatch) {
      return (
        <div key={i} className="mb-2">
          <span className="font-semibold text-primary">{listMatch[1]}. {listMatch[2]}</span>
          {listMatch[3] && <span className="text-gray-600">: {listMatch[3]}</span>}
        </div>
      );
    }

    // 불릿 목록
    if (para.startsWith('- ')) {
      return (
        <div key={i} className="ml-3 mb-1.5 flex gap-2">
          <span className="text-primary">•</span>
          <span>{para.slice(2)}</span>
        </div>
      );
    }

    // 일반 문단
    const formatted = para
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-primary">$1</code>');

    return (
      <p key={i} className="mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />
    );
  });
}

export default function ChatWindow({ onClose, isModal = false }: ChatWindowProps) {
  const { messages, isLoading, error, sendMessage, stopGeneration, clearMessages } = useChat();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // AI 상담 한도 에러 감지
  useEffect(() => {
    if (error?.includes('업그레이드') || error?.includes('횟수')) setShowUpgrade(true);
  }, [error]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const welcomeMessage: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    content: '안녕하세요! 노무 상담 AI **페이봇**입니다.\n\n급여, 4대보험, 노동법 관련 질문을 해주세요.',
    timestamp: new Date(),
  };

  const allMessages = messages.length === 0 ? [welcomeMessage] : messages;

  return (
    <div className="flex flex-col h-full">
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} reason="ai_chat" />
      {/* 헤더 */}
      <div className={`flex items-center justify-between px-5 ${isModal ? 'py-4' : 'py-3'} bg-gradient-to-r from-primary to-blue-600 text-white`}>
        <div className="flex items-center gap-3">
          <div className={`${isModal ? 'w-12 h-12' : 'w-10 h-10'} bg-white/20 rounded-full flex items-center justify-center`}>
            <span className={`${isModal ? 'text-2xl' : 'text-xl'}`}>🤖</span>
          </div>
          <div>
            <h3 className={`font-bold ${isModal ? 'text-lg' : 'text-sm'}`}>페이봇 AI</h3>
            <p className={`text-blue-100 ${isModal ? 'text-sm' : 'text-xs'}`}>노무 상담 챗봇</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearMessages}
            className={`${isModal ? 'p-2' : 'p-1.5'} hover:bg-white/10 rounded-lg transition-colors`}
            title="새 대화"
          >
            <svg className={`${isModal ? 'w-5 h-5' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className={`${isModal ? 'p-2' : 'p-1.5'} hover:bg-white/10 rounded-lg transition-colors`}
            >
              <svg className={`${isModal ? 'w-5 h-5' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 메시지 목록 */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {allMessages.map((message) => {
          if (message.role === 'user') {
            return (
              <div key={message.id} className="flex justify-end">
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md ${isModal ? 'text-base' : 'text-sm'} bg-primary text-white`}>
                  {message.content}
                </div>
              </div>
            );
          }

          const { body, disclaimer } = splitMessage(message.content);
          return (
            <div key={message.id} className="flex justify-start">
              <div className="max-w-[90%] space-y-2">
                <div className={`px-4 py-3 rounded-2xl rounded-bl-md ${isModal ? 'text-base' : 'text-sm'} bg-white border border-gray-200 text-gray-700`}>
                  {formatBody(body)}
                </div>
                {disclaimer && (
                  <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 flex items-start gap-1.5">
                    <span className="text-amber-500">⚠️</span>
                    <span>{disclaimer.replace('※', '').trim()}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

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

      {/* 에러 표시 */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-sm border-t border-red-100">
          {error}
        </div>
      )}

      {/* 입력창 */}
      <ChatInput onSend={sendMessage} onStop={stopGeneration} isLoading={isLoading} isModal={isModal} />

      {/* 면책 조항 */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 text-center">
          참고용 정보입니다. 실제 적용 시 전문가 상담 권장
        </p>
      </div>
    </div>
  );
}
