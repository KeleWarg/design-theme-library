/**
 * Color Extractor - Chunk 7.07
 * Extract unique colors from an image using canvas pixel sampling.
 */

/**
 * @typedef {Object} ColorResult
 * @property {string} hex - Hex color code
 * @property {{r: number, g: number, b: number}} rgb - RGB values
 * @property {number} percentage - Percentage of image this color occupies
 */

/**
 * @typedef {Object} ExtractOptions
 * @property {number} [sampleRate=4] - Sample every Nth pixel
 * @property {number} [maxColors=64] - Max colors to return
 */

/**
 * Convert RGB values to hex string
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color code
 */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Extract unique colors from an image blob
 * @param {Blob} imageBlob - The image blob to analyze
 * @param {ExtractOptions} [options={}] - Extraction options
 * @returns {Promise<ColorResult[]>} Array of colors sorted by percentage
 */
export async function extractUniqueColors(imageBlob, options = {}) {
  const { sampleRate = 4, maxColors = 64 } = options;

  // Create canvas and draw image
  const img = await createImageBitmap(imageBlob);
  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const { data, width, height } = imageData;

  // Count colors
  const colorCounts = new Map();
  let totalSampled = 0;

  for (let y = 0; y < height; y += sampleRate) {
    for (let x = 0; x < width; x += sampleRate) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Skip transparent pixels
      if (a < 128) continue;

      totalSampled++;
      const hex = rgbToHex(r, g, b);

      const existing = colorCounts.get(hex);
      if (existing) {
        existing.count++;
      } else {
        colorCounts.set(hex, { rgb: { r, g, b }, count: 1 });
      }
    }
  }

  // Handle edge case where no pixels were sampled
  if (totalSampled === 0) {
    return [];
  }

  // Convert to array and sort by percentage
  const results = [];
  for (const [hex, { rgb, count }] of colorCounts) {
    results.push({
      hex,
      rgb,
      percentage: (count / totalSampled) * 100,
    });
  }

  results.sort((a, b) => b.percentage - a.percentage);
  return results.slice(0, maxColors);
}

/**
 * Extract colors from ImageData directly (for use with existing canvas)
 * @param {ImageData} imageData - The image data to analyze
 * @param {ExtractOptions} [options={}] - Extraction options
 * @returns {ColorResult[]} Array of colors sorted by percentage
 */
export function extractColorsFromImageData(imageData, options = {}) {
  const { sampleRate = 4, maxColors = 64 } = options;
  const { data, width, height } = imageData;

  // Count colors
  const colorCounts = new Map();
  let totalSampled = 0;

  for (let y = 0; y < height; y += sampleRate) {
    for (let x = 0; x < width; x += sampleRate) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Skip transparent pixels
      if (a < 128) continue;

      totalSampled++;
      const hex = rgbToHex(r, g, b);

      const existing = colorCounts.get(hex);
      if (existing) {
        existing.count++;
      } else {
        colorCounts.set(hex, { rgb: { r, g, b }, count: 1 });
      }
    }
  }

  // Handle edge case where no pixels were sampled
  if (totalSampled === 0) {
    return [];
  }

  // Convert to array and sort by percentage
  const results = [];
  for (const [hex, { rgb, count }] of colorCounts) {
    results.push({
      hex,
      rgb,
      percentage: (count / totalSampled) * 100,
    });
  }

  results.sort((a, b) => b.percentage - a.percentage);
  return results.slice(0, maxColors);
}

export default {
  extractUniqueColors,
  extractColorsFromImageData,
};
