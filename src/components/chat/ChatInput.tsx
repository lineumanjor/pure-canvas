import { useState, useRef } from "react";
import { Send, Paperclip, Image as ImageIcon, X, Loader2, FileText, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { MessageWithSender } from "@/hooks/useChat";

export interface ReplyingTo {
  id: string;
  content: string;
  senderLabel: string;
}

interface ChatInputProps {
  onSend: (content: string, file?: { url: string; name: string; type: string }) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  useTextarea?: boolean;
  onTyping?: (isTyping: boolean) => void;
  replyingTo?: ReplyingTo | null;
  onCancelReply?: () => void;
}

const ChatInput = ({ onSend, disabled, placeholder = "Escreva sua mensagem...", className, useTextarea, onTyping, replyingTo, onCancelReply }: ChatInputProps) => {
  const { toast } = useToast();
  const [messageText, setMessageText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [filePreview, setFilePreview] = useState<{ url: string; name: string; type: string; isImage: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Ficheiro muito grande", description: "O tamanho máximo é de 10MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `chat/${fileName}`;

      const { data, error } = await supabase.storage
        .from("chat-files")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from("chat-files").getPublicUrl(data.path);
      const isImage = file.type.startsWith("image/");

      setFilePreview({
        url: urlData.publicUrl,
        name: file.name,
        type: isImage ? "image" : "file",
        isImage,
      });
    } catch (error: any) {
      toast({ title: "Erro ao carregar ficheiro", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSend = () => {
    const hasText = messageText.trim();
    const hasFile = filePreview;
    if (!hasText && !hasFile) return;

    onTyping?.(false);

    if (hasFile) {
      onSend(hasText || filePreview.name, { url: filePreview.url, name: filePreview.name, type: filePreview.type });
    } else {
      onSend(messageText.trim());
    }
    setMessageText("");
    setFilePreview(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeFilePreview = () => setFilePreview(null);

  const InputComponent = useTextarea ? "textarea" : "input";

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Reply Preview */}
      {replyingTo && (
        <div className="flex items-center gap-2 mx-1 rounded-lg border border-border bg-muted/50 px-3 py-2">
          <Reply className="h-4 w-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0 border-l-2 border-primary pl-2">
            <span className="text-[11px] font-semibold text-primary block">{replyingTo.senderLabel}</span>
            <p className="text-xs text-muted-foreground truncate">{replyingTo.content}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={onCancelReply}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* File Preview */}
      {filePreview && (
        <div className="relative rounded-lg border border-border bg-muted/50 p-2 mx-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground shadow-sm"
            onClick={removeFilePreview}
          >
            <X className="h-3 w-3" />
          </Button>
          {filePreview.isImage ? (
            <img src={filePreview.url} alt={filePreview.name} className="h-20 w-20 rounded-lg object-cover" />
          ) : (
            <div className="flex items-center gap-2 py-1">
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-xs text-foreground truncate max-w-[200px]">{filePreview.name}</span>
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex items-end gap-2"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>

        <Input
          value={messageText}
          onChange={(e) => {
            setMessageText(e.target.value);
            onTyping?.(e.target.value.length > 0);
          }}
          onKeyDown={handleKeyPress}
          onBlur={() => onTyping?.(false)}
          placeholder={placeholder}
          className="flex-1"
          disabled={disabled || isUploading}
        />

        <Button
          type="submit"
          size="icon"
          disabled={(!messageText.trim() && !filePreview) || disabled || isUploading}
          className="shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
