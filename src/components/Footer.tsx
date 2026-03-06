import { Link } from "react-router-dom";
import { Facebook, Instagram, MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { motion } from "framer-motion";
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const {
    settings
  } = useSiteSettings();
  const footerLinks = {
    empresa: [{
      name: "Sobre Nós",
      href: "#sobre"
    }, {
      name: "Como Funciona",
      href: "#"
    }, {
      name: "Parceiros",
      href: "#parceiros"
    }, {
      name: "Blog",
      href: "/blog"
    }],
    suporte: [{
      name: "Central de Ajuda",
      href: "/faq"
    }, {
      name: "FAQ",
      href: "/faq"
    }, {
      name: "Contacto",
      href: "#contacto"
    }, {
      name: "Política de Privacidade",
      href: "/privacidade"
    }],
    parceiros: [{
      name: "Cadastrar Negócio",
      href: "/seja-parceiro"
    }, {
      name: "Painel do Parceiro",
      href: "/partner"
    }, {
      name: "Comissões",
      href: "#"
    }, {
      name: "Recursos",
      href: "#"
    }]
  };
  const whatsappLink = settings.admin_whatsapp ? `https://wa.me/${settings.admin_whatsapp.replace(/\D/g, '')}` : '#';
  const instagramLink = settings.admin_instagram ? `https://instagram.com/${settings.admin_instagram.replace('@', '')}` : '#';
  const socialLinks = [{
    icon: Facebook,
    href: "#",
    label: "Facebook"
  }, {
    icon: Instagram,
    href: instagramLink,
    label: "Instagram"
  }, {
    icon: MessageCircle,
    href: whatsappLink,
    label: "WhatsApp"
  }];
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };
  return <motion.footer initial={{
    opacity: 0
  }} whileInView={{
    opacity: 1
  }} viewport={{
    once: true
  }} transition={{
    duration: 0.6
  }} id="contacto" className="bg-secondary text-secondary-foreground">
      <div className="container-custom section-padding pb-8">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
        once: true
      }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl">E</span>
              </div>
              <span className="font-display text-xl font-semibold">
                ESSENZA <span className="text-primary">E.J</span>
              </span>
            </Link>
            <p className="text-secondary-foreground/70 mb-6 max-w-sm">
              A plataforma que conecta os melhores negócios locais aos consumidores. 
              Compre tudo no mesmo lugar com segurança e comodidade.
            </p>
            <div className="space-y-3">
              <motion.a whileHover={{
              x: 5
            }} href={`mailto:${settings.admin_email}`} className="flex items-center gap-3 text-secondary-foreground/70 hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
                {settings.admin_email}
              </motion.a>
              <motion.a whileHover={{
              x: 5
            }} href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-secondary-foreground/70 hover:text-primary transition-colors">
                <Phone className="w-5 h-5" />
                {settings.admin_whatsapp}
              </motion.a>
              <motion.div className="flex items-center gap-3 text-secondary-foreground/70">
                <MapPin className="w-5 h-5 shrink-0" />
                Luanda, Angola
              </motion.div>
            </div>
          </motion.div>

          {/* Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display font-semibold text-lg mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map(link => <motion.li key={link.name} whileHover={{
              x: 5
            }}>
                  <a href={link.href} className="text-secondary-foreground/70 hover:text-primary transition-colors">
                    {link.name}
                  </a>
                </motion.li>)}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="font-display font-semibold text-lg mb-4">Suporte</h4>
            <ul className="space-y-3">
              {footerLinks.suporte.map(link => <motion.li key={link.name} whileHover={{
              x: 5
            }}>
                  <a href={link.href} className="text-secondary-foreground/70 hover:text-primary transition-colors">
                    {link.name}
                  </a>
                </motion.li>)}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="font-display font-semibold text-lg mb-4">Parceiros</h4>
            <ul className="space-y-3">
              {footerLinks.parceiros.map(link => <motion.li key={link.name} whileHover={{
              x: 5
            }}>
                  <Link to={link.href} className="text-secondary-foreground/70 hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </motion.li>)}
            </ul>
          </motion.div>
        </motion.div>

        {/* Contact Card */}
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6,
        delay: 0.3
      }} className="mt-12 p-6 rounded-2xl bg-primary/10 border border-primary/20">
          <h4 className="font-display font-semibold text-lg mb-3">
            Contacte a Administração
          </h4>
          <p className="text-secondary-foreground/70 mb-4">
            Para dúvidas, parcerias ou suporte, entre em contacto com {settings.admin_name}.
          </p>
          <div className="flex flex-wrap gap-4">
            <motion.a whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }} href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </motion.a>
            <motion.a whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }} href={instagramLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity">
              <Instagram className="w-5 h-5" />
              Instagram
            </motion.a>
            <motion.a whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }} href={`mailto:${settings.admin_email}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              <Mail className="w-5 h-5" />
              Email
            </motion.a>
          </div>
        </motion.div>

        {/* Developer Credits */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.5,
        delay: 0.5
      }} className="mt-8 pt-6 border-t border-secondary-foreground/10">
          <div className="text-center">
            <p className="text-secondary-foreground/50 text-xs mb-2">
              Desenvolvido por
            </p>
            <motion.div whileHover={{
            scale: 1.02
          }} className="inline-block">
              <a href="https://clientesvisa.lovable.app" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Lineu Manjor
              </a>
            </motion.div>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-secondary-foreground/50">
              <motion.a whileHover={{
              scale: 1.05,
              color: "hsl(var(--primary))"
            }} href="mailto:lineumanjor@gmail.com" className="flex items-center gap-1 hover:text-primary transition-colors">
                <Mail className="w-3 h-3" />
                lineumanjor@gmail.com
              </motion.a>
              <motion.a whileHover={{
              scale: 1.05,
              color: "hsl(var(--primary))"
            }} href="https://clientesvisa.lovable.app" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">https://clientesvisa.lovable.app</motion.a>
            </div>
          </div>
        </motion.div>

        {/* Bottom */}
        <motion.div initial={{
        opacity: 0
      }} whileInView={{
        opacity: 1
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.5,
        delay: 0.6
      }} className="mt-8 pt-8 border-t border-secondary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-secondary-foreground/60 text-sm">
            © {currentYear} {settings.site_name}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map(social => {
            const Icon = social.icon;
            return <motion.a key={social.label} whileHover={{
              scale: 1.1,
              y: -3
            }} whileTap={{
              scale: 0.95
            }} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center text-secondary-foreground/70 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </motion.a>;
          })}
          </div>
        </motion.div>
      </div>
    </motion.footer>;
};
export default Footer;