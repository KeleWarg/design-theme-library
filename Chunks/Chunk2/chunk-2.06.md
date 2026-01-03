# Chunk 2.06 — CSS Variable Injection

## Purpose
Ensure CSS variables are properly injected and available throughout the app.

---

## Inputs
- ThemeContext (from chunk 2.04)
- Token data structures

## Outputs
- Working CSS variable injection
- Debug utilities for variable inspection
- CSS export utilities

---

## Dependencies
- Chunk 2.04 must be complete

---

## Implementation Notes

### Key Considerations
- Variables must be available before first render
- Handle SSR/hydration if needed
- Provide fallback values
- Debug mode for development

### CSS Variable Injector

```javascript
// src/lib/cssVariableInjector.js

/**
 * Inject CSS variables into a target element
 */
export function injectCssVariables(tokens, options = {}) {
  const { 
    target = document.documentElement,
    debug = false 
  } = options;

  const variables = {};

  tokens.forEach(token => {
    const cssValue = tokenToCssValue(token);
    const varName = token.css_variable;
    
    if (debug) {
      console.log(`[CSS] ${varName}: ${cssValue}`);
    }
    
    target.style.setProperty(varName, cssValue);
    variables[varName] = cssValue;
  });

  return variables;
}

/**
 * Remove CSS variables from target element
 */
export function removeCssVariables(variableNames, target = document.documentElement) {
  variableNames.forEach(name => {
    target.style.removeProperty(name);
  });
}

/**
 * Convert token to CSS-compatible value
 */
export function tokenToCssValue(token) {
  const { category, value } = token;
  
  if (value === null || value === undefined) {
    return 'initial';
  }
  
  switch (category) {
    case 'color':
      return formatColorValue(value);
    
    case 'spacing':
    case 'radius':
      return formatDimensionValue(value);
    
    case 'shadow':
      return formatShadowValue(value);
    
    case 'typography':
      return formatTypographyValue(value);
    
    default:
      if (typeof value === 'object') {
        if (value.value !== undefined) {
          return `${value.value}${value.unit || ''}`;
        }
        return JSON.stringify(value);
      }
      return String(value);
  }
}

function formatColorValue(value) {
  if (typeof value === 'string') return value;
  
  if (value.opacity !== undefined && value.opacity < 1) {
    const { r, g, b } = value.rgb || { r: 0, g: 0, b: 0 };
    return `rgba(${r}, ${g}, ${b}, ${value.opacity})`;
  }
  
  return value.hex || '#000000';
}

function formatDimensionValue(value) {
  if (typeof value === 'number') return `${value}px`;
  if (typeof value === 'string') return value;
  if (value.value !== undefined) {
    return `${value.value}${value.unit || 'px'}`;
  }
  return '0';
}

function formatShadowValue(value) {
  if (!value.shadows || !Array.isArray(value.shadows)) {
    return 'none';
  }
  
  return value.shadows
    .map(s => {
      const x = s.x ?? 0;
      const y = s.y ?? 0;
      const blur = s.blur ?? 0;
      const spread = s.spread ?? 0;
      const color = s.color || 'rgba(0,0,0,0.1)';
      return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
    })
    .join(', ');
}

function formatTypographyValue(value) {
  if (typeof value === 'object' && value.value !== undefined) {
    return `${value.value}${value.unit || 'px'}`;
  }
  return String(value);
}
```

### CSS String Generator

