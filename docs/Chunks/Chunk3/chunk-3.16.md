# Chunk 3.16 — TokensTab

## Purpose
Manage linked design tokens.

---

## Inputs
- Component linked_tokens
- ThemeContext tokens

## Outputs
- Updated linked_tokens

---

## Dependencies
- Chunk 3.12 must be complete
- Chunk 2.04 must be complete

---

## Implementation Notes

Extends TokenLinkingStep (chunk 3.09) with token detection from code.

```jsx
// src/components/components/detail/TokensTab.jsx
import { useState, useEffect, useMemo } from 'react';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { Input, Select, Checkbox, Button } from '../../ui';
import { TokenValuePreview } from '../../themes/TokenValuePreview';
import { SearchIcon, XIcon, AlertCircleIcon } from 'lucide-react';

export default function TokensTab({ component, onSave }) {
  const { tokens } = useThemeContext();
  const [linkedTokens, setLinkedTokens] = useState(component.linked_tokens || []);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    setLinkedTokens(component.linked_tokens || []);
    setHasChanges(false);
  }, [component.linked_tokens]);

  const allTokens = useMemo(() => {
    return Object.values(tokens).flat();
  }, [tokens]);

  // Detect tokens used in component code
  const usedInCode = useMemo(() => {
    const used = [];
    const code = component.code || '';
    
    allTokens.forEach(token => {
      if (code.includes(token.css_variable)) {
        used.push(token.path);
      }
    });
    
    return used;
  }, [component.code, allTokens]);

  // Find tokens used in code but not linked
  const unlinkedUsed = useMemo(() => {
    return usedInCode.filter(path => !linkedTokens.includes(path));
  }, [usedInCode, linkedTokens]);

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
    if (linkedTokens.includes(tokenPath)) {
      setLinkedTokens(linkedTokens.filter(p => p !== tokenPath));
    } else {
      setLinkedTokens([...linkedTokens, tokenPath]);
    }
    setHasChanges(true);
  };

  const linkAllDetected = () => {
    setLinkedTokens([...new Set([...linkedTokens, ...usedInCode])]);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(linkedTokens);
    setHasChanges(false);
  };

  return (
    <div className="tokens-tab">
      <div className="tab-header">
        <div>
          <h3>Linked Tokens</h3>
          <p>Design tokens used by this component.</p>
        </div>
        <div className="tab-actions">
          {hasChanges && (
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          )}
        </div>
      </div>

      {unlinkedUsed.length > 0 && (
        <div className="detected-warning">
          <AlertCircleIcon size={16} />
          <span>
            {unlinkedUsed.length} token(s) detected in code but not linked.
          </span>
          <Button size="sm" variant="ghost" onClick={linkAllDetected}>
            Link All Detected
          </Button>
        </div>
      )}

      {usedInCode.length > 0 && (
        <div className="detected-tokens">
          <h4>Detected in Code</h4>
          <div className="token-pills">
            {usedInCode.map(path => {
              const token = allTokens.find(t => t.path === path);
              const isLinked = linkedTokens.includes(path);
              return (
                <span 
                  key={path} 
                  className={`token-pill ${isLinked ? 'linked' : 'unlinked'}`}
                >
                  {token?.name || path}
                  {!isLinked && (
                    <button onClick={() => toggleToken(path)}>+ Link</button>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

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
                checked={linkedTokens.includes(token.path)}
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
    </div>
  );
}
```

---

## Files Created
- `src/components/components/detail/TokensTab.jsx` — Tokens management tab

---

## Tests

### Unit Tests
- [ ] Shows linked tokens
- [ ] Detects tokens from code
- [ ] Can add/remove links
- [ ] Save updates component

---

## Time Estimate
2 hours
