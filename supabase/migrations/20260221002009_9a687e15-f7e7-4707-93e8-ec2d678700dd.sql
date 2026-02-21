
-- Function to notify when a partner is approved
CREATE OR REPLACE FUNCTION public.notify_partner_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only trigger when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    PERFORM net.http_post(
      url := 'https://gsqnazdksbgtomrhwrkn.supabase.co/functions/v1/send-notification-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcW5hemRrc2JndG9tcmh3cmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjE0NzksImV4cCI6MjA4NjgzNzQ3OX0.grev-zqjrr1qtpPSaB5Vo55paMIKrQhtkT1FJ6unYe0'
      ),
      body := jsonb_build_object(
        'type', 'partner_approved',
        'record', jsonb_build_object(
          'name', NEW.name,
          'description', NEW.description,
          'category', NEW.category,
          'location', NEW.location,
          'image_url', NEW.image_url
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Function to notify when a product is created
CREATE OR REPLACE FUNCTION public.notify_product_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://gsqnazdksbgtomrhwrkn.supabase.co/functions/v1/send-notification-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcW5hemRrc2JndG9tcmh3cmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjE0NzksImV4cCI6MjA4NjgzNzQ3OX0.grev-zqjrr1qtpPSaB5Vo55paMIKrQhtkT1FJ6unYe0'
    ),
    body := jsonb_build_object(
      'type', 'product_created',
      'record', jsonb_build_object(
        'name', NEW.name,
        'description', NEW.description,
        'price', NEW.price,
        'category', NEW.category,
        'partner_id', NEW.partner_id,
        'image_url', NEW.image_url
      )
    )
  );
  RETURN NEW;
END;
$$;

-- Enable pg_net extension (for HTTP calls from triggers)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Trigger: when partner status changes to approved
CREATE TRIGGER on_partner_approved
  AFTER UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_partner_approved();

-- Trigger: when a new product is inserted
CREATE TRIGGER on_product_created
  AFTER INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_product_created();
