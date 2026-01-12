/**
 * Font Extractor - Chunk 7.10
 * Extract font information from image using DOM data or Figma nodes.
 */

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
 * DOM element with styles and bounds
 */
interface DOMElementInput {
  styles: Record<string, string>;
  bounds: { x: number; y: number; width: number; height: number };
  textContent: string;
  selector: string;
}

/**
 * Clean font family string by removing quotes and extracting first font
 * @param family - Raw font family string (e.g., '"Arial", sans-serif')
 * @returns Cleaned font family name (e.g., 'Arial')
 */
function cleanFontFamily(family: string): string {
  // Remove quotes and take first font
  return family?.replace(/["']/g, '').split(',')[0].trim() || 'sans-serif';
}

/**
 * Extract fonts from DOM elements and/or Figma nodes
 * @param domElements - Array of DOM elements with styles and bounds
 * @param figmaNodes - Array of Figma nodes (optional, for future implementation)
 * @returns Array of located fonts with position and styling
 */
export function extractFonts(
  domElements?: DOMElementInput[],
  figmaNodes?: unknown[]
): LocatedFont[] {
  const fonts: LocatedFont[] = [];

  if (domElements) {
    for (const el of domElements) {
      if (el.textContent?.trim()) {
        fonts.push({
          fontFamily: cleanFontFamily(el.styles.fontFamily),
          fontSize: el.styles.fontSize,
          fontWeight: el.styles.fontWeight || '400',
          color: el.styles.color || '#000000',
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
  }

  // TODO: Extract from Figma nodes if provided
  if (figmaNodes && figmaNodes.length > 0) {
    // Future implementation for Figma text node extraction
  }

  return fonts;
}

export default {
  extractFonts,
};
