import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface AdminPartnerMessage {
  id: string;
  partner_id: string;
  sender_id: string;
  sender_type: "admin" | "partner";
  content: string;
  file_url: string | null;
  file_name: string | null;
  read_at: string | null;
  created_at: string;
}

interface PartnerWithUnread {
  id: string;
  name: string;
  image_url: string | null;
  user_id: string | null;
  category: string;
  unreadCount: number;
  lastMessage?: AdminPartnerMessage;
}

export const useAdminPartnerChat = (isAdmin: boolean) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);

  // Get all approved partners with unread counts
  const { data: partners = [], isLoading: partnersLoading } = useQuery({
    queryKey: ["admin-partner-chat-partners", isAdmin],
    queryFn: async () => {
      if (isAdmin) {
        const { data, error } = await supabase
          .from("partners")
          .select("id, name, image_url, user_id, category")
          .eq("status", "approved")
          .order("name");
        if (error) throw error;
        return data || [];
      } else {
        // Partner: get own partner
        const { data, error } = await supabase
          .from("partners")
          .select("id, name, image_url, user_id, category")
          .eq("user_id", user?.id || "")
          .single();
        if (error) throw error;
        return data ? [data] : [];
      }
    },
    enabled: !!user,
  });

  // Get messages for active partner
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["admin-partner-messages", activePartnerId],
    queryFn: async () => {
      if (!activePartnerId) return [];
      const { data, error } = await supabase
        .from("admin_partner_messages")
        .select("*")
        .eq("partner_id", activePartnerId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as AdminPartnerMessage[];
    },
    enabled: !!activePartnerId,
  });

  // Get unread counts per partner
  const { data: unreadCounts = {} } = useQuery({
    queryKey: ["admin-partner-unread", isAdmin, user?.id],
    queryFn: async () => {
      const query = supabase
        .from("admin_partner_messages")
        .select("partner_id, id")
        .is("read_at", null);
      
      if (isAdmin) {
        query.eq("sender_type", "partner");
      } else {
        query.eq("sender_type", "admin");
      }

      const { data, error } = await query;
      if (error) throw error;

      const counts: Record<string, number> = {};
      (data || []).forEach((msg: { partner_id: string }) => {
        counts[msg.partner_id] = (counts[msg.partner_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !!user,
  });

  // Get last messages per partner
  const { data: lastMessages = {} } = useQuery({
    queryKey: ["admin-partner-last-messages", partners.map(p => p.id).join(",")],
    queryFn: async () => {
      if (partners.length === 0) return {};
      const result: Record<string, AdminPartnerMessage> = {};
      
      for (const partner of partners) {
        const { data } = await supabase
          .from("admin_partner_messages")
          .select("*")
          .eq("partner_id", partner.id)
          .order("created_at", { ascending: false })
          .limit(1);
        if (data && data.length > 0) {
          result[partner.id] = data[0] as AdminPartnerMessage;
        }
      }
      return result;
    },
    enabled: partners.length > 0,
  });

  // Send message
  const sendMutation = useMutation({
    mutationFn: async ({ content, partnerId }: { content: string; partnerId: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("admin_partner_messages").insert({
        partner_id: partnerId,
        sender_id: user.id,
        sender_type: isAdmin ? "admin" : "partner",
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partner-messages"] });
      queryClient.invalidateQueries({ queryKey: ["admin-partner-last-messages"] });
      queryClient.invalidateQueries({ queryKey: ["admin-partner-unread"] });
    },
    onError: () => toast.error("Erro ao enviar mensagem"),
  });

  // Mark as read
  const markAsRead = useCallback(async (partnerId: string) => {
    if (!user) return;
    const senderType = isAdmin ? "partner" : "admin";
    await supabase
      .from("admin_partner_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("partner_id", partnerId)
      .eq("sender_type", senderType)
      .is("read_at", null);
    queryClient.invalidateQueries({ queryKey: ["admin-partner-unread"] });
  }, [user, isAdmin, queryClient]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("admin-partner-messages-rt")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "admin_partner_messages",
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-partner-messages"] });
        queryClient.invalidateQueries({ queryKey: ["admin-partner-last-messages"] });
        queryClient.invalidateQueries({ queryKey: ["admin-partner-unread"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  // Combine partners with unread + last message
  const partnersWithDetails: PartnerWithUnread[] = partners.map(p => ({
    ...p,
    unreadCount: unreadCounts[p.id] || 0,
    lastMessage: lastMessages[p.id],
  }));

  const totalUnread = Object.values(unreadCounts).reduce((sum, c) => sum + c, 0);

  return {
    partners: partnersWithDetails,
    partnersLoading,
    messages,
    messagesLoading,
    activePartnerId,
    setActivePartnerId,
    sendMessage: (content: string) => {
      if (activePartnerId) sendMutation.mutate({ content, partnerId: activePartnerId });
    },
    sendingMessage: sendMutation.isPending,
    markAsRead,
    totalUnread,
  };
};
