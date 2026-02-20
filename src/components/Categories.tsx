import { 
  Utensils, 
  Shirt, 
  Smartphone, 
  Sparkles, 
  Home, 
  Wrench,
  Hammer,
  LucideIcon,
  Package,
  Briefcase
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const iconMap: Record<string, LucideIcon> = {
  utensils: Utensils,
  shirt: Shirt,
  smartphone: Smartphone,
  sparkles: Sparkles,
  home: Home,
  wrench: Wrench,
  hammer: Hammer,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

interface CategoriesProps {
  selectedCategory: string | null;
  onCategorySelect: (categoryName: string | null) => void;
}

const Categories = ({ selectedCategory, onCategorySelect }: CategoriesProps) => {
  const { categories, loading } = useCategories();

  const handleCategoryClick = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      onCategorySelect(null); // Deselect if clicking the same category
    } else {
      onCategorySelect(categoryName);
    }
  };

  if (loading) {
    return (
      <section className="section-padding bg-muted/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Explore por <span className="text-gradient-gold">Categorias</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encontre facilmente o que procura navegando pelas nossas categorias de produtos e serviços.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon || 'utensils'] || Utensils;
            const isSelected = selectedCategory === category.name;
            
            return (
              <motion.button
                key={category.id}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(category.name)}
                className={`group relative p-6 rounded-xl bg-card border transition-all duration-300 text-center ${
                  isSelected 
                    ? 'border-primary bg-primary/10 shadow-lg ring-2 ring-primary/30' 
                    : 'border-border hover:border-primary/50 hover:shadow-lg'
                }`}
              >
                {/* Category type indicator */}
                <div className="absolute top-2 left-2">
                  {category.type === 'service' ? (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-accent/50 text-xs text-muted-foreground">
                      <Briefcase className="w-3 h-3" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                      <Package className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary"
                  />
                )}
                
                <motion.div 
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${
                    isSelected ? 'bg-primary/20' : 'bg-primary/10 group-hover:bg-primary/20'
                  }`}
                >
                  <IconComponent className="w-7 h-7 text-primary" />
                </motion.div>
                <h3 className={`font-semibold transition-colors ${
                  isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'
                }`}>
                  {category.name}
                </h3>
                <p className={`text-xs mt-1 ${
                  category.type === 'service' ? 'text-accent-foreground' : 'text-muted-foreground'
                }`}>
                  {category.type === 'service' ? 'Serviços' : 'Produtos'}
                </p>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Categories;
