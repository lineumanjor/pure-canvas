import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, TrendingUp, Star } from "lucide-react";
import { motion } from "framer-motion";

interface PartnerOverviewProps {
  partnerId: string;
}

const PartnerOverview = ({ partnerId }: PartnerOverviewProps) => {
  const { data: partner } = useQuery({
    queryKey: ["partner-details", partnerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("id", partnerId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: productsCount } = useQuery({
    queryKey: ["partner-products-count", partnerId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("partner_id", partnerId);
      
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: ordersData } = useQuery({
    queryKey: ["partner-orders-stats", partnerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("total, status")
        .eq("partner_id", partnerId);
      
      if (error) throw error;
      
      const totalRevenue = data.reduce((sum, order) => sum + Number(order.total), 0);
      const pendingOrders = data.filter(o => o.status === "pending").length;
      const totalOrders = data.length;
      
      return { totalRevenue, pendingOrders, totalOrders };
    },
  });

  const stats = [
    {
      title: "Total de Produtos",
      value: productsCount || 0,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pedidos Pendentes",
      value: ordersData?.pendingOrders || 0,
      icon: ShoppingCart,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Total de Vendas",
      value: `${(ordersData?.totalRevenue || 0).toLocaleString("pt-AO")} Kz`,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Avaliação",
      value: partner?.rating ? `${partner.rating.toFixed(1)} ★` : "N/A",
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20"
      >
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Bem-vindo, {partner?.name}! 👋
        </h2>
        <p className="text-muted-foreground">
          Aqui pode gerir a sua loja, produtos e acompanhar os seus pedidos.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-display text-lg">Resumo da Loja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">Categoria</p>
              <p className="font-medium text-foreground">{partner?.category || "-"}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">Localização</p>
              <p className="font-medium text-foreground">{partner?.location || "-"}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">Raio de Entrega</p>
              <p className="font-medium text-foreground">{partner?.delivery_radius_km || 10} km</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">Comissão</p>
              <p className="font-medium text-foreground">{partner?.commission_rate || 10}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerOverview;
