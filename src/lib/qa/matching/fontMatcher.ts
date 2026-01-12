/**
 * Font Matcher - Chunk 7.13
 *
 * Match extracted fonts to typography tokens in the design system.
 *
 * Matching criteria:
 * - Font family (exact match after normalization)
 * - Font size (within 2px tolerance)
 * - Font weight (exact match)
 *
 * Status thresholds:
 * - pass: All criteria match
 * - warn: One mismatch
 * - fail: Multiple mismatches or no token found
 */

import { LocatedFont } from '../extraction/domExtractor';

/**
 * Typography token from the design system
 */
export interface TypographyToken {
  role: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
}

/**
 * Token match information for fonts
 */
export interface FontTokenInfo {
  role: string;
  fontFamily: string;
  fontSize: string;
  cssVariable: string;
}

/**
 * Result of matching a font to typography tokens
 */
export interface FontMatch {
  source: LocatedFont;
  token?: FontTokenInfo;
  status: 'pass' | 'warn' | 'fail';
  issues: string[];
}

/**
 * Font size tolerance in pixels for matching
 */
const FONT_SIZE_TOLERANCE = 2;

/**
 * Normalize a font family string for comparison
 * Removes quotes, takes first font in stack, trims, and lowercases
 *
 * @param family - CSS font-family value
 * @returns Normalized font family name
 */
