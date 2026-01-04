/**
 * @chunk 6.04 - E2E Global Setup
 * 
 * Seeds test data before E2E tests run.
 * This ensures tests have consistent data to work with.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../../../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Test data definitions
const E2E_TEST_THEME_ID = 'e2e-test-theme-00001';
const E2E_TEST_COMPONENT_ID = 'e2e-test-component-001';

const testTheme = {
  id: E2E_TEST_THEME_ID,
  name: 'E2E Test Theme',
  slug: 'e2e-test-theme',
  description: 'Theme for E2E testing - automatically created and managed',
  status: 'published',
  is_default: false,
  source: 'manual'
};

const testTokens = [
  // Colors
  { name: 'Primary', path: 'color/primary', category: 'color', type: 'color',
    value: { hex: '#3B82F6', rgb: { r: 59, g: 130, b: 246 }, opacity: 1 },
    css_variable: '--color-primary', sort_order: 1, theme_id: E2E_TEST_THEME_ID },
  { name: 'Secondary', path: 'color/secondary', category: 'color', type: 'color',
    value: { hex: '#64748B', rgb: { r: 100, g: 116, b: 139 }, opacity: 1 },
    css_variable: '--color-secondary', sort_order: 2, theme_id: E2E_TEST_THEME_ID },
  { name: 'Background', path: 'color/background', category: 'color', type: 'color',
    value: { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, opacity: 1 },
    css_variable: '--color-background', sort_order: 3, theme_id: E2E_TEST_THEME_ID },
  { name: 'Foreground', path: 'color/foreground', category: 'color', type: 'color',
    value: { hex: '#0F172A', rgb: { r: 15, g: 23, b: 42 }, opacity: 1 },
    css_variable: '--color-foreground', sort_order: 4, theme_id: E2E_TEST_THEME_ID },
  { name: 'Border', path: 'color/border', category: 'color', type: 'color',
    value: { hex: '#E2E8F0', rgb: { r: 226, g: 232, b: 240 }, opacity: 1 },
    css_variable: '--color-border', sort_order: 5, theme_id: E2E_TEST_THEME_ID },
  
  // Typography
  { name: 'Font Size Base', path: 'typography/size/base', category: 'typography', type: 'dimension',
    value: { value: 16, unit: 'px' }, css_variable: '--font-size-base', sort_order: 1, theme_id: E2E_TEST_THEME_ID },
  { name: 'Font Size LG', path: 'typography/size/lg', category: 'typography', type: 'dimension',
    value: { value: 18, unit: 'px' }, css_variable: '--font-size-lg', sort_order: 2, theme_id: E2E_TEST_THEME_ID },
  
  // Spacing
  { name: 'Space MD', path: 'spacing/md', category: 'spacing', type: 'dimension',
    value: { value: 16, unit: 'px' }, css_variable: '--space-md', sort_order: 1, theme_id: E2E_TEST_THEME_ID },
  { name: 'Space LG', path: 'spacing/lg', category: 'spacing', type: 'dimension',
    value: { value: 24, unit: 'px' }, css_variable: '--space-lg', sort_order: 2, theme_id: E2E_TEST_THEME_ID },
  
  // Shadows
  { name: 'Shadow MD', path: 'shadow/md', category: 'shadow', type: 'shadow',
    value: { shadows: [{ x: 0, y: 4, blur: 6, spread: -1, color: 'rgba(0,0,0,0.1)' }] },
    css_variable: '--shadow-md', sort_order: 1, theme_id: E2E_TEST_THEME_ID },
  
  // Radius
  { name: 'Radius MD', path: 'radius/md', category: 'radius', type: 'dimension',
    value: { value: 8, unit: 'px' }, css_variable: '--radius-md', sort_order: 1, theme_id: E2E_TEST_THEME_ID },
];

const testComponent = {
  id: E2E_TEST_COMPONENT_ID,
  name: 'E2E TestButton',
  slug: 'e2e-testbutton',
  description: 'Test button component for E2E testing',
  category: 'buttons',
  status: 'published',
  code: `export default function TestButton({ children, variant = 'primary', onClick }) {
  return (
    <button
      className={\`btn btn-\${variant}\`}
      onClick={onClick}
      style={{
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        padding: 'var(--space-md)',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  );
}`,
  props: [
    { name: 'variant', type: 'enum', options: ['primary', 'secondary'], default: 'primary', description: 'Button variant' },
    { name: 'children', type: 'string', required: true, description: 'Button content' },
    { name: 'onClick', type: 'function', description: 'Click handler' }
  ],
  variants: [
    { name: 'Primary', props: { variant: 'primary' } },
    { name: 'Secondary', props: { variant: 'secondary' } }
  ],
  linked_tokens: ['color/primary', 'spacing/md', 'radius/md']
};

const testExamples = [
  { title: 'Basic Usage', code: '<TestButton>Click me</TestButton>', description: 'Simple button usage', sort_order: 1, component_id: E2E_TEST_COMPONENT_ID },
  { title: 'With Variant', code: '<TestButton variant="secondary">Secondary</TestButton>', description: 'Secondary variant', sort_order: 2, component_id: E2E_TEST_COMPONENT_ID },
];

async function globalSetup() {
  console.log('\n🧪 E2E Global Setup: Seeding test data...\n');

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables.');
    console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local');
    console.error('Continuing without seeding - tests may use existing data...');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Step 1: Clean up existing E2E test data
    console.log('🧹 Cleaning up existing E2E test data...');
    
    // Delete test component examples
    await supabase
      .from('component_examples')
      .delete()
      .eq('component_id', E2E_TEST_COMPONENT_ID);
    
    // Delete test component
    await supabase
      .from('components')
      .delete()
      .eq('id', E2E_TEST_COMPONENT_ID);
    
    // Delete test tokens
    await supabase
      .from('tokens')
      .delete()
      .eq('theme_id', E2E_TEST_THEME_ID);
    
    // Delete test typefaces
    await supabase
      .from('typefaces')
      .delete()
      .eq('theme_id', E2E_TEST_THEME_ID);
    
    // Delete test typography roles
    await supabase
      .from('typography_roles')
      .delete()
      .eq('theme_id', E2E_TEST_THEME_ID);
    
    // Delete test theme
    await supabase
      .from('themes')
      .delete()
      .eq('id', E2E_TEST_THEME_ID);

    console.log('✓ Cleanup complete');

    // Step 2: Create test theme
    console.log('📦 Creating E2E test theme...');
    const { data: theme, error: themeError } = await supabase
      .from('themes')
      .insert(testTheme)
      .select()
      .single();

    if (themeError) {
      console.error('Failed to create test theme:', themeError.message);
      // Continue anyway - tests may use existing data
    } else {
      console.log(`✓ Created theme: ${theme.name}`);
    }

    // Step 3: Create test tokens
    console.log('🎨 Creating E2E test tokens...');
    const { data: tokens, error: tokensError } = await supabase
      .from('tokens')
      .insert(testTokens)
      .select();

    if (tokensError) {
      console.error('Failed to create test tokens:', tokensError.message);
    } else {
      console.log(`✓ Created ${tokens?.length || 0} tokens`);
    }

    // Step 4: Create test component
    console.log('🧩 Creating E2E test component...');
    const { data: component, error: componentError } = await supabase
      .from('components')
      .insert(testComponent)
      .select()
      .single();

    if (componentError) {
      console.error('Failed to create test component:', componentError.message);
    } else {
      console.log(`✓ Created component: ${component.name}`);
    }

    // Step 5: Create test examples
    console.log('📋 Creating E2E test examples...');
    const { data: examples, error: examplesError } = await supabase
      .from('component_examples')
      .insert(testExamples)
      .select();

    if (examplesError) {
      console.error('Failed to create test examples:', examplesError.message);
    } else {
      console.log(`✓ Created ${examples?.length || 0} examples`);
    }

    console.log('\n✅ E2E Setup complete!\n');

  } catch (error) {
    console.error('\n⚠️ E2E Setup encountered errors:', error.message);
    console.error('Tests will proceed with existing data...\n');
  }
}

export default globalSetup;



