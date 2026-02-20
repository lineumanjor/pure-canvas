import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BlogPost {
  id: string;
  title: string | null;
  content: string;
  image_url: string | null;
  published_at: string;
  expires_at: string | null;
  is_active: boolean;
  views_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts:', error);
      toast.error('Erro ao carregar avisos');
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const createPost = async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'views_count'>) => {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(post)
      .select()
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      toast.error('Erro ao criar publicação');
      return null;
    }

    toast.success('Publicação criada com sucesso!');
    fetchPosts();
    return data;
  };

  const updatePost = async (id: string, updates: Partial<BlogPost>) => {
    const { error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating blog post:', error);
      toast.error('Erro ao actualizar publicação');
      return false;
    }

    toast.success('Publicação actualizada!');
    fetchPosts();
    return true;
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blog post:', error);
      toast.error('Erro ao eliminar publicação');
      return false;
    }

    toast.success('Publicação eliminada!');
    fetchPosts();
    return true;
  };

  const incrementViews = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (post) {
      await supabase
        .from('blog_posts')
        .update({ views_count: post.views_count + 1 })
        .eq('id', id);
    }
  };

  return {
    posts,
    loading,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    incrementViews,
  };
};
