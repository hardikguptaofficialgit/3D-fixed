-- ════════════════════════════════════════════════════════════════
-- KLYPERIX — Supabase Storage Setup
-- ════════════════════════════════════════════════════════════════
-- Run this AFTER the main supabase-setup.sql in SQL Editor
-- ════════════════════════════════════════════════════════════════

-- Create a public storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'media',
    'media',
    true,
    1099511627776,  -- 1TB per file max
    ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','video/mp4','video/webm','video/quicktime','video/x-msvideo','video/x-matroska']
) ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 1099511627776,
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','video/mp4','video/webm','video/quicktime','video/x-msvideo','video/x-matroska'];

-- Drop existing policies if they exist (safe re-run)
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload access" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access" ON storage.objects;
DROP POLICY IF EXISTS "Public list access" ON storage.objects;

-- Anyone can VIEW uploaded media (public bucket)
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

-- Anyone can LIST files in the media bucket (needed for bucket detection)
-- This is essential so the admin panel can probe the bucket exists
CREATE POLICY "Public list access" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

-- Only authenticated admin can UPLOAD
CREATE POLICY "Admin upload access" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Only authenticated admin can UPDATE
CREATE POLICY "Admin update access" ON storage.objects
FOR UPDATE USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Only authenticated admin can DELETE
CREATE POLICY "Admin delete access" ON storage.objects
FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');
