# Chunk 5.07 — Tailwind Generator

## Purpose
Generate Tailwind config extend object.

---

## Inputs
- Theme tokens

## Outputs
- tailwind.config.js content

---

## Dependencies
- Chunk 1.08 must be complete

---

## Implementation Notes

```javascript
// src/services/generators/tailwindGenerator.js
import { tokenToCssValue } from '../../lib/cssGenerator';

export function generateTailwind(tokens, options = {}) {
  const {
    useCSSVariables = true,
    prefix = '',
  } = options;

  const theme = {
    colors: {},
    spacing: {},
    fontSize: {},
    fontWeight: {},
    fontFamily: {},
    borderRadius: {},
    boxShadow: {},
    screens: {},
  };

  for (const token of tokens) {
    const name = tokenNameToTailwind(token.name, prefix);
    const value = useCSSVariables 
      ? `var(${token.css_variable})`
      : tokenToCssValue(token);

    switch (token.category) {
      case 'color':
        setNestedValue(theme.colors, name, value);
        break;
      case 'spacing':
        theme.spacing[name] = value;
        break;
      case 'typography':
        if (token.path.includes('size') || token.type === 'dimension') {
          theme.fontSize[name] = value;
        } else if (token.path.includes('weight')) {
          theme.fontWeight[name] = value;
        } else if (token.path.includes('family')) {
          theme.fontFamily[name] = [value];
        }
        break;
      case 'radius':
        theme.borderRadius[name] = value;
        break;
      case 'shadow':
        theme.boxShadow[name] = value;
        break;
      case 'grid':
        if (token.path.includes('breakpoint')) {
          theme.screens[name] = value;
        }
        break;
    }
  }

  // Clean up empty objects
  for (const key of Object.keys(theme)) {
    if (Object.keys(theme[key]).length === 0) {
      delete theme[key];
    }
  }

  // Generate config file
  const themeStr = JSON.stringify(theme, null, 6)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, "'");

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: ${themeStr}
  }
}`;
}

function tokenNameToTailwind(name, prefix) {
  let result = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  if (prefix) {
    result = `${prefix}-${result}`;
  }
  
  return result;
}

function setNestedValue(obj, path, value) {
  // Handle nested color names like "primary-500"
  const parts = path.split('-');
  if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) {
    const colorName = parts.slice(0, -1).join('-');
    const shade = parts[parts.length - 1];
    if (!obj[colorName]) obj[colorName] = {};
    obj[colorName][shade] = value;
  } else {
    obj[path] = value;
  }
}
```

---

## Files Created
- `src/services/generators/tailwindGenerator.js` — Tailwind generation

---

## Tests

### Unit Tests
- [ ] Colors mapped correctly
- [ ] Nested color shades work
- [ ] Spacing mapped correctly
- [ ] Typography split correctly
- [ ] CSS variables used when option set
- [ ] Output is valid JS

---

## Time Estimate
2 hours
