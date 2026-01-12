/**
 * @chunk 2.xx - Typography Role Registry (Universal Titles)
 *
 * Canonical list of typography role titles used across ALL themes.
 * Themes may override any role’s values; if a value is left blank/null,
 * the system falls back to these defaults.
 */

/**
 * Breakpoints used for responsive typography overrides.
 * These align with the app’s preview modes (desktop/tablet/mobile) and typical breakpoints.
 */
export const TYPOGRAPHY_BREAKPOINTS = {
  tabletMaxWidthPx: 768,
  mobileMaxWidthPx: 480,
};

/**
 * Universal typography roles (titles).
 *
 * Notes:
 * - Defaults are intentionally generic; theme-specific values live in `typography_roles`.
 * - `defaultSizeTablet`/`defaultSizeMobile` default to desktop size unless specified.
 */
export const TYPOGRAPHY_ROLE_REGISTRY = [
  // Display / headings
  { name: 'display', typefaceRole: 'display', defaultSize: '3rem', defaultWeight: 700, defaultLineHeight: '1.1', defaultLetterSpacing: '-0.02em', description: 'Hero headlines' },
  { name: 'heading-xl', typefaceRole: 'display', defaultSize: '2.25rem', defaultWeight: 700, defaultLineHeight: '1.2', defaultLetterSpacing: '-0.01em', description: 'Page titles' },
  { name: 'heading-lg', typefaceRole: 'display', defaultSize: '1.875rem', defaultWeight: 600, defaultLineHeight: '1.25', defaultLetterSpacing: '-0.01em', description: 'Section headers' },
  { name: 'heading-md', typefaceRole: 'display', defaultSize: '1.5rem', defaultWeight: 600, defaultLineHeight: '1.3', defaultLetterSpacing: 'normal', description: 'Card headers' },
  { name: 'heading-sm', typefaceRole: 'display', defaultSize: '1.25rem', defaultWeight: 600, defaultLineHeight: '1.4', defaultLetterSpacing: 'normal', description: 'Subheadings' },
  { name: 'heading-xs', typefaceRole: 'display', defaultSize: '1.125rem', defaultWeight: 600, defaultLineHeight: '1.4', defaultLetterSpacing: 'normal', description: 'Small headings' },

  // Titles (common in your Figma sets)
  { name: 'title-lg', typefaceRole: 'text', defaultSize: '1.125rem', defaultWeight: 600, defaultLineHeight: '1.4', defaultLetterSpacing: 'normal', description: 'Large title' },
  { name: 'title-md', typefaceRole: 'text', defaultSize: '1rem', defaultWeight: 600, defaultLineHeight: '1.4', defaultLetterSpacing: 'normal', description: 'Medium title' },
  { name: 'title-sm', typefaceRole: 'text', defaultSize: '0.875rem', defaultWeight: 600, defaultLineHeight: '1.4', defaultLetterSpacing: 'normal', description: 'Small title' },
  { name: 'title-xs', typefaceRole: 'text', defaultSize: '0.75rem', defaultWeight: 600, defaultLineHeight: '1.4', defaultLetterSpacing: 'normal', description: 'Extra small title' },

  // Body
  { name: 'body-lg', typefaceRole: 'text', defaultSize: '1.125rem', defaultWeight: 400, defaultLineHeight: '1.6', defaultLetterSpacing: 'normal', description: 'Intro paragraphs' },
  { name: 'body-md', typefaceRole: 'text', defaultSize: '1rem', defaultWeight: 400, defaultLineHeight: '1.5', defaultLetterSpacing: 'normal', description: 'Body copy' },
  { name: 'body-sm', typefaceRole: 'text', defaultSize: '0.875rem', defaultWeight: 400, defaultLineHeight: '1.5', defaultLetterSpacing: 'normal', description: 'Secondary text' },
  { name: 'body-xs', typefaceRole: 'text', defaultSize: '0.75rem', defaultWeight: 400, defaultLineHeight: '1.5', defaultLetterSpacing: 'normal', description: 'Extra small body' },
  { name: 'body-2xs', typefaceRole: 'text', defaultSize: '0.6875rem', defaultWeight: 400, defaultLineHeight: '1.5', defaultLetterSpacing: 'normal', description: 'Tiny body' },
  // Some systems have serif variants; keep the title universal, let themes decide the typeface_role/value.
  { name: 'body-lg-serif', typefaceRole: 'text', defaultSize: '1.125rem', defaultWeight: 400, defaultLineHeight: '1.6', defaultLetterSpacing: 'normal', description: 'Intro paragraphs (serif variant)' },

  // Labels
  { name: 'label-lg', typefaceRole: 'text', defaultSize: '1rem', defaultWeight: 500, defaultLineHeight: '1.4', defaultLetterSpacing: '0.01em', description: 'Large label' },
  { name: 'label-md', typefaceRole: 'text', defaultSize: '0.875rem', defaultWeight: 500, defaultLineHeight: '1.4', defaultLetterSpacing: '0.01em', description: 'Medium label' },
  { name: 'label-sm', typefaceRole: 'text', defaultSize: '0.75rem', defaultWeight: 500, defaultLineHeight: '1.4', defaultLetterSpacing: '0.01em', description: 'Small label' },
  { name: 'label-xs', typefaceRole: 'text', defaultSize: '0.6875rem', defaultWeight: 500, defaultLineHeight: '1.4', defaultLetterSpacing: '0.01em', description: 'Tiny label' },
  { name: 'label-eyebrow', typefaceRole: 'text', defaultSize: '0.875rem', defaultWeight: 600, defaultLineHeight: '1.3', defaultLetterSpacing: '0.08em', description: 'Eyebrow label' },
  { name: 'label-breadcrumb', typefaceRole: 'text', defaultSize: '0.75rem', defaultWeight: 500, defaultLineHeight: '1.3', defaultLetterSpacing: 'normal', description: 'Breadcrumb label' },

  // Caption + code
  { name: 'caption', typefaceRole: 'text', defaultSize: '0.75rem', defaultWeight: 400, defaultLineHeight: '1.4', defaultLetterSpacing: '0.02em', description: 'Image captions' },
  { name: 'mono', typefaceRole: 'mono', defaultSize: '0.875rem', defaultWeight: 400, defaultLineHeight: '1.5', defaultLetterSpacing: 'normal', description: 'Code blocks' },
];

export function getTypographyRoleDefinition(roleName) {
  return TYPOGRAPHY_ROLE_REGISTRY.find(r => r.name === roleName) || null;
}



