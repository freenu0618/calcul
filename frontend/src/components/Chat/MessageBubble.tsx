/**
 * 메시지 버블 컴포넌트
 */

import type { ChatMessage } from '../../hooks/useChat';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
        }`}
      >
        {/* 메시지 내용 */}
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-current animate-pulse" />
          )}
        </div>

        {/* 타임스탬프 */}
        <div
          className={`text-xs mt-1 ${
            isUser ? 'text-blue-200' : 'text-gray-400'
          }`}
        >
          {message.timestamp.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
