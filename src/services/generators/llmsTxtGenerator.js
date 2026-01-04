/**
 * @chunk 5.10 - LLMS.txt Generator
 * 
 * Generates comprehensive LLMS.txt documentation file for AI consumption.
 * Includes design tokens, components, and usage guidelines.
 */

import { tokenToCssValue } from '../../lib/cssVariableInjector.js';

/**
 * Generate LLMS.txt content string from themes and components
 * @param {Array} themes - Array of theme objects with tokens, typefaces, typography_roles
 * @param {Array} components - Array of component objects with props, variants, examples
 * @param {Object} options - Generation options
 * @param {string} options.projectName - Project name (default: 'Design System')
 * @param {string} options.version - Version string (default: '1.0.0')
 * @returns {string} - LLMS.txt content string
 */
export async function generateLLMSTxt(themes, components, options = {}) {
  const {
    projectName = 'Design System',
    version = '1.0.0',
  } = options;

  let content = `# ${projectName} Design System
Version: ${version}
Generated: ${new Date().toISOString()}

## Overview
This document describes the design tokens and components available in the ${projectName} design system.
Use these tokens and components to build consistent, on-brand user interfaces.

---

## Design Tokens

Design tokens are the foundational design decisions of the system. Use CSS variables to reference tokens in your code.

`;

  // Group tokens by category across all themes
  const defaultTheme = themes.find(t => t.is_default) || themes[0];
  const allTokens = themes.flatMap(t => t.tokens || []);
  
  // Colors section
  content += `### Colors\n\n`;
  const colorTokens = allTokens.filter(t => t.category === 'color');
  if (colorTokens.length > 0) {
    // Group colors by theme if multiple themes
    if (themes.length > 1) {
      for (const theme of themes) {
        const themeColors = (theme.tokens || []).filter(t => t.category === 'color');
        if (themeColors.length > 0) {
          content += `#### ${theme.name}\n\n`;
          for (const token of themeColors.slice(0, 50)) {
            const value = formatColorForDisplay(token);
            const description = token.metadata?.description || token.description || '';
            content += `- \`${token.css_variable}\`: ${value}${description ? ` — ${description}` : ''}\n`;
          }
          if (themeColors.length > 50) {
            content += `\n*...and ${themeColors.length - 50} more color tokens*\n`;
          }
          content += '\n';
        }
      }
    } else {
      // Single theme - show all colors
      for (const token of colorTokens.slice(0, 100)) {
        const value = formatColorForDisplay(token);
        const description = token.metadata?.description || token.description || '';
        content += `- \`${token.css_variable}\`: ${value}${description ? ` — ${description}` : ''}\n`;
      }
      if (colorTokens.length > 100) {
        content += `\n*...and ${colorTokens.length - 100} more color tokens*\n`;
      }
    }
  } else {
    content += `No color tokens defined.\n\n`;
  }

  // Typography section
  content += `### Typography\n\n`;
  
  // Typography roles
  if (defaultTheme?.typography_roles?.length > 0) {
    content += `#### Typeface Roles\n\n`;
    content += '| Role | Family | Weight | Fallback Stack |\n';
    content += '|------|--------|--------|----------------|\n';
    
    for (const role of defaultTheme.typography_roles) {
      const typeface = defaultTheme.typefaces?.find(tf => tf.role === role.typeface_role);
      const family = typeface?.name || typeface?.google_font_name || role.fallback_stack || '-';
      const weight = role.weight || '400';
      const fallback = role.fallback_stack || 'system-ui, sans-serif';
      content += `| ${role.role} | ${family} | ${weight} | ${fallback} |\n`;
    }
    content += '\n';
  }
  
  // Typography tokens
  const typographyTokens = allTokens.filter(t => t.category === 'typography');
  if (typographyTokens.length > 0) {
    content += `#### Typography Scale\n\n`;
    content += 'Use these CSS variables for consistent typography:\n\n';
    for (const token of typographyTokens) {
      const value = tokenToCssValue(token);
      const description = token.metadata?.description || token.description || '';
      content += `- \`${token.css_variable}\`: ${value}${description ? ` — ${description}` : ''}\n`;
    }
    content += '\n';
  }

  // Spacing section
  content += `### Spacing\n\n`;
  const spacingTokens = allTokens.filter(t => t.category === 'spacing');
  if (spacingTokens.length > 0) {
    content += 'Use these spacing values for consistent layouts:\n\n';
    for (const token of spacingTokens) {
      const value = tokenToCssValue(token);
      const description = token.metadata?.description || token.description || '';
      content += `- \`${token.css_variable}\`: ${value}${description ? ` — ${description}` : ''}\n`;
    }
    content += '\n';
  } else {
    content += `No spacing tokens defined.\n\n`;
  }

  // Border Radius section
  content += `### Border Radius\n\n`;
  const radiusTokens = allTokens.filter(t => t.category === 'radius');
  if (radiusTokens.length > 0) {
    for (const token of radiusTokens) {
      const value = tokenToCssValue(token);
      const description = token.metadata?.description || token.description || '';
      content += `- \`${token.css_variable}\`: ${value}${description ? ` — ${description}` : ''}\n`;
    }
    content += '\n';
  } else {
    content += `No border radius tokens defined.\n\n`;
  }

  // Shadows section
  content += `### Shadows\n\n`;
  const shadowTokens = allTokens.filter(t => t.category === 'shadow');
  if (shadowTokens.length > 0) {
    for (const token of shadowTokens) {
      const value = tokenToCssValue(token);
      const description = token.metadata?.description || token.description || '';
      content += `- \`${token.css_variable}\`: ${value}${description ? ` — ${description}` : ''}\n`;
    }
    content += '\n';
  } else {
    content += `No shadow tokens defined.\n\n`;
  }

  // Grid section (if any)
  const gridTokens = allTokens.filter(t => t.category === 'grid');
  if (gridTokens.length > 0) {
    content += `### Grid\n\n`;
    for (const token of gridTokens) {
      const value = tokenToCssValue(token);
      const description = token.metadata?.description || token.description || '';
      content += `- \`${token.css_variable}\`: ${value}${description ? ` — ${description}` : ''}\n`;
    }
    content += '\n';
  }

  // Components section
  content += `---\n\n## Components\n\n`;
  
  // Filter to published components only
  const publishedComponents = (components || []).filter(c => c.status === 'published');
  
  if (publishedComponents.length === 0) {
    content += `No published components available.\n\n`;
  } else {
    for (const component of publishedComponents) {
      content += `### ${component.name}\n\n`;
      
      if (component.description) {
        content += `${component.description}\n\n`;
      }
      
      content += `**Category:** ${component.category || 'other'}\n\n`;
      
      // Props table
      if (component.props && component.props.length > 0) {
        content += `**Props:**\n\n`;
        content += '| Prop | Type | Default | Description |\n';
        content += '|------|------|---------|-------------|\n';
        
        for (const prop of component.props) {
          const defaultVal = prop.default !== undefined && prop.default !== null 
            ? String(prop.default) 
            : '-';
          const type = prop.type || 'any';
          const description = prop.description || '-';
          content += `| ${prop.name} | ${type} | ${defaultVal} | ${description} |\n`;
        }
        content += '\n';
      }
      
      // Variants
      if (component.variants && component.variants.length > 0) {
        content += `**Variants:**\n`;
        for (const variant of component.variants) {
          content += `- ${variant.name}: ${variant.description || 'No description'}\n`;
        }
        content += '\n';
      }
      
      // Linked tokens
      if (component.linked_tokens && component.linked_tokens.length > 0) {
        content += `**Linked Tokens:** ${component.linked_tokens.join(', ')}\n\n`;
      }
      
      // Examples
      if (component.component_examples && component.component_examples.length > 0) {
        content += `**Examples:**\n\n`;
        for (const example of component.component_examples) {
          content += `#### ${example.title || 'Example'}\n`;
          if (example.description) {
            content += `${example.description}\n\n`;
          }
          if (example.code) {
            content += '```jsx\n';
            content += example.code;
            content += '\n```\n\n';
          }
        }
      }
      
      content += '---\n\n';
    }
  }

  // Usage guidelines
  content += `## Usage Guidelines

### DO's
- Use design tokens instead of hardcoded values
- Maintain consistent spacing using spacing tokens
- Use semantic color tokens (e.g., \`--color-primary-500\`) over raw colors
- Follow the typography scale for text sizing
- Include hover/focus states for interactive elements
- Reference components by their documented props and variants
- Use CSS variables for all design values

### DON'Ts
- Don't hardcode colors, use CSS variables
- Don't create custom spacing values outside the scale
- Don't mix font families without purpose
- Don't ignore accessibility requirements
- Don't bypass the design system tokens
- Don't create new components without checking if similar ones exist

### Best Practices
1. **Token Usage**: Always reference tokens via CSS variables (e.g., \`var(--color-primary-500)\`)
2. **Component Composition**: Build complex UIs by composing documented components
3. **Consistency**: Follow the established patterns in component examples
4. **Accessibility**: Ensure all interactive elements have proper focus states and ARIA attributes
5. **Responsive Design**: Use spacing and typography tokens that scale appropriately
`;

  // Truncate if too large (keep under 100KB)
  const maxSize = 100 * 1024; // 100KB
  if (content.length > maxSize) {
    const truncated = content.substring(0, maxSize - 200);
    const lastNewline = truncated.lastIndexOf('\n');
    content = content.substring(0, lastNewline) + '\n\n*[Content truncated for size constraints]*\n';
  }

  return content;
}

/**
 * Format color token value for display in documentation
 * @param {Object} token - Color token object
 * @returns {string} - Formatted color value
 */
function formatColorForDisplay(token) {
  const value = token.value;
  
  if (typeof value === 'string' && value.startsWith('#')) {
    return value;
  }
  
  if (typeof value === 'object' && value.hex) {
    return value.hex;
  }
  
  // Fall back to CSS value
  return tokenToCssValue(token);
}





