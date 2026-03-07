
-- Function to decrement stock when order items are inserted
CREATE OR REPLACE FUNCTION public.decrement_product_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only decrement if product has stock tracking enabled (stock is not null)
  UPDATE public.products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id
    AND stock IS NOT NULL;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-decrement stock after order item insertion
CREATE TRIGGER trigger_decrement_stock
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_product_stock();

-- Function to validate stock availability before order item insertion
CREATE OR REPLACE FUNCTION public.validate_stock_availability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  available_stock integer;
  product_name text;
BEGIN
  SELECT stock, name INTO available_stock, product_name
  FROM public.products
  WHERE id = NEW.product_id;
  
  -- If stock tracking is enabled and not enough stock
  IF available_stock IS NOT NULL AND NEW.quantity > available_stock THEN
    RAISE EXCEPTION 'Stock insuficiente para "%". Disponível: %, Pedido: %', 
      product_name, available_stock, NEW.quantity;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to validate stock BEFORE insertion
CREATE TRIGGER trigger_validate_stock
  BEFORE INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_stock_availability();
