/**
 * @chunk 5.13 - Project Knowledge Generator
 * 
 * Generates condensed project-knowledge.txt for AI tools like Bolt/Lovable/Claude Projects.
 * Format optimized for Claude Projects "Project Knowledge" feature.
 * Target size: ~2KB
 */

import { tokenToCssValue } from '../../lib/cssVariableInjector.js';

/**
 * Generate project knowledge text content
 * @param {Array} themes - Array of theme objects with tokens
 * @param {Array} components - Array of component objects
 * @param {Object} options - Generation options
 * @param {string} options.projectName - Project name (default: 'Design System')
 * @param {string} options.version - Version string (default: '1.0.0')
 * @returns {string} - Project knowledge text content
 */
export function generateProjectKnowledge(themes, components, options = {}) {
  const {
    projectName = 'Design System',
    version = '1.0.0',
  } = options;

  const defaultTheme = themes?.find(t => t.is_default) || themes?.[0];
  const tokens = defaultTheme?.tokens || [];
  const publishedComponents = (components || []).filter(c => c.status === 'published');

  const generatedDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  let content = `DESIGN SYSTEM KNOWLEDGE

PROJECT: ${projectName}
VERSION: ${version}
GENERATED: ${generatedDate}

=== DESIGN TOKENS ===

`;

  // COLORS section
  content += `COLORS:
`;
  const colorTokens = tokens.filter(t => t.category === 'color');
  if (colorTokens.length > 0) {
    // Show top 12 most essential colors
    const displayColors = colorTokens.slice(0, 12);
    for (const token of displayColors) {
      const value = formatColorForDisplay(token);
      const varName = token.css_variable || token.name || '-';
      const name = extractTokenName(varName);
      content += `${name}: ${value} (${varName})
`;
    }
    if (colorTokens.length > 12) {
      content += `...and ${colorTokens.length - 12} more color tokens
`;
    }
  } else {
    content += `No color tokens defined.
`;
  }

  content += `
SPACING:
`;
  const spacingTokens = tokens.filter(t => t.category === 'spacing');
  if (spacingTokens.length > 0) {
    // Show all spacing tokens (usually not too many)
    for (const token of spacingTokens) {
      const value = tokenToCssValue(token);
      const varName = token.css_variable || token.name || '-';
      const name = extractTokenName(varName);
      content += `${name}: ${value} (${varName})
`;
    }
  } else {
    content += `No spacing tokens defined.
`;
  }

  content += `
RADIUS:
`;
  const radiusTokens = tokens.filter(t => t.category === 'radius');
  if (radiusTokens.length > 0) {
    for (const token of radiusTokens) {
      const value = tokenToCssValue(token);
      const varName = token.css_variable || token.name || '-';
      const name = extractTokenName(varName);
      content += `${name}: ${value} (${varName})
`;
    }
  } else {
    content += `No radius tokens defined.
`;
  }

  content += `
SHADOWS:
`;
  const shadowTokens = tokens.filter(t => t.category === 'shadow');
  if (shadowTokens.length > 0) {
    // Show top 6 shadows
    const displayShadows = shadowTokens.slice(0, 6);
    for (const token of displayShadows) {
      const varName = token.css_variable || token.name || '-';
      const name = extractTokenName(varName);
      content += `${name}: ${varName}
`;
    }
    if (shadowTokens.length > 6) {
      content += `...and ${shadowTokens.length - 6} more shadow tokens
`;
    }
  } else {
    content += `No shadow tokens defined.
`;
  }

  // TYPOGRAPHY section (if tokens exist)
  const typographyTokens = tokens.filter(t => t.category === 'typography');
  if (typographyTokens.length > 0) {
    content += `
TYPOGRAPHY:
`;
    // Show top 8 typography tokens
    const displayTypography = typographyTokens.slice(0, 8);
    for (const token of displayTypography) {
      const value = tokenToCssValue(token);
      const varName = token.css_variable || token.name || '-';
      const name = extractTokenName(varName);
      content += `${name}: ${value} (${varName})
`;
    }
    if (typographyTokens.length > 8) {
      content += `...and ${typographyTokens.length - 8} more typography tokens
`;
    }
  }

  // COMPONENTS section
  content += `
=== COMPONENTS ===

`;

  if (publishedComponents.length === 0) {
    content += `No published components available.

`;
  } else {
    // Show top 10 components
    const displayComponents = publishedComponents.slice(0, 10);
    
    for (const component of displayComponents) {
      content += `${component.name.toUpperCase()}
`;
      
      if (component.category) {
        content += `- Category: ${component.category}
`;
      }
      
      // Variants
      if (component.variants && component.variants.length > 0) {
        const variantNames = component.variants.map(v => v.name).join(', ');
        content += `- Variants: ${variantNames}
`;
      }
      
      // Sizes (if variants have size info)
      const sizeVariants = component.variants?.filter(v => 
        v.name && ['sm', 'md', 'lg', 'xl'].includes(v.name.toLowerCase())
      );
      if (sizeVariants && sizeVariants.length > 0) {
        const sizes = sizeVariants.map(v => v.name).join(', ');
        content += `- Sizes: ${sizes}
`;
      }
      
      // Props (top 5 most important)
      if (component.props && component.props.length > 0) {
        const topProps = component.props.slice(0, 5).map(p => p.name).join(', ');
        content += `- Props: ${topProps}
`;
      }
      
      // Example usage
      const exampleCode = generateComponentExample(component);
      if (exampleCode) {
        content += `- Example: ${exampleCode}
`;
      }
      
      content += `
`;
    }
    
    if (publishedComponents.length > 10) {
      content += `...and ${publishedComponents.length - 10} more components

`;
    }
  }

  // USAGE RULES section
  content += `=== USAGE RULES ===
1. Always use CSS variables, never hardcode values
   Example: color: var(--color-primary-500), not color: #3b82f6
2. Use existing components, don't recreate
   Check the components list above before building new UI elements
3. Follow naming conventions
   Use semantic token names (--color-primary) over specific values
4. Maintain spacing consistency
   Use spacing tokens (--space-sm, --space-md, --space-lg) for all padding/margins
5. Include interactive states
   Add hover, focus, and active states for all interactive elements
6. Use semantic tokens
   Prefer --color-primary over --color-blue-500 when possible
7. Follow typography scale
   Use typography tokens for font sizes, line heights, and font weights
`;

  // Enforce ~2KB limit (with some buffer)
  const maxSize = 2.5 * 1024; // 2.5KB to allow some flexibility
  if (content.length > maxSize) {
    // Truncate at a reasonable point
    const truncated = content.substring(0, maxSize - 200);
    const lastNewline = truncated.lastIndexOf('\n');
    content = content.substring(0, lastNewline) + '\n\n[Content truncated for size constraints]';
  }

  return content;
}

