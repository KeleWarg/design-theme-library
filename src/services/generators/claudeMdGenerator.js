/**
 * @chunk 5.12 - Claude MD Generator
 * 
 * Generates CLAUDE.md and .claude/rules/tokens.md files for Claude AI assistant.
 * Includes design token reference and component documentation in a concise format (< 3KB).
 */

import { tokenToCssValue } from '../../lib/cssVariableInjector.js';

/**
 * Generate Claude MD files (CLAUDE.md and .claude/rules/tokens.md)
 * @param {Array} themes - Array of theme objects with tokens
 * @param {Array} components - Array of component objects
 * @param {Object} options - Generation options
 * @param {string} options.projectName - Project name (default: 'Design System')
 * @returns {Object} - Object with file paths as keys and content as values
 */
export function generateClaudeMd(themes, components, options = {}) {
  const {
    projectName = 'Design System',
  } = options;

  return {
    'CLAUDE.md': generateClaudeMain(themes, components, projectName),
    '.claude/rules/tokens.md': generateTokensRule(themes),
  };
}

/**
 * Generate main CLAUDE.md file
 * @param {Array} themes - Array of theme objects
 * @param {Array} components - Array of component objects
 * @param {string} projectName - Project name
 * @returns {string} - CLAUDE.md content
 */
function generateClaudeMain(themes, components, projectName) {
  const defaultTheme = themes?.find(t => t.is_default) || themes?.[0];
  const tokens = defaultTheme?.tokens || [];
  const publishedComponents = (components || []).filter(c => c.status === 'published');

  let content = `# ${projectName} Design System Reference

## Quick Reference

### Tokens
`;

  // Token tables by category
  const categories = ['color', 'spacing', 'typography', 'radius', 'shadow'];
  
  for (const category of categories) {
    const categoryTokens = tokens.filter(t => t.category === category);
    if (categoryTokens.length > 0) {
      // Limit to top 10 tokens per category for quick reference
      const displayTokens = categoryTokens.slice(0, 10);
      
      content += `\n#### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
      content += '| Token | Value |\n';
      content += '|-------|-------|\n';
      
      for (const token of displayTokens) {
        const value = tokenToCssValue(token);
        const varName = token.css_variable || token.name || '-';
        content += `| \`${varName}\` | ${value} |\n`;
      }
      
      if (categoryTokens.length > 10) {
        content += `\n*...and ${categoryTokens.length - 10} more ${category} tokens*\n`;
      }
    }
  }

  // Components table
  content += `\n### Components\n\n`;
  
  if (publishedComponents.length === 0) {
    content += `No published components available.\n\n`;
  } else {
    content += '| Name | Category | Props |\n';
    content += '|------|----------|-------|\n';
    
    // Limit to top 15 components for quick reference
    const displayComponents = publishedComponents.slice(0, 15);
    
    for (const component of displayComponents) {
      const propsList = component.props?.length 
        ? component.props.map(p => p.name).join(', ')
        : '-';
      const category = component.category || 'other';
      content += `| **${component.name}** | ${category} | ${propsList} |\n`;
    }
    
    if (publishedComponents.length > 15) {
      content += `\n*...and ${publishedComponents.length - 15} more components*\n`;
    }
  }

  // Detailed Reference section
  content += `\n## Detailed Reference

### Color Tokens
`;

  const colorTokens = tokens.filter(t => t.category === 'color');
  if (colorTokens.length > 0) {
    // Show more colors in detailed section (up to 30)
    for (const token of colorTokens.slice(0, 30)) {
      const value = tokenToCssValue(token);
      const varName = token.css_variable || token.name || '-';
      const description = token.metadata?.description || token.description || '';
      content += `- \`${varName}\`: ${value}${description ? ` — ${description}` : ''}\n`;
    }
    if (colorTokens.length > 30) {
      content += `\n*...and ${colorTokens.length - 30} more color tokens*\n`;
    }
  } else {
    content += `No color tokens defined.\n`;
  }

  content += `\n### Components\n\n`;

  if (publishedComponents.length > 0) {
    // Show top 10 components with more detail
    for (const component of publishedComponents.slice(0, 10)) {
      content += `#### ${component.name}\n\n`;
      
      if (component.description) {
        content += `${component.description}\n\n`;
      }
      
      if (component.props && component.props.length > 0) {
        content += '**Props:**\n';
        for (const prop of component.props) {
          const type = prop.type || 'any';
          const defaultVal = prop.default !== undefined && prop.default !== null 
            ? ` (default: ${prop.default})` 
            : '';
          content += `- \`${prop.name}\`: ${type}${defaultVal}\n`;
        }
        content += '\n';
      }
      
      if (component.variants && component.variants.length > 0) {
        content += `**Variants:** ${component.variants.map(v => v.name).join(', ')}\n\n`;
      }
    }
    
    if (publishedComponents.length > 10) {
      content += `\n*...and ${publishedComponents.length - 10} more components*\n`;
    }
  } else {
    content += `No published components available.\n`;
  }

  // Usage guidelines (concise)
  content += `\n## Usage Guidelines

- **Always use CSS variables**: \`color: var(--color-primary-500)\`
- **Use spacing scale**: \`padding: var(--space-md)\`
- **Follow typography scale**: \`font-size: var(--font-size-body)\`
- **Include hover/focus states** for interactive elements
- **Reference components** by their documented props and variants

See \`.claude/rules/tokens.md\` for full token reference.
`;

  // Enforce 3KB limit
  const maxSize = 3 * 1024; // 3KB
  if (content.length > maxSize) {
    // Truncate at a reasonable point
    const truncated = content.substring(0, maxSize - 200);
    const lastNewline = truncated.lastIndexOf('\n');
    content = content.substring(0, lastNewline) + '\n\n*[Content truncated for size constraints]*\n';
  }

  return content;
}

