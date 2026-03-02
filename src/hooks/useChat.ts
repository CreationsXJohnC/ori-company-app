/**
 * ORI APP — Chat Hooks
 * Manages Ori AI chat sessions and streaming message flow.
 */

import { useState, useCallback, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, invokeFunction } from '@/lib/supabase';
import { QUERY_KEYS } from '@/utils/constants';
import { trackChatMessage } from '@/lib/analytics';
import { useAuthStore } from '@/stores/authStore';
import type { ChatSession, ChatMessage } from '@/types';

// ─── Fetch Chat Sessions ──────────────────────────────────────────────────────
export function useChatSessions() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: QUERY_KEYS.chatSessions,
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as ChatSession[];
    },
    enabled: !!user,
  });
}

// ─── Fetch Messages for a Session ────────────────────────────────────────────
export function useChatMessages(sessionId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.chatSession(sessionId ?? ''),
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId!)
        .order('created_at');
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!sessionId,
  });
}

// ─── Create New Session ───────────────────────────────────────────────────────
export function useCreateChatSession() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (title?: string) => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user!.id, title: title ?? null })
        .select()
        .single();
      if (error) throw error;
      return data as ChatSession;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.chatSessions });
    },
  });
}

// ─── Send Message Hook ────────────────────────────────────────────────────────
interface UseSendMessageOptions {
  sessionId:   string;
  onChunk?:    (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?:    (error: Error) => void;
}

export function useSendMessage(options: UseSendMessageOptions) {
  const { sessionId, onChunk, onComplete, onError } = options;
  const qc = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming) return;
      setIsStreaming(true);

      // Save user message to DB immediately
      const { error: saveError } = await supabase
        .from('chat_messages')
        .insert({ session_id: sessionId, role: 'user', content });

      if (saveError) {
        onError?.(new Error(saveError.message));
        setIsStreaming(false);
        return;
      }

      // Optimistically update local query cache
      qc.setQueryData(
        QUERY_KEYS.chatSession(sessionId),
        (old: ChatMessage[] | undefined) => [
          ...(old ?? []),
          {
            id: `temp-user-${Date.now()}`,
            session_id: sessionId,
            role: 'user' as const,
            content,
            token_count: null,
            created_at: new Date().toISOString(),
          },
        ]
      );

      trackChatMessage(sessionId);

      try {
        abortRef.current = new AbortController();

        // Call edge function for AI completion
        const { data, error } = await invokeFunction<{ response: string; tokens: number }>(
          'chat-completion',
          { session_id: sessionId, message: content }
        );

        if (error) throw error;

        const assistantContent = data?.response ?? '';

        // Save assistant response
        await supabase.from('chat_messages').insert({
          session_id:  sessionId,
          role:        'assistant',
          content:     assistantContent,
          token_count: data?.tokens ?? null,
        });

        // Update session timestamp
        await supabase
          .from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', sessionId);

        onComplete?.(assistantContent);
        qc.invalidateQueries({ queryKey: QUERY_KEYS.chatSession(sessionId) });
      } catch (err) {
        onError?.(err instanceof Error ? err : new Error('Failed to get response'));
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [sessionId, isStreaming, onChunk, onComplete, onError, qc]
  );

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { sendMessage, isStreaming, cancelStream };
}
