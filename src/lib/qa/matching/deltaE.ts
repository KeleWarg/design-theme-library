/**
 * Delta E2000 Color Matcher - Chunk 7.12
 *
 * Convert RGB to LAB color space and calculate CIEDE2000 (ΔE2000) distance.
 * ΔE2000 is the industry-standard perceptual color difference formula.
 */

/**
 * LAB color space representation
 */
export interface LAB {
  L: number;
  a: number;
  b: number;
}

/**
 * RGB color representation
 */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Convert RGB to LAB color space via XYZ
 * @param rgb - RGB color (0-255 range)
 * @returns LAB color
 */
export function rgbToLab(rgb: RGB): LAB {
  // RGB to XYZ (sRGB with D65 illuminant)
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  // Apply gamma correction
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // Convert to XYZ with D65 reference white
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  // XYZ to LAB
  const fx = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  const fy = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  const fz = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

/**
 * Convert LAB back to RGB (for display purposes)
 * @param lab - LAB color
 * @returns RGB color (0-255 range)
 */
export function labToRgb(lab: LAB): RGB {
  // LAB to XYZ
  let y = (lab.L + 16) / 116;
  let x = lab.a / 500 + y;
  let z = y - lab.b / 200;

  const y3 = Math.pow(y, 3);
  const x3 = Math.pow(x, 3);
  const z3 = Math.pow(z, 3);

  y = y3 > 0.008856 ? y3 : (y - 16 / 116) / 7.787;
  x = x3 > 0.008856 ? x3 : (x - 16 / 116) / 7.787;
  z = z3 > 0.008856 ? z3 : (z - 16 / 116) / 7.787;

  // Apply D65 reference white
  x *= 0.95047;
  y *= 1.0;
  z *= 1.08883;

  // XYZ to RGB
  let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let b = x * 0.0557 + y * -0.204 + z * 1.057;

  // Apply gamma correction
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

  // Clamp to valid range
  return {
    r: Math.round(Math.max(0, Math.min(255, r * 255))),
    g: Math.round(Math.max(0, Math.min(255, g * 255))),
    b: Math.round(Math.max(0, Math.min(255, b * 255))),
  };
}

/**
 * Calculate CIEDE2000 (ΔE2000) perceptual color difference
 * Based on the CIE technical report: "The CIEDE2000 Color-Difference Formula"
 *
 * @param lab1 - First LAB color
 * @param lab2 - Second LAB color
 * @returns ΔE2000 value (lower = more similar)
 *
 * Thresholds:
 * - ≤1: Not perceptible by human eyes
 * - ≤3: Perceptible through close observation
 * - ≤10: Perceptible at a glance
 * - >10: Colors are more similar than opposite
 */
export function deltaE2000(lab1: LAB, lab2: LAB): number {
  // Lightness difference
  const dL = lab2.L - lab1.L;
  const avgL = (lab1.L + lab2.L) / 2;

  // Chroma
  const c1 = Math.sqrt(lab1.a ** 2 + lab1.b ** 2);
  const c2 = Math.sqrt(lab2.a ** 2 + lab2.b ** 2);
  const avgC = (c1 + c2) / 2;

  // G factor (chroma adjustment)
  const g = 0.5 * (1 - Math.sqrt(avgC ** 7 / (avgC ** 7 + 25 ** 7)));

  // Adjusted a' values
  const a1p = lab1.a * (1 + g);
  const a2p = lab2.a * (1 + g);

  // Adjusted chroma
  const c1p = Math.sqrt(a1p ** 2 + lab1.b ** 2);
  const c2p = Math.sqrt(a2p ** 2 + lab2.b ** 2);
  const dCp = c2p - c1p;
  const avgCp = (c1p + c2p) / 2;

  // Hue angles (in degrees)
  let h1p = Math.atan2(lab1.b, a1p) * (180 / Math.PI);
  let h2p = Math.atan2(lab2.b, a2p) * (180 / Math.PI);

  // Normalize hue to [0, 360)
  if (h1p < 0) h1p += 360;
  if (h2p < 0) h2p += 360;

  // Hue difference
  let dHp: number;
  if (c1p === 0 || c2p === 0) {
    dHp = 0;
  } else if (Math.abs(h2p - h1p) <= 180) {
    dHp = h2p - h1p;
  } else if (h2p - h1p > 180) {
    dHp = h2p - h1p - 360;
  } else {
    dHp = h2p - h1p + 360;
  }

  // ΔH'
  const dHpPrime = 2 * Math.sqrt(c1p * c2p) * Math.sin((dHp * Math.PI) / 360);

  // Average hue
  let avgHp: number;
  if (c1p === 0 || c2p === 0) {
    avgHp = h1p + h2p;
  } else if (Math.abs(h1p - h2p) <= 180) {
    avgHp = (h1p + h2p) / 2;
  } else if (h1p + h2p < 360) {
    avgHp = (h1p + h2p + 360) / 2;
  } else {
    avgHp = (h1p + h2p - 360) / 2;
  }

  // T factor
  const t =
    1 -
    0.17 * Math.cos(((avgHp - 30) * Math.PI) / 180) +
    0.24 * Math.cos((2 * avgHp * Math.PI) / 180) +
    0.32 * Math.cos(((3 * avgHp + 6) * Math.PI) / 180) -
    0.2 * Math.cos(((4 * avgHp - 63) * Math.PI) / 180);

  // Weighting functions
  const sl = 1 + (0.015 * (avgL - 50) ** 2) / Math.sqrt(20 + (avgL - 50) ** 2);
  const sc = 1 + 0.045 * avgCp;
  const sh = 1 + 0.015 * avgCp * t;

  // Rotation term
  const dTheta = 30 * Math.exp(-(((avgHp - 275) / 25) ** 2));
  const rc = 2 * Math.sqrt(avgCp ** 7 / (avgCp ** 7 + 25 ** 7));
  const rt = -rc * Math.sin((2 * dTheta * Math.PI) / 180);

  // Final ΔE2000
  return Math.sqrt(
    (dL / sl) ** 2 +
      (dCp / sc) ** 2 +
      (dHpPrime / sh) ** 2 +
      rt * (dCp / sc) * (dHpPrime / sh)
  );
}

/**
 * Convert hex color to RGB
 * @param hex - Hex color string (with or without #)
 * @returns RGB color
 */
export function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace('#', '');
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);

  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }

  // Handle shorthand hex (#fff)
  const shortResult = /^([a-f\d])([a-f\d])([a-f\d])$/i.exec(cleanHex);
  if (shortResult) {
    return {
      r: parseInt(shortResult[1] + shortResult[1], 16),
      g: parseInt(shortResult[2] + shortResult[2], 16),
      b: parseInt(shortResult[3] + shortResult[3], 16),
    };
  }

  return { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB to hex color
 * @param rgb - RGB color
 * @returns Hex color string with #
 */
export function rgbToHex(rgb: RGB): string {
  return (
    '#' +
    [rgb.r, rgb.g, rgb.b]
      .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0'))
      .join('')
  );
}

/**
 * Calculate ΔE2000 directly from hex colors
 * @param hex1 - First hex color
 * @param hex2 - Second hex color
 * @returns ΔE2000 value
 */
export function deltaE2000Hex(hex1: string, hex2: string): number {
  const lab1 = rgbToLab(hexToRgb(hex1));
  const lab2 = rgbToLab(hexToRgb(hex2));
  return deltaE2000(lab1, lab2);
}

export default {
  rgbToLab,
  labToRgb,
  deltaE2000,
  hexToRgb,
  rgbToHex,
  deltaE2000Hex,
};
