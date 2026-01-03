# Chunk 2.02 — ThemeCard Component

## Purpose
Create individual theme card with preview and actions.

---

## Inputs
- Theme data from themeService
- ThemesPage container (from chunk 2.01)

## Outputs
- ThemeCard component (consumed by ThemesPage)

---

## Dependencies
- Chunk 2.01 must be complete

---

## Implementation Notes

### Key Considerations
- Show color palette preview (first 5 colors)
- Status badge (draft/published)
- Default indicator (star icon)
- Actions menu (Edit, Duplicate, Delete, Set Default)

### Component Structure

```jsx
// src/components/themes/ThemeCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { themeService } from '../../services/themeService';
import { DropdownMenu, StatusBadge } from '../ui';
import { StarIcon, MoreVerticalIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function ThemeCard({ theme }) {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Extract first 5 color tokens for preview
  const colorPreview = theme.tokens
    ?.filter(t => t.category === 'color')
    ?.slice(0, 5)
    ?.map(t => t.value?.hex || '#ccc') || [];

  const handleDuplicate = async (e) => {
    e.stopPropagation();
    try {
      await themeService.duplicateTheme(theme.id, `${theme.name} (Copy)`);
      mutate(['themes']);
      toast.success('Theme duplicated');
    } catch (error) {
      toast.error('Failed to duplicate theme');
    }
  };

  const handleSetDefault = async (e) => {
    e.stopPropagation();
    try {
      await themeService.setDefaultTheme(theme.id);
      mutate(['themes']);
      toast.success('Default theme updated');
    } catch (error) {
      toast.error('Failed to set default');
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`Delete "${theme.name}"? This cannot be undone.`)) return;
    
    setIsDeleting(true);
    try {
      await themeService.deleteTheme(theme.id);
      mutate(['themes']);
      toast.success('Theme deleted');
    } catch (error) {
      toast.error('Failed to delete theme');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div 
      className={`theme-card ${isDeleting ? 'deleting' : ''}`}
      onClick={() => navigate(`/themes/${theme.id}`)}
    >
      {/* Color Preview Strip */}
      <div className="color-preview">
        {colorPreview.length > 0 ? (
          colorPreview.map((color, i) => (
            <div 
              key={i} 
              className="color-swatch" 
              style={{ backgroundColor: color }} 
            />
          ))
        ) : (
          <div className="no-colors">No colors defined</div>
        )}
      </div>

      {/* Card Content */}
      <div className="card-content">
        <div className="card-header">
          <h3 className="theme-name">{theme.name}</h3>
          {theme.is_default && (
            <StarIcon className="default-indicator" size={16} />
          )}
        </div>
        
        <p className="description">
          {theme.description || 'No description'}
        </p>
        
        <div className="card-footer">
          <StatusBadge status={theme.status} />
          <span className="token-count">
            {theme.tokens?.length || 0} tokens
          </span>
        </div>
      </div>

      {/* Actions Menu */}
      <DropdownMenu
        trigger={
          <button className="actions-trigger" onClick={e => e.stopPropagation()}>
            <MoreVerticalIcon size={16} />
          </button>
        }
      >
        <DropdownMenu.Item onClick={() => navigate(`/themes/${theme.id}/edit`)}>
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={handleDuplicate}>
          Duplicate
        </DropdownMenu.Item>
        {!theme.is_default && (
          <DropdownMenu.Item onClick={handleSetDefault}>
            Set as Default
          </DropdownMenu.Item>
        )}
        <DropdownMenu.Separator />
        <DropdownMenu.Item danger onClick={handleDelete}>
          Delete
        </DropdownMenu.Item>
      </DropdownMenu>
    </div>
  );
}
```

### Styling
```css
/* src/styles/theme-card.css */
.theme-card {
  position: relative;
  background: white;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}

.theme-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.theme-card.deleting {
  opacity: 0.5;
  pointer-events: none;
}

.color-preview {
  display: flex;
  height: 40px;
}

.color-swatch {
  flex: 1;
}

.no-colors {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.75rem;
}

.card-content {
  padding: 1rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.theme-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.default-indicator {
  color: #f59e0b;
  fill: #f59e0b;
}

.description {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.token-count {
  font-size: 0.75rem;
  color: #94a3b8;
}

.actions-trigger {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem;
  background: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.theme-card:hover .actions-trigger {
  opacity: 1;
}
```

---

## Files Created
- `src/components/themes/ThemeCard.jsx` — Theme card component
- `src/components/ui/StatusBadge.jsx` — Status indicator
- `src/components/ui/DropdownMenu.jsx` — Actions dropdown
- `src/styles/theme-card.css` — Card styles

---

## Tests

### Unit Tests
- [ ] Renders theme name
- [ ] Shows color preview swatches
- [ ] Shows "No colors" when no color tokens
- [ ] Shows status badge
- [ ] Shows default indicator when is_default
- [ ] Actions menu opens on trigger click
- [ ] Card click navigates to detail page
- [ ] Duplicate action works
- [ ] Set default action works
- [ ] Delete action shows confirmation

---

## Time Estimate
2 hours

---

## Notes
The color preview uses the first 5 color tokens to give a visual identity to each theme. Actions menu uses a dropdown to keep the card clean.
