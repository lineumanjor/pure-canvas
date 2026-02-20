import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
type Message = Database["public"]["Tables"]["messages"]["Row"];

interface ConversationWithDetails extends Conversation {
  partner?: {
    id: string;
    name: string;
    image_url: string | null;
    user_id: string | null;
  };
  product?: {
    id: string;
    name: string;
  } | null;
  unreadCount?: number;
  lastMessage?: Message | null;
}

interface MessageWithSender extends Message {
  isOwn: boolean;
  isAdmin?: boolean;
  replyTo?: {
    id: string;
    content: string;
    sender_type: string;
  } | null;
}

interface UseChatOptions {
  partnerId?: string;
  isAdminMode?: boolean;
}

export const useChat = (options: UseChatOptions = {}) => {
  const { partnerId, isAdminMode = false } = options;
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Fetch all conversations for the current user (client, partner, or admin)
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["conversations", user?.id, isAdminMode],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          partner:partners(id, name, image_url, user_id),
          product:products(id, name)
        `)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      // Get unread counts and last messages
      const conversationsWithDetails: ConversationWithDetails[] = await Promise.all(
        (data || []).map(async (conv) => {
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .neq("sender_id", user.id)
            .is("read_at", null);

          const { data: lastMessageData } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            unreadCount: count || 0,
            lastMessage: lastMessageData,
          };
        })
      );

      return conversationsWithDetails;
    },
    enabled: !!user,
  });

  // Fetch messages for active conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", activeConversationId],
    queryFn: async () => {
      if (!activeConversationId || !user) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const allMessages = data || [];

      // Build a map for reply lookups
      const msgMap = new Map(allMessages.map((m) => [m.id, m]));

      return allMessages.map((msg) => {
        const replyMsg = (msg as any).reply_to_id ? msgMap.get((msg as any).reply_to_id) : null;
        return {
          ...msg,
          reply_to_id: (msg as any).reply_to_id || null,
          isOwn: msg.sender_id === user.id,
          isAdmin: msg.sender_type === "admin",
          replyTo: replyMsg
            ? { id: replyMsg.id, content: replyMsg.content, sender_type: replyMsg.sender_type }
            : null,
        };
      }) as MessageWithSender[];
    },
    enabled: !!activeConversationId && !!user,
  });

  // Create or get existing conversation
  const getOrCreateConversation = useCallback(
    async (targetPartnerId: string, productId?: string) => {
      if (!user) return null;

      // Check for existing conversation
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("client_id", user.id)
        .eq("partner_id", targetPartnerId)
        .eq("status", "active")
        .maybeSingle();

      if (existing) {
        setActiveConversationId(existing.id);
        return existing.id;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({
          client_id: user.id,
          partner_id: targetPartnerId,
          product_id: productId || null,
        })
        .select("id")
        .single();

      if (error) throw error;

      setActiveConversationId(newConv.id);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      return newConv.id;
    },
    [user, queryClient]
  );

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ 
      conversationId, 
      content, 
      asAdmin = false,
      file,
      replyToId,
    }: { 
      conversationId: string; 
      content: string;
      asAdmin?: boolean;
      file?: { url: string; name: string; type: string };
      replyToId?: string | null;
    }) => {
      if (!user) throw new Error("Not authenticated");

      let senderType: "client" | "partner" | "admin";

      if (asAdmin && isAdmin) {
        senderType = "admin";
      } else {
        const { data: conv } = await supabase
          .from("conversations")
          .select("client_id, partner_id")
          .eq("id", conversationId)
          .single();

        if (!conv) throw new Error("Conversation not found");

        const isClient = conv.client_id === user.id;
        senderType = isClient ? "client" : "partner";
      }

      const messageData: any = {
        conversation_id: conversationId,
        sender_id: user.id,
        sender_type: senderType,
        content,
        message_type: file?.type || "text",
        file_url: file?.url || null,
        file_name: file?.name || null,
        reply_to_id: replyToId || null,
      };

      const { data, error } = await supabase
        .from("messages")
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Mark messages as read
  const markAsRead = useCallback(
    async (conversationId: string) => {
      if (!user) return;

      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .neq("sender_id", user.id)
        .is("read_at", null);

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    [user, queryClient]
  );

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("chat-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages"] });
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Get total unread count
  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  // Filter conversations by partner (for partner view) - skip filter in admin mode
  const filteredConversations = isAdminMode 
    ? conversations 
    : partnerId
      ? conversations.filter((conv) => conv.partner_id === partnerId)
      : conversations;

  return {
    conversations: filteredConversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    conversationsLoading,
    messagesLoading,
    getOrCreateConversation,
    sendMessage: sendMessageMutation.mutate,
    sendingMessage: sendMessageMutation.isPending,
    markAsRead,
    totalUnread,
    isAdminMode,
  };
};

export type { ConversationWithDetails, MessageWithSender };
