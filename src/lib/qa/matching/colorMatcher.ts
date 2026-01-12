/**
 * Color Matcher - Chunk 7.12
 *
 * Match extracted colors to design tokens using perceptual ΔE2000 color distance.
 *
 * Thresholds:
 * - pass (≤3): Colors are perceptually identical
 * - warn (≤10): Colors are close but noticeably different
 * - fail (>10): Colors are significantly different
 */

import { rgbToLab, deltaE2000, hexToRgb } from './deltaE';
import { LocatedColor } from '../extraction/regionDetector';

/**
 * Match status based on ΔE2000 thresholds
 */
export type MatchStatus = 'pass' | 'warn' | 'fail';

/**
 * Token match information
 */
export interface TokenInfo {
  path: string;
  hex: string;
  cssVariable: string;
}

/**
 * Result of matching a color to design tokens
 */
export interface ColorMatch {
  source: LocatedColor;
  token?: TokenInfo;
  deltaE: number;
  status: MatchStatus;
}

/**
 * Color token from the design system
 */
interface ColorToken {
  path: string;
  hex: string;
  category?: string;
  value?: string | { hex?: string };
}

/**
 * ΔE2000 thresholds for determining match status
 */
const THRESHOLDS = {
  PASS: 3, // Imperceptible difference
  WARN: 10, // Noticeable but acceptable
} as const;

/**
 * Determine match status based on ΔE2000 value
 * @param deltaE - ΔE2000 color difference
 * @returns Match status (pass, warn, or fail)
 */
function getStatus(deltaE: number): MatchStatus {
  if (deltaE <= THRESHOLDS.PASS) return 'pass';
  if (deltaE <= THRESHOLDS.WARN) return 'warn';
  return 'fail';
}

/**
 * Generate CSS variable name from token path
 * @param path - Token path (e.g., "Color/Primary/500")
 * @returns CSS variable (e.g., "var(--color-primary-500)")
 */
function pathToCssVariable(path: string): string {
  const normalized = path
    .replace(/\//g, '-')
    .replace(/\s+/g, '-')
    .toLowerCase();
  return `var(--${normalized})`;
}

/**
 * Extract hex value from token
 * @param token - Token object with value
 * @returns Hex color string
 */
function getTokenHex(token: ColorToken): string {
  if (typeof token.value === 'string') {
    return token.value;
  }
  if (typeof token.value === 'object' && token.value?.hex) {
    return token.value.hex;
  }
  return token.hex || '#000000';
}

/**
 * Match extracted colors to design system tokens
 * @param colors - Array of located colors from extraction
 * @param themeId - Theme ID to fetch tokens for
 * @returns Array of color matches with token suggestions
 */
export async function matchColors(
  colors: LocatedColor[],
  themeId: string
): Promise<ColorMatch[]> {
  // Fetch color tokens for the theme
  const tokens = await fetchColorTokens(themeId);

  // Pre-compute LAB values for all tokens (optimization)
  const tokenLabs = tokens.map((token) => ({
    token,
    lab: rgbToLab(hexToRgb(getTokenHex(token))),
  }));

  return colors.map((color) => {
    const sourceLab = rgbToLab(color.rgb);
    let bestMatch: TokenInfo | undefined;
    let bestDeltaE = Infinity;

    // Find the closest matching token
    for (const { token, lab: tokenLab } of tokenLabs) {
      const dE = deltaE2000(sourceLab, tokenLab);

      if (dE < bestDeltaE) {
        bestDeltaE = dE;
        const hex = getTokenHex(token);
        bestMatch = {
          path: token.path,
          hex,
          cssVariable: pathToCssVariable(token.path),
        };
      }
    }

    return {
      source: color,
      token: bestMatch,
      deltaE: bestDeltaE,
      status: getStatus(bestDeltaE),
    };
  });
}

/**
 * Match colors synchronously when tokens are already available
 * @param colors - Array of located colors
 * @param tokens - Pre-fetched color tokens
 * @returns Array of color matches
 */
export function matchColorsSync(
  colors: LocatedColor[],
  tokens: ColorToken[]
): ColorMatch[] {
  // Pre-compute LAB values for all tokens
  const tokenLabs = tokens.map((token) => ({
    token,
    lab: rgbToLab(hexToRgb(getTokenHex(token))),
  }));

  return colors.map((color) => {
    const sourceLab = rgbToLab(color.rgb);
    let bestMatch: TokenInfo | undefined;
    let bestDeltaE = Infinity;

    for (const { token, lab: tokenLab } of tokenLabs) {
      const dE = deltaE2000(sourceLab, tokenLab);

      if (dE < bestDeltaE) {
        bestDeltaE = dE;
        const hex = getTokenHex(token);
        bestMatch = {
          path: token.path,
          hex,
          cssVariable: pathToCssVariable(token.path),
        };
      }
    }

    return {
      source: color,
      token: bestMatch,
      deltaE: bestDeltaE,
      status: getStatus(bestDeltaE),
    };
  });
}

/**
 * Find all tokens within a ΔE threshold of a color
 * @param color - Source color to match
 * @param tokens - Available tokens
 * @param maxDeltaE - Maximum ΔE2000 threshold (default: 10)
 * @returns Array of matching tokens sorted by ΔE
 */
export function findMatchingTokens(
  color: { rgb: { r: number; g: number; b: number } },
  tokens: ColorToken[],
  maxDeltaE = 10
): Array<{ token: TokenInfo; deltaE: number }> {
  const sourceLab = rgbToLab(color.rgb);
  const matches: Array<{ token: TokenInfo; deltaE: number }> = [];

  for (const token of tokens) {
    const tokenLab = rgbToLab(hexToRgb(getTokenHex(token)));
    const dE = deltaE2000(sourceLab, tokenLab);

    if (dE <= maxDeltaE) {
      matches.push({
        token: {
          path: token.path,
          hex: getTokenHex(token),
          cssVariable: pathToCssVariable(token.path),
        },
        deltaE: dE,
      });
    }
  }

  return matches.sort((a, b) => a.deltaE - b.deltaE);
}

/**
 * Calculate overall pass rate for color matches
 * @param matches - Array of color matches
 * @returns Object with counts and percentages
 */
export function calculateMatchStats(matches: ColorMatch[]): {
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
 * Fetch color tokens for a theme from the token service
 * @param themeId - Theme UUID
 * @returns Array of color tokens
 */
async function fetchColorTokens(themeId: string): Promise<ColorToken[]> {
  try {
    // Dynamic import to avoid circular dependencies
    const { tokenService } = await import('../../../services/tokenService');
    const tokensByCategory = await tokenService.getTokensByTheme(themeId);

    // The service returns tokens grouped by category
    const colorTokens = tokensByCategory?.color || [];

    return colorTokens.map(
      (t: { path: string; value: string | { hex?: string } }) => ({
        path: t.path,
        hex: typeof t.value === 'string' ? t.value : t.value?.hex || '#000000',
        value: t.value,
      })
    );
  } catch (error) {
    console.error('Failed to fetch color tokens:', error);
    return [];
  }
}

export default {
  matchColors,
  matchColorsSync,
  findMatchingTokens,
  calculateMatchStats,
  getStatus,
  THRESHOLDS,
};
