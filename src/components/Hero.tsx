import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStats } from "@/hooks/useStats";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-marketplace.jpg";
import logoEssenza from "@/assets/logo-essenza.jpg";
import ElegantSignature from "@/components/ElegantSignature";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Hero = () => {
  const [showAbout, setShowAbout] = useState(false);
  const { stats } = useStats();

  // Only show stats that have real data (> 0)
  const displayStats = [
    { value: stats.partnersCount, label: "Parceiros" },
    { value: stats.productsCount, label: "Produtos" },
    { value: stats.clientsCount, label: "Clientes" },
  ].filter(stat => stat.value > 0);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Premium Overlay */}
      <div className="absolute inset-0">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroImage}
          alt="ESSENZA Marketplace - Produtos variados"
          className="w-full h-full object-cover"
        />
        {/* Multi-layer gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
      </div>

      {/* Decorative Elements */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ delay: 1, duration: 1.5 }}
        className="absolute top-20 right-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]"
      />

      {/* Content */}
      <div className="relative z-10 container-custom section-padding">
        <div className="max-w-2xl">
          {/* Logo Integration - Elegant, Seamless, Premium */}
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6 relative"
          >
            {/* Glow effect behind logo */}
            <div 
              className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl opacity-60"
              style={{ transform: "scale(0.8)" }}
            />
            <img
              src={logoEssenza}
              alt="ESSENZA E.J"
              className="relative h-24 sm:h-28 lg:h-32 w-auto object-contain rounded-xl"
              style={{ 
                filter: "drop-shadow(0 8px 32px hsl(200 85% 50% / 0.4))",
              }}
            />
          </motion.div>

          {/* Elegant Signature - Eunice Joaquim */}
          <div className="mb-8">
            <ElegantSignature name="Eunice Joaquim" />
          </div>

          {/* Badge - Refined */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/15 backdrop-blur-md border border-primary/25 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold tracking-wide text-primary">O seu marketplace em Luanda</span>
          </motion.div>

          {/* Headline - Bold & Clear */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1] mb-6"
          >
            Compre{" "}
            <span className="text-gradient-brand relative">
              tudo
              <motion.span 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute -bottom-2 left-0 h-1 bg-primary/60 rounded-full"
              />
            </span>
            <br />
            no mesmo lugar
          </motion.h1>

          {/* Subheadline - Supporting Message */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-lg leading-relaxed"
          >
            Descubra os melhores parceiros locais de Luanda. Fast-food, moda, serviços e muito mais — 
            tudo com entrega rápida e pagamento fácil.
          </motion.p>

          {/* CTA Buttons - Premium Style */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button asChild size="lg" className="btn-gold text-base gap-2 group h-14 px-8">
              <Link to="/parceiros">
                <span>Explore os parceiros</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => setShowAbout(true)}
              className="border-border/50 text-foreground bg-background/50 backdrop-blur-sm hover:bg-accent/50 hover:border-primary/50 text-base h-14 px-8"
            >
              Saiba mais
            </Button>
          </motion.div>

          {/* About Dialog */}
          <Dialog open={showAbout} onOpenChange={setShowAbout}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              {/* Signature Animation - Appears first in center, then fades slowly */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0, 1, 1, 1, 0], scale: [0.85, 0.85, 1, 1, 1, 1] }}
                transition={{ 
                  duration: 5, 
                  times: [0, 0.1, 0.3, 0.6, 0.8, 1],
                  ease: "easeInOut" 
                }}
                className="absolute inset-0 flex items-center justify-center z-10 bg-background"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: [0, 1, 1, 1, 0], y: [20, 0, 0, 0, 0] }}
                    transition={{ 
                      duration: 5, 
                      times: [0, 0.25, 0.6, 0.8, 1],
                      ease: "easeOut" 
                    }}
                  >
                    <p className="text-2xl font-display text-primary mb-2">ESSENZA E.J</p>
                    <p className="text-sm text-muted-foreground tracking-wider">por</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.9, 0.9, 1, 1, 1] }}
                    transition={{ 
                      duration: 5, 
                      times: [0, 0.15, 0.35, 0.8, 1],
                      ease: "easeOut" 
                    }}
                    className="mt-3"
                  >
                    <ElegantSignature name="Eunice Joaquim" className="mx-auto" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Content - Appears after signature fades with slow left-to-right animations */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4.8, duration: 1.2, ease: "easeOut" }}
              >
                <DialogHeader>
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 5.2, duration: 1, ease: "easeOut" }}
                  >
                    <DialogTitle className="text-2xl font-display text-primary">
                      ESSENZA E.J — A Essência de Empreender em Angola
                    </DialogTitle>
                  </motion.div>
                </DialogHeader>
                <div className="space-y-4 text-muted-foreground leading-relaxed mt-4">
                  <motion.p
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.9, delay: 5.8, ease: "easeOut" }}
                  >
                    A <strong className="text-foreground">ESSENZA E.J</strong> nasceu do sonho de uma jovem empreendedora angolana, visionária e determinada, que acreditou que muitos talentos e negócios locais merecem mais do que invisibilidade — merecem oportunidade.
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.9, delay: 6.5, ease: "easeOut" }}
                  >
                    O nome <strong className="text-foreground">ESSENZA</strong>, que significa "Essência" em português e tem origem no italiano, representa aquilo que há de mais verdadeiro: a essência de cada negócio, de cada serviço e de cada pessoa que trabalha com dedicação para crescer.
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.9, delay: 7.2, ease: "easeOut" }}
                  >
                    A <strong className="text-foreground">ESSENZA E.J</strong> é um hub digital 100% Mangolé, com um propósito claro: <em>conectar pessoas, valorizar negócios locais e alavancar empreendedores que ainda não têm visibilidade no mercado.</em>
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.9, delay: 7.9, ease: "easeOut" }}
                  >
                    Aqui, cada parceiro tem o seu espaço, a sua vitrine, a sua voz. A plataforma oferece estrutura, organização e confiança, permitindo que pequenos e médios negócios se concentrem no que fazem de melhor, enquanto a ESSENZA cuida da experiência, do alcance e da ligação com os clientes.
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.9, delay: 8.6, ease: "easeOut" }}
                    className="font-medium text-foreground"
                  >
                    Mais do que um marketplace, a ESSENZA E.J é um movimento de crescimento, colaboração e esperança.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 9.3, ease: "easeOut" }}
                    className="space-y-3 py-4 border-l-4 border-primary pl-4 bg-primary/5 rounded-r-lg"
                  >
                    <motion.p
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 9.8, ease: "easeOut" }}
                      className="italic"
                    >
                      É sobre dar dignidade ao trabalho local.
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 10.4, ease: "easeOut" }}
                      className="italic"
                    >
                      É sobre transformar talento em oportunidade.
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 11.0, ease: "easeOut" }}
                      className="italic"
                    >
                      É sobre liberar o potencial que Angola carrega.
                    </motion.p>
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 11.8, ease: "easeOut" }}
                    className="text-center font-display text-lg text-primary pt-4"
                  >
                    ESSENZA E.J — onde a essência do empreendedor angolano encontra o seu lugar no mercado.
                  </motion.p>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>

          {/* Stats - Dynamic & Elegant */}
          {displayStats.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="mt-16 pt-8 border-t border-border/30"
            >
              <div 
                className="grid gap-8" 
                style={{ gridTemplateColumns: `repeat(${displayStats.length}, 1fr)` }}
              >
                {displayStats.map((stat, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                    className="text-center sm:text-left"
                  >
                    <div className="font-display text-3xl sm:text-4xl font-bold text-primary mb-1">
                      {stat.value}+
                    </div>
                    <div className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/50 to-transparent" />
    </section>
  );
};

export default Hero;
