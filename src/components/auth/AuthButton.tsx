import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary";
}

const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ children, isLoading, variant = "primary", className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "relative w-full h-12 rounded-xl font-semibold text-base transition-all duration-300 touch-manipulation overflow-hidden",
          variant === "primary" && [
            "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
            "hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] hover:-translate-y-0.5",
            "active:scale-[0.98]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none disabled:hover:translate-y-0",
          ],
          variant === "secondary" && [
            "bg-secondary text-secondary-foreground border-2 border-border",
            "hover:bg-secondary/80 hover:border-primary/30",
            "active:scale-[0.98]",
          ],
          className
        )}
        {...props}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
            </motion.span>
          ) : (
            <motion.span
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-2"
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    );
  }
);

AuthButton.displayName = "AuthButton";

export default AuthButton;
