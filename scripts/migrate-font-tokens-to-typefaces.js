/**
 * Migration Script: Populate typefaces table from font-family tokens
 * 
 * This script reads font-family tokens from the tokens table and creates
 * corresponding entries in the typefaces table for each theme.
 * 
 * Token naming patterns mapped to typeface roles:
 * - font-family-heading, font-family-heading-serif → display (headlines)
 * - font-family-body, font-family-sans → text (body copy)
 * - font-family-serif, font-family-body-serif → accent (secondary)
 * - font-family-breadcrumbs → accent (navigation)
 * 
 * Run: node scripts/migrate-font-tokens-to-typefaces.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from project root
config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Map token name to typeface role
 */
function getTypefaceRole(tokenName) {
  // Primary heading fonts → display
  if (tokenName.includes('heading') && !tokenName.includes('serif')) {
    return 'display';
  }
  // Sans-serif body → text
  if (tokenName.includes('sans') || (tokenName.includes('body') && !tokenName.includes('serif'))) {
    return 'text';
  }
  // Serif variants → accent (decorative/secondary)
  if (tokenName.includes('serif') || tokenName.includes('breadcrumbs')) {
    return 'accent';
  }
  // Default fallback
  return 'text';
}

/**
 * Get fallback stack based on font type
 */
function getFallback(family, role) {
  const familyLower = family.toLowerCase();
  
  // Known serif fonts
  if (familyLower.includes('georgia') || familyLower.includes('schnyder') || familyLower.includes('serif')) {
    return 'Georgia, serif';
  }
  
  // Known monospace fonts
  if (familyLower.includes('mono') || familyLower.includes('code')) {
    return 'ui-monospace, monospace';
  }
  
  // Default to sans-serif
  return 'system-ui, sans-serif';
}

/**
 * Determine source type based on font family name
 */
function getSourceType(family) {
  const googleFonts = ['inter', 'roboto', 'open sans', 'work sans', 'graphik'];
  const systemFonts = ['georgia', 'arial', 'times', 'helvetica'];
  
  const familyLower = family.toLowerCase();
  
  if (googleFonts.some(f => familyLower.includes(f))) {
    return 'google';
  }
  if (systemFonts.some(f => familyLower.includes(f))) {
    return 'system';
  }
  // Custom/unknown fonts
  return 'custom';
}

async function migrateTypefaces() {
  console.log('🚀 Starting typeface migration...\n');

  // 1. Get all font-family tokens
  const { data: fontTokens, error: tokensError } = await supabase
    .from('tokens')
    .select('theme_id, name, value')
    .ilike('name', '%font-family%')
    .order('theme_id');

  if (tokensError) {
    console.error('Failed to fetch font tokens:', tokensError);
    process.exit(1);
  }

  console.log(`Found ${fontTokens.length} font-family tokens\n`);

  // 2. Get all themes for reference
  const { data: themes } = await supabase
    .from('themes')
    .select('id, name');

  const themeMap = themes.reduce((acc, t) => {
    acc[t.id] = t.name;
    return acc;
  }, {});

  // 3. Group tokens by theme
  const tokensByTheme = fontTokens.reduce((acc, token) => {
    if (!acc[token.theme_id]) {
      acc[token.theme_id] = [];
    }
    acc[token.theme_id].push(token);
    return acc;
  }, {});

  // 4. Get existing typefaces to avoid duplicates
  const { data: existingTypefaces } = await supabase
    .from('typefaces')
    .select('theme_id, role, family');

  const existingSet = new Set(
    existingTypefaces?.map(t => `${t.theme_id}:${t.role}:${t.family}`) || []
  );

  // 5. Process each theme
  let created = 0;
  let skipped = 0;

  for (const [themeId, tokens] of Object.entries(tokensByTheme)) {
    const themeName = themeMap[themeId] || themeId;
    console.log(`\n📁 Processing theme: ${themeName}`);

    // Track roles already assigned for this theme to avoid duplicates
    const assignedRoles = new Set();

    for (const token of tokens) {
      const family = token.value?.family;
      if (!family) {
        console.log(`  ⚠️  Skipping ${token.name}: no family value`);
        continue;
      }

      const role = getTypefaceRole(token.name);
      const fallback = getFallback(family, role);
      const sourceType = getSourceType(family);

      // Skip if role already assigned for this theme (use first occurrence)
      if (assignedRoles.has(role)) {
        console.log(`  ⏭️  Skipping ${family} (${role}): role already assigned`);
        skipped++;
        continue;
      }

      // Check if already exists
      const key = `${themeId}:${role}:${family}`;
      if (existingSet.has(key)) {
        console.log(`  ✅ Already exists: ${family} as ${role}`);
        assignedRoles.add(role);
        skipped++;
        continue;
      }

      // Create typeface entry
      const typefaceData = {
        theme_id: themeId,
        role,
        family,
        fallback,
        source_type: sourceType,
        weights: [400, 500, 600, 700],
        is_variable: false
      };

      const { error: insertError } = await supabase
        .from('typefaces')
        .insert(typefaceData);

      if (insertError) {
        // Handle unique constraint violation (role already exists)
        if (insertError.code === '23505') {
          console.log(`  ⚠️  ${family}: Role ${role} already exists for this theme`);
          skipped++;
        } else {
          console.error(`  ❌ Failed to create ${family}:`, insertError.message);
        }
      } else {
        console.log(`  ✓ Created: ${family} as ${role} (${sourceType})`);
        assignedRoles.add(role);
        created++;
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Migration complete!`);
  console.log(`   Created: ${created} typefaces`);
  console.log(`   Skipped: ${skipped} (duplicates or already exist)`);
  console.log('='.repeat(50) + '\n');

  // 6. Display final state
  const { data: allTypefaces } = await supabase
    .from('typefaces')
    .select('*, themes(name)')
    .order('theme_id');

  console.log('📊 Final typefaces state:\n');
  
  const byTheme = allTypefaces?.reduce((acc, tf) => {
    const themeName = tf.themes?.name || 'Unknown';
    if (!acc[themeName]) acc[themeName] = [];
    acc[themeName].push(tf);
    return acc;
  }, {});

  for (const [themeName, typefaces] of Object.entries(byTheme || {})) {
    console.log(`  ${themeName}:`);
    for (const tf of typefaces) {
      console.log(`    - ${tf.role}: ${tf.family} (${tf.source_type})`);
    }
  }
}

migrateTypefaces().catch(console.error);

