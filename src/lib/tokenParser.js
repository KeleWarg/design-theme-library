/**
 * @chunk 1.12 - Token Parser
 * 
 * Parses token files from various formats:
 * - Figma Variables (DTCG format with $type, $value, $extensions)
 * - Style Dictionary (collections/modes/variables)
 * - Flat JSON (nested objects with value keys)
 */

// =============================================================================
// Format Detection
// =============================================================================

/**
 * Detect the format of a token file
 * @param {object} json - The parsed JSON object
 * @returns {'figma-variables' | 'style-dictionary' | 'flat' | 'unknown'}
 */
export function detectFormat(json) {
  if (!json || typeof json !== 'object') {
    return 'unknown';
  }

  // Style Dictionary format: has collections array with modes
  if (Array.isArray(json.collections) && json.collections.length > 0) {
    const firstCollection = json.collections[0];
    if (firstCollection.modes && Array.isArray(firstCollection.modes)) {
      return 'style-dictionary';
    }
  }

  // Figma Variables (DTCG) format: nested objects with $type and $value
  if (hasDTCGTokens(json)) {
    return 'figma-variables';
  }

  // Flat format: nested objects with 'value' property
  if (hasFlatTokens(json)) {
    return 'flat';
  }

  return 'unknown';
}

/**
 * Check if object contains DTCG-style tokens ($type, $value)
 */
function hasDTCGTokens(obj, depth = 0) {
  if (depth > 10) return false; // Prevent infinite recursion

  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null) {
      // Found a DTCG token
      if (value.$type !== undefined && value.$value !== undefined) {
        return true;
      }
      // Recurse into nested objects
      if (hasDTCGTokens(value, depth + 1)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Check if object contains flat-style tokens (with 'value' property)
 */
function hasFlatTokens(obj, depth = 0) {
  if (depth > 10) return false;

  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null) {
      // Found a flat token (has value but not $value)
      if (value.value !== undefined && value.$value === undefined) {
        return true;
      }
      // Recurse into nested objects
      if (hasFlatTokens(value, depth + 1)) {
        return true;
      }
    }
  }
  return false;
}

// =============================================================================
// Main Parser
// =============================================================================

/**
 * Parse a token file (auto-detects format)
 * @param {object} json - The parsed JSON object
 * @returns {{ tokens: Token[], errors: string[], warnings: string[], metadata: object }}
 */
export function parseTokens(json) {
  const tokens = [];
  const errors = [];
  const warnings = [];
  const metadata = {
    format: 'unknown',
    totalParsed: 0,
    totalSkipped: 0,
    categories: {}
  };

  try {
    const format = detectFormat(json);
    metadata.format = format;

    switch (format) {
      case 'figma-variables':
        parseFigmaVariables(json, '', tokens, errors, warnings);
        break;
      case 'style-dictionary':
        parseStyleDictionary(json, tokens, errors, warnings);
        break;
      case 'flat':
        parseFlat(json, '', tokens, errors, warnings);
        break;
      default:
        errors.push('Unable to detect token file format. Expected figma-variables, style-dictionary, or flat JSON.');
    }

    // Calculate metadata
    metadata.totalParsed = tokens.length;
    metadata.totalSkipped = warnings.filter(w => w.includes('Skipped')).length;
    
    // Count by category
    for (const token of tokens) {
      metadata.categories[token.category] = (metadata.categories[token.category] || 0) + 1;
    }

  } catch (e) {
    errors.push(`Parse error: ${e.message}`);
  }

  return { tokens, errors, warnings, metadata };
}

/**
 * Parse token file (alias for parseTokens for backward compatibility)
 */
export function parseTokenFile(json) {
  return parseTokens(json);
}

// =============================================================================
// Figma Variables (DTCG) Format Parser
// =============================================================================

/**
 * Parse Figma Variables (DTCG) format
 * Structure: { CategoryName: { GroupName: { tokenName: { $type, $value, $extensions } } } }
 */
function parseFigmaVariables(obj, prefix, tokens, errors, warnings, depth = 0) {
  if (depth > 20) {
    warnings.push(`Max depth exceeded at path: ${prefix}`);
    return;
  }

  for (const [key, value] of Object.entries(obj)) {
    // Skip extension keys
    if (key.startsWith('$')) continue;

    const path = prefix ? `${prefix}/${key}` : key;

    if (typeof value !== 'object' || value === null) {
      continue;
    }

    // Check if this is a DTCG token (has $type and $value)
    if (value.$type !== undefined && value.$value !== undefined) {
      try {
        const token = parseDTCGToken(path, value);
        if (token) {
          tokens.push(token);
        }
      } catch (e) {
        warnings.push(`Skipped ${path}: ${e.message}`);
      }
    } else {
      // Recurse into nested objects
      parseFigmaVariables(value, path, tokens, errors, warnings, depth + 1);
    }
  }
}

