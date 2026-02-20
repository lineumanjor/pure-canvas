import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save, Link2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface SiteSettings {
  admin_whatsapp: string;
  admin_instagram: string;
  admin_email: string;
  admin_name: string;
  site_name: string;
  commission_rate: string;
}

const AdminSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>({
    admin_whatsapp: '',
    admin_instagram: '',
    admin_email: '',
    admin_name: '',
    site_name: '',
    commission_rate: '10',
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Nome do Site</Label>
              <Input
                id="site_name"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                placeholder="ESSENZA E.J"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission_rate">Taxa de Comissão (%)</Label>
              <Input
                id="commission_rate"
                type="number"
                min="0"
                max="100"
                value={settings.commission_rate}
                onChange={(e) => setSettings({ ...settings, commission_rate: e.target.value })}
                placeholder="10"
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
