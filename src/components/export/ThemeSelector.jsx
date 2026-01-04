/**
 * @chunk 5.02 - ThemeSelector (Export)
 * 
 * Multi-select theme picker for export.
 */

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
    return (
      <div className="export-theme-selector">
        <div className="selector-loading">Loading themes...</div>
      </div>
    );
  }

  return (
    <div className="export-theme-selector">
      <div className="selector-header">
        <h4>Themes</h4>
        <div className="selector-actions">
          <button 
            onClick={selectAll} 
            className="link-button"
            type="button"
          >
            All
          </button>
          <button 
            onClick={deselectAll} 
            className="link-button"
            type="button"
          >
            None
          </button>
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
                {theme.tokenCount || theme.tokens?.length || 0} tokens
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

      <style>{`
        .export-theme-selector {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm, 0.5rem);
        }

        .selector-loading {
          color: var(--color-muted-foreground, #78716C);
          font-size: var(--font-size-sm, 0.875rem);
          padding: var(--spacing-sm, 0.5rem);
        }

        .selector-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .selector-header h4 {
          margin: 0;
          font-size: var(--font-size-sm, 0.875rem);
          font-weight: var(--font-weight-semibold, 600);
          color: var(--color-foreground, #1C1917);
        }

        .selector-actions {
          display: flex;
          gap: var(--spacing-xs, 0.25rem);
        }

        .link-button {
          background: none;
          border: none;
          padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
          font-size: var(--font-size-xs, 0.75rem);
          color: var(--color-primary, #657E79);
          cursor: pointer;
          text-decoration: underline;
          transition: color var(--transition-fast, 150ms ease);
        }

        .link-button:hover {
          color: var(--color-primary-hover, #526864);
        }

        .link-button:active {
          opacity: 0.7;
        }

        .theme-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs, 0.25rem);
        }

        .theme-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm, 0.5rem);
          padding: var(--spacing-sm, 0.5rem);
          border-radius: var(--radius-md, 0.375rem);
          cursor: pointer;
          transition: background-color var(--transition-fast, 150ms ease);
        }

        .theme-item:hover {
          background-color: var(--color-muted, #F5F5F4);
        }

        .theme-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: var(--spacing-xs, 0.25rem);
        }

        .theme-name {
          font-size: var(--font-size-sm, 0.875rem);
          font-weight: var(--font-weight-medium, 500);
          color: var(--color-foreground, #1C1917);
        }

        .token-count {
          font-size: var(--font-size-xs, 0.75rem);
          color: var(--color-muted-foreground, #78716C);
        }

        .default-badge {
          padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
          background-color: var(--color-primary-light, #eff6ff);
          color: var(--color-primary, #657E79);
          border-radius: var(--radius-sm, 0.25rem);
          font-size: var(--font-size-xs, 0.75rem);
          font-weight: var(--font-weight-medium, 500);
        }

        .selection-summary {
          margin-top: var(--spacing-xs, 0.25rem);
          padding-top: var(--spacing-sm, 0.5rem);
          border-top: 1px solid var(--color-border, #E7E5E4);
          font-size: var(--font-size-xs, 0.75rem);
          color: var(--color-muted-foreground, #78716C);
        }
      `}</style>
    </div>
  );
}

