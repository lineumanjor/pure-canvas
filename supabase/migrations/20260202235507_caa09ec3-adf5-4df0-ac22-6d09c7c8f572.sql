-- Create conversations table
CREATE TABLE public.conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'partner')),
    content TEXT NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX idx_conversations_partner_id ON public.conversations(partner_id);
CREATE INDEX idx_conversations_last_message ON public.conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Clients can view their own conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Partners can view their conversations"
ON public.conversations FOR SELECT
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

CREATE POLICY "Clients can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Participants can update conversation"
ON public.conversations FOR UPDATE
USING (
    auth.uid() = client_id OR 
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
);

-- RLS Policies for messages
CREATE POLICY "Conversation participants can view messages"
ON public.messages FOR SELECT
USING (
    conversation_id IN (
        SELECT id FROM public.conversations 
        WHERE client_id = auth.uid() 
        OR partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Conversation participants can send messages"
ON public.messages FOR INSERT
WITH CHECK (
    conversation_id IN (
        SELECT id FROM public.conversations 
        WHERE client_id = auth.uid() 
        OR partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
    )
    AND sender_id = auth.uid()
);

CREATE POLICY "Participants can update messages (mark as read)"
ON public.messages FOR UPDATE
USING (
    conversation_id IN (
        SELECT id FROM public.conversations 
        WHERE client_id = auth.uid() 
        OR partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
    )
);

-- Trigger to update conversation's last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET last_message_at = NEW.created_at, updated_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_last_message();

-- Trigger for updated_at on conversations
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;