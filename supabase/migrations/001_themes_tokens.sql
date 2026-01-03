/**
 * @chunk 1.02 - Database Schema - Themes & Tokens
 * 
 * Core tables for the Design System Admin tool.
 * No RLS policies (single-user tool).
 */

-- Themes table
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_default BOOLEAN DEFAULT false,
  source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual', 'figma', 'import')),
  figma_file_key VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tokens table
CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  path VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('color', 'typography', 'spacing', 'shadow', 'radius', 'grid', 'other')),
  type VARCHAR(50) NOT NULL,
  value JSONB NOT NULL,
  css_variable VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(theme_id, path)
);

-- Indexes for performance
CREATE INDEX idx_tokens_theme ON tokens(theme_id);
CREATE INDEX idx_tokens_category ON tokens(category);
CREATE INDEX idx_themes_status ON themes(status);
CREATE INDEX idx_themes_is_default ON themes(is_default);

-- Trigger function for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to themes table
CREATE TRIGGER themes_updated_at
  BEFORE UPDATE ON themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Apply trigger to tokens table
CREATE TRIGGER tokens_updated_at
  BEFORE UPDATE ON tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

