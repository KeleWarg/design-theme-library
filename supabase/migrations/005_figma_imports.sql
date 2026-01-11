/**
 * @chunk 4.11 - Figma Import Tables
 * 
 * Tables for staging Figma plugin imports before review and approval.
 * No RLS policies (single-user tool).
 */

-- Figma import sessions
CREATE TABLE figma_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_key VARCHAR(100),
  file_name VARCHAR(255),
  exported_at TIMESTAMPTZ,
  component_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'imported', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Imported component data (staging)
CREATE TABLE figma_import_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES figma_imports(id) ON DELETE CASCADE,
  figma_id VARCHAR(100),
  name VARCHAR(255),
  description TEXT,
  component_type VARCHAR(50),
  properties JSONB,
  variants JSONB,
  structure JSONB,
  bound_variables JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Imported images
CREATE TABLE figma_import_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES figma_imports(id) ON DELETE CASCADE,
  node_id VARCHAR(100),
  node_name VARCHAR(255),
  storage_path VARCHAR(500),
  format VARCHAR(10) CHECK (format IN ('png', 'svg', 'jpg', 'webp')),
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_figma_import_components_import_id ON figma_import_components(import_id);
CREATE INDEX idx_figma_import_images_import_id ON figma_import_images(import_id);
CREATE INDEX idx_figma_imports_status ON figma_imports(status);

-- Apply updated_at trigger to figma_imports table
CREATE TRIGGER figma_imports_updated_at
  BEFORE UPDATE ON figma_imports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();




