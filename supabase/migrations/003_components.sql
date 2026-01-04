/**
 * @chunk 1.04 - Database Schema - Components
 * 
 * Tables for component storage, images, and examples.
 * Components are theme-independent (can work with any theme).
 * No RLS policies (single-user tool).
 */

-- Components table
CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50) CHECK (category IN (
    'buttons', 'forms', 'layout', 'navigation', 
    'feedback', 'data-display', 'overlay', 'other'
  )),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  code TEXT,
  props JSONB DEFAULT '[]',
  variants JSONB DEFAULT '[]',
  linked_tokens JSONB DEFAULT '[]',
  figma_id VARCHAR(100),
  figma_structure JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Component Images
CREATE TABLE component_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  format VARCHAR(10) NOT NULL CHECK (format IN ('png', 'svg', 'jpg', 'webp')),
  width INTEGER,
  height INTEGER,
  file_size INTEGER NOT NULL,
  figma_node_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Component Examples (for LLMS.txt)
CREATE TABLE component_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_components_status ON components(status);
CREATE INDEX idx_components_category ON components(category);
CREATE INDEX idx_component_images_component ON component_images(component_id);
CREATE INDEX idx_component_examples_component ON component_examples(component_id);

-- Apply updated_at trigger to components table
CREATE TRIGGER components_updated_at
  BEFORE UPDATE ON components
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


