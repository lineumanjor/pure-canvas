import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const PWAUpdatePrompt = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleSWUpdate = async () => {
      const reg = await navigator.serviceWorker.ready;
      
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setRegistration(reg);
            setShowUpdate(true);
          }
        });
      });
    };

    handleSWUpdate();

    // Also check on online reconnect
    const handleOnline = () => {
      navigator.serviceWorker.ready.then(reg => reg.update());
    };
    window.addEventListener("online", handleOnline);

    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[200] bg-primary text-primary-foreground py-3 px-4 text-center"
      >
        <div className="flex items-center justify-center gap-3 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Nova versão disponível!</span>
          <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={handleUpdate}>
            Atualizar
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAUpdatePrompt;
