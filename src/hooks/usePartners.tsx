import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Partner {
  id: string;
  name: string;
  description: string | null;
  category: string;
  location: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  instagram: string | null;
  image_url: string | null;
  rating: number;
  reviews_count: number;
  status: 'pending' | 'approved' | 'rejected';
  is_top: boolean;
}

export const usePartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartners = async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('status', 'approved')
        .order('rating', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setPartners(data as Partner[]);
      }
      setLoading(false);
    };

    fetchPartners();
  }, []);

  return { partners, loading, error };
};
