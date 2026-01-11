/**
 * @chunk 2.06 - CSS Variable Injection
 * 
 * Utilities for injecting and managing CSS variables on DOM elements.
 * Used by ThemeContext to inject theme tokens into document.documentElement.
 */

/**
 * Inject CSS variables into a target element
 * @param {Array} tokens - Array of token objects with css_variable and value
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.target - Target element (default: document.documentElement)
 * @param {boolean} options.debug - Enable debug logging
 * @returns {Object} - Map of injected variable names to values
 */
export function injectCssVariables(tokens, options = {}) {
  const { 
    target = document.documentElement,
    debug = false 
  } = options;

  const variables = {};

  tokens.forEach(token => {
    const varName = token.css_variable;
    if (!varName) return;

    // Handle composite typography tokens - generate multiple CSS variables
    if (isCompositeTypographyToken(token)) {
      const compositeVars = expandCompositeTypographyToken(token);
      Object.entries(compositeVars).forEach(([name, value]) => {
        if (debug) {
          console.log(`[CSS Composite] ${name}: ${value}`);
        }
        target.style.setProperty(name, value);
        variables[name] = value;
      });
      return;
    }

    // Standard single-value token
    const cssValue = tokenToCssValue(token);
    
    if (debug) {
      console.log(`[CSS] ${varName}: ${cssValue}`);
    }
    
    target.style.setProperty(varName, cssValue);
    variables[varName] = cssValue;
  });

  return variables;
}

/**
 * Check if a token is a composite typography token
 * @param {Object} token - Token object
 * @returns {boolean}
 */
export function isCompositeTypographyToken(token) {
  return token.category === 'typography' && 
         token.type === 'typography-composite' &&
         typeof token.value === 'object' &&
         token.value !== null &&
         (token.value.fontFamily !== undefined || 
          token.value.fontSize !== undefined || 
          token.value.fontWeight !== undefined);
}

/**
 * Expand a composite typography token into multiple CSS variables
 * @param {Object} token - Composite typography token
 * @returns {Object} - Map of CSS variable names to values
 */
export function expandCompositeTypographyToken(token) {
  const baseVar = token.css_variable;
  const { value } = token;
  const variables = {};

  // Font Family
  if (value.fontFamily) {
    const family = typeof value.fontFamily === 'string' 
      ? value.fontFamily 
      : Array.isArray(value.fontFamily)
        ? value.fontFamily.map(f => f.includes(' ') ? `"${f}"` : f).join(', ')
        : value.fontFamily;
    variables[`${baseVar}-family`] = family;
  }

  // Font Size
  if (value.fontSize !== undefined) {
    variables[`${baseVar}-size`] = formatDimensionForComposite(value.fontSize);
  }

  // Font Weight
  if (value.fontWeight !== undefined) {
    variables[`${baseVar}-weight`] = String(value.fontWeight);
  }

  // Line Height
  if (value.lineHeight !== undefined) {
    variables[`${baseVar}-line-height`] = formatLineHeight(value.lineHeight);
  }

  // Letter Spacing
  if (value.letterSpacing !== undefined) {
    variables[`${baseVar}-letter-spacing`] = formatLetterSpacing(value.letterSpacing);
  }

  return variables;
}

/**
 * Format dimension value for composite tokens (fontSize, etc.)
 */
function formatDimensionForComposite(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return `${value}px`;
  if (typeof value === 'object' && value.value !== undefined) {
    return `${value.value}${value.unit ?? 'rem'}`;
  }
  return '1rem';
}

/**
 * Format line height value (unitless or with unit)
 */
function formatLineHeight(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object' && value.value !== undefined) {
    // Line height is typically unitless
    if (value.unit === '' || value.unit === undefined) {
      return String(value.value);
    }
    return `${value.value}${value.unit}`;
  }
  return '1.5';
}

/**
 * Format letter spacing value
 */
function formatLetterSpacing(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return `${value}em`;
  if (value === 'normal') return 'normal';
  if (typeof value === 'object' && value.value !== undefined) {
    return `${value.value}${value.unit ?? 'em'}`;
  }
  return 'normal';
}

/**
 * Remove CSS variables from target element
 * @param {Array<string>} variableNames - Array of CSS variable names to remove
 * @param {HTMLElement} target - Target element (default: document.documentElement)
 */
