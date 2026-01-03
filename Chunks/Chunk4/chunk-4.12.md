# Chunk 4.12 — Figma Prompt Builder

## Purpose
Build AI prompts enhanced with Figma structure context.

---

## Inputs
- AI service (from chunk 3.11)
- Figma component data

## Outputs
- Enhanced prompt builder

---

## Dependencies
- Chunk 3.11 must be complete
- Chunk 4.02 must be complete

---

## Implementation Notes

```javascript
// src/lib/figmaPromptBuilder.js
import { formatTokensForPrompt, tokenToCssValue } from './cssGenerator';

export function buildFigmaEnhancedPrompt({ component, themeTokens, images }) {
  const structureHints = convertStructureToHints(component.structure);
  const propsFromFigma = formatFigmaProperties(component.properties);
  const tokenMappings = mapBoundVariables(component.bound_variables, themeTokens);
  const imageReferences = formatImageReferences(images);

  return `You are a React component generator for a design system.

## Figma Component Context
Name: ${component.name}
Description: ${component.description || 'No description provided'}

### Structure Hints
The Figma component has this structure (use as layout guidance):
\`\`\`
${structureHints}
\`\`\`

### Properties from Figma
These properties were defined in Figma:
${propsFromFigma || 'No properties defined'}

### Token Bindings
These design tokens are used in the Figma component:
${tokenMappings || 'No token bindings found'}

${imageReferences ? `### Images
The following images are available for this component:
${imageReferences}
` : ''}

## Available Design Tokens
${formatTokensForPrompt(themeTokens, [])}

## Requirements
1. Generate a React functional component using TypeScript
2. Match the Figma structure as closely as possible
3. Use the exact CSS variables from token bindings
4. Include all properties as typed props
5. Export the component as default
6. Use inline styles with CSS variables

## Layout Guidelines
- Use flexbox (display: flex) for auto-layout frames
- HORIZONTAL auto-layout → flex-direction: row
- VERTICAL auto-layout → flex-direction: column
- Respect padding and gap values from structure hints

## DO's
- Use semantic CSS variable names from token bindings
- Include hover/focus/active states where appropriate
- Add aria attributes for accessibility
- Use meaningful prop names matching Figma properties

## DON'Ts
- Don't use external CSS files
- Don't use styled-components or emotion
- Don't include import statements for React
- Don't hardcode colors or sizes - use CSS variables

Respond with ONLY the component code, no explanations.`;
}

function convertStructureToHints(structure, depth = 0) {
  if (!structure) return 'No structure available';
  
  const indent = '  '.repeat(depth);
  const tagName = nodeTypeToHtml(structure.type);
  
  let attrs = [];
  if (structure.layoutMode) {
    attrs.push(`layout="${structure.layoutMode}"`);
  }
  if (structure.gap) {
    attrs.push(`gap="${structure.gap}px"`);
  }
  if (structure.padding) {
    const { top, right, bottom, left } = structure.padding;
    if (top || right || bottom || left) {
      attrs.push(`padding="${top}/${right}/${bottom}/${left}"`);
    }
  }

  const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
  
  if (!structure.children?.length) {
    return `${indent}<${tagName} name="${structure.name}"${attrStr} />`;
  }
  
  const childrenStr = structure.children
    .map(child => convertStructureToHints(child, depth + 1))
    .join('\n');
  
  return `${indent}<${tagName} name="${structure.name}"${attrStr}>
${childrenStr}
${indent}</${tagName}>`;
}

function nodeTypeToHtml(type) {
  const mapping = {
    FRAME: 'div',
    GROUP: 'div',
    TEXT: 'span',
    RECTANGLE: 'div',
    ELLIPSE: 'div',
    VECTOR: 'svg',
    INSTANCE: 'Component',
    COMPONENT: 'div',
    COMPONENT_SET: 'div',
  };
  return mapping[type] || 'div';
}

function formatFigmaProperties(properties) {
  if (!properties?.length) return null;
  
  return properties.map(p => {
    let type = 'string';
    if (p.type === 'BOOLEAN') type = 'boolean';
    if (p.type === 'VARIANT') type = p.options?.length 
      ? `'${p.options.join("' | '")}'` 
      : 'string';
    
    const defaultStr = p.defaultValue !== undefined 
      ? ` (default: ${JSON.stringify(p.defaultValue)})` 
      : '';
    
    return `- ${p.name}: ${type}${defaultStr}`;
  }).join('\n');
}

function mapBoundVariables(boundVars, themeTokens) {
  if (!boundVars?.length) return null;
  
  const allTokens = Object.values(themeTokens).flat();
  
  return boundVars.map(bv => {
    // Try to find matching token by name
    const token = allTokens.find(t => 
      t.name === bv.variableName || 
      t.path.endsWith(bv.variableName) ||
      t.name.toLowerCase() === bv.variableName.toLowerCase()
    );
    
    const cssVar = token?.css_variable || 
      `--${bv.variableName.toLowerCase().replace(/[\s\/]/g, '-')}`;
    
    return `- ${bv.nodePath}.${bv.field} → ${cssVar}`;
  }).join('\n');
}

function formatImageReferences(images) {
  if (!images?.length) return null;
  
  const nonPreviewImages = images.filter(i => !i.node_name?.includes('_preview'));
  if (!nonPreviewImages.length) return null;
  
  return nonPreviewImages
    .map(i => `- ${i.node_name}: /assets/${i.node_id}.${i.format.toLowerCase()}`)
    .join('\n');
}

// Helper to find token by various matching strategies
function findTokenByName(name, themeTokens) {
  const allTokens = Object.values(themeTokens).flat();
  
  // Exact match
  let token = allTokens.find(t => t.name === name);
  if (token) return token;
  
  // Path ends with name
  token = allTokens.find(t => t.path.endsWith(name));
  if (token) return token;
  
  // Case-insensitive match
  const lowerName = name.toLowerCase();
  token = allTokens.find(t => t.name.toLowerCase() === lowerName);
  
  return token;
}

export { findTokenByName };
```

---

## Files Created
- `src/lib/figmaPromptBuilder.js` — Figma-aware prompt builder

---

## Tests

### Unit Tests
- [ ] Structure converted to HTML hints correctly
- [ ] Layout attributes included (gap, padding)
- [ ] Properties mapped with correct types
- [ ] Bound variables find matching tokens
- [ ] Image references included (excluding previews)
- [ ] Missing data handled gracefully

---

## Time Estimate
3 hours
