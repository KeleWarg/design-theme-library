-- Migration: Storage Buckets Setup
-- Chunk: 1.05
-- Creates buckets for fonts and component images

-- Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('fonts', 'fonts', true, 5242880, -- 5MB
   ARRAY['font/woff2', 'font/woff', 'font/ttf', 'font/otf', 'application/octet-stream']),
  ('component-images', 'component-images', true, 5242880, -- 5MB
   ARRAY['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for fonts bucket (public read/write for now - no auth)
CREATE POLICY "Public read fonts" ON storage.objects
  FOR SELECT USING (bucket_id = 'fonts');

CREATE POLICY "Public write fonts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'fonts');

CREATE POLICY "Public update fonts" ON storage.objects
  FOR UPDATE USING (bucket_id = 'fonts');

CREATE POLICY "Public delete fonts" ON storage.objects
  FOR DELETE USING (bucket_id = 'fonts');

-- Storage policies for component-images bucket (public read/write for now - no auth)
CREATE POLICY "Public read images" ON storage.objects
  FOR SELECT USING (bucket_id = 'component-images');

CREATE POLICY "Public write images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'component-images');

CREATE POLICY "Public update images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'component-images');

CREATE POLICY "Public delete images" ON storage.objects
  FOR DELETE USING (bucket_id = 'component-images');

-- File organization notes:
-- fonts/
--   {theme_id}/
--     {typeface_role}/
--       {family}-{weight}.woff2
--       {family}-{weight}-italic.woff2
--
-- component-images/
--   {component_id}/
--     preview.png
--     thumbnail.png
--     {variant_name}.png

