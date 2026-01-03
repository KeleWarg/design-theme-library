/**
 * @chunk 1.03 - Database Schema - Typography
 * 
 * Tables for typefaces, font files, and typography roles.
 * Supports Google Fonts, Adobe Fonts, system fonts, and custom uploads.
 * No RLS policies (single-user tool).
 */

-- Typefaces table
-- One typeface per role per theme (enforced by unique constraint)
CREATE TABLE typefaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('display', 'text', 'mono', 'accent')),
  family VARCHAR(100) NOT NULL,
  fallback VARCHAR(255) DEFAULT 'sans-serif',
  source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('google', 'adobe', 'system', 'custom')),
  weights JSONB DEFAULT '[400]',
  is_variable BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(theme_id, role)
);

-- Font Files table
-- Stores custom font file uploads linked to typefaces
CREATE TABLE font_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  typeface_id UUID NOT NULL REFERENCES typefaces(id) ON DELETE CASCADE,
  storage_path VARCHAR(500) NOT NULL,
  format VARCHAR(10) NOT NULL CHECK (format IN ('woff2', 'woff', 'ttf', 'otf')),
  weight INTEGER NOT NULL,
  style VARCHAR(20) DEFAULT 'normal' CHECK (style IN ('normal', 'italic')),
  file_size INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Typography Roles table (semantic mapping)
-- Maps semantic roles (heading-xl, body-md, etc.) to typeface roles
CREATE TABLE typography_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  role_name VARCHAR(50) NOT NULL,
  typeface_role VARCHAR(20) NOT NULL CHECK (typeface_role IN ('display', 'text', 'mono', 'accent')),
  font_size VARCHAR(20) NOT NULL,
  font_weight INTEGER NOT NULL DEFAULT 400,
  line_height VARCHAR(20) DEFAULT '1.5',
  letter_spacing VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(theme_id, role_name)
);

-- Indexes for performance
CREATE INDEX idx_typefaces_theme ON typefaces(theme_id);
CREATE INDEX idx_font_files_typeface ON font_files(typeface_id);
CREATE INDEX idx_typography_roles_theme ON typography_roles(theme_id);

-- Comments for documentation
COMMENT ON TABLE typefaces IS 'Font families organized by role (display, text, mono, accent) per theme';
COMMENT ON TABLE font_files IS 'Custom font file uploads for typefaces';
COMMENT ON TABLE typography_roles IS 'Semantic typography roles (heading-xl, body-md, etc.) mapped to typefaces';

COMMENT ON COLUMN typefaces.role IS 'One of: display (headlines), text (body copy), mono (code), accent (decorative)';
COMMENT ON COLUMN typefaces.source_type IS 'Font source: google, adobe, system, or custom upload';
COMMENT ON COLUMN typefaces.weights IS 'JSON array of available font weights, e.g. [400, 500, 700]';
COMMENT ON COLUMN typefaces.is_variable IS 'Whether this is a variable font with weight range support';

COMMENT ON COLUMN typography_roles.role_name IS 'Semantic name: display, heading-xl/lg/md/sm, body-lg/md/sm, label, caption, mono';
COMMENT ON COLUMN typography_roles.typeface_role IS 'Links to typeface role (display, text, mono, accent)';