export function removeCssVariables(variableNames, target = document.documentElement) {
  variableNames.forEach(name => {
    target.style.removeProperty(name);
  });
}

/**
 * Get all CSS variables currently set on an element
 * @param {HTMLElement} target - Target element to inspect
 * @returns {Object} - Map of variable names to computed values
 */
export function getCssVariables(target = document.documentElement) {
  const computedStyle = getComputedStyle(target);
  const variables = {};
  
  // Get inline style variables
  const style = target.style;
  for (let i = 0; i < style.length; i++) {
    const name = style[i];
    if (name.startsWith('--')) {
      variables[name] = computedStyle.getPropertyValue(name).trim();
    }
  }
  
  return variables;
}

/**
 * Convert token to CSS-compatible value string
 * @param {Object} token - Token object with category and value
 * @returns {string} - CSS-compatible value string
 */
export function tokenToCssValue(token) {
  const { category, value } = token;
  
  if (value === null || value === undefined) {
    return 'initial';
  }
  
  switch (category) {
    case 'color':
      return formatColorValue(value);
    
    case 'spacing':
    case 'radius':
      return formatDimensionValue(value);
    
    case 'shadow':
      return formatShadowValue(value);
    
    case 'typography':
      return formatTypographyValue(value);
    
    case 'grid':
      return formatGridValue(value);
    
    default:
      if (typeof value === 'object') {
        if (value.value !== undefined) {
          return `${value.value}${value.unit ?? ''}`;
        }
        return JSON.stringify(value);
      }
      return String(value);
  }
}

/**
 * Format color token value to CSS
 * Supports: hex strings, rgb objects, rgba with opacity
 */
