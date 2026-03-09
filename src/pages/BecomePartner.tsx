import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store, MapPin, Phone, Mail, Instagram, MessageCircle, FileText, ArrowLeft, CheckCircle, CreditCard, Upload, Smartphone, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const partnerSchema = z.object({
  name: z.string().trim().min(2, { message: "Nome muito curto" }).max(100),
  description: z.string().trim().min(20, { message: "Descrição deve ter pelo menos 20 caracteres" }).max(500),
  category: z.string().min(1, { message: "Selecione uma categoria" }),
  location: z.string().trim().min(3, { message: "Localização obrigatória" }).max(100),
  phone: z.string().trim().min(9, { message: "Telefone inválido" }).max(20),
  email: z.string().trim().email({ message: "Email inválido" }),
  whatsapp: z.string().trim().optional(),
  instagram: z.string().trim().optional(),
});

type PartnerFormData = z.infer<typeof partnerSchema>;

type Step = 'details' | 'plan' | 'payment' | 'multicaixa_transfer';

const BecomePartner = () => {
  const [step, setStep] = useState<Step>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showMulticaixaConfirm, setShowMulticaixaConfirm] = useState(false);
  const [ibanCopied, setIbanCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { categories } = useCategories();
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const form = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      location: "",
      phone: "",
      email: user?.email || "",
      whatsapp: "",
      instagram: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (user?.email) {
      form.setValue("email", user.email);
    }
  }, [user, form]);

  const plans = [
    { id: 'weekly', label: 'Semanal', duration: '7 dias', price: Number(settings.plan_price_weekly) || 5000 },
    { id: 'monthly', label: 'Mensal', duration: '30 dias', price: Number(settings.plan_price_monthly) || 15000 },
    { id: 'quarterly', label: 'Trimestral', duration: '90 dias', price: Number(settings.plan_price_quarterly) || 35000 },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleDetailsSubmit = async (data: PartnerFormData) => {
    // Just move to plan selection step, don't insert yet
    setStep('plan');
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setStep('payment');
  };

  const handleOpenMulticaixaApp = () => {
    setShowMulticaixaConfirm(false);
    setStep('multicaixa_transfer');
  };

  const handleConfirmTransfer = async () => {
    if (!user || !selectedPlan) return;

    setIsSubmitting(true);
    const formData = form.getValues();
    const plan = plans.find(p => p.id === selectedPlan)!;

    try {
      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          phone: formData.phone,
          email: formData.email,
          whatsapp: formData.whatsapp || null,
          instagram: formData.instagram || null,
          status: 'approved',
          is_frozen: false,
          approved_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (partnerError) throw partnerError;

      await supabase.from('user_roles').insert({
        user_id: user.id,
        role: 'partner',
      });

      const startsAt = new Date();
      const expiresAt = new Date();
      if (selectedPlan === 'weekly') expiresAt.setDate(expiresAt.getDate() + 7);
      else if (selectedPlan === 'monthly') expiresAt.setDate(expiresAt.getDate() + 30);
      else expiresAt.setDate(expiresAt.getDate() + 90);

      const { error: subError } = await supabase
        .from('partner_subscriptions')
        .insert({
          partner_id: partnerData.id,
          plan_type: selectedPlan,
          amount: plan.price,
          payment_method: 'multicaixa',
          status: 'approved',
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          approved_at: new Date().toISOString(),
        });

      if (subError) throw subError;

      setSubmitted(true);
      toast({
        title: "✅ Pagamento confirmado!",
        description: "A sua loja foi ativada com sucesso. Pode começar a adicionar produtos!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao ativar loja",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!user || !selectedPlan || !paymentMethod) return;

    // Multicaixa Express — show confirmation dialog
    if (paymentMethod === 'multicaixa') {
      setShowMulticaixaConfirm(true);
      return;
    }

    setIsSubmitting(true);
    const formData = form.getValues();
    const plan = plans.find(p => p.id === selectedPlan)!;

    try {
      // Upload flow — pending admin approval
      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          phone: formData.phone,
          email: formData.email,
          whatsapp: formData.whatsapp || null,
          instagram: formData.instagram || null,
          status: 'pending',
          is_frozen: true,
        })
        .select('id')
        .single();

      if (partnerError) throw partnerError;

      let receiptUrl: string | null = null;
      if (receiptFile) {
        setUploading(true);
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${partnerData.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('payment-receipts')
          .upload(fileName, receiptFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('payment-receipts')
          .getPublicUrl(fileName);

        receiptUrl = urlData.publicUrl;
        setUploading(false);
      }

      const { error: subError } = await supabase
        .from('partner_subscriptions')
        .insert({
          partner_id: partnerData.id,
          plan_type: selectedPlan,
          amount: plan.price,
          payment_method: 'upload',
          receipt_url: receiptUrl,
          status: 'pending',
        });

      if (subError) throw subError;

      if (settings.admin_whatsapp) {
        const whatsappNumber = settings.admin_whatsapp.replace(/\D/g, '');
        const message = encodeURIComponent(
          `Olá! Sou ${formData.name}. Enviei o comprovativo de pagamento para o plano ${plan.label} (${formatPrice(plan.price)}) na plataforma ESSENZA E.J. Aguardo validação.`
        );
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
      }

      setSubmitted(true);
      toast({
        title: "Candidatura enviada!",
        description: "A sua candidatura e pagamento serão analisados pela administração.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar candidatura",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploading(false);
    }
  };

  const copyIban = () => {
    navigator.clipboard.writeText(settings.payment_iban);
    setIbanCopied(true);
    toast({ title: "IBAN copiado!" });
    setTimeout(() => setIbanCopied(false), 2000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const wasMulticaixa = paymentMethod === 'multicaixa';

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">
            {wasMulticaixa ? 'Loja Ativada com Sucesso!' : 'Candidatura Enviada!'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {wasMulticaixa
              ? 'O pagamento foi confirmado e a sua loja já está ativa! Aceda ao painel de parceiro para adicionar os seus produtos e serviços.'
              : 'A sua candidatura e comprovativo de pagamento foram recebidos. Após validação pela administração, a sua loja será ativada.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {wasMulticaixa && (
              <Button onClick={() => navigate("/painel-parceiro")} className="btn-gold">
                Ir para o Painel
              </Button>
            )}
            <Button onClick={() => navigate("/")} variant={wasMulticaixa ? "outline" : "default"} className={!wasMulticaixa ? "btn-gold" : ""}>
              Voltar à página inicial
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => {
            if (step === 'plan') setStep('details');
            else if (step === 'payment') setStep('plan');
            else if (step === 'multicaixa_transfer') setStep('payment');
            else navigate("/");
          }}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['details', 'plan', 'payment'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s ? 'bg-primary text-primary-foreground' : 
                (['details', 'plan', 'payment'].indexOf(step) > i) ? 'bg-primary/20 text-primary' : 
                'bg-muted text-muted-foreground'
              }`}>
                {i + 1}
              </div>
              {i < 2 && <div className={`w-8 h-0.5 ${(['details', 'plan', 'payment'].indexOf(step) > i) ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Details */}
        {step === 'details' && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Quero ser Parceiro
              </h1>
              <p className="text-muted-foreground">
                Preencha o formulário abaixo para candidatar o seu negócio
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleDetailsSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Negócio *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input placeholder="Ex: Sabores do Índico" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.name}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição do Negócio *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                            <Textarea 
                              placeholder="Descreva o seu negócio, produtos ou serviços..." 
                              className="pl-10 min-h-[120px]" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localização *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input placeholder="Ex: Talatona, Luanda" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input placeholder="+244 9XX XXX XXX" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input placeholder="negocio@email.com" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp (opcional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input placeholder="+244 9XX XXX XXX" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram (opcional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input placeholder="@seunegocio" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full btn-gold">
                    Continuar — Escolher Plano
                  </Button>
                </form>
              </Form>
            </div>
          </>
        )}

        {/* Step 2: Plan Selection */}
        {step === 'plan' && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Escolha o seu Plano
              </h1>
              <p className="text-muted-foreground">
                Selecione o plano que melhor se adapta ao seu negócio
              </p>
            </div>

            <div className="grid gap-4">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                    selectedPlan === plan.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-xl font-bold text-foreground">{plan.label}</h3>
                      <p className="text-sm text-muted-foreground">{plan.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl font-bold text-primary">{formatPrice(plan.price)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Step 3: Payment */}
        {step === 'payment' && selectedPlan && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Pagamento
              </h1>
              <p className="text-muted-foreground">
                Plano {plans.find(p => p.id === selectedPlan)?.label} — {formatPrice(plans.find(p => p.id === selectedPlan)?.price || 0)}
              </p>
            </div>

            {/* Payment IBAN info */}
            {settings.payment_iban && (
              <Card className="mb-6 border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-foreground mb-2">Dados para transferência:</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm text-muted-foreground select-all">IBAN: {settings.payment_iban}</p>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={copyIban}>
                      {ibanCopied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  {settings.payment_account_holder && (
                    <p className="text-sm text-muted-foreground">Titular: {settings.payment_account_holder}</p>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {/* Multicaixa Express */}
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  paymentMethod === 'multicaixa' ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                }`}
                onClick={() => setPaymentMethod('multicaixa')}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Multicaixa Express</h3>
                    <p className="text-sm text-muted-foreground">Pagamento direto — loja ativada automaticamente</p>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Receipt */}
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  paymentMethod === 'upload' ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                }`}
                onClick={() => setPaymentMethod('upload')}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Upload de Comprovativo</h3>
                    <p className="text-sm text-muted-foreground">Faça a transferência e envie o comprovativo (validação manual)</p>
                  </div>
                </CardContent>
              </Card>

              {/* Receipt upload input */}
              {paymentMethod === 'upload' && (
                <Card className="border-dashed">
                  <CardContent className="p-6">
                    <label className="flex flex-col items-center gap-3 cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {receiptFile ? receiptFile.name : 'Clique para selecionar o comprovativo'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </CardContent>
                </Card>
              )}

              <Button
                className="w-full btn-gold"
                disabled={!paymentMethod || (paymentMethod === 'upload' && !receiptFile) || isSubmitting || uploading}
                onClick={handleFinalSubmit}
              >
                {isSubmitting || uploading ? 'A processar...' : paymentMethod === 'multicaixa' ? 'Pagar com Multicaixa Express' : 'Enviar Candidatura'}
              </Button>
            </div>
          </>
        )}

        {/* Step 4: Multicaixa Transfer */}
        {step === 'multicaixa_transfer' && selectedPlan && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Faça a Transferência
              </h1>
              <p className="text-muted-foreground">
                Transfira o valor abaixo via Multicaixa Express e depois confirme
              </p>
            </div>

            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Valor a transferir</p>
                  <p className="text-3xl font-bold text-foreground">{formatPrice(plans.find(p => p.id === selectedPlan)?.price || 0)}</p>
                </div>
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">IBAN destino:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-foreground select-all">{settings.payment_iban}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={copyIban}>
                        {ibanCopied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                  {settings.payment_account_holder && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Titular:</span>
                      <span className="text-sm font-medium text-foreground">{settings.payment_account_holder}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Plano:</span>
                    <span className="text-sm font-medium text-foreground">{plans.find(p => p.id === selectedPlan)?.label} ({plans.find(p => p.id === selectedPlan)?.duration})</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                className="w-full btn-gold"
                disabled={isSubmitting}
                onClick={handleConfirmTransfer}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                    A ativar a sua loja...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Já fiz a transferência
                  </span>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Ao confirmar, declara que efetuou a transferência do valor indicado via Multicaixa Express.
              </p>
            </div>
          </>
        )}

        {/* Multicaixa Express Confirmation Dialog */}
        <Dialog open={showMulticaixaConfirm} onOpenChange={setShowMulticaixaConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pagamento via Multicaixa Express</DialogTitle>
              <DialogDescription>
                Será redirecionado para efetuar a transferência de <strong>{formatPrice(plans.find(p => p.id === selectedPlan)?.price || 0)}</strong> para 
                o IBAN da ESSENZA E.J via Multicaixa Express.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Valor</p>
                <p className="text-2xl font-bold text-foreground">{formatPrice(plans.find(p => p.id === selectedPlan)?.price || 0)}</p>
              </div>
              {settings.payment_iban && (
                <p className="text-xs text-center text-muted-foreground">IBAN: {settings.payment_iban}</p>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowMulticaixaConfirm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleOpenMulticaixaApp} className="btn-gold">
                Prosseguir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BecomePartner;
