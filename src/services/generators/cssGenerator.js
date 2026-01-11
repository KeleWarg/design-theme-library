/**
 * @chunk 5.05 - CSS Generator
 * 
 * Generates CSS with custom properties from tokens.
 * Supports single theme, multi-theme, and font-face generation.
 */

import { tokenToCssValue, isCompositeTypographyToken, expandCompositeTypographyToken, buildResponsiveTypographyCss } from '../../lib/cssVariableInjector.js';
import { generateFontFaceCss } from '../../lib/fontLoader.js';

/**
 * Generate CSS string from tokens
 * @param {Array} tokens - Array of token objects
 * @param {Object} options - Generation options
 * @param {string} options.selector - CSS selector (default: ':root')
 * @param {boolean} options.minify - Minify output (default: false)
 * @param {boolean} options.includeComments - Include category comments (default: true)
 * @param {string} options.scope - Scope attribute selector (e.g., '[data-theme="dark"]')
 * @param {boolean} options.includeHeader - Include generation header comment (default: true)
 * @returns {string} - Generated CSS string
 */
export function generateCSS(tokens, options = {}) {
  const {
    selector = ':root',
    minify = false,
    includeComments = true,
    scope = null,
    includeHeader = true,
  } = options;

  if (!tokens || tokens.length === 0) {
    return `${selector} {\n  /* No tokens defined */\n}\n`;
  }

  const actualSelector = scope || selector;
  const grouped = groupTokensByCategory(tokens);
  
  let css = '';

  // Add header comment
  if (includeHeader && !minify) {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    css += `/**\n * Design System Tokens\n * Generated: ${date}\n */\n\n`;
  }

  css += `${actualSelector} {\n`;

  const categoryOrder = ['color', 'typography', 'spacing', 'shadow', 'radius', 'grid', 'other'];
  
  for (let i = 0; i < categoryOrder.length; i++) {
    const category = categoryOrder[i];
    const categoryTokens = grouped[category];
    
    if (!categoryTokens || categoryTokens.length === 0) continue;

    if (includeComments && !minify) {
      css += `  /* ${capitalizeCategory(category)} */\n`;
    }

    // Sort tokens by sort_order or name
    const sortedTokens = [...categoryTokens].sort((a, b) => {
      if (a.sort_order !== undefined && b.sort_order !== undefined) {
        return a.sort_order - b.sort_order;
      }
      return (a.name || '').localeCompare(b.name || '');
    });

    for (const token of sortedTokens) {
      if (!token.css_variable) continue;

      // Composite typography tokens expand into multiple CSS variables.
      // We intentionally do NOT emit the base var (e.g. `--typography-body-md`) because it has no single CSS value.
      if (isCompositeTypographyToken(token)) {
        const expanded = expandCompositeTypographyToken(token);
        const order = ['family', 'size', 'weight', 'line-height', 'letter-spacing'];

        for (const suffix of order) {
          const varName = `${token.css_variable}-${suffix}`;
          if (!(varName in expanded)) continue;
          const line = `  ${varName}: ${expanded[varName]};`;
          css += minify ? line.trim() : line + '\n';
        }
        continue;
      }

      const value = tokenToCssValue(token);
      const line = `  ${token.css_variable}: ${value};`;
      css += minify ? line.trim() : line + '\n';
    }

    // Add blank line between categories (not after last)
    if (!minify) {
      const hasMoreCategories = categoryOrder.slice(i + 1).some(cat => grouped[cat]?.length > 0);
      if (hasMoreCategories) {
        css += '\n';
      }
    }
  }

  css += '}\n';

  // Responsive typography overrides (media queries)
  // These override `--typography-<role>-size` for tablet/mobile when the composite token provides responsive sizes.
  if (!minify) {
    const responsiveCss = buildResponsiveTypographyCss(tokens, { selector: actualSelector });
    if (responsiveCss) {
      css += '\n';
      css += responsiveCss;
    }
  }

  if (minify) {
    css = minifyCss(css);
  }

  return css;
}

/**
 * Generate CSS with @font-face declarations
 * @param {Array} tokens - Array of token objects
 * @param {Array} typefaces - Array of typeface objects
 * @param {Object} options - Generation options (same as generateCSS)
 * @returns {string} - Generated CSS string with font-face rules
 */
export function generateCSSWithFontFace(tokens, typefaces, options = {}) {
  let css = '';

  // Add @font-face declarations first
  if (typefaces?.length) {
    const fontFaceCss = generateFontFaceCss(typefaces);
    if (fontFaceCss) {
      css += fontFaceCss;
      css += '\n';
    }
  }

  // Add token variables
  css += generateCSS(tokens, options);

  return css;
}

/**
 * Generate CSS for multiple themes
 * @param {Array} themes - Array of theme objects with tokens, slug, and is_default
 * @param {Object} options - Generation options (same as generateCSS)
 * @returns {string} - Generated CSS string with all themes
 */
export function generateMultiThemeCSS(themes, options = {}) {
  let css = '';
  
  for (let i = 0; i < themes.length; i++) {
    const theme = themes[i];
    const selector = theme.is_default 
      ? ':root' 
      : `[data-theme="${theme.slug}"]`;
    
    // Only include header for first theme
    css += generateCSS(theme.tokens || [], { 
      ...options, 
      selector,
      includeHeader: i === 0 && options.includeHeader !== false
    });
    
    if (i < themes.length - 1) {
      css += '\n';
    }
  }
  
  return css;
}

/**
 * Group tokens by category
 * @param {Array} tokens - Flat array of tokens
 * @returns {Object} - Tokens grouped by category in consistent order
 */
function groupTokensByCategory(tokens) {
  const grouped = {};
  const order = ['color', 'typography', 'spacing', 'shadow', 'radius', 'grid', 'other'];
  
  for (const token of tokens) {
    const cat = token.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(token);
  }

  // Return in consistent order
  const result = {};
  for (const cat of order) {
    if (grouped[cat]) result[cat] = grouped[cat];
  }
  // Add any remaining categories
  for (const cat of Object.keys(grouped)) {
    if (!result[cat]) result[cat] = grouped[cat];
  }
  return result;
}

/**
 * Capitalize category name for comments
 */
function capitalizeCategory(category) {
  if (!category) return '';
  const categoryNames = {
    color: 'Colors',
    typography: 'Typography',
    spacing: 'Spacing',
    shadow: 'Shadows',
    radius: 'Radius',
    grid: 'Grid',
    other: 'Other'
  };
  return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Minify CSS string
 */
function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\n/g, '')                // Remove newlines
    .replace(/\s{2,}/g, ' ')           // Collapse whitespace
    .replace(/:\s/g, ':')              // Remove space after colons
    .replace(/;\s*}/g, '}')            // Remove space before closing brace
    .replace(/\s*{\s*/g, '{')          // Remove space around opening brace
    .replace(/}\s*/g, '}')             // Remove space after closing brace
    .trim();
}

