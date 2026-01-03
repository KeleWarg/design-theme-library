# Chunk 1.12 — Token Parser (Port)

## Purpose
Port existing token parser for Figma Variables JSON format.

---

## Inputs
- Existing tokenParser.js (from current prototype)
- Sample Figma Variables JSON

## Outputs
- tokenParser module (consumed by chunk 2.08)

---

## Dependencies
- None (can run parallel)

---

## Implementation Notes

### Key Considerations
- Handle nested Figma Variables structure
- Detect category from path patterns
- Generate CSS variable names
- Return structured output with errors/warnings

### Figma Variables JSON Structure
```json
{
  "collections": [
    {
      "name": "Primitives",
      "modes": [
        {
          "name": "Default",
          "variables": [
            {
              "name": "color/primary",
              "type": "COLOR",
              "value": { "r": 0.23, "g": 0.51, "b": 0.96, "a": 1 }
            }
          ]
        }
      ]
    }
  ]
}
```

### Parser Interface

```javascript
// src/lib/tokenParser.js

/**
 * Parse a token file (Figma Variables or flat JSON)
 * @param {object} json - The parsed JSON object
 * @returns {{ tokens: Token[], errors: string[], warnings: string[] }}
 */
export function parseTokenFile(json) {
  const tokens = [];
  const errors = [];
  const warnings = [];
  
  try {
    // Handle Figma Variables format
    if (json.collections) {
      for (const collection of json.collections) {
        for (const mode of collection.modes) {
          parseMode(collection.name, mode, tokens, errors, warnings);
        }
      }
    }
    // Handle flat token format
    else if (typeof json === 'object') {
      parseFlat(json, '', tokens, errors, warnings);
    }
    else {
      errors.push('Invalid token file format');
    }
  } catch (e) {
    errors.push(`Parse error: ${e.message}`);
  }
  
  return { tokens, errors, warnings };
}

/**
 * Parse Figma Variables mode
 */
function parseMode(collectionName, mode, tokens, errors, warnings) {
  for (const variable of mode.variables || []) {
    try {
      const token = parseVariable(collectionName, variable);
      if (token) {
        tokens.push(token);
      }
    } catch (e) {
      warnings.push(`Skipped ${variable.name}: ${e.message}`);
    }
  }
}

/**
 * Parse single Figma variable
 */
function parseVariable(collection, variable) {
  const path = variable.name;
  const category = detectCategory(path);
  const type = mapFigmaType(variable.type);
  const value = convertValue(variable.type, variable.value);
  
  return {
    name: formatName(path),
    path,
    category,
    type,
    value,
    css_variable: generateCssVariable(path),
    description: variable.description || '',
    figma_id: variable.id
  };
}

/**
 * Parse flat JSON format (key-value pairs)
 */
function parseFlat(obj, prefix, tokens, errors, warnings) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}/${key}` : key;
    
    if (typeof value === 'object' && !isTokenValue(value)) {
      // Nested object, recurse
      parseFlat(value, path, tokens, errors, warnings);
    } else {
      // Leaf value
      try {
        const category = detectCategory(path);
        const type = detectType(value);
        const normalizedValue = normalizeValue(type, value);
        
        tokens.push({
          name: formatName(path),
          path,
          category,
          type,
          value: normalizedValue,
          css_variable: generateCssVariable(path)
        });
      } catch (e) {
        warnings.push(`Skipped ${path}: ${e.message}`);
      }
    }
  }
}

/**
 * Detect token category from path
 */
export function detectCategory(path) {
  const lower = path.toLowerCase();
  
  if (/color|background|foreground|fill|stroke|brand/.test(lower)) return 'color';
  if (/font|text|typography|heading|body|display/.test(lower)) return 'typography';
  if (/space|spacing|gap|margin|padding|size/.test(lower)) return 'spacing';
  if (/shadow|elevation|drop-shadow/.test(lower)) return 'shadow';
  if (/radius|corner|rounded|border-radius/.test(lower)) return 'radius';
  if (/grid|breakpoint|column|container/.test(lower)) return 'grid';
  
  return 'other';
}

