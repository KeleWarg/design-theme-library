# Phase 7 Extraction + Matching — Chunks 7.07-7.16

## Overview
Extract colors and fonts from captured assets, detect WHERE they appear, and match against design tokens.

---

## Chunk 7.07 — Color Extractor

### Purpose
Extract unique colors from an image using canvas pixel sampling.

### Requirements
- `extractUniqueColors(imageBlob, options?)` returns colors with percentage
- Sample every Nth pixel (configurable `sampleRate`, default 4)
- Skip transparent pixels (alpha < 128)
- Return sorted by percentage, limit to `maxColors` (default 64)

### Implementation

```typescript
// src/lib/qa/extraction/colorExtractor.ts

export interface ColorResult {
  hex: string;
  rgb: { r: number; g: number; b: number };
  percentage: number;
}

export interface ExtractOptions {
  sampleRate?: number;  // Sample every Nth pixel (default: 4)
  maxColors?: number;   // Max colors to return (default: 64)
}

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

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}
```

### Files
- `src/lib/qa/extraction/colorExtractor.ts`

---

## Chunk 7.08 — Region Detector ★ CRITICAL

### Purpose
Find WHERE colors appear in an image — the key differentiator for annotation-first UX.

### Algorithm
1. For target color, create binary mask (pixels within ΔE tolerance)
2. Flood-fill to find connected components (ITERATIVE, not recursive!)
3. For each component: calculate bounds + centroid
4. Filter regions below minRegionPercent
5. Return sorted by size

### Requirements
- `detectColorRegions(imageData, targetRgb, options?)` returns `ColorRegion[]`
- `locateColors(imageData, colors)` adds bounds + centroid to each color
- **CRITICAL**: Use iterative flood-fill to avoid stack overflow

### Implementation

```typescript
// src/lib/qa/extraction/regionDetector.ts

export interface ColorRegion {
  bounds: { x: number; y: number; width: number; height: number };
  centroid: { x: number; y: number };
  pixelCount: number;
  percentage: number;
}

export interface LocatedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  percentage: number;
  bounds: { x: number; y: number; width: number; height: number };
  centroid: { x: number; y: number };
}

interface DetectOptions {
  tolerance?: number;        // Color distance tolerance (default: 10)
  minRegionPercent?: number; // Min region size as % of image (default: 0.1)
}

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

// ITERATIVE flood-fill to avoid stack overflow on large regions
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

// Add bounds + centroid to extracted colors
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

// Optimized version for large images
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
```

### Files
- `src/lib/qa/extraction/regionDetector.ts`

### Performance Target
< 500ms for 1000×1000 image

---

## Chunk 7.09 — DOM Extractor

### Purpose
Convert captured DOM elements to LocatedColor and LocatedFont.

### Implementation

```typescript
// src/lib/qa/extraction/domExtractor.ts
import { DOMElement } from '../../../types/qa';
import { LocatedColor } from './regionDetector';

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

export function extractFromDOM(elements: DOMElement[]): {
  colors: LocatedColor[];
  fonts: LocatedFont[];
} {
  const colorMap = new Map<string, LocatedColor>();
  const fonts: LocatedFont[] = [];
  
  for (const el of elements) {
    // Extract background colors
    const bg = parseColor(el.styles.backgroundColor);
    if (bg && bg !== 'transparent') {
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
```

### Files
- `src/lib/qa/extraction/domExtractor.ts`

---

## Chunk 7.10 — Font Extractor

### Purpose
Extract font information from image using DOM data or Figma nodes.

### Implementation

```typescript
// src/lib/qa/extraction/fontExtractor.ts
import { LocatedFont } from './domExtractor';

export function extractFonts(
  domElements?: Array<{ styles: Record<string, string>; bounds: any; textContent: string; selector: string }>,
  figmaNodes?: any[]
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
  
  return fonts;
}

function cleanFontFamily(family: string): string {
  // Remove quotes and take first font
  return family?.replace(/["']/g, '').split(',')[0].trim() || 'sans-serif';
}
```

