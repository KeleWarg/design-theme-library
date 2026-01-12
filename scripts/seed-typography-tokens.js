/**
 * @chunk - Forbes Advisor Typography, Spacing & Grid Tokens Seed Script
 * 
 * Adds typography, spacing, radius, shadow, and grid tokens to all themes.
 * Run with: node scripts/seed-typography-tokens.js
 * 
 * IDEMPOTENT - Can be re-run safely (skips existing tokens).
 */

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

// ============================================================================
// FONT SIZE TOKENS
// ============================================================================

const FONT_SIZES_SEM = [
  { name: 'display', size: 56 },
  { name: 'heading-lg', size: 48 },
  { name: 'heading-md', size: 32 },
  { name: 'heading-sm', size: 24 },
  { name: 'title-lg', size: 20 },
  { name: 'title-md', size: 18 },
  { name: 'title-sm', size: 16 },
  { name: 'title-xs', size: 14 },
  { name: 'body-lg', size: 18 },
  { name: 'body-md', size: 16 },
  { name: 'body-sm', size: 14 },
  { name: 'body-xs', size: 12 },
  { name: 'label-lg', size: 16 },
  { name: 'label-md', size: 14 },
  { name: 'label-sm', size: 12 },
  { name: 'label-xs', size: 10 },
];

const FONT_SIZES_FORBES_MEDIA = [
  { name: 'heading-lg', size: 48 },
  { name: 'heading-md', size: 32 },
  { name: 'heading-sm', size: 24 },
  { name: 'heading-xs', size: 20 },
  { name: 'body-lg-serif', size: 18 },
  { name: 'body-lg', size: 18 },
  { name: 'body-md', size: 16 },
  { name: 'body-sm', size: 14 },
  { name: 'body-xs', size: 12 },
  { name: 'body-2xs', size: 10 },
  { name: 'label-eyebrow', size: 18 },
  { name: 'label-breadcrumb', size: 12 },
];

// ============================================================================
// LINE HEIGHT TOKENS
// ============================================================================

const LINE_HEIGHTS = [
  { name: 'line-height-5xl', value: 68 },
  { name: 'line-height-4xl', value: 58 },
  { name: 'line-height-3xl', value: 40 },
  { name: 'line-height-2xl', value: 32 },
  { name: 'line-height-xl', value: 26 },
  { name: 'line-height-lg', value: 24 },
  { name: 'line-height-md', value: 22 },
  { name: 'line-height-sm', value: 20 },
  { name: 'line-height-xs', value: 18 },
  { name: 'line-height-2xs', value: 16 },
];

// ============================================================================
// FONT WEIGHT TOKENS
// ============================================================================

const FONT_WEIGHTS = [
  { name: 'font-weight-bold', value: 700 },
  { name: 'font-weight-semibold', value: 600 },
  { name: 'font-weight-medium', value: 500 },
  { name: 'font-weight-regular', value: 400 },
  { name: 'font-weight-light', value: 300 },
];

// ============================================================================
// LETTER SPACING TOKENS
// ============================================================================

const LETTER_SPACING = [
  { name: 'letter-spacing-tighter', value: -0.2 },
  { name: 'letter-spacing-tight', value: -0.1 },
  { name: 'letter-spacing-normal', value: 0 },
  { name: 'letter-spacing-wide', value: 0.5 },
  { name: 'letter-spacing-wider', value: 1 },
];

// ============================================================================
// FONT FAMILY TOKENS
// ============================================================================

const FONT_FAMILIES_SEM = [
  { name: 'font-family-serif', value: 'Georgia' },
  { name: 'font-family-sans', value: 'Euclid Circular B' },
];

const FONT_FAMILIES_FORBES = [
  { name: 'font-family-heading-serif', value: 'Schnyder S' },
  { name: 'font-family-heading', value: 'Work Sans' },
  { name: 'font-family-body', value: 'Georgia' },
  { name: 'font-family-body-serif', value: 'Work Sans' },
  { name: 'font-family-breadcrumbs', value: 'Graphik' },
];

// ============================================================================
// SPACING TOKENS
// ============================================================================

