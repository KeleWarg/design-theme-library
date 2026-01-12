# Chunk 3.01 — ComponentsPage Layout

## Purpose
Create the main components listing page with grid layout, filters, and add options.

---

## Inputs
- App shell/routing (from chunk 1.11)
- componentService (from chunk 1.10)

## Outputs
- ComponentsPage component (consumed by chunk 3.02-3.04)

---

## Dependencies
- Chunk 1.11 must be complete
- Chunk 1.10 must be complete

---

## Implementation Notes

```jsx
// src/pages/ComponentsPage.jsx
import { useState } from 'react';
import { useComponents } from '../hooks/useComponents';
import ComponentCard from '../components/components/ComponentCard';
import ComponentFilters from '../components/components/ComponentFilters';
import AddComponentDropdown from '../components/components/AddComponentDropdown';
import { PageHeader, EmptyState } from '../components/ui';
import { ComponentGridSkeleton } from '../components/ui/Skeleton';
import { BoxIcon } from 'lucide-react';

export default function ComponentsPage() {
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: ''
  });
  const { data: components, isLoading, error } = useComponents(filters);

  return (
    <div className="components-page">
      <PageHeader
        title="Components"
        action={<AddComponentDropdown />}
      />

      <ComponentFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <ComponentGridSkeleton />
      ) : error ? (
        <ErrorMessage error={error} />
      ) : components?.length === 0 ? (
        <EmptyState
          icon={BoxIcon}
          title="No components yet"
          description="Create your first component to get started"
          action={<AddComponentDropdown />}
        />
      ) : (
        <div className="component-grid">
          {components.map(component => (
            <ComponentCard key={component.id} component={component} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### useComponents Hook
```javascript
// src/hooks/useComponents.js
import useSWR from 'swr';
import { componentService } from '../services/componentService';

export function useComponents(filters) {
  return useSWR(['components', filters], async () => {
    return componentService.getComponents(filters);
  });
}
```

---

## Files Created
- `src/pages/ComponentsPage.jsx` — Main components page
- `src/hooks/useComponents.js` — Component data hook

---

## Tests

### Unit Tests
- [ ] Renders component grid
- [ ] Filters update query
- [ ] Empty state when no components
- [ ] Loading state shows skeleton

---

## Time Estimate
2 hours
