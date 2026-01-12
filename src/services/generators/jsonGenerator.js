/**
 * @chunk 5.06 - JSON Generator
 * 
 * Generates JSON token files in different structures:
 * - Flat: Simple key-value pairs
 * - Nested: Hierarchical structure based on token paths
 * - W3C: Design Tokens Community Group format
 */

/**
 * Generate JSON string from tokens
 * @param {Array} tokens - Array of token objects
 * @param {Object} options - Generation options
 * @param {string} options.format - Output format: 'flat' | 'nested' | 'w3c' (default: 'nested')
 * @param {boolean} options.includeMetadata - Include metadata in output (default: false)
 * @returns {string} - JSON string
 */
export function generateJSON(tokens, options = {}) {
  const {
    format = 'nested',
    includeMetadata = false,
  } = options;

  if (!tokens || tokens.length === 0) {
    return JSON.stringify({}, null, 2);
  }

  if (format === 'flat') {
    return generateFlatJSON(tokens, includeMetadata);
  }
  
  if (format === 'w3c') {
    return generateW3CJSON(tokens);
  }

  return generateNestedJSON(tokens, includeMetadata);
}

/**
 * Generate flat JSON format
 * Example: { "color-primary-500": "#3b82f6" }
 * @param {Array} tokens - Array of token objects
 * @param {boolean} includeMetadata - Include metadata
 * @returns {string} - JSON string
 */
