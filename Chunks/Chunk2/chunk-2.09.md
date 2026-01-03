# Chunk 2.09 — MappingStep

## Purpose
Review and adjust automatic category mappings for imported tokens.

---

## Inputs
- Parsed tokens from UploadStep (via wizard data)

## Outputs
- Confirmed category mappings
- User can override auto-detected categories

---

## Dependencies
- Chunk 2.08 must be complete

---

## Implementation Notes

### Key Considerations
- Group tokens by detected category
- Allow override via dropdown
- Show warning for "other" category
- Provide search/filter for large imports

### Categories
```javascript
const CATEGORIES = ['color', 'typography', 'spacing', 'shadow', 'radius', 'grid', 'other'];
```

### Component Structure

```jsx
// src/components/themes/import/MappingStep.jsx
import { useState, useMemo } from 'react';
import { Input, Select, Button } from '../../ui';
import { SearchIcon, ChevronDownIcon, AlertTriangleIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';

const CATEGORIES = ['color', 'typography', 'spacing', 'shadow', 'radius', 'grid', 'other'];

export default function MappingStep({ data, onUpdate, onNext, onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set(CATEGORIES));

  const tokensByCategory = useMemo(() => {
    const grouped = {};
    CATEGORIES.forEach(cat => grouped[cat] = []);
    
    data.parsedTokens.forEach(token => {
      const category = data.mappings[token.path] || token.category;
      grouped[category].push(token);
    });
    
    return grouped;
  }, [data.parsedTokens, data.mappings]);

  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokensByCategory;
    
    const filtered = {};
    Object.entries(tokensByCategory).forEach(([cat, tokens]) => {
      filtered[cat] = tokens.filter(t => 
        t.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    return filtered;
  }, [tokensByCategory, searchQuery]);

  const updateMapping = (path, newCategory) => {
    onUpdate({
      mappings: { ...data.mappings, [path]: newCategory }
    });
  };

  const toggleCategory = (category) => {
    const next = new Set(expandedCategories);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    setExpandedCategories(next);
  };

  const categoryCounts = CATEGORIES.map(cat => ({
    category: cat,
    count: tokensByCategory[cat].length
  }));

  return (
    <div className="mapping-step">
      <div className="mapping-header">
        <Input
          placeholder="Search tokens..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<SearchIcon size={16} />}
        />
        <div className="category-summary">
          {categoryCounts.map(({ category, count }) => (
            <span key={category} className={cn('category-badge', category)}>
              {category}: {count}
            </span>
          ))}
        </div>
      </div>

      <div className="mapping-list">
        {CATEGORIES.map(category => (
          <CategorySection
            key={category}
            category={category}
            tokens={filteredTokens[category]}
            expanded={expandedCategories.has(category)}
            onToggle={() => toggleCategory(category)}
            onUpdateMapping={updateMapping}
          />
        ))}
      </div>

      {tokensByCategory.other.length > 0 && (
        <div className="other-warning">
          <AlertTriangleIcon size={16} />
          <span>
            {tokensByCategory.other.length} tokens categorized as "other".
            Consider reassigning them for better organization.
          </span>
        </div>
      )}

      <div className="step-actions">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Continue to Review</Button>
      </div>
    </div>
  );
}

function CategorySection({ category, tokens, expanded, onToggle, onUpdateMapping }) {
  if (tokens.length === 0) return null;

  return (
    <div className="category-section">
      <button className="category-header" onClick={onToggle}>
        <ChevronDownIcon className={cn('chevron', { rotated: !expanded })} size={16} />
        <span className={cn('category-name', category)}>{category}</span>
        <span className="token-count">{tokens.length} tokens</span>
      </button>
      
      {expanded && (
        <div className="token-list">
          {tokens.map(token => (
            <TokenMappingRow 
              key={token.path}
              token={token}
              currentCategory={category}
              onUpdateMapping={onUpdateMapping}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TokenMappingRow({ token, currentCategory, onUpdateMapping }) {
  return (
    <div className="token-row">
      <span className="token-path">{token.path}</span>
      <TokenPreview token={token} />
      <Select
        value={currentCategory}
        onChange={(newCat) => onUpdateMapping(token.path, newCat)}
        options={CATEGORIES.map(c => ({ value: c, label: c }))}
        size="sm"
      />
    </div>
  );
}
```

---

## Files Created
- `src/components/themes/import/MappingStep.jsx` — Mapping step component
- `src/components/themes/import/TokenPreview.jsx` — Token value preview

---

## Tests

### Unit Tests
- [ ] Groups tokens by category
- [ ] Search filters tokens by path and name
- [ ] Category sections expand/collapse
- [ ] Category dropdown changes mapping
- [ ] Warning shows when "other" has tokens
- [ ] Counts update on mapping change

---

## Time Estimate
3 hours

---

## Notes
This step allows users to correct any misdetected categories before import. The expandable sections help manage large imports with many tokens.
