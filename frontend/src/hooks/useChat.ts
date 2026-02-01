/**
 * 채팅 SSE 연결 훅
 * - JWT 토큰으로 사용자 인식
 * - session_id로 대화 히스토리 유지
 * - localStorage로 대화 내역 보존 (사용자별 격리)
 */

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  timestamp: Date;
}

interface UseChatOptions {
  apiUrl?: string;
}

const STORAGE_KEY_PREFIX = 'chat_messages_';
const MAX_STORED_MESSAGES = 50;

function getStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export function useChat(options: UseChatOptions = {}) {
  const {
    apiUrl = import.meta.env.VITE_AI_API_URL || 'http://localhost:8001',
  } = options;

  // useAuth()로 사용자 상태 추적 - 로그인/로그아웃 시 자동 감지
  const { user, isAuthenticated } = useAuth();

  // 사용자별 고유 ID (로그인: user.id, 비로그인: 'anonymous')
  const userId = useMemo(() => {
    return isAuthenticated && user?.id ? String(user.id) : 'anonymous';
  }, [isAuthenticated, user?.id]);

  const storageKey = getStorageKey(userId);

  // 세션 ID 생성 (사용자+탭별 고유)
  const sessionId = useMemo(() => {
    const key = `chat_session_id_${userId}`;
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(key, id);
    }
    return id;
  }, [userId]);

  // localStorage에서 대화 내역 복원 (사용자별 완전 격리)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const prevUserIdRef = useRef<string | null>(null);

  // userId 변경 시 즉시 초기화 후 해당 사용자의 메시지 로드 (보안)
  useEffect(() => {
    // 사용자 변경 감지 시 즉시 메시지 초기화 (다른 사용자 데이터 노출 방지)
    if (prevUserIdRef.current !== null && prevUserIdRef.current !== userId) {
      setMessages([]);
    }
    prevUserIdRef.current = userId;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMessages(parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
      } else {
        setMessages([]);
      }
    } catch (e) {
      console.error('Failed to restore chat messages:', e);
      setMessages([]);
    }
  }, [storageKey, userId]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 메시지 변경 시 localStorage에 저장 (사용자별)
  useEffect(() => {
    // 초기 로드 시에는 저장하지 않음
    if (messages.length === 0) return;

    try {
      const toStore = messages
        .filter(m => !m.isStreaming)
        .slice(-MAX_STORED_MESSAGES);
      localStorage.setItem(storageKey, JSON.stringify(toStore));
    } catch (e) {
      console.error('Failed to save chat messages:', e);
    }
  }, [messages, storageKey]);

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
        if (response.status === 401) {
          throw new Error('로그인 후 이용 가능합니다. 무료 회원가입 후 AI 상담을 이용해보세요!');
        }
        if (response.status === 429) {
          const data = await response.json();
          throw new Error(data.detail?.message || '이번 달 AI 상담 횟수를 모두 사용했습니다. 업그레이드해주세요.');
        }
        throw new Error('일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
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
    localStorage.removeItem(storageKey);
    setError(null);
  }, [storageKey]);

  // 새 대화 시작 (세션 초기화)
  const startNewChat = useCallback(() => {
    const newId = crypto.randomUUID();
    sessionStorage.setItem(`chat_session_id_${userId}`, newId);
    setMessages([]);
    localStorage.removeItem(storageKey);
    setError(null);
  }, [storageKey, userId]);

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
