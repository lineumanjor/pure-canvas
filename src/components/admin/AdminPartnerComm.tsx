import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Store, Search, Video, Calendar, Clock, Send, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { useAdminPartnerChat } from "@/hooks/useAdminPartnerChat";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
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
import { useVideoConferences } from "@/hooks/useVideoConferences";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import OnlineIndicator from "@/components/chat/OnlineIndicator";
import JitsiMeet from "@/components/shared/JitsiMeet";
import logoEssenza from "@/assets/logo-essenza.jpg";

const AdminPartnerComm = () => {
  const { isOnline } = useOnlinePresence();
  const {
    partners, partnersLoading, messages, messagesLoading,
    activePartnerId, setActivePartnerId, sendMessage,
    sendingMessage, markAsRead, totalUnread,
  } = useAdminPartnerChat(true);

  const { conferences, createConference, creating, updateStatus } = useVideoConferences(activePartnerId || undefined);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: "", description: "", date: undefined as Date | undefined,
    time: "10:00", duration: "30",
  });
  const [activeJitsiRoom, setActiveJitsiRoom] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const deletePartnerMessages = async (partnerId: string) => {
    const { error } = await supabase.from("admin_partner_messages").delete().eq("partner_id", partnerId);
    if (error) { toast.error("Erro ao apagar mensagens"); return; }
    toast.success("Mensagens apagadas com sucesso");
    queryClient.invalidateQueries({ queryKey: ["admin-partner-messages"] });
    queryClient.invalidateQueries({ queryKey: ["admin-partner-last-messages"] });
    queryClient.invalidateQueries({ queryKey: ["admin-partner-unread"] });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activePartnerId) markAsRead(activePartnerId);
  }, [activePartnerId, markAsRead, messages.length]);

  const filteredPartners = useMemo(() => {
    if (!searchQuery) return partners;
    return partners.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [partners, searchQuery]);

  const activePartner = partners.find(p => p.id === activePartnerId);

  const handleSend = () => {
    if (!messageInput.trim()) return;
    sendMessage(messageInput.trim());
    setMessageInput("");
  };

  const handleScheduleVideo = () => {
    if (!activePartnerId || !scheduleForm.date || !scheduleForm.title) return;
    const [hours, minutes] = scheduleForm.time.split(":").map(Number);
    const scheduledAt = new Date(scheduleForm.date);
    scheduledAt.setHours(hours, minutes, 0, 0);

    createConference({
      partner_id: activePartnerId,
      title: scheduleForm.title,
      description: scheduleForm.description,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: parseInt(scheduleForm.duration),
    });
    setShowScheduleDialog(false);
    setScheduleForm({ title: "", description: "", date: undefined, time: "10:00", duration: "30" });
  };

  const upcomingConfs = conferences.filter(c => c.status === "scheduled" || c.status === "in_progress");

  if (partnersLoading) {
    return (
      <Card><CardContent className="p-8">
        <div className="animate-pulse text-center text-muted-foreground">A carregar parceiros...</div>
      </CardContent></Card>
    );
  }

  if (activeJitsiRoom) {
    return <JitsiMeet roomName={activeJitsiRoom} displayName="Essenza Admin" onClose={() => setActiveJitsiRoom(null)} />;
  }

  return (
    <div className="grid lg:grid-cols-[350px_1fr] gap-4 h-[calc(100vh-280px)] min-h-[600px]">
      {/* Partners List */}
      <Card className="flex flex-col">
        <CardHeader className="pb-3 space-y-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comunicação Parceiros
            {totalUnread > 0 && <Badge variant="destructive">{totalUnread}</Badge>}
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar parceiro..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9" />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredPartners.map(partner => (
              <motion.button key={partner.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => setActivePartnerId(partner.id)}
                className={cn("w-full p-3 rounded-lg text-left transition-colors",
                  partner.id === activePartnerId ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={partner.image_url || undefined} />
                      <AvatarFallback><Store className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                    {partner.unreadCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                        {partner.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate text-sm">{partner.name}</span>
                      {partner.user_id && <OnlineIndicator isOnline={isOnline(partner.user_id)} size="sm" />}
                    </div>
                    {partner.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {partner.lastMessage.sender_type === "admin" ? "Você: " : ""}
                        {partner.lastMessage.content}
                      </p>
                    )}
                    {partner.lastMessage && (
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(partner.lastMessage.created_at), { addSuffix: true, locale: pt })}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex flex-col">
        {activePartner ? (
          <>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activePartner.image_url || undefined} />
                    <AvatarFallback><Store className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-foreground flex items-center gap-2">
                      {activePartner.name}
                      {activePartner.user_id && <OnlineIndicator isOnline={isOnline(activePartner.user_id)} size="sm" />}
                    </h3>
                    <p className="text-xs text-muted-foreground">{activePartner.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Upcoming conferences indicator */}
                  {upcomingConfs.length > 0 && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Video className="w-3 h-3" />
                      {upcomingConfs.length} agendada(s)
                    </Badge>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Apagar mensagens?</AlertDialogTitle>
                        <AlertDialogDescription>Todas as mensagens com {activePartner.name} serão permanentemente apagadas.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deletePartnerMessages(activePartnerId!)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Apagar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Video className="w-4 h-4" />
                        Agendar Vídeo
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Agendar Videoconferência</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label>Título *</Label>
                          <Input value={scheduleForm.title}
                            onChange={e => setScheduleForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="Ex: Reunião de alinhamento" />
                        </div>
                        <div className="space-y-2">
                          <Label>Descrição</Label>
                          <Textarea value={scheduleForm.description}
                            onChange={e => setScheduleForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Pauta da reunião (opcional)" rows={3} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Data *</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal",
                                  !scheduleForm.date && "text-muted-foreground")}>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {scheduleForm.date ? format(scheduleForm.date, "dd/MM/yyyy") : "Selecionar"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent mode="single" selected={scheduleForm.date}
                                  onSelect={d => setScheduleForm(f => ({ ...f, date: d }))}
                                  disabled={d => d < new Date()}
                                  className="p-3 pointer-events-auto" />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-2">
                            <Label>Hora *</Label>
                            <Input type="time" value={scheduleForm.time}
                              onChange={e => setScheduleForm(f => ({ ...f, time: e.target.value }))} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Duração</Label>
                          <Select value={scheduleForm.duration}
                            onValueChange={v => setScheduleForm(f => ({ ...f, duration: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 minutos</SelectItem>
                              <SelectItem value="30">30 minutos</SelectItem>
                              <SelectItem value="45">45 minutos</SelectItem>
                              <SelectItem value="60">1 hora</SelectItem>
                              <SelectItem value="90">1h30</SelectItem>
                              <SelectItem value="120">2 horas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleScheduleVideo} disabled={creating || !scheduleForm.title || !scheduleForm.date}
                          className="w-full gap-2">
                          <Video className="w-4 h-4" />
                          {creating ? "A agendar..." : "Agendar Videoconferência"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Upcoming conferences cards */}
              {upcomingConfs.length > 0 && (
                <div className="mt-3 space-y-2">
                  {upcomingConfs.map(conf => (
                    <div key={conf.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-primary" />
                        <span className="font-medium">{conf.title}</span>
                        <span className="text-muted-foreground">
                          {format(new Date(conf.scheduled_at), "dd/MM HH:mm")} · {conf.duration_minutes}min
                        </span>
                      </div>
                      <Button size="sm" variant={conf.status === "in_progress" ? "default" : "outline"}
                        onClick={() => {
                          if (conf.status === "scheduled") updateStatus({ id: conf.id, status: "in_progress" });
                          setActiveJitsiRoom(conf.room_name);
                        }}
                        className="gap-1">
                        <Video className="w-3 h-3" />
                        {conf.status === "in_progress" ? "Entrar" : "Iniciar"}
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
                    <p className="text-muted-foreground">Nenhuma mensagem ainda. Inicie a conversa!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map(msg => {
                    const isAdmin = msg.sender_type === "admin";
                    return (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        className={cn("flex gap-2", isAdmin ? "justify-end" : "justify-start")}>
                        {!isAdmin && (
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={activePartner.image_url || undefined} />
                            <AvatarFallback><Store className="w-3 h-3" /></AvatarFallback>
                          </Avatar>
                        )}
                        <div className={cn("max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                          isAdmin ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                        )}>
                          <p>{msg.content}</p>
                          <span className={cn("text-[10px] mt-1 block",
                            isAdmin ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}>
                            {format(new Date(msg.created_at), "HH:mm")}
                          </span>
                        </div>
                        {isAdmin && (
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={logoEssenza} />
                            <AvatarFallback>E</AvatarFallback>
                          </Avatar>
                        )}
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
                  placeholder="Escreva uma mensagem..."
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  disabled={sendingMessage} />
                <Button onClick={handleSend} disabled={sendingMessage || !messageInput.trim()} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center text-center p-12">
            <div>
              <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Selecione um parceiro</h3>
              <p className="text-muted-foreground">Escolha um parceiro para enviar mensagens ou agendar videoconferências.</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AdminPartnerComm;
