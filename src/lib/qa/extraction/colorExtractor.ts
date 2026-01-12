/**
 * Color Extractor - Chunk 7.07
 * Extract unique colors from an image using canvas pixel sampling.
 */

/**
 * Extracted color result with hex, RGB, and percentage
 */
export interface ColorResult {
  hex: string;
  rgb: { r: number; g: number; b: number };
  percentage: number;
}

/**
 * Options for color extraction
 */
export interface ExtractOptions {
  sampleRate?: number;  // Sample every Nth pixel (default: 4)
  maxColors?: number;   // Max colors to return (default: 64)
}

/**
 * Convert RGB values to hex string
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Hex color string (e.g., '#ff0000')
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Extract unique colors from an image blob
 * @param imageBlob - Image blob to analyze
 * @param options - Extraction options
 * @returns Array of color results sorted by percentage
 */
export async function extractUniqueColors(
  imageBlob: Blob,
  options: ExtractOptions = {}
): Promise<ColorResult[]> {
  const { sampleRate = 4, maxColors = 64 } = options;

  // Create canvas and draw image
  const img = await createImageBitmap(imageBlob);
  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const { data, width, height } = imageData;

  // Count colors
  const colorCounts = new Map<string, { rgb: { r: number; g: number; b: number }; count: number }>();
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
  const results: ColorResult[] = [];
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
};
