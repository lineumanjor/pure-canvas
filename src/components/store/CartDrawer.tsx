import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Plus, Minus, Trash2, Package, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCart();
  const [stockInfo, setStockInfo] = useState<Record<string, number | null>>({});
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCheckout, setIsCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    phone: "",
    address: "",
    notes: "",
  });

  // Pre-fill delivery info from profile
  useEffect(() => {
    if (isCheckout && profile) {
      setDeliveryInfo(prev => ({
        phone: prev.phone || profile.phone || "",
        address: prev.address || (profile as any).delivery_address || "",
        notes: prev.notes,
      }));
    }
  }, [isCheckout, profile]);

  // Group items by partner
  const itemsByPartner = items.reduce((acc, item) => {
    if (!acc[item.partnerId]) {
      acc[item.partnerId] = {
        partnerName: item.partnerName,
        items: [],
      };
    }
    acc[item.partnerId].items.push(item);
    return acc;
  }, {} as Record<string, { partnerName: string; items: typeof items }>);

  // Validate stock availability before checkout
  const validateStock = async (): Promise<{ valid: boolean; issues: string[] }> => {
    const issues: string[] = [];
    const productIds = items.map(i => i.productId);
    
    const { data: products } = await supabase
      .from("products")
      .select("id, name, stock")
      .in("id", productIds);
    
    if (!products) return { valid: true, issues: [] };
    
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (product && product.stock !== null) {
        if (product.stock === 0) {
          issues.push(`"${item.productName}" está esgotado.`);
          removeItem(item.id);
        } else if (item.quantity > product.stock) {
          issues.push(`"${item.productName}" tem apenas ${product.stock} unidade(s). Ajustámos a quantidade.`);
          updateQuantity(item.id, product.stock);
        }
      }
    }
    
    return { valid: issues.length === 0, issues };
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Inicie sessão para continuar",
        description: "Precisa de ter uma conta para fazer pedidos.",
      });
      navigate("/auth");
      onClose();
      return;
    }

    if (!deliveryInfo.phone || !deliveryInfo.address) {
      toast({
        title: "Preencha os dados de entrega",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate stock before proceeding
      const { valid, issues } = await validateStock();
      if (!valid) {
        toast({
          title: "Stock actualizado",
          description: issues.join(" "),
          variant: "destructive",
        });
        setIsSubmitting(false);
        setIsCheckout(false);
        return;
      }

      // Create orders for each partner
      for (const [partnerId, partnerData] of Object.entries(itemsByPartner)) {
        const partnerTotal = partnerData.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        // Create order
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            client_id: user.id,
            partner_id: partnerId,
            total: partnerTotal,
            delivery_phone: deliveryInfo.phone,
            delivery_address: deliveryInfo.address,
            delivery_notes: deliveryInfo.notes || null,
            status: "pending",
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create order items (triggers will validate & decrement stock)
        const orderItems = partnerData.items.map((item) => ({
          order_id: order.id,
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) {
          // Check if it's a stock error from the trigger
          const errMsg = (itemsError as any).message || "";
          if (errMsg.includes("Stock insuficiente")) {
            toast({
              title: "Stock insuficiente",
              description: "Alguns produtos ficaram sem stock. O carrinho foi actualizado.",
              variant: "destructive",
            });
            await validateStock();
            setIsCheckout(false);
            setIsSubmitting(false);
            return;
          }
          throw itemsError;
        }
      }

      toast({ title: "Pedido(s) realizado(s) com sucesso! 🎉" });
      clearCart();
      setIsCheckout(false);
      setDeliveryInfo({ phone: "", address: "", notes: "" });
      onClose();
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Erro ao processar pedido",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {isCheckout ? "Finalizar Pedido" : "Carrinho"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Package className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="font-medium text-foreground mb-2">
                Carrinho vazio
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Adicione produtos para continuar
              </p>
              <Button variant="outline" onClick={onClose}>
                Continuar a comprar
              </Button>
            </div>
          ) : isCheckout ? (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Resumo do Pedido</h3>
                {Object.entries(itemsByPartner).map(([partnerId, data]) => (
                  <div key={partnerId} className="bg-muted/30 rounded-lg p-3">
                    <p className="font-medium text-sm text-foreground mb-2">
                      {data.partnerName}
                    </p>
                    {data.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                        <span>{item.quantity}x {item.productName}</span>
                        <span>{(item.price * item.quantity).toLocaleString("pt-AO")} Kz</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <Separator />

              {/* Delivery Info */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Dados de Entrega</h3>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={deliveryInfo.phone}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                    placeholder="+244 9XX XXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço de Entrega *</Label>
                  <Textarea
                    id="address"
                    value={deliveryInfo.address}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                    placeholder="Rua, bairro, ponto de referência..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={deliveryInfo.notes}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, notes: e.target.value })}
                    placeholder="Instruções especiais..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {Object.entries(itemsByPartner).map(([partnerId, data]) => (
                  <motion.div
                    key={partnerId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="space-y-3"
                  >
                    <h3 className="font-medium text-foreground text-sm">
                      {data.partnerName}
                    </h3>
                    {data.items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="flex gap-3 p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground text-sm line-clamp-1">
                            {item.productName}
                          </h4>
                          <p className="text-primary font-medium text-sm">
                            {item.price.toLocaleString("pt-AO")} Kz
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const newQty = item.quantity - 1;
                                updateQuantity(item.id, newQty);
                              }}
                              type="button"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const newQty = item.quantity + 1;
                                updateQuantity(item.id, newQty);
                              }}
                              type="button"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10 ml-auto"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <Separator />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border pt-4 space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">
                {getTotal().toLocaleString("pt-AO")} Kz
              </span>
            </div>
            
            {isCheckout ? (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsCheckout(false)}
                  disabled={isSubmitting}
                >
                  Voltar
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "A processar..." : "Confirmar Pedido"}
                </Button>
              </div>
            ) : (
              <Button
                className="w-full gap-2"
                onClick={() => setIsCheckout(true)}
              >
                Continuar
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
