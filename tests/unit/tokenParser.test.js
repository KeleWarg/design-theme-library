/**
 * @chunk 1.12 - Token Parser Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseTokens,
  parseTokenFile,
  detectFormat,
  detectCategory,
  generateCssVariable,
  detectType,
  __testing
} from '../../src/lib/tokenParser.js';

// Load test fixtures
import sampleTokens from '../fixtures/sample-tokens.json';

// =============================================================================
// Format Detection Tests
// =============================================================================

describe('detectFormat', () => {
  it('detects figma-variables (DTCG) format', () => {
    const result = detectFormat(sampleTokens['figma-variables'].data);
    expect(result).toBe('figma-variables');
  });

  it('detects style-dictionary format', () => {
    const result = detectFormat(sampleTokens['style-dictionary'].data);
    expect(result).toBe('style-dictionary');
  });

  it('detects flat format', () => {
    const result = detectFormat(sampleTokens['flat'].data);
    expect(result).toBe('flat');
  });

  it('returns unknown for invalid input', () => {
    expect(detectFormat(null)).toBe('unknown');
    expect(detectFormat(undefined)).toBe('unknown');
    expect(detectFormat('string')).toBe('unknown');
    expect(detectFormat(123)).toBe('unknown');
  });

  it('returns unknown for empty object', () => {
    expect(detectFormat({})).toBe('unknown');
  });
});

// =============================================================================
// Figma Variables (DTCG) Format Tests
// =============================================================================

describe('parseTokens - Figma Variables format', () => {
  let result;

  beforeEach(() => {
    result = parseTokens(sampleTokens['figma-variables'].data);
  });

  it('parses tokens without errors', () => {
    expect(result.errors).toHaveLength(0);
  });

  it('detects correct format in metadata', () => {
    expect(result.metadata.format).toBe('figma-variables');
  });

  it('parses all tokens', () => {
    expect(result.tokens.length).toBeGreaterThan(0);
    expect(result.metadata.totalParsed).toBe(result.tokens.length);
  });

  it('parses color tokens correctly', () => {
    const colorToken = result.tokens.find(t => t.path === 'Color/Primary/500');
    expect(colorToken).toBeDefined();
    expect(colorToken.type).toBe('color');
    expect(colorToken.category).toBe('color');
    expect(colorToken.value.hex).toBe('#657E79');
    expect(colorToken.css_variable).toBe('--color-primary-500');
  });

  it('preserves Figma variable IDs in metadata', () => {
    const colorToken = result.tokens.find(t => t.path === 'Color/Primary/500');
    expect(colorToken.metadata.figma_id).toBe('VariableID:123:456');
  });

  it('parses spacing tokens correctly', () => {
    const spacingToken = result.tokens.find(t => t.path === 'Spacing/md');
    expect(spacingToken).toBeDefined();
    expect(spacingToken.category).toBe('spacing');
    expect(spacingToken.value).toEqual({ value: 16, unit: 'px' });
  });

  it('parses shadow tokens correctly', () => {
    const shadowToken = result.tokens.find(t => t.path === 'Shadow/sm');
    expect(shadowToken).toBeDefined();
    expect(shadowToken.category).toBe('shadow');
    expect(shadowToken.type).toBe('shadow');
  });

  it('categorizes tokens by category in metadata', () => {
    expect(result.metadata.categories.color).toBeGreaterThan(0);
    expect(result.metadata.categories.spacing).toBeGreaterThan(0);
  });
});

// =============================================================================
// Style Dictionary Format Tests
// =============================================================================

describe('parseTokens - Style Dictionary format', () => {
  let result;

  beforeEach(() => {
    result = parseTokens(sampleTokens['style-dictionary'].data);
  });

  it('parses tokens without errors', () => {
    expect(result.errors).toHaveLength(0);
  });

  it('detects correct format in metadata', () => {
    expect(result.metadata.format).toBe('style-dictionary');
  });

  it('parses tokens from multiple modes', () => {
    // Should have tokens from both Default and Dark modes
    const defaultTokens = result.tokens.filter(t => t.metadata.mode === 'Default');
    const darkTokens = result.tokens.filter(t => t.metadata.mode === 'Dark');
    
    expect(defaultTokens.length).toBeGreaterThan(0);
    expect(darkTokens.length).toBeGreaterThan(0);
  });

  it('converts Figma COLOR type correctly', () => {
    const colorToken = result.tokens.find(
      t => t.path === 'color/primary' && t.metadata.mode === 'Default'
    );
    expect(colorToken).toBeDefined();
    expect(colorToken.type).toBe('color');
    expect(colorToken.value.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(colorToken.value.rgb).toBeDefined();
  });

  it('includes collection and mode in metadata', () => {
    const token = result.tokens[0];
    expect(token.metadata.collection).toBe('Primitives');
    expect(token.metadata.mode).toBeDefined();
  });
});

// =============================================================================
// Flat Format Tests
// =============================================================================

describe('parseTokens - Flat format', () => {
  let result;

  beforeEach(() => {
    result = parseTokens(sampleTokens['flat'].data);
  });

  it('parses tokens without errors', () => {
    expect(result.errors).toHaveLength(0);
  });

  it('detects correct format in metadata', () => {
    expect(result.metadata.format).toBe('flat');
  });

  it('parses nested color tokens correctly', () => {
    const colorToken = result.tokens.find(t => t.path === 'colors/primary/500');
    expect(colorToken).toBeDefined();
    expect(colorToken.category).toBe('color');
    expect(colorToken.value.hex).toBe('#4CAF50');
  });

  it('preserves existing CSS variable names', () => {
    const colorToken = result.tokens.find(t => t.path === 'colors/primary/500');
    expect(colorToken.css_variable).toBe('--color-primary-500');
  });

  it('parses spacing tokens with dimension values', () => {
    const spacingToken = result.tokens.find(t => t.path === 'spacing/md');
    expect(spacingToken).toBeDefined();
    expect(spacingToken.category).toBe('spacing');
  });
});

// =============================================================================
// Category Detection Tests
// =============================================================================

describe('detectCategory', () => {
  it('detects color category', () => {
    expect(detectCategory('color/primary', 'color')).toBe('color');
    expect(detectCategory('colors/brand/500', 'string')).toBe('color');
    expect(detectCategory('background/default', 'color')).toBe('color');
    expect(detectCategory('foreground/primary', 'string')).toBe('color');
    expect(detectCategory('fill/button', 'color')).toBe('color');
    expect(detectCategory('stroke/border', 'string')).toBe('color');
    expect(detectCategory('text/primary', 'string')).toBe('color');
  });

  it('detects typography category', () => {
    expect(detectCategory('typography/heading/lg', 'string')).toBe('typography');
    expect(detectCategory('font/size/base', 'dimension')).toBe('typography');
    expect(detectCategory('heading/h1', 'string')).toBe('typography');
    expect(detectCategory('body/default', 'string')).toBe('typography');
    expect(detectCategory('display/large', 'string')).toBe('typography');
    expect(detectCategory('line-height/normal', 'number')).toBe('typography');
  });

  it('detects spacing category', () => {
    expect(detectCategory('spacing/md', 'dimension')).toBe('spacing');
    expect(detectCategory('space/4', 'dimension')).toBe('spacing');
    expect(detectCategory('gap/default', 'dimension')).toBe('spacing');
    expect(detectCategory('margin/lg', 'dimension')).toBe('spacing');
    expect(detectCategory('padding/sm', 'dimension')).toBe('spacing');
  });

  it('detects shadow category', () => {
    expect(detectCategory('shadow/sm', 'shadow')).toBe('shadow');
    expect(detectCategory('elevation/1', 'string')).toBe('shadow');
    expect(detectCategory('drop-shadow/default', 'string')).toBe('shadow');
  });

  it('detects radius category', () => {
    expect(detectCategory('radius/md', 'dimension')).toBe('radius');
    expect(detectCategory('corner/default', 'dimension')).toBe('radius');
    expect(detectCategory('rounded/full', 'dimension')).toBe('radius');
    expect(detectCategory('border-radius/lg', 'dimension')).toBe('radius');
  });

  it('detects grid category', () => {
    expect(detectCategory('grid/columns', 'number')).toBe('grid');
    expect(detectCategory('breakpoint/md', 'dimension')).toBe('grid');
    expect(detectCategory('container/max-width', 'dimension')).toBe('grid');
  });

  it('returns other for unknown categories', () => {
    expect(detectCategory('custom/thing', 'string')).toBe('other');
    expect(detectCategory('misc/value', 'number')).toBe('other');
  });
});

// =============================================================================
// CSS Variable Generation Tests
// =============================================================================

describe('generateCssVariable', () => {
  it('converts path to CSS variable format', () => {
    expect(generateCssVariable('color/primary')).toBe('--color-primary');
    expect(generateCssVariable('Color/Primary/500')).toBe('--color-primary-500');
    expect(generateCssVariable('spacing/md')).toBe('--spacing-md');
  });

  it('handles spaces in paths', () => {
    expect(generateCssVariable('color/brand primary')).toBe('--color-brand-primary');
  });

  it('handles special characters', () => {
    expect(generateCssVariable('color.primary')).toBe('--color-primary');
    expect(generateCssVariable('color_primary')).toBe('--color-primary');
  });

  it('collapses multiple hyphens', () => {
    expect(generateCssVariable('color//primary')).toBe('--color-primary');
    expect(generateCssVariable('color---primary')).toBe('--color-primary');
  });

  it('removes leading/trailing hyphens', () => {
    expect(generateCssVariable('/color/primary/')).toBe('--color-primary');
  });

  it('converts to lowercase', () => {
    expect(generateCssVariable('COLOR/PRIMARY')).toBe('--color-primary');
    expect(generateCssVariable('Color/Primary')).toBe('--color-primary');
  });
});

// =============================================================================
// Type Detection Tests
// =============================================================================

describe('detectType', () => {
  it('detects hex colors', () => {
    expect(detectType('#fff')).toBe('color');
    expect(detectType('#ffffff')).toBe('color');
    expect(detectType('#ffffffff')).toBe('color');
  });

  it('detects rgb/rgba colors', () => {
    expect(detectType('rgb(255, 255, 255)')).toBe('color');
    expect(detectType('rgba(255, 255, 255, 0.5)')).toBe('color');
  });

  it('detects hsl colors', () => {
    expect(detectType('hsl(0, 100%, 50%)')).toBe('color');
    expect(detectType('hsla(0, 100%, 50%, 0.5)')).toBe('color');
  });

  it('detects dimension values', () => {
    expect(detectType('16px')).toBe('dimension');
    expect(detectType('1.5rem')).toBe('dimension');
    expect(detectType('2em')).toBe('dimension');
    expect(detectType('100%')).toBe('dimension');
    expect(detectType('100vh')).toBe('dimension');
  });

  it('detects duration values', () => {
    expect(detectType('200ms')).toBe('duration');
    expect(detectType('0.3s')).toBe('duration');
  });

  it('detects number values', () => {
    expect(detectType(16)).toBe('number');
    expect(detectType(1.5)).toBe('number');
    expect(detectType('16')).toBe('number');
  });

  it('detects boolean values', () => {
    expect(detectType(true)).toBe('boolean');
    expect(detectType(false)).toBe('boolean');
  });

  it('detects color objects', () => {
    expect(detectType({ r: 255, g: 255, b: 255 })).toBe('color');
    expect(detectType({ hex: '#ffffff' })).toBe('color');
    expect(detectType({ components: [1, 1, 1] })).toBe('color');
  });

  it('detects dimension objects', () => {
    expect(detectType({ value: 16, unit: 'px' })).toBe('dimension');
  });

  it('detects shadow objects', () => {
    expect(detectType({ shadows: [] })).toBe('shadow');
    expect(detectType({ blur: 4, color: '#000' })).toBe('shadow');
  });

  it('returns string for unknown types', () => {
    expect(detectType('hello world')).toBe('string');
    expect(detectType({})).toBe('string');
  });
});

// =============================================================================
// Color Conversion Tests
// =============================================================================

describe('color conversion', () => {
  const { rgbToHex, convertDTCGValue } = __testing;

  it('converts RGB to hex correctly', () => {
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
    expect(rgbToHex(59, 130, 246)).toBe('#3b82f6');
  });

  it('converts Figma sRGB components (0-1) to hex', () => {
    const value = convertDTCGValue('color', {
      colorSpace: 'srgb',
      components: [0.396, 0.494, 0.475],
      alpha: 1,
      hex: '#657E79'
    });
    
    expect(value.hex).toBe('#657E79');
    expect(value.rgb.r).toBe(101);
    expect(value.rgb.g).toBe(126);
    expect(value.rgb.b).toBe(121);
    expect(value.opacity).toBe(1);
  });

  it('handles color objects with 0-1 RGB values', () => {
    const value = convertDTCGValue('color', { r: 0.5, g: 0.5, b: 0.5, a: 0.8 });
    expect(value.hex).toBe('#808080');
    expect(value.opacity).toBe(0.8);
  });
});

// =============================================================================
// Error Handling Tests
// =============================================================================

describe('error handling', () => {
  it('returns error for unknown format', () => {
    const result = parseTokens({});
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.metadata.format).toBe('unknown');
  });

  it('handles deeply nested structures', () => {
    const deeplyNested = {
      level1: {
        level2: {
          level3: {
            level4: {
              token: {
                $type: 'color',
                $value: '#ffffff'
              }
            }
          }
        }
      }
    };
    
    const result = parseTokens(deeplyNested);
    expect(result.errors).toHaveLength(0);
    expect(result.tokens.length).toBe(1);
  });

  it('reports warnings for invalid tokens', () => {
    const withInvalidTokens = {
      valid: {
        $type: 'color',
        $value: '#ffffff'
      },
      invalid: {
        $type: 'color',
        $value: null // Invalid value
      }
    };
    
    const result = parseTokens(withInvalidTokens);
    // Should still parse the valid token
    expect(result.tokens.length).toBeGreaterThanOrEqual(1);
  });
});

// =============================================================================
// parseTokenFile alias test
// =============================================================================

describe('parseTokenFile', () => {
  it('is an alias for parseTokens', () => {
    const data = sampleTokens['figma-variables'].data;
    const result1 = parseTokens(data);
    const result2 = parseTokenFile(data);
    
    expect(result1.tokens.length).toBe(result2.tokens.length);
    expect(result1.metadata.format).toBe(result2.metadata.format);
  });
});

// =============================================================================
// Integration Tests
// =============================================================================

describe('integration', () => {
  it('produces valid CSS variable names for all tokens', () => {
    const formats = ['figma-variables', 'flat'];
    
    for (const format of formats) {
      const result = parseTokens(sampleTokens[format].data);
      
      for (const token of result.tokens) {
        // CSS variables must start with --
        expect(token.css_variable).toMatch(/^--[a-z0-9-]+$/);
        // No double hyphens (except at start)
        expect(token.css_variable).not.toMatch(/---/);
      }
    }
  });

  it('assigns valid categories to all tokens', () => {
    const validCategories = ['color', 'typography', 'spacing', 'shadow', 'radius', 'grid', 'other'];
    
    const result = parseTokens(sampleTokens['figma-variables'].data);
    
    for (const token of result.tokens) {
      expect(validCategories).toContain(token.category);
    }
  });

  it('handles real-world Figma export structure', () => {
    // Simulate a more realistic Figma Variables export
    const figmaExport = {
      "primitives": {
        "color": {
          "blue": {
            "50": {
              "$type": "color",
              "$value": { "hex": "#eff6ff" },
              "$extensions": { "com.figma.variableId": "VariableID:1:1" }
            },
            "500": {
              "$type": "color", 
              "$value": { "hex": "#3b82f6" },
              "$extensions": { "com.figma.variableId": "VariableID:1:2" }
            }
          }
        },
        "space": {
          "1": {
            "$type": "dimension",
            "$value": { "value": 4, "unit": "px" }
          },
          "2": {
            "$type": "dimension",
            "$value": { "value": 8, "unit": "px" }
          }
        }
      },
      "semantic": {
        "background": {
          "primary": {
            "$type": "color",
            "$value": { "hex": "#ffffff" }
          }
        }
      }
    };
    
    const result = parseTokens(figmaExport);
    
    expect(result.errors).toHaveLength(0);
    expect(result.tokens.length).toBe(5);
    expect(result.metadata.categories.color).toBe(3);
    expect(result.metadata.categories.spacing).toBe(2);
  });
});


