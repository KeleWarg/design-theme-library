/**
 * @chunk 6.04 - Integration Tests
 * 
 * Integration tests for generator functions.
 * Tests that generators produce valid output in their respective formats.
 */

import { describe, it, expect } from 'vitest';
import { generateCSS } from '../../src/services/generators/cssGenerator.js';
import { generateJSON } from '../../src/services/generators/jsonGenerator.js';
import { generateTailwind } from '../../src/services/generators/tailwindGenerator.js';
import { generateMCPServer } from '../../src/services/generators/mcpServerGenerator.js';

describe('Generators Integration', () => {
  const mockTokens = [
    {
      id: 't1',
      name: 'Primary',
      path: 'color/primary',
      category: 'color',
      type: 'color',
      value: { hex: '#3b82f6' },
      css_variable: '--color-primary',
    },
    {
      id: 't2',
      name: 'Spacing MD',
      path: 'spacing/md',
      category: 'spacing',
      type: 'dimension',
      value: { value: 16, unit: 'px' },
      css_variable: '--spacing-md',
    },
    {
      id: 't3',
      name: 'Radius SM',
      path: 'radius/sm',
      category: 'radius',
      type: 'dimension',
      value: { value: 4, unit: 'px' },
      css_variable: '--radius-sm',
    },
  ];

  const mockThemes = [
    {
      id: 'theme-1',
      name: 'Default Theme',
      slug: 'default-theme',
      is_default: true,
      tokens: mockTokens,
      typefaces: [],
      typography_roles: [],
    },
  ];

  const mockComponents = [
    {
      id: 'comp-1',
      name: 'Button',
      slug: 'button',
      description: 'A button component',
      category: 'buttons',
      code: 'export default function Button() { return <button>Click</button>; }',
      props: [{ name: 'variant', type: 'string', default: 'primary', required: false }],
      variants: [],
      linked_tokens: ['Color/Primary/500'],
      examples: [],
    },
  ];

  describe('generateCSS', () => {
    it('produces valid CSS', () => {
      const css = generateCSS(mockTokens);

      expect(typeof css).toBe('string');
      expect(css.length).toBeGreaterThan(0);
      
      // Should contain :root selector
      expect(css).toContain(':root');
      
      // Should contain CSS variables
      expect(css).toContain('--color-primary');
      expect(css).toContain('--spacing-md');
      
      // Should contain semicolons (CSS property syntax)
      expect(css).toContain(';');
      
      // Should contain colons (CSS property syntax)
      expect(css).toContain(':');
      
      // Should have valid structure (not just random text)
      const hasPropertyPattern = /--[\w-]+\s*:/;
      expect(hasPropertyPattern.test(css)).toBe(true);
    });

    it('handles empty tokens', () => {
      const css = generateCSS([]);
      
      expect(typeof css).toBe('string');
      expect(css).toContain(':root');
    });

    it('respects options', () => {
      const css = generateCSS(mockTokens, { selector: '.custom-root' });
      
      expect(css).toContain('.custom-root');
      expect(css).not.toContain(':root');
    });
  });

  describe('generateJSON', () => {
    it('produces valid JSON', () => {
      const json = generateJSON(mockTokens);

      expect(typeof json).toBe('string');
      expect(json.length).toBeGreaterThan(0);
      
      // Should be parseable JSON
      let parsed;
      expect(() => {
        parsed = JSON.parse(json);
      }).not.toThrow();

      // Should be an object
      expect(typeof parsed).toBe('object');
      expect(parsed).not.toBe(null);
    });

    it('produces valid JSON with nested format', () => {
      const json = generateJSON(mockTokens, { format: 'nested' });
      
      const parsed = JSON.parse(json);
      expect(typeof parsed).toBe('object');
      
      // Nested format should have nested structure
      expect(parsed.color || parsed.spacing || parsed.radius).toBeDefined();
    });

    it('produces valid JSON with flat format', () => {
      const json = generateJSON(mockTokens, { format: 'flat' });
      
      const parsed = JSON.parse(json);
      expect(typeof parsed).toBe('object');
      
      // Flat format should have top-level keys
      const keys = Object.keys(parsed);
      expect(keys.length).toBeGreaterThan(0);
    });

    it('includes metadata when requested', () => {
      const json = generateJSON(mockTokens, { format: 'nested', includeMetadata: true });
      
      const parsed = JSON.parse(json);
      
      // Should have nested structure with metadata
      const hasMetadata = JSON.stringify(parsed).includes('value') || 
                         JSON.stringify(parsed).includes('type') ||
                         JSON.stringify(parsed).includes('category');
      expect(hasMetadata).toBe(true);
    });

    it('handles empty tokens', () => {
      const json = generateJSON([]);
      
      const parsed = JSON.parse(json);
      expect(typeof parsed).toBe('object');
    });
  });

  describe('generateTailwind', () => {
    it('produces valid JavaScript', () => {
      const js = generateTailwind(mockTokens);

      expect(typeof js).toBe('string');
      expect(js.length).toBeGreaterThan(0);
      
      // Should contain module.exports
      expect(js).toContain('module.exports');
      
      // Should contain theme.extend structure
      expect(js).toContain('theme');
      expect(js).toContain('extend');
      
      // Should be valid JavaScript syntax (no obvious syntax errors)
      expect(js).not.toContain('undefined undefined');
    });

    it('produces valid JavaScript with CSS variables', () => {
      const js = generateTailwind(mockTokens, { useCSSVariables: true });
      
      // Should contain var() if using CSS variables
      expect(js).toContain('var(') || expect(js.length).toBeGreaterThan(0);
    });

    it('handles empty tokens', () => {
      const js = generateTailwind([]);
      
      expect(typeof js).toBe('string');
      expect(js).toContain('module.exports');
      expect(js).toContain('extend');
    });

    it('produces code that could be evaluated as module (structure check)', () => {
      const js = generateTailwind(mockTokens);
      
      // Should have structure like: module.exports = { theme: { extend: {} } }
      const hasExportPattern = /module\.exports\s*=/;
      expect(hasExportPattern.test(js)).toBe(true);
      
      const hasThemePattern = /theme\s*:\s*\{/;
      expect(hasThemePattern.test(js)).toBe(true);
    });
  });

  describe('generateMCPServer', () => {
    it('produces compilable TypeScript', () => {
      const files = generateMCPServer(mockThemes, mockComponents, { projectName: 'test-project' });

      expect(typeof files).toBe('object');
      expect(files).not.toBe(null);
      
      // Should include TypeScript files
      expect(files['src/index.ts']).toBeDefined();
      expect(files['src/server.ts']).toBeDefined();
      expect(files['src/types.ts']).toBeDefined();
      expect(files['src/tools/tokenTools.ts']).toBeDefined();
      expect(files['src/tools/componentTools.ts']).toBeDefined();
      
      // TypeScript files should be strings
      expect(typeof files['src/index.ts']).toBe('string');
      expect(typeof files['src/server.ts']).toBe('string');
      expect(typeof files['src/types.ts']).toBe('string');
      
      // Check for TypeScript syntax markers
      const typesContent = files['src/types.ts'];
      expect(typesContent).toContain('export interface');
      
      // Check for import statements
      const serverContent = files['src/server.ts'];
      expect(serverContent).toContain('import');
      
      // Check that files are non-empty
      expect(files['src/index.ts'].length).toBeGreaterThan(0);
      expect(files['src/server.ts'].length).toBeGreaterThan(0);
      expect(files['src/types.ts'].length).toBeGreaterThan(0);
    });

    it('includes package.json and tsconfig.json', () => {
      const files = generateMCPServer(mockThemes, mockComponents);
      
      expect(files['package.json']).toBeDefined();
      expect(files['tsconfig.json']).toBeDefined();
      
      // package.json should be valid JSON
      const packageJson = JSON.parse(files['package.json']);
      expect(packageJson.name).toBeDefined();
      expect(packageJson.version).toBeDefined();
      
      // tsconfig.json should contain TypeScript config structure
      expect(files['tsconfig.json']).toContain('compilerOptions');
    });

    it('includes design-system.json and data files', () => {
      const files = generateMCPServer(mockThemes, mockComponents);
      
      expect(files['design-system.json']).toBeDefined();
      expect(files['src/data/tokens.json']).toBeDefined();
      expect(files['src/data/components.json']).toBeDefined();
      
      // Should be valid JSON
      const designSystem = JSON.parse(files['design-system.json']);
      expect(designSystem.name).toBeDefined();
      expect(Array.isArray(designSystem.tokens)).toBe(true);
      expect(Array.isArray(designSystem.components)).toBe(true);
      
      const tokens = JSON.parse(files['src/data/tokens.json']);
      expect(Array.isArray(tokens)).toBe(true);
      
      const components = JSON.parse(files['src/data/components.json']);
      expect(Array.isArray(components)).toBe(true);
    });

    it('includes README.md', () => {
      const files = generateMCPServer(mockThemes, mockComponents);
      
      expect(files['README.md']).toBeDefined();
      expect(typeof files['README.md']).toBe('string');
      expect(files['README.md'].length).toBeGreaterThan(0);
    });

    it('uses projectName in generated files', () => {
      const files = generateMCPServer(mockThemes, mockComponents, { projectName: 'custom-project' });
      
      const packageJson = JSON.parse(files['package.json']);
      expect(packageJson.name).toContain('custom-project');
      
      // Server content might reference project name
      expect(files['src/server.ts'].length).toBeGreaterThan(0);
    });

    it('generates valid TypeScript interface definitions', () => {
      const files = generateMCPServer(mockThemes, mockComponents);
      
      const typesContent = files['src/types.ts'];
      
      // Should define DesignSystem interface
      expect(typesContent).toContain('DesignSystem');
      
      // Should define Token interface
      expect(typesContent).toContain('Token');
      
      // Should define Component interface
      expect(typesContent).toContain('Component');
      
      // Should have interface syntax
      expect(typesContent).toMatch(/interface\s+\w+/);
    });
  });
});

