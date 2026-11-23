-- Supabase Schema for Crowd Help (F7) & Notifications

-- 1. Help Requests Table
CREATE TABLE IF NOT EXISTS public.help_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    requester_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('medicine', 'blood', 'oxygen', 'transport', 'medical_advice', 'other')),
    message TEXT NOT NULL,
    urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    city TEXT NOT NULL DEFAULT 'Indore',
    approx_area TEXT NOT NULL DEFAULT 'Indore Central (within 500m)',
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'helper_found', 'resolved', 'cancelled')),
    helper_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    helper_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Help Messages Table (Thread between requester & accepted helper)
CREATE TABLE IF NOT EXISTS public.help_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.help_requests(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. In-App Realtime Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Anyone logged in can view open help requests (with approximate area)
CREATE POLICY "Public can view open requests"
ON public.help_requests FOR SELECT
USING (true);

-- Authenticated users can insert help requests
CREATE POLICY "Users can create help requests"
ON public.help_requests FOR INSERT
WITH CHECK (auth.uid() = requester_id);

-- Requesters and accepted helpers can update requests
CREATE POLICY "Requesters and helpers can update requests"
ON public.help_requests FOR UPDATE
USING (auth.uid() = requester_id OR auth.uid() = helper_id OR status = 'open');

-- Messages visible to participants in the request
CREATE POLICY "Participants can view messages"
ON public.help_messages FOR SELECT
USING (true);

CREATE POLICY "Participants can insert messages"
ON public.help_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Notifications visible only to the recipient user
CREATE POLICY "Users see own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- Enable Supabase Realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.help_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.help_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