function formatColorValue(value) {
  if (typeof value === 'string') return value;
  
  // Handle opacity/alpha
  if (value.opacity !== undefined && value.opacity < 1) {
    if (value.rgb) {
      const { r, g, b } = value.rgb;
      return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${value.opacity})`;
    }
    if (value.hex) {
      return hexToRgba(value.hex, value.opacity);
    }
  }
  
  // Handle RGB object
  if (value.rgb && !value.hex) {
    const { r, g, b } = value.rgb;
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }
  
  return value.hex || '#000000';
}

/**
 * Convert hex color to rgba string
 */
function hexToRgba(hex, opacity) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Format dimension token value to CSS (spacing, radius, etc.)
 */
function formatDimensionValue(value) {
  if (typeof value === 'number') return `${value}px`;
  if (typeof value === 'string') return value;
  
  if (typeof value === 'object' && value.value !== undefined) {
    return `${value.value}${value.unit ?? 'px'}`;
  }
  
  return '0';
}

/**
 * Format shadow token value to CSS
 * Supports: single shadow object, array of shadows
 */
function formatShadowValue(value) {
  if (typeof value === 'string') return value;
  
  // Handle array of shadows
  if (Array.isArray(value)) {
    if (value.length === 0) return 'none';
    return value.map(formatSingleShadow).join(', ');
  }

  if (value.shadows && Array.isArray(value.shadows)) {
    if (value.shadows.length === 0) return 'none';
    
    return value.shadows
      .map(formatSingleShadow)
      .join(', ');
  }
  
  // Handle single shadow object
  if (value.x !== undefined || value.offsetX !== undefined || value.blur !== undefined) {
    return formatSingleShadow(value);
  }
  
  return 'none';
}

/**
 * Format a single shadow object to CSS string
 */
function formatSingleShadow(s) {
  const x = s.x ?? s.offsetX ?? 0;
  const y = s.y ?? s.offsetY ?? 0;
  const blur = s.blur ?? s.blurRadius ?? 0;
  const spread = s.spread ?? s.spreadRadius ?? 0;
  const color = s.color || 'rgba(0, 0, 0, 0.1)';
  const inset = s.inset ? 'inset ' : '';
  
  return `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`;
}

/**
 * Format typography token value to CSS
 * Handles unitless values (like line-height) vs values with units (like font-size)
 */
function formatTypographyValue(value) {
  if (typeof value === 'string') return value;

  // Handle font-family objects (common in imports): { family: "Inter" } or { fontFamily: "Inter, sans-serif" }
  if (value && typeof value === 'object') {
    const rawFamily =
      value.fontFamily ??
      value.family ??
      value.font_family ??
      (value.value && (value.value.fontFamily ?? value.value.family)) ??
      null;

    if (rawFamily) {
      const toStack = (f) =>
        f
          .map((name) => {
            const s = String(name).trim();
            if (!s) return null;
            // If already a stack item or quoted, keep as-is.
            if (s.includes(',') || (s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
              return s;
            }
            return s.includes(' ') ? `"${s}"` : s;
          })
          .filter(Boolean)
          .join(', ');

      if (typeof rawFamily === 'string') return rawFamily;
      if (Array.isArray(rawFamily)) return toStack(rawFamily);
      if (rawFamily && typeof rawFamily === 'object') {
        if (typeof rawFamily.family === 'string') return rawFamily.family;
        if (Array.isArray(rawFamily.stack)) return toStack(rawFamily.stack);
      }
    }
  }
  
  if (typeof value === 'object' && value.value !== undefined) {
    const unit = value.unit;
    
    // If unit is explicitly empty string, use no unit (unitless values like line-height)
    if (unit === '') {
      return String(value.value);
    }
    // If unit is specified and not empty, use it
    if (unit) {
      return `${value.value}${unit}`;
    }
    // No unit specified - check if value looks like a unitless ratio
    // (common for line-height which is typically between 1.0-3.0)
    const numVal = parseFloat(value.value);
    if (!isNaN(numVal) && numVal > 0 && numVal < 10) {
      return String(value.value);
    }
    // Default to px for larger values (likely font-size, etc.)
    return `${value.value}px`;
  }
  
  // Handle font family arrays
  if (Array.isArray(value)) {
    return value.map(f => f.includes(' ') ? `"${f}"` : f).join(', ');
  }
  
  return String(value);
}

/**
 * Format grid token value to CSS
 */
function formatGridValue(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return `${value}px`;
  
  if (typeof value === 'object' && value.value !== undefined) {
    return `${value.value}${value.unit ?? 'px'}`;
  }
  
  return String(value);
}

/**
 * Batch update CSS variables (more efficient for many updates)
 * @param {Object} updates - Map of variable names to new values
 * @param {HTMLElement} target - Target element
 */
export function batchUpdateCssVariables(updates, target = document.documentElement) {
  Object.entries(updates).forEach(([name, value]) => {
    target.style.setProperty(name, value);
  });
}

/**
 * Check if a CSS variable is defined on an element
 * @param {string} varName - CSS variable name (e.g., '--color-primary')
 * @param {HTMLElement} target - Target element
 * @returns {boolean}
 */
export function hasCssVariable(varName, target = document.documentElement) {
  const value = getComputedStyle(target).getPropertyValue(varName);
  return value.trim() !== '';
}

/**
 * Get all CSS variable names that would be generated from a token
 * (handles both simple and composite tokens)
 * @param {Object} token - Token object
 * @returns {Array<string>} - Array of CSS variable names
 */
export function getTokenCssVariableNames(token) {
  if (!token.css_variable) return [];
  
  if (isCompositeTypographyToken(token)) {
    const baseVar = token.css_variable;
    const names = [];
    const { value } = token;
    
    if (value.fontFamily !== undefined) names.push(`${baseVar}-family`);
    if (value.fontSize !== undefined) names.push(`${baseVar}-size`);
    if (value.fontWeight !== undefined) names.push(`${baseVar}-weight`);
    if (value.lineHeight !== undefined) names.push(`${baseVar}-line-height`);
    if (value.letterSpacing !== undefined) names.push(`${baseVar}-letter-spacing`);
    
    return names;
  }
  
  return [token.css_variable];
}

/**
 * Get composite typography token value as a flat object for display/editing
 * @param {Object} token - Composite typography token
 * @returns {Object} - Flat object with all typography properties
 */
export function getCompositeTypographyValues(token) {
  if (!isCompositeTypographyToken(token)) return null;
  
  const { value } = token;
  return {
    fontFamily: value.fontFamily || '',
    fontSize: formatDimensionForComposite(value.fontSize),
    fontWeight: value.fontWeight || 400,
    lineHeight: formatLineHeight(value.lineHeight),
    letterSpacing: formatLetterSpacing(value.letterSpacing),
  };
}

