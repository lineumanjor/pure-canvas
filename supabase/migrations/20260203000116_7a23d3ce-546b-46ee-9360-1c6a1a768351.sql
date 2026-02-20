-- Add admin as a valid sender_type in messages
ALTER TABLE public.messages DROP CONSTRAINT messages_sender_type_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_sender_type_check 
  CHECK (sender_type IN ('client', 'partner', 'admin'));

-- Add RLS policies for admin to view and manage all conversations
CREATE POLICY "Admins can view all conversations"
ON public.conversations FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all conversations"
ON public.conversations FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policies for admin to view and send messages in any conversation
CREATE POLICY "Admins can view all messages"
ON public.messages FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can send messages in any conversation"
ON public.messages FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND sender_id = auth.uid() 
  AND sender_type = 'admin'
);