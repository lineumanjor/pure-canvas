import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Store, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ImageUpload } from "@/components/ui/image-upload";

interface PartnerProfileProps {
  partnerId: string;
}

interface PartnerForm {
  name: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
  image_url: string;
}

const PartnerProfile = ({ partnerId }: PartnerProfileProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PartnerForm>({
    name: "",
    description: "",
    location: "",
    phone: "",
    email: "",
    whatsapp: "",
    instagram: "",
    image_url: "",
  });

  const { data: partner, isLoading } = useQuery({
    queryKey: ["partner-profile", partnerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("id", partnerId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (partner) {
      setForm({
        name: partner.name || "",
        description: partner.description || "",
        location: partner.location || "",
        phone: partner.phone || "",
        email: partner.email || "",
        whatsapp: partner.whatsapp || "",
        instagram: partner.instagram || "",
        image_url: partner.image_url || "",
      });
    }
  }, [partner]);

  const updateMutation = useMutation({
    mutationFn: async (data: PartnerForm) => {
      const { error } = await supabase
        .from("partners")
        .update({
          name: data.name,
          description: data.description || null,
          location: data.location,
          phone: data.phone || null,
          email: data.email || null,
          whatsapp: data.whatsapp || null,
          instagram: data.instagram || null,
          image_url: data.image_url || null,
        })
        .eq("id", partnerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-profile", partnerId] });
      toast({ title: "Perfil atualizado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar perfil", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.location) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    updateMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">
          Perfil da Loja
        </h2>
        <p className="text-sm text-muted-foreground">
          Atualize as informações da sua loja
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Store className="w-5 h-5 text-primary" />
            Informações da Loja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Loja *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nome da sua loja"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Localização *</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Ex: Talatona, Luanda"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descreva a sua loja e o que oferece..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Logo/Imagem da Loja</Label>
              <ImageUpload
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                bucket="partner-images"
                folder={partnerId}
                aspectRatio="square"
                className="max-w-[200px]"
              />
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-medium text-foreground mb-4">Contactos</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+244 9XX XXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="loja@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    placeholder="+244 9XX XXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={form.instagram}
                    onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                    placeholder="@sualojaoficial"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
                <Save className="w-4 h-4" />
                {updateMutation.isPending ? "A guardar..." : "Guardar Alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Store Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações Adicionais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">Categoria</p>
              <p className="font-medium text-foreground">{partner?.category || "-"}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">Raio de Entrega</p>
              <p className="font-medium text-foreground">{partner?.delivery_radius_km || 10} km</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">Comissão</p>
              <p className="font-medium text-foreground">{partner?.commission_rate || 10}%</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * Para alterar categoria, raio de entrega ou comissão, entre em contacto com o suporte.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PartnerProfile;