```javascript
// src/lib/cssGenerator.js

/**
 * Generate CSS string for export
 */
export function generateCssString(tokens, options = {}) {
  const { 
    selector = ':root', 
    includeComments = true,
    minify = false 
  } = options;
  
  const grouped = groupTokensByCategory(tokens);
  let css = `${selector} {\n`;
  
  const categories = ['color', 'typography', 'spacing', 'shadow', 'radius', 'grid', 'other'];
  
  categories.forEach(category => {
    const categoryTokens = grouped[category];
    if (!categoryTokens?.length) return;
    
    if (includeComments) {
      css += `  /* ${capitalize(category)} */\n`;
    }
    
    categoryTokens.forEach(token => {
      const value = tokenToCssValue(token);
      css += `  ${token.css_variable}: ${value};\n`;
    });
    
    if (!minify) css += '\n';
  });
  
  css += '}\n';
  
  if (minify) {
    css = css
      .replace(/\n/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/:\s/g, ':')
      .replace(/;\s}/g, '}');
  }
  
  return css;
}

function groupTokensByCategory(tokens) {
  return tokens.reduce((acc, token) => {
    const cat = token.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(token);
    return acc;
  }, {});
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

### Debug Component

```jsx
// src/components/dev/CssVariableDebugger.jsx
import { useState } from 'react';
import { useThemeContext } from '../../contexts/ThemeContext';

export function CssVariableDebugger() {
  const { cssVariables, activeTheme } = useThemeContext();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Only show in development
  if (import.meta.env.PROD) return null;

  const filteredVars = Object.entries(cssVariables)
    .filter(([key]) => key.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="css-debugger">
      <button 
        className="debugger-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        🎨 CSS Vars ({Object.keys(cssVariables).length})
      </button>
      
      {isOpen && (
        <div className="debugger-panel">
          <div className="debugger-header">
            <h4>{activeTheme?.name || 'No theme'}</h4>
            <input
              type="text"
              placeholder="Search variables..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="variable-list">
            {filteredVars.map(([key, value]) => (
              <div key={key} className="variable-item">
                <code className="var-name">{key}</code>
                <span className="var-value">
                  {value}
                  {key.includes('color') && (
                    <span 
                      className="color-preview" 
                      style={{ backgroundColor: value }}
                    />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Styling
```css
/* src/styles/css-debugger.css */
.css-debugger {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 9999;
  font-family: monospace;
}

.debugger-toggle {
  padding: 0.5rem 1rem;
  background: #1e293b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
}

.debugger-panel {
  position: absolute;
  bottom: 100%;
  right: 0;
  width: 400px;
  max-height: 500px;
  background: #1e293b;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.debugger-header {
  padding: 0.75rem;
  border-bottom: 1px solid #334155;
}

.debugger-header h4 {
  margin: 0 0 0.5rem;
  color: white;
  font-size: 0.875rem;
}

.debugger-header input {
  width: 100%;
  padding: 0.5rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 4px;
  color: white;
  font-size: 0.75rem;
}

.variable-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
}

.variable-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.variable-item:hover {
  background: #334155;
}

.var-name {
  color: #93c5fd;
  font-size: 0.6875rem;
}

.var-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.6875rem;
}

.color-preview {
  width: 14px;
  height: 14px;
  border-radius: 2px;
  border: 1px solid rgba(255,255,255,0.2);
}
```

---

## Files Created
- `src/lib/cssVariableInjector.js` — CSS injection utilities
- `src/lib/cssGenerator.js` — CSS string generation for export
- `src/components/dev/CssVariableDebugger.jsx` — Debug component
- `src/styles/css-debugger.css` — Debugger styles

---

## Tests

### Unit Tests
- [ ] injectCssVariables sets properties on target
- [ ] removeCssVariables clears properties
- [ ] tokenToCssValue handles all token types
- [ ] formatColorValue handles hex, rgb, and opacity
- [ ] formatShadowValue handles multiple shadows
- [ ] generateCssString produces valid CSS
- [ ] generateCssString minify option works
- [ ] generateCssString includes category comments

### Integration Tests
- [ ] Theme switch updates all CSS variables
- [ ] New tokens immediately available in CSS
- [ ] Variables accessible via getComputedStyle

---

## Time Estimate
2 hours

---

## Notes
The CSS debugger is invaluable during development for verifying variable injection. The cssGenerator will be used in Phase 5 for the export system.
