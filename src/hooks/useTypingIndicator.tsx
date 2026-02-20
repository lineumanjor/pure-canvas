import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TypingState {
  user_id: string;
  conversation_id: string;
  is_typing: boolean;
}

/**
 * Hook to broadcast and listen for typing indicators per conversation.
 * Uses a dedicated Supabase Realtime Presence channel.
 */
export const useTypingIndicator = (conversationId: string | null) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user || !conversationId) return;

    const channelName = `typing-${conversationId}`;
    const channel = supabase.channel(channelName, {
      config: { presence: { key: user.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<TypingState>();
        const typing = new Set<string>();
        Object.entries(state).forEach(([userId, presences]) => {
          if (userId !== user.id) {
            const latest = presences[presences.length - 1] as unknown as TypingState;
            if (latest?.is_typing) {
              typing.add(userId);
            }
          }
        });
        setTypingUsers(typing);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            conversation_id: conversationId,
            is_typing: false,
          });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, conversationId]);

  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (!channelRef.current || !user || !conversationId) return;
      await channelRef.current.track({
        user_id: user.id,
        conversation_id: conversationId,
        is_typing: isTyping,
      });

      // Auto-stop typing after 3 seconds of no input
      if (isTyping) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(async () => {
          if (channelRef.current) {
            await channelRef.current.track({
              user_id: user.id,
              conversation_id: conversationId,
              is_typing: false,
            });
          }
        }, 3000);
      }
    },
    [user, conversationId]
  );

  const isAnyoneTyping = typingUsers.size > 0;

  return { typingUsers, isAnyoneTyping, setTyping };
};
