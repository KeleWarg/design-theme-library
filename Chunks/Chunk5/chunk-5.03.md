# Chunk 5.03 — ComponentSelector

## Purpose
Multi-select component picker for export.

---

## Inputs
- Available components (published only)

## Outputs
- Selected component IDs

---

## Dependencies
- Chunk 5.01 must be complete
- Chunk 1.10 must be complete

---

## Implementation Notes

```jsx
// src/components/export/ComponentSelector.jsx
import { useState } from 'react';
import { useComponents } from '../../hooks/useComponents';
import { Checkbox, Select } from '../ui';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'buttons', label: 'Buttons' },
  { value: 'forms', label: 'Forms' },
  { value: 'layout', label: 'Layout' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'data-display', label: 'Data Display' },
  { value: 'overlay', label: 'Overlay' },
];

export default function ComponentSelector({ selected, onChange }) {
  const { data: components, isLoading } = useComponents({ status: 'published' });
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredComponents = filterCategory === 'all'
    ? components
    : components?.filter(c => c.category === filterCategory);

  const toggleComponent = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(c => c !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const selectAll = () => {
    onChange(filteredComponents?.map(c => c.id) || []);
  };

  const deselectAll = () => {
    onChange([]);
  };

  if (isLoading) {
    return <div className="selector-loading">Loading components...</div>;
  }

  return (
    <div className="export-component-selector">
      <div className="selector-header">
        <h4>Components</h4>
        <Select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          options={CATEGORIES}
          size="sm"
        />
      </div>

      <div className="selector-actions">
        <button onClick={selectAll} className="link-button">All</button>
        <button onClick={deselectAll} className="link-button">None</button>
      </div>

      <div className="component-list">
        {filteredComponents?.map(component => (
          <label key={component.id} className="component-item">
            <Checkbox
              checked={selected.includes(component.id)}
              onChange={() => toggleComponent(component.id)}
            />
            <div className="component-info">
              <span className="component-name">{component.name}</span>
              <span className="linked-count">
                {component.linked_tokens?.length || 0} linked tokens
              </span>
            </div>
          </label>
        ))}
        
        {filteredComponents?.length === 0 && (
          <div className="empty-state">
            No published components in this category
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="selection-summary">
          {selected.length} component{selected.length > 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}
```

---

## Files Created
- `src/components/export/ComponentSelector.jsx` — Component multi-select

---

## Tests

### Unit Tests
- [ ] Shows only published components
- [ ] Category filter works
- [ ] Toggle selection works
- [ ] Select all respects filter

---

## Time Estimate
1.5 hours