/**
 * Generate CSS variable name from path
 */
export function generateCssVariable(path) {
  return '--' + path
    .replace(/\//g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * Detect value type
 */
export function detectType(value) {
  if (typeof value === 'string') {
    if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return 'color';
    if (/^rgb|^hsl/.test(value)) return 'color';
  }
  if (typeof value === 'number') return 'number';
  if (typeof value === 'object') {
    if (value.r !== undefined && value.g !== undefined) return 'color';
    if (value.value !== undefined && value.unit !== undefined) return 'dimension';
    if (value.shadows || value.shadow) return 'shadow';
  }
  return 'string';
}

/**
 * Map Figma variable type to our type system
 */
function mapFigmaType(figmaType) {
  const map = {
    'COLOR': 'color',
    'FLOAT': 'number',
    'STRING': 'string',
    'BOOLEAN': 'boolean'
  };
  return map[figmaType] || 'string';
}

/**
 * Convert Figma value to our format
 */
function convertValue(type, value) {
  if (type === 'COLOR') {
    // Figma colors are 0-1, convert to 0-255
    const r = Math.round(value.r * 255);
    const g = Math.round(value.g * 255);
    const b = Math.round(value.b * 255);
    const hex = `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
    
    return {
      hex,
      rgb: { r, g, b },
      opacity: value.a ?? 1
    };
  }
  
  return value;
}

/**
 * Normalize value to our format
 */
function normalizeValue(type, value) {
  if (type === 'color') {
    if (typeof value === 'string' && value.startsWith('#')) {
      return { hex: value, opacity: 1 };
    }
    if (typeof value === 'object' && value.r !== undefined) {
      return convertValue('COLOR', value);
    }
  }
  
  if (type === 'dimension') {
    if (typeof value === 'object' && value.value !== undefined) {
      return { value: value.value, unit: value.unit || 'px' };
    }
    if (typeof value === 'number') {
      return { value, unit: 'px' };
    }
  }
  
  return value;
}

/**
 * Check if object is a token value (vs nested path)
 */
function isTokenValue(obj) {
  // Has known value properties
  if (obj.value !== undefined) return true;
  if (obj.r !== undefined && obj.g !== undefined) return true;
  if (obj.hex !== undefined) return true;
  if (obj.shadows !== undefined) return true;
  return false;
}

/**
 * Format token name from path
 */
function formatName(path) {
  const parts = path.split('/');
  const last = parts[parts.length - 1];
  return last
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
```

---

## Files Created
- `src/lib/tokenParser.js` — Token parsing utilities

---

## Tests

### Unit Tests
- [ ] Parses Figma Variables format correctly
- [ ] Parses flat token format correctly
- [ ] detectCategory returns correct category for all types
- [ ] generateCssVariable produces valid CSS variable names
- [ ] detectType identifies value types correctly
- [ ] Handles nested paths correctly
- [ ] Reports errors for invalid values
- [ ] Reports warnings for skipped values

### Test Cases
```javascript
// Color detection
detectCategory('color/primary') // → 'color'
detectCategory('background/default') // → 'color'

// Typography detection
detectCategory('typography/heading/lg') // → 'typography'
detectCategory('font/size/base') // → 'typography'

// CSS variable generation
generateCssVariable('color/primary') // → '--color-primary'
generateCssVariable('spacing/md') // → '--spacing-md'

// Figma color conversion
convertValue('COLOR', { r: 0.23, g: 0.51, b: 0.96, a: 1 })
// → { hex: '#3b82f5', rgb: { r: 59, g: 130, b: 245 }, opacity: 1 }
```

---

## Time Estimate
2 hours

---

## Notes
This parser is based on the existing prototype and should maintain compatibility with the Figma Variables JSON format. The category detection heuristics may need tuning based on real-world token naming conventions.
