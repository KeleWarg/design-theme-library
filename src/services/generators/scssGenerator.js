/**
 * @chunk 5.08 - SCSS Generator
 * 
 * Generates SCSS variables file from tokens.
 * Supports flat variables and maps for programmatic access.
 */

import { tokenToCssValue } from '../../lib/cssVariableInjector.js';

/**
 * Generate SCSS string from tokens
 * @param {Array} tokens - Array of token objects
 * @param {Object} options - Generation options
 * @param {boolean} options.useMaps - Include maps for programmatic access (default: true)
 * @param {string} options.prefix - Prefix for variable names (default: '')
 * @param {boolean} options.includeHeader - Include generation header comment (default: true)
 * @returns {string} - Generated SCSS string
 */
export function generateSCSS(tokens, options = {}) {
  const {
    useMaps = true,
    prefix = '',
    includeHeader = true,
  } = options;

  if (!tokens || tokens.length === 0) {
    return '// No tokens defined\n';
  }

  const grouped = groupTokensByCategory(tokens);
  let scss = '';

  // Add header comment
  if (includeHeader) {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    scss += `// Design System Tokens\n`;
    scss += `// Generated: ${date}\n\n`;
  }

  // Generate flat variables
  scss += generateSCSSVariables(grouped, prefix);

  // Generate maps if requested
  if (useMaps) {
    scss += '\n// Token Maps (for programmatic access)\n';
    scss += generateSCSSMaps(grouped, prefix);
  }

  return scss;
}

/**
 * Generate flat SCSS variables grouped by category
 * @param {Object} grouped - Tokens grouped by category
 * @param {string} prefix - Prefix for variable names
 * @returns {string} - SCSS variables string
 */
function generateSCSSVariables(grouped, prefix) {
  let scss = '';
  const categoryOrder = ['color', 'typography', 'spacing', 'shadow', 'radius', 'grid', 'other'];

  for (let i = 0; i < categoryOrder.length; i++) {
    const category = categoryOrder[i];
    const categoryTokens = grouped[category];
    
    if (!categoryTokens || categoryTokens.length === 0) continue;

    // Add category comment
    const categoryName = capitalizeCategory(category);
    scss += `// ${categoryName}\n`;

    // Sort tokens by sort_order or name
    const sortedTokens = [...categoryTokens].sort((a, b) => {
      if (a.sort_order !== undefined && b.sort_order !== undefined) {
        return a.sort_order - b.sort_order;
      }
      return (a.name || '').localeCompare(b.name || '');
    });

    for (const token of sortedTokens) {
      const name = tokenNameToScss(token.path || token.name, prefix, category);
      const value = tokenToCssValue(token);
      scss += `$${name}: ${value};\n`;
    }
    
    scss += '\n';
  }

  return scss;
}

/**
 * Generate SCSS maps that reference the flat variables
 * @param {Object} grouped - Tokens grouped by category
 * @param {string} prefix - Prefix for variable names
 * @returns {string} - SCSS maps string
 */
function generateSCSSMaps(grouped, prefix) {
  let scss = '';
  const categoryOrder = ['color', 'typography', 'spacing', 'shadow', 'radius', 'grid', 'other'];
  const mapNames = {
    color: 'colors',
    typography: 'typography',
    spacing: 'spacing',
    shadow: 'shadows',
    radius: 'radius',
    grid: 'grid',
    other: 'other'
  };

  for (let i = 0; i < categoryOrder.length; i++) {
    const category = categoryOrder[i];
    const categoryTokens = grouped[category];
    
    if (!categoryTokens || categoryTokens.length === 0) continue;

    const mapName = mapNames[category] || category;
    const prefixedMapName = prefix ? `${prefix}-${mapName}` : mapName;
    
    scss += `$${prefixedMapName}: (\n`;

    // Sort tokens by sort_order or name
    const sortedTokens = [...categoryTokens].sort((a, b) => {
      if (a.sort_order !== undefined && b.sort_order !== undefined) {
        return a.sort_order - b.sort_order;
      }
      return (a.name || '').localeCompare(b.name || '');
    });

    for (let j = 0; j < sortedTokens.length; j++) {
      const token = sortedTokens[j];
      const variableName = tokenNameToScss(token.path || token.name, prefix, category);
      const mapKey = extractMapKey(token.path || token.name);
      const isLast = j === sortedTokens.length - 1;
      scss += `  '${mapKey}': $${variableName}${isLast ? '' : ','}\n`;
    }
    
    scss += ');\n\n';
  }

  // Add utility function
  scss += `// Utility function to get values from maps
@function get-token($map, $key) {
  @if map-has-key($map, $key) {
    @return map-get($map, $key);
  }
  @warn "Token '#{$key}' not found in map.";
  @return null;
}

// Usage example:
// color: get-token($colors, 'primary-500');
`;

  return scss;
}

/**
 * Convert token name/path to SCSS variable name
 * @param {string} name - Token name or path
 * @param {string} prefix - Optional prefix
 * @param {string} category - Token category
 * @returns {string} - SCSS-friendly variable name
 */
function tokenNameToScss(name, prefix, category) {
  if (!name) return '';
  
  // Split by / or - and get meaningful parts
  const parts = name.split(/[/-]/).filter(Boolean);
  
  // Extract the meaningful parts (similar to tailwind generator)
  // For "Color/Primary/500", we want "color-primary-500"
  // For "Spacing/sm", we want "spacing-sm" or "space-sm"
  let result;
  
  if (parts.length >= 3) {
    // Check if last part is a number (shade like "500")
    if (/^\d+$/.test(parts[parts.length - 1])) {
      // For paths like "Color/Primary/500", take last 2 parts
      result = parts.slice(-2).join('-');
    } else {
      // For paths like "Typography/FontSize/base", take just the last part
      result = parts[parts.length - 1];
    }
  } else if (parts.length === 2) {
    // For paths like "Spacing/sm", take just the last part
    result = parts[parts.length - 1];
  } else {
    // Single part
    result = parts[0];
  }
  
  // Convert to lowercase and sanitize
  result = result
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  // Add category prefix (shortened for common categories)
  const categoryPrefix = getCategoryPrefix(category);
  result = `${categoryPrefix}-${result}`;
  
  if (prefix) {
    result = `${prefix}-${result}`;
  }
  
  return result;
}

/**
 * Get category prefix for SCSS variables
 * @param {string} category - Token category
 * @returns {string} - Category prefix
 */
function getCategoryPrefix(category) {
  const prefixes = {
    color: 'color',
    typography: 'typography',
    spacing: 'space',
    shadow: 'shadow',
    radius: 'radius',
    grid: 'grid',
    other: 'token'
  };
  return prefixes[category] || 'token';
}

/**
 * Extract map key from token name/path (without category prefix)
 * @param {string} name - Token name or path
 * @returns {string} - Map key
 */
function extractMapKey(name) {
  if (!name) return '';
  
  // Split by / or - and get meaningful parts
  const parts = name.split(/[/-]/).filter(Boolean);
  
  // Extract the meaningful parts (same logic as tokenNameToScss but without category)
  let result;
  
  if (parts.length >= 3) {
    if (/^\d+$/.test(parts[parts.length - 1])) {
      result = parts.slice(-2).join('-');
    } else {
      result = parts[parts.length - 1];
    }
  } else if (parts.length === 2) {
    result = parts[parts.length - 1];
  } else {
    result = parts[0];
  }
  
  return result
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '');
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
 * @param {string} category - Category name
 * @returns {string} - Capitalized category name
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




