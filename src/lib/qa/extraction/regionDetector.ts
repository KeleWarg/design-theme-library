/**
 * Region Detector - Chunk 7.08
 * Find WHERE colors appear in an image - the key differentiator for annotation-first UX.
 *
 * Algorithm:
 * 1. For target color, create binary mask (pixels within ΔE tolerance)
 * 2. Flood-fill to find connected components (ITERATIVE, not recursive!)
 * 3. For each component: calculate bounds + centroid
 * 4. Filter regions below minRegionPercent
 * 5. Return sorted by size
 */

/**
 * Color region with bounds, centroid, and size information
 */
export interface ColorRegion {
  bounds: { x: number; y: number; width: number; height: number };
  centroid: { x: number; y: number };
  pixelCount: number;
  percentage: number;
}

/**
 * Located color with position information
 */
export interface LocatedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  percentage: number;
  bounds: { x: number; y: number; width: number; height: number };
  centroid: { x: number; y: number };
}

/**
 * Options for region detection
 */
interface DetectOptions {
  tolerance?: number;        // Color distance tolerance (default: 10)
  minRegionPercent?: number; // Min region size as % of image (default: 0.1)
}

/**
 * ITERATIVE flood-fill to avoid stack overflow on large regions
 */
function floodFillIterative(
  mask: Uint8Array,
  visited: Uint8Array,
  width: number,
  height: number,
  startX: number,
  startY: number
): ColorRegion {
  const stack: [number, number][] = [[startX, startY]];
  let minX = startX, maxX = startX, minY = startY, maxY = startY;
  let sumX = 0, sumY = 0, count = 0;

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    const idx = y * width + x;

    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    if (!mask[idx] || visited[idx]) continue;

    visited[idx] = 1;
    count++;
    sumX += x;
    sumY += y;

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);

    // Add neighbors (4-connected)
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  return {
    bounds: { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 },
    centroid: { x: Math.round(sumX / count), y: Math.round(sumY / count) },
    pixelCount: count,
    percentage: 0, // Filled in by caller
  };
}

/**
 * Detect regions where a specific color appears in an image
 * @param imageData - ImageData from canvas
 * @param targetRgb - Target RGB color to detect
 * @param options - Detection options
 * @returns Array of color regions sorted by size
 */
export function detectColorRegions(
  imageData: ImageData,
  targetRgb: { r: number; g: number; b: number },
  options: DetectOptions = {}
): ColorRegion[] {
  const { tolerance = 10, minRegionPercent = 0.1 } = options;
  const { data, width, height } = imageData;
  const totalPixels = width * height;

  // Create binary mask
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const dist = Math.sqrt(
      (r - targetRgb.r) ** 2 +
      (g - targetRgb.g) ** 2 +
      (b - targetRgb.b) ** 2
    );
    if (dist <= tolerance) {
      mask[i / 4] = 1;
    }
  }

  // Find connected components using ITERATIVE flood-fill
  const visited = new Uint8Array(width * height);
  const regions: ColorRegion[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (mask[idx] && !visited[idx]) {
        const region = floodFillIterative(mask, visited, width, height, x, y);
        if (region.pixelCount / totalPixels * 100 >= minRegionPercent) {
          region.percentage = region.pixelCount / totalPixels * 100;
          regions.push(region);
        }
      }
    }
  }

  return regions.sort((a, b) => b.pixelCount - a.pixelCount);
}

/**
 * Add bounds + centroid to extracted colors
 * @param imageData - ImageData from canvas
 * @param colors - Array of extracted colors
 * @returns Array of located colors with position information
 */
export function locateColors(
  imageData: ImageData,
  colors: Array<{ hex: string; rgb: { r: number; g: number; b: number }; percentage: number }>
): LocatedColor[] {
  return colors.map(color => {
    const regions = detectColorRegions(imageData, color.rgb);
    const largest = regions[0];

    if (largest) {
      return {
        ...color,
        bounds: largest.bounds,
        centroid: largest.centroid,
      };
    }

    // Fallback: center of image
    return {
      ...color,
      bounds: { x: 0, y: 0, width: imageData.width, height: imageData.height },
      centroid: { x: imageData.width / 2, y: imageData.height / 2 },
    };
  });
}

/**
 * Optimized version for large images - downscales before processing
 * @param imageBlob - Image blob to analyze
 * @param colors - Array of extracted colors
 * @param maxDimension - Maximum dimension for downscaling (default: 500)
 * @returns Array of located colors with position information (scaled back to original size)
 */
export async function locateColorsOptimized(
  imageBlob: Blob,
  colors: Array<{ hex: string; rgb: { r: number; g: number; b: number }; percentage: number }>,
  maxDimension = 500
): Promise<LocatedColor[]> {
  const img = await createImageBitmap(imageBlob);

  // Downscale if needed
  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);

  const located = locateColors(imageData, colors);

  // Scale bounds back to original size
  const invScale = 1 / scale;
  return located.map(c => ({
    ...c,
    bounds: {
      x: Math.round(c.bounds.x * invScale),
      y: Math.round(c.bounds.y * invScale),
      width: Math.round(c.bounds.width * invScale),
      height: Math.round(c.bounds.height * invScale),
    },
    centroid: {
      x: Math.round(c.centroid.x * invScale),
      y: Math.round(c.centroid.y * invScale),
    },
  }));
}

export default {
  detectColorRegions,
  locateColors,
  locateColorsOptimized,
};
