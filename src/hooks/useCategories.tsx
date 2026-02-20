import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type CategoryType = 'product' | 'service';

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  display_order: number;
  type: CategoryType;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setCategories(data as Category[]);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const productCategories = categories.filter(c => c.type === 'product');
  const serviceCategories = categories.filter(c => c.type === 'service');

  return { categories, productCategories, serviceCategories, loading, error };
};

// Helper function to check if a category is a service
export const isServiceCategory = (categoryName: string, categories: Category[]): boolean => {
  const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
  return category?.type === 'service';
};
