/**
 * @chunk 5.18 - Claude Skill Generator
 * 
 * Generate Claude.ai Project skill package.
 * Creates SKILL.md and supporting JSON files for design system reference.
 */

/**
 * Generate Claude Skill package from themes and components
 * @param {Array} themes - Array of theme objects with tokens
 * @param {Array} components - Array of component objects
 * @param {Object} options - Generation options
 * @param {string} options.projectName - Project name (default: 'Design System')
 * @returns {Object} - Object mapping file paths to content strings
 */
export function generateClaudeSkill(themes, components, options = {}) {
  const { projectName = 'Design System' } = options;
  const skillSlug = projectName.toLowerCase().replace(/\s+/g, '-');

  const skillMd = generateSkillMarkdown(themes, components, projectName, skillSlug);
  const tokensJson = generateTokensJson(themes, projectName);
  const componentsJson = generateComponentsJson(components, projectName);

  return {
    'SKILL.md': skillMd,
    'tokens.json': JSON.stringify(tokensJson, null, 2),
    'components.json': JSON.stringify(componentsJson, null, 2),
  };
}

/**
 * Generate SKILL.md markdown content
 * @param {Array} themes - Array of theme objects
 * @param {Array} components - Array of component objects
 * @param {string} projectName - Project name
 * @param {string} skillSlug - Skill slug for frontmatter
 * @returns {string} - SKILL.md content
 */
function generateSkillMarkdown(themes, components, projectName, skillSlug) {
  const defaultTheme = themes?.find(t => t.is_default) || themes?.[0];
  const tokens = defaultTheme?.tokens || [];
  const publishedComponents = (components || []).filter(c => c.status === 'published');

  let content = `---
name: ${skillSlug}-tokens
description: Design tokens and component reference for ${projectName}
---

# ${projectName} Design System Skill

## Description
This skill provides access to the ${projectName} design system. Use this reference when creating UI components or styling elements to ensure consistency with the design system.

## Capabilities
- Look up design tokens (colors, spacing, typography, shadows, radius)
- Reference component documentation and specifications
- Get component code examples and usage patterns
- Access token values via CSS variables

## Usage
When asked about styling or components, use this design system reference:
1. Reference tokens from \`tokens.json\` for colors, spacing, typography
2. Reference components from \`components.json\` for existing patterns
3. Always use CSS variables (e.g., \`var(--color-primary)\`) instead of hardcoded values

## Files
- \`tokens.json\` - All design tokens with CSS variable names and values
- \`components.json\` - Component specifications with props, variants, and examples

`;

  // Token Reference section
  content += `## Token Reference

### Essential Color Tokens
${formatTokenList(tokens.filter(t => t.category === 'color').slice(0, 8))}

### Spacing Scale
${formatTokenList(tokens.filter(t => t.category === 'spacing'))}

### Border Radius
${formatTokenList(tokens.filter(t => t.category === 'radius'))}

### Shadows
${formatTokenList(tokens.filter(t => t.category === 'shadow').slice(0, 4))}

### Typography
${formatTokenList(tokens.filter(t => t.category === 'typography').slice(0, 8))}

`;

  // Component Reference section
  content += `## Component Reference

`;

  if (publishedComponents.length === 0) {
    content += `No published components available.\n\n`;
  } else {
    const categories = [...new Set(publishedComponents.map(c => c.category).filter(Boolean))];
    
    for (const category of categories) {
      const categoryComponents = publishedComponents.filter(c => c.category === category);
      if (categoryComponents.length > 0) {
        content += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
        content += categoryComponents.map(c => `- **${c.name}**: ${c.description || 'No description'}`).join('\n');
        content += '\n\n';
      }
    }
    
    // Also include components without category
    const uncategorizedComponents = publishedComponents.filter(c => !c.category);
    if (uncategorizedComponents.length > 0) {
      content += `### Other\n\n`;
      content += uncategorizedComponents.map(c => `- **${c.name}**: ${c.description || 'No description'}`).join('\n');
      content += '\n\n';
    }
  }

  // Styling Guidelines section
  content += `## Styling Guidelines

- Always use CSS variables from tokens.json
- Use spacing tokens for consistent margins/padding
- Reference existing components before creating new ones
- Include hover/focus states for interactive elements
- Follow the typography scale for text sizing
- Use semantic color tokens over raw color values

`;

  return content;
}

/**
 * Generate tokens JSON data
 * @param {Array} themes - Array of theme objects
 * @param {string} projectName - Project name
 * @returns {Object} - Tokens JSON object
 */
function generateTokensJson(themes, projectName) {
  return {
    designSystem: projectName,
    generatedAt: new Date().toISOString(),
    themes: themes.map(t => ({
      name: t.name,
      slug: t.slug,
      isDefault: t.is_default || false,
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
}

/**
 * Generate components JSON data
 * @param {Array} components - Array of component objects
 * @param {string} projectName - Project name
 * @returns {Object} - Components JSON object
 */
function generateComponentsJson(components, projectName) {
  return {
    designSystem: projectName,
    generatedAt: new Date().toISOString(),
    components: (components || []).map(c => ({
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
      })) || [],
      variants: c.variants?.map(v => ({
        name: v.name,
        description: v.description,
      })) || [],
      linkedTokens: c.linked_tokens || [],
      examples: c.component_examples?.map(ex => ({
        title: ex.title,
        description: ex.description,
        code: ex.code,
      })) || [],
    })),
  };
}

/**
 * Format token list for markdown display
 * @param {Array} tokens - Array of token objects
 * @returns {string} - Formatted markdown list
 */
function formatTokenList(tokens) {
  if (!tokens?.length) return '*No tokens*';
  return tokens.map(t => `- \`${t.css_variable || t.name}\``).join('\n');
}





