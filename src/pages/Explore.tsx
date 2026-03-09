import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, Star, Package, Sparkles, Store, Grid3x3 } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePartners } from "@/hooks/usePartners";
import { useCategories } from "@/hooks/useCategories";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  partner_id: string;
  partner: {
    name: string;
    image_url: string | null;
    category: string;
  };
}

const Explore = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "partners";
  
  const { partners, loading: partnersLoading } = usePartners();
  const { categories, loading: categoriesLoading } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Fetch all products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["all-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          partner:partners!inner(name, image_url, status)
        `)
        .eq("partner.status", "approved")
        .eq("available", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });

  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const matchesSearch =
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        partner.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [partners, searchQuery, selectedCategory]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.partner.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        product.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const loading = partnersLoading || categoriesLoading || productsLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            className="absolute top-10 right-1/4 w-72 h-72 bg-primary rounded-full blur-[100px]"
          />
          
          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Sparkles className="w-3 h-3 mr-1" />
                Explorar ESSENZA
              </Badge>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Descubra Tudo em{" "}
                <span className="text-gradient-brand">Um Lugar</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Explore todas as lojas e produtos disponíveis na nossa plataforma.
              </p>
            </motion.div>

            {/* Search and Filter Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-10 max-w-4xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row gap-3 p-4 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-background border-border/50"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[200px] h-12 bg-background border-border/50">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name.toLowerCase()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-12 sm:py-16">
          <div className="container-custom">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="partners" className="gap-2">
                  <Store className="w-4 h-4" />
                  Lojas
                </TabsTrigger>
                <TabsTrigger value="products" className="gap-2">
                  <Grid3x3 className="w-4 h-4" />
                  Produtos
                </TabsTrigger>
              </TabsList>

              {/* Partners Tab */}
              <TabsContent value="partners" className="mt-0">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Card key={i} className="overflow-hidden">
                        <Skeleton className="h-48 w-full" />
                        <CardContent className="p-4 space-y-3">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredPartners.length > 0 ? (
                  <>
                    <p className="text-muted-foreground mb-6">
                      <span className="font-semibold text-foreground">{filteredPartners.length}</span>{" "}
                      {filteredPartners.length === 1 ? "loja encontrada" : "lojas encontradas"}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredPartners.map((partner, index) => (
                        <motion.div
                          key={partner.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                          <Link to={`/loja/${partner.id}`}>
                            <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm">
                              <div className="relative h-48 overflow-hidden">
                                {partner.image_url ? (
                                  <img
                                    src={partner.image_url}
                                    alt={partner.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                    <span className="text-4xl font-display font-bold text-primary/40">
                                      {partner.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                                <Badge className="absolute top-3 left-3 bg-background/90 text-foreground border-0">
                                  {partner.category}
                                </Badge>
                              </div>
                              <CardContent className="p-4">
                                <h3 className="font-display font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                                  {partner.name}
                                </h3>
                                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>{partner.location}</span>
                                </div>
                                {partner.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                    {partner.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-1 pt-2 border-t border-border/50">
                                  <Star className="w-4 h-4 text-primary fill-primary" />
                                  <span className="font-medium text-foreground">
                                    {partner.rating?.toFixed(1) || "Novo"}
                                  </span>
                                  {partner.reviews_count > 0 && (
                                    <span className="text-muted-foreground text-sm">
                                      ({partner.reviews_count})
                                    </span>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Store className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                      Nenhuma loja encontrada
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Tente ajustar os seus filtros de pesquisa.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="mt-0">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Card key={i} className="overflow-hidden">
                        <Skeleton className="aspect-square w-full" />
                        <CardContent className="p-4 space-y-3">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <>
                    <p className="text-muted-foreground mb-6">
                      <span className="font-semibold text-foreground">{filteredProducts.length}</span>{" "}
                      {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredProducts.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                          <Link to={`/loja/${product.partner_id}`}>
                            <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                              <div className="aspect-square bg-muted relative overflow-hidden">
                                {product.image_url ? (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-12 h-12 text-muted-foreground" />
                                  </div>
                                )}
                                {product.category && (
                                  <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm">
                                    {product.category}
                                  </Badge>
                                )}
                              </div>
                              <CardContent className="p-4">
                                <h3 className="font-medium text-foreground mb-1 line-clamp-1">
                                  {product.name}
                                </h3>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                                  <Store className="w-3.5 h-3.5" />
                                  <span className="line-clamp-1">{product.partner.name}</span>
                                </div>
                                {product.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                    {product.description}
                                  </p>
                                )}
                                <div className="pt-2 border-t border-border/50">
                                  <span className="text-lg font-bold text-primary">
                                    {Number(product.price).toLocaleString("pt-AO")} Kz
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                      Nenhum produto encontrado
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Tente ajustar os seus filtros de pesquisa.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Explore;
