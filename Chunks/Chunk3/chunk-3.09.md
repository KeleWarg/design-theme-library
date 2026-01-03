# Chunk 3.09 — TokenLinkingStep

## Purpose
Link design tokens to the component.

---

## Inputs
- Wizard data
- ThemeContext tokens

## Outputs
- linked_tokens array

---

## Dependencies
- Chunk 3.05 must be complete
- Chunk 2.04 must be complete

---

## Implementation Notes

```jsx
// src/components/components/create/TokenLinkingStep.jsx
import { useState, useMemo } from 'react';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { Input, Select, Checkbox } from '../../ui';
import { TokenValuePreview } from '../../themes/TokenValuePreview';
import { SearchIcon, XIcon } from 'lucide-react';

export default function TokenLinkingStep({ data, onUpdate }) {
  const { tokens } = useThemeContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const allTokens = useMemo(() => {
    return Object.values(tokens).flat();
  }, [tokens]);

  const filteredTokens = useMemo(() => {
    let result = allTokens;
    
    if (activeCategory !== 'all') {
      result = result.filter(t => t.category === activeCategory);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(q) ||
        t.path.toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [allTokens, activeCategory, searchQuery]);

  const toggleToken = (tokenPath) => {
    const linked = data.linked_tokens || [];
    if (linked.includes(tokenPath)) {
      onUpdate({ linked_tokens: linked.filter(p => p !== tokenPath) });
    } else {
      onUpdate({ linked_tokens: [...linked, tokenPath] });
    }
  };

  return (
    <div className="token-linking-step">
      <div className="step-header">
        <div>
          <h3>Link Design Tokens</h3>
          <p className="step-description">
            Select tokens that this component uses. This helps AI generate better code
            and documents token dependencies.
          </p>
        </div>
        <span className="selected-count">
          {data.linked_tokens?.length || 0} selected
        </span>
      </div>

      <div className="token-browser">
        <div className="browser-header">
          <Input
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<SearchIcon size={16} />}
          />
          <Select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'color', label: 'Colors' },
              { value: 'typography', label: 'Typography' },
              { value: 'spacing', label: 'Spacing' },
              { value: 'shadow', label: 'Shadows' },
              { value: 'radius', label: 'Radius' },
            ]}
          />
        </div>

        <div className="token-list">
          {filteredTokens.map(token => (
            <label key={token.id} className="token-item">
              <Checkbox
                checked={data.linked_tokens?.includes(token.path)}
                onChange={() => toggleToken(token.path)}
              />
              <TokenValuePreview token={token} size="sm" />
              <div className="token-info">
                <span className="token-name">{token.name}</span>
                <code className="token-path">{token.css_variable}</code>
              </div>
            </label>
          ))}
        </div>
      </div>

      {data.linked_tokens?.length > 0 && (
        <div className="selected-tokens">
          <h4>Selected Tokens</h4>
          <div className="token-pills">
            {data.linked_tokens.map(path => {
              const token = allTokens.find(t => t.path === path);
              return (
                <span key={path} className="token-pill">
                  {token?.name || path}
                  <button onClick={() => toggleToken(path)}>
                    <XIcon size={14} />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Files Created
- `src/components/components/create/TokenLinkingStep.jsx` — Token browser/linker

---

## Tests

### Unit Tests
- [ ] Shows tokens from active theme
- [ ] Search filters tokens
- [ ] Category filter works
- [ ] Toggle selection works
- [ ] Selected tokens display

---

## Time Estimate
2.5 hours
