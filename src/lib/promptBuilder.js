/**
 * @chunk 3.11 - AI Service & Prompt Builder
 * 
 * Prompt construction utilities for AI component generation.
 * Builds prompts with theme tokens and design system context.
 */

import { tokenToCssValue } from './cssVariableInjector';

/**
 * Build component generation prompt
 * @param {Object} params - Generation parameters
 * @param {string} params.description - Component description
 * @param {string} params.category - Component category
 * @param {Array} params.linkedTokens - Array of linked token objects
 * @param {Object} params.themeTokens - Theme tokens grouped by category
 * @returns {string} Complete prompt string
 */
export function buildComponentPrompt({ description, category, linkedTokens, themeTokens }) {
  const tokenContext = formatTokensForPrompt(themeTokens, linkedTokens);
  
  return `You are a React component generator for a design system.

## Design System Context
You are generating a component for a design system with the following tokens available as CSS variables:

${tokenContext}

## Component Request
Category: ${category}
Description: ${description}

## Requirements
1. Generate a React functional component using JavaScript (JSX) — NO TypeScript
2. Use CSS variables from the design tokens (e.g., var(--color-primary))
3. Export the component as default
4. Do NOT include interfaces/types or any TypeScript annotations (no \`interface\`, no \`type\`, no \`:\` type syntax)
5. Include default prop values where appropriate
6. Use inline styles with CSS variables
7. The component should be self-contained in a single file

## DO's
- Use semantic CSS variable names
- Include hover/focus/active states where appropriate
- Add aria attributes for accessibility
- Use meaningful prop names

## DON'Ts
- Don't use external CSS files
- Don't use styled-components or emotion
- Don't include import statements for React (assume it's available)
- Don't hardcode colors or sizes - use CSS variables

Respond with ONLY the component code, no explanations.`;
}

/**
 * Build regeneration prompt with feedback
 * @param {Object} params - Regeneration parameters
 * @param {string} params.originalCode - Original component code
 * @param {string} params.feedback - User feedback
 * @param {string} params.description - Original description
 * @param {Object} params.themeTokens - Theme tokens grouped by category
 * @returns {string} Complete regeneration prompt
 */
export function buildRegenerationPrompt({ originalCode, feedback, description, themeTokens }) {
  const tokenContext = formatTokensForPrompt(themeTokens, []);
  
  return `You are a React component generator. Modify the following component based on the feedback.

## Original Component
\`\`\`jsx
${originalCode}
\`\`\`

## Original Description
${description}

## Feedback
${feedback}

## Available Tokens
${tokenContext}

Respond with ONLY the updated component code, no explanations.`;
}

/**
 * Format tokens for prompt context
 * @param {Object} themeTokens - Tokens grouped by category
 * @param {Array} linkedTokens - Array of linked token objects (optional)
 * @returns {string} Formatted token list string
 */
export function formatTokensForPrompt(themeTokens, linkedTokens) {
  let output = '';
  const categories = ['color', 'typography', 'spacing', 'shadow', 'radius'];
  
  // Build set of linked token paths for quick lookup
  const linkedPaths = new Set();
  if (linkedTokens && Array.isArray(linkedTokens)) {
    linkedTokens.forEach(t => {
      if (t.path) linkedPaths.add(t.path);
      if (t.id) linkedPaths.add(t.id); // Also check by ID
    });
  }
  
  for (const cat of categories) {
    const tokens = themeTokens[cat] || [];
    if (tokens.length === 0) continue;
    
    output += `\n### ${cat.toUpperCase()}\n`;
    tokens.slice(0, 20).forEach(t => {
      const isLinked = linkedPaths.has(t.path) || linkedPaths.has(t.id);
      const cssValue = tokenToCssValue(t);
      output += `${t.css_variable}: ${cssValue}${isLinked ? ' [USE THIS]' : ''}\n`;
    });
  }
  
  return output;
}

/**
 * Parse generated component from AI response
 * @param {string} content - Raw AI response content
 * @returns {Object} Parsed result with code and props
 */
export function parseGeneratedComponent(content) {
  // Extract code from markdown code blocks if present
  let code = content;
  const codeMatch = content.match(/```(?:jsx|tsx|javascript|typescript)?\n([\s\S]*?)\n```/);
  if (codeMatch) {
    code = codeMatch[1];
  }

  // Extract props (supports legacy TS interface and JS destructuring)
  const props = extractPropsFromCode(code);

  return { code, props };
}

/**
 * Extract props from component code
 * @param {string} code - Component code
 * @returns {Array} Array of prop objects
 */
function extractPropsFromCode(code) {
  const props = [];
  
  // Match interface or type definition
  const interfaceMatch = code.match(/(?:interface|type)\s+\w+Props\s*(?:=\s*)?\{([^}]+)\}/);
  if (interfaceMatch) {
    const propsBlock = interfaceMatch[1];
    const propLines = propsBlock.split('\n').filter(l => l.trim());
    
    for (const line of propLines) {
      const match = line.match(/(\w+)(\?)?:\s*([^;]+)/);
      if (match) {
        props.push({
          name: match[1],
          required: !match[2],
          type: match[3].trim(),
          description: ''
        });
      }
    }
  }
  
  // Fallback: infer props from function signature destructuring
  // Example: export default function Button({ children, disabled = false, onClick }) { ... }
  if (props.length === 0) {
    const fnMatch = code.match(/export\s+default\s+function\s+\w+\s*\(\s*\{([\s\S]*?)\}\s*\)/);
    if (fnMatch) {
      const inner = fnMatch[1]
        .replace(/\s+/g, ' ')
        .trim();
      const parts = inner
        .split(',')
        .map(p => p.trim())
        .filter(Boolean);

      for (const part of parts) {
        // Handle renames: foo: bar
        const renamed = part.match(/^(\w+)\s*:\s*(\w+)/);
        const assignment = part.match(/^(\w+)\s*=\s*(.+)$/);
        const name = (renamed?.[1] || assignment?.[1] || part).trim();
        if (!name) continue;

        props.push({
          name,
          required: !assignment, // if there is a default, treat as optional
          type: '',
          description: ''
        });
      }
    }
  }

  return props;
}





