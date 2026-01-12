# Chunk 2.05 — ThemeSelector (Header)

## Purpose
Dropdown in app header for switching active theme.

---

## Inputs
- ThemeContext (from chunk 2.04)
- themeService (from chunk 1.07)

## Outputs
- ThemeSelector component (consumed by Header)

---

## Dependencies
- Chunk 2.04 must be complete

---

## Implementation Notes

### Key Considerations
- Show current theme name
- List all published themes + current draft being edited
- Visual indicator for active selection
- Quick access to theme management

### Component Structure

```jsx
// src/components/layout/ThemeSelector.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useThemes } from '../../hooks/useThemes';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/Popover';
import { PaletteIcon, ChevronDownIcon, CheckIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ThemeSelector() {
  const { activeTheme, setActiveTheme, isLoading } = useThemeContext();
  const { data: themes } = useThemes();
  const [open, setOpen] = useState(false);

  // Filter to published + any draft the user might be editing
  const availableThemes = themes?.filter(t => 
    t.status === 'published' || t.id === activeTheme?.id
  ) || [];

  if (isLoading) {
    return (
      <div className="theme-selector-skeleton">
        <div className="skeleton-icon" />
        <div className="skeleton-text" />
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="theme-selector-trigger">
          <PaletteIcon className="trigger-icon" size={18} />
          <span className="trigger-label">
            {activeTheme?.name || 'Select Theme'}
          </span>
          <ChevronDownIcon 
            className={cn('trigger-chevron', { open })} 
            size={16} 
          />
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="theme-selector-content" align="end">
        <div className="theme-list">
          {availableThemes.length === 0 ? (
            <div className="no-themes">
              No themes available
            </div>
          ) : (
            availableThemes.map(theme => (
              <ThemeOption
                key={theme.id}
                theme={theme}
                isActive={theme.id === activeTheme?.id}
                onSelect={() => {
                  setActiveTheme(theme.id);
                  setOpen(false);
                }}
              />
            ))
          )}
        </div>
        
        <div className="theme-selector-footer">
          <Link 
            to="/themes" 
            className="manage-link"
            onClick={() => setOpen(false)}
          >
            Manage Themes
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ThemeOption({ theme, isActive, onSelect }) {
  // Get first 3 color tokens for mini preview
  const previewColors = theme.tokens
    ?.filter(t => t.category === 'color')
    ?.slice(0, 3)
    ?.map(t => t.value?.hex) || [];

  return (
    <button
      className={cn('theme-option', { active: isActive })}
      onClick={onSelect}
    >
      <div className="theme-colors">
        {previewColors.map((color, i) => (
          <div 
            key={i} 
            className="mini-swatch"
            style={{ backgroundColor: color }}
          />
        ))}
        {previewColors.length === 0 && (
          <div className="mini-swatch empty" />
        )}
      </div>
      
      <div className="theme-info">
        <span className="theme-name">{theme.name}</span>
        {theme.is_default && (
          <span className="default-badge">Default</span>
        )}
      </div>
      
      {isActive && <CheckIcon className="check-icon" size={16} />}
    </button>
  );
}
```

### Styling
```css
/* src/styles/theme-selector.css */
.theme-selector-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.theme-selector-trigger:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.trigger-icon {
  color: var(--color-primary, #3b82f6);
}

.trigger-label {
  font-size: 0.875rem;
  font-weight: 500;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trigger-chevron {
  color: #64748b;
  transition: transform 0.2s;
}

.trigger-chevron.open {
  transform: rotate(180deg);
}

.theme-selector-skeleton {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
}

.theme-selector-content {
  width: 280px;
  padding: 0;
}

.theme-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
}

.no-themes {
  padding: 1rem;
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.theme-option:hover {
  background: #f1f5f9;
}

.theme-option.active {
  background: #eff6ff;
}

.theme-colors {
  display: flex;
  gap: 2px;
}

.mini-swatch {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid rgba(0,0,0,0.1);
}

.mini-swatch.empty {
  background: #e2e8f0;
}

.theme-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.theme-name {
  font-size: 0.875rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.default-badge {
  flex-shrink: 0;
  padding: 0.125rem 0.375rem;
  background: #fef3c7;
  color: #92400e;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 4px;
}

.check-icon {
  flex-shrink: 0;
  color: var(--color-primary, #3b82f6);
}

.theme-selector-footer {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.manage-link {
  font-size: 0.8125rem;
  color: var(--color-primary, #3b82f6);
  text-decoration: none;
}

.manage-link:hover {
  text-decoration: underline;
}
```

---

## Files Created
- `src/components/layout/ThemeSelector.jsx` — Theme selector dropdown
- `src/components/ui/Popover.jsx` — Popover component (if not exists)
- `src/styles/theme-selector.css` — Selector styles

---

## Tests

### Unit Tests
- [ ] Shows loading skeleton while loading
- [ ] Shows current theme name
- [ ] Opens popover on click
- [ ] Lists available themes
- [ ] Filters to published themes + active
- [ ] Shows color preview swatches
- [ ] Shows default badge for default theme
- [ ] Selecting theme calls setActiveTheme
- [ ] Active theme has check indicator
- [ ] Closes popover after selection
- [ ] Manage themes link navigates to /themes

---

## Time Estimate
2 hours

---

## Notes
The theme selector is placed in the header for quick access. It shows a mini color preview and includes a link to full theme management. The popover should close when clicking outside or selecting a theme.
