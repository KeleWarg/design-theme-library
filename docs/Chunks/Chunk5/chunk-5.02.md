# Chunk 5.02 — ThemeSelector (Export)

## Purpose
Multi-select theme picker for export.

---

## Inputs
- Available themes

## Outputs
- Selected theme IDs

---

## Dependencies
- Chunk 5.01 must be complete
- Chunk 1.07 must be complete

---

## Implementation Notes

```jsx
// src/components/export/ThemeSelector.jsx
import { useThemes } from '../../hooks/useThemes';
import { Checkbox } from '../ui';

export default function ThemeSelector({ selected, onChange }) {
  const { data: themes, isLoading } = useThemes();
  
  const toggleTheme = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(t => t !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const selectAll = () => {
    onChange(themes?.map(t => t.id) || []);
  };

  const deselectAll = () => {
    onChange([]);
  };

  if (isLoading) {
    return <div className="selector-loading">Loading themes...</div>;
  }

  return (
    <div className="export-theme-selector">
      <div className="selector-header">
        <h4>Themes</h4>
        <div className="selector-actions">
          <button onClick={selectAll} className="link-button">All</button>
          <button onClick={deselectAll} className="link-button">None</button>
        </div>
      </div>

      <div className="theme-list">
        {themes?.map(theme => (
          <label key={theme.id} className="theme-item">
            <Checkbox
              checked={selected.includes(theme.id)}
              onChange={() => toggleTheme(theme.id)}
            />
            <div className="theme-info">
              <span className="theme-name">{theme.name}</span>
              <span className="token-count">
                {theme.tokens?.length || 0} tokens
              </span>
            </div>
            {theme.is_default && (
              <span className="default-badge">Default</span>
            )}
          </label>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="selection-summary">
          {selected.length} theme{selected.length > 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}
```

---

## Files Created
- `src/components/export/ThemeSelector.jsx` — Theme multi-select

---

## Tests

### Unit Tests
- [ ] Shows all themes
- [ ] Toggle selection works
- [ ] Select all/none works
- [ ] Token counts display
- [ ] Default badge shows

---

## Time Estimate
1.5 hours
