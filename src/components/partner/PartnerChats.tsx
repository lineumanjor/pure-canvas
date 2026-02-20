import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, User, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChat } from "@/hooks/useChat";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { useProfile } from "@/hooks/useProfile";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput, { type ReplyingTo } from "@/components/chat/ChatInput";
import OnlineIndicator from "@/components/chat/OnlineIndicator";
import TypingIndicator from "@/components/chat/TypingIndicator";
import type { MessageWithSender } from "@/hooks/useChat";

interface PartnerChatsProps {
  partnerId: string;
}

const PartnerChats = ({ partnerId }: PartnerChatsProps) => {
  const { profile: partnerProfile } = useProfile();
  const { isOnline } = useOnlinePresence();
  const {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    conversationsLoading,
    messagesLoading,
    sendMessage,
    sendingMessage,
    markAsRead,
    totalUnread,
  } = useChat({ partnerId });
  const { isAnyoneTyping, setTyping } = useTypingIndicator(activeConversationId);

  const [searchQuery, setSearchQuery] = useState("");
  const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get client profiles for conversations
  const { data: clientProfiles = {} } = useQuery({
    queryKey: ["client-profiles", conversations.map((c) => c.client_id)],
    queryFn: async () => {
      const clientIds = [...new Set(conversations.map((c) => c.client_id))];
      if (clientIds.length === 0) return {};

      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", clientIds);

      return (data || []).reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as Record<string, { full_name: string | null; avatar_url: string | null }>);
    },
    enabled: conversations.length > 0,
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (activeConversationId) {
      markAsRead(activeConversationId);
    }
  }, [activeConversationId, markAsRead, messages.length]);

  const handleReply = (msg: MessageWithSender) => {
    const clientName = activeConversation ? (clientProfiles[activeConversation.client_id]?.full_name || "Cliente") : "Cliente";
    const label = msg.sender_type === "client" ? clientName : "Você";
    setReplyingTo({ id: msg.id, content: msg.content, senderLabel: label });
  };

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

  const filteredConversations = conversations.filter((conv) => {
    const clientName = clientProfiles[conv.client_id]?.full_name || "Cliente";
    return clientName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  if (conversationsLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse text-center text-muted-foreground">
            A carregar conversas...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhuma conversa ainda
          </h3>
          <p className="text-muted-foreground">
            Quando os clientes iniciarem conversas, elas aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-[350px_1fr] gap-4 h-[calc(100vh-280px)] min-h-[500px]">
      {/* Conversations List */}
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Conversas
              {totalUnread > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {totalUnread}
                </Badge>
              )}
            </CardTitle>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredConversations.map((conv) => {
              const clientProfile = clientProfiles[conv.client_id];
              const clientName = clientProfile?.full_name || "Cliente";
              const isActive = conv.id === activeConversationId;

              return (
                <motion.button
                  key={conv.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3",
                    isActive
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={clientProfile?.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <OnlineIndicator isOnline={isOnline(conv.client_id)} size="sm" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground truncate">
                        {clientName}
                      </span>
                      {conv.unreadCount && conv.unreadCount > 0 && (
                        <Badge variant="destructive" className="shrink-0 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage.sender_type === "partner" ? "Você: " : ""}
                        {conv.lastMessage.content}
                      </p>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(conv.last_message_at || conv.created_at), {
                        addSuffix: true,
                        locale: pt,
                      })}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </motion.button>
              );
            })}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={clientProfiles[activeConversation.client_id]?.avatar_url || undefined}
                    />
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <OnlineIndicator isOnline={isOnline(activeConversation.client_id)} size="sm" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    {clientProfiles[activeConversation.client_id]?.full_name || "Cliente"}
                  </h3>
                  <OnlineIndicator isOnline={isOnline(activeConversation.client_id)} size="sm" showLabel />
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse text-muted-foreground">
                    A carregar mensagens...
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <ChatMessage 
                      key={msg.id} 
                      message={msg}
                      viewMode="partner"
                      clientAvatarUrl={clientProfiles[activeConversation.client_id]?.avatar_url}
                      clientInitials={(clientProfiles[activeConversation.client_id]?.full_name || "C").charAt(0).toUpperCase()}
                      partnerAvatarUrl={partnerProfile?.avatar_url}
                      partnerName="Você"
                      onReply={handleReply}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
              <AnimatePresence>
                {isAnyoneTyping && (
                  <TypingIndicator 
                    label={`${clientProfiles[activeConversation.client_id]?.full_name || "Cliente"} está a escrever`} 
                  />
                )}
              </AnimatePresence>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <ChatInput
                onSend={handleSend}
                disabled={sendingMessage}
                onTyping={setTyping}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
              />
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center text-center p-12">
            <div>
              <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-muted-foreground">
                Escolha uma conversa da lista para começar a responder.
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default PartnerChats;
