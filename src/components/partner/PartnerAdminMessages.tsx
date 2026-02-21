import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Video, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useAdminPartnerChat } from "@/hooks/useAdminPartnerChat";
import { useVideoConferences } from "@/hooks/useVideoConferences";
import JitsiMeet from "@/components/shared/JitsiMeet";
import logoEssenza from "@/assets/logo-essenza.jpg";

interface PartnerAdminMessagesProps {
  partnerId: string;
}

const PartnerAdminMessages = ({ partnerId }: PartnerAdminMessagesProps) => {
  const {
    messages, messagesLoading, sendMessage, sendingMessage,
    markAsRead, totalUnread, setActivePartnerId,
  } = useAdminPartnerChat(false);

  const { conferences, updateStatus } = useVideoConferences(partnerId);
  const [messageInput, setMessageInput] = useState("");
  const [activeJitsiRoom, setActiveJitsiRoom] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set active partner on mount
  useEffect(() => {
    setActivePartnerId(partnerId);
  }, [partnerId, setActivePartnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (partnerId) markAsRead(partnerId);
  }, [partnerId, markAsRead, messages.length]);

  const upcomingConfs = conferences.filter(
    c => c.status === "scheduled" || c.status === "in_progress"
  );

  const handleSend = () => {
    if (!messageInput.trim()) return;
    sendMessage(messageInput.trim());
    setMessageInput("");
  };

  if (activeJitsiRoom) {
    return <JitsiMeet roomName={activeJitsiRoom} displayName="Parceiro" onClose={() => setActiveJitsiRoom(null)} />;
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Mensagens da Essenza
            {totalUnread > 0 && <Badge variant="destructive">{totalUnread}</Badge>}
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">Comunicação direta com a administração</p>

        {/* Upcoming video conferences */}
        {upcomingConfs.length > 0 && (
          <div className="mt-3 space-y-2">
            {upcomingConfs.map(conf => (
              <div key={conf.id} className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-primary" />
                  <div>
                    <span className="font-medium text-sm">{conf.title}</span>
                    <p className="text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {format(new Date(conf.scheduled_at), "dd/MM/yyyy 'às' HH:mm")} · {conf.duration_minutes}min
                    </p>
                    {conf.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{conf.description}</p>
                    )}
                  </div>
                </div>
                <Button size="sm" onClick={() => {
                  if (conf.status === "scheduled") updateStatus({ id: conf.id, status: "in_progress" });
                  setActiveJitsiRoom(conf.room_name);
                }} className="gap-1.5">
                  <Video className="w-3 h-3" />
                  {conf.status === "in_progress" ? "Entrar" : "Entrar na Sala"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardHeader>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-muted-foreground">A carregar mensagens...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Nenhuma mensagem da administração ainda.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => {
              const isAdmin = msg.sender_type === "admin";
              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-2", isAdmin ? "justify-start" : "justify-end")}>
                  {isAdmin && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={logoEssenza} />
                      <AvatarFallback>E</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                    isAdmin ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                  )}>
                    {isAdmin && <span className="text-xs font-medium text-primary block mb-0.5">Essenza</span>}
                    <p>{msg.content}</p>
                    <span className={cn("text-[10px] mt-1 block",
                      isAdmin ? "text-muted-foreground" : "text-primary-foreground/70"
                    )}>
                      {format(new Date(msg.created_at), "HH:mm")}
                    </span>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input value={messageInput} onChange={e => setMessageInput(e.target.value)}
            placeholder="Responder à Essenza..."
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            disabled={sendingMessage} />
          <Button onClick={handleSend} disabled={sendingMessage || !messageInput.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PartnerAdminMessages;
