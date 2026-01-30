/**
 * 채팅 SSE 연결 훅
 */

import { useState, useCallback, useRef } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  timestamp: Date;
}

interface UseChatOptions {
  apiUrl?: string;
  userId?: string;
}

export function useChat(options: UseChatOptions = {}) {
  const {
    apiUrl = import.meta.env.VITE_AI_API_URL || 'http://localhost:8001',
    userId = 'anonymous'
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError(null);

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // 어시스턴트 메시지 placeholder
    const assistantId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch(`${apiUrl}/api/v1/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({ message: content.trim() }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json();
          throw new Error(data.detail?.message || '요청 한도 초과');
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            // SSE event type (token, done, error) - 현재 data만 처리
            continue;
          }
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '') continue;

            // 토큰 추가
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: m.content + data }
                  : m
              )
            );
          }
        }
      }

      // 스트리밍 완료
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, isStreaming: false }
            : m
        )
      );
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;

      const errorMessage = (err as Error).message || '오류가 발생했습니다';
      setError(errorMessage);

      // 에러 메시지로 업데이트
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: `⚠️ ${errorMessage}`, isStreaming: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [apiUrl, userId, isLoading]);

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    stopGeneration,
    clearMessages,
  };
}
