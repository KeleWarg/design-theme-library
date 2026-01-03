# Chunk 5.08 — SCSS Generator

## Purpose
Generate SCSS variables file.

---

## Inputs
- Theme tokens

## Outputs
- SCSS variables string

---

## Dependencies
- Chunk 1.08 must be complete

---

## Implementation Notes

```javascript
// src/services/generators/scssGenerator.js
import { tokenToCssValue } from '../../lib/cssGenerator';

export function generateSCSS(tokens, options = {}) {
  const {
    useMaps = false,
    prefix = '',
  } = options;

  if (useMaps) {
    return generateSCSSMaps(tokens, prefix);
  }

  return generateSCSSFlat(tokens, prefix);
}

function generateSCSSFlat(tokens, prefix) {
  const grouped = groupTokensByCategory(tokens);
  let scss = '// Generated SCSS Variables\n\n';

  for (const [category, categoryTokens] of Object.entries(grouped)) {
    scss += `// ${category}\n`;
    
    for (const token of categoryTokens) {
      const name = tokenNameToScss(token.name, prefix);
      const value = tokenToScssValue(token);
      scss += `$${name}: ${value};\n`;
    }
    
    scss += '\n';
  }

  return scss;
}

function generateSCSSMaps(tokens, prefix) {
  const grouped = groupTokensByCategory(tokens);
  let scss = '// Generated SCSS Maps\n\n';

  for (const [category, categoryTokens] of Object.entries(grouped)) {
    const mapName = prefix ? `${prefix}-${category}` : category;
    scss += `$${mapName}: (\n`;
    
    for (const token of categoryTokens) {
      const name = tokenNameToScss(token.name, '');
      const value = tokenToScssValue(token);
      scss += `  '${name}': ${value},\n`;
    }
    
    scss += ');\n\n';
  }

  // Add utility function
  scss += `// Utility function to get values
@function get-token($map, $key) {
  @if map-has-key($map, $key) {
    @return map-get($map, $key);
  }
  @warn "Token '#{$key}' not found in map.";
  @return null;
}

// Usage example:
// color: get-token($color, 'primary');
`;

  return scss;
}

function tokenNameToScss(name, prefix) {
  let result = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  return prefix ? `${prefix}-${result}` : result;
}

function tokenToScssValue(token) {
  return tokenToCssValue(token);
}

function groupTokensByCategory(tokens) {
  const grouped = {};
  const order = ['color', 'typography', 'spacing', 'shadow', 'radius'];
  
  for (const token of tokens) {
    const cat = token.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(token);
  }

  const result = {};
  for (const cat of order) {
    if (grouped[cat]) result[cat] = grouped[cat];
  }
  for (const cat of Object.keys(grouped)) {
    if (!result[cat]) result[cat] = grouped[cat];
  }
  return result;
}
```

---

## Files Created
- `src/services/generators/scssGenerator.js` — SCSS generation

---

## Tests

### Unit Tests
- [ ] Flat variables work
- [ ] Maps format works
- [ ] Utility function included for maps
- [ ] Values formatted correctly

---

## Time Estimate
1.5 hours
