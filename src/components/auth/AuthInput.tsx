import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, icon: Icon, error, type, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="space-y-1.5">
        <motion.label 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="text-sm font-medium text-foreground/80"
        >
          {label}
        </motion.label>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileTap={{ scale: 0.995 }}
          className={cn(
            "relative flex items-center rounded-xl border-2 bg-background/50 backdrop-blur-sm transition-all duration-300",
            isFocused
              ? "border-primary shadow-lg shadow-primary/20"
              : "border-border hover:border-primary/50",
            error && "border-destructive"
          )}
        >
          {Icon && (
            <motion.div
              animate={{ 
                color: isFocused ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                scale: isFocused ? 1.1 : 1
              }}
              transition={{ duration: 0.2 }}
              className="absolute left-4 pointer-events-none"
            >
              <Icon className="h-5 w-5" />
            </motion.div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              "flex h-12 w-full rounded-xl bg-transparent px-4 py-3 text-base outline-none placeholder:text-muted-foreground/60",
              Icon && "pl-12",
              isPassword && "pr-12",
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            {...props}
          />
          {isPassword && (
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
              tabIndex={-1}
            >
              <AnimatePresence mode="wait">
                {showPassword ? (
                  <motion.div
                    key="hide"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <EyeOff className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="show"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Eye className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </motion.div>
        <AnimatePresence>
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-destructive"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
