/**
 * AI 채팅 입력 컴포넌트 - 메인 페이지용
 */

import { useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';

interface AIChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
}

export default function AIChatInput({ onSend, onStop, isLoading }: AIChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 자동 높이 조절
  const handleInput = (value: string) => {
    setInput(value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="sticky bottom-0 pb-4 pt-2 bg-gradient-to-t from-white via-white to-transparent">
      <div className="flex items-end gap-3 bg-white border border-gray-200 rounded-2xl shadow-lg p-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="질문을 입력하세요..."
          rows={1}
          className="flex-1 resize-none border-0 px-4 py-3 text-base focus:outline-none placeholder-gray-400 max-h-30"
          disabled={isLoading}
        />

        {isLoading ? (
          <button
            onClick={onStop}
            className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors flex-shrink-0"
            title="중지"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex-shrink-0"
            title="전송"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
