import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ChatDrawer from "./ChatDrawer";

interface ChatButtonProps {
  partnerId: string;
  partnerName: string;
  partnerImage?: string | null;
  hasItemsInCart: boolean;
  className?: string;
}

const ChatButton = ({
  partnerId,
  partnerName,
  partnerImage,
  hasItemsInCart,
  className,
}: ChatButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleClick = () => {
    if (!user) {
      toast.info("Faça login para conversar com o vendedor", {
        action: {
          label: "Entrar",
          onClick: () => navigate("/auth"),
        },
      });
      return;
    }

    if (!hasItemsInCart) {
      toast.info("Adicione um produto ao carrinho para iniciar o chat");
      return;
    }

    setIsChatOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: hasItemsInCart ? 1 : 0.9, 
          opacity: hasItemsInCart ? 1 : 0.5 
        }}
        className={className}
      >
        <Button
          onClick={handleClick}
          size="icon"
          className="relative h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          disabled={!hasItemsInCart}
        >
          <MessageCircle className="w-6 h-6" />
          {hasItemsInCart && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-background"
            />
          )}
        </Button>
      </motion.div>

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        partnerId={partnerId}
        partnerName={partnerName}
        partnerImage={partnerImage}
      />
    </>
  );
};

export default ChatButton;
