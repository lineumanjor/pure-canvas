import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const PrivacyPolicy = () => {
  const { settings } = useSiteSettings();

  const sections = [
    {
      icon: Shield,
      title: "1. Informações que Recolhemos",
      content: `A ESSENZA E.J recolhe as seguintes informações para proporcionar uma experiência segura e personalizada:

• **Dados de Identificação:** Nome completo, endereço de e-mail, número de telefone e morada de entrega.
• **Dados de Conta:** Informações de registo e autenticação para acesso à plataforma.
• **Dados de Transação:** Histórico de compras, pedidos e interações com parceiros.
• **Dados de Navegação:** Informações sobre como utiliza a nossa plataforma, incluindo páginas visitadas e preferências.
• **Dados de Comunicação:** Mensagens trocadas com parceiros e com o nosso suporte.`
    },
    {
      icon: Database,
      title: "2. Como Utilizamos os Seus Dados",
      content: `Utilizamos as suas informações para:

• Processar e entregar os seus pedidos de produtos e serviços.
• Facilitar a comunicação entre si e os nossos parceiros comerciais.
• Melhorar continuamente a experiência na plataforma ESSENZA E.J.
• Enviar notificações sobre o estado dos seus pedidos.
• Garantir a segurança das transações e prevenir fraudes.
• Cumprir obrigações legais aplicáveis em Angola.`
    },
    {
      icon: Lock,
      title: "3. Protecção dos Seus Dados",
      content: `A segurança dos seus dados é a nossa prioridade:

• Utilizamos encriptação de ponta para proteger todas as informações transmitidas.
• Os nossos servidores são monitorizados 24 horas por dia, 7 dias por semana.
• Implementamos controlos de acesso rigorosos para limitar quem pode ver os seus dados.
• Realizamos auditorias regulares de segurança.
• Nunca vendemos ou partilhamos os seus dados pessoais com terceiros para fins de marketing.`
    },
    {
      icon: UserCheck,
      title: "4. Partilha de Informações",
      content: `Partilhamos os seus dados apenas quando necessário:

• **Com Parceiros:** Partilhamos informações de contacto e entrega com os parceiros para processar os seus pedidos.
• **Prestadores de Serviços:** Utilizamos serviços de terceiros para processamento de pagamentos e hospedagem de dados, todos sujeitos a acordos de confidencialidade.
• **Requisitos Legais:** Podemos divulgar informações quando exigido por lei ou ordem judicial em Angola.`
    },
    {
      icon: Eye,
      title: "5. Os Seus Direitos",
      content: `Como utilizador da ESSENZA E.J, tem direito a:

• **Acesso:** Solicitar uma cópia dos dados pessoais que temos sobre si.
• **Correcção:** Pedir a correcção de dados incorrectos ou desactualizados.
• **Eliminação:** Solicitar a eliminação dos seus dados pessoais, sujeito a obrigações legais.
• **Portabilidade:** Receber os seus dados num formato estruturado e legível.
• **Oposição:** Opor-se ao tratamento dos seus dados para determinados fins.

Para exercer qualquer destes direitos, contacte-nos através do e-mail ${settings.admin_email}.`
    },
    {
      icon: Mail,
      title: "6. Contacto e Alterações",
      content: `**Contacto para Questões de Privacidade:**
• E-mail: ${settings.admin_email}
• WhatsApp: ${settings.admin_whatsapp}
• Localização: Luanda, Angola

**Alterações a esta Política:**
Reservamo-nos o direito de actualizar esta Política de Privacidade a qualquer momento. Quaisquer alterações significativas serão comunicadas através da plataforma ou por e-mail.

**Última actualização:** Fevereiro de 2026`
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-secondary/50 backdrop-blur-sm border-b border-border sticky top-0 z-50"
      >
        <div className="container-custom py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-display text-xl font-semibold">Política de Privacidade</h1>
              <p className="text-sm text-muted-foreground">ESSENZA E.J - A sua privacidade é importante</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="container-custom py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Intro */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"
            >
              <Shield className="w-10 h-10 text-primary" />
            </motion.div>
            <h2 className="font-display text-3xl font-bold mb-4">
              Protegemos os Seus Dados
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Na ESSENZA E.J, comprometemo-nos a proteger a sua privacidade e a tratar os seus dados 
              pessoais com o máximo cuidado e transparência. Esta política explica como recolhemos, 
              utilizamos e protegemos as suas informações.
            </p>
          </div>

          {/* Sections */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-semibold mb-4">{section.title}</h3>
                      <div className="prose prose-sm max-w-none text-muted-foreground">
                        {section.content.split('\n').map((paragraph, pIndex) => (
                          <p 
                            key={pIndex} 
                            className="mb-2"
                            dangerouslySetInnerHTML={{ 
                              __html: paragraph
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                                .replace(/•/g, '<span class="text-primary">•</span>')
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Ao utilizar a plataforma ESSENZA E.J, concorda com os termos desta Política de Privacidade.
            </p>
            <Button asChild className="mt-4">
              <Link to="/">Voltar à Página Inicial</Link>
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
