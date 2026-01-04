/**
 * @chunk 5.07 - Tailwind Generator
 * 
 * Generates Tailwind config extend object from tokens.
 * Supports CSS variables or direct values.
 */

import { tokenToCssValue } from '../../lib/cssVariableInjector.js';

/**
 * Generate Tailwind config file content from tokens
 * @param {Array} tokens - Array of token objects
 * @param {Object} options - Generation options
 * @param {boolean} options.useCSSVariables - Use CSS variables instead of direct values (default: true)
 * @param {string} options.prefix - Prefix for token names (default: '')
 * @returns {string} - Tailwind config.js file content
 */
export function generateTailwind(tokens, options = {}) {
  const {
    useCSSVariables = true,
    prefix = '',
  } = options;

  if (!tokens || tokens.length === 0) {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {}
  }
}`;
  }

  const theme = {
    colors: {},
    spacing: {},
    fontSize: {},
    fontWeight: {},
    fontFamily: {},
    borderRadius: {},
    boxShadow: {},
    screens: {},
  };

  for (const token of tokens) {
    const name = tokenNameToTailwind(token.path || token.name, prefix);
    let value = useCSSVariables && token.css_variable
      ? `var(${token.css_variable})`
      : tokenToCssValue(token);

    switch (token.category) {
      case 'color':
        setNestedValue(theme.colors, name, value);
        break;
      case 'spacing':
        theme.spacing[name] = value;
        break;
      case 'typography':
        if (token.path.includes('size') || token.path.includes('fontSize') || token.type === 'dimension') {
          theme.fontSize[name] = value;
        } else if (token.path.includes('weight') || token.path.includes('fontWeight')) {
          theme.fontWeight[name] = value;
        } else if (token.path.includes('family') || token.path.includes('fontFamily') || token.type === 'fontFamily') {
          // Font family should use actual value (array of font names)
          // Even with CSS variables, we want the actual font stack
          const actualValue = tokenToCssValue(token);
          // Font family should be an array
          let familyValue;
          if (Array.isArray(actualValue)) {
            familyValue = actualValue;
          } else if (typeof actualValue === 'string') {
            // If it's a string, it might be a comma-separated list
            familyValue = actualValue.includes(',')
              ? actualValue.split(',').map(f => f.trim().replace(/^["']|["']$/g, ''))
              : [actualValue];
          } else if (Array.isArray(token.value)) {
            familyValue = token.value;
          } else {
            familyValue = [String(actualValue)];
          }
          theme.fontFamily[name] = familyValue;
        }
        break;
      case 'radius':
        theme.borderRadius[name] = value;
        break;
      case 'shadow':
        theme.boxShadow[name] = value;
        break;
      case 'grid':
        if (token.path.includes('breakpoint') || token.path.includes('screen')) {
          theme.screens[name] = value;
        }
        break;
    }
  }

  // Clean up empty objects
  for (const key of Object.keys(theme)) {
    if (Object.keys(theme[key]).length === 0) {
      delete theme[key];
    }
  }

  // Generate config file
  // First stringify to JSON, then convert to JS format
  let themeStr = JSON.stringify(theme, null, 2);
  
  // Convert double quotes to single quotes
  themeStr = themeStr.replace(/"/g, "'");
  
  // Remove quotes from non-numeric keys only
  // Keep quotes for numeric keys (like color shades: '500', '600')
  // This regex matches: 'word': but not '500':
  themeStr = themeStr.replace(/'([a-zA-Z_][a-zA-Z0-9_-]*)':/g, '$1:');
  
  // Numeric keys should already have quotes from JSON.stringify, keep them

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: ${themeStr}
  }
}`;
}

/**
 * Convert token name/path to Tailwind-friendly name
 * Extracts the meaningful parts from the path (e.g., "Color/Primary/500" -> "primary-500")
 * @param {string} name - Token name or path
 * @param {string} prefix - Optional prefix
 * @returns {string} - Tailwind-friendly name
 */
function tokenNameToTailwind(name, prefix) {
  if (!name) return '';
  
  // Split by / or - and get meaningful parts
  const parts = name.split(/[/-]/).filter(Boolean);
  
  // Extract the meaningful parts
  // For "Color/Primary/500", we want "primary-500" (last 2 parts)
  // For "Spacing/sm", we want "sm" (last part only)
  // For "Typography/FontSize/base", we want "base" (last part)
  // For "Typography/FontFamily/primary", we want "primary" (last part)
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
  
  result = result
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  if (prefix) {
    result = `${prefix}-${result}`;
  }
  
  return result;
}

/**
 * Set nested value in object (handles color shades like primary-500)
 * @param {Object} obj - Target object
 * @param {string} path - Path string (e.g., "primary-500")
 * @param {*} value - Value to set
 */
function setNestedValue(obj, path, value) {
  // Handle nested color names like "primary-500"
  const parts = path.split('-');
  
  // Check if last part is a number (shade)
  if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) {
    const colorName = parts.slice(0, -1).join('-');
    const shade = parts[parts.length - 1];
    
    if (!obj[colorName]) {
      obj[colorName] = {};
    }
    // Store shade as string key so it gets quoted properly
    obj[colorName][shade] = value;
  } else {
    // Flat color name
    obj[path] = value;
  }
}


