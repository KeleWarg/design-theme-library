/**
 * @chunk 5.13 - Project Knowledge Generator Tests
 */

import { describe, it, expect } from 'vitest';
import { generateProjectKnowledge } from '../../src/services/generators/projectKnowledgeGenerator.js';

describe('projectKnowledgeGenerator', () => {
  const sampleTokens = [
    { css_variable: '--color-primary-500', value: '#3b82f6', category: 'color', name: 'color/primary/500' },
    { css_variable: '--color-secondary-500', value: '#64748b', category: 'color', name: 'color/secondary/500' },
    { css_variable: '--color-success-500', value: '#10b981', category: 'color', name: 'color/success/500' },
    { css_variable: '--spacing-xs', value: 4, category: 'spacing', name: 'spacing/xs' },
    { css_variable: '--spacing-sm', value: 8, category: 'spacing', name: 'spacing/sm' },
    { css_variable: '--spacing-md', value: 16, category: 'spacing', name: 'spacing/md' },
    { css_variable: '--spacing-lg', value: 24, category: 'spacing', name: 'spacing/lg' },
    { css_variable: '--font-size-body', value: { value: 16, unit: 'px' }, category: 'typography', name: 'font-size/body' },
    { css_variable: '--radius-sm', value: 4, category: 'radius', name: 'radius/sm' },
    { css_variable: '--radius-md', value: 8, category: 'radius', name: 'radius/md' },
    { css_variable: '--shadow-sm', value: { shadows: [{ x: 0, y: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.1)' }] }, category: 'shadow', name: 'shadow/sm' },
    { css_variable: '--shadow-md', value: { shadows: [{ x: 0, y: 4, blur: 8, spread: 0, color: 'rgba(0,0,0,0.15)' }] }, category: 'shadow', name: 'shadow/md' },
  ];

  const sampleThemes = [
    {
      id: 1,
      name: 'Default Theme',
      is_default: true,
      tokens: sampleTokens,
    },
  ];

  const sampleComponents = [
    {
      id: 1,
      name: 'Button',
      category: 'buttons',
      status: 'published',
      description: 'A primary button component',
      props: [
        { name: 'variant', type: 'string', default: 'primary' },
        { name: 'size', type: 'string', default: 'md' },
        { name: 'children', type: 'ReactNode' },
      ],
      variants: [
        { name: 'primary', description: 'Primary button style' },
        { name: 'secondary', description: 'Secondary button style' },
        { name: 'ghost', description: 'Ghost button style' },
      ],
    },
    {
      id: 2,
      name: 'Input',
      category: 'forms',
      status: 'published',
      description: 'Text input component',
      props: [
        { name: 'type', type: 'string', default: 'text' },
        { name: 'placeholder', type: 'string' },
      ],
    },
    {
      id: 3,
      name: 'Draft Component',
      category: 'other',
      status: 'draft',
      description: 'This should not appear',
    },
  ];

  describe('generateProjectKnowledge', () => {
    it('should generate project knowledge text', () => {
      const result = generateProjectKnowledge(sampleThemes, sampleComponents);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should include header with project info', () => {
      const result = generateProjectKnowledge(sampleThemes, sampleComponents, {
        projectName: 'My Design System',
        version: '2.0.0',
      });

      expect(result).toContain('DESIGN SYSTEM KNOWLEDGE');
      expect(result).toContain('PROJECT: My Design System');
      expect(result).toContain('VERSION: 2.0.0');
      expect(result).toContain('GENERATED:');
    });

    it('should include design tokens section', () => {
      const result = generateProjectKnowledge(sampleThemes, sampleComponents);

      expect(result).toContain('=== DESIGN TOKENS ===');
      expect(result).toContain('COLORS:');
      expect(result).toContain('SPACING:');
      expect(result).toContain('RADIUS:');
      expect(result).toContain('SHADOWS:');
    });

    it('should include color tokens', () => {
      const result = generateProjectKnowledge(sampleThemes, sampleComponents);

      expect(result).toContain('--color-primary-500');
      expect(result).toContain('#3b82f6');
    });

    it('should include spacing tokens with values', () => {
      const result = generateProjectKnowledge(sampleThemes, sampleComponents);

      expect(result).toContain('--spacing-md');
      expect(result).toContain('16px');
    });

    it('should include components section', () => {
      const result = generateProjectKnowledge(sampleThemes, sampleComponents);

      expect(result).toContain('=== COMPONENTS ===');
      expect(result).toContain('BUTTON');
      expect(result).toContain('INPUT');
    });

    it('should only include published components', () => {
      const result = generateProjectKnowledge(sampleThemes, sampleComponents);

      expect(result).toContain('Button');
      expect(result).toContain('Input');
      expect(result).not.toContain('Draft Component');
    });

    it('should include component details', () => {
      const result = generateProjectKnowledge(sampleThemes, sampleComponents);

      expect(result).toContain('Category: buttons');
      expect(result).toContain('Variants:');
      expect(result).toContain('Props:');
    });

    it('should include usage rules section', () => {
      const result = generateProjectKnowledge(sampleThemes, sampleComponents);

      expect(result).toContain('=== USAGE RULES ===');
      expect(result).toContain('Always use CSS variables');
      expect(result).toContain('Use existing components');
    });

    it('should keep content under 2.5KB', () => {
      const result = generateProjectKnowledge(sampleThemes, sampleComponents);

      expect(result.length).toBeLessThanOrEqual(2.5 * 1024);
    });

    it('should handle empty themes array', () => {
      const result = generateProjectKnowledge([], sampleComponents);

      expect(result).toBeTruthy();
      expect(result).toContain('No color tokens defined');
    });

    it('should handle empty components array', () => {
      const result = generateProjectKnowledge(sampleThemes, []);

      expect(result).toContain('No published components available');
    });

    it('should handle theme without tokens', () => {
      const themesWithoutTokens = [
        { id: 1, name: 'Empty Theme', is_default: true, tokens: [] },
      ];

      const result = generateProjectKnowledge(themesWithoutTokens, sampleComponents);

      expect(result).toBeTruthy();
      expect(result).toContain('No color tokens defined');
    });

    it('should use default theme if available', () => {
      const themes = [
        { id: 1, name: 'Default', is_default: true, tokens: sampleTokens },
        { id: 2, name: 'Other', is_default: false, tokens: [] },
      ];

      const result = generateProjectKnowledge(themes, sampleComponents);

      expect(result).toContain('--color-primary-500');
    });

    it('should use first theme if no default theme', () => {
      const themes = [
        { id: 1, name: 'First', is_default: false, tokens: sampleTokens },
        { id: 2, name: 'Second', is_default: false, tokens: [] },
      ];

      const result = generateProjectKnowledge(themes, sampleComponents);

      expect(result).toContain('--color-primary-500');
    });

    it('should limit colors to top 12', () => {
      const manyColorTokens = Array.from({ length: 20 }, (_, i) => ({
        css_variable: `--color-token-${i}`,
        value: '#000000',
        category: 'color',
        name: `color/token/${i}`,
      }));

      const themes = [
        { id: 1, name: 'Large Theme', is_default: true, tokens: manyColorTokens },
      ];

      const result = generateProjectKnowledge(themes, sampleComponents);

      // Should contain first 12
      expect(result).toContain('--color-token-0');
      expect(result).toContain('--color-token-11');
      // Should mention remaining
      expect(result).toContain('...and 8 more color tokens');
    });

    it('should limit components to top 10', () => {
      const manyComponents = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        name: `Component ${i}`,
        category: 'other',
        status: 'published',
      }));

      const result = generateProjectKnowledge(sampleThemes, manyComponents);

      expect(result).toContain('Component 0');
      expect(result).toContain('Component 9');
      expect(result).toContain('...and 5 more components');
    });

    it('should keep output under 2.5KB even with large datasets', () => {
      // Create a large dataset - the generator should summarize to stay under limit
      const manyTokens = Array.from({ length: 100 }, (_, i) => ({
        css_variable: `--color-token-${i}`,
        value: '#000000',
        category: 'color',
        name: `color/token/${i}`,
      }));

      const manyComponents = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        name: `Component ${i}`,
        category: 'other',
        status: 'published',
        description: 'A component with a long description that takes up space',
        props: Array.from({ length: 10 }, (_, j) => ({
          name: `prop${j}`,
          type: 'string',
        })),
      }));

      const themes = [
        { id: 1, name: 'Large Theme', is_default: true, tokens: manyTokens },
      ];

      const result = generateProjectKnowledge(themes, manyComponents);

      // Generator summarizes content (12 colors, 10 components max) to stay compact
      expect(result.length).toBeLessThanOrEqual(2.5 * 1024);
      // Should contain summary indicators showing data was condensed
      expect(result).toContain('...and 88 more color tokens');
      expect(result).toContain('...and 40 more components');
    });

    it('should include typography section if tokens exist', () => {
      const result = generateProjectKnowledge(sampleThemes, sampleComponents);

      expect(result).toContain('TYPOGRAPHY:');
      expect(result).toContain('--font-size-body');
    });

    it('should generate component examples', () => {
      const result = generateProjectKnowledge(sampleThemes, sampleComponents);

      expect(result).toContain('Example:');
      expect(result).toContain('<Button');
    });
  });
});

