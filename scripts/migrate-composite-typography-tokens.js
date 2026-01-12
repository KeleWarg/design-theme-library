/**
 * One-time migration: backfill composite typography tokens for ALL themes.
 *
 * What it does:
 * - Upserts one composite typography token per `typography_roles.role_name`:
 *     --typography-{role}-family/size/weight/line-height/letter-spacing
 *   with `fontFamily` embedded as the resolved font stack for the selected typeface.
 *
 * Run:
 *   node scripts/migrate-composite-typography-tokens.js
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

const ROLE_ORDER = [
  'display',
  'heading-xl',
  'heading-lg',
  'heading-md',
  'heading-sm',
  'body-lg',
  'body-md',
  'body-sm',
  'label',
  'caption',
  'mono',
];

function normalizeTypefaceRole(typefaceRole) {
  const r = String(typefaceRole || '').toLowerCase();
  if (r === 'display' || r === 'text' || r === 'mono' || r === 'accent') return r;
  return 'text';
}

function buildFontFamilyToken(themeId, typeface) {
  const role = normalizeTypefaceRole(typeface.role);
  const family = typeface.family;
  const fallback = typeface.fallback || 'sans-serif';

  const fontStack = family && family.includes(' ') ? `"${family}"` : family;
  const value = family ? `${fontStack}, ${fallback}` : fallback;

  return {
    theme_id: themeId,
    name: `font-family-${role}`,
    path: `typography/font-family/${role}`,
    category: 'typography',
    type: 'fontFamily',
    css_variable: `--font-family-${role}`,
    value,
    sort_order: 0,
  };
}

function buildCompositeTypographyToken(themeId, role, sortOrder) {
  const roleName = role.role_name;
  const typefaceRole = normalizeTypefaceRole(role.typeface_role);
  const resolvedFontFamily = role.__resolvedFontFamily || 'inherit';

  return {
    theme_id: themeId,
    name: `typography-${roleName}`,
    path: `typography/role/${roleName}`,
    category: 'typography',
    type: 'typography-composite',
    css_variable: `--typography-${roleName}`,
    value: {
      fontFamily: resolvedFontFamily,
      fontSize: role.font_size || '1rem',
      fontWeight: role.font_weight ?? 400,
      lineHeight: role.line_height || '1.5',
      letterSpacing: role.letter_spacing || 'normal',
    },
    sort_order: sortOrder,
  };
}

async function migrateTheme(theme) {
  const themeId = theme.id;

  // Fetch typefaces + roles for this theme
  const [{ data: typefaces, error: tfErr }, { data: roles, error: rolesErr }] = await Promise.all([
    supabase.from('typefaces').select('id, role, family, fallback').eq('theme_id', themeId),
    supabase.from('typography_roles').select('*').eq('theme_id', themeId),
  ]);

  if (tfErr) throw tfErr;
  if (rolesErr) throw rolesErr;

  // Upsert composite typography tokens for each typography role
  if (!roles?.length) {
    return { themeId, slug: theme.slug, compositeUpserts: 0, skippedRoles: true };
  }

  const typefaceMap = (typefaces || []).reduce((acc, tf) => {
    acc[normalizeTypefaceRole(tf.role)] = tf;
    return acc;
  }, {});

  const buildFontStack = (tf) => {
    if (!tf?.family) return null;
    const family = String(tf.family).trim();
    if (!family) return null;
    const familyPart = family.includes(' ') ? `\"${family}\"` : family;
    const fallback = String(tf.fallback || 'sans-serif').trim() || 'sans-serif';
    return `${familyPart}, ${fallback}`;
  };

  const orderIndex = new Map(ROLE_ORDER.map((name, idx) => [name, idx]));
  const sortedRoles = [...roles].sort((a, b) => {
    const ai = orderIndex.has(a.role_name) ? orderIndex.get(a.role_name) : 999;
    const bi = orderIndex.has(b.role_name) ? orderIndex.get(b.role_name) : 999;
    if (ai !== bi) return ai - bi;
    return String(a.role_name).localeCompare(String(b.role_name));
  });

  const compositeTokens = sortedRoles.map((r, idx) => {
    const typefaceRole = normalizeTypefaceRole(r.typeface_role);
    const resolved = buildFontStack(typefaceMap[typefaceRole]) || 'inherit';
    return buildCompositeTypographyToken(themeId, { ...r, __resolvedFontFamily: resolved }, idx);
  });

  const { error: upsertErr } = await supabase
    .from('tokens')
    .upsert(compositeTokens, { onConflict: 'theme_id,path' });

  if (upsertErr) throw upsertErr;

  return { themeId, slug: theme.slug, compositeUpserts: compositeTokens.length, skippedRoles: false };
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧩 MIGRATION - Composite Typography Tokens');
  console.log('═══════════════════════════════════════════════════════════════');

  const { data: themes, error } = await supabase
    .from('themes')
    .select('id, slug')
    .order('created_at', { ascending: true });

  if (error) throw error;

  let totalFontFamily = 0;
  let totalComposite = 0;
  let skipped = 0;

  for (const theme of themes || []) {
    try {
      const res = await migrateTheme(theme);
      totalComposite += res.compositeUpserts;
      if (res.skippedRoles) skipped += 1;
      console.log(`✓ ${res.slug}: composite upserts=${res.compositeUpserts}${res.skippedRoles ? ' (no roles, skipped composite)' : ''}`);
    } catch (e) {
      console.error(`❌ ${theme.slug}:`, e.message || e);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ DONE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`composite upserts: ${totalComposite}`);
  console.log(`themes skipped (no typography roles): ${skipped}`);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});


