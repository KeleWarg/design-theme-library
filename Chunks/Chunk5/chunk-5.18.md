# Chunk 5.18 — Claude Skill Generator

## Purpose
Generate Claude.ai Project skill package.

---

## Inputs
- Tokens and components

## Outputs
- skill/ folder with SKILL.md and data files

---

## Dependencies
- Chunk 5.10 must be complete

---

## Implementation Notes

```javascript
// src/services/generators/claudeSkillGenerator.js

export function generateClaudeSkill(themes, components, options = {}) {
  const { projectName = 'Design System' } = options;
  const skillSlug = projectName.toLowerCase().replace(/\s+/g, '-');

  const skillMd = `---
name: ${skillSlug}-tokens
description: Design tokens and component reference for ${projectName}
---

# ${projectName} Design System Skill

This skill provides design tokens and component specifications for the ${projectName}.

## Usage

When the user asks to create UI components or style elements:

1. Reference tokens from \`tokens.json\` for colors, spacing, typography
2. Reference components from \`components.json\` for existing patterns
3. Always use CSS variables (e.g., \`var(--color-primary)\`)

## Files

- \`tokens.json\` - All design tokens with CSS variable names
- \`components.json\` - Component specifications with props and examples

## Quick Reference

### Essential Color Tokens
${formatTokenList(themes[0]?.tokens?.filter(t => t.category === 'color')?.slice(0, 8))}

### Spacing Scale
${formatTokenList(themes[0]?.tokens?.filter(t => t.category === 'spacing'))}

### Border Radius
${formatTokenList(themes[0]?.tokens?.filter(t => t.category === 'radius'))}

### Shadows
${formatTokenList(themes[0]?.tokens?.filter(t => t.category === 'shadow')?.slice(0, 4))}

## Component Categories

${[...new Set(components.map(c => c.category))].map(cat => `- **${cat}**: ${components.filter(c => c.category === cat).map(c => c.name).join(', ')}`).join('\n')}

## Styling Guidelines

- Always use CSS variables from tokens.json
- Use spacing tokens for consistent margins/padding
- Reference existing components before creating new ones
- Include hover/focus states for interactive elements
`;

  const tokensJson = {
    designSystem: projectName,
    generatedAt: new Date().toISOString(),
    themes: themes.map(t => ({
      name: t.name,
      slug: t.slug,
      isDefault: t.is_default,
    })),
    tokens: themes.flatMap(theme =>
      (theme.tokens || []).map(t => ({
        theme: theme.name,
        path: t.path,
        name: t.name,
        category: t.category,
        type: t.type,
        cssVariable: t.css_variable,
        value: t.value,
      }))
    ),
  };

  const componentsJson = {
    designSystem: projectName,
    generatedAt: new Date().toISOString(),
    components: components.map(c => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
      category: c.category,
      props: c.props?.map(p => ({
        name: p.name,
        type: p.type,
        required: p.required,
        default: p.default,
        description: p.description,
      })),
      variants: c.variants?.map(v => ({
        name: v.name,
        description: v.description,
      })),
      linkedTokens: c.linked_tokens,
      examples: c.component_examples?.map(ex => ({
        title: ex.title,
        description: ex.description,
        code: ex.code,
      })),
    })),
  };

  return {
    'SKILL.md': skillMd,
    'tokens.json': JSON.stringify(tokensJson, null, 2),
    'components.json': JSON.stringify(componentsJson, null, 2),
  };
}

function formatTokenList(tokens) {
  if (!tokens?.length) return '*No tokens*';
  return tokens.map(t => `- \`${t.css_variable}\``).join('\n');
}
```

---

## Files Created
- `src/services/generators/claudeSkillGenerator.js` — Claude skill generator

---

## Tests

### Unit Tests
- [ ] SKILL.md has valid frontmatter
- [ ] tokens.json has all tokens with themes
- [ ] components.json has all components
- [ ] Quick reference section populated

---

## Time Estimate
2 hours
