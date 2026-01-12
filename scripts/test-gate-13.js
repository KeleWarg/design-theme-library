/**
 * Gate 13 Verification Script
 * Manually tests AI format generators
 */

import { generateLLMSTxt } from '../src/services/generators/llmsTxtGenerator.js';
import { generateCursorRules } from '../src/services/generators/cursorRulesGenerator.js';
import { generateClaudeMd } from '../src/services/generators/claudeMdGenerator.js';
import { generateProjectKnowledge } from '../src/services/generators/projectKnowledgeGenerator.js';

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

async function runTests() {
  const results = {
    llmsTxt: { passed: false, errors: [], size: 0 },
    cursorRules: { passed: false, errors: [], size: 0 },
    claudeMd: { passed: false, errors: [], size: 0 },
    projectKnowledge: { passed: false, errors: [], size: 0 }
  };

  console.log('🧪 Testing Gate 13: AI Format Generators\n');

  // Test 1: LLMS.txt Generator
  console.log('1. Testing LLMS.txt Generator (5.10)...');
  try {
    const llmsResult = await generateLLMSTxt(testThemes, testComponents, {
      projectName: 'Test Design System',
      version: '1.0.0'
    });

    results.llmsTxt.size = llmsResult.length;

    // Validation checks
    const checks = {
      hasTokens: llmsResult.includes('## Design Tokens'),
      hasColors: llmsResult.includes('### Colors') && llmsResult.includes('--color-primary-500'),
      hasComponents: llmsResult.includes('## Components') && llmsResult.includes('### Button'),
      hasProps: llmsResult.includes('**Props:**') && llmsResult.includes('variant'),
      hasExamples: llmsResult.includes('**Examples:**') && llmsResult.includes('Basic Button'),
      hasGuidelines: llmsResult.includes('## Usage Guidelines')
    };

    results.llmsTxt.passed = Object.values(checks).every(v => v === true);
    if (!results.llmsTxt.passed) {
      results.llmsTxt.errors = Object.entries(checks)
        .filter(([_, v]) => !v)
        .map(([k]) => `Missing: ${k}`);
    }

    console.log(`   ✅ Size: ${(llmsResult.length / 1024).toFixed(2)} KB`);
    console.log(`   ${results.llmsTxt.passed ? '✅' : '❌'} All checks passed: ${results.llmsTxt.passed}`);
  } catch (error) {
    results.llmsTxt.errors.push(error.message);
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 2: Cursor Rules Generator
  console.log('\n2. Testing Cursor Rules Generator (5.11)...');
  try {
    const cursorResult = generateCursorRules(testThemes, testComponents, {
      projectName: 'Test Design System'
    });

    results.cursorRules.size = cursorResult.length;

    // Validation checks
    const checks = {
      under3KB: cursorResult.length <= 3 * 1024,
      hasFrontmatter: cursorResult.includes('---') && cursorResult.includes('description:'),
      hasTokens: cursorResult.includes('### Colors') && cursorResult.includes('--color-primary-500'),
      hasComponents: cursorResult.includes('## Components') && cursorResult.includes('### Button'),
      hasPatterns: cursorResult.includes('## Patterns')
    };

    results.cursorRules.passed = Object.values(checks).every(v => v === true);
    if (!results.cursorRules.passed) {
      results.cursorRules.errors = Object.entries(checks)
        .filter(([_, v]) => !v)
        .map(([k]) => `Failed: ${k}`);
    }

    console.log(`   ✅ Size: ${(cursorResult.length / 1024).toFixed(2)} KB (limit: 3 KB)`);
    console.log(`   ${results.cursorRules.passed ? '✅' : '❌'} All checks passed: ${results.cursorRules.passed}`);
  } catch (error) {
    results.cursorRules.errors.push(error.message);
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 3: Claude MD Generator
  console.log('\n3. Testing Claude MD Generator (5.12)...');
  try {
    const claudeResult = generateClaudeMd(testThemes, testComponents, {
      projectName: 'Test Design System'
    });

    const claudeMain = claudeResult['CLAUDE.md'];
    const tokensRule = claudeResult['.claude/rules/tokens.md'];

    results.claudeMd.size = claudeMain.length;

    // Validation checks
    const checks = {
      hasBothFiles: !!claudeMain && !!tokensRule,
      mainUnder3KB: claudeMain.length <= 3 * 1024,
      hasTokenTables: claudeMain.includes('| Token | Value |'),
      hasComponentTable: claudeMain.includes('| Name | Category | Props |'),
      hasDetailedRef: claudeMain.includes('## Detailed Reference'),
      tokensRuleValid: tokensRule.includes('# Design Tokens Reference') && tokensRule.includes('## Colors')
    };

    results.claudeMd.passed = Object.values(checks).every(v => v === true);
    if (!results.claudeMd.passed) {
      results.claudeMd.errors = Object.entries(checks)
        .filter(([_, v]) => !v)
        .map(([k]) => `Failed: ${k}`);
    }

    console.log(`   ✅ CLAUDE.md size: ${(claudeMain.length / 1024).toFixed(2)} KB (limit: 3 KB)`);
    console.log(`   ✅ tokens.md size: ${(tokensRule.length / 1024).toFixed(2)} KB`);
    console.log(`   ${results.claudeMd.passed ? '✅' : '❌'} All checks passed: ${results.claudeMd.passed}`);
  } catch (error) {
    results.claudeMd.errors.push(error.message);
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 4: Project Knowledge Generator
  console.log('\n4. Testing Project Knowledge Generator (5.13)...');
  try {
    const knowledgeResult = generateProjectKnowledge(testThemes, testComponents, {
      projectName: 'Test Design System',
      version: '1.0.0'
    });

    results.projectKnowledge.size = knowledgeResult.length;

    // Validation checks
    const checks = {
      under2_5KB: knowledgeResult.length <= 2.5 * 1024,
      hasHeader: knowledgeResult.includes('DESIGN SYSTEM KNOWLEDGE') && knowledgeResult.includes('PROJECT:'),
      hasTokens: knowledgeResult.includes('=== DESIGN TOKENS ===') && knowledgeResult.includes('COLORS:'),
      hasComponents: knowledgeResult.includes('=== COMPONENTS ===') && knowledgeResult.includes('BUTTON'),
      hasRules: knowledgeResult.includes('=== USAGE RULES ==='),
      isPlainText: !knowledgeResult.includes('```') && !knowledgeResult.includes('##')
    };

    results.projectKnowledge.passed = Object.values(checks).every(v => v === true);
    if (!results.projectKnowledge.passed) {
      results.projectKnowledge.errors = Object.entries(checks)
        .filter(([_, v]) => !v)
        .map(([k]) => `Failed: ${k}`);
    }

    console.log(`   ✅ Size: ${(knowledgeResult.length / 1024).toFixed(2)} KB (limit: 2.5 KB)`);
    console.log(`   ${results.projectKnowledge.passed ? '✅' : '❌'} All checks passed: ${results.projectKnowledge.passed}`);
  } catch (error) {
    results.projectKnowledge.errors.push(error.message);
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));

  const allPassed = Object.values(results).every(r => r.passed);
  
  console.log(`\n5.10 LLMS.txt Generator:        ${results.llmsTxt.passed ? '✅ PASSED' : '❌ FAILED'}`);
  if (!results.llmsTxt.passed && results.llmsTxt.errors.length > 0) {
    results.llmsTxt.errors.forEach(e => console.log(`   - ${e}`));
  }

  console.log(`5.11 Cursor Rules Generator:     ${results.cursorRules.passed ? '✅ PASSED' : '❌ FAILED'}`);
  if (!results.cursorRules.passed && results.cursorRules.errors.length > 0) {
    results.cursorRules.errors.forEach(e => console.log(`   - ${e}`));
  }

  console.log(`5.12 Claude MD Generator:        ${results.claudeMd.passed ? '✅ PASSED' : '❌ FAILED'}`);
  if (!results.claudeMd.passed && results.claudeMd.errors.length > 0) {
    results.claudeMd.errors.forEach(e => console.log(`   - ${e}`));
  }

  console.log(`5.13 Project Knowledge Generator: ${results.projectKnowledge.passed ? '✅ PASSED' : '❌ FAILED'}`);
  if (!results.projectKnowledge.passed && results.projectKnowledge.errors.length > 0) {
    results.projectKnowledge.errors.forEach(e => console.log(`   - ${e}`));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`🚦 GATE 13: ${allPassed ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log('='.repeat(60) + '\n');

  return { allPassed, results };
}

runTests().catch(console.error);





