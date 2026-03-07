import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Minus, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    category: string | null;
    stock: number | null;
  };
  index: number;
  cartQuantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

const ProductCard = ({ product, index, cartQuantity, onAdd, onRemove }: ProductCardProps) => {
  const hasStock = product.stock === null || product.stock > 0;
  const isLowStock = product.stock !== null && product.stock <= 5 && product.stock > 0;
  const outOfStock = product.stock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card className={`overflow-hidden group transition-all h-full ${outOfStock ? 'opacity-60' : 'hover:border-primary/30'}`}>
        <CardContent className="p-0 flex flex-col h-full">
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
              <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-foreground">
                {product.category}
              </Badge>
            )}
            {/* Stock indicator - always visible */}
            {product.stock !== null && product.stock > 5 && (
              <Badge className="absolute top-2 right-2 gap-1 bg-emerald-500/90 hover:bg-emerald-500/90 text-white border-0 backdrop-blur-sm">
                <Package className="w-3 h-3" />
                {product.stock} em stock
              </Badge>
            )}
            {isLowStock && (
              <Badge variant="destructive" className="absolute top-2 right-2 gap-1 animate-pulse">
                <AlertCircle className="w-3 h-3" />
                Últimas {product.stock} unidades!
              </Badge>
            )}
            {outOfStock && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Badge variant="secondary" className="text-sm">
                  Esgotado
                </Badge>
              </div>
            )}
          </div>
          <div className="p-4 flex flex-col flex-1">
            <h3 className="font-medium text-foreground mb-1 line-clamp-1">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
                {product.description}
              </p>
            )}
            <div className="flex items-center justify-between mt-auto">
              <span className="text-lg font-bold text-primary">
                {Number(product.price).toLocaleString("pt-AO")} Kz
              </span>
              
              {cartQuantity > 0 ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemove();
                    }}
                    type="button"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">
                    {cartQuantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onAdd();
                    }}
                    disabled={product.stock !== null && cartQuantity >= product.stock}
                    type="button"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={onAdd}
                  disabled={outOfStock}
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
