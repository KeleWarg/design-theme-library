/**
 * Extraction Orchestrator - Chunk 7.11
 * Combine all extractors based on input type.
 */

import { CapturedAsset } from '../../../types/qa';
import { extractUniqueColors } from './colorExtractor';
import { locateColorsOptimized, LocatedColor } from './regionDetector';
import { extractFromDOM, LocatedFont } from './domExtractor';
import { extractFonts } from './fontExtractor';

/**
 * Result of extraction containing colors and fonts with location data
 */
export interface ExtractionResult {
  colors: LocatedColor[];
  fonts: LocatedFont[];
}

/**
 * Extract all colors and fonts from a captured asset
 *
 * For URL captures: Uses DOM data with precise bounds
 * For image/Figma captures: Uses canvas extraction with region detection
 *
 * @param asset - Captured asset to extract from
 * @returns Extraction result with located colors and fonts
 */
export async function extractAll(asset: CapturedAsset): Promise<ExtractionResult> {
  let colors: LocatedColor[] = [];
  let fonts: LocatedFont[] = [];

  // For URL captures, we have DOM data with precise bounds
  if (asset.inputType === 'url' && asset.domElements) {
    const domResult = extractFromDOM(asset.domElements);
    colors = domResult.colors;
    fonts = domResult.fonts;
  }
  // For image/Figma, use canvas extraction
  else if (asset.image.blob) {
    const rawColors = await extractUniqueColors(asset.image.blob);
    colors = await locateColorsOptimized(asset.image.blob, rawColors);

    if (asset.domElements) {
      fonts = extractFonts(asset.domElements);
    }
  }

  return { colors, fonts };
}

export default {
  extractAll,
};