const SPACING = [
  { name: 'space-0', value: 0 },
  { name: 'space-1', value: 4 },
  { name: 'space-2', value: 8 },
  { name: 'space-3', value: 12 },
  { name: 'space-4', value: 16 },
  { name: 'space-5', value: 20 },
  { name: 'space-6', value: 24 },
  { name: 'space-8', value: 32 },
  { name: 'space-10', value: 40 },
  { name: 'space-12', value: 48 },
  { name: 'space-16', value: 64 },
  { name: 'space-20', value: 80 },
  { name: 'space-24', value: 96 },
];

// ============================================================================
// RADIUS TOKENS
// ============================================================================

const RADIUS = [
  { name: 'radius-none', value: 0 },
  { name: 'radius-sm', value: 2 },
  { name: 'radius-md', value: 4 },
  { name: 'radius-lg', value: 8 },
  { name: 'radius-xl', value: 12 },
  { name: 'radius-2xl', value: 16 },
  { name: 'radius-full', value: 9999 },
];

// ============================================================================
// SHADOW TOKENS
// ============================================================================

const SHADOWS = [
  { name: 'shadow-none', value: 'none' },
  { name: 'shadow-sm', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
  { name: 'shadow-md', value: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  { name: 'shadow-lg', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
  { name: 'shadow-xl', value: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
  { name: 'shadow-2xl', value: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
];

// ============================================================================
// GRID TOKENS (by breakpoint)
// ============================================================================

const GRID_DESKTOP = [
  { name: 'grid-desktop-breakpoint', value: 1440 },
  { name: 'grid-desktop-columns', value: 12 },
  { name: 'grid-desktop-margin', value: 80 },
  { name: 'grid-desktop-gutter', value: 24 },
];

const GRID_TABLET = [
  { name: 'grid-tablet-breakpoint', value: 768 },
  { name: 'grid-tablet-columns', value: 8 },
  { name: 'grid-tablet-margin', value: 40 },
  { name: 'grid-tablet-gutter', value: 16 },
];

const GRID_MOBILE = [
  { name: 'grid-mobile-breakpoint', value: 375 },
  { name: 'grid-mobile-columns', value: 4 },
  { name: 'grid-mobile-margin', value: 16 },
  { name: 'grid-mobile-gutter', value: 12 },
];

// ============================================================================
// THEME TOKEN MAPPING
// ============================================================================

const THEME_CONFIG = {
  'health-sem': {
    fontSizes: FONT_SIZES_SEM,
    fontFamilies: FONT_FAMILIES_SEM,
  },
  'forbesmedia-seo': {
    fontSizes: FONT_SIZES_FORBES_MEDIA,
    fontFamilies: FONT_FAMILIES_FORBES,
  },
  'llm': {
    fontSizes: FONT_SIZES_SEM,
    fontFamilies: FONT_FAMILIES_SEM,
  },
  'home-sem': {
    fontSizes: FONT_SIZES_SEM,
    fontFamilies: FONT_FAMILIES_SEM,
  },
  'compare-coverage': {
    fontSizes: FONT_SIZES_SEM,
    fontFamilies: FONT_FAMILIES_SEM,
  },
  'system-default': {
    fontSizes: FONT_SIZES_SEM,
    fontFamilies: FONT_FAMILIES_SEM,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function createTypographyToken(name, value, unit = 'px') {
  return {
    name,
    path: `typography/${name}`,
    category: 'typography',
    type: 'dimension',
    value: typeof value === 'number' ? { value, unit } : { value, unit: '' },
    css_variable: `--${name}`,
  };
}

function createSpacingToken(name, value) {
  return {
    name,
    path: `spacing/${name}`,
    category: 'spacing',
    type: 'dimension',
    value: { value, unit: 'px' },
    css_variable: `--${name}`,
  };
}

function createRadiusToken(name, value) {
  return {
    name,
    path: `radius/${name}`,
    category: 'radius',
    type: 'dimension',
    value: { value, unit: 'px' },
    css_variable: `--${name}`,
  };
}

function createShadowToken(name, value) {
  return {
    name,
    path: `shadow/${name}`,
    category: 'shadow',
    type: 'shadow',
    value: { shadows: [{ raw: value }] },
    css_variable: `--${name}`,
  };
}

function createGridToken(name, value) {
  return {
    name,
    path: `grid/${name}`,
    category: 'grid',
    type: 'dimension',
    value: { value, unit: name.includes('breakpoint') ? 'px' : '' },
    css_variable: `--${name}`,
  };
}

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function addTokensToTheme(themeSlug) {
  console.log(`\n📦 Processing theme: ${themeSlug}`);
  
  // Get theme ID
  const { data: theme, error: themeError } = await supabase
    .from('themes')
    .select('id')
    .eq('slug', themeSlug)
    .single();
  
  if (themeError || !theme) {
    console.log(`  ⏭️  Theme not found: ${themeSlug}, skipping...`);
    return null;
  }
  
  const themeId = theme.id;
  const config = THEME_CONFIG[themeSlug] || THEME_CONFIG['system-default'];
  
  // Build all token records
  const allTokens = [
    // Font Sizes (theme-specific)
    ...config.fontSizes.map(f => createTypographyToken(`font-size-${f.name}`, f.size)),
    
    // Font Families (theme-specific)
    ...config.fontFamilies.map(f => ({
      name: f.name,
      path: `typography/${f.name}`,
      category: 'typography',
      type: 'fontFamily',
      value: { family: f.value },
      css_variable: `--${f.name}`,
    })),
    
    // Line Heights (shared)
    ...LINE_HEIGHTS.map(l => createTypographyToken(l.name, l.value)),
    
    // Font Weights (shared)
    ...FONT_WEIGHTS.map(w => createTypographyToken(w.name, w.value, '')),
    
    // Letter Spacing (shared)
    ...LETTER_SPACING.map(s => createTypographyToken(s.name, s.value, 'px')),
    
    // Spacing (shared)
    ...SPACING.map(s => createSpacingToken(s.name, s.value)),
    
    // Radius (shared)
    ...RADIUS.map(r => createRadiusToken(r.name, r.value)),
    
    // Shadows (shared)
    ...SHADOWS.map(s => createShadowToken(s.name, s.value)),
    
    // Grid tokens (shared)
    ...GRID_DESKTOP.map(g => createGridToken(g.name, g.value)),
    ...GRID_TABLET.map(g => createGridToken(g.name, g.value)),
    ...GRID_MOBILE.map(g => createGridToken(g.name, g.value)),
  ];
  
  // Get existing tokens to avoid duplicates
  const { data: existingTokens } = await supabase
    .from('tokens')
    .select('path')
    .eq('theme_id', themeId);
  
  const existingPaths = new Set((existingTokens || []).map(t => t.path));
  
  // Filter to only new tokens
  const newTokens = allTokens.filter(t => !existingPaths.has(t.path));
  
  if (newTokens.length === 0) {
    console.log(`  ⏭️  All tokens already exist, skipping...`);
    return { themeId, added: 0 };
  }
  
  // Add theme_id and sort_order to each token
  const tokenRecords = newTokens.map((token, index) => ({
    ...token,
    theme_id: themeId,
    sort_order: index,
  }));
  
  // Insert tokens
  const { data: inserted, error: insertError } = await supabase
    .from('tokens')
    .insert(tokenRecords)
    .select();
  
  if (insertError) {
    console.error(`  ❌ Error inserting tokens:`, insertError.message);
    return { themeId, added: 0 };
  }
  
  console.log(`  ✓ Added ${inserted.length} tokens`);
  
  // Log breakdown by category
  const byCategory = {};
  inserted.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + 1;
  });
  Object.entries(byCategory).sort().forEach(([cat, count]) => {
    console.log(`    - ${cat}: ${count}`);
  });
  
  return { themeId, added: inserted.length };
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎨 FORBES ADVISOR - Typography, Spacing & Grid Token Seed');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const themeSlugs = [
    'health-sem',
    'forbesmedia-seo',
    'llm',
    'home-sem',
    'compare-coverage',
    'system-default',
  ];
  
  let totalAdded = 0;
  const results = [];
  
  for (const slug of themeSlugs) {
    const result = await addTokensToTheme(slug);
    if (result) {
      totalAdded += result.added;
      results.push({ slug, ...result });
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ ALL TOKENS SEEDED');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n📊 Summary: ${totalAdded} total tokens added`);
  
  results.forEach(r => {
    console.log(`   • ${r.slug}: +${r.added} tokens`);
  });
}

// Run the seed script
main().catch(console.error);







