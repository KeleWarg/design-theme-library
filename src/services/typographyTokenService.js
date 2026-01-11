/**
 * @chunk 2.24 - Typography Composite Token Sync
 *
 * Keeps `tokens` in sync with `typography_roles` by upserting one composite
 * typography token per semantic role.
 *
 * Key idea: composite tokens should be "wired" to the selected parent typeface
 * by embedding the resolved font stack for the current theme typeface role.
 * This keeps typography tokens self-contained (no extra "font family tokens").
 */

import { supabase } from '../lib/supabase';

/**
 * Stable ordering + defaults for roles (mirrors TypographyRoleEditor)
 */
export const TYPOGRAPHY_ROLE_DEFINITIONS = [
  { role_name: 'display', typeface_role: 'display', font_size: '3rem', font_weight: 700, line_height: '1.1', letter_spacing: '-0.02em' },
  { role_name: 'heading-xl', typeface_role: 'display', font_size: '2.25rem', font_weight: 700, line_height: '1.2', letter_spacing: '-0.01em' },
  { role_name: 'heading-lg', typeface_role: 'display', font_size: '1.875rem', font_weight: 600, line_height: '1.25', letter_spacing: '-0.01em' },
  { role_name: 'heading-md', typeface_role: 'display', font_size: '1.5rem', font_weight: 600, line_height: '1.3', letter_spacing: 'normal' },
  { role_name: 'heading-sm', typeface_role: 'display', font_size: '1.25rem', font_weight: 600, line_height: '1.4', letter_spacing: 'normal' },
  { role_name: 'body-lg', typeface_role: 'text', font_size: '1.125rem', font_weight: 400, line_height: '1.6', letter_spacing: 'normal' },
  { role_name: 'body-md', typeface_role: 'text', font_size: '1rem', font_weight: 400, line_height: '1.5', letter_spacing: 'normal' },
  { role_name: 'body-sm', typeface_role: 'text', font_size: '0.875rem', font_weight: 400, line_height: '1.5', letter_spacing: 'normal' },
  { role_name: 'label', typeface_role: 'text', font_size: '0.875rem', font_weight: 500, line_height: '1.4', letter_spacing: '0.01em' },
  { role_name: 'caption', typeface_role: 'text', font_size: '0.75rem', font_weight: 400, line_height: '1.4', letter_spacing: '0.02em' },
  { role_name: 'mono', typeface_role: 'mono', font_size: '0.875rem', font_weight: 400, line_height: '1.5', letter_spacing: 'normal' },
];

function normalizeTypefaceRole(typefaceRole) {
  const r = String(typefaceRole || '').toLowerCase();
  if (r === 'display' || r === 'text' || r === 'mono' || r === 'accent') return r;
  return 'text';
}

function buildFontStack(typeface) {
  if (!typeface?.family) return null;
  const family = String(typeface.family).trim();
  if (!family) return null;
  const familyPart = family.includes(' ') ? `"${family}"` : family;
  const fallback = String(typeface.fallback || 'sans-serif').trim() || 'sans-serif';
  return `${familyPart}, ${fallback}`;
}

function buildCompositeToken(themeId, role, sortOrder, typefaceMap) {
  const roleName = role?.role_name;
  const typefaceRole = normalizeTypefaceRole(role?.typeface_role);

  const fontSize = role?.font_size ?? '1rem';
  const fontWeight = role?.font_weight ?? 400;
  const lineHeight = role?.line_height ?? '1.5';
  const letterSpacing = role?.letter_spacing ?? 'normal';

  const resolvedFontFamily = buildFontStack(typefaceMap?.[typefaceRole]) || 'inherit';

  return {
    theme_id: themeId,
    name: `typography-${roleName}`,
    path: `typography/role/${roleName}`,
    category: 'typography',
    type: 'typography-composite',
    css_variable: `--typography-${roleName}`,
    value: {
      // Self-contained + always follows the theme's selected typeface for this role.
      fontFamily: resolvedFontFamily,
      fontSize,
      fontWeight,
      lineHeight,
      letterSpacing,
    },
    sort_order: sortOrder,
  };
}

export const typographyTokenService = {
  /**
   * Upsert composite typography tokens for a theme based on typography_roles.
   * Idempotent: safe to call repeatedly.
   */
  async syncCompositeTypographyTokensForTheme(themeId) {
    // Fetch roles + typefaces (needed to embed resolved font stack)
    const [{ data: roles, error: rolesError }, { data: typefaces, error: typefacesError }] = await Promise.all([
      supabase
        .from('typography_roles')
        .select('*')
        .eq('theme_id', themeId),
      supabase
        .from('typefaces')
        .select('role, family, fallback')
        .eq('theme_id', themeId),
    ]);

    if (rolesError) throw rolesError;
    if (typefacesError) throw typefacesError;

    if (!roles?.length) {
      return { themeId, upserted: 0, skipped: true };
    }

    const typefaceMap = (typefaces || []).reduce((acc, tf) => {
      acc[normalizeTypefaceRole(tf.role)] = tf;
      return acc;
    }, {});

    // Ensure stable ordering even if DB returns unordered roles.
    const definitionIndex = new Map(
      TYPOGRAPHY_ROLE_DEFINITIONS.map((d, i) => [d.role_name, i])
    );

    const sortedRoles = [...roles].sort((a, b) => {
      const ai = definitionIndex.has(a.role_name) ? definitionIndex.get(a.role_name) : 999;
      const bi = definitionIndex.has(b.role_name) ? definitionIndex.get(b.role_name) : 999;
      if (ai !== bi) return ai - bi;
      return String(a.role_name).localeCompare(String(b.role_name));
    });

    const tokenRecords = sortedRoles.map((role, idx) => buildCompositeToken(themeId, role, idx, typefaceMap));

    const { data: upserted, error: upsertError } = await supabase
      .from('tokens')
      .upsert(tokenRecords, { onConflict: 'theme_id,path' })
      .select();

    if (upsertError) throw upsertError;

    return { themeId, upserted: upserted?.length || 0, skipped: false };
  },
};

export default typographyTokenService;


