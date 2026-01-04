/**
 * @chunk 5.18 - Claude Skill Generator Tests
 */

import { describe, it, expect } from 'vitest';
import { generateClaudeSkill } from '../../src/services/generators/claudeSkillGenerator.js';

describe('claudeSkillGenerator', () => {
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
      name: 'Secondary 500',
      path: 'Color/Secondary/500',
      category: 'color',
      type: 'color',
      value: { hex: '#64748b' },
      css_variable: '--color-secondary-500',
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
      name: 'Radius Small',
      path: 'Radius/sm',
      category: 'radius',
      type: 'dimension',
      value: { value: 4, unit: 'px' },
      css_variable: '--radius-sm',
    },
    {
      id: '6',
      name: 'Shadow Small',
      path: 'Shadow/sm',
      category: 'shadow',
      type: 'shadow',
      value: { shadows: [{ x: 0, y: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.1)' }] },
      css_variable: '--shadow-sm',
    },
    {
      id: '7',
      name: 'Font Size Body',
      path: 'Typography/FontSize/body',
      category: 'typography',
      type: 'dimension',
      value: { value: 16, unit: 'px' },
      css_variable: '--font-size-body',
    },
  ];

  const sampleThemes = [
    {
      id: '1',
      name: 'Default Theme',
      slug: 'default',
      is_default: true,
      tokens: sampleTokens,
    },
  ];

  const sampleComponents = [
    {
      id: '1',
      name: 'Button',
      slug: 'button',
      category: 'buttons',
      status: 'published',
      description: 'A primary button component',
      props: [
        { name: 'variant', type: 'string', required: false, default: 'primary', description: 'Button variant' },
        { name: 'size', type: 'string', required: false, default: 'md', description: 'Button size' },
      ],
      variants: [
        { name: 'primary', description: 'Primary button style' },
        { name: 'secondary', description: 'Secondary button style' },
      ],
      linked_tokens: ['--color-primary-500'],
      component_examples: [
        { title: 'Basic Button', description: 'A simple button', code: '<Button>Click me</Button>' },
      ],
    },
    {
      id: '2',
      name: 'Input',
      slug: 'input',
      category: 'forms',
      status: 'published',
      description: 'Text input component',
      props: [
        { name: 'type', type: 'string', required: false, default: 'text', description: 'Input type' },
        { name: 'placeholder', type: 'string', required: false, description: 'Placeholder text' },
      ],
      variants: [],
      linked_tokens: [],
      component_examples: [],
    },
    {
      id: '3',
      name: 'Draft Component',
      slug: 'draft-component',
      category: 'other',
      status: 'draft',
      description: 'This should not appear',
      props: [],
      variants: [],
      linked_tokens: [],
      component_examples: [],
    },
  ];

  describe('generateClaudeSkill', () => {
    it('should return object with SKILL.md, tokens.json, components.json keys', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents);

      expect(result).toHaveProperty('SKILL.md');
      expect(result).toHaveProperty('tokens.json');
      expect(result).toHaveProperty('components.json');
    });

    it('should generate SKILL.md with valid frontmatter', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents);

      const content = result['SKILL.md'];
      expect(content).toContain('---');
      expect(content).toContain('name:');
      expect(content).toContain('description:');
      expect(content).toContain('---');
    });

    it('should generate SKILL.md with project name in frontmatter', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents, { projectName: 'My Design System' });

      const content = result['SKILL.md'];
      expect(content).toContain('name: my-design-system-tokens');
      expect(content).toContain('description: Design tokens and component reference for My Design System');
      expect(content).toContain('# My Design System Design System Skill');
    });

    it('should include Description section in SKILL.md', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents);

      const content = result['SKILL.md'];
      expect(content).toContain('## Description');
      expect(content).toContain('This skill provides access to');
    });

    it('should include Capabilities section in SKILL.md', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents);

      const content = result['SKILL.md'];
      expect(content).toContain('## Capabilities');
      expect(content).toContain('Look up design tokens');
      expect(content).toContain('Reference component documentation');
    });

    it('should include Usage section in SKILL.md', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents);

      const content = result['SKILL.md'];
      expect(content).toContain('## Usage');
      expect(content).toContain('tokens.json');
      expect(content).toContain('components.json');
    });

    it('should include Token Reference section with token categories', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents);

      const content = result['SKILL.md'];
      expect(content).toContain('## Token Reference');
      expect(content).toContain('### Essential Color Tokens');
      expect(content).toContain('### Spacing Scale');
      expect(content).toContain('### Border Radius');
      expect(content).toContain('### Shadows');
      expect(content).toContain('### Typography');
    });

    it('should include color tokens in Token Reference', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents);

      const content = result['SKILL.md'];
      expect(content).toContain('--color-primary-500');
      expect(content).toContain('--color-secondary-500');
    });

    it('should include spacing tokens in Token Reference', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents);

      const content = result['SKILL.md'];
      expect(content).toContain('--spacing-sm');
      expect(content).toContain('--spacing-md');
    });

    it('should include Component Reference section', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents);

      const content = result['SKILL.md'];
      expect(content).toContain('## Component Reference');
    });

    it('should only include published components in Component Reference', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents);

      const content = result['SKILL.md'];
      expect(content).toContain('Button');
      expect(content).toContain('Input');
      expect(content).not.toContain('Draft Component');
    });

    it('should include Styling Guidelines section', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents);

      const content = result['SKILL.md'];
      expect(content).toContain('## Styling Guidelines');
      expect(content).toContain('CSS variables');
    });

    it('should generate tokens.json with valid JSON structure', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents);

      const tokensJson = JSON.parse(result['tokens.json']);
      expect(tokensJson).toHaveProperty('designSystem');
      expect(tokensJson).toHaveProperty('generatedAt');
      expect(tokensJson).toHaveProperty('themes');
      expect(tokensJson).toHaveProperty('tokens');
    });

    it('should include all themes in tokens.json', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents);

      const tokensJson = JSON.parse(result['tokens.json']);
      expect(tokensJson.themes).toHaveLength(1);
      expect(tokensJson.themes[0]).toHaveProperty('name', 'Default Theme');
      expect(tokensJson.themes[0]).toHaveProperty('slug', 'default');
      expect(tokensJson.themes[0]).toHaveProperty('isDefault', true);
    });

    it('should include all tokens in tokens.json', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents);

      const tokensJson = JSON.parse(result['tokens.json']);
      expect(tokensJson.tokens).toHaveLength(sampleTokens.length);
      expect(tokensJson.tokens[0]).toHaveProperty('theme', 'Default Theme');
      expect(tokensJson.tokens[0]).toHaveProperty('path');
      expect(tokensJson.tokens[0]).toHaveProperty('name');
      expect(tokensJson.tokens[0]).toHaveProperty('category');
      expect(tokensJson.tokens[0]).toHaveProperty('type');
      expect(tokensJson.tokens[0]).toHaveProperty('cssVariable');
      expect(tokensJson.tokens[0]).toHaveProperty('value');
    });

    it('should generate components.json with valid JSON structure', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents);

      const componentsJson = JSON.parse(result['components.json']);
      expect(componentsJson).toHaveProperty('designSystem');
      expect(componentsJson).toHaveProperty('generatedAt');
      expect(componentsJson).toHaveProperty('components');
    });

    it('should include all components in components.json', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents);

      const componentsJson = JSON.parse(result['components.json']);
      expect(componentsJson.components).toHaveLength(sampleComponents.length);
      expect(componentsJson.components[0]).toHaveProperty('name', 'Button');
      expect(componentsJson.components[0]).toHaveProperty('slug', 'button');
      expect(componentsJson.components[0]).toHaveProperty('description');
      expect(componentsJson.components[0]).toHaveProperty('category');
      expect(componentsJson.components[0]).toHaveProperty('props');
      expect(componentsJson.components[0]).toHaveProperty('variants');
      expect(componentsJson.components[0]).toHaveProperty('linkedTokens');
      expect(componentsJson.components[0]).toHaveProperty('examples');
    });

    it('should include component props in components.json', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents);

      const componentsJson = JSON.parse(result['components.json']);
      const buttonComponent = componentsJson.components.find(c => c.name === 'Button');
      expect(buttonComponent.props).toHaveLength(2);
      expect(buttonComponent.props[0]).toHaveProperty('name', 'variant');
      expect(buttonComponent.props[0]).toHaveProperty('type', 'string');
      expect(buttonComponent.props[0]).toHaveProperty('required', false);
      expect(buttonComponent.props[0]).toHaveProperty('default', 'primary');
      expect(buttonComponent.props[0]).toHaveProperty('description');
    });

    it('should include component variants in components.json', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents);

      const componentsJson = JSON.parse(result['components.json']);
      const buttonComponent = componentsJson.components.find(c => c.name === 'Button');
      expect(buttonComponent.variants).toHaveLength(2);
      expect(buttonComponent.variants[0]).toHaveProperty('name', 'primary');
      expect(buttonComponent.variants[0]).toHaveProperty('description');
    });

    it('should include component examples in components.json', () => {
      const result = generateClaudeSkill(sampleThemes, sampleComponents);

      const componentsJson = JSON.parse(result['components.json']);
      const buttonComponent = componentsJson.components.find(c => c.name === 'Button');
      expect(buttonComponent.examples).toHaveLength(1);
      expect(buttonComponent.examples[0]).toHaveProperty('title', 'Basic Button');
      expect(buttonComponent.examples[0]).toHaveProperty('description');
      expect(buttonComponent.examples[0]).toHaveProperty('code');
    });

    it('should handle empty themes array', () => {
      const result = generateClaudeSkill([], sampleComponents);

      expect(result['SKILL.md']).toBeTruthy();
      expect(result['tokens.json']).toBeTruthy();
      
      const tokensJson = JSON.parse(result['tokens.json']);
      expect(tokensJson.tokens).toHaveLength(0);
    });

    it('should handle empty components array', () => {
      const result = generateClaudeSkill(sampleThemes, []);

      expect(result['SKILL.md']).toContain('No published components available');
      
      const componentsJson = JSON.parse(result['components.json']);
      expect(componentsJson.components).toHaveLength(0);
    });

    it('should handle theme without tokens', () => {
      const themesWithoutTokens = [
        { id: '1', name: 'Empty Theme', slug: 'empty', is_default: true, tokens: [] },
      ];

      const result = generateClaudeSkill(themesWithoutTokens, sampleComponents);

      expect(result['SKILL.md']).toBeTruthy();
      const tokensJson = JSON.parse(result['tokens.json']);
      expect(tokensJson.tokens).toHaveLength(0);
    });

    it('should use default theme if available', () => {
      const themes = [
        { id: '1', name: 'Default', slug: 'default', is_default: true, tokens: sampleTokens },
        { id: '2', name: 'Other', slug: 'other', is_default: false, tokens: [] },
      ];

      const result = generateClaudeSkill(themes, sampleComponents);

      const content = result['SKILL.md'];
      expect(content).toContain('--color-primary-500');
    });

    it('should use first theme if no default theme', () => {
      const themes = [
        { id: '1', name: 'First', slug: 'first', is_default: false, tokens: sampleTokens },
        { id: '2', name: 'Second', slug: 'second', is_default: false, tokens: [] },
      ];

      const result = generateClaudeSkill(themes, sampleComponents);

      const content = result['SKILL.md'];
      expect(content).toContain('--color-primary-500');
    });

    it('should handle components without props', () => {
      const componentsWithoutProps = [
        {
          id: '1',
          name: 'Simple Component',
          slug: 'simple',
          category: 'other',
          status: 'published',
          description: 'A simple component',
          props: null,
          variants: [],
          linked_tokens: [],
          component_examples: [],
        },
      ];

      const result = generateClaudeSkill(sampleThemes, componentsWithoutProps);

      const componentsJson = JSON.parse(result['components.json']);
      expect(componentsJson.components[0].props).toEqual([]);
    });

    it('should handle multiple themes in tokens.json', () => {
      const multipleThemes = [
        {
          id: '1',
          name: 'Light Theme',
          slug: 'light',
          is_default: true,
          tokens: sampleTokens.slice(0, 3),
        },
        {
          id: '2',
          name: 'Dark Theme',
          slug: 'dark',
          is_default: false,
          tokens: sampleTokens.slice(3),
        },
      ];

      const result = generateClaudeSkill(multipleThemes, sampleComponents);

      const tokensJson = JSON.parse(result['tokens.json']);
      expect(tokensJson.themes).toHaveLength(2);
      expect(tokensJson.tokens).toHaveLength(sampleTokens.length);
    });
  });
});

