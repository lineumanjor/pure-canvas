
-- Table for direct admin-partner messages
CREATE TABLE public.admin_partner_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'partner')),
  content TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_partner_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all admin-partner messages"
ON public.admin_partner_messages FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Partners can view their own messages"
ON public.admin_partner_messages FOR SELECT
USING (partner_id = get_user_partner_id(auth.uid()));

CREATE POLICY "Partners can send messages"
ON public.admin_partner_messages FOR INSERT
WITH CHECK (
  partner_id = get_user_partner_id(auth.uid())
  AND sender_id = auth.uid()
  AND sender_type = 'partner'
);

CREATE POLICY "Partners can update their messages (mark read)"
ON public.admin_partner_messages FOR UPDATE
USING (partner_id = get_user_partner_id(auth.uid()));

CREATE INDEX idx_admin_partner_messages_partner ON public.admin_partner_messages(partner_id, created_at DESC);

-- Table for video conferences
CREATE TABLE public.video_conferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  room_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.video_conferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all video conferences"
ON public.video_conferences FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Partners can view their video conferences"
ON public.video_conferences FOR SELECT
USING (partner_id = get_user_partner_id(auth.uid()));

CREATE POLICY "Partners can update their video conferences"
ON public.video_conferences FOR UPDATE
USING (partner_id = get_user_partner_id(auth.uid()));

CREATE INDEX idx_video_conferences_partner ON public.video_conferences(partner_id, scheduled_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_video_conferences_updated_at
BEFORE UPDATE ON public.video_conferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