function generateFlatJSON(tokens, includeMetadata) {
  const result = {};
  
  for (const token of tokens) {
    // Use path as key, converting slashes to hyphens if needed
    const key = token.path.replace(/\//g, '-').toLowerCase();
    
    if (includeMetadata) {
      result[key] = {
        value: formatValueForJSON(token),
        type: token.type,
        category: token.category,
        cssVariable: token.css_variable,
        ...(token.description && { description: token.description }),
      };
    } else {
      result[key] = formatValueForJSON(token);
    }
  }
  
  return JSON.stringify(result, null, 2);
}

/**
 * Generate nested JSON format
 * Example: { color: { primary: { 500: "#3b82f6" } } }
 * @param {Array} tokens - Array of token objects
 * @param {boolean} includeMetadata - Include metadata
 * @returns {string} - JSON string
 */
function generateNestedJSON(tokens, includeMetadata) {
  const result = {};
  
  for (const token of tokens) {
    // Split path by '/' or '-' to get parts
    const parts = token.path.split(/[/-]/).filter(Boolean);
    let current = result;
    
    // Navigate/create nested structure
    for (let i = 0; i < parts.length - 1; i++) {
      const part = normalizeKey(parts[i]);
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Set the final value
    const key = normalizeKey(parts[parts.length - 1]);
    if (includeMetadata) {
      current[key] = {
        value: formatValueForJSON(token),
        type: token.type,
        category: token.category,
        cssVariable: token.css_variable,
        ...(token.description && { description: token.description }),
      };
    } else {
      current[key] = formatValueForJSON(token);
    }
  }
  
  return JSON.stringify(result, null, 2);
}

/**
 * Generate W3C Design Tokens Community Group format
 * Example: { Color: { Primary: { "500": { $type: "color", $value: "#3b82f6" } } } }
 * @param {Array} tokens - Array of token objects
 * @returns {string} - JSON string
 */
function generateW3CJSON(tokens) {
  const result = {};
  
  for (const token of tokens) {
    // Split path by '/' or '-' to get parts
    const parts = token.path.split(/[/-]/).filter(Boolean);
    let current = result;
    
    // Navigate/create nested structure (preserve case for W3C)
    for (let i = 0; i < parts.length - 1; i++) {
      const part = capitalizeKey(parts[i]);
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Set the final token with W3C format
    const key = parts[parts.length - 1];
    current[key] = {
      $type: mapTypeToW3C(token.type),
      $value: formatValueForW3C(token),
    };
    
    // Add description if present
    if (token.description) {
      current[key].$description = token.description;
    }
    
    // Add extensions if metadata contains them
    if (token.metadata?.extensions) {
      current[key].$extensions = token.metadata.extensions;
    }
  }
  
  return JSON.stringify(result, null, 2);
}

/**
 * Format token value for JSON output
 * @param {Object} token - Token object
 * @returns {*} - Formatted value
 */
function formatValueForJSON(token) {
  const { value, type, category } = token;
  
  // Handle null/undefined
  if (value === null || value === undefined) {
    return null;
  }
  
  // For colors, prefer hex string
  if (category === 'color' || type === 'color') {
    if (typeof value === 'object' && value.hex) {
      return value.hex;
    }
    if (typeof value === 'string' && value.startsWith('#')) {
      return value;
    }
    if (typeof value === 'object' && value.r !== undefined) {
      return rgbToHex(value.r, value.g, value.b);
    }
  }
  
  // For dimensions, format as string with unit
  if (category === 'spacing' || category === 'radius' || type === 'dimension') {
    if (typeof value === 'object' && value.value !== undefined) {
      return `${value.value}${value.unit || ''}`;
    }
    if (typeof value === 'number') {
      return `${value}px`;
    }
  }
  
  // For shadows, format as string
  if (category === 'shadow' || type === 'shadow') {
    if (typeof value === 'object') {
      return formatShadowValue(value);
    }
  }
  
  // For typography, return as object or string
  if (category === 'typography' || type === 'typography') {
    if (typeof value === 'object') {
      return value;
    }
  }
  
  // Return as-is for primitives, stringify for complex objects
  if (typeof value === 'object') {
    return value;
  }
  
  return value;
}

/**
 * Format token value for W3C format
 * @param {Object} token - Token object
 * @returns {*} - Formatted value for W3C
 */
function formatValueForW3C(token) {
  const { value, type, category } = token;
  
  // Handle null/undefined
  if (value === null || value === undefined) {
    return null;
  }
  
  // For colors, W3C expects hex string or rgba object
  if (category === 'color' || type === 'color') {
    if (typeof value === 'object' && value.hex) {
      return value.hex;
    }
    if (typeof value === 'string' && value.startsWith('#')) {
      return value;
    }
    if (typeof value === 'object' && value.r !== undefined) {
      // Convert to hex for W3C
      return rgbToHex(value.r, value.g, value.b);
    }
  }
  
  // For dimensions, return as string with unit
  if (category === 'spacing' || category === 'radius' || type === 'dimension') {
    if (typeof value === 'object' && value.value !== undefined) {
      return `${value.value}${value.unit || 'px'}`;
    }
    if (typeof value === 'number') {
      return `${value}px`;
    }
    if (typeof value === 'string') {
      return value;
    }
  }
  
  // For shadows, format as W3C shadow string
  if (category === 'shadow' || type === 'shadow') {
    if (typeof value === 'object') {
      return formatShadowValue(value);
    }
    if (typeof value === 'string') {
      return value;
    }
  }
  
  // For typography, return as object
  if (category === 'typography' || type === 'typography') {
    if (typeof value === 'object') {
      return value;
    }
  }
  
  // Return as-is
  return value;
}

/**
 * Map our type system to W3C $type
 * @param {string} type - Our type
 * @returns {string} - W3C type
 */
function mapTypeToW3C(type) {
  const mapping = {
    'color': 'color',
    'dimension': 'dimension',
    'fontFamily': 'fontFamily',
    'fontWeight': 'fontWeight',
    'duration': 'duration',
    'cubicBezier': 'cubicBezier',
    'number': 'number',
    'string': 'string',
    'boolean': 'boolean',
    'shadow': 'shadow',
    'gradient': 'gradient',
    'typography': 'typography',
    'border': 'border',
    'transition': 'transition',
  };
  
  return mapping[type] || 'string';
}

/**
 * Format shadow value as CSS string
 * @param {Object} shadow - Shadow object
 * @returns {string} - CSS shadow string
 */
function formatShadowValue(shadow) {
  if (typeof shadow === 'string') {
    return shadow;
  }
  
  if (typeof shadow !== 'object' || !shadow) {
    return 'none';
  }
  
  const x = shadow.x || shadow.offsetX || 0;
  const y = shadow.y || shadow.offsetY || 0;
  const blur = shadow.blur || shadow.blurRadius || 0;
  const spread = shadow.spread || shadow.spreadRadius || 0;
  const color = shadow.color || '#000000';
  const inset = shadow.inset ? 'inset ' : '';
  
  const colorStr = typeof color === 'object' && color.hex 
    ? color.hex 
    : (typeof color === 'string' ? color : '#000000');
  
  return `${inset}${x}px ${y}px ${blur}px ${spread}px ${colorStr}`;
}

/**
 * Normalize key for nested/flat format (lowercase, handle special chars)
 * @param {string} key - Raw key
 * @returns {string} - Normalized key
 */
function normalizeKey(key) {
  if (!key) return '';
  // Convert to lowercase, replace spaces/special chars with hyphens
  return key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Capitalize key for W3C format (PascalCase)
 * @param {string} key - Raw key
 * @returns {string} - Capitalized key
 */
function capitalizeKey(key) {
  if (!key) return '';
  // Convert to PascalCase
  return key
    .split(/[-_\s]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

/**
 * Convert RGB values to hex
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} - Hex color string
 */
function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}




