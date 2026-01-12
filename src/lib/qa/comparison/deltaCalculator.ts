/**
 * Delta Calculator - Chunk 7.27
 * Compare colors between source and target images.
 *
 * Uses ΔE2000 to measure perceptual color differences between
 * colors found in source and target images.
 */

import { LocatedColor } from '../extraction/regionDetector';
import { deltaE2000, rgbToLab } from '../matching/deltaE';

/**
 * Result of comparing a source color against target colors
 */
export interface ColorDelta {
  sourceColor: LocatedColor;
  targetColor: LocatedColor | null;
  deltaE: number;
  status: 'match' | 'similar' | 'different' | 'missing';
}

/**
 * Calculate color deltas between source and target color sets.
 *
 * For each source color, finds the closest match in target colors
 * using ΔE2000 perceptual color difference.
 *
 * Status thresholds:
 * - match: ΔE ≤ 1 (not perceptible by human eyes)
 * - similar: ΔE ≤ 5 (perceptible through close observation)
 * - different: ΔE > 5 but has a match within ΔE ≤ 30
 * - missing: No match found or ΔE > 30
 *
 * @param sourceColors - Colors extracted from source image
 * @param targetColors - Colors extracted from target image
 * @returns Array of color deltas with match status
 */
export function calculateDeltas(
  sourceColors: LocatedColor[],
  targetColors: LocatedColor[]
): ColorDelta[] {
  return sourceColors.map((source) => {
    const sourceLab = rgbToLab(source.rgb);

    let bestMatch: LocatedColor | null = null;
    let bestDeltaE = Infinity;

    for (const target of targetColors) {
      const targetLab = rgbToLab(target.rgb);
      const dE = deltaE2000(sourceLab, targetLab);

      if (dE < bestDeltaE) {
        bestDeltaE = dE;
        bestMatch = target;
      }
    }

    let status: ColorDelta['status'];
    if (!bestMatch || bestDeltaE > 30) {
      status = 'missing';
    } else if (bestDeltaE <= 1) {
      status = 'match';
    } else if (bestDeltaE <= 5) {
      status = 'similar';
    } else {
      status = 'different';
    }

    return {
      sourceColor: source,
      targetColor: bestMatch,
      deltaE: bestDeltaE,
      status,
    };
  });
}

export default {
  calculateDeltas,
};
