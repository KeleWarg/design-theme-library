/**
 * @chunk - Forbes Advisor Brand Themes Seed Script
 * 
 * Seeds 5 Forbes Advisor brand themes with color tokens.
 * Run with: node scripts/seed-forbes-themes.js
 * 
 * IDEMPOTENT - Can be re-run safely (skips existing themes).
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
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert hex color to RGB object
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Create a properly structured color token value (JSONB)
 */
function createColorValue(hex) {
  const rgb = hexToRgb(hex);
  return {
    hex,
    rgb: rgb || { r: 0, g: 0, b: 0 },
    opacity: 1
  };
}

/**
 * Generate CSS variable name from path
 */
function pathToCssVariable(path) {
  return '--' + path.toLowerCase().replace(/\//g, '-').replace(/\s+/g, '-');
}

// ============================================================================
// THEME 1: Health - SEM
// ============================================================================
const HEALTH_SEM_TOKENS = [
  // Button - Primary
  { name: 'Primary Background', path: 'button/primary/bg', hex: '#657E79' },
  { name: 'Primary Text', path: 'button/primary/text', hex: '#FFFFFF' },
  { name: 'Primary Icon', path: 'button/primary/icon', hex: '#FFFFFF' },
  { name: 'Primary Hover Background', path: 'button/primary/hover-bg', hex: '#46635D' },
  { name: 'Primary Pressed Background', path: 'button/primary/pressed-bg', hex: '#3C5C55' },
  { name: 'Primary Disabled Background', path: 'button/primary/disabled-bg', hex: '#657E79' },
  { name: 'Focused Border', path: 'button/primary/focused-border', hex: '#80CAF4' },
  
  // Button - Secondary
  { name: 'Secondary Background', path: 'button/secondary/bg', hex: '#F2F5F4' },
  { name: 'Secondary Border', path: 'button/secondary/border', hex: '#657E79' },
  { name: 'Secondary Text', path: 'button/secondary/text', hex: '#657E79' },
  { name: 'Secondary Icon', path: 'button/secondary/icon', hex: '#3C5C55' },
  { name: 'Secondary Hover Background', path: 'button/secondary/hover-bg', hex: '#D1E5E1' },
  { name: 'Secondary Pressed Background', path: 'button/secondary/pressed-bg', hex: '#9CB8B2' },
  { name: 'Secondary Disabled Background', path: 'button/secondary/disabled-bg', hex: '#F2F5F4' },
  
  // Button - Ghost
  { name: 'Ghost Background', path: 'button/ghost/bg', hex: '#FFFFFF' },
  { name: 'Ghost Text', path: 'button/ghost/text', hex: '#3C5C55' },
  { name: 'Ghost Icon', path: 'button/ghost/icon', hex: '#3C5C55' },
  { name: 'Ghost Hover Background', path: 'button/ghost/hover-bg', hex: '#D1E5E1' },
  { name: 'Ghost Pressed Background', path: 'button/ghost/pressed-bg', hex: '#9CB8B2' },
  { name: 'Ghost Disabled Background', path: 'button/ghost/disabled-bg', hex: '#D7DCE5' },
  
  // Background
  { name: 'Background White', path: 'background/white', hex: '#FFFFFF' },
  { name: 'Background Neutral Subtle', path: 'background/neutral-subtle', hex: '#F4F5F8' },
  { name: 'Background Neutral Light', path: 'background/neutral-light', hex: '#ECEFF3' },
  { name: 'Background Neutral', path: 'background/neutral', hex: '#E3E7ED' },
  { name: 'Background Accent', path: 'background/accent', hex: '#F6F5F3' },
  { name: 'Background Accent Mid', path: 'background/accent-mid', hex: '#FFF0D4' },
  { name: 'Background Brand Subtle', path: 'background/brand-subtle', hex: '#F2F5F4' },
  { name: 'Background Table', path: 'background/table', hex: '#F2F5F4' },
  { name: 'Background Secondary', path: 'background/secondary', hex: '#D1E5E1' },
  { name: 'Background Brand Light', path: 'background/brand-light', hex: '#D1E5E1' },
  { name: 'Background Brand Mid', path: 'background/brand-mid', hex: '#9CB8B2' },
  { name: 'Background Brand', path: 'background/brand', hex: '#657E79' },
  { name: 'Background Neutral Mid', path: 'background/neutral-mid', hex: '#383C43' },
  { name: 'Background Neutral Strong', path: 'background/neutral-strong', hex: '#2B2E34' },
  { name: 'Background Header', path: 'background/header', hex: '#1E2125' },
  { name: 'Background Superlative', path: 'background/superlative', hex: '#ED6E13' },
  { name: 'Background Button', path: 'background/button', hex: '#657E79' },
  
  // Foreground
  { name: 'Foreground Heading', path: 'foreground/heading', hex: '#1E2125' },
  { name: 'Foreground Body', path: 'foreground/body', hex: '#383C43' },
  { name: 'Foreground Link Secondary', path: 'foreground/link-secondary', hex: '#383C43' },
  { name: 'Foreground Caption', path: 'foreground/caption', hex: '#616A76' },
  { name: 'Foreground Stroke UI', path: 'foreground/stroke-ui', hex: '#7F8B9A' },
  { name: 'Foreground Link', path: 'foreground/link', hex: '#657E79' },
  { name: 'Foreground Stroke UI Inverse', path: 'foreground/stroke-ui-inverse', hex: '#D7DCE5' },
  { name: 'Foreground Heading Inverse', path: 'foreground/heading-inverse', hex: '#FFFFFF' },
  { name: 'Foreground Body Inverse', path: 'foreground/body-inverse', hex: '#F4F5F8' },
  { name: 'Foreground Caption Inverse', path: 'foreground/caption-inverse', hex: '#D7DCE5' },
  { name: 'Foreground Table Border', path: 'foreground/table-border', hex: '#BFC7D4' },
  { name: 'Foreground Stroke Default', path: 'foreground/stroke-default', hex: '#BFC7D4' },
  { name: 'Foreground Divider', path: 'foreground/divider', hex: '#D7DCE5' },
];

// ============================================================================
// THEME 2: ForbesMedia - SEO
// ============================================================================
const FORBES_MEDIA_SEO_TOKENS = [
  // Button - Primary
  { name: 'Primary Background', path: 'button/primary/bg', hex: '#007AC8' },
  { name: 'Primary Text', path: 'button/primary/text', hex: '#FFFFFF' },
  { name: 'Primary Icon', path: 'button/primary/icon', hex: '#FFFFFF' },
  { name: 'Primary Hover Background', path: 'button/primary/hover-bg', hex: '#007AC8' },
  { name: 'Primary Pressed Background', path: 'button/primary/pressed-bg', hex: '#007AC8' },
  { name: 'Primary Disabled Background', path: 'button/primary/disabled-bg', hex: '#007AC8' },
  { name: 'Focused Border', path: 'button/primary/focused-border', hex: '#80CAF4' },
  
  // Button - Secondary
  { name: 'Secondary Background', path: 'button/secondary/bg', hex: '#FFFFFF' },
  { name: 'Secondary Border', path: 'button/secondary/border', hex: '#007AC8' },
  { name: 'Secondary Text', path: 'button/secondary/text', hex: '#007AC8' },
  { name: 'Secondary Icon', path: 'button/secondary/icon', hex: '#007AC8' },
  { name: 'Secondary Hover Background', path: 'button/secondary/hover-bg', hex: '#F3F5FB' },
  { name: 'Secondary Pressed Background', path: 'button/secondary/pressed-bg', hex: '#F3F5FB' },
  { name: 'Secondary Disabled Background', path: 'button/secondary/disabled-bg', hex: '#E2E8F0' },
  
  // Button - Ghost
  { name: 'Ghost Background', path: 'button/ghost/bg', hex: '#FFFFFF' },
  { name: 'Ghost Text', path: 'button/ghost/text', hex: '#007AC8' },
  { name: 'Ghost Icon', path: 'button/ghost/icon', hex: '#007AC8' },
  { name: 'Ghost Hover Background', path: 'button/ghost/hover-bg', hex: '#F3F5FB' },
  { name: 'Ghost Pressed Background', path: 'button/ghost/pressed-bg', hex: '#F3F5FB' },
  { name: 'Ghost Disabled Background', path: 'button/ghost/disabled-bg', hex: '#E2E8F0' },
  
  // Background
  { name: 'Background White', path: 'background/white', hex: '#FFFFFF' },
  { name: 'Background Neutral Subtle', path: 'background/neutral-subtle', hex: '#F3F5FB' },
  { name: 'Background Neutral Light', path: 'background/neutral-light', hex: '#E2E8F0' },
  { name: 'Background Neutral', path: 'background/neutral', hex: '#E2E8F0' },
  { name: 'Background Accent', path: 'background/accent', hex: '#2F4B96' },
  { name: 'Background Accent Mid', path: 'background/accent-mid', hex: '#2F4B96' },
  { name: 'Background Brand Subtle', path: 'background/brand-subtle', hex: '#E2E8F0' },
  { name: 'Background Table', path: 'background/table', hex: '#F3F5FB' },
  { name: 'Background Secondary', path: 'background/secondary', hex: '#007AC8' },
  { name: 'Background Brand Light', path: 'background/brand-light', hex: '#F3F5FB' },
];

// ============================================================================
// THEME 3: LLM
// ============================================================================
const LLM_TOKENS = [
  // Button - Primary
  { name: 'Primary Background', path: 'button/primary/bg', hex: '#007AC8' },
  { name: 'Primary Text', path: 'button/primary/text', hex: '#FFFFFF' },
  { name: 'Primary Icon', path: 'button/primary/icon', hex: '#FFFFFF' },
  { name: 'Primary Hover Background', path: 'button/primary/hover-bg', hex: '#1E72A8' },
  { name: 'Primary Pressed Background', path: 'button/primary/pressed-bg', hex: '#0B5F95' },
  { name: 'Primary Disabled Background', path: 'button/primary/disabled-bg', hex: '#007AC8' },
  { name: 'Focused Border', path: 'button/primary/focused-border', hex: '#80CAF4' },
  
  // Button - Secondary
  { name: 'Secondary Background', path: 'button/secondary/bg', hex: '#FFFFFF' },
  { name: 'Secondary Border', path: 'button/secondary/border', hex: '#007AC8' },
  { name: 'Secondary Text', path: 'button/secondary/text', hex: '#007AC8' },
  { name: 'Secondary Icon', path: 'button/secondary/icon', hex: '#007AC8' },
  { name: 'Secondary Hover Background', path: 'button/secondary/hover-bg', hex: '#F3F5FB' },
  { name: 'Secondary Pressed Background', path: 'button/secondary/pressed-bg', hex: '#F3F5FB' },
  { name: 'Secondary Disabled Background', path: 'button/secondary/disabled-bg', hex: '#FFFFFF' },
  
  // Button - Ghost
  { name: 'Ghost Background', path: 'button/ghost/bg', hex: '#FFFFFF' },
  { name: 'Ghost Text', path: 'button/ghost/text', hex: '#007AC8' },
  { name: 'Ghost Icon', path: 'button/ghost/icon', hex: '#007AC8' },
  { name: 'Ghost Hover Background', path: 'button/ghost/hover-bg', hex: '#F3F5FB' },
  { name: 'Ghost Pressed Background', path: 'button/ghost/pressed-bg', hex: '#F3F5FB' },
  { name: 'Ghost Disabled Background', path: 'button/ghost/disabled-bg', hex: '#E2E8F0' },
  
  // Background
  { name: 'Background White', path: 'background/white', hex: '#FFFFFF' },
  { name: 'Background Neutral Subtle', path: 'background/neutral-subtle', hex: '#F8F8FA' },
  { name: 'Background Neutral Light', path: 'background/neutral-light', hex: '#F3F5FB' },
  { name: 'Background Neutral', path: 'background/neutral', hex: '#ECF1FF' },
  { name: 'Background Accent', path: 'background/accent', hex: '#FEF9EF' },
  { name: 'Background Accent Mid', path: 'background/accent-mid', hex: '#F3C060' },
  { name: 'Background Brand Subtle', path: 'background/brand-subtle', hex: '#7F8B9A' },
  { name: 'Background Table', path: 'background/table', hex: '#F3F5FB' },
  { name: 'Background Secondary', path: 'background/secondary', hex: '#FEF9EF' },
  { name: 'Background Brand Light', path: 'background/brand-light', hex: '#ECF1FF' },
];

// ============================================================================
// THEME 4: Home - SEM
// ============================================================================
const HOME_SEM_TOKENS = [
  // Button - Primary
  { name: 'Primary Background', path: 'button/primary/bg', hex: '#2E5090' },
  { name: 'Primary Text', path: 'button/primary/text', hex: '#FFFFFF' },
  { name: 'Primary Hover Background', path: 'button/primary/hover-bg', hex: '#1E3A6E' },
  
  // Button - Secondary
  { name: 'Secondary Background', path: 'button/secondary/bg', hex: '#F0F4F8' },
  { name: 'Secondary Text', path: 'button/secondary/text', hex: '#2E5090' },
  
  // Background
  { name: 'Background White', path: 'background/white', hex: '#FFFFFF' },
  { name: 'Background Neutral Subtle', path: 'background/neutral-subtle', hex: '#F4F6F9' },
  { name: 'Background Brand', path: 'background/brand', hex: '#2E5090' },
  
  // Foreground
  { name: 'Foreground Heading', path: 'foreground/heading', hex: '#1A1A2E' },
  { name: 'Foreground Body', path: 'foreground/body', hex: '#4A4A68' },
];

// ============================================================================
// THEME 5: Compare Coverage (Advisor SEM)
// ============================================================================
const COMPARE_COVERAGE_TOKENS = [
  // Button - Primary
  { name: 'Primary Background', path: 'button/primary/bg', hex: '#0066CC' },
  { name: 'Primary Text', path: 'button/primary/text', hex: '#FFFFFF' },
  { name: 'Primary Hover Background', path: 'button/primary/hover-bg', hex: '#004C99' },
  
  // Button - Secondary
  { name: 'Secondary Background', path: 'button/secondary/bg', hex: '#F5F7FA' },
  { name: 'Secondary Text', path: 'button/secondary/text', hex: '#0066CC' },
  
  // Background
  { name: 'Background White', path: 'background/white', hex: '#FFFFFF' },
  { name: 'Background Neutral Subtle', path: 'background/neutral-subtle', hex: '#F5F7FA' },
  { name: 'Background Brand', path: 'background/brand', hex: '#0066CC' },
  
  // Foreground
  { name: 'Foreground Heading', path: 'foreground/heading', hex: '#1A1A2E' },
  { name: 'Foreground Body', path: 'foreground/body', hex: '#4A4A68' },
];

// ============================================================================
// THEME DEFINITIONS
// ============================================================================
const THEMES = [
  { 
    name: 'Health - SEM', 
    slug: 'health-sem', 
    description: 'Forbes Advisor Health SEM theme - Green/teal palette for health-related content',
    tokens: HEALTH_SEM_TOKENS 
  },
  { 
    name: 'ForbesMedia - SEO', 
    slug: 'forbesmedia-seo', 
    description: 'Forbes Media SEO theme - Blue palette for SEO content',
    tokens: FORBES_MEDIA_SEO_TOKENS 
  },
  { 
    name: 'LLM', 
    slug: 'llm', 
    description: 'Forbes Advisor LLM theme - Blue/gold palette for AI-generated content',
    tokens: LLM_TOKENS 
  },
  { 
    name: 'Home - SEM', 
    slug: 'home-sem', 
    description: 'Forbes Advisor Home SEM theme - Dark blue palette for home services',
    tokens: HOME_SEM_TOKENS 
  },
  { 
    name: 'Compare Coverage', 
    slug: 'compare-coverage', 
    description: 'Forbes Advisor Compare Coverage theme - Bright blue palette for insurance comparison',
    tokens: COMPARE_COVERAGE_TOKENS 
  },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

/**
 * Seed a single theme with its tokens
 */
async function seedTheme(themeData) {
  const { name, slug, description, tokens } = themeData;
  
  console.log(`\n📦 Processing theme: ${name}`);
  
  // Check if theme already exists
  const { data: existing } = await supabase
    .from('themes')
    .select('id')
    .eq('slug', slug)
    .single();
  
  if (existing) {
    console.log(`  ⏭️  Theme "${name}" already exists (ID: ${existing.id}), skipping...`);
    
    // Count existing tokens
    const { count } = await supabase
      .from('tokens')
      .select('*', { count: 'exact', head: true })
      .eq('theme_id', existing.id);
    
    return { themeId: existing.id, tokenCount: count || 0, skipped: true };
  }
  
  // Create theme
  const { data: theme, error: themeError } = await supabase
    .from('themes')
    .insert({
      name,
      slug,
      description,
      status: 'published',
      source: 'import',
    })
    .select()
    .single();
  
  if (themeError) {
    console.error(`  ❌ Error creating theme:`, themeError.message);
    return null;
  }
  
  console.log(`  ✓ Created theme with ID: ${theme.id}`);
  
  // Transform and insert color tokens
  const tokenRecords = tokens.map((token, index) => ({
    theme_id: theme.id,
    name: token.name,
    path: token.path,
    category: 'color',
    type: 'color',
    value: createColorValue(token.hex),
    css_variable: pathToCssVariable(token.path),
    sort_order: index,
  }));
  
  const { data: insertedTokens, error: tokenError } = await supabase
    .from('tokens')
    .insert(tokenRecords)
    .select();
  
  if (tokenError) {
    console.error(`  ❌ Error inserting tokens:`, tokenError.message);
    return { themeId: theme.id, tokenCount: 0, skipped: false };
  }
  
  console.log(`  ✓ Added ${insertedTokens.length} color tokens`);
  
  return { themeId: theme.id, tokenCount: insertedTokens.length, skipped: false };
}

/**
 * Main seed function
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎨 FORBES ADVISOR DESIGN SYSTEM - Theme Seed Script');
  console.log('═══════════════════════════════════════════════════════════════');
  
  let totalThemes = 0;
  let totalTokens = 0;
  let skippedThemes = 0;
  
  for (const theme of THEMES) {
    const result = await seedTheme(theme);
    if (result) {
      totalThemes++;
      totalTokens += result.tokenCount;
      if (result.skipped) skippedThemes++;
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ SEED COMPLETE!');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n📊 Summary:`);
  console.log(`   Themes processed: ${totalThemes}`);
  console.log(`   Themes skipped (already exist): ${skippedThemes}`);
  console.log(`   New themes created: ${totalThemes - skippedThemes}`);
  console.log(`   Total tokens: ${totalTokens}`);
  
  console.log(`\n📋 Themes:`);
  THEMES.forEach(t => {
    const tokenCount = t.tokens.length;
    console.log(`   • ${t.name} (${t.slug}) - ${tokenCount} tokens`);
  });
  
  console.log(`\nTHEMES SEEDED: ${totalThemes} themes, ${totalTokens} total tokens`);
}

// Run the seed script
main().catch(console.error);