/**
 * Format color token value for display
 * @param {Object} token - Color token object
 * @returns {string} - Formatted color value (hex preferred)
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

/**
 * Extract readable name from CSS variable
 * Example: --color-primary-500 -> Primary 500
 * Example: --space-md -> Medium
 * @param {string} varName - CSS variable name
 * @returns {string} - Readable name
 */
function extractTokenName(varName) {
  if (!varName) return 'Unknown';
  
  // Remove -- prefix
  let name = varName.replace(/^--/, '');
  
  // Split by - and capitalize words
  const parts = name.split('-');
  
  // Handle common patterns
  if (parts[0] === 'color') {
    // --color-primary-500 -> Primary 500
    const colorName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : '';
    const shade = parts[2] || '';
    return shade ? `${colorName} ${shade}` : colorName;
  }
  
  if (parts[0] === 'space' || parts[0] === 'spacing') {
    // --space-md -> Medium
    const size = parts[1] || '';
    const sizeMap = {
      'xs': 'Extra Small',
      'sm': 'Small',
      'md': 'Medium',
      'lg': 'Large',
      'xl': 'Extra Large',
      '2xl': '2X Large',
      '3xl': '3X Large',
    };
    return sizeMap[size] || size.charAt(0).toUpperCase() + size.slice(1);
  }
  
  if (parts[0] === 'radius') {
    // --radius-sm -> Small
    const size = parts[1] || '';
    const sizeMap = {
      'sm': 'Small',
      'md': 'Medium',
      'lg': 'Large',
      'xl': 'Extra Large',
      'full': 'Full',
    };
    return sizeMap[size] || size.charAt(0).toUpperCase() + size.slice(1);
  }
  
  // Generic: capitalize first letter of each part
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

/**
 * Generate a simple example usage for a component
 * @param {Object} component - Component object
 * @returns {string} - Example code snippet or empty string
 */
function generateComponentExample(component) {
  if (!component.name) return '';
  
  const componentName = component.name;
  const props = component.props || [];
  
  // Build example props
  const exampleProps = [];
  
  // Add variant if exists
  const variantProp = props.find(p => p.name === 'variant');
  if (variantProp && component.variants && component.variants.length > 0) {
    const firstVariant = component.variants[0].name;
    exampleProps.push(`variant="${firstVariant}"`);
  }
  
  // Add size if exists
  const sizeProp = props.find(p => p.name === 'size');
  if (sizeProp) {
    exampleProps.push('size="md"');
  }
  
  // Add children if it's a common pattern
  const hasChildren = props.some(p => p.name === 'children');
  
  const propsStr = exampleProps.length > 0 ? ` ${exampleProps.join(' ')}` : '';
  const children = hasChildren ? 'Click' : '';
  const closing = hasChildren ? `</${componentName}>` : ' />';
  
  return `<${componentName}${propsStr}>${children}${closing}`;
}