/**
 * Parse a single DTCG token
 */
function parseDTCGToken(path, tokenData) {
  const type = mapDTCGType(tokenData.$type);
  const value = convertDTCGValue(tokenData.$type, tokenData.$value);
  const category = detectCategory(path, type);

  // Extract Figma variable ID from extensions
  const figmaId = tokenData.$extensions?.['com.figma.variableId'] || null;
  const figmaMode = tokenData.$extensions?.['com.figma.modeName'] || null;

  return {
    name: formatName(path),
    path,
    category,
    type,
    value,
    css_variable: generateCssVariable(path),
    description: tokenData.$description || '',
    metadata: {
      figma_id: figmaId,
      figma_mode: figmaMode,
      original_type: tokenData.$type,
      extensions: tokenData.$extensions || {}
    }
  };
}

/**
 * Map DTCG $type to our type system
 */
function mapDTCGType(dtcgType) {
  const typeMap = {
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
    'transition': 'transition'
  };
  return typeMap[dtcgType] || 'string';
}

/**
 * Convert DTCG value to our format
 */
function convertDTCGValue(type, value) {
  if (type === 'color') {
    // Handle Figma color format with components (sRGB 0-1)
    if (typeof value === 'object' && value.components) {
      const [r, g, b] = value.components;
      const rgb = {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
      };
      const hex = value.hex || rgbToHex(rgb.r, rgb.g, rgb.b);
      return {
        hex,
        rgb,
        opacity: value.alpha ?? 1,
        colorSpace: value.colorSpace || 'srgb'
      };
    }
    // Handle simple hex string
    if (typeof value === 'string' && value.startsWith('#')) {
      return { hex: value, opacity: 1 };
    }
    // Handle rgba object
    if (typeof value === 'object' && value.r !== undefined) {
      const r = value.r <= 1 ? Math.round(value.r * 255) : value.r;
      const g = value.g <= 1 ? Math.round(value.g * 255) : value.g;
      const b = value.b <= 1 ? Math.round(value.b * 255) : value.b;
      return {
        hex: rgbToHex(r, g, b),
        rgb: { r, g, b },
        opacity: value.a ?? value.alpha ?? 1
      };
    }
  }

  if (type === 'dimension') {
    if (typeof value === 'object' && value.value !== undefined) {
      return { value: value.value, unit: value.unit || 'px' };
    }
    if (typeof value === 'number') {
      return { value, unit: 'px' };
    }
    if (typeof value === 'string') {
      const match = value.match(/^([\d.]+)(\w+)?$/);
      if (match) {
        return { value: parseFloat(match[1]), unit: match[2] || 'px' };
      }
    }
  }

  if (type === 'shadow') {
    // Handle array of shadows or single shadow
    const shadows = Array.isArray(value) ? value : [value];
    return shadows.map(s => ({
      offsetX: s.offsetX || s.x || 0,
      offsetY: s.offsetY || s.y || 0,
      blur: s.blur || s.blurRadius || 0,
      spread: s.spread || s.spreadRadius || 0,
      color: s.color || 'rgba(0,0,0,0.1)',
      inset: s.inset || false
    }));
  }

  return value;
}

// =============================================================================
// Style Dictionary Format Parser
// =============================================================================

/**
 * Parse Style Dictionary format (collections/modes/variables)
 */
function parseStyleDictionary(json, tokens, errors, warnings) {
  if (!Array.isArray(json.collections)) {
    errors.push('Style Dictionary format requires collections array');
    return;
  }

  for (const collection of json.collections) {
    const collectionName = collection.name || 'Default';

    if (!Array.isArray(collection.modes)) {
      warnings.push(`Collection ${collectionName} has no modes, skipping`);
      continue;
    }

    for (const mode of collection.modes) {
      parseStyleDictionaryMode(collectionName, mode, tokens, errors, warnings);
    }
  }
}

/**
 * Parse a Style Dictionary mode
 */
