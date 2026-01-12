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
import { TYPOGRAPHY_ROLE_REGISTRY } from '../lib/typographyRoleRegistry';

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

function buildCompositeToken(themeId, roleName, roleOverride, sortOrder, typefaceMap) {
  const registry = TYPOGRAPHY_ROLE_REGISTRY.find(r => r.name === roleName);
  const effectiveTypefaceRole = normalizeTypefaceRole(roleOverride?.typeface_role ?? registry?.typefaceRole);

  const desktopSize = roleOverride?.font_size ?? registry?.defaultSize ?? '1rem';
  const tabletSize = roleOverride?.font_size_tablet ?? registry?.defaultSizeTablet ?? desktopSize;
  const mobileSize = roleOverride?.font_size_mobile ?? registry?.defaultSizeMobile ?? tabletSize ?? desktopSize;

  const fontWeight = roleOverride?.font_weight ?? registry?.defaultWeight ?? 400;
  const lineHeight = roleOverride?.line_height ?? registry?.defaultLineHeight ?? '1.5';
  const letterSpacing = roleOverride?.letter_spacing ?? registry?.defaultLetterSpacing ?? 'normal';

  const resolvedFontFamily = buildFontStack(typefaceMap?.[effectiveTypefaceRole]) || 'inherit';

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
      // Responsive: desktop/tablet/mobile
      fontSize: { desktop: desktopSize, tablet: tabletSize, mobile: mobileSize },
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

    const typefaceMap = (typefaces || []).reduce((acc, tf) => {
      acc[normalizeTypefaceRole(tf.role)] = tf;
      return acc;
    }, {});

    const overridesByName = new Map((roles || []).map(r => [r.role_name, r]));

    // 1) Universal registry roles (always generated)
    const registryTokens = TYPOGRAPHY_ROLE_REGISTRY.map((r, idx) =>
      buildCompositeToken(themeId, r.name, overridesByName.get(r.name), idx, typefaceMap)
    );

    // 2) Any custom/legacy roles not in the registry (still generate to avoid breaking existing themes)
    const registryNames = new Set(TYPOGRAPHY_ROLE_REGISTRY.map(r => r.name));
    const customRoles = (roles || []).filter(r => !registryNames.has(r.role_name));
    const customTokens = customRoles.map((r, i) =>
      buildCompositeToken(themeId, r.role_name, r, registryTokens.length + i, typefaceMap)
    );

    const tokenRecords = [...registryTokens, ...customTokens];

    const { data: upserted, error: upsertError } = await supabase
      .from('tokens')
      .upsert(tokenRecords, { onConflict: 'theme_id,path' })
      .select();

    if (upsertError) throw upsertError;

    return { themeId, upserted: upserted?.length || 0, skipped: false };
  },
};

export default typographyTokenService;


