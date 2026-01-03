# Chunk 5.05 — CSS Generator

## Purpose
Generate CSS with custom properties from tokens.

---

## Inputs
- Theme tokens

## Outputs
- CSS string with :root variables

---

## Dependencies
- Chunk 1.08 must be complete

---

## Implementation Notes

```javascript
// src/services/generators/cssGenerator.js
import { tokenToCssValue } from '../../lib/cssGenerator';

export function generateCSS(tokens, options = {}) {
  const {
    selector = ':root',
    minify = false,
    includeComments = true,
    scope = null, // e.g., '[data-theme="dark"]'
  } = options;

  const actualSelector = scope || selector;
  const grouped = groupTokensByCategory(tokens);
  
  let css = `${actualSelector} {\n`;

  for (const [category, categoryTokens] of Object.entries(grouped)) {
    if (includeComments && !minify) {
      css += `  /* ${category} */\n`;
    }

    for (const token of categoryTokens) {
      const value = tokenToCssValue(token);
      const line = `  ${token.css_variable}: ${value};`;
      css += minify ? line.trim() : line + '\n';
    }

    if (!minify) css += '\n';
  }

  css += '}\n';

  if (minify) {
    css = css.replace(/\s+/g, ' ').replace(/\s*([{};:])\s*/g, '$1');
  }

  return css;
}

export function generateCSSWithFontFace(tokens, typefaces, options = {}) {
  let css = '';

  // Add @font-face declarations first
  if (typefaces?.length) {
    css += generateFontFaceCss(typefaces, options);
    css += '\n';
  }

  // Add token variables
  css += generateCSS(tokens, options);

  return css;
}

export function generateMultiThemeCSS(themes, options = {}) {
  let css = '';
  
  for (const theme of themes) {
    const selector = theme.is_default 
      ? ':root' 
      : `[data-theme="${theme.slug}"]`;
    
    css += generateCSS(theme.tokens || [], { ...options, selector });
    css += '\n';
  }
  
  return css;
}

function groupTokensByCategory(tokens) {
  const grouped = {};
  const order = ['color', 'typography', 'spacing', 'shadow', 'radius', 'grid', 'other'];
  
  for (const token of tokens) {
    const cat = token.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(token);
  }

  // Return in consistent order
  const result = {};
  for (const cat of order) {
    if (grouped[cat]) result[cat] = grouped[cat];
  }
  // Add any remaining categories
  for (const cat of Object.keys(grouped)) {
    if (!result[cat]) result[cat] = grouped[cat];
  }
  return result;
}
```

---

## Files Created
- `src/services/generators/cssGenerator.js` — CSS generation

---

## Tests

### Unit Tests
- [ ] Generates valid CSS
- [ ] Categories commented
- [ ] Minify removes whitespace
- [ ] Custom selector works
- [ ] Scope attribute works
- [ ] Multi-theme generation works

---

## Time Estimate
2 hours
