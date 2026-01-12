-- Migration: Create icons table for icon library
-- This table stores icon metadata with SVG files stored in Supabase Storage

-- Create icons table
CREATE TABLE IF NOT EXISTS icons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tags TEXT[] DEFAULT '{}',
  style TEXT DEFAULT 'outline',  -- outline, filled, color, etc.
  source TEXT DEFAULT 'custom',  -- icons8, custom, lucide, etc.
  storage_path TEXT NOT NULL,
  svg_text TEXT,                 -- cached SVG for inline rendering
  viewbox TEXT DEFAULT '0 0 24 24',
  width INTEGER DEFAULT 24,
  height INTEGER DEFAULT 24,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_icons_name ON icons(name);
CREATE INDEX IF NOT EXISTS idx_icons_slug ON icons(slug);
CREATE INDEX IF NOT EXISTS idx_icons_tags ON icons USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_icons_style ON icons(style);
CREATE INDEX IF NOT EXISTS idx_icons_source ON icons(source);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_icons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS icons_updated_at ON icons;
CREATE TRIGGER icons_updated_at
  BEFORE UPDATE ON icons
  FOR EACH ROW
  EXECUTE FUNCTION update_icons_updated_at();

-- Comments for documentation
COMMENT ON TABLE icons IS 'Icon library for design system components';
COMMENT ON COLUMN icons.slug IS 'URL-friendly unique identifier for the icon';
COMMENT ON COLUMN icons.tags IS 'Array of tags for searching/filtering';
COMMENT ON COLUMN icons.style IS 'Visual style: outline, filled, color, etc.';
COMMENT ON COLUMN icons.source IS 'Source of icon: icons8, custom, lucide, etc.';
COMMENT ON COLUMN icons.storage_path IS 'Path to SVG file in Supabase Storage icons bucket';
COMMENT ON COLUMN icons.svg_text IS 'Cached SVG content for inline rendering';
COMMENT ON COLUMN icons.viewbox IS 'SVG viewBox attribute';

-- =============================================================================
-- Storage Bucket for Icons
-- =============================================================================

-- Create icons bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('icons', 'icons', true, 1048576, -- 1MB (SVGs are small)
   ARRAY['image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for icons bucket (public read/write - no auth per project rules)
CREATE POLICY "Public read icons" ON storage.objects
  FOR SELECT USING (bucket_id = 'icons');

CREATE POLICY "Public write icons" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'icons');

CREATE POLICY "Public update icons" ON storage.objects
  FOR UPDATE USING (bucket_id = 'icons');

CREATE POLICY "Public delete icons" ON storage.objects
  FOR DELETE USING (bucket_id = 'icons');

-- File organization:
-- icons/
--   {slug}.svg
--   custom/{custom_name}.svg
--   icons8/{icons8_id}.svg

