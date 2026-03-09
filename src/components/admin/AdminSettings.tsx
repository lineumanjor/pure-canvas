import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save, Link2, Copy, Check, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface SiteSettings {
  admin_whatsapp: string;
  admin_instagram: string;
  admin_email: string;
  admin_name: string;
  site_name: string;
  plan_price_weekly: string;
  plan_price_monthly: string;
  plan_price_quarterly: string;
  payment_iban: string;
  payment_account_holder: string;
}

const AdminSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>({
    admin_whatsapp: '',
    admin_instagram: '',
    admin_email: '',
    admin_name: '',
    site_name: '',
    plan_price_weekly: '5000',
    plan_price_monthly: '15000',
    plan_price_quarterly: '35000',
    payment_iban: '',
    payment_account_holder: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const adminLink = `${window.location.origin}/painel-admin-essenza`;

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');

      if (!error && data) {
        const settingsMap = data.reduce((acc, item) => {
          acc[item.key as keyof SiteSettings] = item.value || '';
          return acc;
        }, {} as SiteSettings);
        
        setSettings(prev => ({ ...prev, ...settingsMap }));
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      updated_by: user?.id,
      updated_at: new Date().toISOString(),
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('site_settings')
        .upsert(update, { onConflict: 'key' });

      if (error) {
        console.error('Error updating setting:', update.key, error);
        toast.error(`Erro ao guardar ${update.key}`);
        setSaving(false);
        return;
      }
    }

    toast.success('Configurações guardadas com sucesso!');
    setSaving(false);
  };

  const copyAdminLink = () => {
    navigator.clipboard.writeText(adminLink);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-primary">A carregar configurações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Link Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Link Secreto do Painel
          </CardTitle>
          <CardDescription>
            Guarde este link em local seguro. Apenas administradores autenticados podem aceder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              value={adminLink}
              readOnly
              className="font-mono text-sm bg-background"
            />
            <Button onClick={copyAdminLink} variant="outline" size="icon">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Site Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Site
          </CardTitle>
          <CardDescription>
            Informações gerais da plataforma ESSENZA E.J
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="site_name">Nome do Site</Label>
            <Input
              id="site_name"
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              placeholder="ESSENZA E.J"
            />
          </div>
        </CardContent>
      </Card>

      {/* Plan Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Preços dos Planos
          </CardTitle>
          <CardDescription>
            Defina os valores dos planos de subscrição para parceiros (em AOA)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan_price_weekly">Plano Semanal (AOA)</Label>
              <Input
                id="plan_price_weekly"
                type="number"
                min="0"
                value={settings.plan_price_weekly}
                onChange={(e) => setSettings({ ...settings, plan_price_weekly: e.target.value })}
                placeholder="5000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan_price_monthly">Plano Mensal (AOA)</Label>
              <Input
                id="plan_price_monthly"
                type="number"
                min="0"
                value={settings.plan_price_monthly}
                onChange={(e) => setSettings({ ...settings, plan_price_monthly: e.target.value })}
                placeholder="15000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan_price_quarterly">Plano Trimestral (AOA)</Label>
              <Input
                id="plan_price_quarterly"
                type="number"
                min="0"
                value={settings.plan_price_quarterly}
                onChange={(e) => setSettings({ ...settings, plan_price_quarterly: e.target.value })}
                placeholder="35000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_iban">IBAN Bancário</Label>
              <Input
                id="payment_iban"
                value={settings.payment_iban}
                onChange={(e) => setSettings({ ...settings, payment_iban: e.target.value })}
                placeholder="AO06 0000 0000 0000 0000 0000 0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_account_holder">Titular da Conta</Label>
              <Input
                id="payment_account_holder"
                value={settings.payment_account_holder}
                onChange={(e) => setSettings({ ...settings, payment_account_holder: e.target.value })}
                placeholder="Eunice Joaquim"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Contacto do Administrador</CardTitle>
          <CardDescription>
            Estas informações serão exibidas no site para contacto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="admin_name">Nome do Administrador</Label>
              <Input
                id="admin_name"
                value={settings.admin_name}
                onChange={(e) => setSettings({ ...settings, admin_name: e.target.value })}
                placeholder="Eunice Joaquim"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_email">Email</Label>
              <Input
                id="admin_email"
                type="email"
                value={settings.admin_email}
                onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_whatsapp">WhatsApp</Label>
              <Input
                id="admin_whatsapp"
                value={settings.admin_whatsapp}
                onChange={(e) => setSettings({ ...settings, admin_whatsapp: e.target.value })}
                placeholder="+244 9XX XXX XXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_instagram">Instagram</Label>
              <Input
                id="admin_instagram"
                value={settings.admin_instagram}
                onChange={(e) => setSettings({ ...settings, admin_instagram: e.target.value })}
                placeholder="@utilizador"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'A guardar...' : 'Guardar Configurações'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
