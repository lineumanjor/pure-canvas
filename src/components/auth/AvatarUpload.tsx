import { useState, useRef } from "react";
import { Camera, Loader2, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const AvatarUpload = ({
  value,
  onChange,
  className,
  size = "md",
}: AvatarUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Selecione uma imagem válida");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Tamanho máximo: 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename with temp prefix (will be moved after user creation)
      const fileExt = file.name.split(".").pop();
      const fileName = `temp-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from("partner-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("partner-images")
        .getPublicUrl(data.path);

      onChange(urlData.publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError("Erro ao carregar imagem");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
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
        disabled={isUploading}
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
        onClick={() => !isUploading && inputRef.current?.click()}
      >
        <AnimatePresence mode="wait">
          {value ? (
            <motion.div
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
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
            </motion.div>
          ) : isUploading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center"
            >
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center gap-1"
            >
              <div className="rounded-full bg-primary/10 p-2">
                <Camera className="w-5 h-5 text-primary" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
