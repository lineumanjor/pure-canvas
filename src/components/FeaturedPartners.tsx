import { Star, MapPin, ArrowRight, Package, Sparkles, X, Filter, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePartners } from "@/hooks/usePartners";
import { useCategories, isServiceCategory } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRef, useMemo } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 15,
    },
  },
};

const shimmerVariants = {
  initial: { x: "-100%" },
  animate: { x: "100%" },
};

interface FeaturedPartnersProps {
  selectedCategory?: string | null;
  onClearFilter?: () => void;
}

const FeaturedPartners = ({ selectedCategory, onClearFilter }: FeaturedPartnersProps) => {
  const { partners, loading } = usePartners();
  const { categories } = useCategories();
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Filter partners to show only TOP partners and match selected category
  // Fallback: if there are no TOP partners yet (legacy data), show approved partners so the homepage doesn't look empty.
  const filteredPartners = useMemo(() => {
    const topPartners = partners.filter((partner) => partner.is_top);
    const base = topPartners.length > 0 ? topPartners : partners;

    let filtered = base;
    if (selectedCategory) {
      filtered = filtered.filter(
        (partner) => partner.category.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }
    return filtered;
  }, [partners, selectedCategory]);

  const handlePartnerClick = (partnerId: string) => {
    navigate(`/loja/${partnerId}`);
  };

  return (
    <section id="parceiros" className="section-padding" ref={sectionRef}>
      <div className="container-custom">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 mb-4"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Lojas Verificadas</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4"
            >
              Parceiros em <span className="text-gradient-brand">Destaque</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted-foreground max-w-2xl"
            >
              Conheça os nossos parceiros e descubra produtos e serviços de qualidade.
            </motion.p>
          </div>
          <div className="flex items-center gap-2">
            {/* Category filter badge */}
            <AnimatePresence>
              {selectedCategory && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30"
                >
                  <Filter className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-medium text-primary">{selectedCategory}</span>
                  <button
                    onClick={onClearFilter}
                    className="ml-1 p-0.5 rounded-full hover:bg-primary/20 transition-colors"
                    aria-label="Limpar filtro"
                  >
                    <X className="w-3.5 h-3.5 text-primary" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            
            {filteredPartners.length > 0 && !selectedCategory && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                 <Button
                   variant="outline"
                   className="gap-2 shrink-0 group"
                   onClick={() => navigate('/parceiros')}
                 >
                   Ver todos
                   <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                 </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-partner overflow-hidden"
              >
                <div className="relative">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <motion.div
                    variants={shimmerVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State - No partners at all */}
        {!loading && partners.length === 0 && !selectedCategory && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <motion.div 
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6"
            >
              <Package className="w-10 h-10 text-muted-foreground" />
            </motion.div>
            <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
              Novos parceiros em breve
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Estamos a selecionar os melhores parceiros para si. 
              Em breve terá acesso a uma variedade de produtos e serviços de qualidade.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="btn-gold" onClick={() => navigate('/seja-parceiro')}>
                Quero ser Parceiro
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Empty State - No partners in selected category */}
        {!loading && selectedCategory && filteredPartners.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <motion.div 
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6"
            >
              <Filter className="w-10 h-10 text-muted-foreground" />
            </motion.div>
            <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
              Nenhum negócio encontrado
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Ainda não existem parceiros cadastrados na categoria <span className="font-semibold text-primary">"{selectedCategory}"</span>.
              <br />Em breve teremos novidades!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" onClick={onClearFilter} className="gap-2">
                  <X className="w-4 h-4" />
                  Limpar filtro
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="btn-gold" onClick={() => navigate('/seja-parceiro')}>
                  Quero ser Parceiro
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Partners Grid */}
        {!loading && filteredPartners.length > 0 && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            key={selectedCategory || 'all'} // Re-animate when filter changes
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPartners.map((partner, index) => {
              const isService = isServiceCategory(partner.category, categories);
              
              return (
              <motion.article
                key={partner.id}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="card-partner group cursor-pointer relative overflow-hidden"
                onClick={() => handlePartnerClick(partner.id)}
              >
                {/* Hover glow effect */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none z-10"
                />

                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {partner.image_url ? (
                    <motion.img
                      initial={{ scale: 1.1 }}
                      whileInView={{ scale: 1 }}
                      whileHover={{ scale: 1.15 }}
                      transition={{ duration: 0.6 }}
                      viewport={{ once: true }}
                      src={partner.image_url}
                      alt={partner.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <motion.div 
                      className="w-full h-full flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      {isService ? (
                        <Briefcase className="w-16 h-16 text-muted-foreground/50" />
                      ) : (
                        <Package className="w-16 h-16 text-muted-foreground/50" />
                      )}
                    </motion.div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Visit Store Overlay */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className="bg-background/90 backdrop-blur-sm text-foreground font-medium px-4 py-2 rounded-full text-sm shadow-lg"
                    >
                      {isService ? 'Ver Serviços →' : 'Visitar Loja →'}
                    </motion.span>
                  </motion.div>

                  {/* Service/Product badge */}
                  <div className="absolute top-3 left-3">
                    <Badge 
                      variant={isService ? "secondary" : "outline"} 
                      className={`gap-1 text-xs ${isService ? 'bg-accent/80 backdrop-blur-sm' : 'bg-background/80 backdrop-blur-sm'}`}
                    >
                      {isService ? (
                        <>
                          <Briefcase className="w-3 h-3" />
                          Serviços
                        </>
                      ) : (
                        <>
                          <Package className="w-3 h-3" />
                          Produtos
                        </>
                      )}
                    </Badge>
                  </div>

                   {/* TOP badge (stores crachadas) */}
                   {(partner.is_top || partners.every((p) => !p.is_top)) && (
                     <motion.div
                       initial={{ opacity: 0, scale: 0 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ delay: 0.5 + index * 0.05, type: "spring" }}
                       className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full inline-flex items-center gap-1"
                     >
                       <Sparkles className="w-3 h-3" />
                       TOP
                     </motion.div>
                   )}
                </div>

                {/* Content */}
                <div className="p-6 relative z-20">
                  {/* Category */}
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-xs font-semibold text-primary uppercase tracking-wider"
                  >
                    {partner.category}
                  </motion.span>

                  {/* Name */}
                  <h3 className="font-display text-xl font-semibold text-foreground mt-2 mb-2 group-hover:text-primary transition-colors">
                    {partner.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {partner.description || "Produtos e serviços de qualidade."}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <motion.div 
                      className="flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="font-semibold text-foreground">{Number(partner.rating).toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({partner.reviews_count})</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-1 text-sm text-muted-foreground"
                      whileHover={{ color: "hsl(var(--primary))" }}
                    >
                      <MapPin className="w-4 h-4" />
                      {partner.location}
                    </motion.div>
                  </div>
                </div>
              </motion.article>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FeaturedPartners;
