import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useCategories, isServiceCategory } from "@/hooks/useCategories";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Store, Package, ShoppingCart, Settings, Briefcase, MessageCircle, Video } from "lucide-react";
import { motion } from "framer-motion";
import PartnerOverview from "@/components/partner/PartnerOverview";
import PartnerProducts from "@/components/partner/PartnerProducts";
import PartnerOrders from "@/components/partner/PartnerOrders";
import PartnerProfile from "@/components/partner/PartnerProfile";
import PartnerServiceRequests from "@/components/partner/PartnerServiceRequests";
import PartnerChats from "@/components/partner/PartnerChats";
import PartnerAdminMessages from "@/components/partner/PartnerAdminMessages";

const PartnerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerStatus, setPartnerStatus] = useState<string | null>(null);
  const [partnerCategory, setPartnerCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Determine if this partner is a service provider
  const isServiceProvider = useMemo(() => {
    if (!partnerCategory || !categories.length) return false;
    return isServiceCategory(partnerCategory, categories);
  }, [partnerCategory, categories]);

  useEffect(() => {
    const checkPartnerAccess = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("partners")
          .select("id, status, category")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          navigate("/seja-parceiro");
          return;
        }

        setPartnerId(data.id);
        setPartnerStatus(data.status);
        setPartnerCategory(data.category);
      } catch (err) {
        console.error("Error checking partner access:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkPartnerAccess();
  }, [user, authLoading, navigate]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">A carregar...</div>
      </div>
    );
  }

  if (partnerStatus !== "approved") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Aguardando Aprovação
          </h1>
          <p className="text-muted-foreground mb-6">
            A sua candidatura está {partnerStatus === "pending" ? "em análise" : "a ser revista"}. 
            Entraremos em contacto em breve.
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container-custom py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                Painel do Parceiro
              </h1>
              <p className="text-sm text-muted-foreground">
                {isServiceProvider ? "Gerencie os seus serviços" : "Gerencie a sua loja"}
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate(`/loja/${partnerId}`)}
            variant="outline"
            className="gap-2"
          >
            {isServiceProvider ? (
              <Briefcase className="w-4 h-4" />
            ) : (
              <Store className="w-4 h-4" />
            )}
            {isServiceProvider ? "Ver Empresa" : "Ver Loja"}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className={`grid w-full max-w-2xl bg-muted/50 ${isServiceProvider ? 'grid-cols-5' : 'grid-cols-6'}`}>
            <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-background">
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="items" className="gap-2 data-[state=active]:bg-background">
              {isServiceProvider ? (
                <Briefcase className="w-4 h-4" />
              ) : (
                <Package className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isServiceProvider ? "Serviços" : "Produtos"}
              </span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2 data-[state=active]:bg-background">
              {isServiceProvider ? (
                <Briefcase className="w-4 h-4" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isServiceProvider ? "Solicitações" : "Pedidos"}
              </span>
            </TabsTrigger>
            {/* Chat tab - only for product stores */}
            {!isServiceProvider && (
              <TabsTrigger value="chats" className="gap-2 data-[state=active]:bg-background">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Conversas</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="admin-messages" className="gap-2 data-[state=active]:bg-background">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Essenza</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-background">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <PartnerOverview partnerId={partnerId!} />
          </TabsContent>

          <TabsContent value="items">
            <PartnerProducts partnerId={partnerId!} isServiceProvider={isServiceProvider} />
          </TabsContent>

          <TabsContent value="requests">
            {isServiceProvider ? (
              <PartnerServiceRequests partnerId={partnerId!} />
            ) : (
              <PartnerOrders partnerId={partnerId!} />
            )}
          </TabsContent>

          {/* Chat content - only for product stores */}
          {!isServiceProvider && (
            <TabsContent value="chats">
              <PartnerChats partnerId={partnerId!} />
            </TabsContent>
          )}

          <TabsContent value="admin-messages">
            <PartnerAdminMessages partnerId={partnerId!} />
          </TabsContent>

          <TabsContent value="profile">
            <PartnerProfile partnerId={partnerId!} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PartnerDashboard;
