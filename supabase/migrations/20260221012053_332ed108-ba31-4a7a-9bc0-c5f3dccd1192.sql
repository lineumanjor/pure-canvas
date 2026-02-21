
-- Add gender and delivery_address to profiles
ALTER TABLE public.profiles ADD COLUMN gender text;
ALTER TABLE public.profiles ADD COLUMN delivery_address text;
