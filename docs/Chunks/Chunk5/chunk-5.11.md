# Chunk 5.11 — Cursor Rules Generator

## Purpose
Generate .cursor/rules/design-system.mdc file.

---

## Inputs
- Tokens and components

## Outputs
- Cursor rules MDC file

---

## Dependencies
- Chunk 5.10 must be complete

---

## Implementation Notes

```javascript
// src/services/generators/cursorRulesGenerator.js
import { tokenToCssValue } from '../../lib/cssGenerator';

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

  // Condensed color tokens (keep under 3KB total)
  const colorTokens = themes[0]?.tokens?.filter(t => t.category === 'color')?.slice(0, 15) || [];
  for (const token of colorTokens) {
    content += `- \`${token.css_variable}\`: ${token.name}\n`;
  }

  content += `\n### Spacing\n`;
  const spacingTokens = themes[0]?.tokens?.filter(t => t.category === 'spacing') || [];
  for (const token of spacingTokens) {
    content += `- \`${token.css_variable}\`: ${tokenToCssValue(token)}\n`;
  }

  content += `\n### Typography\n`;
  const typographyTokens = themes[0]?.tokens?.filter(t => t.category === 'typography')?.slice(0, 10) || [];
  for (const token of typographyTokens) {
    content += `- \`${token.css_variable}\`\n`;
  }

  content += `\n### Radius\n`;
  const radiusTokens = themes[0]?.tokens?.filter(t => t.category === 'radius') || [];
  for (const token of radiusTokens) {
    content += `- \`${token.css_variable}\`: ${tokenToCssValue(token)}\n`;
  }

  content += `\n### Shadows\n`;
  const shadowTokens = themes[0]?.tokens?.filter(t => t.category === 'shadow')?.slice(0, 5) || [];
  for (const token of shadowTokens) {
    content += `- \`${token.css_variable}\`\n`;
  }

  // Components summary
  content += `\n## Components\n\n`;
  for (const component of components.slice(0, 10)) {
    content += `### ${component.name}\n`;
    if (component.description) {
      content += `${component.description.substring(0, 100)}\n`;
    }
    if (component.props?.length) {
      content += `Props: ${component.props.map(p => p.name).join(', ')}\n`;
    }
    content += '\n';
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

  return content;
}
```

---

## Files Created
- `src/services/generators/cursorRulesGenerator.js` — Cursor rules generation

---

## Tests

### Unit Tests
- [ ] YAML frontmatter valid
- [ ] Globs included
- [ ] Tokens condensed (under 3KB)
- [ ] Components listed (max 10)
- [ ] Patterns section included

---

## Time Estimate
2 hours
