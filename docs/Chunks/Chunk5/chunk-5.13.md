# Chunk 5.13 — Project Knowledge Generator

## Purpose
Generate condensed text for Bolt/Lovable/other AI tools.

---

## Inputs
- Tokens and components

## Outputs
- Condensed project-knowledge.txt (~2KB)

---

## Dependencies
- Chunk 5.10 must be complete

---

## Implementation Notes

```javascript
// src/services/generators/projectKnowledgeGenerator.js
import { tokenToCssValue } from '../../lib/cssGenerator';

export function generateProjectKnowledge(themes, components, options = {}) {
  const { projectName = 'Design System' } = options;

  // Keep it very condensed for ~2KB target
  let content = `${projectName} Design System

TOKENS:
`;

  const theme = themes[0];
  
  // Most essential tokens only
  content += `Colors: `;
  const colors = theme?.tokens?.filter(t => t.category === 'color')?.slice(0, 8) || [];
  content += colors.map(t => t.css_variable).join(', ');
  content += '\n';

  content += `Spacing: `;
  const spacing = theme?.tokens?.filter(t => t.category === 'spacing') || [];
  content += spacing.map(t => `${t.css_variable}(${tokenToCssValue(t)})`).join(', ');
  content += '\n';

  content += `Radius: `;
  const radius = theme?.tokens?.filter(t => t.category === 'radius') || [];
  content += radius.map(t => `${t.css_variable}(${tokenToCssValue(t)})`).join(', ');
  content += '\n';

  content += `Shadows: `;
  const shadows = theme?.tokens?.filter(t => t.category === 'shadow')?.slice(0, 4) || [];
  content += shadows.map(t => t.css_variable).join(', ');
  content += '\n';

  // Quick start
  content += `
QUICK START:
Use CSS variables: color: var(--color-primary); padding: var(--space-md);

COMPONENTS:
`;

  for (const component of components.slice(0, 10)) {
    const props = component.props?.slice(0, 3).map(p => p.name).join(', ') || '';
    content += `- ${component.name}${props ? ` (${props})` : ''}\n`;
  }

  if (components.length > 10) {
    content += `...and ${components.length - 10} more\n`;
  }

  content += `
RULES:
- Always use CSS variables
- Follow spacing scale
- Include hover states
- Use semantic tokens
`;

  return content;
}
```

---

## Files Created
- `src/services/generators/projectKnowledgeGenerator.js` — Condensed knowledge

---

## Tests

### Unit Tests
- [ ] Output under 3KB
- [ ] Essential tokens included
- [ ] Components listed (max 10)
- [ ] Quick start included

---

## Time Estimate
1.5 hours
