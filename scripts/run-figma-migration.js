/**
 * Run the Figma imports migration
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) {
    env[key.trim()] = vals.join('=').trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const migrationSQL = `
-- Figma import sessions
CREATE TABLE IF NOT EXISTS figma_imports (
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
CREATE TABLE IF NOT EXISTS figma_import_components (
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
CREATE TABLE IF NOT EXISTS figma_import_images (
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
CREATE INDEX IF NOT EXISTS idx_figma_import_components_import_id ON figma_import_components(import_id);
CREATE INDEX IF NOT EXISTS idx_figma_import_images_import_id ON figma_import_images(import_id);
CREATE INDEX IF NOT EXISTS idx_figma_imports_status ON figma_imports(status);
`;

async function runMigration() {
  console.log('Running Figma imports migration...');
  console.log('Supabase URL:', supabaseUrl);
  
  // Supabase JS client doesn't support raw SQL, need to use the REST API
  // We'll check if table exists first
  const { data, error } = await supabase
    .from('figma_imports')
    .select('id')
    .limit(1);
  
  if (!error) {
    console.log('✅ figma_imports table already exists!');
    return;
  }
  
  if (error.code === 'PGRST205') {
    console.log('Table does not exist. You need to run this SQL in the Supabase Dashboard SQL Editor:');
    console.log('');
    console.log('='.repeat(80));
    console.log(migrationSQL);
    console.log('='.repeat(80));
    console.log('');
    console.log('Steps:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Paste the SQL above and click "Run"');
  } else {
    console.error('Unexpected error:', error);
  }
}

runMigration();




