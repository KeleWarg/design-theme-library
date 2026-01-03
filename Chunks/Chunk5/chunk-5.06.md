# Chunk 5.06 — JSON Generator

## Purpose
Generate JSON token files in different structures.

---

## Inputs
- Theme tokens

## Outputs
- JSON string (flat or nested)

---

## Dependencies
- Chunk 1.08 must be complete

---

## Implementation Notes

```javascript
// src/services/generators/jsonGenerator.js

export function generateJSON(tokens, options = {}) {
  const {
    format = 'nested', // 'flat' | 'nested' | 'style-dictionary'
    includeMetadata = false,
  } = options;

  if (format === 'flat') {
    return generateFlatJSON(tokens, includeMetadata);
  }
  
  if (format === 'style-dictionary') {
    return generateStyleDictionaryJSON(tokens);
  }

  return generateNestedJSON(tokens, includeMetadata);
}

function generateFlatJSON(tokens, includeMetadata) {
  const result = {};
  
  for (const token of tokens) {
    if (includeMetadata) {
      result[token.path] = {
        value: token.value,
        type: token.type,
        category: token.category,
        cssVariable: token.css_variable,
      };
    } else {
      result[token.path] = token.value;
    }
  }
  
  return JSON.stringify(result, null, 2);
}

function generateNestedJSON(tokens, includeMetadata) {
  const result = {};
  
  for (const token of tokens) {
    const parts = token.path.split('/');
    let current = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    
    const key = parts[parts.length - 1];
    if (includeMetadata) {
      current[key] = {
        $value: token.value,
        $type: token.type,
        $cssVariable: token.css_variable,
      };
    } else {
      current[key] = token.value;
    }
  }
  
  return JSON.stringify(result, null, 2);
}

function generateStyleDictionaryJSON(tokens) {
  // Style Dictionary format with $value syntax
  const result = {};
  
  for (const token of tokens) {
    const parts = token.path.split('/');
    let current = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = {
      $value: formatValueForStyleDictionary(token),
      $type: mapTypeToStyleDictionary(token.type),
    };
  }
  
  return JSON.stringify(result, null, 2);
}

function formatValueForStyleDictionary(token) {
  // Return raw value for Style Dictionary processing
  if (token.type === 'color' && token.value?.hex) {
    return token.value.hex;
  }
  if (typeof token.value === 'object' && token.value?.value !== undefined) {
    return `${token.value.value}${token.value.unit || ''}`;
  }
  return token.value;
}

function mapTypeToStyleDictionary(type) {
  const mapping = {
    color: 'color',
    dimension: 'dimension',
    typography: 'typography',
    shadow: 'shadow',
    string: 'string',
    number: 'number',
  };
  return mapping[type] || type;
}
```

---

## Files Created
- `src/services/generators/jsonGenerator.js` — JSON generation

---

## Tests

### Unit Tests
- [ ] Flat format works
- [ ] Nested format works
- [ ] Style Dictionary format valid
- [ ] Metadata optional
- [ ] Paths converted correctly

---

## Time Estimate
1.5 hours
