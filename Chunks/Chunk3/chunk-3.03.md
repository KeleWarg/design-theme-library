# Chunk 3.03 — ComponentFilters

## Purpose
Filter bar for status, category, and search.

---

## Inputs
- Filter state from ComponentsPage

## Outputs
- Filter controls

---

## Dependencies
- Chunk 3.01 must be complete

---

## Implementation Notes

```jsx
// src/components/components/ComponentFilters.jsx
import { Input, Select, Button } from '../ui';
import { SearchIcon } from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'buttons', label: 'Buttons' },
  { value: 'forms', label: 'Forms' },
  { value: 'layout', label: 'Layout' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'data-display', label: 'Data Display' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'other', label: 'Other' },
];

const STATUSES = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export default function ComponentFilters({ filters, onChange }) {
  const updateFilter = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({ status: 'all', category: 'all', search: '' });
  };

  const hasActiveFilters = filters.status !== 'all' || 
    filters.category !== 'all' || 
    filters.search !== '';

  return (
    <div className="component-filters">
      <Input
        placeholder="Search components..."
        value={filters.search}
        onChange={(e) => updateFilter('search', e.target.value)}
        leftIcon={<SearchIcon size={16} />}
        className="search-input"
      />

      <Select
        value={filters.status}
        onChange={(e) => updateFilter('status', e.target.value)}
        options={STATUSES}
      />

      <Select
        value={filters.category}
        onChange={(e) => updateFilter('category', e.target.value)}
        options={CATEGORIES}
      />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}
```

---

## Files Created
- `src/components/components/ComponentFilters.jsx` — Filter bar

---

## Tests

### Unit Tests
- [ ] Search input updates filters
- [ ] Status select works
- [ ] Category select works
- [ ] Clear filters resets all

---

## Time Estimate
1.5 hours
