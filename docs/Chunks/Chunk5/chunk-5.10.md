# Chunk 5.10 — LLMS.txt Generator

## Purpose
Generate comprehensive LLMS.txt documentation file.

---

## Inputs
- Themes with tokens
- Components with examples

## Outputs
- LLMS.txt content string

---

## Dependencies
- Chunk 1.08 must be complete
- Chunk 1.10 must be complete

---

## Implementation Notes

```javascript
// src/services/generators/llmsTxtGenerator.js
import { tokenToCssValue } from '../../lib/cssGenerator';

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

## Typography

### Typeface Roles
`;

  // Typography roles table
  for (const theme of themes) {
    if (theme.typefaces?.length) {
      content += `\n#### ${theme.name}\n`;
      content += '| Role | Family | Weights |\n';
      content += '|------|--------|--------|\n';
      
      for (const tf of theme.typefaces) {
        const weights = tf.weights?.join(', ') || '400';
        content += `| ${tf.role} | ${tf.family} | ${weights} |\n`;
      }
    }
  }

  // Typography scale
  content += `\n### Typography Scale\n`;
  content += 'Use these CSS variables for consistent typography:\n\n';
  content += '```css\n';
  
  for (const theme of themes) {
    const typographyTokens = theme.tokens?.filter(t => t.category === 'typography') || [];
    for (const token of typographyTokens) {
      content += `${token.css_variable}: ${tokenToCssValue(token)};\n`;
    }
  }
  content += '```\n';

  // Colors
  content += `\n---\n\n## Colors\n\n`;
  
  for (const theme of themes) {
    content += `### ${theme.name}\n\n`;
    const colorTokens = theme.tokens?.filter(t => t.category === 'color') || [];
    
    if (colorTokens.length) {
      content += '| Token | Value | CSS Variable |\n';
      content += '|-------|-------|-------------|\n';
      
      for (const token of colorTokens.slice(0, 30)) {
        const value = token.value?.hex || tokenToCssValue(token);
        content += `| ${token.name} | ${value} | \`${token.css_variable}\` |\n`;
      }
      
      if (colorTokens.length > 30) {
        content += `\n*...and ${colorTokens.length - 30} more color tokens*\n`;
      }
      content += '\n';
    }
  }

  // Spacing
  content += `\n---\n\n## Spacing\n\n`;
  content += 'Use these spacing values for consistent layouts:\n\n';
  
  const spacingTokens = themes[0]?.tokens?.filter(t => t.category === 'spacing') || [];
  for (const token of spacingTokens) {
    content += `- \`${token.css_variable}\`: ${tokenToCssValue(token)}\n`;
  }

  // Radius
  content += `\n---\n\n## Border Radius\n\n`;
  const radiusTokens = themes[0]?.tokens?.filter(t => t.category === 'radius') || [];
  for (const token of radiusTokens) {
    content += `- \`${token.css_variable}\`: ${tokenToCssValue(token)}\n`;
  }

  // Shadows
  content += `\n---\n\n## Shadows\n\n`;
  const shadowTokens = themes[0]?.tokens?.filter(t => t.category === 'shadow') || [];
  for (const token of shadowTokens) {
    content += `- \`${token.css_variable}\`\n`;
  }

  // Components
  content += `\n---\n\n## Components\n\n`;
  
  for (const component of components) {
    content += `### ${component.name}\n\n`;
    content += `${component.description || 'No description.'}\n\n`;
    content += `**Category:** ${component.category}\n\n`;
    
    // Props table
    if (component.props?.length) {
      content += '**Props:**\n\n';
      content += '| Prop | Type | Default | Description |\n';
      content += '|------|------|---------|-------------|\n';
      
      for (const prop of component.props) {
        const defaultVal = prop.default !== undefined ? String(prop.default) : '-';
        content += `| ${prop.name} | ${prop.type} | ${defaultVal} | ${prop.description || '-'} |\n`;
      }
      content += '\n';
    }
    
    // Variants
    if (component.variants?.length) {
      content += '**Variants:**\n';
      for (const variant of component.variants) {
        content += `- ${variant.name}: ${variant.description || 'No description'}\n`;
      }
      content += '\n';
    }
    
    // Linked tokens
    if (component.linked_tokens?.length) {
      content += `**Linked Tokens:** ${component.linked_tokens.join(', ')}\n\n`;
    }
    
    // Examples
    if (component.component_examples?.length) {
      content += '**Examples:**\n\n';
      for (const example of component.component_examples) {
        content += `#### ${example.title}\n`;
        if (example.description) content += `${example.description}\n\n`;
        content += '```jsx\n';
        content += example.code;
        content += '\n```\n\n';
      }
    }
    
    content += '---\n\n';
  }

  // Usage guidelines
  content += `## Usage Guidelines

### DO's
- Use design tokens instead of hardcoded values
- Maintain consistent spacing using spacing tokens
- Use semantic color tokens (e.g., --color-primary) over raw colors
- Follow the typography scale for text sizing
- Include hover/focus states for interactive elements

### DON'Ts
- Don't hardcode colors, use CSS variables
- Don't create custom spacing values outside the scale
- Don't mix font families without purpose
- Don't ignore accessibility requirements
`;

  return content;
}
```

---

## Files Created
- `src/services/generators/llmsTxtGenerator.js` — LLMS.txt generation

---

## Tests

### Unit Tests
- [ ] Includes all sections
- [ ] Typography formatted correctly
- [ ] Colors in table format (capped at 30)
- [ ] Components with props/variants/examples
- [ ] Guidelines included

---

## Time Estimate
3 hours
