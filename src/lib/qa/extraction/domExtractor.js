/**
 * DOM Extractor - Chunk 7.09
 * Convert captured DOM elements to LocatedColor and LocatedFont.
 *
 * This module takes DOM elements captured from a webpage and extracts:
 * - Background colors with their locations
 * - Text styles (font family, size, weight, color) with their locations
 */

/**
 * @typedef {Object} LocatedColor
 * @property {string} hex - Hex color code
 * @property {{r: number, g: number, b: number}} rgb - RGB values
 * @property {number} percentage - Percentage of image (0 for DOM extraction)
 * @property {{x: number, y: number, width: number, height: number}} bounds - Bounding box
 * @property {{x: number, y: number}} centroid - Center point
 */

/**
 * @typedef {Object} LocatedFont
 * @property {string} fontFamily - Font family name
 * @property {string} fontSize - Font size (e.g., "16px")
 * @property {string} fontWeight - Font weight (e.g., "400", "bold")
 * @property {string} color - Text color as hex
 * @property {string} selector - CSS selector for the element
 * @property {string} textPreview - First 50 chars of text content
 * @property {{x: number, y: number, width: number, height: number}} bounds - Bounding box
 * @property {{x: number, y: number}} centroid - Center point
 */

/**
 * @typedef {Object} DOMElement
 * @property {string} selector - CSS selector
 * @property {{x: number, y: number, width: number, height: number}} bounds - Element bounds
 * @property {{color: string, backgroundColor: string, fontFamily: string, fontSize: string, fontWeight: string}} styles
 * @property {string} textContent - Element text content
 */

/**
 * Parse a CSS color string (rgb/rgba) to hex and RGB values
 * @param {string} cssColor - CSS color string
 * @returns {{hex: string, rgb: {r: number, g: number, b: number}} | null}
 */
function parseColor(cssColor) {
  if (!cssColor || cssColor === 'transparent' || cssColor === 'rgba(0, 0, 0, 0)') {
    return null;
  }

  // Parse rgb(r, g, b) or rgba(r, g, b, a)
  const match = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    const hex =
      '#' +
      [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
    return { hex, rgb: { r, g, b } };
  }

  return null;
}

/**
 * Extract colors and fonts from captured DOM elements
 * @param {DOMElement[]} elements - Array of captured DOM elements
 * @returns {{colors: LocatedColor[], fonts: LocatedFont[]}}
 */
export function extractFromDOM(elements) {
  /** @type {Map<string, LocatedColor>} */
  const colorMap = new Map();
  /** @type {LocatedFont[]} */
  const fonts = [];

  for (const el of elements) {
    // Extract background colors
    const bg = parseColor(el.styles.backgroundColor);
    if (bg && bg.hex !== 'transparent') {
      const existing = colorMap.get(bg.hex);
      const elArea = el.bounds.width * el.bounds.height;

      // Keep the largest instance of each color
      if (!existing || elArea > existing.bounds.width * existing.bounds.height) {
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
