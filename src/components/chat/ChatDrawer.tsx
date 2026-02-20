import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, MessageCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ChatMessage from "./ChatMessage";
import ChatInput, { type ReplyingTo } from "./ChatInput";
import OnlineIndicator from "./OnlineIndicator";
import TypingIndicator from "./TypingIndicator";
import type { MessageWithSender } from "@/hooks/useChat";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  partnerId: string;
  partnerName: string;
  partnerImage?: string | null;
}

const ChatDrawer = ({
  isOpen,
  onClose,
  partnerId,
  partnerName,
  partnerImage,
}: ChatDrawerProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { isOnline } = useOnlinePresence();
  const {
    messages,
    activeConversationId,
    messagesLoading,
    getOrCreateConversation,
    sendMessage,
    sendingMessage,
    markAsRead,
  } = useChat();
  const { isAnyoneTyping, setTyping } = useTypingIndicator(activeConversationId);

  // Get partner's user_id for presence check
  const { data: partnerUserId } = useQuery({
    queryKey: ["partner-user-id", partnerId],
    queryFn: async () => {
      const { data } = await supabase
        .from("partners")
        .select("user_id")
        .eq("id", partnerId)
        .single();
      return data?.user_id || null;
    },
    enabled: !!partnerId,
  });

  // Get user initials
  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);

  const handleReply = (msg: MessageWithSender) => {
    const label = msg.sender_type === "partner" ? partnerName : "Você";
    setReplyingTo({ id: msg.id, content: msg.content, senderLabel: label });
  };

  // Initialize conversation when drawer opens
  useEffect(() => {
    if (isOpen && user && partnerId) {
      getOrCreateConversation(partnerId);
    }
  }, [isOpen, user, partnerId, getOrCreateConversation]);

  // Mark messages as read when conversation is active
  useEffect(() => {
    if (activeConversationId && isOpen) {
      markAsRead(activeConversationId);
    }
  }, [activeConversationId, isOpen, markAsRead, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (content: string, file?: { url: string; name: string; type: string }) => {
    if (!activeConversationId) return;
    sendMessage({
      conversationId: activeConversationId,
      content,
      file,
      replyToId: replyingTo?.id || null,
    });
    setReplyingTo(null);
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background border-l border-border shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={partnerImage || undefined} alt={partnerName} />
                  <AvatarFallback>
                    {partnerName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {partnerUserId && (
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <OnlineIndicator isOnline={isOnline(partnerUserId)} size="sm" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{partnerName}</h3>
                <OnlineIndicator isOnline={partnerUserId ? isOnline(partnerUserId) : false} size="sm" showLabel />
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse text-muted-foreground">
                    A carregar mensagens...
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
                  <h4 className="font-medium text-foreground mb-2">
                    Inicie uma conversa
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Envie uma mensagem para o vendedor sobre seus produtos.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <ChatMessage 
                      key={msg.id} 
                      message={msg} 
                      viewMode="client"
                      clientAvatarUrl={profile?.avatar_url}
                      clientInitials={getUserInitials()}
                      partnerAvatarUrl={partnerImage}
                      partnerName={partnerName}
                      onReply={handleReply}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
              <AnimatePresence>
                {isAnyoneTyping && <TypingIndicator label={`${partnerName} está a escrever`} />}
              </AnimatePresence>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              <ChatInput
                onSend={handleSend}
                disabled={sendingMessage || !activeConversationId}
                onTyping={setTyping}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatDrawer;
