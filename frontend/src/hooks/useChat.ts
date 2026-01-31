/**
 * 채팅 SSE 연결 훅
 * - JWT 토큰으로 사용자 인식
 * - session_id로 대화 히스토리 유지
 * - localStorage로 대화 내역 보존
 */

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';

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

const STORAGE_KEY = 'chat_messages';
const MAX_STORED_MESSAGES = 50;

export function useChat(options: UseChatOptions = {}) {
  const {
    apiUrl = import.meta.env.VITE_AI_API_URL || 'http://localhost:8001',
    userId = 'anonymous'
  } = options;

  // 세션 ID 생성 (탭별 고유, 새로고침 시 유지)
  const sessionId = useMemo(() => {
    const key = 'chat_session_id';
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(key, id);
    }
    return id;
  }, []);

  // localStorage에서 대화 내역 복원
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      }
    } catch (e) {
      console.error('Failed to restore chat messages:', e);
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 메시지 변경 시 localStorage에 저장
  useEffect(() => {
    try {
      // 스트리밍 중인 메시지는 저장하지 않음
      const toStore = messages
        .filter(m => !m.isStreaming)
        .slice(-MAX_STORED_MESSAGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.error('Failed to save chat messages:', e);
    }
  }, [messages]);

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

      // localStorage에서 JWT 토큰 가져오기 (AuthContext와 동일한 키 사용)
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/v1/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: content.trim(),
          session_id: sessionId,
          token: token, // body에도 토큰 전달
        }),
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
      let currentEvent = 'token';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
            continue;
          }
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '') continue;

            // tool_call 이벤트는 무시
            if (currentEvent === 'tool_call') {
              continue;
            }

            // done 이벤트는 처리하지 않음
            if (currentEvent === 'done') {
              continue;
            }

            // error 이벤트 처리
            if (currentEvent === 'error') {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: `⚠️ ${data}`, isStreaming: false }
                    : m
                )
              );
              continue;
            }

            // token 이벤트만 메시지에 추가
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
  }, [apiUrl, userId, sessionId, isLoading]);

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    setError(null);
  }, []);

  // 새 대화 시작 (세션 초기화)
  const startNewChat = useCallback(() => {
    const newId = crypto.randomUUID();
    sessionStorage.setItem('chat_session_id', newId);
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    stopGeneration,
    clearMessages,
    startNewChat,
  };
}