/**
 * Generate .claude/rules/tokens.md file
 * @param {Array} themes - Array of theme objects
 * @returns {string} - tokens.md content
 */
function generateTokensRule(themes) {
  const defaultTheme = themes?.find(t => t.is_default) || themes?.[0];
  const tokens = defaultTheme?.tokens || [];

  let content = `# Design Tokens Reference

Use these CSS variables when styling components.

## Colors

`;

  const colorTokens = tokens.filter(t => t.category === 'color');
  // Show top 20 color tokens
  for (const token of colorTokens.slice(0, 20)) {
    const varName = token.css_variable || token.name || '-';
    content += `- \`${varName}\`\n`;
  }
  if (colorTokens.length > 20) {
    content += `\n*...and ${colorTokens.length - 20} more color tokens*\n`;
  }

  content += `\n## Spacing\n\n`;
  const spacingTokens = tokens.filter(t => t.category === 'spacing');
  for (const token of spacingTokens) {
    const value = tokenToCssValue(token);
    const varName = token.css_variable || token.name || '-';
    content += `- \`${varName}\`: ${value}\n`;
  }

  content += `\n## Typography\n\n`;
  const typographyTokens = tokens.filter(t => t.category === 'typography');
  // Show top 15 typography tokens
  for (const token of typographyTokens.slice(0, 15)) {
    const varName = token.css_variable || token.name || '-';
    content += `- \`${varName}\`\n`;
  }
  if (typographyTokens.length > 15) {
    content += `\n*...and ${typographyTokens.length - 15} more typography tokens*\n`;
  }

  content += `\n## Radius\n\n`;
  const radiusTokens = tokens.filter(t => t.category === 'radius');
  for (const token of radiusTokens) {
    const value = tokenToCssValue(token);
    const varName = token.css_variable || token.name || '-';
    content += `- \`${varName}\`: ${value}\n`;
  }

  content += `\n## Shadows\n\n`;
  const shadowTokens = tokens.filter(t => t.category === 'shadow');
  for (const token of shadowTokens) {
    const varName = token.css_variable || token.name || '-';
    content += `- \`${varName}\`\n`;
  }

  return content;
}



