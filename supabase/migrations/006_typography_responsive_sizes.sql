/**
 * @chunk 2.xx - Typography Responsive Sizes
 *
 * Enables responsive typography by allowing per-role font sizes for
 * desktop/tablet/mobile. Also allows themes to "leave blank" a size
 * and fall back to the canonical registry defaults.
 *
 * NOTE: single-user tool; no RLS/auth.
 */

-- Allow a role to omit desktop size (will fall back to registry defaults in app)
ALTER TABLE typography_roles
  ALTER COLUMN font_size DROP NOT NULL;

-- Add responsive size overrides (optional)
ALTER TABLE typography_roles
  ADD COLUMN IF NOT EXISTS font_size_tablet VARCHAR(20),
  ADD COLUMN IF NOT EXISTS font_size_mobile VARCHAR(20);


