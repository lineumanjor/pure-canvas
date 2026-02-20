import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: "sm" | "md";
  className?: string;
  showLabel?: boolean;
}

/**
 * Animated online/offline status indicator dot.
 * Green pulsing dot when online, grey when offline.
 */
const OnlineIndicator = ({
  isOnline,
  size = "sm",
  className,
  showLabel = false,
}: OnlineIndicatorProps) => {
  const dotSize = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3";
  const ringSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className={cn("relative flex items-center justify-center", ringSize)}>
        {isOnline && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "absolute rounded-full bg-emerald-500/40",
              dotSize
            )}
          />
        )}
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={cn(
            "rounded-full border-2 border-background relative z-10",
            dotSize,
            isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
          )}
        />
      </div>
      {showLabel && (
        <span className={cn(
          "text-[10px] font-medium",
          isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
        )}>
          {isOnline ? "Online" : "Offline"}
        </span>
      )}
    </div>
  );
};

export default OnlineIndicator;
