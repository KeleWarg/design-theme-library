/**
 * @chunk 2.15 - ColorEditor
 * 
 * Color conversion utilities for HEX, RGB, and HSL formats.
 */

/**
 * Convert HEX color to RGB
 * @param {string} hex - HEX color string (e.g., "#ff5500" or "ff5500")
 * @returns {{ r: number, g: number, b: number }} RGB object
 */
export function hexToRgb(hex) {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '');
  
  // Handle shorthand (e.g., "f00" -> "ff0000")
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex;
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}

/**
 * Convert RGB to HEX color
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} HEX color string with #
 */
export function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert RGB to HSL
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {{ h: number, s: number, l: number }} HSL object (h: 0-360, s: 0-100, l: 0-100)
 */
export function rgbToHsl(r, g, b) {
  // Normalize RGB values to 0-1 range
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / delta + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / delta + 4) / 6;
        break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert HSL to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {{ r: number, g: number, b: number }} RGB object
 */
export function hslToRgb(h, s, l) {
  // Normalize values
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;
  
  if (sNorm === 0) {
    // Achromatic (gray)
    const gray = Math.round(lNorm * 255);
    return { r: gray, g: gray, b: gray };
  }
  
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  const q = lNorm < 0.5 
    ? lNorm * (1 + sNorm) 
    : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;
  
  return {
    r: Math.round(hue2rgb(p, q, hNorm + 1/3) * 255),
    g: Math.round(hue2rgb(p, q, hNorm) * 255),
    b: Math.round(hue2rgb(p, q, hNorm - 1/3) * 255)
  };
}

/**
 * Convert HEX to HSL
 * @param {string} hex - HEX color string
 * @returns {{ h: number, s: number, l: number }} HSL object
 */
export function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

/**
 * Convert HSL to HEX
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} HEX color string
 */
export function hslToHex(h, s, l) {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Parse any color string to RGB
 * @param {string} color - Color string (hex, rgb(), hsl())
 * @returns {{ r: number, g: number, b: number } | null} RGB object or null
 */
export function parseColor(color) {
  if (!color || typeof color !== 'string') return null;
  
  const trimmed = color.trim().toLowerCase();
  
  // HEX format
  if (trimmed.startsWith('#') || /^[a-f0-9]{3,6}$/i.test(trimmed)) {
    return hexToRgb(trimmed);
  }
  
  // RGB format: rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = trimmed.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10)
    };
  }
  
  // HSL format: hsl(h, s%, l%) or hsla(h, s%, l%, a)
  const hslMatch = trimmed.match(/hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
  if (hslMatch) {
    return hslToRgb(
      parseInt(hslMatch[1], 10),
      parseInt(hslMatch[2], 10),
      parseInt(hslMatch[3], 10)
    );
  }
  
  return null;
}

/**
 * Check if a string is a valid HEX color
 * @param {string} hex - String to check
 * @returns {boolean} True if valid HEX color
 */
export function isValidHex(hex) {
  if (!hex || typeof hex !== 'string') return false;
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex.trim());
}

/**
 * Get contrast color (black or white) for a given background
 * @param {string} hex - Background HEX color
 * @returns {string} '#000000' or '#ffffff'
 */
export function getContrastColor(hex) {
  const rgb = hexToRgb(hex);
  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Format color value for display
 * @param {Object} color - Color object with hex, rgb, hsl
 * @param {string} format - 'hex', 'rgb', or 'hsl'
 * @returns {string} Formatted color string
 */
export function formatColor(color, format = 'hex') {
  switch (format) {
    case 'rgb':
      return `rgb(${color.rgb?.r || 0}, ${color.rgb?.g || 0}, ${color.rgb?.b || 0})`;
    case 'hsl':
      return `hsl(${color.hsl?.h || 0}, ${color.hsl?.s || 0}%, ${color.hsl?.l || 0}%)`;
    case 'hex':
    default:
      return color.hex || '#000000';
  }
}

export default {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hexToHsl,
  hslToHex,
  parseColor,
  isValidHex,
  getContrastColor,
  formatColor
};


