/**
 * @chunk 2.27 - Theme Preview Colors Hook
 * 
 * Derives semantic colors from theme tokens for use in preview components.
 * Handles various token naming conventions including:
 * - Standard: --color-primary, --color-secondary, etc.
 * - Font sizes: --font-size-base, --font-size-lg, etc.
 * - Spacing: --space-sm, --space-md, etc.
 * - Radius: --radius-sm, --radius-md, etc.
 * - Shadows: --shadow-sm, --shadow-md, etc.
 */

import { useMemo } from 'react';

/**
 * Extract color value from token
 * @param {Object} token - Token object with value property
 * @returns {string} - Hex color string
 */
function getColorValue(token) {
  if (!token?.value) return null;
  const { value } = token;
  if (typeof value === 'string') return value;
  if (value?.hex) return value.hex;
  return null;
}

/**
 * Extract dimension/numeric value from token
 * @param {Object} token - Token object with value property
 * @returns {string} - CSS value string (e.g., "8px", "1.5")
 */
function getDimensionValue(token) {
  if (!token?.value) return null;
  const { value } = token;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return `${value}px`;
  if (typeof value === 'object' && value.value !== undefined) {
    // Check for unitless values
    if (!value.unit || value.unit === '') {
      return String(value.value);
    }
    return `${value.value}${value.unit || 'px'}`;
  }
  return null;
}

/**
 * Hook to derive semantic preview colors from theme tokens
 * @param {Array} tokens - Array of token objects
 * @returns {Object} - Object containing semantic colors, typography, spacing values
 */
