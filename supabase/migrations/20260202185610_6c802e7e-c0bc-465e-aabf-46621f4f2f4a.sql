-- Create enum for category types
CREATE TYPE public.category_type AS ENUM ('product', 'service');

-- Add type column to categories table
ALTER TABLE public.categories 
ADD COLUMN type public.category_type NOT NULL DEFAULT 'product';

-- Create service_requests table for quote/service requests
CREATE TABLE public.service_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    service_description TEXT,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    preferred_date DATE,
    preferred_time TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Clients can create service requests
CREATE POLICY "Clients can create service requests"
ON public.service_requests
FOR INSERT
WITH CHECK (client_id = auth.uid());

-- Clients can view their own requests
CREATE POLICY "Clients can view their own service requests"
ON public.service_requests
FOR SELECT
USING (client_id = auth.uid());

-- Partners can view requests for their store
CREATE POLICY "Partners can view service requests for their store"
ON public.service_requests
FOR SELECT
USING (partner_id = get_user_partner_id(auth.uid()));

-- Partners can update requests for their store
CREATE POLICY "Partners can update service requests for their store"
ON public.service_requests
FOR UPDATE
USING (partner_id = get_user_partner_id(auth.uid()));

-- Admins can manage all service requests
CREATE POLICY "Admins can manage all service requests"
ON public.service_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_service_requests_updated_at
BEFORE UPDATE ON public.service_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add stock column to products for physical products
ALTER TABLE public.products
ADD COLUMN stock INTEGER DEFAULT NULL;

-- Update categories with correct types based on user requirements
-- Products: Fast-food, Moda, Eletrônicos, Casa & Decoração - Produtos
-- Services: Beleza, Casa & Decoração - Serviços, Serviços