### Files
- `src/lib/qa/extraction/fontExtractor.ts`

---

## Chunk 7.11 — Extraction Orchestrator

### Purpose
Combine all extractors based on input type.

### Implementation

```typescript
// src/lib/qa/extraction/orchestrator.ts
import { CapturedAsset } from '../../../types/qa';
import { extractUniqueColors } from './colorExtractor';
import { locateColorsOptimized, LocatedColor } from './regionDetector';
import { extractFromDOM, LocatedFont } from './domExtractor';
import { extractFonts } from './fontExtractor';

export interface ExtractionResult {
  colors: LocatedColor[];
  fonts: LocatedFont[];
}

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
```

### Files
- `src/lib/qa/extraction/orchestrator.ts`

---

## Chunk 7.12 — ΔE2000 Color Matcher

### Purpose
Match extracted colors to design tokens using perceptual color distance.

### Requirements
- Convert RGB to LAB color space
- Calculate CIEDE2000 (ΔE2000) distance
- Thresholds: pass (≤3), warn (≤10), fail (>10)

### Implementation

```typescript
// src/lib/qa/matching/deltaE.ts

export interface LAB { L: number; a: number; b: number; }

export function rgbToLab(rgb: { r: number; g: number; b: number }): LAB {
  // RGB to XYZ
  let r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  
  // XYZ to LAB
  const fx = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  const fy = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  const fz = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
  
  return {
    L: (116 * fy) - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

export function deltaE2000(lab1: LAB, lab2: LAB): number {
  // Simplified ΔE2000 implementation
  const dL = lab2.L - lab1.L;
  const avgL = (lab1.L + lab2.L) / 2;
  
  const c1 = Math.sqrt(lab1.a ** 2 + lab1.b ** 2);
  const c2 = Math.sqrt(lab2.a ** 2 + lab2.b ** 2);
  const avgC = (c1 + c2) / 2;
  
  const g = 0.5 * (1 - Math.sqrt(avgC ** 7 / (avgC ** 7 + 25 ** 7)));
  
  const a1p = lab1.a * (1 + g);
  const a2p = lab2.a * (1 + g);
  
  const c1p = Math.sqrt(a1p ** 2 + lab1.b ** 2);
  const c2p = Math.sqrt(a2p ** 2 + lab2.b ** 2);
  const dCp = c2p - c1p;
  const avgCp = (c1p + c2p) / 2;
  
  const h1p = Math.atan2(lab1.b, a1p) * 180 / Math.PI;
  const h2p = Math.atan2(lab2.b, a2p) * 180 / Math.PI;
  
  let dHp = h2p - h1p;
  if (Math.abs(dHp) > 180) dHp -= 360 * Math.sign(dHp);
  const dHpRad = 2 * Math.sqrt(c1p * c2p) * Math.sin(dHp * Math.PI / 360);
  
  const avgHp = (h1p + h2p) / 2;
  
  const t = 1 - 0.17 * Math.cos((avgHp - 30) * Math.PI / 180)
            + 0.24 * Math.cos(2 * avgHp * Math.PI / 180)
            + 0.32 * Math.cos((3 * avgHp + 6) * Math.PI / 180)
            - 0.20 * Math.cos((4 * avgHp - 63) * Math.PI / 180);
  
  const sl = 1 + (0.015 * (avgL - 50) ** 2) / Math.sqrt(20 + (avgL - 50) ** 2);
  const sc = 1 + 0.045 * avgCp;
  const sh = 1 + 0.015 * avgCp * t;
  
  const dTheta = 30 * Math.exp(-((avgHp - 275) / 25) ** 2);
  const rc = 2 * Math.sqrt(avgCp ** 7 / (avgCp ** 7 + 25 ** 7));
  const rt = -rc * Math.sin(2 * dTheta * Math.PI / 180);
  
  return Math.sqrt(
    (dL / sl) ** 2 +
    (dCp / sc) ** 2 +
    (dHpRad / sh) ** 2 +
    rt * (dCp / sc) * (dHpRad / sh)
  );
}
```

