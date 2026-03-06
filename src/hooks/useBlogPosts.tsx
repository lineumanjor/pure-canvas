import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BlogPost {
  id: string;
  title: string | null;
  content: string;
  image_url: string | null;
  video_url: string | null;
  audio_url: string | null;
  featured: boolean;
  published_at: string;
  expires_at: string | null;
  is_active: boolean;
  views_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: { full_name: string | null; avatar_url: string | null };
}

export interface BlogReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
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
      setPosts((data as BlogPost[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const createPost = async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'views_count'>) => {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(post as any)
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
      .update(updates as any)
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

export const useBlogComments = (postId: string) => {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_comments' as any)
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      // Fetch profiles for each comment
      const commentsData = (data || []) as unknown as BlogComment[];
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);
        
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        commentsData.forEach(c => {
          const p = profileMap.get(c.user_id);
          if (p) c.profile = { full_name: p.full_name, avatar_url: p.avatar_url };
        });
      }
      
      setComments(commentsData);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  const addComment = async (userId: string, content: string) => {
    const { error } = await supabase
      .from('blog_comments' as any)
      .insert({ post_id: postId, user_id: userId, content } as any);

    if (error) {
      toast.error('Erro ao adicionar comentário');
      return false;
    }
    fetchComments();
    return true;
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('blog_comments' as any)
      .delete()
      .eq('id', commentId);

    if (error) {
      toast.error('Erro ao eliminar comentário');
      return false;
    }
    fetchComments();
    return true;
  };

  return { comments, loading, addComment, deleteComment, fetchComments };
};

export const useBlogReactions = (postId: string) => {
  const [reactions, setReactions] = useState<BlogReaction[]>([]);

  const fetchReactions = async () => {
    const { data } = await supabase
      .from('blog_reactions' as any)
      .select('*')
      .eq('post_id', postId);
    setReactions((data || []) as unknown as BlogReaction[]);
  };

  useEffect(() => {
    if (postId) fetchReactions();
  }, [postId]);

  const toggleReaction = async (userId: string, reaction: string) => {
    const existing = reactions.find(r => r.user_id === userId && r.reaction === reaction);
    
    if (existing) {
      await supabase
        .from('blog_reactions' as any)
        .delete()
        .eq('id', existing.id);
    } else {
      await supabase
        .from('blog_reactions' as any)
        .insert({ post_id: postId, user_id: userId, reaction } as any);
    }
    fetchReactions();
  };

  const getReactionCount = (reaction: string) => reactions.filter(r => r.reaction === reaction).length;
  const hasReacted = (userId: string, reaction: string) => reactions.some(r => r.user_id === userId && r.reaction === reaction);

  return { reactions, toggleReaction, getReactionCount, hasReacted, fetchReactions };
};
