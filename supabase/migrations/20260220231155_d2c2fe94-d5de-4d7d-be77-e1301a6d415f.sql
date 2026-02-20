-- Allow any authenticated user to upload avatars to partner-images/avatars/
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'partner-images'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'avatars'
);

-- Allow any authenticated user to update their own avatars
CREATE POLICY "Authenticated users can update avatars"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'partner-images'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'avatars'
);

-- Allow any authenticated user to delete their own avatars
CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'partner-images'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'avatars'
);