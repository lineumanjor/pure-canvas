import { useState, useRef, forwardRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onFileSelect?: (file: File) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const AvatarUpload = ({
  value,
  onChange,
  onFileSelect,
  className,
  size = "md",
}: AvatarUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Selecione uma imagem válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Tamanho máximo: 5MB");
      return;
    }

    setIsProcessing(true);

    try {
      // Use local blob URL for preview (works without auth)
      const blobUrl = URL.createObjectURL(file);
      onChange(blobUrl);
      onFileSelect?.(file);
    } catch (err: any) {
      console.error("File select error:", err);
      setError("Erro ao processar imagem");
    } finally {
      setIsProcessing(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    if (value?.startsWith("blob:")) {
      URL.revokeObjectURL(value);
    }
    onChange("");
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isProcessing}
      />

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative rounded-full overflow-hidden border-2 border-dashed border-muted-foreground/25",
          "hover:border-primary/50 transition-colors cursor-pointer",
          "bg-muted/50",
          sizeClasses[size]
        )}
        onClick={() => !isProcessing && inputRef.current?.click()}
      >
        {value ? (
          <div className="w-full h-full">
            <img
              src={value}
              alt="Avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute top-0 right-0 p-1 bg-destructive rounded-full text-destructive-foreground transform translate-x-1/4 -translate-y-1/4"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : isProcessing ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
            <div className="rounded-full bg-primary/10 p-2">
              <Camera className="w-5 h-5 text-primary" />
            </div>
          </div>
        )}
      </motion.div>

      <p className="text-xs text-muted-foreground text-center">
        {value ? "Clique para alterar" : "Adicionar foto (opcional)"}
      </p>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AvatarUpload;
