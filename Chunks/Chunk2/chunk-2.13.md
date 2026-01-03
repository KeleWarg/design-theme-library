# Chunk 2.13 — CategorySidebar

## Purpose
Navigation sidebar for switching between token categories.

---

## Inputs
- All tokens from theme
- Active category state

## Outputs
- CategorySidebar component
- Category selection with counts

---

## Dependencies
- Chunk 2.12 must be complete

---

## Implementation Notes

### Component Structure

```jsx
// src/components/themes/editor/CategorySidebar.jsx
import { useMemo } from 'react';
import { 
  PaletteIcon, TypeIcon, SpaceIcon, 
  BoxIcon, CircleIcon, GridIcon, MoreHorizontalIcon 
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const CATEGORIES = [
  { id: 'color', label: 'Colors', icon: PaletteIcon },
  { id: 'typography', label: 'Typography', icon: TypeIcon },
  { id: 'spacing', label: 'Spacing', icon: SpaceIcon },
  { id: 'shadow', label: 'Shadows', icon: BoxIcon },
  { id: 'radius', label: 'Radius', icon: CircleIcon },
  { id: 'grid', label: 'Grid', icon: GridIcon },
  { id: 'other', label: 'Other', icon: MoreHorizontalIcon }
];

export default function CategorySidebar({ tokens, activeCategory, onCategoryChange }) {
  const categoryCounts = useMemo(() => {
    const counts = {};
    CATEGORIES.forEach(cat => counts[cat.id] = 0);
    tokens?.forEach(token => {
      if (counts[token.category] !== undefined) {
        counts[token.category]++;
      } else {
        counts.other++;
      }
    });
    return counts;
  }, [tokens]);

  return (
    <aside className="category-sidebar">
      <nav className="category-nav">
        {CATEGORIES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={cn('category-item', { active: activeCategory === id })}
            onClick={() => onCategoryChange(id)}
          >
            <Icon className="category-icon" size={18} />
            <span className="category-label">{label}</span>
            <span className="category-count">{categoryCounts[id]}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
```

### Styling
```css
.category-sidebar {
  width: 200px;
  border-right: 1px solid var(--color-border);
  background: #fafafa;
}

.category-nav {
  padding: 0.5rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.category-item:hover {
  background: #f1f5f9;
}

.category-item.active {
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.category-icon {
  color: #64748b;
}

.category-item.active .category-icon {
  color: var(--color-primary);
}

.category-label {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

.category-count {
  font-size: 0.75rem;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
}
```

---

## Files Created
- `src/components/themes/editor/CategorySidebar.jsx` — Category navigation

---

## Tests

### Unit Tests
- [ ] Renders all categories
- [ ] Shows correct count for each category
- [ ] Active category highlighted
- [ ] Click changes active category

---

## Time Estimate
1 hour

---

## Notes
The sidebar provides quick access to all token categories with live counts. Icons help visually identify each category type.
