import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Briefcase, Clock, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    category: string | null;
  };
  index: number;
  onRequestQuote: (service: { id: string; name: string; description: string | null }) => void;
}

const ServiceCard = ({ service, index, onRequestQuote }: ServiceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card className="overflow-hidden group hover:border-primary/30 transition-all h-full">
        <CardContent className="p-0 flex flex-col h-full">
          <div className="aspect-[4/3] bg-muted relative overflow-hidden">
            {service.image_url ? (
              <img
                src={service.image_url}
                alt={service.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                <Briefcase className="w-12 h-12 text-primary/50" />
              </div>
            )}
            {service.category && (
              <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-foreground">
                {service.category}
              </Badge>
            )}
            {/* Service indicator */}
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground p-1.5 rounded-full">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="p-4 flex flex-col flex-1">
            <h3 className="font-medium text-foreground mb-1 line-clamp-1">
              {service.name}
            </h3>
            {service.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
                {service.description}
              </p>
            )}
            
            {/* Price as "A partir de" for services */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
              <span>A partir de</span>
              <span className="text-lg font-bold text-primary">
                {Number(service.price).toLocaleString("pt-AO")} Kz
              </span>
            </div>

            {/* Service-specific actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1"
                onClick={() => onRequestQuote(service)}
              >
                <FileText className="w-4 h-4" />
                Pedir Orçamento
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ServiceCard;
