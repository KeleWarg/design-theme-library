# Chunk 5.12 — Claude MD Generator

## Purpose
Generate CLAUDE.md and .claude/rules/tokens.md files.

---

## Inputs
- Tokens and components

## Outputs
- CLAUDE.md content
- tokens.md content

---

## Dependencies
- Chunk 5.10 must be complete

---

## Implementation Notes

```javascript
// src/services/generators/claudeMdGenerator.js
import { tokenToCssValue } from '../../lib/cssGenerator';

export function generateClaudeMd(themes, components, options = {}) {
  const { projectName = 'Design System' } = options;

  const claudeMd = `# ${projectName}

## Project Context

This project uses a custom design system with design tokens for consistent styling.

## Key Files

- \`.claude/rules/tokens.md\` - Design token reference
- \`LLMS.txt\` - Full documentation

## Design System Usage

### Styling Components

Always use CSS variables from the design system:

\`\`\`css
.component {
  color: var(--color-text);
  background: var(--color-background);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
\`\`\`

### Available Components

${components.slice(0, 15).map(c => `- **${c.name}**: ${c.description || c.category}`).join('\n')}

## Conventions

- Use TypeScript for all components
- Use CSS variables, never hardcoded colors
- Follow the spacing scale for consistent layouts
- Include hover/focus states for interactive elements
- Ensure accessibility (proper contrast, focus indicators)
`;

  return {
    'CLAUDE.md': claudeMd,
    '.claude/rules/tokens.md': generateTokensRule(themes),
  };
}

function generateTokensRule(themes) {
  let content = `# Design Tokens Reference

Use these CSS variables when styling components.

## Colors

`;

  const colorTokens = themes[0]?.tokens?.filter(t => t.category === 'color') || [];
  for (const token of colorTokens.slice(0, 20)) {
    content += `- \`${token.css_variable}\`\n`;
  }
  if (colorTokens.length > 20) {
    content += `\n*...and ${colorTokens.length - 20} more*\n`;
  }

  content += `\n## Spacing\n\n`;
  const spacingTokens = themes[0]?.tokens?.filter(t => t.category === 'spacing') || [];
  for (const token of spacingTokens) {
    content += `- \`${token.css_variable}\`: ${tokenToCssValue(token)}\n`;
  }

  content += `\n## Typography\n\n`;
  const typographyTokens = themes[0]?.tokens?.filter(t => t.category === 'typography') || [];
  for (const token of typographyTokens.slice(0, 15)) {
    content += `- \`${token.css_variable}\`\n`;
  }

  content += `\n## Radius\n\n`;
  const radiusTokens = themes[0]?.tokens?.filter(t => t.category === 'radius') || [];
  for (const token of radiusTokens) {
    content += `- \`${token.css_variable}\`: ${tokenToCssValue(token)}\n`;
  }

  content += `\n## Shadows\n\n`;
  const shadowTokens = themes[0]?.tokens?.filter(t => t.category === 'shadow') || [];
  for (const token of shadowTokens) {
    content += `- \`${token.css_variable}\`\n`;
  }

  return content;
}
```

---

## Files Created
- `src/services/generators/claudeMdGenerator.js` — Claude MD generation

---

## Tests

### Unit Tests
- [ ] CLAUDE.md has project context
- [ ] tokens.md has all categories
- [ ] Components listed (capped)
- [ ] Valid markdown

---

## Time Estimate
2 hours