function normalizeFontFamily(family: string): string {
  return (
    family
      ?.replace(/["']/g, '')
      .split(',')[0]
      .trim()
      .toLowerCase() || 'sans-serif'
  );
}

/**
 * Parse font size string to numeric value in pixels
 *
 * @param fontSize - CSS font-size value (e.g., "16px", "1rem")
 * @returns Numeric font size in pixels
 */
function parseFontSize(fontSize: string): number {
  const match = fontSize.match(/^([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Calculate match score between source font and typography token
 * Higher score = better match
 *
 * @param font - Source font
 * @param token - Typography token to compare against
 * @returns Score value (0-6)
 */
function calculateMatchScore(font: LocatedFont, token: TypographyToken): number {
  let score = 0;

  // Check font family (3 points for exact match)
  if (
    normalizeFontFamily(font.fontFamily) === normalizeFontFamily(token.fontFamily)
  ) {
    score += 3;
  }

  // Check font size (2 points if within tolerance)
  const srcSize = parseFontSize(font.fontSize);
  const tokenSize = parseFontSize(token.fontSize);
  if (Math.abs(srcSize - tokenSize) <= FONT_SIZE_TOLERANCE) {
    score += 2;
  }

  // Check font weight (1 point for exact match)
  if (font.fontWeight === token.fontWeight) {
    score += 1;
  }

  return score;
}

/**
 * Generate CSS variable name from typography role
 *
 * @param role - Typography role (e.g., "heading-lg", "body-md")
 * @returns CSS variable (e.g., "var(--font-heading-lg)")
 */
function roleToCssVariable(role: string): string {
  const normalized = role.toLowerCase().replace(/\s+/g, '-');
  return `var(--font-${normalized})`;
}

/**
 * Generate list of issues between source font and matched token
 *
 * @param font - Source font
 * @param token - Matched token (or undefined)
 * @returns Array of issue descriptions
 */
function generateIssues(
  font: LocatedFont,
  token: TypographyToken | undefined
): string[] {
  const issues: string[] = [];

  if (!token) {
    issues.push('No matching typography token found');
    return issues;
  }

  // Check font family
  if (
    normalizeFontFamily(font.fontFamily) !== normalizeFontFamily(token.fontFamily)
  ) {
    issues.push(`Font family mismatch: ${font.fontFamily} vs ${token.fontFamily}`);
  }

  // Check font size
  const srcSize = parseFontSize(font.fontSize);
  const tokenSize = parseFontSize(token.fontSize);
  if (Math.abs(srcSize - tokenSize) > FONT_SIZE_TOLERANCE) {
    issues.push(`Font size mismatch: ${font.fontSize} vs ${token.fontSize}`);
  }

  // Check font weight
  if (font.fontWeight !== token.fontWeight) {
    issues.push(`Font weight mismatch: ${font.fontWeight} vs ${token.fontWeight}`);
  }

  return issues;
}

/**
 * Determine match status based on number of issues
 *
 * @param issues - Array of issue descriptions
 * @returns Match status
 */
function getStatus(issues: string[]): 'pass' | 'warn' | 'fail' {
  if (issues.length === 0) return 'pass';
  if (issues.length === 1) return 'warn';
  return 'fail';
}

/**
 * Match extracted fonts to typography tokens
 *
 * @param fonts - Array of located fonts from extraction
 * @param themeId - Theme ID to fetch tokens for
 * @returns Array of font matches with token suggestions
 */
export async function matchFonts(
  fonts: LocatedFont[],
  themeId: string
): Promise<FontMatch[]> {
  const typographyTokens = await fetchTypographyTokens(themeId);

  return fonts.map((font) => {
    const issues: string[] = [];
    let bestMatch: FontTokenInfo | undefined;
    let bestToken: TypographyToken | undefined;
    let bestScore = 0;

    // Find the best matching token
    for (const token of typographyTokens) {
      const score = calculateMatchScore(font, token);

      if (score > bestScore) {
        bestScore = score;
        bestToken = token;
        bestMatch = {
          role: token.role,
          fontFamily: token.fontFamily,
          fontSize: token.fontSize,
          cssVariable: roleToCssVariable(token.role),
        };
      }
    }

    // Generate issues based on the best match
    const matchIssues = generateIssues(font, bestToken);

    return {
      source: font,
      token: bestMatch,
      status: getStatus(matchIssues),
      issues: matchIssues,
    };
  });
}

/**
 * Match fonts synchronously when tokens are already available
 *
 * @param fonts - Array of located fonts
 * @param tokens - Pre-fetched typography tokens
 * @returns Array of font matches
 */
export function matchFontsSync(
  fonts: LocatedFont[],
  tokens: TypographyToken[]
): FontMatch[] {
  return fonts.map((font) => {
    let bestMatch: FontTokenInfo | undefined;
    let bestToken: TypographyToken | undefined;
    let bestScore = 0;

    for (const token of tokens) {
      const score = calculateMatchScore(font, token);

      if (score > bestScore) {
        bestScore = score;
        bestToken = token;
        bestMatch = {
          role: token.role,
          fontFamily: token.fontFamily,
          fontSize: token.fontSize,
          cssVariable: roleToCssVariable(token.role),
        };
      }
    }

    const matchIssues = generateIssues(font, bestToken);

    return {
      source: font,
      token: bestMatch,
      status: getStatus(matchIssues),
      issues: matchIssues,
    };
  });
}

/**
 * Calculate overall pass rate for font matches
 *
 * @param matches - Array of font matches
 * @returns Object with counts and percentages
 */
export function calculateFontMatchStats(matches: FontMatch[]): {
  total: number;
  pass: number;
  warn: number;
  fail: number;
  passRate: number;
} {
  const total = matches.length;
  const pass = matches.filter((m) => m.status === 'pass').length;
  const warn = matches.filter((m) => m.status === 'warn').length;
  const fail = matches.filter((m) => m.status === 'fail').length;

  return {
    total,
    pass,
    warn,
    fail,
    passRate: total > 0 ? (pass / total) * 100 : 100,
  };
}

/**
 * Fetch typography tokens for a theme from the token service
 *
 * @param themeId - Theme UUID
 * @returns Array of typography tokens
 */
async function fetchTypographyTokens(themeId: string): Promise<TypographyToken[]> {
  try {
    // Dynamic import to avoid circular dependencies
    const { tokenService } = await import('../../../services/tokenService');

    // Check if getTypographyRoles method exists
    if (typeof tokenService.getTypographyRoles === 'function') {
      const roles = await tokenService.getTypographyRoles(themeId);
      return roles.map(
        (r: {
          role: string;
          fontFamily: string;
          fontSize: string;
          fontWeight?: string;
        }) => ({
          role: r.role,
          fontFamily: r.fontFamily,
          fontSize: r.fontSize,
          fontWeight: r.fontWeight || '400',
        })
      );
    }

    // Fallback: Extract typography tokens from standard token service
    const tokensByCategory = await tokenService.getTokensByTheme(themeId);
    const typographyTokens = tokensByCategory?.typography || [];

    return typographyTokens.map(
      (t: {
        name?: string;
        path?: string;
        value?: {
          fontFamily?: string;
          fontSize?: string;
          fontWeight?: string;
        };
      }) => ({
        role: t.name || t.path || 'unknown',
        fontFamily: t.value?.fontFamily || 'sans-serif',
        fontSize: t.value?.fontSize || '16px',
        fontWeight: t.value?.fontWeight || '400',
      })
    );
  } catch (error) {
    console.error('Failed to fetch typography tokens:', error);
    return [];
  }
}

export default {
  matchFonts,
  matchFontsSync,
  calculateFontMatchStats,
  normalizeFontFamily,
};
