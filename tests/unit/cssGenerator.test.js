/**
 * @chunk 2.06 - CSS Generator Tests
 */

import { describe, it, expect } from 'vitest';
import {
  generateCssString,
  generateScopedCss,
  generateMultiThemeCss,
  generateStyleObject,
  generateCssVarReferences,
  parseCssVariables,
} from '../../src/lib/cssGenerator';

describe('cssGenerator', () => {
  const sampleTokens = [
    { css_variable: '--color-primary', value: '#3b82f6', category: 'color', name: 'color/primary' },
    { css_variable: '--color-secondary', value: '#64748b', category: 'color', name: 'color/secondary' },
    { css_variable: '--font-size-base', value: { value: 16, unit: 'px' }, category: 'typography', name: 'font-size/base' },
    { css_variable: '--spacing-md', value: 16, category: 'spacing', name: 'spacing/md' },
    { css_variable: '--radius-sm', value: 4, category: 'radius', name: 'radius/sm' },
    { css_variable: '--shadow-sm', value: { shadows: [{ x: 0, y: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.1)' }] }, category: 'shadow', name: 'shadow/sm' },
  ];

  describe('generateCssString', () => {
    it('should generate valid CSS with :root selector by default', () => {
      const css = generateCssString(sampleTokens);

      expect(css).toContain(':root {');
      expect(css).toContain('--color-primary: #3b82f6;');
      expect(css).toContain('--spacing-md: 16px;');
      expect(css).toContain('}');
    });

    it('should include category comments by default', () => {
      const css = generateCssString(sampleTokens, { includeComments: true });

      expect(css).toContain('/* Color Tokens */');
      expect(css).toContain('/* Typography Tokens */');
      expect(css).toContain('/* Spacing Tokens */');
    });

    it('should exclude comments when includeComments is false', () => {
      const css = generateCssString(sampleTokens, { includeComments: false });

      expect(css).not.toContain('/* Color');
    });

    it('should use custom selector', () => {
      const css = generateCssString(sampleTokens, { selector: '.theme-dark' });

      expect(css).toContain('.theme-dark {');
      expect(css).not.toContain(':root');
    });

    it('should minify output when minify is true', () => {
      const css = generateCssString(sampleTokens, { minify: true });

      // Minified CSS should not have newlines or extra spaces
      expect(css).not.toContain('\n');
      expect(css).not.toContain('  ');
      expect(css).not.toContain('/* ');
    });

    it('should include header comment by default', () => {
      const css = generateCssString(sampleTokens, { includeHeader: true });

      expect(css).toContain('Design System CSS Variables');
      expect(css).toContain('Generated:');
    });

    it('should exclude header when includeHeader is false', () => {
      const css = generateCssString(sampleTokens, { includeHeader: false });

      expect(css).not.toContain('Design System CSS Variables');
    });

    it('should handle empty tokens array', () => {
      const css = generateCssString([]);

      expect(css).toContain(':root {');
      expect(css).toContain('No tokens defined');
    });

    it('should group tokens by category', () => {
      const css = generateCssString(sampleTokens);

      // Color tokens should appear before typography tokens
      const colorIndex = css.indexOf('--color-primary');
      const typographyIndex = css.indexOf('--font-size-base');
      const spacingIndex = css.indexOf('--spacing-md');

      expect(colorIndex).toBeLessThan(typographyIndex);
      expect(typographyIndex).toBeLessThan(spacingIndex);
    });
  });

  describe('generateScopedCss', () => {
    it('should generate CSS with theme class selector', () => {
      const css = generateScopedCss(sampleTokens, 'Dark Theme');

      expect(css).toContain('.theme-dark-theme {');
    });

    it('should slugify theme name correctly', () => {
      const css = generateScopedCss(sampleTokens, 'My Custom Theme 123');

      expect(css).toContain('.theme-my-custom-theme-123');
    });
  });

  describe('generateMultiThemeCss', () => {
    const themes = [
      { name: 'Light', tokens: sampleTokens.slice(0, 2), is_default: true },
      { name: 'Dark', tokens: sampleTokens.slice(2, 4) },
    ];

    it('should generate CSS for multiple themes', () => {
      const css = generateMultiThemeCss(themes);

      expect(css).toContain(':root');
      expect(css).toContain('.theme-light');
      expect(css).toContain('.theme-dark');
    });

    it('should put default theme in :root', () => {
      const css = generateMultiThemeCss(themes, { includeDefault: true });

      // :root should contain the default theme tokens
      const rootSection = css.split('.theme-light')[0];
      expect(rootSection).toContain(':root');
      expect(rootSection).toContain('--color-primary');
    });
  });

  describe('generateStyleObject', () => {
    it('should generate object suitable for React style prop', () => {
      const style = generateStyleObject(sampleTokens);

      expect(style['--color-primary']).toBe('#3b82f6');
      expect(style['--spacing-md']).toBe('16px');
    });

    it('should skip tokens without css_variable', () => {
      const tokens = [
        { css_variable: '--valid', value: 'test', category: 'other' },
        { value: 'no-var', category: 'other' },
      ];

      const style = generateStyleObject(tokens);

      expect(Object.keys(style)).toHaveLength(1);
    });
  });

  describe('generateCssVarReferences', () => {
    it('should generate var() references', () => {
      const refs = generateCssVarReferences(sampleTokens);

      expect(refs['color/primary']).toBe('var(--color-primary)');
      expect(refs['spacing/md']).toBe('var(--spacing-md)');
    });

    it('should skip tokens without name or css_variable', () => {
      const tokens = [
        { css_variable: '--var-a', name: 'var-a', value: 'a', category: 'other' },
        { css_variable: '--var-b', value: 'b', category: 'other' }, // no name
        { name: 'var-c', value: 'c', category: 'other' }, // no css_variable
      ];

      const refs = generateCssVarReferences(tokens);

      expect(Object.keys(refs)).toHaveLength(1);
      expect(refs['var-a']).toBe('var(--var-a)');
    });
  });

  describe('parseCssVariables', () => {
    it('should parse CSS custom properties back to tokens', () => {
      const css = `
        :root {
          --color-primary: #3b82f6;
          --spacing-md: 16px;
          --font-size-base: 1rem;
        }
      `;

      const tokens = parseCssVariables(css);

      expect(tokens).toHaveLength(3);
      expect(tokens[0].css_variable).toBe('--color-primary');
      expect(tokens[0].value).toBe('#3b82f6');
      expect(tokens[0].category).toBe('color');
    });

    it('should infer categories from variable names', () => {
      const css = `
        :root {
          --color-text: #000;
          --font-family: Inter;
          --spacing-lg: 32px;
          --shadow-md: 0 4px 8px black;
          --radius-lg: 12px;
          --grid-columns: 12;
        }
      `;

      const tokens = parseCssVariables(css);

      const findToken = (name) => tokens.find(t => t.css_variable === name);

      expect(findToken('--color-text').category).toBe('color');
      expect(findToken('--font-family').category).toBe('typography');
      expect(findToken('--spacing-lg').category).toBe('spacing');
      expect(findToken('--shadow-md').category).toBe('shadow');
      expect(findToken('--radius-lg').category).toBe('radius');
      expect(findToken('--grid-columns').category).toBe('grid');
    });

    it('should handle minified CSS', () => {
      const css = ':root{--color-a:#fff;--color-b:#000;}';

      const tokens = parseCssVariables(css);

      expect(tokens).toHaveLength(2);
    });
  });
});

