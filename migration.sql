-- Heropage migration.sql
-- Apply this in your NEW Supabase project's SQL editor.
-- Combines legacy schema + adds bot settings for Groq.

-- 1) Core tables
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

CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT UNIQUE NOT NULL,
  content_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS design_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_detail TEXT DEFAULT '',
  visitor_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Dynamic Collections (Services, Testimonials, Clients, Social)
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_svg TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT,
  stars INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_logos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_svg TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3) Bot settings (admin-editable)
CREATE TABLE IF NOT EXISTS bot_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4) Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- 5) Policies

-- Services (Public read, Authenticated write)
DROP POLICY IF EXISTS "Public read services" ON services;
DROP POLICY IF EXISTS "Admin write services" ON services;
CREATE POLICY "Public read services" ON services FOR SELECT USING (true);
CREATE POLICY "Admin write services" ON services FOR ALL USING (auth.role() = 'authenticated');

-- Testimonials (Public read, Authenticated write)
DROP POLICY IF EXISTS "Public read testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admin write testimonials" ON testimonials;
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Admin write testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');

-- Clients (Public read, Authenticated write)
DROP POLICY IF EXISTS "Public read clients" ON client_logos;
DROP POLICY IF EXISTS "Admin write clients" ON client_logos;
CREATE POLICY "Public read clients" ON client_logos FOR SELECT USING (true);
CREATE POLICY "Admin write clients" ON client_logos FOR ALL USING (auth.role() = 'authenticated');

-- Social (Public read, Authenticated write)
DROP POLICY IF EXISTS "Public read social" ON social_links;
DROP POLICY IF EXISTS "Admin write social" ON social_links;
CREATE POLICY "Public read social" ON social_links FOR SELECT USING (true);
CREATE POLICY "Admin write social" ON social_links FOR ALL USING (auth.role() = 'authenticated');

-- messages
DROP POLICY IF EXISTS "Anyone can send messages" ON messages;
DROP POLICY IF EXISTS "Auth users can read messages" ON messages;
DROP POLICY IF EXISTS "Auth users can update messages" ON messages;
DROP POLICY IF EXISTS "Auth users can delete messages" ON messages;
CREATE POLICY "Anyone can send messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users can read messages" ON messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update messages" ON messages FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can delete messages" ON messages FOR DELETE USING (auth.role() = 'authenticated');

-- site_content
DROP POLICY IF EXISTS "Anyone can read content" ON site_content;
DROP POLICY IF EXISTS "Auth users can insert content" ON site_content;
DROP POLICY IF EXISTS "Auth users can update content" ON site_content;
DROP POLICY IF EXISTS "Auth users can delete content" ON site_content;
CREATE POLICY "Anyone can read content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Auth users can insert content" ON site_content FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update content" ON site_content FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can delete content" ON site_content FOR DELETE USING (auth.role() = 'authenticated');

-- media_slots
DROP POLICY IF EXISTS "Anyone can read media" ON media_slots;
DROP POLICY IF EXISTS "Auth users can insert media" ON media_slots;
DROP POLICY IF EXISTS "Auth users can update media" ON media_slots;
DROP POLICY IF EXISTS "Auth users can delete media" ON media_slots;
CREATE POLICY "Anyone can read media" ON media_slots FOR SELECT USING (true);
CREATE POLICY "Auth users can insert media" ON media_slots FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update media" ON media_slots FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can delete media" ON media_slots FOR DELETE USING (auth.role() = 'authenticated');

-- design_settings
DROP POLICY IF EXISTS "Anyone can read design" ON design_settings;
DROP POLICY IF EXISTS "Auth users can insert design" ON design_settings;
DROP POLICY IF EXISTS "Auth users can update design" ON design_settings;
CREATE POLICY "Anyone can read design" ON design_settings FOR SELECT USING (true);
CREATE POLICY "Auth users can insert design" ON design_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update design" ON design_settings FOR UPDATE USING (auth.role() = 'authenticated');

-- activity_log
DROP POLICY IF EXISTS "Anyone can log activity" ON activity_log;
DROP POLICY IF EXISTS "Auth users can read activity" ON activity_log;
CREATE POLICY "Anyone can log activity" ON activity_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users can read activity" ON activity_log FOR SELECT USING (auth.role() = 'authenticated');

-- bot_settings: public read, only auth write
DROP POLICY IF EXISTS "Anyone can read bot settings" ON bot_settings;
DROP POLICY IF EXISTS "Auth users can insert bot settings" ON bot_settings;
DROP POLICY IF EXISTS "Auth users can update bot settings" ON bot_settings;
CREATE POLICY "Anyone can read bot settings" ON bot_settings FOR SELECT USING (true);
CREATE POLICY "Auth users can insert bot settings" ON bot_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update bot settings" ON bot_settings FOR UPDATE USING (auth.role() = 'authenticated');

-- 6) Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END $$;

-- 7) Seed content (idempotent)
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

-- Seed Services
INSERT INTO services (title, description, icon_svg, sort_order) VALUES
  ('Video Engineering', 'High-end cinematic editing and post-production.', '🎬', 1),
  ('3D Motion', 'Complex spatial animations and product visualization.', '🔮', 2),
  ('Brand Identity', 'Strategic design for the modern icon.', '💎', 3)
ON CONFLICT DO NOTHING;

-- Seed Social Links
INSERT INTO social_links (platform_name, url, icon_svg) VALUES
  ('Instagram', 'https://instagram.com/klyperix', '📸'),
  ('LinkedIn', 'https://linkedin.com/company/klyperix', '🔗'),
  ('Behance', 'https://behance.net/klyperix', '🎨')
ON CONFLICT DO NOTHING;
