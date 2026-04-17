-- Klyperix Supabase Storage Fix
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. Create the 'media' bucket if it doesn't exist
-- name: 'media'
-- public: true (so everyone can view your videos/images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public access to view media
-- This allows anyone visiting your site to see the uploaded videos/images.
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'media' );

-- 3. Allow authenticated users (Admins) to upload files
-- This allows you to upload new media from the admin panel.
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'media' 
    AND auth.role() = 'authenticated'
);

-- 4. Allow authenticated users to update/delete their files
-- This allows you to manage existing media.
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'media' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'media' AND auth.role() = 'authenticated' );

-- Verify storage permissions are active
SELECT * FROM storage.buckets WHERE id = 'media';