function parseStyleDictionaryMode(collectionName, mode, tokens, errors, warnings) {
  const modeName = mode.name || 'Default';

  if (!Array.isArray(mode.variables)) {
    warnings.push(`Mode ${modeName} in ${collectionName} has no variables`);
    return;
  }

  for (const variable of mode.variables) {
    try {
      const token = parseStyleDictionaryVariable(collectionName, modeName, variable);
      if (token) {
        tokens.push(token);
      }
    } catch (e) {
      warnings.push(`Skipped ${variable.name}: ${e.message}`);
    }
  }
}

/**
 * Parse a single Style Dictionary variable
 */
function parseStyleDictionaryVariable(collection, mode, variable) {
  const path = variable.name;
  const figmaType = variable.type || 'STRING';
  const type = mapFigmaType(figmaType);
  const value = convertFigmaValue(figmaType, variable.value);
  const category = detectCategory(path, type);

  return {
    name: formatName(path),
    path,
    category,
    type,
    value,
    css_variable: generateCssVariable(path),
    description: variable.description || '',
    metadata: {
      figma_id: variable.id || null,
      collection,
      mode,
      original_type: figmaType
    }
  };
}

/**
 * Map Figma variable type to our type system
 */
function mapFigmaType(figmaType) {
  const map = {
    'COLOR': 'color',
    'FLOAT': 'number',
    'STRING': 'string',
    'BOOLEAN': 'boolean'
  };
  return map[figmaType] || 'string';
}

/**
 * Convert Figma value to our format
 */
function convertFigmaValue(type, value) {
  if (type === 'COLOR') {
    // Figma colors are 0-1, convert to 0-255
    if (typeof value === 'object' && value.r !== undefined) {
      const r = Math.round(value.r * 255);
      const g = Math.round(value.g * 255);
      const b = Math.round(value.b * 255);
      const hex = rgbToHex(r, g, b);

      return {
        hex,
        rgb: { r, g, b },
        opacity: value.a ?? 1
      };
    }
  }

  return value;
}

// =============================================================================
// Flat Format Parser
// =============================================================================

/**
 * Parse flat JSON format (nested objects with 'value' property)
 */
