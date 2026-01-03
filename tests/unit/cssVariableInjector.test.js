/**
 * @chunk 2.06 - CSS Variable Injector Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  injectCssVariables,
  removeCssVariables,
  tokenToCssValue,
  getCssVariables,
  batchUpdateCssVariables,
  hasCssVariable,
} from '../../src/lib/cssVariableInjector';

describe('cssVariableInjector', () => {
  let testElement;

  beforeEach(() => {
    // Create a test element instead of using document.documentElement
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    // Clean up
    document.body.removeChild(testElement);
    // Also clean document.documentElement styles
    const root = document.documentElement;
    const props = [];
    for (let i = 0; i < root.style.length; i++) {
      if (root.style[i].startsWith('--')) {
        props.push(root.style[i]);
      }
    }
    props.forEach(p => root.style.removeProperty(p));
  });

  describe('injectCssVariables', () => {
    it('should set CSS variables on target element', () => {
      const tokens = [
        { css_variable: '--color-primary', value: '#3b82f6', category: 'color' },
        { css_variable: '--spacing-md', value: 16, category: 'spacing' },
      ];

      const result = injectCssVariables(tokens, { target: testElement });

      expect(testElement.style.getPropertyValue('--color-primary')).toBe('#3b82f6');
      expect(testElement.style.getPropertyValue('--spacing-md')).toBe('16px');
      expect(result['--color-primary']).toBe('#3b82f6');
      expect(result['--spacing-md']).toBe('16px');
    });

    it('should skip tokens without css_variable', () => {
      const tokens = [
        { css_variable: '--valid', value: 'test', category: 'other' },
        { value: 'no-var', category: 'other' },
      ];

      const result = injectCssVariables(tokens, { target: testElement });

      expect(Object.keys(result)).toHaveLength(1);
      expect(result['--valid']).toBe('test');
    });

    it('should use document.documentElement as default target', () => {
      const tokens = [
        { css_variable: '--test-var', value: 'test-value', category: 'other' },
      ];

      injectCssVariables(tokens);

      expect(document.documentElement.style.getPropertyValue('--test-var')).toBe('test-value');
      
      // Clean up
      document.documentElement.style.removeProperty('--test-var');
    });
  });

  describe('removeCssVariables', () => {
    it('should remove specified CSS variables', () => {
      testElement.style.setProperty('--var-a', 'value-a');
      testElement.style.setProperty('--var-b', 'value-b');

      removeCssVariables(['--var-a'], testElement);

      expect(testElement.style.getPropertyValue('--var-a')).toBe('');
      expect(testElement.style.getPropertyValue('--var-b')).toBe('value-b');
    });

    it('should handle non-existent variables gracefully', () => {
      expect(() => {
        removeCssVariables(['--non-existent'], testElement);
      }).not.toThrow();
    });
  });

  describe('tokenToCssValue', () => {
    describe('color tokens', () => {
      it('should handle hex string colors', () => {
        const token = { category: 'color', value: '#ff0000' };
        expect(tokenToCssValue(token)).toBe('#ff0000');
      });

      it('should handle hex object colors', () => {
        const token = { category: 'color', value: { hex: '#00ff00' } };
        expect(tokenToCssValue(token)).toBe('#00ff00');
      });

      it('should handle rgba with opacity', () => {
        const token = {
          category: 'color',
          value: { hex: '#0000ff', opacity: 0.5 },
        };
        expect(tokenToCssValue(token)).toBe('rgba(0, 0, 255, 0.5)');
      });

      it('should handle rgb object with opacity', () => {
        const token = {
          category: 'color',
          value: { rgb: { r: 255, g: 128, b: 64 }, opacity: 0.8 },
        };
        expect(tokenToCssValue(token)).toBe('rgba(255, 128, 64, 0.8)');
      });

      it('should return default for null color', () => {
        const token = { category: 'color', value: null };
        expect(tokenToCssValue(token)).toBe('initial');
      });
    });

    describe('spacing/dimension tokens', () => {
      it('should handle number values', () => {
        const token = { category: 'spacing', value: 24 };
        expect(tokenToCssValue(token)).toBe('24px');
      });

      it('should handle string values', () => {
        const token = { category: 'spacing', value: '2rem' };
        expect(tokenToCssValue(token)).toBe('2rem');
      });

      it('should handle object with value and unit', () => {
        const token = { category: 'radius', value: { value: 8, unit: 'px' } };
        expect(tokenToCssValue(token)).toBe('8px');
      });
    });

    describe('shadow tokens', () => {
      it('should handle single shadow object', () => {
        const token = {
          category: 'shadow',
          value: { x: 0, y: 4, blur: 8, spread: 0, color: 'rgba(0,0,0,0.1)' },
        };
        expect(tokenToCssValue(token)).toBe('0px 4px 8px 0px rgba(0,0,0,0.1)');
      });

      it('should handle multiple shadows', () => {
        const token = {
          category: 'shadow',
          value: {
            shadows: [
              { x: 0, y: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.1)' },
              { x: 0, y: 4, blur: 8, spread: 0, color: 'rgba(0,0,0,0.05)' },
            ],
          },
        };
        const result = tokenToCssValue(token);
        expect(result).toContain('0px 2px 4px 0px');
        expect(result).toContain('0px 4px 8px 0px');
        expect(result).toContain(', ');
      });

      it('should handle inset shadows', () => {
        const token = {
          category: 'shadow',
          value: { x: 0, y: 2, blur: 4, spread: 0, color: 'black', inset: true },
        };
        expect(tokenToCssValue(token)).toContain('inset');
      });

      it('should return none for empty shadows array', () => {
        const token = { category: 'shadow', value: { shadows: [] } };
        expect(tokenToCssValue(token)).toBe('none');
      });
    });

    describe('typography tokens', () => {
      it('should handle string values', () => {
        const token = { category: 'typography', value: '16px' };
        expect(tokenToCssValue(token)).toBe('16px');
      });

      it('should handle object with value', () => {
        const token = { category: 'typography', value: { value: 1.5, unit: 'em' } };
        expect(tokenToCssValue(token)).toBe('1.5em');
      });

      it('should handle font family arrays', () => {
        const token = { category: 'typography', value: ['Inter', 'sans-serif'] };
        expect(tokenToCssValue(token)).toBe('Inter, sans-serif');
      });

      it('should quote font names with spaces', () => {
        const token = { category: 'typography', value: ['Open Sans', 'Arial'] };
        expect(tokenToCssValue(token)).toBe('"Open Sans", Arial');
      });
    });

    describe('default handling', () => {
      it('should handle unknown category with string value', () => {
        const token = { category: 'unknown', value: 'test-value' };
        expect(tokenToCssValue(token)).toBe('test-value');
      });

      it('should handle object with value property', () => {
        const token = { category: 'other', value: { value: 42, unit: '%' } };
        expect(tokenToCssValue(token)).toBe('42%');
      });

      it('should JSON stringify complex objects', () => {
        const token = { category: 'other', value: { foo: 'bar' } };
        expect(tokenToCssValue(token)).toBe('{"foo":"bar"}');
      });
    });
  });

  describe('batchUpdateCssVariables', () => {
    it('should update multiple variables at once', () => {
      const updates = {
        '--var-1': 'value-1',
        '--var-2': 'value-2',
        '--var-3': 'value-3',
      };

      batchUpdateCssVariables(updates, testElement);

      expect(testElement.style.getPropertyValue('--var-1')).toBe('value-1');
      expect(testElement.style.getPropertyValue('--var-2')).toBe('value-2');
      expect(testElement.style.getPropertyValue('--var-3')).toBe('value-3');
    });
  });

  describe('hasCssVariable', () => {
    it('should return true for defined variable', () => {
      testElement.style.setProperty('--defined-var', 'some-value');
      expect(hasCssVariable('--defined-var', testElement)).toBe(true);
    });

    it('should return false for undefined variable', () => {
      expect(hasCssVariable('--undefined-var', testElement)).toBe(false);
    });
  });

  describe('getCssVariables', () => {
    it('should return all CSS variables set on element', () => {
      testElement.style.setProperty('--get-var-a', 'value-a');
      testElement.style.setProperty('--get-var-b', 'value-b');

      const vars = getCssVariables(testElement);

      expect(vars['--get-var-a']).toBe('value-a');
      expect(vars['--get-var-b']).toBe('value-b');
    });
  });
});

