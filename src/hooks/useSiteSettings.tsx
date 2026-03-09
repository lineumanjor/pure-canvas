import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    admin_whatsapp: '+244 955 638 120',
    admin_instagram: '@eunicejoaquim51',
    admin_email: 'eunicejoaquim467@icloud.com',
    admin_name: 'Eunice Joaquim',
    site_name: 'ESSENZA E.J',
    plan_price_weekly: '5000',
    plan_price_monthly: '15000',
    plan_price_quarterly: '35000',
    payment_iban: '',
    payment_account_holder: '',
  });
  const [loading, setLoading] = useState(true);

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

  return { settings, loading };
};
