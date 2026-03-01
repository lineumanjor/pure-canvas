import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, User, Store, ChevronRight, Search, Shield, Eye, Filter, Archive, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useChat, type ConversationWithDetails } from "@/hooks/useChat";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import logoEssenza from "@/assets/logo-essenza.jpg";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput, { type ReplyingTo } from "@/components/chat/ChatInput";
import OnlineIndicator from "@/components/chat/OnlineIndicator";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import type { MessageWithSender } from "@/hooks/useChat";

type StatusFilter = "all" | "active" | "archived";

const AdminChats = () => {
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
  } = useChat({ isAdminMode: true });
  const { isAnyoneTyping, setTyping } = useTypingIndicator(activeConversationId);

  const [searchQuery, setSearchQuery] = useState("");
  const [sendAsEssenza, setSendAsEssenza] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [partnerFilter, setPartnerFilter] = useState<string>("all");
  const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const deleteConversation = async (convId: string) => {
    // Delete messages first, then conversation
    const { error: msgError } = await supabase.from("messages").delete().eq("conversation_id", convId);
    if (msgError) { toast.error("Erro ao apagar mensagens"); return; }
    const { error } = await supabase.from("conversations").delete().eq("id", convId);
    if (error) { toast.error("Erro ao apagar conversa"); return; }
    toast.success("Conversa apagada com sucesso");
    if (activeConversationId === convId) setActiveConversationId(null);
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  // Get client and partner profiles for conversations
  const { data: profiles = {} } = useQuery({
    queryKey: ["all-profiles", conversations.map((c) => c.client_id)],
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

  // Get unique partners from conversations for filter dropdown
  const uniquePartners = useMemo(() => {
    const partnersMap = new Map<string, { id: string; name: string }>();
    conversations.forEach((conv) => {
      if (conv.partner && !partnersMap.has(conv.partner.id)) {
        partnersMap.set(conv.partner.id, {
          id: conv.partner.id,
          name: conv.partner.name,
        });
      }
    });
    return Array.from(partnersMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name, "pt")
    );
  }, [conversations]);

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
    let label = "Essenza";
    if (msg.sender_type === "partner") label = activeConversation?.partner?.name || "Vendedor";
    if (msg.sender_type === "client") label = profiles[activeConversation?.client_id || ""]?.full_name || "Cliente";
    setReplyingTo({ id: msg.id, content: msg.content, senderLabel: label });
  };

  const handleSend = (content: string, file?: { url: string; name: string; type: string }) => {
    if (!activeConversationId) return;
    sendMessage({
      conversationId: activeConversationId,
      content,
      asAdmin: sendAsEssenza,
      file,
      replyToId: replyingTo?.id || null,
    });
    setReplyingTo(null);
  };

  // Apply all filters
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // Status filter
      if (statusFilter === "active" && conv.status !== "active") return false;
      if (statusFilter === "archived" && conv.status !== "archived") return false;

      // Partner filter
      if (partnerFilter !== "all" && conv.partner_id !== partnerFilter) return false;

      // Search filter
      const clientName = profiles[conv.client_id]?.full_name || "Cliente";
      const partnerName = conv.partner?.name || "Parceiro";
      const searchLower = searchQuery.toLowerCase();
      return (
        clientName.toLowerCase().includes(searchLower) ||
        partnerName.toLowerCase().includes(searchLower)
      );
    });
  }, [conversations, statusFilter, partnerFilter, searchQuery, profiles]);

  // Count by status for badges
  const statusCounts = useMemo(() => {
    return {
      all: conversations.length,
      active: conversations.filter((c) => c.status === "active").length,
      archived: conversations.filter((c) => c.status === "archived").length,
    };
  }, [conversations]);

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
            Nenhuma conversa na plataforma
          </h3>
          <p className="text-muted-foreground">
            Quando clientes iniciarem conversas com vendedores, elas aparecerão aqui para monitoramento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-[400px_1fr] gap-4 h-[calc(100vh-280px)] min-h-[600px]">
      {/* Conversations List */}
      <Card className="flex flex-col">
        <CardHeader className="pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Monitoramento de Chats
              {totalUnread > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {totalUnread}
                </Badge>
              )}
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Visualize e intervenha em conversas como Essenza
          </p>
          
          {/* Filters Section */}
          <div className="space-y-3 pt-2">
            {/* Status Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Status
              </Label>
              <ToggleGroup 
                type="single" 
                value={statusFilter} 
                onValueChange={(value) => value && setStatusFilter(value as StatusFilter)}
                className="justify-start"
              >
                <ToggleGroupItem value="all" size="sm" className="text-xs gap-1 px-2.5">
                  Todas
                  <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                    {statusCounts.all}
                  </Badge>
                </ToggleGroupItem>
                <ToggleGroupItem value="active" size="sm" className="text-xs gap-1 px-2.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Ativas
                  <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                    {statusCounts.active}
                  </Badge>
                </ToggleGroupItem>
                <ToggleGroupItem value="archived" size="sm" className="text-xs gap-1 px-2.5">
                  <Archive className="w-3 h-3" />
                  Arquivadas
                  <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                    {statusCounts.archived}
                  </Badge>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Partner Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Store className="w-3 h-3" />
                Parceiro
              </Label>
              <Select value={partnerFilter} onValueChange={setPartnerFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos os parceiros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os parceiros</SelectItem>
                  {uniquePartners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por cliente ou parceiro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Nenhuma conversa encontrada com os filtros selecionados.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const clientProfile = profiles[conv.client_id];
                  const clientName = clientProfile?.full_name || "Cliente";
                  const partnerName = conv.partner?.name || "Parceiro";
                  const isSelected = conv.id === activeConversationId;
                  const isArchived = conv.status === "archived";

                  return (
                    <motion.button
                      key={conv.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setActiveConversationId(conv.id)}
                      className={cn(
                        "w-full p-3 rounded-lg text-left transition-colors",
                        isSelected
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted",
                        isArchived && "opacity-70"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className={cn("h-10 w-10 shrink-0", isArchived && "grayscale")}>
                            <AvatarImage src={conv.partner?.image_url || undefined} />
                            <AvatarFallback>
                              <Store className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          {conv.unreadCount && conv.unreadCount > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                            >
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground truncate text-sm">
                              {partnerName}
                            </span>
                            {conv.partner?.user_id && (
                              <OnlineIndicator isOnline={isOnline(conv.partner.user_id)} size="sm" />
                            )}
                            {isArchived && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1 shrink-0">
                                <Archive className="w-2.5 h-2.5 mr-0.5" />
                                Arquivada
                              </Badge>
                            )}
                            <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="text-xs text-muted-foreground truncate">
                              {clientName}
                            </span>
                            <OnlineIndicator isOnline={isOnline(conv.client_id)} size="sm" />
                          </div>
                          {conv.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.lastMessage.sender_type === "admin" && (
                                <span className="text-primary font-medium">Essenza: </span>
                              )}
                              {conv.lastMessage.sender_type === "partner" && "Vendedor: "}
                              {conv.lastMessage.sender_type === "client" && "Cliente: "}
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
                      </div>
                    </motion.button>
                  );
                })
              )}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activeConversation.partner?.image_url || undefined} />
                    <AvatarFallback>
                      <Store className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-foreground flex items-center gap-2">
                      <span className="flex items-center gap-1.5">
                        {activeConversation.partner?.name}
                        {activeConversation.partner?.user_id && (
                          <OnlineIndicator isOnline={isOnline(activeConversation.partner.user_id)} size="sm" />
                        )}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground font-normal flex items-center gap-1.5">
                        {profiles[activeConversation.client_id]?.full_name || "Cliente"}
                        <OnlineIndicator isOnline={isOnline(activeConversation.client_id)} size="sm" />
                      </span>
                    </h3>
                    {activeConversation.product && (
                      <p className="text-xs text-muted-foreground">
                        Produto: {activeConversation.product.name}
                      </p>
                    )}
                  </div>
                </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Eye className="w-3 h-3" />
                  Monitorando
                </Badge>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Apagar conversa?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Todas as mensagens desta conversa serão permanentemente apagadas. Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteConversation(activeConversationId!)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Apagar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                      viewMode="admin"
                      partnerAvatarUrl={activeConversation.partner?.image_url}
                      partnerName={activeConversation.partner?.name}
                      clientAvatarUrl={profiles[activeConversation.client_id]?.avatar_url}
                      clientInitials={(profiles[activeConversation.client_id]?.full_name || "C").charAt(0).toUpperCase()}
                      onReply={handleReply}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
              <AnimatePresence>
                {isAnyoneTyping && <TypingIndicator />}
              </AnimatePresence>
            </ScrollArea>

            {/* Input with Admin Toggle */}
            <div className="p-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="send-as-essenza"
                    checked={sendAsEssenza}
                    onCheckedChange={setSendAsEssenza}
                  />
                  <Label htmlFor="send-as-essenza" className="text-sm flex items-center gap-2">
                    {sendAsEssenza ? (
                      <>
                        <img src={logoEssenza} alt="Essenza" className="w-5 h-5 rounded-full object-cover" />
                        Enviar como Essenza
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Enviar como Admin
                      </>
                    )}
                  </Label>
                </div>
                {sendAsEssenza && (
                  <Badge variant="secondary" className="text-xs">
                    Mensagem institucional
                  </Badge>
                )}
              </div>
              <ChatInput
                onSend={handleSend}
                disabled={sendingMessage}
                placeholder={sendAsEssenza ? "Escreva uma mensagem como Essenza..." : "Escreva uma mensagem..."}
                onTyping={setTyping}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
              />
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center text-center p-12">
            <div>
              <Eye className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Selecione uma conversa para monitorar
              </h3>
              <p className="text-muted-foreground">
                Escolha uma conversa da lista para visualizar o histórico e intervir se necessário.
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AdminChats;
