
-- Add video_url, audio_url, featured columns to blog_posts
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS audio_url text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

-- Create blog_comments table
CREATE TABLE public.blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.blog_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.blog_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own comments" ON public.blog_comments FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own comments" ON public.blog_comments FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all comments" ON public.blog_comments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create blog_reactions table
CREATE TABLE public.blog_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction text NOT NULL DEFAULT 'like',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, reaction)
);

ALTER TABLE public.blog_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions" ON public.blog_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add reactions" ON public.blog_reactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can remove their own reactions" ON public.blog_reactions FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all reactions" ON public.blog_reactions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a storage bucket for blog media (video/audio)
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-media', 'blog-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for blog-media bucket
CREATE POLICY "Anyone can view blog media" ON storage.objects FOR SELECT USING (bucket_id = 'blog-media');
CREATE POLICY "Admins can upload blog media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-media' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete blog media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blog-media' AND has_role(auth.uid(), 'admin'::app_role));
