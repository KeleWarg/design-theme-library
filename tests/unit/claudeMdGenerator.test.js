/**
 * @chunk 5.12 - Claude MD Generator Tests
 */

import { describe, it, expect } from 'vitest';
import { generateClaudeMd } from '../../src/services/generators/claudeMdGenerator.js';

describe('claudeMdGenerator', () => {
  const sampleTokens = [
    { css_variable: '--color-primary-500', value: '#3b82f6', category: 'color', name: 'color/primary/500' },
    { css_variable: '--color-secondary-500', value: '#64748b', category: 'color', name: 'color/secondary/500' },
    { css_variable: '--spacing-xs', value: 4, category: 'spacing', name: 'spacing/xs' },
    { css_variable: '--spacing-md', value: 16, category: 'spacing', name: 'spacing/md' },
    { css_variable: '--spacing-lg', value: 24, category: 'spacing', name: 'spacing/lg' },
    { css_variable: '--font-size-body', value: { value: 16, unit: 'px' }, category: 'typography', name: 'font-size/body' },
    { css_variable: '--radius-sm', value: 4, category: 'radius', name: 'radius/sm' },
    { css_variable: '--shadow-sm', value: { shadows: [{ x: 0, y: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.1)' }] }, category: 'shadow', name: 'shadow/sm' },
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
      ],
      variants: [
        { name: 'primary', description: 'Primary button style' },
        { name: 'secondary', description: 'Secondary button style' },
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

  describe('generateClaudeMd', () => {
    it('should return object with CLAUDE.md and tokens.md keys', () => {
      const result = generateClaudeMd(sampleThemes, sampleComponents);

      expect(result).toHaveProperty('CLAUDE.md');
      expect(result).toHaveProperty('.claude/rules/tokens.md');
    });

    it('should generate CLAUDE.md with project context', () => {
      const result = generateClaudeMd(sampleThemes, sampleComponents, { projectName: 'My Design System' });

      expect(result['CLAUDE.md']).toContain('# My Design System Design System Reference');
    });

    it('should include quick reference section with token tables', () => {
      const result = generateClaudeMd(sampleThemes, sampleComponents);

      const content = result['CLAUDE.md'];
      expect(content).toContain('## Quick Reference');
      expect(content).toContain('### Tokens');
      expect(content).toContain('| Token | Value |');
    });

    it('should include color tokens in quick reference', () => {
      const result = generateClaudeMd(sampleThemes, sampleComponents);

      const content = result['CLAUDE.md'];
      expect(content).toContain('--color-primary-500');
      expect(content).toContain('#3b82f6');
    });

    it('should include spacing tokens in quick reference', () => {
      const result = generateClaudeMd(sampleThemes, sampleComponents);

      const content = result['CLAUDE.md'];
      expect(content).toContain('--spacing-md');
      expect(content).toContain('16px');
    });

    it('should include components table in quick reference', () => {
      const result = generateClaudeMd(sampleThemes, sampleComponents);

      const content = result['CLAUDE.md'];
      expect(content).toContain('### Components');
      expect(content).toContain('| Name | Category | Props |');
      expect(content).toContain('**Button**');
      expect(content).toContain('**Input**');
    });

    it('should only include published components', () => {
      const result = generateClaudeMd(sampleThemes, sampleComponents);

      const content = result['CLAUDE.md'];
      expect(content).toContain('Button');
      expect(content).toContain('Input');
      expect(content).not.toContain('Draft Component');
    });

    it('should include detailed reference section', () => {
      const result = generateClaudeMd(sampleThemes, sampleComponents);

      const content = result['CLAUDE.md'];
      expect(content).toContain('## Detailed Reference');
      expect(content).toContain('### Color Tokens');
      expect(content).toContain('### Components');
    });

    it('should include usage guidelines', () => {
      const result = generateClaudeMd(sampleThemes, sampleComponents);

      const content = result['CLAUDE.md'];
      expect(content).toContain('## Usage Guidelines');
      expect(content).toContain('CSS variables');
    });

    it('should keep content under 3KB', () => {
      const result = generateClaudeMd(sampleThemes, sampleComponents);

      expect(result['CLAUDE.md'].length).toBeLessThanOrEqual(3 * 1024);
    });

    it('should generate tokens.md with all categories', () => {
      const result = generateClaudeMd(sampleThemes, sampleComponents);

      const tokensContent = result['.claude/rules/tokens.md'];
      expect(tokensContent).toContain('# Design Tokens Reference');
      expect(tokensContent).toContain('## Colors');
      expect(tokensContent).toContain('## Spacing');
      expect(tokensContent).toContain('## Typography');
      expect(tokensContent).toContain('## Radius');
      expect(tokensContent).toContain('## Shadows');
    });

    it('should include color tokens in tokens.md', () => {
      const result = generateClaudeMd(sampleThemes, sampleComponents);

      const tokensContent = result['.claude/rules/tokens.md'];
      expect(tokensContent).toContain('--color-primary-500');
    });

    it('should include spacing tokens with values in tokens.md', () => {
      const result = generateClaudeMd(sampleThemes, sampleComponents);

      const tokensContent = result['.claude/rules/tokens.md'];
      expect(tokensContent).toContain('--spacing-md');
      expect(tokensContent).toContain('16px');
    });

    it('should handle empty themes array', () => {
      const result = generateClaudeMd([], sampleComponents);

      expect(result['CLAUDE.md']).toBeTruthy();
      expect(result['.claude/rules/tokens.md']).toBeTruthy();
    });

    it('should handle empty components array', () => {
      const result = generateClaudeMd(sampleThemes, []);

      const content = result['CLAUDE.md'];
      expect(content).toContain('No published components available');
    });

    it('should handle theme without tokens', () => {
      const themesWithoutTokens = [
        { id: 1, name: 'Empty Theme', is_default: true, tokens: [] },
      ];

      const result = generateClaudeMd(themesWithoutTokens, sampleComponents);

      expect(result['CLAUDE.md']).toBeTruthy();
      expect(result['.claude/rules/tokens.md']).toBeTruthy();
    });

    it('should use default theme if available', () => {
      const themes = [
        { id: 1, name: 'Default', is_default: true, tokens: sampleTokens },
        { id: 2, name: 'Other', is_default: false, tokens: [] },
      ];

      const result = generateClaudeMd(themes, sampleComponents);

      const content = result['CLAUDE.md'];
      expect(content).toContain('--color-primary-500');
    });

    it('should use first theme if no default theme', () => {
      const themes = [
        { id: 1, name: 'First', is_default: false, tokens: sampleTokens },
        { id: 2, name: 'Second', is_default: false, tokens: [] },
      ];

      const result = generateClaudeMd(themes, sampleComponents);

      const content = result['CLAUDE.md'];
      expect(content).toContain('--color-primary-500');
    });

    it('should truncate if content exceeds 3KB', () => {
      // Create a large dataset
      const manyTokens = Array.from({ length: 200 }, (_, i) => ({
        css_variable: `--color-token-${i}`,
        value: '#000000',
        category: 'color',
        name: `color/token/${i}`,
      }));

      const manyComponents = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Component ${i}`,
        category: 'other',
        status: 'published',
        description: 'A component',
        props: Array.from({ length: 10 }, (_, j) => ({
          name: `prop${j}`,
          type: 'string',
        })),
      }));

      const themes = [
        { id: 1, name: 'Large Theme', is_default: true, tokens: manyTokens },
      ];

      const result = generateClaudeMd(themes, manyComponents);

      expect(result['CLAUDE.md'].length).toBeLessThanOrEqual(3 * 1024);
      expect(result['CLAUDE.md']).toContain('truncated');
    });
  });
});



