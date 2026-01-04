/**
 * @chunk 5.11 - Cursor Rules Generator
 * 
 * Generates .cursor/rules/design-system.mdc file for Cursor AI coding assistant.
 * Includes design token usage rules and component patterns in a condensed format (< 3KB).
 */

import { tokenToCssValue } from '../../lib/cssVariableInjector.js';

/**
 * Generate Cursor rules MDC file content
 * @param {Array} themes - Array of theme objects with tokens
 * @param {Array} components - Array of component objects
 * @param {Object} options - Generation options
 * @param {string} options.projectName - Project name (default: 'Design System')
 * @param {Array<string>} options.globs - File globs to apply rules to (default: glob patterns for tsx, jsx, css files)
 * @returns {string} - MDC file content
 */
export function generateCursorRules(themes, components, options = {}) {
  const {
    projectName = 'Design System',
    globs = ['**/*.tsx', '**/*.jsx', '**/*.css'],
  } = options;

  // YAML frontmatter
  let content = `---
description: ${projectName} design system tokens and components
globs: ${JSON.stringify(globs)}
alwaysApply: false
---

# ${projectName} Design System

## Quick Reference

### Colors
`;

  // Get first theme (default theme preferred but use first available)
  const defaultTheme = themes?.find(t => t.is_default) || themes?.[0];
  const tokens = defaultTheme?.tokens || [];

  // Condensed color tokens (keep under 3KB total)
  const colorTokens = tokens.filter(t => t.category === 'color').slice(0, 15);
  for (const token of colorTokens) {
    content += `- \`${token.css_variable}\`: ${token.name || token.css_variable}\n`;
  }

  content += `\n### Spacing\n`;
  const spacingTokens = tokens.filter(t => t.category === 'spacing');
  for (const token of spacingTokens) {
    const value = tokenToCssValue(token);
    content += `- \`${token.css_variable}\`: ${value}\n`;
  }

  content += `\n### Typography\n`;
  const typographyTokens = tokens.filter(t => t.category === 'typography').slice(0, 10);
  for (const token of typographyTokens) {
    content += `- \`${token.css_variable}\`\n`;
  }

  content += `\n### Radius\n`;
  const radiusTokens = tokens.filter(t => t.category === 'radius');
  for (const token of radiusTokens) {
    const value = tokenToCssValue(token);
    content += `- \`${token.css_variable}\`: ${value}\n`;
  }

  content += `\n### Shadows\n`;
  const shadowTokens = tokens.filter(t => t.category === 'shadow').slice(0, 5);
  for (const token of shadowTokens) {
    content += `- \`${token.css_variable}\`\n`;
  }

  // Components summary
  content += `\n## Components\n\n`;
  const publishedComponents = (components || []).filter(c => c.status === 'published').slice(0, 10);
  
  if (publishedComponents.length === 0) {
    content += `No published components available.\n\n`;
  } else {
    for (const component of publishedComponents) {
      content += `### ${component.name}\n`;
      if (component.description) {
        content += `${component.description.substring(0, 100)}\n`;
      }
      if (component.props?.length) {
        content += `Props: ${component.props.map(p => p.name).join(', ')}\n`;
      }
      content += '\n';
    }
  }

  // Usage patterns
  content += `## Patterns

When styling components:
1. Use CSS variables: \`color: var(--color-primary)\`
2. Use spacing scale: \`padding: var(--space-md)\`
3. Use border radius: \`border-radius: var(--radius-md)\`
4. Use shadows: \`box-shadow: var(--shadow-md)\`

When creating new components:
- Reference existing components as patterns
- Always use design tokens
- Include proper TypeScript types
- Add hover/focus states for interactive elements
`;

  // Enforce 3KB limit - truncate if needed
  const maxSize = 3 * 1024; // 3KB
  if (content.length > maxSize) {
    // Find a good truncation point (before components or patterns)
    const componentsStart = content.indexOf('\n## Components\n');
    const patternsStart = content.indexOf('\n## Patterns\n');
    
    // Try to keep patterns section, truncate components if needed
    if (patternsStart > 0 && patternsStart < maxSize - 500) {
      content = content.substring(0, patternsStart) + '\n## Patterns\n\n*[Content truncated for size constraints]*\n';
    } else {
      // Truncate at components if patterns would exceed limit
      content = content.substring(0, maxSize - 100) + '\n\n*[Content truncated for size constraints]*\n';
    }
  }

  return content;
}

