/**
 * @chunk 4.12 - Figma Prompt Builder
 * 
 * Build AI prompts enhanced with Figma structure context.
 * Converts Figma component data into structured prompts for AI generation.
 */

import { formatTokensForPrompt } from './promptBuilder';

/**
 * Build Figma-enhanced prompt for AI component generation
 * @param {Object} params - Prompt parameters
 * @param {Object} params.component - Figma component data with structure, properties, bound_variables
 * @param {Object} params.themeTokens - Theme tokens grouped by category
 * @param {Array} params.images - Component images array
 * @returns {string} Complete prompt string with Figma context
 */
export function buildFigmaEnhancedPrompt({ component, themeTokens, images }) {
  const structureHints = convertStructureToHints(component.structure);
  const propsFromFigma = formatFigmaProperties(component.properties);
  const tokenMappings = mapBoundVariables(component.bound_variables || component.boundVariables, themeTokens);
  const imageReferences = formatImageReferences(images);

  return `You are a React component generator for a design system.

## Figma Component Context
Name: ${component.name || 'Unnamed Component'}
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

/**
 * Convert Figma structure to HTML-like hints
 * @param {Object} structure - Simplified node structure
 * @param {number} depth - Current depth in tree
 * @returns {string} HTML-like structure string
 */
function convertStructureToHints(structure, depth = 0) {
  if (!structure) return 'No structure available';
  
  const indent = '  '.repeat(depth);
  const tagName = nodeTypeToHtml(structure.type);
  
  let attrs = [];
  if (structure.layoutMode && structure.layoutMode !== 'NONE') {
    attrs.push(`layout="${structure.layoutMode}"`);
  }
  if (structure.gap !== undefined && structure.gap !== null) {
    attrs.push(`gap="${structure.gap}px"`);
  }
  if (structure.padding) {
    const { top, right, bottom, left } = structure.padding;
    if (top !== undefined || right !== undefined || bottom !== undefined || left !== undefined) {
      const topVal = top || 0;
      const rightVal = right || 0;
      const bottomVal = bottom || 0;
      const leftVal = left || 0;
      attrs.push(`padding="${topVal}/${rightVal}/${bottomVal}/${leftVal}"`);
    }
  }

  const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
  const nameAttr = structure.name ? ` name="${structure.name}"` : '';
  
  if (!structure.children?.length) {
    return `${indent}<${tagName}${nameAttr}${attrStr} />`;
  }
  
  const childrenStr = structure.children
    .map(child => convertStructureToHints(child, depth + 1))
    .join('\n');
  
  return `${indent}<${tagName}${nameAttr}${attrStr}>
${childrenStr}
${indent}</${tagName}>`;
}

/**
 * Map Figma node types to HTML-like tags
 * @param {string} type - Figma node type
 * @returns {string} HTML-like tag name
 */
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

/**
 * Format Figma properties for prompt
 * @param {Array} properties - Array of property objects
 * @returns {string|null} Formatted properties string or null
 */
function formatFigmaProperties(properties) {
  if (!properties?.length) return null;
  
  return properties.map(p => {
    let type = 'string';
    if (p.type === 'BOOLEAN') type = 'boolean';
    if (p.type === 'TEXT') type = 'string';
    if (p.type === 'VARIANT') {
      type = p.options?.length 
        ? `'${p.options.join("' | '")}'` 
        : 'string';
    }
    if (p.type === 'INSTANCE_SWAP') type = 'string';
    
    const defaultStr = p.defaultValue !== undefined && p.defaultValue !== null
      ? ` (default: ${JSON.stringify(p.defaultValue)})` 
      : '';
    
    return `- ${p.name}: ${type}${defaultStr}`;
  }).join('\n');
}

/**
 * Map bound variables to CSS variables
 * @param {Array} boundVars - Array of bound variable objects
 * @param {Object} themeTokens - Theme tokens grouped by category
 * @returns {string|null} Formatted token mappings or null
 */
function mapBoundVariables(boundVars, themeTokens) {
  if (!boundVars?.length) return null;
  
  // Flatten all tokens into a single array for searching
  const allTokens = Object.values(themeTokens || {}).flat();
  
  return boundVars.map(bv => {
    const variableName = bv.variableName || bv.variable_name || '';
    const nodePath = bv.nodePath || bv.node_path || 'root';
    const field = bv.field || '';
    
    // Try to find matching token by various strategies
    const token = findTokenByName(variableName, allTokens);
    
    const cssVar = token?.css_variable || 
      `--${variableName.toLowerCase().replace(/[\s\/]/g, '-').replace(/[^a-z0-9-]/g, '')}`;
    
    return `- ${nodePath}.${field} → ${cssVar}`;
  }).join('\n');
}

/**
 * Format image references for prompt
 * @param {Array} images - Array of image objects
 * @returns {string|null} Formatted image references or null
 */
function formatImageReferences(images) {
  if (!images?.length) return null;
  
  // Filter out preview images (they're just for UI, not component code)
  const nonPreviewImages = images.filter(i => {
    const nodeName = i.node_name || i.nodeName || '';
    return !nodeName.includes('_preview') && !nodeName.includes('preview');
  });
  
  if (!nonPreviewImages.length) return null;
  
  return nonPreviewImages
    .map(i => {
      const nodeName = i.node_name || i.nodeName || 'image';
      const nodeId = i.node_id || i.nodeId || '';
      const format = (i.format || 'png').toLowerCase();
      return `- ${nodeName}: /assets/${nodeId}.${format}`;
    })
    .join('\n');
}

/**
 * Find token by various matching strategies
 * @param {string} name - Variable name to search for
 * @param {Array} allTokens - Flat array of all tokens
 * @returns {Object|null} Matching token or null
 */
function findTokenByName(name, allTokens) {
  if (!name || !allTokens?.length) {
    if (!allTokens?.length) {
      console.warn('findTokenByName: No tokens provided for matching');
    }
    return null;
  }
  
  // Exact match
  let token = allTokens.find(t => t.name === name);
  if (token) return token;
  
  // Path ends with name
  token = allTokens.find(t => t.path && t.path.endsWith(name));
  if (token) return token;
  
  // Case-insensitive match
  const lowerName = name.toLowerCase();
  token = allTokens.find(t => {
    if (t.name) return t.name.toLowerCase() === lowerName;
    if (t.path) return t.path.toLowerCase().endsWith(lowerName);
    return false;
  });
  
  if (token) return token;
  
  // Partial match - name contains the variable name or vice versa
  token = allTokens.find(t => {
    if (t.name) {
      const tokenNameLower = t.name.toLowerCase();
      return tokenNameLower.includes(lowerName) || lowerName.includes(tokenNameLower);
    }
    if (t.path) {
      const tokenPathLower = t.path.toLowerCase();
      return tokenPathLower.includes(lowerName) || lowerName.includes(tokenPathLower);
    }
    return false;
  });
  
  return token || null;
}

export { findTokenByName };




