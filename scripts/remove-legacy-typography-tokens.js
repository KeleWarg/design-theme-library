/**
 * One-time cleanup: remove ALL legacy typography tokens.
 *
 * Keeps only role-derived composite typography tokens:
 *   tokens.path LIKE 'typography/role/%'
 *
 * Everything else in category 'typography' is deleted (font-size/line-height/etc,
 * old composite tokens, font-family tokens, etc.)
 *
 * Run:
 *   node scripts/remove-legacy-typography-tokens.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables.');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧹 CLEANUP - Remove legacy typography tokens');
  console.log('═══════════════════════════════════════════════════════════════');

  const { data: themes, error: themesErr } = await supabase
    .from('themes')
    .select('id, slug')
    .order('created_at', { ascending: true });
  if (themesErr) throw themesErr;

  let totalDeleted = 0;

  for (const theme of themes || []) {
    // Fetch all typography tokens that are NOT role tokens
    const { data: legacyTokens, error: fetchErr } = await supabase
      .from('tokens')
      .select('id, path, css_variable')
      .eq('theme_id', theme.id)
      .eq('category', 'typography')
      .not('path', 'like', 'typography/role/%');

    if (fetchErr) throw fetchErr;

    if (!legacyTokens?.length) {
      console.log(`✓ ${theme.slug}: deleted 0`);
      continue;
    }

    const ids = legacyTokens.map(t => t.id);

    const { error: delErr } = await supabase
      .from('tokens')
      .delete()
      .in('id', ids);

    if (delErr) throw delErr;

    totalDeleted += ids.length;
    console.log(`✓ ${theme.slug}: deleted ${ids.length}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ DONE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`total deleted: ${totalDeleted}`);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});


