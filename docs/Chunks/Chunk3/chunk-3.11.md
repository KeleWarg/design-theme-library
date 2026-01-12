# Chunk 3.11 — AI Service & Prompt Builder

## Purpose
Backend service for AI component generation.

---

## Inputs
- Component description
- Theme tokens
- Linked tokens

## Outputs
- Generated JSX code
- Extracted props

---

## Dependencies
- Chunk 1.08 must be complete

---

## Implementation Notes

### API Configuration
Model: `claude-sonnet-4-20250514`
Max tokens: 4096

```javascript
// src/services/aiService.js
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export const aiService = {
  async generateComponent({ description, category, linkedTokens, themeTokens }) {
    const prompt = buildComponentPrompt({
      description,
      category,
      linkedTokens,
      themeTokens
    });

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error('AI generation failed');
    }

    const data = await response.json();
    const content = data.content[0].text;

    return parseGeneratedComponent(content);
  },

  async regenerateWithFeedback({ originalCode, feedback, description, themeTokens }) {
    const prompt = buildRegenerationPrompt({
      originalCode,
      feedback,
      description,
      themeTokens
    });

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error('AI regeneration failed');
    }

    const data = await response.json();
    return parseGeneratedComponent(data.content[0].text);
  }
};
```

### Prompt Builder
```javascript
// src/lib/promptBuilder.js
import { tokenToCssValue } from './cssGenerator';

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
1. Generate a React functional component using TypeScript
2. Use CSS variables from the design tokens (e.g., var(--color-primary))
3. Export the component as default
4. Include TypeScript prop types
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

export function formatTokensForPrompt(themeTokens, linkedTokens) {
  let output = '';
  const categories = ['color', 'typography', 'spacing', 'shadow', 'radius'];
  
  for (const cat of categories) {
    const tokens = themeTokens[cat] || [];
    if (tokens.length === 0) continue;
    
    output += `\n### ${cat.toUpperCase()}\n`;
    tokens.slice(0, 20).forEach(t => {
      const isLinked = linkedTokens?.includes(t.path);
      output += `${t.css_variable}: ${tokenToCssValue(t)}${isLinked ? ' [USE THIS]' : ''}\n`;
    });
  }
  
  return output;
}

export function parseGeneratedComponent(content) {
  // Extract code from markdown code blocks if present
  let code = content;
  const codeMatch = content.match(/```(?:jsx|tsx|javascript|typescript)?\n([\s\S]*?)\n```/);
  if (codeMatch) {
    code = codeMatch[1];
  }

  // Extract props from TypeScript interface/type
  const props = extractPropsFromCode(code);

  return { code, props };
}

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
  
  return props;
}
```

---

## Files Created
- `src/services/aiService.js` — AI API service
- `src/lib/promptBuilder.js` — Prompt construction utilities

---

## Tests

### Unit Tests
- [ ] buildComponentPrompt generates valid prompt
- [ ] formatTokensForPrompt includes linked tokens
- [ ] parseGeneratedComponent extracts code
- [ ] extractPropsFromCode finds props
- [ ] API call structure is correct

### Integration Tests
- [ ] Full generation with real API
- [ ] Regeneration with feedback

---

## Time Estimate
4 hours

---

## Notes
API key should be stored in environment variable `VITE_CLAUDE_API_KEY`. In production, consider proxying through a backend to protect the API key.