export function usePreviewColors(tokens = []) {
  return useMemo(() => {
    // Build lookup maps by css_variable and name
    const byVar = {};
    const byName = {};
    
    tokens.forEach(token => {
      if (token.css_variable) {
        // Store by full css_variable (without --)
        const varKey = token.css_variable.replace(/^--/, '').toLowerCase();
        byVar[varKey] = token;
      }
      if (token.name) {
        // Store by name (lowercase for case-insensitive lookup)
        byName[token.name.toLowerCase()] = token;
        // Also store with dashes instead of spaces
        byName[token.name.toLowerCase().replace(/\s+/g, '-')] = token;
      }
    });

    /**
     * Find token by multiple possible keys
     * @param {Array<string>} keys - Array of possible lookup keys
     * @returns {Object|null} - Found token or null
     */
    const findToken = (keys) => {
      for (const key of keys) {
        const normalizedKey = key.toLowerCase();
        // Try by css variable name (without --)
        if (byVar[normalizedKey]) return byVar[normalizedKey];
        // Try by name
        if (byName[normalizedKey]) return byName[normalizedKey];
        // Try partial match on css_variable (for theme-prefixed vars)
        const partialMatch = Object.keys(byVar).find(k => k.endsWith(normalizedKey) || k.includes(normalizedKey));
        if (partialMatch) return byVar[partialMatch];
      }
      return null;
    };

    /**
     * Get color value by trying multiple possible token keys
     * @param {Array<string>} keys - Array of possible lookup keys
     * @param {string} fallback - Fallback color value
     * @returns {string} - Color value
     */
    const getColor = (keys, fallback) => {
      const token = findToken(keys);
      return getColorValue(token) || fallback;
    };

    /**
     * Get dimension value by trying multiple possible token keys
     * @param {Array<string>} keys - Array of possible lookup keys
     * @param {string} fallback - Fallback dimension value
     * @returns {string} - Dimension value
     */
    const getDimension = (keys, fallback) => {
      const token = findToken(keys);
      return getDimensionValue(token) || fallback;
    };

    // ============================================
    // DERIVED COLOR PALETTE
    // Using actual token names: --color-primary, --color-secondary, etc.
    // ============================================
    const colors = {
      // Primary colors
      primary: getColor([
        'color-primary',
        'primary',
        'button-primary-bg',
        'primary-bg'
      ], '#3B82F6'),
      
      primaryHover: getColor([
        'color-primary-hover',
        'primary-hover',
        'button-primary-hover-bg',
        'primary-hover-bg'
      ], '#2563EB'),
      
      // Primary text - hardcode white for contrast
      primaryText: '#FFFFFF',

      // Secondary colors
      secondary: getColor([
        'color-secondary',
        'secondary',
        'button-secondary-bg',
        'secondary-bg'
      ], '#64748B'),
      
      // Secondary text - hardcode white for contrast
      secondaryText: '#FFFFFF',
      
      secondaryBorder: getColor([
        'color-border',
        'border',
        'fg-stroke-default'
      ], '#E2E8F0'),
      
      secondaryHover: getColor([
        'color-muted',
        'muted',
        'background-neutral-subtle'
      ], '#F1F5F9'),

      // Ghost button colors
      ghost: getColor([
        'color-background',
        'background',
        'background-white'
      ], '#FFFFFF'),
      
      ghostText: getColor([
        'color-secondary',
        'secondary',
        'fg-link'
      ], '#64748B'),
      
      ghostHover: getColor([
        'color-muted',
        'muted',
        'background-neutral-subtle'
      ], '#F1F5F9'),

      // Background & foreground
      background: getColor([
        'color-background',
        'background',
        'background-white',
        'bg-white'
      ], '#FFFFFF'),
      
      foreground: getColor([
        'color-foreground',
        'foreground',
        'fg-heading'
      ], '#0F172A'),
      
      // Muted colors
      muted: getColor([
        'color-muted',
        'muted',
        'background-neutral-subtle',
        'bg-neutral-subtle'
      ], '#F1F5F9'),
      
      mutedForeground: getColor([
        'color-secondary',
        'secondary',
        'fg-caption'
      ], '#64748B'),

      // Feedback colors
      success: getColor([
        'color-success',
        'success',
        'fg-feedback-success'
      ], '#22C55E'),
      
      error: getColor([
        'color-error',
        'error',
        'destructive',
        'fg-feedback-error'
      ], '#EF4444'),
      
      warning: getColor([
        'color-warning',
        'warning',
        'fg-feedback-warning'
      ], '#F59E0B'),

      // Border colors
      border: getColor([
        'color-border',
        'border',
        'fg-stroke-default'
      ], '#E2E8F0'),

      // Link colors
      link: getColor([
        'color-primary',
        'primary',
        'fg-link'
      ], '#3B82F6'),
    };

    // ============================================
    // TYPOGRAPHY VALUES
    // Using actual token names: --font-size-base, --font-size-lg, etc.
    // ============================================
    const typography = {
      // Font families - use inherit since no font-family tokens defined
      fontFamily: 'inherit',
      fontFamilySans: 'inherit',
      fontFamilySerif: 'inherit',
      fontFamilyMono: 'monospace',
      
      // Font sizes using actual token names
      fontSizeXs: getDimension(['font-size-xs'], '12px'),
      fontSizeSm: getDimension(['font-size-sm', 'font-size-body-sm'], '14px'),
      fontSizeBase: getDimension(['font-size-base', 'font-size-body-md'], '16px'),
      fontSizeLg: getDimension(['font-size-lg', 'font-size-body-lg'], '18px'),
      fontSizeXl: getDimension(['font-size-xl', 'font-size-heading-sm'], '24px'),
      fontSize2xl: getDimension(['font-size-2xl', 'font-size-heading-md'], '30px'),
      fontSize3xl: getDimension(['font-size-3xl', 'font-size-heading-lg', 'font-size-display'], '36px'),
      
      // Line heights
      lineHeightTight: getDimension(['line-height-tight'], '1.25'),
      lineHeightNormal: getDimension(['line-height-normal'], '1.5'),
      lineHeightRelaxed: getDimension(['line-height-relaxed'], '1.75'),
      
      // Font weights - hardcoded values
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightSemibold: 600,
      fontWeightBold: 700,
    };

    // ============================================
    // SPACING VALUES
    // Using actual token names: --space-sm, --space-md, etc.
    // ============================================
    const spacing = {
      xs: getDimension(['space-xs'], '4px'),
      sm: getDimension(['space-sm'], '8px'),
      md: getDimension(['space-md'], '16px'),
      lg: getDimension(['space-lg'], '24px'),
      xl: getDimension(['space-xl'], '32px'),
      '2xl': getDimension(['space-2xl'], '48px'),
      '3xl': getDimension(['space-3xl'], '64px'),
      
      // Radius using actual token names
      radiusNone: getDimension(['radius-none'], '0px'),
      radiusSm: getDimension(['radius-sm'], '4px'),
      radius: getDimension(['radius-md'], '8px'),
      radiusMd: getDimension(['radius-md'], '8px'),
      radiusLg: getDimension(['radius-lg'], '12px'),
      radiusXl: getDimension(['radius-xl'], '16px'),
      radiusFull: getDimension(['radius-full'], '9999px'),
    };

    // ============================================
    // SHADOWS
    // Using actual token names: --shadow-sm, --shadow-md, etc.
    // ============================================
    const shadows = {
      sm: getDimension(['shadow-sm'], '0px 1px 2px 0px rgba(0,0,0,0.05)'),
      md: getDimension(['shadow-md'], '0px 4px 6px -1px rgba(0,0,0,0.1)'),
      lg: getDimension(['shadow-lg'], '0px 10px 15px -3px rgba(0,0,0,0.1)'),
      xl: getDimension(['shadow-xl'], '0px 20px 25px -5px rgba(0,0,0,0.1)'),
    };

    return {
      colors,
      typography,
      spacing,
      shadows,
      // Helper to get any token color by keys
      getColor,
      // Helper to get any token dimension by keys
      getDimension,
      // All tokens for debugging
      tokens,
    };
  }, [tokens]);
}

export default usePreviewColors;
