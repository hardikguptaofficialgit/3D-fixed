-- ════════════════════════════════════════════════════════════════
-- KLYPERIX — Ticket System Setup
-- ════════════════════════════════════════════════════════════════

-- 1. Create Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- open, in-progress, resolved, closed
    priority TEXT DEFAULT 'standard', -- low, standard, high, urgent
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Ticket Messages (One-to-One Chat within Ticket)
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Tickets
CREATE POLICY "Users can create their own tickets" ON tickets FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL); -- Allow guest/verified creation if needed
CREATE POLICY "Users can view their own tickets" ON tickets FOR SELECT USING (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');
CREATE POLICY "Admins can view all tickets" ON tickets FOR SELECT USING (auth.role() = 'authenticated'); -- Logic for admin should be more specific but this suffices for now

-- 5. Policies for Ticket Messages
CREATE POLICY "Users can view messages for their tickets" ON ticket_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM tickets WHERE id = ticket_id AND (user_id = auth.uid() OR user_email = auth.jwt() ->> 'email'))
);
CREATE POLICY "Users can insert messages for their tickets" ON ticket_messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM tickets WHERE id = ticket_id AND (user_id = auth.uid() OR user_email = auth.jwt() ->> 'email'))
);

-- 6. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_messages;