function parseFlat(obj, prefix, tokens, errors, warnings, depth = 0) {
  if (depth > 20) {
    warnings.push(`Max depth exceeded at path: ${prefix}`);
    return;
  }

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}/${key}` : key;

    if (typeof value !== 'object' || value === null) {
      // Primitive value at leaf
      try {
        const type = detectType(value);
        tokens.push({
          name: formatName(path),
          path,
          category: detectCategory(path, type),
          type,
          value: normalizeValue(type, value),
          css_variable: generateCssVariable(path),
          description: '',
          metadata: {}
        });
      } catch (e) {
        warnings.push(`Skipped ${path}: ${e.message}`);
      }
      continue;
    }

    // Check if this is a token object (has 'value' property)
    if (value.value !== undefined) {
      try {
        const type = detectType(value.value);
        tokens.push({
          name: formatName(path),
          path,
          category: detectCategory(path, type),
          type,
          value: normalizeValue(type, value.value),
          css_variable: value.cssVariable || generateCssVariable(path),
          description: value.description || '',
          metadata: {
            ...value,
            value: undefined,
            cssVariable: undefined,
            description: undefined
          }
        });
      } catch (e) {
        warnings.push(`Skipped ${path}: ${e.message}`);
      }
    } else if (!isTokenValue(value)) {
      // Nested object, recurse
      parseFlat(value, path, tokens, errors, warnings, depth + 1);
    }
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Detect token category from path and type
 */
export function detectCategory(path, type) {
  const lower = path.toLowerCase();

  // Check type first for explicit categories
  if (type === 'color') return 'color';
  if (type === 'shadow') return 'shadow';

  // Path-based detection
  if (/^color[s]?\/|^color[s]?-|\/color[s]?\/|color|background|foreground|fill|stroke|brand|text[\/\-]/.test(lower)) {
    return 'color';
  }
  if (/^typography[\/\-]|\/typography[\/\-]|font|text-style|heading|body|display|line-height|letter-spacing/.test(lower)) {
    return 'typography';
  }
  if (/^space|^spacing|\/space[\/\-]|\/spacing[\/\-]|gap|margin|padding|inset/.test(lower)) {
    return 'spacing';
  }
  if (/shadow|elevation|drop-shadow/.test(lower)) {
    return 'shadow';
  }
  if (/radius|corner|rounded|border-radius/.test(lower)) {
    return 'radius';
  }
  if (/grid|breakpoint|column|container|layout/.test(lower)) {
    return 'grid';
  }
  if (/z-index|z[\/\-]/.test(lower)) {
    return 'other';
  }
  if (/transition|animation|duration|timing|easing/.test(lower)) {
    return 'other';
  }

  return 'other';
}

/**
 * Generate CSS variable name from path
 * Converts "Color/Primary/500" to "--color-primary-500"
 */
export function generateCssVariable(path) {
  return '--' + path
    .replace(/\//g, '-')           // Replace slashes with hyphens
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9-]/g, '-') // Replace other special chars
    .replace(/-+/g, '-')           // Collapse multiple hyphens
    .replace(/^-|-$/g, '')         // Remove leading/trailing hyphens
    .toLowerCase();
}

/**
 * Detect value type from the value itself
 */
export function detectType(value) {
  if (typeof value === 'string') {
    // Color detection
    if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return 'color';
    if (/^rgb[a]?\s*\(/.test(value)) return 'color';
    if (/^hsl[a]?\s*\(/.test(value)) return 'color';

    // Dimension detection
    if (/^-?[\d.]+(?:px|rem|em|%|vh|vw|vmin|vmax|ch|ex)$/.test(value)) return 'dimension';

    // Duration detection
    if (/^[\d.]+m?s$/.test(value)) return 'duration';

    // Number string
    if (/^-?[\d.]+$/.test(value)) return 'number';

    return 'string';
  }

  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';

  if (typeof value === 'object' && value !== null) {
    // Color object
    if (value.r !== undefined && value.g !== undefined) return 'color';
    if (value.hex !== undefined) return 'color';
    if (value.components !== undefined) return 'color';

    // Dimension object
    if (value.value !== undefined && value.unit !== undefined) return 'dimension';

    // Shadow
    if (value.shadows || value.shadow) return 'shadow';
    if (value.blur !== undefined && value.color !== undefined) return 'shadow';
  }

  return 'string';
}

/**
 * Normalize value to our standard format
 */
function normalizeValue(type, value) {
  if (type === 'color') {
    if (typeof value === 'string') {
      if (value.startsWith('#')) {
        return { hex: value, opacity: 1 };
      }
      // Handle rgb/rgba strings
      const rgbMatch = value.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
      if (rgbMatch) {
        const [, r, g, b, a] = rgbMatch;
        return {
          hex: rgbToHex(parseInt(r), parseInt(g), parseInt(b)),
          rgb: { r: parseInt(r), g: parseInt(g), b: parseInt(b) },
          opacity: a !== undefined ? parseFloat(a) : 1
        };
      }
    }
    if (typeof value === 'object') {
      if (value.r !== undefined && value.g !== undefined) {
        const r = value.r <= 1 ? Math.round(value.r * 255) : value.r;
        const g = value.g <= 1 ? Math.round(value.g * 255) : value.g;
        const b = value.b <= 1 ? Math.round(value.b * 255) : value.b;
        return {
          hex: rgbToHex(r, g, b),
          rgb: { r, g, b },
          opacity: value.a ?? value.alpha ?? 1
        };
      }
    }
  }

  if (type === 'dimension') {
    if (typeof value === 'string') {
      const match = value.match(/^(-?[\d.]+)(\w+)?$/);
      if (match) {
        return { value: parseFloat(match[1]), unit: match[2] || 'px' };
      }
    }
    if (typeof value === 'number') {
      return { value, unit: 'px' };
    }
    if (typeof value === 'object' && value.value !== undefined) {
      return { value: value.value, unit: value.unit || 'px' };
    }
  }

  if (type === 'number' && typeof value === 'string') {
    return parseFloat(value);
  }

  return value;
}

/**
 * Check if object is a token value (vs nested path)
 */
function isTokenValue(obj) {
  if (obj.value !== undefined) return true;
  if (obj.$value !== undefined) return true;
  if (obj.r !== undefined && obj.g !== undefined) return true;
  if (obj.hex !== undefined) return true;
  if (obj.shadows !== undefined) return true;
  return false;
}

/**
 * Format token name from path (human-readable)
 */
function formatName(path) {
  const parts = path.split('/');
  const last = parts[parts.length - 1];
  return last
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Convert RGB values to hex
 */
function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// =============================================================================
// Exports for Testing
// =============================================================================

export const __testing = {
  parseFigmaVariables,
  parseStyleDictionary,
  parseFlat,
  parseDTCGToken,
  normalizeValue,
  rgbToHex,
  formatName,
  isTokenValue,
  mapDTCGType,
  mapFigmaType,
  convertDTCGValue,
  convertFigmaValue
};

