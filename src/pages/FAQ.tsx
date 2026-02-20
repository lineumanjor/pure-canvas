import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, ShoppingBag, Truck, CreditCard, Users, MessageCircle, Shield, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const FAQ = () => {
  const { settings } = useSiteSettings();

  const faqCategories = [
    {
      icon: ShoppingBag,
      title: "Compras e Pedidos",
      questions: [
        {
          q: "Como faço uma compra na ESSENZA E.J?",
          a: "Para comprar na nossa plataforma, basta navegar pelos parceiros disponíveis, adicionar os produtos desejados ao carrinho e finalizar o pedido. Você receberá uma confirmação por e-mail e poderá acompanhar o estado do seu pedido na secção 'Meus Pedidos'."
        },
        {
          q: "Posso comprar de vários parceiros no mesmo pedido?",
          a: "Cada pedido é processado individualmente por parceiro para garantir a melhor qualidade de serviço. Se desejar produtos de diferentes parceiros, precisará fazer pedidos separados."
        },
        {
          q: "Como cancelo um pedido?",
          a: "Para cancelar um pedido, aceda à secção 'Meus Pedidos' e contacte directamente o parceiro através do chat. O cancelamento está sujeito à política de cada parceiro e ao estado actual do pedido."
        },
        {
          q: "Os preços incluem entrega?",
          a: "Os custos de entrega variam conforme o parceiro e a sua localização em Luanda. O valor exacto da entrega é apresentado antes de finalizar o pedido."
        }
      ]
    },
    {
      icon: Truck,
      title: "Entregas",
      questions: [
        {
          q: "Qual é o prazo de entrega?",
          a: "O prazo de entrega varia conforme o parceiro e o tipo de produto ou serviço. Geralmente, para produtos alimentares, a entrega é feita no mesmo dia. Para outros produtos, pode demorar entre 1 a 5 dias úteis."
        },
        {
          q: "Fazem entregas em toda Luanda?",
          a: "Sim, os nossos parceiros cobrem a maior parte de Luanda. A disponibilidade de entrega na sua zona específica será confirmada no momento do pedido."
        },
        {
          q: "Posso agendar a entrega para um horário específico?",
          a: "Alguns parceiros oferecem a opção de agendamento. Esta funcionalidade está disponível durante o processo de checkout, quando aplicável."
        },
        {
          q: "O que faço se o meu pedido não chegou?",
          a: "Caso o seu pedido não chegue no prazo indicado, contacte imediatamente o parceiro através do chat na plataforma ou entre em contacto com o nosso suporte pelo WhatsApp."
        }
      ]
    },
    {
      icon: CreditCard,
      title: "Pagamentos",
      questions: [
        {
          q: "Quais são os métodos de pagamento aceites?",
          a: "Actualmente, aceitamos pagamento na entrega (dinheiro ou TPA móvel), Multicaixa Express e transferência bancária. Os métodos disponíveis podem variar conforme o parceiro."
        },
        {
          q: "É seguro comprar na ESSENZA E.J?",
          a: "Sim, a nossa plataforma utiliza tecnologias de encriptação avançadas para proteger os seus dados. Todos os parceiros são verificados antes de serem aprovados na plataforma."
        },
        {
          q: "Posso pedir factura?",
          a: "Sim, pode solicitar factura ao parceiro no momento do pedido ou através do chat após a compra."
        }
      ]
    },
    {
      icon: Users,
      title: "Conta e Registo",
      questions: [
        {
          q: "Preciso de criar conta para comprar?",
          a: "Sim, é necessário criar uma conta gratuita para fazer compras. Isto permite-nos guardar o seu histórico de pedidos, facilitar futuras compras e garantir a sua segurança."
        },
        {
          q: "Como recupero a minha palavra-passe?",
          a: "Na página de login, clique em 'Esqueci a palavra-passe' e siga as instruções enviadas para o seu e-mail registado."
        },
        {
          q: "Como actualizo os meus dados pessoais?",
          a: "Após iniciar sessão, aceda ao menu do seu perfil e seleccione 'Editar Perfil' para actualizar as suas informações."
        }
      ]
    },
    {
      icon: Store,
      title: "Parceiros",
      questions: [
        {
          q: "Como posso tornar-me parceiro da ESSENZA E.J?",
          a: "Para se tornar parceiro, clique em 'Seja Parceiro' no menu principal e preencha o formulário de candidatura. A nossa equipa analisará o seu pedido e entrará em contacto consigo."
        },
        {
          q: "Qual é a comissão cobrada aos parceiros?",
          a: "As comissões variam conforme a categoria do negócio e o volume de vendas. Os detalhes são acordados durante o processo de aprovação como parceiro."
        },
        {
          q: "Os parceiros são verificados?",
          a: "Sim, todos os parceiros passam por um processo de verificação antes de serem aprovados. Isto garante a qualidade e fiabilidade dos produtos e serviços oferecidos."
        }
      ]
    },
    {
      icon: MessageCircle,
      title: "Suporte e Contacto",
      questions: [
        {
          q: "Como contacto o suporte da ESSENZA E.J?",
          a: `Pode contactar-nos através do WhatsApp (${settings.admin_whatsapp}), Instagram (@${settings.admin_instagram?.replace('@', '') || 'eunicejoaquim51'}) ou e-mail (${settings.admin_email}).`
        },
        {
          q: "Qual é o horário de atendimento?",
          a: "O nosso suporte está disponível de segunda a sábado, das 8h às 20h. Os parceiros podem ter horários de funcionamento diferentes."
        },
        {
          q: "Como faço uma reclamação?",
          a: "Para reclamações, contacte primeiro o parceiro através do chat na plataforma. Se não conseguir resolver, entre em contacto com o nosso suporte que irá mediar a situação."
        }
      ]
    },
    {
      icon: Shield,
      title: "Segurança e Privacidade",
      questions: [
        {
          q: "Os meus dados estão seguros?",
          a: "Sim, utilizamos encriptação de ponta-a-ponta e seguimos as melhores práticas de segurança. Consulte a nossa Política de Privacidade para mais detalhes."
        },
        {
          q: "A ESSENZA E.J partilha os meus dados?",
          a: "Apenas partilhamos os dados necessários com os parceiros para processar os seus pedidos. Nunca vendemos ou partilhamos os seus dados com terceiros para fins de marketing."
        },
        {
          q: "Como posso eliminar a minha conta?",
          a: `Para eliminar a sua conta, envie um e-mail para ${settings.admin_email} com o assunto 'Eliminar Conta'. Processaremos o seu pedido dentro de 5 dias úteis.`
        }
      ]
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
              <h1 className="font-display text-xl font-semibold">Perguntas Frequentes</h1>
              <p className="text-sm text-muted-foreground">Encontre respostas às suas dúvidas</p>
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
              <HelpCircle className="w-10 h-10 text-primary" />
            </motion.div>
            <h2 className="font-display text-3xl font-bold mb-4">
              Como Podemos Ajudar?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Aqui encontra respostas às perguntas mais frequentes sobre a ESSENZA E.J. 
              Se não encontrar o que procura, não hesite em contactar-nos.
            </p>
          </div>

          {/* FAQ Categories */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {faqCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold">{category.title}</h3>
                  </div>

                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((item, qIndex) => (
                      <AccordionItem 
                        key={qIndex} 
                        value={`${index}-${qIndex}`}
                        className="border border-border rounded-lg px-4 data-[state=open]:bg-secondary/30"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-4">
                          <span className="font-medium text-foreground">{item.q}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 bg-primary/10 rounded-2xl p-8 text-center"
          >
            <h3 className="font-display text-xl font-semibold mb-3">
              Não encontrou a resposta?
            </h3>
            <p className="text-muted-foreground mb-6">
              A nossa equipa está disponível para ajudá-lo com qualquer dúvida.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild>
                <a 
                  href={`https://wa.me/${settings.admin_whatsapp?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={`mailto:${settings.admin_email}`}>
                  Enviar E-mail
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-center"
          >
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar à Página Inicial
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default FAQ;