```typescript
// src/lib/qa/matching/colorMatcher.ts
import { rgbToLab, deltaE2000 } from './deltaE';
import { LocatedColor } from '../extraction/regionDetector';

export type MatchStatus = 'pass' | 'warn' | 'fail';

export interface ColorMatch {
  source: LocatedColor;
  token?: {
    path: string;
    hex: string;
    cssVariable: string;
  };
  deltaE: number;
  status: MatchStatus;
}

export async function matchColors(
  colors: LocatedColor[],
  themeId: string
): Promise<ColorMatch[]> {
  // Fetch tokens for theme
  const tokens = await fetchColorTokens(themeId);
  
  return colors.map(color => {
    const sourceLab = rgbToLab(color.rgb);
    let bestMatch: ColorMatch['token'] | undefined;
    let bestDeltaE = Infinity;
    
    for (const token of tokens) {
      const tokenLab = rgbToLab(hexToRgb(token.hex));
      const dE = deltaE2000(sourceLab, tokenLab);
      
      if (dE < bestDeltaE) {
        bestDeltaE = dE;
        bestMatch = {
          path: token.path,
          hex: token.hex,
          cssVariable: `var(--${token.path.replace(/\//g, '-').toLowerCase()})`,
        };
      }
    }
    
    return {
      source: color,
      token: bestMatch,
      deltaE: bestDeltaE,
      status: getStatus(bestDeltaE),
    };
  });
}

function getStatus(deltaE: number): MatchStatus {
  if (deltaE <= 3) return 'pass';
  if (deltaE <= 10) return 'warn';
  return 'fail';
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
}

async function fetchColorTokens(themeId: string) {
  // Import from your token service
  const { tokenService } = await import('../../../services/tokenService');
  const tokens = await tokenService.getTokensByTheme(themeId);
  return tokens.filter(t => t.category === 'color').map(t => ({
    path: t.path,
    hex: t.value?.hex || t.value,
  }));
}
```

### Files
- `src/lib/qa/matching/deltaE.ts`
- `src/lib/qa/matching/colorMatcher.ts`

---

## Chunk 7.13 — Font Matcher

### Purpose
Match extracted fonts to typography tokens.

### Implementation

```typescript
// src/lib/qa/matching/fontMatcher.ts
import { LocatedFont } from '../extraction/domExtractor';

export interface FontMatch {
  source: LocatedFont;
  token?: {
    role: string;
    fontFamily: string;
    fontSize: string;
    cssVariable: string;
  };
  status: 'pass' | 'warn' | 'fail';
  issues: string[];
}

export async function matchFonts(
  fonts: LocatedFont[],
  themeId: string
): Promise<FontMatch[]> {
  const typographyTokens = await fetchTypographyTokens(themeId);
  
  return fonts.map(font => {
    const issues: string[] = [];
    let bestMatch: FontMatch['token'] | undefined;
    let bestScore = 0;
    
    for (const token of typographyTokens) {
      let score = 0;
      
      // Check font family
      if (normalizeFontFamily(font.fontFamily) === normalizeFontFamily(token.fontFamily)) {
        score += 3;
      }
      
      // Check font size (within 2px)
      const srcSize = parseFloat(font.fontSize);
      const tokenSize = parseFloat(token.fontSize);
      if (Math.abs(srcSize - tokenSize) <= 2) {
        score += 2;
      }
      
      // Check weight
      if (font.fontWeight === token.fontWeight) {
        score += 1;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          role: token.role,
          fontFamily: token.fontFamily,
          fontSize: token.fontSize,
          cssVariable: `var(--font-${token.role.toLowerCase()})`,
        };
      }
    }
    
    // Generate issues
    if (!bestMatch) {
      issues.push('No matching typography token found');
    } else {
      if (normalizeFontFamily(font.fontFamily) !== normalizeFontFamily(bestMatch.fontFamily)) {
        issues.push(`Font family mismatch: ${font.fontFamily} vs ${bestMatch.fontFamily}`);
      }
      if (font.fontSize !== bestMatch.fontSize) {
        issues.push(`Font size mismatch: ${font.fontSize} vs ${bestMatch.fontSize}`);
      }
    }
    
    return {
      source: font,
      token: bestMatch,
      status: issues.length === 0 ? 'pass' : issues.length === 1 ? 'warn' : 'fail',
      issues,
    };
  });
}

