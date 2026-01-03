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
    const cssValue = tokenToCssValue(token);
    const varName = token.css_variable;
    
    if (!varName) return;
    
    if (debug) {
      console.log(`[CSS] ${varName}: ${cssValue}`);
    }
    
    target.style.setProperty(varName, cssValue);
    variables[varName] = cssValue;
  });

  return variables;
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

