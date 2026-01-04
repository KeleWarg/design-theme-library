/**
 * Gate 12: Token Generators Verification
 * 
 * Prerequisites:
 * - 5.05 CSS Generator ✅
 * - 5.06 JSON Generator ✅
 * - 5.07 Tailwind Generator ✅
 * - 5.08 SCSS Generator ✅
 * - 5.09 FontFace Generator ✅
 * 
 * Tests each generator with sample tokens to verify they produce valid output.
 */

import { describe, it, expect } from 'vitest';
import { generateCSS } from '../../src/services/generators/cssGenerator.js';
import { generateJSON } from '../../src/services/generators/jsonGenerator.js';
import { generateTailwind } from '../../src/services/generators/tailwindGenerator.js';
import { generateSCSS } from '../../src/services/generators/scssGenerator.js';
import { generateFontFaceCss } from '../../src/services/generators/fontFaceGenerator.js';

describe('Gate 12: Token Generators Verification', () => {
  // Test tokens as specified in gate requirements
  const testTokens = [
    { 
      name: 'color-primary', 
      path: 'color/primary',
      value: '#3b82f6', 
      category: 'color', 
      css_variable: '--color-primary',
      type: 'color'
    },
    { 
      name: 'space-md', 
      path: 'spacing/md',
      value: '16px', 
      category: 'spacing', 
      css_variable: '--space-md',
      type: 'dimension'
    },
  ];

  const testTypefaces = [
    { 
      family: 'Inter', 
      source_type: 'custom', 
      font_files: [{ 
        storage_path: 'inter.woff2', 
        weight: 400,
        style: 'normal',
        format: 'woff2'
      }] 
    }
  ];

  describe('5.05 CSS Generator', () => {
    it('generateCSS(testTokens) → Valid CSS with :root', () => {
      const css = generateCSS(testTokens);
      
      // Should contain :root selector
      expect(css).toContain(':root');
      expect(css).toContain('{');
      expect(css).toContain('}');
      
      // Should contain CSS variables
      expect(css).toContain('--color-primary');
      expect(css).toContain('--space-md');
      
      // Should be valid CSS syntax (no obvious errors)
      expect(css).toMatch(/:\s*[^;]+;/); // Has at least one property: value;
      
      // Can be parsed as CSS (basic structure check)
      expect(css.match(/{/g)?.length).toBeGreaterThan(0);
      expect(css.match(/}/g)?.length).toBeGreaterThan(0);
    });
  });

  describe('5.06 JSON Generator', () => {
    it('generateJSON(testTokens, { format: "nested" }) → Valid JSON', () => {
      const json = generateJSON(testTokens, { format: 'nested' });
      
      // Should be valid JSON (parseable)
      let parsed;
      expect(() => {
        parsed = JSON.parse(json);
      }).not.toThrow();
      
      // Should be an object
      expect(typeof parsed).toBe('object');
      expect(parsed).not.toBe(null);
      
      // Should contain token data
      expect(Object.keys(parsed).length).toBeGreaterThan(0);
    });
  });

  describe('5.07 Tailwind Generator', () => {
    it('generateTailwind(testTokens) → Valid JS config', () => {
      const config = generateTailwind(testTokens);
      
      // Should contain module.exports
      expect(config).toContain('module.exports');
      
      // Should contain theme structure
      expect(config).toContain('theme');
      
      // Should be valid JavaScript syntax (no obvious syntax errors)
      // Try to evaluate it (safe since we control the input)
      expect(() => {
        // Create a safe evaluation context
        const fn = new Function('module', 'exports', `
          ${config}
          return module.exports;
        `);
        const mockModule = { exports: {} };
        fn(mockModule, mockModule.exports);
      }).not.toThrow();
    });
  });

  describe('5.08 SCSS Generator', () => {
    it('generateSCSS(testTokens) → Valid SCSS with $ variables', () => {
      const scss = generateSCSS(testTokens);
      
      // Should contain SCSS variables (starting with $)
      expect(scss).toMatch(/\$[a-zA-Z-]+:/);
      
      // Should have valid SCSS syntax structure
      expect(scss).toContain('$');
      
      // Basic syntax check: variables should end with semicolon
      const variableLines = scss.split('\n').filter(line => line.trim().startsWith('$'));
      if (variableLines.length > 0) {
        expect(variableLines[0]).toMatch(/;\s*$/);
      }
    });
  });

  describe('5.09 FontFace Generator', () => {
    it('generateFontFaceCss(testTypefaces) → Valid @font-face rules', () => {
      const css = generateFontFaceCss(testTypefaces);
      
      // Should contain @font-face
      expect(css).toContain('@font-face');
      
      // Should contain font-family
      expect(css).toContain('font-family');
      
      // Should contain src (font source)
      expect(css).toContain('src');
      
      // Should contain the font name
      expect(css).toContain('Inter');
      
      // Should have valid CSS structure
      expect(css).toMatch(/@font-face\s*{/);
    });
  });
});

