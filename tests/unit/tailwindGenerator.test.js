/**
 * @chunk 5.07 - Tailwind Generator Tests
 */

import { describe, it, expect } from 'vitest';
import { generateTailwind } from '../../src/services/generators/tailwindGenerator.js';

describe('tailwindGenerator', () => {
  const sampleTokens = [
    {
      id: '1',
      name: 'Primary 500',
      path: 'Color/Primary/500',
      category: 'color',
      type: 'color',
      value: { hex: '#3b82f6' },
      css_variable: '--color-primary-500',
    },
    {
      id: '2',
      name: 'Primary 600',
      path: 'Color/Primary/600',
      category: 'color',
      type: 'color',
      value: { hex: '#2563eb' },
      css_variable: '--color-primary-600',
    },
    {
      id: '3',
      name: 'Spacing Small',
      path: 'Spacing/sm',
      category: 'spacing',
      type: 'dimension',
      value: { value: 8, unit: 'px' },
      css_variable: '--spacing-sm',
    },
    {
      id: '4',
      name: 'Spacing Medium',
      path: 'Spacing/md',
      category: 'spacing',
      type: 'dimension',
      value: { value: 16, unit: 'px' },
      css_variable: '--spacing-md',
    },
    {
      id: '5',
      name: 'Font Size Base',
      path: 'Typography/FontSize/base',
      category: 'typography',
      type: 'dimension',
      value: { value: 16, unit: 'px' },
      css_variable: '--font-size-base',
    },
    {
      id: '6',
      name: 'Font Weight Bold',
      path: 'Typography/FontWeight/bold',
      category: 'typography',
      type: 'fontWeight',
      value: 700,
      css_variable: '--font-weight-bold',
    },
    {
      id: '7',
      name: 'Font Family Primary',
      path: 'Typography/FontFamily/primary',
      category: 'typography',
      type: 'fontFamily',
      value: ['Inter', 'sans-serif'],
      css_variable: '--font-family-primary',
    },
    {
      id: '8',
      name: 'Border Radius Medium',
      path: 'Radius/md',
      category: 'radius',
      type: 'dimension',
      value: { value: 8, unit: 'px' },
      css_variable: '--radius-md',
    },
    {
      id: '9',
      name: 'Shadow Small',
      path: 'Shadow/sm',
      category: 'shadow',
      type: 'shadow',
      value: {
        shadows: [{
          x: 0,
          y: 2,
          blur: 4,
          spread: 0,
          color: 'rgba(0, 0, 0, 0.1)',
        }],
      },
      css_variable: '--shadow-sm',
    },
  ];

  describe('generateTailwind', () => {
    it('should generate valid Tailwind config structure', () => {
      const config = generateTailwind(sampleTokens);

      expect(config).toContain("/** @type {import('tailwindcss').Config} */");
      expect(config).toContain('module.exports = {');
      expect(config).toContain('theme: {');
      expect(config).toContain('extend:');
    });

    it('should map colors correctly with nested shades', () => {
      const config = generateTailwind(sampleTokens);

      expect(config).toContain("colors:");
      expect(config).toContain("primary:");
      expect(config).toContain("'500':");
      expect(config).toContain("'600':");
    });

    it('should use CSS variables by default', () => {
      const config = generateTailwind(sampleTokens);

      expect(config).toContain("var(--color-primary-500)");
      expect(config).toContain("var(--spacing-sm)");
    });

    it('should use direct values when useCSSVariables is false', () => {
      const config = generateTailwind(sampleTokens, { useCSSVariables: false });

      expect(config).toContain("'#3b82f6'");
      expect(config).toContain("'8px'");
      expect(config).not.toContain("var(--color-primary-500)");
    });

    it('should map spacing tokens correctly', () => {
      const config = generateTailwind(sampleTokens);

      expect(config).toContain("spacing:");
      expect(config).toContain("sm:");
      expect(config).toContain("md:");
    });

    it('should map typography tokens correctly', () => {
      const config = generateTailwind(sampleTokens);

      expect(config).toContain("fontSize:");
      expect(config).toContain("fontWeight:");
      expect(config).toContain("fontFamily:");
    });

    it('should map fontFamily as array', () => {
      const config = generateTailwind(sampleTokens);

      expect(config).toContain("fontFamily:");
      // Font family should be an array
      expect(config).toMatch(/fontFamily:\s*\{[^}]*primary:\s*\[/);
    });

    it('should map borderRadius correctly', () => {
      const config = generateTailwind(sampleTokens);

      expect(config).toContain("borderRadius:");
      expect(config).toContain("md:");
    });

    it('should map boxShadow correctly', () => {
      const config = generateTailwind(sampleTokens);

      expect(config).toContain("boxShadow:");
      expect(config).toContain("sm:");
    });

    it('should handle prefix option', () => {
      const config = generateTailwind(sampleTokens, { prefix: 'ds' });

      expect(config).toContain("ds-primary");
      expect(config).toContain("ds-sm");
    });

    it('should handle empty tokens array', () => {
      const config = generateTailwind([]);

      expect(config).toContain("extend: {}");
    });

    it('should handle null/undefined tokens', () => {
      const config = generateTailwind(null);

      expect(config).toContain("extend: {}");
    });

    it('should remove empty theme sections', () => {
      const tokens = sampleTokens.filter(t => t.category === 'color');
      const config = generateTailwind(tokens);

      // Should not include empty sections like screens, boxShadow, etc.
      expect(config).not.toContain("screens:");
      expect(config).not.toContain("boxShadow:");
    });

    it('should generate valid JavaScript syntax', () => {
      const config = generateTailwind(sampleTokens);

      // Should not throw when evaluated
      expect(() => {
        // Replace module.exports with a return statement for testing
        const testCode = config.replace('module.exports =', 'return');
        new Function(testCode)();
      }).not.toThrow();
    });

    it('should handle flat color names (no shades)', () => {
      const tokens = [
        {
          name: 'Background',
          path: 'Color/Background',
          category: 'color',
          type: 'color',
          value: { hex: '#ffffff' },
          css_variable: '--color-background',
        },
      ];

      const config = generateTailwind(tokens);

      expect(config).toContain("background:");
      expect(config).not.toMatch(/background:\s*\{/); // Should be flat, not nested
    });

    it('should handle typography tokens with different path patterns', () => {
      const tokens = [
        {
          name: 'Font Size',
          path: 'Typography/size/base',
          category: 'typography',
          type: 'dimension',
          value: { value: 16, unit: 'px' },
          css_variable: '--font-size-base',
        },
        {
          name: 'Font Weight',
          path: 'Typography/weight/bold',
          category: 'typography',
          type: 'fontWeight',
          value: 700,
          css_variable: '--font-weight-bold',
        },
      ];

      const config = generateTailwind(tokens);

      expect(config).toContain("fontSize:");
      expect(config).toContain("fontWeight:");
    });
  });
});



