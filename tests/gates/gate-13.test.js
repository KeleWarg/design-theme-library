/**
 * Gate 13 — AI Format Generators Verification
 * 
 * Tests:
 * - 5.10 LLMS.txt Generator ✅
 * - 5.11 Cursor Rules Generator ✅
 * - 5.12 Claude MD Generator ✅
 * - 5.13 Project Knowledge Generator ✅
 */

import { describe, it, expect } from 'vitest';
import { generateLLMSTxt } from '../../src/services/generators/llmsTxtGenerator.js';
import { generateCursorRules } from '../../src/services/generators/cursorRulesGenerator.js';
import { generateClaudeMd } from '../../src/services/generators/claudeMdGenerator.js';
import { generateProjectKnowledge } from '../../src/services/generators/projectKnowledgeGenerator.js';

// Test data
const testThemes = [
  {
    id: '1',
    name: 'Default',
    slug: 'default',
    is_default: true,
    tokens: [
      {
        id: '1',
        name: 'Primary 500',
        path: 'Color/Primary/500',
        category: 'color',
        type: 'color',
        value: { hex: '#657E79', r: 101, g: 126, b: 121 },
        css_variable: '--color-primary-500',
        metadata: { description: 'Primary brand color' }
      },
      {
        id: '2',
        name: 'Spacing Medium',
        path: 'Spacing/Medium',
        category: 'spacing',
        type: 'dimension',
        value: { value: 16, unit: 'px' },
        css_variable: '--spacing-md',
        metadata: { description: 'Medium spacing unit' }
      },
      {
        id: '3',
        name: 'Radius Small',
        path: 'Radius/Small',
        category: 'radius',
        type: 'borderRadius',
        value: { value: 4, unit: 'px' },
        css_variable: '--radius-sm',
        metadata: { description: 'Small border radius' }
      },
      {
        id: '4',
        name: 'Shadow Medium',
        path: 'Shadow/Medium',
        category: 'shadow',
        type: 'boxShadow',
        value: {
          x: 0,
          y: 2,
          blur: 4,
          spread: 0,
          color: { hex: '#000000', opacity: 0.1 }
        },
        css_variable: '--shadow-md',
        metadata: { description: 'Medium shadow' }
      },
      {
        id: '5',
        name: 'Font Size Body',
        path: 'Typography/FontSize/Body',
        category: 'typography',
        type: 'fontSize',
        value: { value: 16, unit: 'px' },
        css_variable: '--font-size-body',
        metadata: { description: 'Body text size' }
      }
    ],
    typefaces: [],
    typography_roles: []
  }
];

const testComponents = [
  {
    id: '1',
    name: 'Button',
    slug: 'button',
    description: 'Primary button component for user actions',
    category: 'form',
    status: 'published',
    props: [
      {
        name: 'variant',
        type: 'string',
        default: 'primary',
        description: 'Button style variant'
      },
      {
        name: 'size',
        type: 'string',
        default: 'md',
        description: 'Button size'
      },
      {
        name: 'children',
        type: 'ReactNode',
        description: 'Button content'
      }
    ],
    variants: [
      {
        name: 'primary',
        description: 'Primary button style'
      },
      {
        name: 'secondary',
        description: 'Secondary button style'
      }
    ],
    linked_tokens: ['--color-primary-500', '--spacing-md', '--radius-sm'],
    code: `import React from 'react';

export const Button = ({ variant = 'primary', size = 'md', children, ...props }) => {
  return (
    <button
      className={\`btn btn-\${variant} btn-\${size}\`}
      style={{
        backgroundColor: variant === 'primary' ? 'var(--color-primary-500)' : 'transparent',
        padding: \`var(--spacing-\${size})\`,
        borderRadius: 'var(--radius-sm)',
      }}
      {...props}
    >
      {children}
    </button>
  );
};`,
    component_examples: [
      {
        id: '1',
        title: 'Basic Button',
        description: 'A simple button with default props',
        code: `<Button>Click me</Button>`,
        sort_order: 1
      },
      {
        id: '2',
        title: 'Primary Button',
        description: 'Primary variant button',
        code: `<Button variant="primary">Submit</Button>`,
        sort_order: 2
      }
    ]
  }
];

