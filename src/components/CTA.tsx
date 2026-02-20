import { useNavigate } from "react-router-dom";
import { ArrowRight, Store, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-6">
          {/* For Partners */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-3xl p-8 lg:p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20"
          >
            <div className="relative z-10">
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6"
              >
                <Store className="w-7 h-7 text-primary" />
              </motion.div>
              <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Quer ser um parceiro?
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                Junte-se à nossa rede de parceiros e expanda o seu negócio. 
                Comece a vender online hoje mesmo com suporte completo.
              </p>
              <Button 
                size="lg" 
                className="btn-gold gap-2 group"
                onClick={() => navigate("/seja-parceiro")}
              >
                Cadastrar Negócio
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            {/* Decorative */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl" 
            />
          </motion.div>

          {/* For Customers */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-3xl p-8 lg:p-12 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border border-accent/20"
          >
            <div className="relative z-10">
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mb-6"
              >
                <ShoppingBag className="w-7 h-7 text-accent" />
              </motion.div>
              <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Comece a comprar
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                Explore produtos e serviços dos melhores parceiros locais. 
                Compre com segurança e receba na sua porta.
              </p>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 group border-accent/30 hover:bg-accent/10"
                onClick={() => {
                  const element = document.getElementById('parceiros');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explorar Catálogo
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            {/* Decorative */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
              className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-accent/5 blur-3xl" 
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
