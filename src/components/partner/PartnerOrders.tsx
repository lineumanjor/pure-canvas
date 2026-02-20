import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Clock, Phone, MapPin, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface PartnerOrdersProps {
  partnerId: string;
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  preparing: "A preparar",
  ready: "Pronto",
  delivering: "Em entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  preparing: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  ready: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  delivering: "bg-primary/10 text-primary border-primary/30",
  delivered: "bg-green-500/10 text-green-600 border-green-500/30",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/30",
};

const PartnerOrders = ({ partnerId }: PartnerOrdersProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["partner-orders", partnerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            product_name,
            quantity,
            unit_price,
            subtotal
          )
        `)
        .eq("partner_id", partnerId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-orders", partnerId] });
      toast({ title: "Estado atualizado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar estado", variant: "destructive" });
    },
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-AO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/3 mb-4" />
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-foreground mb-2">Nenhum pedido ainda</h3>
          <p className="text-sm text-muted-foreground">
            Os pedidos dos clientes aparecerão aqui
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">
          Os Meus Pedidos
        </h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe e gerencie os pedidos da sua loja
        </p>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:border-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base font-medium">
                        Pedido #{order.id.slice(0, 8)}
                      </CardTitle>
                      <Badge className={`${statusColors[order.status]} border`}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    {order.order_items?.map((item: { id: string; product_name: string; quantity: number; unit_price: number; subtotal: number }) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">
                            {item.quantity}x {item.product_name}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          {Number(item.subtotal).toLocaleString("pt-AO")} Kz
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2 mt-2 flex justify-between font-medium">
                      <span>Total</span>
                      <span className="text-primary">
                        {Number(order.total).toLocaleString("pt-AO")} Kz
                      </span>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  {(order.delivery_address || order.delivery_phone) && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {order.delivery_phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {order.delivery_phone}
                        </div>
                      )}
                      {order.delivery_address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {order.delivery_address}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status Update */}
                  <div className="flex items-center justify-between gap-4 pt-2 border-t border-border">
                    <span className="text-sm font-medium text-foreground">
                      Atualizar estado:
                    </span>
                    <Select
                      value={order.status}
                      onValueChange={(value) => 
                        updateStatusMutation.mutate({ orderId: order.id, status: value })
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="confirmed">Confirmado</SelectItem>
                        <SelectItem value="preparing">A preparar</SelectItem>
                        <SelectItem value="ready">Pronto</SelectItem>
                        <SelectItem value="delivering">Em entrega</SelectItem>
                        <SelectItem value="delivered">Entregue</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PartnerOrders;
