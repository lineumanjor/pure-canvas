import { Shield, Truck, CreditCard, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const features = [
  {
    icon: Shield,
    title: "Pagamentos Seguros",
    description: "Transações protegidas com Multicaixa Express e transferências bancárias.",
  },
  {
    icon: Truck,
    title: "Entregas Rápidas",
    description: "Receba os seus pedidos rapidamente com os nossos parceiros de entrega.",
  },
  {
    icon: Users,
    title: "Parceiros Verificados",
    description: "Todos os parceiros passam por um processo de verificação rigoroso.",
  },
  {
    icon: CreditCard,
    title: "Comissões Justas",
    description: "Modelo de negócio transparente e sustentável para todos.",
  },
];

const benefits = [
  "Acesso a milhares de produtos e serviços",
  "Suporte ao cliente 24/7",
  "Garantia de satisfação",
  "Promoções exclusivas",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

const About = () => {
  return (
    <section id="sobre" className="section-padding bg-secondary text-secondary-foreground">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-primary font-semibold text-sm uppercase tracking-wider"
            >
              Sobre a ESSENZA E.J
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6"
            >
              A sua plataforma de{" "}
              <span className="text-gradient-gold">confiança</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-secondary-foreground/80 text-lg mb-8"
            >
              A ESSENZA E.J nasceu com a missão de conectar os melhores negócios locais aos 
              consumidores em Luanda. Acreditamos no poder das pequenas empresas e na importância de 
              fortalecer a economia angolana.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-secondary-foreground/80 mb-8"
            >
              Com a nossa plataforma, os parceiros podem expandir o seu alcance enquanto os 
              clientes descobrem produtos e serviços de qualidade com total comodidade e 
              segurança.
            </motion.p>

            {/* Benefits List */}
            <motion.ul 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-3 mb-10"
            >
              {benefits.map((benefit, index) => (
                <motion.li 
                  key={index} 
                  variants={itemVariants}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring" as const, delay: 0.4 + index * 0.1 }}
                  >
                    <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  </motion.div>
                  <span className="text-secondary-foreground/90">{benefit}</span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button size="lg" className="btn-gold">
                Torne-se Parceiro
              </Button>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid sm:grid-cols-2 gap-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="p-6 rounded-2xl bg-secondary-foreground/5 border border-secondary-foreground/10 hover:border-primary/30 transition-colors duration-300"
                >
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4"
                  >
                    <Icon className="w-6 h-6 text-primary" />
                  </motion.div>
                  <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-secondary-foreground/70">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
