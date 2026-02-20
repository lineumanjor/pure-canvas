import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShoppingBag, Store, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

type AuthView = "login" | "signup" | "forgot-password";

const Auth = () => {
  const [currentView, setCurrentView] = useState<AuthView>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signUp } = useAuth();

  const from = (location.state as { from?: string })?.from || "/";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleLogin = async (email: string, password: string) => {
    setIsSubmitting(true);
    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Erro ao entrar",
        description:
          error.message === "Invalid login credentials"
            ? "Email ou senha incorretos"
            : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso.",
      });
    }
    setIsSubmitting(false);
  };

  const handleSignup = async (email: string, password: string, fullName: string, avatarFile?: File) => {
    setIsSubmitting(true);
    const { error } = await signUp(email, password, fullName);

    if (error) {
      let message = error.message;
      if (error.message.includes("already registered")) {
        message = "Este email já está registado";
      }
      toast({
        title: "Erro ao registar",
        description: message,
        variant: "destructive",
      });
    } else {
      // Upload avatar after successful signup if file was selected
      if (avatarFile) {
        try {
          const { data: { user: newUser } } = await supabase.auth.getUser();
          if (newUser) {
            const fileExt = avatarFile.name.split(".").pop();
            const fileName = `${newUser.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from("partner-images")
              .upload(filePath, avatarFile, { cacheControl: "3600", upsert: true });

            if (!uploadError) {
              const { data: urlData } = supabase.storage
                .from("partner-images")
                .getPublicUrl(filePath);

              await supabase
                .from("profiles")
                .update({ avatar_url: urlData.publicUrl })
                .eq("user_id", newUser.id);
            }
          }
        } catch (e) {
          console.error("Avatar upload after signup failed:", e);
        }
      }
      toast({
        title: "Bem-vindo à Essenza E.J!",
        description: "Olá! Chamo-me Eunice Joaquim e isto é a Essenza E.J. Para a segurança de todos, optámos pela verificação de email. Por favor, confirme o seu email verificando a sua caixa de mensagens para poder entrar.",
        duration: 15000,
      });
    }
    setIsSubmitting(false);
  };

  const features = [
    {
      icon: ShoppingBag,
      title: "Compras Fáceis",
      description: "Encontre produtos artesanais únicos",
    },
    {
      icon: Store,
      title: "Apoie Locais",
      description: "Conecte-se com produtores da sua região",
    },
    {
      icon: Sparkles,
      title: "Qualidade Premium",
      description: "Produtos selecionados com excelência",
    },
  ];

  const getHeaderContent = () => {
    switch (currentView) {
      case "login":
        return {
          title: "Bem-vindo de volta",
          subtitle: "Entre na sua conta para continuar",
        };
      case "signup":
        return {
          title: "Criar conta",
          subtitle: "Registe-se para começar a comprar",
        };
      case "forgot-password":
        return {
          title: "Recuperar senha",
          subtitle: "Redefina o acesso à sua conta",
        };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.05, 0.15, 0.05]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" 
          />
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/10 rounded-full blur-2xl" 
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          {/* Logo */}
          <motion.a 
            href="/" 
            className="flex items-center gap-3 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div 
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform group-hover:scale-110"
            >
              <span className="font-display font-bold text-2xl">E</span>
            </motion.div>
            <span className="font-display text-2xl font-bold">Essenza</span>
          </motion.a>

          {/* Main content */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <h1 className="font-display text-4xl xl:text-5xl font-bold leading-tight">
                Descubra o melhor do{" "}
                <span className="text-white/90">comércio local</span>
              </h1>
              <p className="text-lg text-white/80 max-w-md">
                Conectamos você aos melhores produtores artesanais da sua região.
              </p>
            </motion.div>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  whileHover={{ x: 5, scale: 1.02 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm cursor-default"
                >
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center"
                  >
                    <feature.icon className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-white/70">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-white/60">
            © 2026 Essenza. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col min-h-screen bg-background">
        {/* Mobile Header */}
        <div className="lg:hidden p-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </a>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="lg:hidden text-center mb-8"
            >
              <a href="/" className="inline-flex items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-display font-bold text-2xl">
                    E
                  </span>
                </div>
              </a>
            </motion.div>

            {/* Header */}
            <div className="text-center mb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                    {headerContent.title}
                  </h1>
                  <p className="text-muted-foreground">
                    {headerContent.subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Form Card */}
            <motion.div
              layout
              className="bg-card rounded-2xl p-6 lg:p-8 shadow-xl border border-border/50"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, x: currentView === "login" ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: currentView === "login" ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentView === "login" && (
                    <LoginForm 
                      onSubmit={handleLogin} 
                      isLoading={isSubmitting}
                      onForgotPassword={() => setCurrentView("forgot-password")}
                    />
                  )}
                  {currentView === "signup" && (
                    <SignupForm onSubmit={handleSignup} isLoading={isSubmitting} />
                  )}
                  {currentView === "forgot-password" && (
                    <ForgotPasswordForm onBack={() => setCurrentView("login")} />
                  )}
                </motion.div>
              </AnimatePresence>

              {currentView !== "forgot-password" && (
                <>
                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-3 text-muted-foreground">ou</span>
                    </div>
                  </div>

                  {/* Switch Form */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setCurrentView(currentView === "login" ? "signup" : "login")}
                      className="text-primary hover:text-primary/80 font-medium transition-colors touch-manipulation"
                    >
                      {currentView === "login" ? "Não tem conta? Registe-se" : "Já tem conta? Entre"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>

            {/* Trust badges */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Conexão segura
              </span>
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Dados protegidos
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
