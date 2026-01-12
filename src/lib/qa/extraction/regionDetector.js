/**
 * Region Detector - Chunk 7.08
 * Find WHERE colors appear in an image — the key differentiator for annotation-first UX.
 *
 * Algorithm:
 * 1. For target color, create binary mask (pixels within ΔE tolerance)
 * 2. Flood-fill to find connected components (ITERATIVE, not recursive!)
 * 3. For each component: calculate bounds + centroid
 * 4. Filter regions below minRegionPercent
 * 5. Return sorted by size
 */

/**
 * @typedef {Object} ColorRegion
 * @property {{x: number, y: number, width: number, height: number}} bounds - Bounding box
 * @property {{x: number, y: number}} centroid - Center point
 * @property {number} pixelCount - Number of pixels in region
 * @property {number} percentage - Percentage of total image
 */

/**
 * @typedef {Object} LocatedColor
 * @property {string} hex - Hex color code
 * @property {{r: number, g: number, b: number}} rgb - RGB values
 * @property {number} percentage - Percentage of image this color occupies
 * @property {{x: number, y: number, width: number, height: number}} bounds - Bounding box
 * @property {{x: number, y: number}} centroid - Center point
 */

/**
 * @typedef {Object} DetectOptions
 * @property {number} [tolerance=10] - Color distance tolerance
 * @property {number} [minRegionPercent=0.1] - Min region size as % of image
 */

/**
 * ITERATIVE flood-fill to avoid stack overflow on large regions
 * @param {Uint8Array} mask - Binary mask of matching pixels
 * @param {Uint8Array} visited - Visited pixel tracker
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} startX - Starting X coordinate
 * @param {number} startY - Starting Y coordinate
 * @returns {ColorRegion} The detected region
 */
function floodFillIterative(mask, visited, width, height, startX, startY) {
  const stack = [[startX, startY]];
  let minX = startX;
  let maxX = startX;
  let minY = startY;
  let maxY = startY;
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  while (stack.length > 0) {
    const [x, y] = stack.pop();
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
 * Detect color regions in an image
 * @param {ImageData} imageData - The image data to analyze
 * @param {{r: number, g: number, b: number}} targetRgb - Target RGB color to find
 * @param {DetectOptions} [options={}] - Detection options
 * @returns {ColorRegion[]} Array of regions sorted by size (largest first)
 */
export function detectColorRegions(imageData, targetRgb, options = {}) {
  const { tolerance = 10, minRegionPercent = 0.1 } = options;
  const { data, width, height } = imageData;
  const totalPixels = width * height;

  // Create binary mask
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
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
  const regions = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (mask[idx] && !visited[idx]) {
        const region = floodFillIterative(mask, visited, width, height, x, y);
        if ((region.pixelCount / totalPixels) * 100 >= minRegionPercent) {
          region.percentage = (region.pixelCount / totalPixels) * 100;
          regions.push(region);
        }
      }
    }
  }

  return regions.sort((a, b) => b.pixelCount - a.pixelCount);
}

/**
 * Add bounds + centroid to extracted colors
 * @param {ImageData} imageData - The image data to analyze
 * @param {Array<{hex: string, rgb: {r: number, g: number, b: number}, percentage: number}>} colors - Colors to locate
 * @returns {LocatedColor[]} Colors with location information
 */
export function locateColors(imageData, colors) {
  return colors.map((color) => {
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
 * @param {Blob} imageBlob - The image blob to analyze
 * @param {Array<{hex: string, rgb: {r: number, g: number, b: number}, percentage: number}>} colors - Colors to locate
 * @param {number} [maxDimension=500] - Maximum dimension for downscaled processing
 * @returns {Promise<LocatedColor[]>} Colors with location information (scaled to original size)
 */
export async function locateColorsOptimized(imageBlob, colors, maxDimension = 500) {
  const img = await createImageBitmap(imageBlob);

  // Downscale if needed
  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);

  const located = locateColors(imageData, colors);

  // Scale bounds back to original size
  const invScale = 1 / scale;
  return located.map((c) => ({
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
