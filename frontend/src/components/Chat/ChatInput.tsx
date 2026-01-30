/**
 * 채팅 입력 컴포넌트
 */

import { useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
}

const QUICK_QUESTIONS = [
  '최저임금이 얼마인가요?',
  '연장근로 수당 계산법',
  '4대보험료 얼마나 공제되나요?',
];

export default function ChatInput({ onSend, onStop, isLoading }: ChatInputProps) {
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

  const handleQuickQuestion = (question: string) => {
    onSend(question);
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* 빠른 질문 */}
      {!isLoading && input === '' && (
        <div className="px-3 py-2 flex flex-wrap gap-1.5">
          {QUICK_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => handleQuickQuestion(q)}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* 입력 영역 */}
      <div className="p-3 flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="질문을 입력하세요..."
          rows={1}
          className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-24"
          disabled={isLoading}
        />

        {isLoading ? (
          <button
            onClick={onStop}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            title="중지"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
            title="전송"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        )}
      </div>

      {/* 면책 조항 */}
      <div className="px-3 pb-2">
        <p className="text-xs text-gray-400 text-center">
          참고용 정보입니다. 실제 적용 시 전문가 상담을 권장합니다.
        </p>
      </div>
    </div>
  );
}
