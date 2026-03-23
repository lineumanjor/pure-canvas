import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  ChefHat,
  ArrowLeft,
  ShoppingBag,
  Star
} from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { motion } from "framer-motion";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_id: string | null;
}

interface Order {
  id: string;
  status: string;
  total: number;
  delivery_address: string | null;
  delivery_phone: string | null;
  delivery_notes: string | null;
  created_at: string;
  partner_id: string;
  partner: {
    id: string;
    name: string;
    image_url: string | null;
  };
  items: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Clock },
  confirmed: { label: "Confirmado", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: CheckCircle2 },
  preparing: { label: "A Preparar", color: "bg-orange-500/10 text-orange-600 border-orange-500/20", icon: ChefHat },
  ready: { label: "Pronto", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: Package },
  delivering: { label: "Em Entrega", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", icon: Truck },
  delivered: { label: "Entregue", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle2 },
  cancelled: { label: "Cancelado", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: XCircle },
};

const OrderHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["client-orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          id,
          status,
          total,
          delivery_address,
          delivery_phone,
          delivery_notes,
          created_at,
          partner_id
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });
      
      if (ordersError) throw ordersError;
      
      // Fetch partner info and order items for each order
      const ordersWithDetails = await Promise.all(
        (ordersData || []).map(async (order) => {
          const [partnerRes, itemsRes] = await Promise.all([
            supabase
              .from("partners")
              .select("id, name, image_url")
              .eq("id", order.partner_id)
              .maybeSingle(),
            supabase
              .from("order_items")
              .select("id, product_name, quantity, unit_price, subtotal, product_id")
              .eq("order_id", order.id)
          ]);
          
          return {
            ...order,
            partner: partnerRes.data || { id: order.partner_id, name: "Parceiro", image_url: null },
            items: itemsRes.data || []
          };
        })
      );
      
      return ordersWithDetails as Order[];
    },
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16 lg:pt-20">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Os Meus Pedidos
            </h1>
            <p className="text-muted-foreground">
              Acompanhe o estado das suas encomendas
            </p>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders?.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                Nenhum pedido ainda
              </h2>
              <p className="text-muted-foreground mb-6">
                Explore as lojas dos nossos parceiros e faça o seu primeiro pedido
              </p>
              <Button onClick={() => navigate("/")}>
                Explorar Lojas
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders?.map((order, index) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:border-primary/30 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                            {order.partner.image_url ? (
                              <img 
                                src={order.partner.image_url} 
                                alt={order.partner.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold">
                              <Link 
                                to={`/loja/${order.partner.id}`}
                                className="hover:text-primary transition-colors"
                              >
                                {order.partner.name}
                              </Link>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(order.created_at), "dd MMM yyyy 'às' HH:mm", { locale: pt })}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={`gap-1.5 ${status.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Order Items */}
                      <div className="border-t pt-3 mb-3">
                        <div className="space-y-2">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {item.quantity}x {item.product_name}
                              </span>
                              <span className="font-medium">
                                {Number(item.subtotal).toLocaleString("pt-AO")} Kz
                              </span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{order.items.length - 3} item(s)
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Total and Actions */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div>
                          <span className="text-sm text-muted-foreground">Total: </span>
                          <span className="font-bold text-primary">
                            {Number(order.total).toLocaleString("pt-AO")} Kz
                          </span>
                        </div>
                        {order.status === "delivered" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1.5"
                            onClick={() => navigate(`/avaliar/${order.id}`)}
                          >
                            <Star className="w-4 h-4" />
                            Avaliar
                          </Button>
                        )}
                      </div>
                      
                      {/* Delivery Info */}
                      {order.delivery_address && (
                        <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                          <p className="flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            {order.delivery_address}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderHistory;
