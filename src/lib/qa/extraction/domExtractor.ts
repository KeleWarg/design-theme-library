/**
 * DOM Extractor - Chunk 7.09
 * Convert captured DOM elements to LocatedColor and LocatedFont.
 */

import { DOMElement } from '../../../types/qa';
import { LocatedColor } from './regionDetector';

/**
 * Located font with position and styling information
 */
export interface LocatedFont {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  color: string;
  selector: string;
  textPreview: string;
  bounds: { x: number; y: number; width: number; height: number };
  centroid: { x: number; y: number };
}

/**
 * Parse a CSS color string to hex and RGB
 * @param cssColor - CSS color string (e.g., 'rgb(255, 0, 0)' or 'rgba(255, 0, 0, 1)')
 * @returns Parsed color or null if invalid/transparent
 */
function parseColor(cssColor: string): { hex: string; rgb: { r: number; g: number; b: number } } | null {
  if (!cssColor || cssColor === 'transparent' || cssColor === 'rgba(0, 0, 0, 0)') {
    return null;
  }

  // Parse rgb(r, g, b) or rgba(r, g, b, a)
  const match = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1]), g = parseInt(match[2]), b = parseInt(match[3]);
    const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    return { hex, rgb: { r, g, b } };
  }

  return null;
}

/**
 * Extract colors and fonts from DOM elements
 * @param elements - Array of DOM elements with styles and bounds
 * @returns Object containing arrays of located colors and fonts
 */
export function extractFromDOM(elements: DOMElement[]): {
  colors: LocatedColor[];
  fonts: LocatedFont[];
} {
  const colorMap = new Map<string, LocatedColor>();
  const fonts: LocatedFont[] = [];

  for (const el of elements) {
    // Extract background colors
    const bg = parseColor(el.styles.backgroundColor);
    if (bg && bg.hex !== 'transparent') {
      const existing = colorMap.get(bg.hex);
      if (!existing || el.bounds.width * el.bounds.height > existing.bounds.width * existing.bounds.height) {
        colorMap.set(bg.hex, {
          hex: bg.hex,
          rgb: bg.rgb,
          percentage: 0,
          bounds: el.bounds,
          centroid: {
            x: el.bounds.x + el.bounds.width / 2,
            y: el.bounds.y + el.bounds.height / 2,
          },
        });
      }
    }

    // Extract text colors + fonts
    if (el.textContent.trim()) {
      const color = parseColor(el.styles.color);
      fonts.push({
        fontFamily: el.styles.fontFamily,
        fontSize: el.styles.fontSize,
        fontWeight: el.styles.fontWeight,
        color: color?.hex || '#000000',
        selector: el.selector,
        textPreview: el.textContent.slice(0, 50),
        bounds: el.bounds,
        centroid: {
          x: el.bounds.x + el.bounds.width / 2,
          y: el.bounds.y + el.bounds.height / 2,
        },
      });
    }
  }

  return {
    colors: Array.from(colorMap.values()),
    fonts,
  };
}

export default {
  extractFromDOM,
};
