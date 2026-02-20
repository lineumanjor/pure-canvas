import { motion } from "framer-motion";
import { User, Store, FileText, Download, Reply } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import logoEssenza from "@/assets/logo-essenza.jpg";
import ReadStatus from "./ReadStatus";
import type { MessageWithSender } from "@/hooks/useChat";

export type ChatViewMode = "client" | "partner" | "admin";

interface ChatMessageProps {
  message: MessageWithSender;
  viewMode: ChatViewMode;
  clientAvatarUrl?: string | null;
  clientInitials?: string;
  partnerAvatarUrl?: string | null;
  partnerName?: string;
  onReply?: (message: MessageWithSender) => void;
}

/**
 * ChatMessage Component
 * 
 * Positioning rules:
 * - Client view: Own messages (client) → RIGHT, Partner messages → LEFT
 * - Partner view: Own messages (partner) → RIGHT, Client messages → LEFT
 * - Admin messages (ESSENZA E.J): Always CENTERED
 * 
 * This applies to ALL messages including historical ones.
 */
const ChatMessage = ({
  message,
  viewMode,
  clientAvatarUrl,
  clientInitials = "C",
  partnerAvatarUrl,
  partnerName = "Parceiro",
  onReply,
}: ChatMessageProps) => {
  const isAdminMessage = message.sender_type === "admin";
  const isPartnerMessage = message.sender_type === "partner";
  const isClientMessage = message.sender_type === "client";

  // Admin messages are always centered regardless of view mode
  if (isAdminMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <div className="max-w-[85%] rounded-2xl px-4 py-2 bg-primary/15 border-2 border-primary/25">
          <div className="flex items-center gap-2 mb-1 pb-1 border-b border-primary/20">
            <img 
              src={logoEssenza} 
              alt="Essenza" 
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-xs font-semibold text-primary">Essenza</span>
            <Badge variant="outline" className="text-[10px] h-4 px-1">
              Suporte
            </Badge>
          </div>
          <div className="flex flex-col">
            {message.message_type === "image" && message.file_url && (
              <img src={message.file_url} alt={message.file_name || "Imagem"} className="rounded-lg max-w-[240px] max-h-[200px] object-cover mb-2" />
            )}
            {message.message_type === "file" && message.file_url && (
              <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-background/20 rounded-lg p-2 mb-2 hover:bg-background/30 transition-colors">
                <FileText className="h-6 w-6 shrink-0" />
                <span className="text-xs truncate max-w-[160px]">{message.file_name || "Ficheiro"}</span>
                <Download className="h-4 w-4 shrink-0 ml-auto" />
              </a>
            )}
            <p className="text-sm whitespace-pre-wrap break-words text-foreground">
              {message.content}
            </p>
          </div>
          <div className="flex items-center gap-0.5 mt-1">
            <span className="text-[10px] text-muted-foreground">
              {format(new Date(message.created_at), "HH:mm", { locale: pt })}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Determine positioning based on view mode
  // Client view: client messages on right, partner on left
  // Partner view: partner messages on right, client on left
  // Admin view: partner on right (seller), client on left (buyer)
  let isRightAligned: boolean;
  
  if (viewMode === "client") {
    isRightAligned = isClientMessage;
  } else if (viewMode === "partner") {
    isRightAligned = isPartnerMessage;
  } else {
    // Admin view: show partner (seller) on right, client (buyer) on left
    isRightAligned = isPartnerMessage;
  }

  // Determine which avatar to show
  const showLeftAvatar = !isRightAligned;
  const showRightAvatar = isRightAligned;
  
  // Avatar content based on message sender
  const avatarImage = isPartnerMessage ? partnerAvatarUrl : clientAvatarUrl;
  const avatarFallback = isPartnerMessage ? (
    <Store className="w-3 h-3" />
  ) : (
    <span className="text-xs">{clientInitials}</span>
  );
  const avatarAlt = isPartnerMessage ? partnerName : "Cliente";

  // Determine if we need sender label (only in admin view)
  const showSenderLabel = viewMode === "admin";
  const senderLabel = isPartnerMessage ? "Vendedor" : "Cliente";

  // Helper to get sender label for reply quote
  const getReplyLabel = (senderType: string) => {
    if (senderType === "admin") return "Essenza";
    if (senderType === "partner") return viewMode === "partner" ? "Você" : partnerName;
    return viewMode === "client" ? "Você" : "Cliente";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-2 group", isRightAligned ? "justify-end" : "justify-start")}
    >
      {/* Left avatar */}
      {showLeftAvatar && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={avatarImage || undefined} alt={avatarAlt} />
          <AvatarFallback className="text-xs bg-muted">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="max-w-[75%] flex flex-col">
        {/* Reply Quote */}
        {message.replyTo && (
          <div
            className={cn(
              "text-[11px] rounded-t-xl px-3 py-1.5 border-l-2 mb-0",
              isRightAligned
                ? "bg-primary/20 border-primary-foreground/40 text-primary-foreground/80 self-end rounded-br-none"
                : "bg-muted/80 border-primary/40 text-muted-foreground self-start rounded-bl-none"
            )}
          >
            <span className="font-semibold text-[10px] block">
              {getReplyLabel(message.replyTo.sender_type)}
            </span>
            <p className="truncate max-w-[220px]">{message.replyTo.content}</p>
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-2",
            isRightAligned
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted text-foreground rounded-bl-sm",
            message.replyTo && "rounded-t-lg"
          )}
        >
          {/* Sender label (admin view only) */}
          {showSenderLabel && (
            <span className={cn(
              "text-[10px] font-medium block mb-1",
              isRightAligned ? "text-primary-foreground/80" : "text-muted-foreground"
            )}>
              {senderLabel}
            </span>
          )}

          {/* File/Image content */}
          {message.message_type === "image" && message.file_url && (
            <img src={message.file_url} alt={message.file_name || "Imagem"} className="rounded-lg max-w-[240px] max-h-[200px] object-cover mb-1" />
          )}
          {message.message_type === "file" && message.file_url && (
            <a href={message.file_url} target="_blank" rel="noopener noreferrer" className={cn(
              "flex items-center gap-2 rounded-lg p-2 mb-1 transition-colors",
              isRightAligned ? "bg-primary-foreground/10 hover:bg-primary-foreground/20" : "bg-background/50 hover:bg-background/80"
            )}>
              <FileText className="h-6 w-6 shrink-0" />
              <span className="text-xs truncate max-w-[160px]">{message.file_name || "Ficheiro"}</span>
              <Download className="h-4 w-4 shrink-0 ml-auto" />
            </a>
          )}

          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          <div className="flex items-center justify-end gap-0.5 mt-1">
            <span
              className={cn(
                "text-[10px]",
                isRightAligned ? "text-primary-foreground/70" : "text-muted-foreground"
              )}
            >
              {format(new Date(message.created_at), "HH:mm", { locale: pt })}
            </span>
            <ReadStatus isOwn={message.isOwn} readAt={message.read_at} />
          </div>
        </div>
      </div>

      {/* Reply button (appears on hover) */}
      {onReply && (
        <button
          onClick={() => onReply(message)}
          className="opacity-0 group-hover:opacity-100 transition-opacity self-center p-1 rounded-full hover:bg-muted"
          title="Responder"
        >
          <Reply className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      {/* Right avatar */}
      {showRightAvatar && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={avatarImage || undefined} alt={avatarAlt} />
          <AvatarFallback className={cn(
            "text-xs",
            isRightAligned ? "bg-primary/10 text-primary" : "bg-muted"
          )}>
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
};

export default ChatMessage;
