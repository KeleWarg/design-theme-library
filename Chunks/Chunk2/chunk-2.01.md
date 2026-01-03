# Chunk 2.01 — ThemesPage Layout

## Purpose
Create the main themes listing page with grid layout and controls.

---

## Inputs
- App shell/routing (from chunk 1.11)
- themeService (from chunk 1.07)

## Outputs
- ThemesPage component (consumed by chunk 2.02, 2.03)
- Page-level state management

---

## Dependencies
- Chunk 1.11 must be complete
- Chunk 1.07 must be complete

---

## Implementation Notes

### Key Considerations
- Use React Query or SWR for data fetching
- Optimistic updates for better UX
- Filter state in URL params for shareability

### Component Structure

```jsx
// src/pages/ThemesPage.jsx
import { useState } from 'react';
import { useThemes } from '../hooks/useThemes';
import ThemeCard from '../components/themes/ThemeCard';
import CreateThemeModal from '../components/themes/CreateThemeModal';
import { PageHeader, FilterBar, FilterButton, EmptyState } from '../components/ui';
import { ThemeGridSkeleton } from '../components/ui/Skeleton';
import { PaletteIcon } from 'lucide-react';

export default function ThemesPage() {
  const [filter, setFilter] = useState('all'); // all, draft, published
  const { data: themes, isLoading, error } = useThemes(filter);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="themes-page">
      <PageHeader
        title="Themes"
        action={
          <Button onClick={() => setShowCreateModal(true)}>
            Create Theme
          </Button>
        }
      />
      
      <FilterBar>
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
          All
        </FilterButton>
        <FilterButton active={filter === 'draft'} onClick={() => setFilter('draft')}>
          Drafts
        </FilterButton>
        <FilterButton active={filter === 'published'} onClick={() => setFilter('published')}>
          Published
        </FilterButton>
      </FilterBar>

      {isLoading ? (
        <ThemeGridSkeleton />
      ) : error ? (
        <ErrorMessage error={error} />
      ) : themes?.length === 0 ? (
        <EmptyState
          icon={PaletteIcon}
          title="No themes yet"
          description="Create your first theme to get started"
          action={
            <Button onClick={() => setShowCreateModal(true)}>
              Create Theme
            </Button>
          }
        />
      ) : (
        <div className="theme-grid">
          {themes.map(theme => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      )}

      <CreateThemeModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </div>
  );
}
```

### useThemes Hook
```javascript
// src/hooks/useThemes.js
import useSWR from 'swr';
import { themeService } from '../services/themeService';

export function useThemes(filter = 'all') {
  return useSWR(
    ['themes', filter],
    async () => {
      const themes = await themeService.getThemes();
      if (filter === 'all') return themes;
      return themes.filter(t => t.status === filter);
    }
  );
}
```

### Styling
```css
/* src/styles/themes-page.css */
.themes-page {
  padding: 0;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

@media (max-width: 640px) {
  .theme-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Files Created
- `src/pages/ThemesPage.jsx` — Main themes page
- `src/hooks/useThemes.js` — Theme data fetching hook
- `src/components/ui/PageHeader.jsx` — Reusable page header
- `src/components/ui/FilterBar.jsx` — Filter button group
- `src/components/ui/EmptyState.jsx` — Empty state component
- `src/styles/themes-page.css` — Page styles

---

## Tests

### Unit Tests
- [ ] Renders without error
- [ ] Shows loading state initially
- [ ] Shows empty state when no themes
- [ ] Shows theme grid when themes exist
- [ ] Filter changes update displayed themes
- [ ] Create button opens modal

### Verification
- [ ] Page accessible at /themes
- [ ] Responsive layout works (3/2/1 columns)

---

## Time Estimate
2 hours

---

## Notes
This is the entry point for theme management. The filter state could be persisted to URL params using `useSearchParams` for shareable URLs.
