/**
 * @chunk 5.06 - JSON Generator Tests
 */

import { describe, it, expect } from 'vitest';
import { generateJSON } from '../../src/services/generators/jsonGenerator.js';

describe('jsonGenerator', () => {
  const sampleTokens = [
    {
      name: 'Primary 500',
      path: 'Color/Primary/500',
      value: { hex: '#3b82f6' },
      category: 'color',
      type: 'color',
      css_variable: '--color-primary-500',
      description: 'Primary brand color',
    },
    {
      name: 'Spacing Medium',
      path: 'Spacing/Medium',
      value: { value: 16, unit: 'px' },
      category: 'spacing',
      type: 'dimension',
      css_variable: '--spacing-medium',
    },
    {
      name: 'Radius Small',
      path: 'Radius/Small',
      value: 4,
      category: 'radius',
      type: 'dimension',
      css_variable: '--radius-small',
    },
    {
      name: 'Shadow Card',
      path: 'Shadow/Card',
      value: {
        x: 0,
        y: 2,
        blur: 4,
        spread: 0,
        color: '#000000',
      },
      category: 'shadow',
      type: 'shadow',
      css_variable: '--shadow-card',
    },
  ];

  describe('generateJSON - flat format', () => {
    it('should generate valid JSON', () => {
      const output = generateJSON(sampleTokens, { format: 'flat' });
      
      expect(() => JSON.parse(output)).not.toThrow();
      const parsed = JSON.parse(output);
      expect(parsed).toBeTypeOf('object');
    });

    it('should use path as key with hyphens', () => {
      const output = generateJSON(sampleTokens, { format: 'flat' });
      const parsed = JSON.parse(output);
      
      expect(parsed).toHaveProperty('color-primary-500');
      expect(parsed).toHaveProperty('spacing-medium');
    });

    it('should format color values as hex strings', () => {
      const output = generateJSON(sampleTokens, { format: 'flat' });
      const parsed = JSON.parse(output);
      
      expect(parsed['color-primary-500']).toBe('#3b82f6');
    });

    it('should format dimension values with units', () => {
      const output = generateJSON(sampleTokens, { format: 'flat' });
      const parsed = JSON.parse(output);
      
      expect(parsed['spacing-medium']).toBe('16px');
      expect(parsed['radius-small']).toBe('4px');
    });

    it('should include metadata when includeMetadata is true', () => {
      const output = generateJSON(sampleTokens, { format: 'flat', includeMetadata: true });
      const parsed = JSON.parse(output);
      
      expect(parsed['color-primary-500']).toHaveProperty('value');
      expect(parsed['color-primary-500']).toHaveProperty('type');
      expect(parsed['color-primary-500']).toHaveProperty('category');
      expect(parsed['color-primary-500']).toHaveProperty('cssVariable');
    });

    it('should handle empty tokens array', () => {
      const output = generateJSON([], { format: 'flat' });
      const parsed = JSON.parse(output);
      
      expect(parsed).toEqual({});
    });
  });

  describe('generateJSON - nested format', () => {
    it('should generate valid JSON', () => {
      const output = generateJSON(sampleTokens, { format: 'nested' });
      
      expect(() => JSON.parse(output)).not.toThrow();
      const parsed = JSON.parse(output);
      expect(parsed).toBeTypeOf('object');
    });

    it('should create nested structure from path', () => {
      const output = generateJSON(sampleTokens, { format: 'nested' });
      const parsed = JSON.parse(output);
      
      expect(parsed).toHaveProperty('color');
      expect(parsed.color).toHaveProperty('primary');
      expect(parsed.color.primary).toHaveProperty('500');
    });

    it('should format values correctly', () => {
      const output = generateJSON(sampleTokens, { format: 'nested' });
      const parsed = JSON.parse(output);
      
      expect(parsed.color.primary['500']).toBe('#3b82f6');
      expect(parsed.spacing.medium).toBe('16px');
    });

    it('should include metadata when includeMetadata is true', () => {
      const output = generateJSON(sampleTokens, { format: 'nested', includeMetadata: true });
      const parsed = JSON.parse(output);
      
      expect(parsed.color.primary['500']).toHaveProperty('value');
      expect(parsed.color.primary['500']).toHaveProperty('type');
    });

    it('should handle paths with hyphens', () => {
      const tokens = [
        {
          name: 'Test',
          path: 'Color-Primary-500',
          value: '#3b82f6',
          category: 'color',
          type: 'color',
          css_variable: '--color-primary-500',
        },
      ];
      
      const output = generateJSON(tokens, { format: 'nested' });
      const parsed = JSON.parse(output);
      
      expect(parsed).toHaveProperty('color');
      expect(parsed.color).toHaveProperty('primary');
      expect(parsed.color.primary).toHaveProperty('500');
    });
  });

  describe('generateJSON - W3C format', () => {
    it('should generate valid JSON', () => {
      const output = generateJSON(sampleTokens, { format: 'w3c' });
      
      expect(() => JSON.parse(output)).not.toThrow();
      const parsed = JSON.parse(output);
      expect(parsed).toBeTypeOf('object');
    });

    it('should use PascalCase for keys', () => {
      const output = generateJSON(sampleTokens, { format: 'w3c' });
      const parsed = JSON.parse(output);
      
      expect(parsed).toHaveProperty('Color');
      expect(parsed).toHaveProperty('Spacing');
      expect(parsed.Color).toHaveProperty('Primary');
    });

    it('should include $type and $value properties', () => {
      const output = generateJSON(sampleTokens, { format: 'w3c' });
      const parsed = JSON.parse(output);
      
      expect(parsed.Color.Primary['500']).toHaveProperty('$type');
      expect(parsed.Color.Primary['500']).toHaveProperty('$value');
      expect(parsed.Color.Primary['500'].$type).toBe('color');
      expect(parsed.Color.Primary['500'].$value).toBe('#3b82f6');
    });

    it('should map types correctly to W3C format', () => {
      const output = generateJSON(sampleTokens, { format: 'w3c' });
      const parsed = JSON.parse(output);
      
      expect(parsed.Color.Primary['500'].$type).toBe('color');
      expect(parsed.Spacing.Medium.$type).toBe('dimension');
      expect(parsed.Shadow.Card.$type).toBe('shadow');
    });

    it('should include description if present', () => {
      const output = generateJSON(sampleTokens, { format: 'w3c' });
      const parsed = JSON.parse(output);
      
      expect(parsed.Color.Primary['500']).toHaveProperty('$description');
      expect(parsed.Color.Primary['500'].$description).toBe('Primary brand color');
    });

    it('should format dimension values correctly', () => {
      const output = generateJSON(sampleTokens, { format: 'w3c' });
      const parsed = JSON.parse(output);
      
      expect(parsed.Spacing.Medium.$value).toBe('16px');
      expect(parsed.Radius.Small.$value).toBe('4px');
    });
  });

  describe('generateJSON - default behavior', () => {
    it('should default to nested format', () => {
      const output = generateJSON(sampleTokens);
      const parsed = JSON.parse(output);
      
      // Nested format should have hierarchical structure
      expect(parsed).toHaveProperty('color');
      expect(parsed.color).toHaveProperty('primary');
    });

    it('should default includeMetadata to false', () => {
      const output = generateJSON(sampleTokens);
      const parsed = JSON.parse(output);
      
      // Values should be primitives, not objects with metadata
      expect(parsed.color.primary['500']).toBe('#3b82f6');
      expect(typeof parsed.color.primary['500']).toBe('string');
    });
  });

  describe('generateJSON - edge cases', () => {
    it('should handle tokens with null values', () => {
      const tokens = [
        {
          name: 'Null Token',
          path: 'Test/Null',
          value: null,
          category: 'other',
          type: 'string',
          css_variable: '--test-null',
        },
      ];
      
      const output = generateJSON(tokens, { format: 'nested' });
      const parsed = JSON.parse(output);
      
      expect(parsed.test.null).toBeNull();
    });

    it('should handle tokens with string values', () => {
      const tokens = [
        {
          name: 'String Token',
          path: 'Test/String',
          value: 'hello world',
          category: 'other',
          type: 'string',
          css_variable: '--test-string',
        },
      ];
      
      const output = generateJSON(tokens, { format: 'nested' });
      const parsed = JSON.parse(output);
      
      expect(parsed.test.string).toBe('hello world');
    });

    it('should handle tokens with number values', () => {
      const tokens = [
        {
          name: 'Number Token',
          path: 'Test/Number',
          value: 42,
          category: 'other',
          type: 'number',
          css_variable: '--test-number',
        },
      ];
      
      const output = generateJSON(tokens, { format: 'nested' });
      const parsed = JSON.parse(output);
      
      expect(parsed.test.number).toBe(42);
    });

    it('should handle RGB color objects', () => {
      const tokens = [
        {
          name: 'RGB Color',
          path: 'Color/RGB',
          value: { r: 59, g: 130, b: 246 },
          category: 'color',
          type: 'color',
          css_variable: '--color-rgb',
        },
      ];
      
      const output = generateJSON(tokens, { format: 'flat' });
      const parsed = JSON.parse(output);
      
      // Should convert RGB to hex
      expect(parsed['color-rgb']).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });
});




