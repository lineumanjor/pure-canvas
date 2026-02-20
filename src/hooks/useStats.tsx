import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformStats {
  partnersCount: number;
  productsCount: number;
  clientsCount: number;
}

export const useStats = () => {
  const [stats, setStats] = useState<PlatformStats>({
    partnersCount: 0,
    productsCount: 0,
    clientsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch approved partners count
      const { count: partnersCount } = await supabase
        .from('partners')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Fetch products count from approved partners
      const { data: approvedPartners } = await supabase
        .from('partners')
        .select('id')
        .eq('status', 'approved');

      let productsCount = 0;
      if (approvedPartners && approvedPartners.length > 0) {
        const partnerIds = approvedPartners.map(p => p.id);
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .in('partner_id', partnerIds);
        productsCount = count || 0;
      }

      // Fetch clients count (profiles)
      const { count: clientsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setStats({
        partnersCount: partnersCount || 0,
        productsCount: productsCount,
        clientsCount: clientsCount || 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  return { stats, loading };
};
