import { motion, AnimatePresence } from "framer-motion";

interface ProcessingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const ProcessingOverlay = ({ isVisible, message = "A processar o seu pedido..." }: ProcessingOverlayProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md"
        >
          {/* Pulsing rings */}
          <div className="relative flex items-center justify-center">
            <motion.div
              className="absolute w-32 h-32 rounded-full border-2 border-primary/20"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-24 h-24 rounded-full border-2 border-primary/30"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />
            <motion.div
              className="absolute w-16 h-16 rounded-full border-2 border-primary/40"
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            />

            {/* Logo */}
            <motion.div
              className="relative z-10 w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-border bg-card"
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 0 0 hsl(var(--primary) / 0)",
                  "0 0 30px 10px hsl(var(--primary) / 0.15)",
                  "0 0 0 0 hsl(var(--primary) / 0)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src="/favicon.jpg"
                alt="Essenza"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* Text */}
          <motion.p
            className="mt-8 text-foreground font-medium text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {message}
          </motion.p>

          {/* Animated dots */}
          <div className="flex gap-1.5 mt-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProcessingOverlay;
