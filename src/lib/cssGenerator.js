/**
 * @chunk 2.06 - CSS Generator
 * 
 * Generates CSS strings from tokens for export.
 * Used by the export system (Phase 5) but defined here for CSS variable injection support.
 */

import { tokenToCssValue } from './cssVariableInjector';

/**
 * Generate CSS string from tokens
 * @param {Array} tokens - Array of token objects
 * @param {Object} options - Generation options
 * @param {string} options.selector - CSS selector (default: ':root')
 * @param {boolean} options.includeComments - Include category comments
 * @param {boolean} options.minify - Minify output
 * @param {boolean} options.includeHeader - Include generation header comment
 * @returns {string} - Generated CSS string
 */
export function generateCssString(tokens, options = {}) {
  const { 
    selector = ':root', 
    includeComments = true,
    minify = false,
    includeHeader = true
  } = options;
  
  if (!tokens || tokens.length === 0) {
    return `${selector} {\n  /* No tokens defined */\n}\n`;
  }
  
  const grouped = groupTokensByCategory(tokens);
  const categories = ['color', 'typography', 'spacing', 'shadow', 'radius', 'grid', 'other'];
  
  let css = '';
  
  // Add header comment
  if (includeHeader && !minify) {
    css += `/**\n * Design System CSS Variables\n * Generated: ${new Date().toISOString()}\n * Tokens: ${tokens.length}\n */\n\n`;
  }
  
  css += `${selector} {\n`;
  
  categories.forEach((category, index) => {
    const categoryTokens = grouped[category];
    if (!categoryTokens?.length) return;
    
    // Sort tokens by sort_order or name
    const sortedTokens = [...categoryTokens].sort((a, b) => {
      if (a.sort_order !== undefined && b.sort_order !== undefined) {
        return a.sort_order - b.sort_order;
      }
      return (a.name || '').localeCompare(b.name || '');
    });
    
    if (includeComments && !minify) {
      css += `  /* ${capitalize(category)} Tokens */\n`;
    }
    
    sortedTokens.forEach(token => {
      const value = tokenToCssValue(token);
      if (token.css_variable) {
        css += `  ${token.css_variable}: ${value};\n`;
      }
    });
    
    // Add blank line between categories (not after last)
    if (!minify && index < categories.length - 1 && grouped[categories[index + 1]]?.length) {
      css += '\n';
    }
  });
  
  css += '}\n';
  
  if (minify) {
    css = minifyCss(css);
  }
  
  return css;
}

/**
 * Generate CSS with custom properties scoped to a class
 * @param {Array} tokens - Array of token objects
 * @param {string} themeName - Theme name for class generation
 * @param {Object} options - Generation options
 * @returns {string} - Generated CSS string
 */
export function generateScopedCss(tokens, themeName, options = {}) {
  const className = `.theme-${slugify(themeName)}`;
  return generateCssString(tokens, { ...options, selector: className });
}

/**
 * Generate CSS with multiple theme scopes
 * @param {Array} themes - Array of theme objects with name and tokens
 * @param {Object} options - Generation options
 * @returns {string} - Generated CSS string with all themes
 */
export function generateMultiThemeCss(themes, options = {}) {
  const { includeDefault = true, defaultThemeName } = options;
  
  let css = '';
  
  themes.forEach((theme, index) => {
    const isDefault = theme.is_default || theme.name === defaultThemeName;
    
    // First default theme also goes to :root
    if (includeDefault && isDefault && index === themes.findIndex(t => t.is_default || t.name === defaultThemeName)) {
      css += generateCssString(theme.tokens || [], { 
        ...options, 
        selector: ':root',
        includeHeader: index === 0 
      });
      css += '\n';
    }
    
    // Always generate scoped version
    css += generateScopedCss(theme.tokens || [], theme.name, { 
      ...options, 
      includeHeader: false 
    });
    
    if (index < themes.length - 1) {
      css += '\n';
    }
  });
  
  return css;
}

/**
 * Generate CSS custom properties object (for inline styles)
 * @param {Array} tokens - Array of token objects
 * @returns {Object} - Object suitable for React style prop
 */
export function generateStyleObject(tokens) {
  const style = {};
  
  tokens.forEach(token => {
    if (token.css_variable) {
      style[token.css_variable] = tokenToCssValue(token);
    }
  });
  
  return style;
}

/**
 * Generate CSS variable references object
 * @param {Array} tokens - Array of token objects
 * @returns {Object} - Object with token names mapped to var() references
 */
export function generateCssVarReferences(tokens) {
  const refs = {};
  
  tokens.forEach(token => {
    if (token.css_variable && token.name) {
      refs[token.name] = `var(${token.css_variable})`;
    }
  });
  
  return refs;
}

/**
 * Group tokens by category
 * @param {Array} tokens - Flat array of tokens
 * @returns {Object} - Tokens grouped by category
 */
function groupTokensByCategory(tokens) {
  return tokens.reduce((acc, token) => {
    const cat = token.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(token);
    return acc;
  }, {});
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to slug
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Minify CSS string
 */
function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\n/g, '')               // Remove newlines
    .replace(/\s{2,}/g, ' ')          // Collapse whitespace
    .replace(/:\s/g, ':')             // Remove space after colons
    .replace(/;\s*}/g, '}')           // Remove space before closing brace
    .replace(/\s*{\s*/g, '{')         // Remove space around opening brace
    .replace(/}\s*/g, '}')            // Remove space after closing brace
    .trim();
}

/**
 * Parse CSS string back to token-like objects (for import)
 * @param {string} css - CSS string with custom properties
 * @returns {Array} - Array of parsed token objects
 */
export function parseCssVariables(css) {
  const tokens = [];
  const regex = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let match;
  
  while ((match = regex.exec(css)) !== null) {
    const [, name, value] = match;
    tokens.push({
      css_variable: name,
      name: name.replace(/^--/, '').replace(/-/g, '/'),
      value: value.trim(),
      category: inferCategoryFromName(name),
    });
  }
  
  return tokens;
}

/**
 * Infer token category from variable name
 */
function inferCategoryFromName(name) {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('color') || lowerName.includes('background') || lowerName.includes('border-color')) {
    return 'color';
  }
  if (lowerName.includes('font') || lowerName.includes('text') || lowerName.includes('line-height') || lowerName.includes('letter-spacing')) {
    return 'typography';
  }
  if (lowerName.includes('spacing') || lowerName.includes('padding') || lowerName.includes('margin') || lowerName.includes('gap')) {
    return 'spacing';
  }
  if (lowerName.includes('shadow')) {
    return 'shadow';
  }
  if (lowerName.includes('radius') || lowerName.includes('rounded')) {
    return 'radius';
  }
  if (lowerName.includes('grid') || lowerName.includes('column')) {
    return 'grid';
  }
  
  return 'other';
}

