import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables.');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// LLM - Foreground Colors
// ============================================
const LLM_FOREGROUND = [
  { name: 'fg-heading', path: 'foreground/heading', category: 'color', value: '#000000' },
  { name: 'fg-body', path: 'foreground/body', category: 'color', value: '#333333' },
  { name: 'fg-link-secondary', path: 'foreground/link-secondary', category: 'color', value: '#000000' },
  { name: 'fg-caption', path: 'foreground/caption', category: 'color', value: '#6A6A6A' },
  { name: 'fg-stroke-ui', path: 'foreground/stroke-ui', category: 'color', value: '#7F8B9A' },
  { name: 'fg-link', path: 'foreground/link', category: 'color', value: '#1E72A8' },
  { name: 'fg-stroke-ui-inverse', path: 'foreground/stroke-ui-inverse', category: 'color', value: '#D7DCE5' },
  { name: 'fg-heading-inverse', path: 'foreground/heading-inverse', category: 'color', value: '#FFFFFF' },
  { name: 'fg-body-inverse', path: 'foreground/body-inverse', category: 'color', value: '#F8F8FA' },
  { name: 'fg-caption-inverse', path: 'foreground/caption-inverse', category: 'color', value: '#ECF1FF' },
  { name: 'fg-table-border', path: 'foreground/table-border', category: 'color', value: '#7F8B9A' },
  { name: 'fg-stroke-default', path: 'foreground/stroke-default', category: 'color', value: '#ECF1FF' },
  { name: 'fg-divider', path: 'foreground/divider', category: 'color', value: '#EDEDED' },
  { name: 'fg-stroke-inverse', path: 'foreground/stroke-inverse', category: 'color', value: '#F8F8FA' },
  { name: 'fg-stroke-dark-inverse', path: 'foreground/stroke-dark-inverse', category: 'color', value: '#333333' },
  { name: 'fg-feedback-error', path: 'foreground/feedback-error', category: 'color', value: '#EB4015' },
  { name: 'fg-feedback-warning', path: 'foreground/feedback-warning', category: 'color', value: '#FFB136' },
  { name: 'fg-feedback-success', path: 'foreground/feedback-success', category: 'color', value: '#0C7663' },
];

// ============================================
// FORBESMEDIA-SEO - Foreground Colors
// ============================================
const FORBES_SEO_FOREGROUND = [
  { name: 'fg-heading', path: 'foreground/heading', category: 'color', value: '#333333' },
  { name: 'fg-body', path: 'foreground/body', category: 'color', value: '#333333' },
  { name: 'fg-link-secondary', path: 'foreground/link-secondary', category: 'color', value: '#333333' },
  { name: 'fg-caption', path: 'foreground/caption', category: 'color', value: '#515260' },
  { name: 'fg-stroke-ui', path: 'foreground/stroke-ui', category: 'color', value: '#7F8B9A' },
  { name: 'fg-link', path: 'foreground/link', category: 'color', value: '#007AC8' },
  { name: 'fg-stroke-ui-inverse', path: 'foreground/stroke-ui-inverse', category: 'color', value: '#D7DCE5' },
  { name: 'fg-heading-inverse', path: 'foreground/heading-inverse', category: 'color', value: '#FFFFFF' },
  { name: 'fg-body-inverse', path: 'foreground/body-inverse', category: 'color', value: '#FFFFFF' },
  { name: 'fg-caption-inverse', path: 'foreground/caption-inverse', category: 'color', value: '#EDEDED' },
  { name: 'fg-table-border', path: 'foreground/table-border', category: 'color', value: '#EDEDED' },
  { name: 'fg-stroke-default', path: 'foreground/stroke-default', category: 'color', value: '#EDEDED' },
  { name: 'fg-divider', path: 'foreground/divider', category: 'color', value: '#EDEDED' },
  { name: 'fg-stroke-inverse', path: 'foreground/stroke-inverse', category: 'color', value: '#FFFFFF' },
  { name: 'fg-stroke-dark-inverse', path: 'foreground/stroke-dark-inverse', category: 'color', value: '#515260' },
  { name: 'fg-feedback-error', path: 'foreground/feedback-error', category: 'color', value: '#EB4015' },
  { name: 'fg-feedback-warning', path: 'foreground/feedback-warning', category: 'color', value: '#FFB136' },
  { name: 'fg-feedback-success', path: 'foreground/feedback-success', category: 'color', value: '#0C7663' },
];

async function addForegroundTokens(slug, tokens) {
  console.log(`\nAdding foreground tokens to: ${slug}`);
  
  // Get theme ID
  const { data: theme, error: themeError } = await supabase
    .from('themes')
    .select('id')
    .eq('slug', slug)
    .single();
  
  if (themeError || !theme) {
    console.error(`  Theme not found: ${slug}`);
    return;
  }
  
  // Check for existing foreground tokens (path starts with 'foreground/')
  const { data: existing } = await supabase
    .from('tokens')
    .select('name')
    .eq('theme_id', theme.id)
    .like('path', 'foreground/%');
  
  const existingNames = new Set((existing || []).map(t => t.name));
  const newTokens = tokens.filter(t => !existingNames.has(t.name));
  
  if (newTokens.length === 0) {
    console.log(`  All foreground tokens already exist`);
    return;
  }
  
  // Insert new tokens
  const tokenRecords = newTokens.map(token => ({
    theme_id: theme.id,
    name: token.name,
    path: token.path,
    category: token.category,
    type: 'color',
    value: token.value,
    css_variable: `--${slug}-foreground-${token.name}`,
  }));
  
  const { error: insertError } = await supabase
    .from('tokens')
    .insert(tokenRecords);
  
  if (insertError) {
    console.error(`  Error inserting tokens:`, insertError);
  } else {
    console.log(`  Added ${tokenRecords.length} foreground tokens`);
  }
}

async function main() {
  console.log('🔧 Adding missing foreground colors...\n');
  
  await addForegroundTokens('llm', LLM_FOREGROUND);
  await addForegroundTokens('forbesmedia-seo', FORBES_SEO_FOREGROUND);
  
  console.log('\n✅ Foreground colors added!');
}

main().catch(console.error);

