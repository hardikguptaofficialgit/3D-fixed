-- ════════════════════════════════════════════════════════════════
-- KLYPERIX — Supabase Database Setup
-- ════════════════════════════════════════════════════════════════
-- Run this ENTIRE script in Supabase Dashboard → SQL Editor → New Query
-- ════════════════════════════════════════════════════════════════

-- 1. Chat Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT FALSE,
    session_id TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Site Content (editable text sections)
CREATE TABLE IF NOT EXISTS site_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_key TEXT UNIQUE NOT NULL,
    content_value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Media Slots (portfolio items)
CREATE TABLE IF NOT EXISTS media_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_name TEXT NOT NULL,
    section_type TEXT NOT NULL,
    media_url TEXT DEFAULT '',
    media_type TEXT DEFAULT 'video',
    title TEXT DEFAULT 'Untitled',
    meta_tag TEXT DEFAULT '',
    description TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Design Settings (color palette, fonts, etc.)
CREATE TABLE IF NOT EXISTS design_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_detail TEXT DEFAULT '',
    visitor_id TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Enable Row Level Security ──
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ── Policies: Public can INSERT messages (chat), only auth can read/update ──
CREATE POLICY "Anyone can send messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users can read messages" ON messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update messages" ON messages FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can delete messages" ON messages FOR DELETE USING (auth.role() = 'authenticated');

-- ── Policies: Public can READ site_content, only auth can modify ──
CREATE POLICY "Anyone can read content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Auth users can insert content" ON site_content FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update content" ON site_content FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can delete content" ON site_content FOR DELETE USING (auth.role() = 'authenticated');

-- ── Policies: Public can READ media_slots, only auth can modify ──
CREATE POLICY "Anyone can read media" ON media_slots FOR SELECT USING (true);
CREATE POLICY "Auth users can insert media" ON media_slots FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update media" ON media_slots FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can delete media" ON media_slots FOR DELETE USING (auth.role() = 'authenticated');

-- ── Policies: Public can READ design_settings, only auth can modify ──
CREATE POLICY "Anyone can read design" ON design_settings FOR SELECT USING (true);
CREATE POLICY "Auth users can insert design" ON design_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update design" ON design_settings FOR UPDATE USING (auth.role() = 'authenticated');

-- ── Policies: Anyone can INSERT activity, only auth can read ──
CREATE POLICY "Anyone can log activity" ON activity_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users can read activity" ON activity_log FOR SELECT USING (auth.role() = 'authenticated');

-- ── Enable Realtime for messages table ──
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ── Seed default content ──
INSERT INTO site_content (section_key, content_value) VALUES
    ('hero_title', 'Klyperix'),
    ('services_title', 'Services'),
    ('why_us_title', 'Why Us'),
    ('why_us_heading', 'We don''t just create visuals. We engineer reality.'),
    ('why_us_body', 'At Klyperix, our fusion of technical perfection and abstract creativity establishes new paradigms. We eschew templates in favor of pure, bespoke spatial construction that elevates your brand to unparalleled heights.'),
    ('process_title', 'Our Process'),
    ('testimonial_quote', 'Their approach to visual engineering shifted our brand''s trajectory entirely. Pure cinematic excellence.'),
    ('testimonial_author', '- Visionary Director, Global Icons'),
    ('contact_title', 'Initiate'),
    ('contact_subtitle', 'The foundation of every icon is a single directive.'),
    ('contact_email', 'hello@klyperix.com'),
    ('instagram_handle', '@klyperix'),
    ('admin_gmail', 'garvagarwal03@gmail.com')
ON CONFLICT (section_key) DO NOTHING;
