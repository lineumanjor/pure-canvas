import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useCategories, isServiceCategory } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Phone, 
  ShoppingCart, 
  Package,
  Search,
  Instagram,
  MessageCircle,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CartDrawer from "@/components/store/CartDrawer";
import ReviewsSection from "@/components/store/ReviewsSection";
import ProductCard from "@/components/store/ProductCard";
import ServiceCard from "@/components/store/ServiceCard";
import ServiceRequestModal from "@/components/store/ServiceRequestModal";
import ChatButton from "@/components/chat/ChatButton";

const PartnerStore = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const { addItem, getPartnerItems, getItemCount, updateQuantity } = useCart();
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<{
    name: string;
    description: string | null;
  } | null>(null);

  const { data: partner, isLoading: partnerLoading } = useQuery({
    queryKey: ["store-partner", partnerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("id", partnerId)
        .eq("status", "approved")
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!partnerId,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["store-products", partnerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("partner_id", partnerId)
        .eq("available", true)
        .order("name");
      
      if (error) throw error;
      return data;
    },
    enabled: !!partnerId,
  });

  // Determine if this partner is a service provider based on their category
  const isServiceProvider = useMemo(() => {
    if (!partner || !categories.length) return false;
    return isServiceCategory(partner.category, categories);
  }, [partner, categories]);

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const productCategories = [...new Set(products?.map((p) => p.category).filter(Boolean))];
  const partnerCartItems = partner ? getPartnerItems(partner.id) : [];
  const totalItemCount = getItemCount();

  const handleAddToCart = (product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
  }) => {
    if (!partner) return;
    
    addItem({
      productId: product.id,
      productName: product.name,
      price: Number(product.price),
      imageUrl: product.image_url || undefined,
      partnerId: partner.id,
      partnerName: partner.name,
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    const cartItem = partnerCartItems.find(i => i.productId === productId);
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity - 1);
    }
  };

  const handleRequestQuote = (service: { id: string; name: string; description: string | null }) => {
    setSelectedService({ name: service.name, description: service.description });
    setServiceModalOpen(true);
  };

  if (partnerLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">A carregar...</div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Loja não encontrada
          </h1>
          <p className="text-muted-foreground mb-6">
            Esta loja não existe ou não está disponível.
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
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-foreground truncate max-w-[200px]">
              {partner.name}
            </h1>
            {isServiceProvider && (
              <Badge variant="secondary" className="gap-1">
                <Briefcase className="w-3 h-3" />
                Serviços
              </Badge>
            )}
          </div>
          
          {/* Only show cart for product providers */}
          {!isServiceProvider ? (
            <Button 
              variant="outline"
              size="icon"
              className="relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {totalItemCount}
                </span>
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => {
                setSelectedService(null);
                setServiceModalOpen(true);
              }}
            >
              <Briefcase className="w-4 h-4" />
              Solicitar
            </Button>
          )}
        </div>
      </header>

      {/* Store Header */}
      <section className="relative">
        <div className="h-48 sm:h-64 bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
          {partner.image_url && (
            <img
              src={partner.image_url}
              alt={partner.name}
              className="w-full h-full object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        
        <div className="container-custom -mt-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-lg p-6 border border-border"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Store Image */}
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0">
                {partner.image_url ? (
                  <img
                    src={partner.image_url}
                    alt={partner.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {isServiceProvider ? (
                      <Briefcase className="w-8 h-8 text-muted-foreground" />
                    ) : (
                      <Package className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>

              {/* Store Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    {partner.name}
                  </h1>
                  <Badge variant="secondary">{partner.category}</Badge>
                  {isServiceProvider && (
                    <Badge variant="outline" className="gap-1 border-primary/50 text-primary">
                      <Briefcase className="w-3 h-3" />
                      Prestador de Serviços
                    </Badge>
                  )}
                </div>
                
                {partner.description && (
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {partner.description}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {partner.location}
                  </div>
                  {partner.rating && partner.rating > 0 && (
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      {partner.rating.toFixed(1)}
                      {partner.reviews_count && (
                        <span className="text-muted-foreground">
                          ({partner.reviews_count})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Contact Links */}
                <div className="flex gap-2 mt-4">
                  {partner.whatsapp && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-1"
                    >
                      <a
                        href={`https://wa.me/${partner.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </a>
                    </Button>
                  )}
                  {partner.instagram && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-1"
                    >
                      <a
                        href={`https://instagram.com/${partner.instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="w-4 h-4" />
                        Instagram
                      </a>
                    </Button>
                  )}
                  {partner.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-1"
                    >
                      <a href={`tel:${partner.phone}`}>
                        <Phone className="w-4 h-4" />
                        Ligar
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products/Services & Reviews */}
      <main className="container-custom py-8">
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="items">
              {isServiceProvider ? "Serviços" : "Produtos"}
            </TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="items">
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={isServiceProvider ? "Pesquisar serviços..." : "Pesquisar produtos..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categories Quick Filter */}
            {productCategories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                <Button
                  variant={searchQuery === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSearchQuery("")}
                >
                  Todos
                </Button>
                {productCategories.map((category) => (
                  <Button
                    key={category}
                    variant={searchQuery === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSearchQuery(category || "")}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}

            {/* Items Grid */}
            {productsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !filteredProducts?.length ? (
              <div className="text-center py-12">
                {isServiceProvider ? (
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                ) : (
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                )}
                <h3 className="font-medium text-foreground mb-2">
                  {searchQuery 
                    ? `Nenhum ${isServiceProvider ? 'serviço' : 'produto'} encontrado` 
                    : `Nenhum ${isServiceProvider ? 'serviço' : 'produto'} disponível`}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Tente pesquisar por outro termo"
                    : `Esta ${isServiceProvider ? 'empresa' : 'loja'} ainda não adicionou ${isServiceProvider ? 'serviços' : 'produtos'}`}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence>
                  {filteredProducts.map((item, index) => {
                    const cartItem = partnerCartItems.find((i) => i.productId === item.id);
                    
                    if (isServiceProvider) {
                      return (
                        <ServiceCard
                          key={item.id}
                          service={item}
                          index={index}
                          onRequestQuote={handleRequestQuote}
                        />
                      );
                    }
                    
                    return (
                      <ProductCard
                        key={item.id}
                        product={item}
                        index={index}
                        cartQuantity={cartItem?.quantity || 0}
                        onAdd={() => handleAddToCart(item)}
                        onRemove={() => handleRemoveFromCart(item.id)}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reviews">
            <ReviewsSection partnerId={partner.id} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Cart Drawer - only for products */}
      {!isServiceProvider && (
        <>
          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          
          {/* Chat Button - only shows for product stores */}
          <ChatButton
            partnerId={partner.id}
            partnerName={partner.name}
            partnerImage={partner.image_url}
            hasItemsInCart={partnerCartItems.length > 0}
            className="fixed bottom-6 right-6 z-40"
          />
        </>
      )}

      {/* Service Request Modal - only for services */}
      {isServiceProvider && (
        <ServiceRequestModal
          isOpen={serviceModalOpen}
          onClose={() => setServiceModalOpen(false)}
          partnerId={partner.id}
          partnerName={partner.name}
          serviceName={selectedService?.name || ""}
          serviceDescription={selectedService?.description || ""}
        />
      )}
    </div>
  );
};

export default PartnerStore;
