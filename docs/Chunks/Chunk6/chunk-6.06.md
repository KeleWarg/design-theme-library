# Chunk 6.06 — Empty States

## Purpose
Add meaningful empty states for all list views.

---

## Inputs
- All list page components

## Outputs
- Empty state components

---

## Dependencies
- Phases 2-4 must be complete

---

## Implementation Notes

### Base Empty State Component

```jsx
// src/components/ui/EmptyState.jsx
import { cn } from '../../lib/utils';

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className 
}) {
  return (
    <div className={cn('empty-state', className)}>
      {Icon && (
        <div className="empty-icon">
          <Icon size={48} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="empty-title">{title}</h3>
      {description && (
        <p className="empty-description">{description}</p>
      )}
      {action && (
        <div className="empty-action">
          {action}
        </div>
      )}
    </div>
  );
}
```

### Specific Empty States

```jsx
// src/components/empty-states/ThemeEmptyStates.jsx
import { PaletteIcon, PlusIcon } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';

export function NoThemesEmpty({ onCreateClick }) {
  return (
    <EmptyState
      icon={PaletteIcon}
      title="No themes yet"
      description="Create your first theme to start building your design system."
      action={
        <Button onClick={onCreateClick}>
          <PlusIcon size={16} /> Create Theme
        </Button>
      }
    />
  );
}

export function NoTokensEmpty({ category, onAddClick }) {
  const categoryIcons = {
    color: PaletteIcon,
    typography: TypeIcon,
    spacing: SpaceIcon,
    shadow: ShadowIcon,
    radius: CircleIcon,
    grid: GridIcon,
  };
  
  const Icon = categoryIcons[category] || BoxIcon;
  
  return (
    <EmptyState
      icon={Icon}
      title={`No ${category} tokens`}
      description={`Add ${category} tokens to your theme or import from a design file.`}
      action={
        onAddClick && (
          <Button variant="ghost" onClick={onAddClick}>
            <PlusIcon size={16} /> Add Token
          </Button>
        )
      }
    />
  );
}
```

```jsx
// src/components/empty-states/ComponentEmptyStates.jsx
import { BoxIcon, PlusIcon, CodeIcon, FigmaIcon, SearchIcon } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';

export function NoComponentsEmpty({ onAddClick }) {
  return (
    <EmptyState
      icon={BoxIcon}
      title="No components yet"
      description="Create or generate your first component to build your library."
      action={
        <Button onClick={onAddClick}>
          <PlusIcon size={16} /> Add Component
        </Button>
      }
    />
  );
}

export function NoExamplesEmpty({ onAddClick }) {
  return (
    <EmptyState
      icon={CodeIcon}
      title="No examples yet"
      description="Add usage examples to help others understand how to use this component."
      action={
        <Button variant="ghost" onClick={onAddClick}>
          <PlusIcon size={16} /> Add Example
        </Button>
      }
    />
  );
}

export function NoSearchResults({ query, onClear }) {
  return (
    <EmptyState
      icon={SearchIcon}
      title="No results found"
      description={`No items match "${query}". Try a different search term.`}
      action={
        <Button variant="ghost" onClick={onClear}>
          Clear Search
        </Button>
      }
    />
  );
}

export function NoFilterResults({ onClear }) {
  return (
    <EmptyState
      icon={FilterIcon}
      title="No matching items"
      description="No items match the current filters. Try adjusting your filters."
      action={
        <Button variant="ghost" onClick={onClear}>
          Clear Filters
        </Button>
      }
    />
  );
}
```

```jsx
// src/components/empty-states/ImportEmptyStates.jsx
import { FigmaIcon, UploadIcon } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

export function NoImportsEmpty() {
  return (
    <EmptyState
      icon={FigmaIcon}
      title="No pending imports"
      description="Use the Figma plugin to export components to this admin tool."
    />
  );
}

export function NoFilesUploaded({ onUploadClick }) {
  return (
    <EmptyState
      icon={UploadIcon}
      title="No files uploaded"
      description="Upload a JSON file containing your design tokens."
      action={
        <Button variant="ghost" onClick={onUploadClick}>
          <UploadIcon size={16} /> Upload File
        </Button>
      }
    />
  );
}
```

### Usage in Pages

```jsx
// Example: ThemesPage.jsx
function ThemesPage() {
  const { data: themes, isLoading, error } = useThemes();
  
  if (isLoading) return <ThemeGridSkeleton />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;
  
  if (!themes?.length) {
    return <NoThemesEmpty onCreateClick={() => setShowCreateModal(true)} />;
  }
  
  return <ThemeGrid themes={themes} />;
}

// Example: ComponentsPage.jsx with search
function ComponentsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const { data: components, isLoading } = useComponents({ category, search });
  
  if (isLoading) return <ComponentGridSkeleton />;
  
  if (!components?.length) {
    if (search) {
      return <NoSearchResults query={search} onClear={() => setSearch('')} />;
    }
    if (category !== 'all') {
      return <NoFilterResults onClear={() => setCategory('all')} />;
    }
    return <NoComponentsEmpty onAddClick={() => navigate('/components/new')} />;
  }
  
  return <ComponentGrid components={components} />;
}
```

### Empty State Styles

```css
/* src/styles/empty-states.css */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.empty-description {
  color: var(--color-text-muted);
  max-width: 400px;
  margin-bottom: 1.5rem;
}

.empty-action {
  display: flex;
  gap: 0.5rem;
}
```

---

## Files Created
- `src/components/ui/EmptyState.jsx` — Base empty state
- `src/components/empty-states/ThemeEmptyStates.jsx` — Theme-related empty states
- `src/components/empty-states/ComponentEmptyStates.jsx` — Component-related empty states
- `src/components/empty-states/ImportEmptyStates.jsx` — Import-related empty states
- `src/styles/empty-states.css` — Empty state styles

---

## Tests

### Verification
- [ ] All empty states have appropriate icons
- [ ] Actions trigger correct handlers
- [ ] Search empty state shows query
- [ ] Filter empty state shows clear option
- [ ] Empty states are centered and readable

---

## Time Estimate
2 hours
