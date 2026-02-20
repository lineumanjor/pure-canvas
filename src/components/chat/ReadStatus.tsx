import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadStatusProps {
  isOwn: boolean;
  readAt: string | null;
  className?: string;
}

/**
 * WhatsApp-style animated read status:
 * - Single grey tick: Sent
 * - Double blue ticks: Read
 */
const ReadStatus = ({ isOwn, readAt, className }: ReadStatusProps) => {
  if (!isOwn) return null;

  const isRead = !!readAt;

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn("inline-flex items-center ml-1", className)}
    >
      {isRead ? (
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
        </motion.span>
      ) : (
        <Check className="h-3 w-3 text-muted-foreground/70" />
      )}
    </motion.span>
  );
};

export default ReadStatus;