function normalizeFontFamily(family: string): string {
  return family.replace(/["']/g, '').split(',')[0].trim().toLowerCase();
}

async function fetchTypographyTokens(themeId: string) {
  const { tokenService } = await import('../../../services/tokenService');
  const roles = await tokenService.getTypographyRoles(themeId);
  return roles.map(r => ({
    role: r.role,
    fontFamily: r.fontFamily,
    fontSize: r.fontSize,
    fontWeight: r.fontWeight || '400',
  }));
}
```

### Files
- `src/lib/qa/matching/fontMatcher.ts`

---

## Chunk 7.14 — Issue Generator

### Purpose
Convert matches into numbered issues with marker positions.

### Implementation

```typescript
// src/lib/qa/issues/issueGenerator.ts
import { ColorMatch } from '../matching/colorMatcher';
import { FontMatch } from '../matching/fontMatcher';

export type IssueType = 'color' | 'font';
export type IssueStatus = 'pass' | 'warn' | 'fail';

export interface Issue {
  id: string;
  number: number;
  type: IssueType;
  status: IssueStatus;
  message: string;
  marker: { x: number; y: number };
  bounds: { x: number; y: number; width: number; height: number };
  source: {
    value: string;  // hex or font description
  };
  suggestion?: {
    token: string;
    cssVariable: string;
    value: string;
  };
}

export function generateIssues(
  colorMatches: ColorMatch[],
  fontMatches: FontMatch[]
): Issue[] {
  const issues: Issue[] = [];
  let number = 1;
  
  // Process color matches (fail and warn only)
  for (const match of colorMatches) {
    if (match.status === 'pass') continue;
    
    issues.push({
      id: `issue-${number}`,
      number,
      type: 'color',
      status: match.status,
      message: match.status === 'fail'
        ? `Color ${match.source.hex} not found in design system (ΔE: ${match.deltaE.toFixed(1)})`
        : `Color ${match.source.hex} close to ${match.token?.path} (ΔE: ${match.deltaE.toFixed(1)})`,
      marker: match.source.centroid,
      bounds: match.source.bounds,
      source: { value: match.source.hex },
      suggestion: match.token ? {
        token: match.token.path,
        cssVariable: match.token.cssVariable,
        value: match.token.hex,
      } : undefined,
    });
    number++;
  }
  
  // Process font matches (fail and warn only)
  for (const match of fontMatches) {
    if (match.status === 'pass') continue;
    
    issues.push({
      id: `issue-${number}`,
      number,
      type: 'font',
      status: match.status,
      message: match.issues.join('; '),
      marker: match.source.centroid,
      bounds: match.source.bounds,
      source: { value: `${match.source.fontFamily} ${match.source.fontSize}` },
      suggestion: match.token ? {
        token: match.token.role,
        cssVariable: match.token.cssVariable,
        value: `${match.token.fontFamily} ${match.token.fontSize}`,
      } : undefined,
    });
    number++;
  }
  
  // Sort by severity (fail first)
  issues.sort((a, b) => {
    const order = { fail: 0, warn: 1, pass: 2 };
    return order[a.status] - order[b.status];
  });
  
  // Re-number after sort
  issues.forEach((issue, i) => {
    issue.number = i + 1;
  });
  
  return issues;
}
```

### Files
- `src/lib/qa/issues/issueGenerator.ts`

---

## Chunk 7.15 — Marker Clusterer

### Purpose
Group nearby markers to prevent visual overlap.

### Implementation

```typescript
// src/lib/qa/issues/markerClusterer.ts
import { Issue } from './issueGenerator';

export interface MarkerCluster {
  id: string;
  position: { x: number; y: number };
  issues: Issue[];
}

const CLUSTER_DISTANCE = 30; // pixels

export function clusterMarkers(issues: Issue[]): {
  standalone: Issue[];
  clusters: MarkerCluster[];
} {
  const standalone: Issue[] = [];
  const clusters: MarkerCluster[] = [];
  const used = new Set<string>();
  
  for (const issue of issues) {
    if (used.has(issue.id)) continue;
    
    // Find nearby issues
    const nearby = issues.filter(other => {
      if (other.id === issue.id || used.has(other.id)) return false;
      const dx = other.marker.x - issue.marker.x;
      const dy = other.marker.y - issue.marker.y;
      return Math.sqrt(dx * dx + dy * dy) < CLUSTER_DISTANCE;
    });
    
    if (nearby.length === 0) {
      standalone.push(issue);
      used.add(issue.id);
    } else {
      const clusterIssues = [issue, ...nearby];
      clusterIssues.forEach(i => used.add(i.id));
      
      // Cluster center is average of all positions
      const avgX = clusterIssues.reduce((sum, i) => sum + i.marker.x, 0) / clusterIssues.length;
      const avgY = clusterIssues.reduce((sum, i) => sum + i.marker.y, 0) / clusterIssues.length;
      
      clusters.push({
        id: `cluster-${clusters.length + 1}`,
        position: { x: avgX, y: avgY },
        issues: clusterIssues,
      });
    }
  }
  
  return { standalone, clusters };
}
```

### Files
- `src/lib/qa/issues/markerClusterer.ts`

---

## Chunk 7.16 — Fix Generator

### Purpose
Generate CSS fix suggestions for each issue.

### Implementation

```typescript
// src/lib/qa/issues/fixGenerator.ts
import { Issue } from './issueGenerator';

export interface Fix {
  issueId: string;
  selector?: string;
  property: string;
  oldValue: string;
  newValue: string;
  cssCode: string;
}

export function generateFixes(issues: Issue[], domElements?: any[]): Fix[] {
  return issues
    .filter(issue => issue.suggestion)
    .map(issue => {
      const selector = findSelector(issue, domElements);
      const property = issue.type === 'color' ? 'color' : 'font';
      
      return {
        issueId: issue.id,
        selector,
        property: issue.type === 'color' ? 'background-color' : 'font',
        oldValue: issue.source.value,
        newValue: issue.suggestion!.cssVariable,
        cssCode: selector
          ? `${selector} {\n  ${property}: ${issue.suggestion!.cssVariable};\n}`
          : `/* Use: ${issue.suggestion!.cssVariable} */`,
      };
    });
}

function findSelector(issue: Issue, domElements?: any[]): string | undefined {
  if (!domElements) return undefined;
  
  // Find element at issue bounds
  const el = domElements.find(e => 
    e.bounds.x === issue.bounds.x &&
    e.bounds.y === issue.bounds.y
  );
  
  return el?.selector;
}
```

### Files
- `src/lib/qa/issues/fixGenerator.ts`

---

## Gate 7B/7C Verification

```bash
npm run build && npm test -- src/lib/qa/
```

Checklist:
- [ ] Colors extracted with percentage
- [ ] Regions detected with bounds + centroid
- [ ] ΔE2000 calculates correctly
- [ ] Issues generated with marker positions
- [ ] Nearby markers clustered
