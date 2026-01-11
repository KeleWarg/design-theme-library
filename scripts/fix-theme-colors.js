/**
 * @chunk - Fix Theme Colors Script
 * 
 * Fixes incorrect color tokens for Home-SEM and Compare Coverage themes.
 * Run with: node scripts/fix-theme-colors.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// HOME - SEM (Coral/Peach palette)
// ============================================================================
const HOME_SEM_COLORS = [
  // Button - Primary (Coral)
  { name: 'Primary Background', path: 'button/primary/bg', hex: '#EA7F67' },
  { name: 'Primary Text', path: 'button/primary/text', hex: '#FFFFFF' },
  { name: 'Primary Icon', path: 'button/primary/icon', hex: '#FFFFFF' },
  { name: 'Primary Hover Background', path: 'button/primary/hover-bg', hex: '#CF664E' },
  { name: 'Primary Pressed Background', path: 'button/primary/pressed-bg', hex: '#C9492C' },
  { name: 'Primary Disabled Background', path: 'button/primary/disabled-bg', hex: '#EA7F67' },
  { name: 'Focused Border', path: 'button/primary/focused-border', hex: '#80CAF4' },
  // Button - Secondary
  { name: 'Secondary Background', path: 'button/secondary/bg', hex: '#FDEAE6' },
  { name: 'Secondary Border', path: 'button/secondary/border', hex: '#EA7F67' },
  { name: 'Secondary Text', path: 'button/secondary/text', hex: '#EA7F67' },
  { name: 'Secondary Icon', path: 'button/secondary/icon', hex: '#C9492C' },
  { name: 'Secondary Hover Background', path: 'button/secondary/hover-bg', hex: '#F7C2B7' },
  { name: 'Secondary Pressed Background', path: 'button/secondary/pressed-bg', hex: '#F7A794' },
  { name: 'Secondary Disabled Background', path: 'button/secondary/disabled-bg', hex: '#FDEAE6' },
  // Button - Ghost
  { name: 'Ghost Background', path: 'button/ghost/bg', hex: '#FFFFFF' },
  { name: 'Ghost Text', path: 'button/ghost/text', hex: '#C9492C' },
  { name: 'Ghost Icon', path: 'button/ghost/icon', hex: '#C9492C' },
  { name: 'Ghost Hover Background', path: 'button/ghost/hover-bg', hex: '#F7C2B7' },
  { name: 'Ghost Pressed Background', path: 'button/ghost/pressed-bg', hex: '#F7C2B7' },
  { name: 'Ghost Disabled Background', path: 'button/ghost/disabled-bg', hex: '#D7DCE5' },
  // Background
  { name: 'Background White', path: 'background/white', hex: '#FFFFFF' },
  { name: 'Background Neutral Subtle', path: 'background/neutral-subtle', hex: '#F4F5F8' },
  { name: 'Background Neutral Light', path: 'background/neutral-light', hex: '#ECEFF3' },
  { name: 'Background Neutral', path: 'background/neutral', hex: '#E3E7ED' },
  { name: 'Background Accent', path: 'background/accent', hex: '#FEFBF5' },
  { name: 'Background Accent Mid', path: 'background/accent-mid', hex: '#FEFBF5' },
  { name: 'Background Brand Subtle', path: 'background/brand-subtle', hex: '#FDEAE6' },
  { name: 'Background Table', path: 'background/table', hex: '#F0F3FF' },
  { name: 'Background Secondary', path: 'background/secondary', hex: '#F7C2B7' },
  { name: 'Background Brand Light', path: 'background/brand-light', hex: '#F7C2B7' },
  { name: 'Background Brand Mid', path: 'background/brand-mid', hex: '#F7A794' },
  { name: 'Background Brand', path: 'background/brand', hex: '#EA7F67' },
  { name: 'Background Neutral Mid', path: 'background/neutral-mid', hex: '#383C43' },
  { name: 'Background Neutral Strong', path: 'background/neutral-strong', hex: '#2B2E34' },
  { name: 'Background Header', path: 'background/header', hex: '#1E2125' },
  { name: 'Background Superlative', path: 'background/superlative', hex: '#ED6E13' },
  { name: 'Background Button', path: 'background/button', hex: '#EA7F67' },
  // Foreground
  { name: 'Foreground Heading', path: 'foreground/heading', hex: '#1E2125' },
  { name: 'Foreground Body', path: 'foreground/body', hex: '#383C43' },
  { name: 'Foreground Link Secondary', path: 'foreground/link-secondary', hex: '#383C43' },
  { name: 'Foreground Caption', path: 'foreground/caption', hex: '#616A76' },
  { name: 'Foreground Stroke UI', path: 'foreground/stroke-ui', hex: '#7F8B9A' },
  { name: 'Foreground Link', path: 'foreground/link', hex: '#EA7F67' },
  { name: 'Foreground Stroke UI Inverse', path: 'foreground/stroke-ui-inverse', hex: '#D7DCE5' },
  { name: 'Foreground Heading Inverse', path: 'foreground/heading-inverse', hex: '#FFFFFF' },
  { name: 'Foreground Body Inverse', path: 'foreground/body-inverse', hex: '#F4F5F8' },
  { name: 'Foreground Caption Inverse', path: 'foreground/caption-inverse', hex: '#D7DCE5' },
  { name: 'Foreground Table Border', path: 'foreground/table-border', hex: '#BFC7D4' },
  { name: 'Foreground Stroke Default', path: 'foreground/stroke-default', hex: '#BFC7D4' },
  { name: 'Foreground Divider', path: 'foreground/divider', hex: '#D7DCE5' },
];

// ============================================================================
// COMPARE COVERAGE (Green/Blue palette)
// ============================================================================
const COMPARE_COVERAGE_COLORS = [
  // Button - Primary (Green)
  { name: 'Primary Background', path: 'button/primary/bg', hex: '#35B782' },
  { name: 'Primary Text', path: 'button/primary/text', hex: '#FFFFFF' },
  { name: 'Primary Icon', path: 'button/primary/icon', hex: '#FFFFFF' },
  { name: 'Primary Hover Background', path: 'button/primary/hover-bg', hex: '#1E9E6A' },
  { name: 'Primary Pressed Background', path: 'button/primary/pressed-bg', hex: '#0C8553' },
  { name: 'Primary Disabled Background', path: 'button/primary/disabled-bg', hex: '#35B782' },
  { name: 'Focused Border', path: 'button/primary/focused-border', hex: '#209BE3' },
  // Button - Secondary (Blue)
  { name: 'Secondary Background', path: 'button/secondary/bg', hex: '#FFFFFF' },
  { name: 'Secondary Border', path: 'button/secondary/border', hex: '#7A8EC7' },
  { name: 'Secondary Text', path: 'button/secondary/text', hex: '#3453A7' },
  { name: 'Secondary Icon', path: 'button/secondary/icon', hex: '#3453A7' },
  { name: 'Secondary Hover Background', path: 'button/secondary/hover-bg', hex: '#F0F3FF' },
  { name: 'Secondary Pressed Background', path: 'button/secondary/pressed-bg', hex: '#E7ECF8' },
  { name: 'Secondary Disabled Background', path: 'button/secondary/disabled-bg', hex: '#ECEFF3' },
  // Button - Ghost (Blue)
  { name: 'Ghost Background', path: 'button/ghost/bg', hex: '#FFFFFF' },
  { name: 'Ghost Text', path: 'button/ghost/text', hex: '#3453A7' },
  { name: 'Ghost Icon', path: 'button/ghost/icon', hex: '#3453A7' },
  { name: 'Ghost Hover Background', path: 'button/ghost/hover-bg', hex: '#F0F3FF' },
  { name: 'Ghost Pressed Background', path: 'button/ghost/pressed-bg', hex: '#E7ECF8' },
  { name: 'Ghost Disabled Background', path: 'button/ghost/disabled-bg', hex: '#ECEFF3' },
  // Background
  { name: 'Background White', path: 'background/white', hex: '#FFFFFF' },
  { name: 'Background Neutral Subtle', path: 'background/neutral-subtle', hex: '#F4F5F8' },
  { name: 'Background Neutral Light', path: 'background/neutral-light', hex: '#ECEFF3' },
  { name: 'Background Neutral', path: 'background/neutral', hex: '#E3E7ED' },
  { name: 'Background Accent', path: 'background/accent', hex: '#FEC864' },
  { name: 'Background Accent Mid', path: 'background/accent-mid', hex: '#FEC864' },
  { name: 'Background Brand Subtle', path: 'background/brand-subtle', hex: '#F5F7FF' },
  { name: 'Background Table', path: 'background/table', hex: '#F5F7FF' },
  { name: 'Background Secondary', path: 'background/secondary', hex: '#C5EDE1' },
  { name: 'Background Brand Light', path: 'background/brand-light', hex: '#E7ECF8' },
  { name: 'Background Brand Mid', path: 'background/brand-mid', hex: '#2F4B97' },
  { name: 'Background Brand', path: 'background/brand', hex: '#3453A7' },
  { name: 'Background Neutral Mid', path: 'background/neutral-mid', hex: '#383C43' },
  { name: 'Background Neutral Strong', path: 'background/neutral-strong', hex: '#2B2E34' },
  { name: 'Background Header', path: 'background/header', hex: '#1E2125' },
  { name: 'Background Superlative', path: 'background/superlative', hex: '#ED6E13' },
  { name: 'Background Button', path: 'background/button', hex: '#35B782' },
  // Foreground
  { name: 'Foreground Heading', path: 'foreground/heading', hex: '#1E2125' },
  { name: 'Foreground Body', path: 'foreground/body', hex: '#383C43' },
  { name: 'Foreground Link Secondary', path: 'foreground/link-secondary', hex: '#383C43' },
  { name: 'Foreground Caption', path: 'foreground/caption', hex: '#616A76' },
  { name: 'Foreground Stroke UI', path: 'foreground/stroke-ui', hex: '#7F8B9A' },
  { name: 'Foreground Link', path: 'foreground/link', hex: '#4759B2' },
  { name: 'Foreground Stroke UI Inverse', path: 'foreground/stroke-ui-inverse', hex: '#D7DCE5' },
  { name: 'Foreground Heading Inverse', path: 'foreground/heading-inverse', hex: '#FFFFFF' },
  { name: 'Foreground Body Inverse', path: 'foreground/body-inverse', hex: '#F4F5F8' },
  { name: 'Foreground Caption Inverse', path: 'foreground/caption-inverse', hex: '#D7DCE5' },
  { name: 'Foreground Table Border', path: 'foreground/table-border', hex: '#C5CCED' },
  { name: 'Foreground Stroke Default', path: 'foreground/stroke-default', hex: '#BFC7D4' },
  { name: 'Foreground Divider', path: 'foreground/divider', hex: '#D7DCE5' },
];

// ============================================================================
// UTILITY
// ============================================================================

function createColorValue(hex) {
  return {
    hex,
    rgb: { r: 0, g: 0, b: 0 },
    opacity: 1
  };
}

// ============================================================================
// UPDATE FUNCTION
// ============================================================================

async function updateThemeColors(slug, colors) {
  console.log(`\n📦 Updating colors for: ${slug}`);
  
  // Get theme ID
  const { data: theme, error: themeError } = await supabase
    .from('themes')
    .select('id')
    .eq('slug', slug)
    .single();
  
  if (themeError || !theme) {
    console.error(`  ❌ Theme not found: ${slug}`);
    return null;
  }
  
  // Delete existing color tokens
  const { error: deleteError } = await supabase
    .from('tokens')
    .delete()
    .eq('theme_id', theme.id)
    .eq('category', 'color');
  
  if (deleteError) {
    console.error(`  ❌ Error deleting old tokens:`, deleteError.message);
    return null;
  }
  
  console.log(`  ✓ Deleted old color tokens`);
  
  // Insert correct colors
  const tokenRecords = colors.map((token, index) => ({
    theme_id: theme.id,
    name: token.name,
    path: token.path,
    category: 'color',
    type: 'color',
    value: createColorValue(token.hex),
    css_variable: '--' + token.path.toLowerCase().replace(/\//g, '-'),
    sort_order: index,
  }));
  
  const { data: inserted, error: insertError } = await supabase
    .from('tokens')
    .insert(tokenRecords)
    .select();
  
  if (insertError) {
    console.error(`  ❌ Error inserting tokens:`, insertError.message);
    return null;
  }
  
  console.log(`  ✓ Added ${inserted.length} correct color tokens`);
  return inserted.length;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔧 FIX THEME COLORS - Home-SEM & Compare Coverage');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const homeSemCount = await updateThemeColors('home-sem', HOME_SEM_COLORS);
  const compareCoverageCount = await updateThemeColors('compare-coverage', COMPARE_COVERAGE_COLORS);
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ THEME COLORS FIXED');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n📊 Results:');
  console.log(`   • Home - SEM: ${homeSemCount || 0} tokens (Coral #EA7F67)`);
  console.log(`   • Compare Coverage: ${compareCoverageCount || 0} tokens (Green #35B782, Blue #3453A7)`);
}

main().catch(console.error);







