-- Create storage buckets for product and partner images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('partner-images', 'partner-images', true);

-- RLS policies for product-images bucket
-- Anyone can view product images (public bucket)
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Partners can upload product images to their folder
CREATE POLICY "Partners can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid() IS NOT NULL
  AND (
    public.has_role(auth.uid(), 'partner'::public.app_role) 
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

-- Partners can update their own product images
CREATE POLICY "Partners can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND auth.uid() IS NOT NULL
  AND (
    public.has_role(auth.uid(), 'partner'::public.app_role) 
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

-- Partners can delete their own product images
CREATE POLICY "Partners can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.uid() IS NOT NULL
  AND (
    public.has_role(auth.uid(), 'partner'::public.app_role) 
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

-- RLS policies for partner-images bucket
-- Anyone can view partner images (public bucket)
CREATE POLICY "Partner images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'partner-images');

-- Partners can upload their own store images
CREATE POLICY "Partners can upload partner images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'partner-images' 
  AND auth.uid() IS NOT NULL
  AND (
    public.has_role(auth.uid(), 'partner'::public.app_role) 
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

-- Partners can update their own store images
CREATE POLICY "Partners can update partner images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'partner-images' 
  AND auth.uid() IS NOT NULL
  AND (
    public.has_role(auth.uid(), 'partner'::public.app_role) 
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

-- Partners can delete their own store images
CREATE POLICY "Partners can delete partner images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'partner-images' 
  AND auth.uid() IS NOT NULL
  AND (
    public.has_role(auth.uid(), 'partner'::public.app_role) 
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);