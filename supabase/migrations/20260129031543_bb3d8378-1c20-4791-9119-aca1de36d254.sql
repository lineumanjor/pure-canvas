-- Create reviews table for partners and products
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT review_target_check CHECK (
        (partner_id IS NOT NULL AND product_id IS NULL) OR 
        (partner_id IS NULL AND product_id IS NOT NULL)
    )
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING (true);

-- Users can create reviews for orders they made
CREATE POLICY "Users can create reviews for their orders"
ON public.reviews FOR INSERT
WITH CHECK (
    user_id = auth.uid() AND
    (order_id IS NULL OR EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_id AND orders.client_id = auth.uid()
    ))
);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
ON public.reviews FOR UPDATE
USING (user_id = auth.uid());

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
ON public.reviews FOR DELETE
USING (user_id = auth.uid());

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews"
ON public.reviews FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update partner rating
CREATE OR REPLACE FUNCTION public.update_partner_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_partner_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_partner_id := OLD.partner_id;
    ELSE
        target_partner_id := NEW.partner_id;
    END IF;
    
    IF target_partner_id IS NOT NULL THEN
        UPDATE public.partners
        SET rating = COALESCE((
            SELECT AVG(rating)::numeric(3,1)
            FROM public.reviews
            WHERE partner_id = target_partner_id
        ), 0),
        reviews_count = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE partner_id = target_partner_id
        )
        WHERE id = target_partner_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Create trigger to auto-update partner ratings
CREATE TRIGGER update_partner_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_partner_rating();