describe('Gate 13 — AI Format Generators', () => {
  describe('5.10 — LLMS.txt Generator', () => {
    it('should generate comprehensive LLMS.txt documentation', async () => {
      const result = await generateLLMSTxt(testThemes, testComponents, {
        projectName: 'Test Design System',
        version: '1.0.0'
      });

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);

      // Should contain tokens section
      expect(result).toContain('## Design Tokens');
      expect(result).toContain('### Colors');
      expect(result).toContain('--color-primary-500');
      expect(result).toContain('#657E79');

      // Should contain components section
      expect(result).toContain('## Components');
      expect(result).toContain('### Button');
      expect(result).toContain('Primary button component');

      // Should contain props table
      expect(result).toContain('**Props:**');
      expect(result).toContain('| Prop | Type | Default | Description |');
      expect(result).toContain('variant');

      // Should contain examples
      expect(result).toContain('**Examples:**');
      expect(result).toContain('Basic Button');

      // Should contain usage guidelines
      expect(result).toContain('## Usage Guidelines');
      expect(result).toContain("### DO's");
      expect(result).toContain("### DON'Ts");
    });
  });

  describe('5.11 — Cursor Rules Generator', () => {
    it('should generate valid Cursor rules MDC file under 3KB', () => {
      const result = generateCursorRules(testThemes, testComponents, {
        projectName: 'Test Design System'
      });

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);

      // Should be under 3KB
      expect(result.length).toBeLessThanOrEqual(3 * 1024);

      // Should have YAML frontmatter
      expect(result).toContain('---');
      expect(result).toContain('description:');
      expect(result).toContain('globs:');

      // Should contain tokens
      expect(result).toContain('### Colors');
      expect(result).toContain('--color-primary-500');
      expect(result).toContain('### Spacing');
      expect(result).toContain('--spacing-md');

      // Should contain components
      expect(result).toContain('## Components');
      expect(result).toContain('### Button');

      // Should contain patterns
      expect(result).toContain('## Patterns');
      expect(result).toContain('Use CSS variables');

      // Should be valid markdown (no obvious syntax errors)
      const lines = result.split('\n');
      const frontmatterEnd = lines.indexOf('---', 1);
      expect(frontmatterEnd).toBeGreaterThan(0);
    });
  });

  describe('5.12 — Claude MD Generator', () => {
    it('should generate valid Claude MD files with markdown tables', () => {
      const result = generateClaudeMd(testThemes, testComponents, {
        projectName: 'Test Design System'
      });

      expect(result).toBeTruthy();
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('CLAUDE.md');
      expect(result).toHaveProperty('.claude/rules/tokens.md');

      const claudeMain = result['CLAUDE.md'];
      const tokensRule = result['.claude/rules/tokens.md'];

      // CLAUDE.md validation
      expect(claudeMain).toBeTruthy();
      expect(typeof claudeMain).toBe('string');
      expect(claudeMain.length).toBeGreaterThan(0);
      expect(claudeMain.length).toBeLessThanOrEqual(3 * 1024); // Under 3KB

      // Should contain token tables
      expect(claudeMain).toContain('## Quick Reference');
      expect(claudeMain).toContain('| Token | Value |');
      expect(claudeMain).toContain('--color-primary-500');

      // Should contain components table
      expect(claudeMain).toContain('### Components');
      expect(claudeMain).toContain('| Name | Category | Props |');
      expect(claudeMain).toContain('**Button**');

      // Should contain detailed reference
      expect(claudeMain).toContain('## Detailed Reference');
      expect(claudeMain).toContain('### Color Tokens');

      // tokens.md validation
      expect(tokensRule).toBeTruthy();
      expect(typeof tokensRule).toBe('string');
      expect(tokensRule.length).toBeGreaterThan(0);

      expect(tokensRule).toContain('# Design Tokens Reference');
      expect(tokensRule).toContain('## Colors');
      expect(tokensRule).toContain('--color-primary-500');
      expect(tokensRule).toContain('## Spacing');
      expect(tokensRule).toContain('--spacing-md');
    });
  });

  describe('5.13 — Project Knowledge Generator', () => {
    it('should generate well-structured plain text project knowledge', () => {
      const result = generateProjectKnowledge(testThemes, testComponents, {
        projectName: 'Test Design System',
        version: '1.0.0'
      });

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(2.5 * 1024); // Under 2.5KB

      // Should have header
      expect(result).toContain('DESIGN SYSTEM KNOWLEDGE');
      expect(result).toContain('PROJECT: Test Design System');
      expect(result).toContain('VERSION: 1.0.0');

      // Should contain tokens section
      expect(result).toContain('=== DESIGN TOKENS ===');
      expect(result).toContain('COLORS:');
      expect(result).toContain('--color-primary-500');
      expect(result).toContain('#657E79');
      expect(result).toContain('SPACING:');
      expect(result).toContain('--spacing-md');
      expect(result).toContain('RADIUS:');
      expect(result).toContain('--radius-sm');
      expect(result).toContain('SHADOWS:');
      expect(result).toContain('--shadow-md');

      // Should contain components section
      expect(result).toContain('=== COMPONENTS ===');
      expect(result).toContain('BUTTON');
      expect(result).toContain('Category: form');
      expect(result).toContain('Variants:');

      // Should contain usage rules
      expect(result).toContain('=== USAGE RULES ===');
      expect(result).toContain('Always use CSS variables');
      expect(result).toContain('Use existing components');

      // Should be plain text (no markdown syntax)
      expect(result).not.toContain('```');
      expect(result).not.toContain('##');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty themes array', async () => {
      const llmsResult = await generateLLMSTxt([], testComponents);
      expect(llmsResult).toBeTruthy();
      expect(llmsResult).toContain('No color tokens defined');

      const cursorResult = generateCursorRules([], testComponents);
      expect(cursorResult).toBeTruthy();

      const claudeResult = generateClaudeMd([], testComponents);
      expect(claudeResult).toBeTruthy();

      const knowledgeResult = generateProjectKnowledge([], testComponents);
      expect(knowledgeResult).toBeTruthy();
    });

    it('should handle empty components array', async () => {
      const llmsResult = await generateLLMSTxt(testThemes, []);
      expect(llmsResult).toBeTruthy();
      expect(llmsResult).toContain('No published components available');

      const cursorResult = generateCursorRules(testThemes, []);
      expect(cursorResult).toBeTruthy();
      expect(cursorResult).toContain('No published components available');

      const claudeResult = generateClaudeMd(testThemes, []);
      expect(claudeResult).toBeTruthy();
      expect(claudeResult['CLAUDE.md']).toContain('No published components available');

      const knowledgeResult = generateProjectKnowledge(testThemes, []);
      expect(knowledgeResult).toBeTruthy();
      expect(knowledgeResult).toContain('No published components available');
    });

    it('should filter out draft components', async () => {
      const draftComponent = {
        ...testComponents[0],
        status: 'draft'
      };

      const llmsResult = await generateLLMSTxt(testThemes, [draftComponent]);
      expect(llmsResult).toContain('No published components available');

      const cursorResult = generateCursorRules(testThemes, [draftComponent]);
      expect(cursorResult).toContain('No published components available');
    });
  });
});

