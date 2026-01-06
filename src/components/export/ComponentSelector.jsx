/**
 * @chunk 5.03 - ComponentSelector
 * 
 * Multi-select component picker for export.
 * Shows only published components with category filtering.
 */

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
  { value: 'other', label: 'Other' },
];

export default function ComponentSelector({ selected, onChange }) {
  const { data: components, isLoading, error } = useComponents({ status: 'published' });
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
    return (
      <div className="export-component-selector">
        <div className="selector-loading">Loading components...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="export-component-selector">
        <div className="selector-error">
          Failed to load components: {error.message || 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="export-component-selector">
      <div className="selector-header">
        <h4>Components</h4>
        <Select
          value={filterCategory}
          onChange={(value) => setFilterCategory(value)}
          options={CATEGORIES}
          size="sm"
        />
      </div>

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
                {component.linked_tokens?.length || 0} linked token{(component.linked_tokens?.length || 0) !== 1 ? 's' : ''}
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

      <style>{`
        .export-component-selector {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm, 0.5rem);
        }

        .selector-loading {
          color: var(--color-muted-foreground, #78716C);
          font-size: var(--font-size-sm, 0.875rem);
          padding: var(--spacing-sm, 0.5rem);
        }

        .selector-error {
          color: var(--color-destructive, #dc2626);
          font-size: var(--font-size-sm, 0.875rem);
          padding: var(--spacing-sm, 0.5rem);
          background: var(--color-destructive-light, #fef2f2);
          border-radius: var(--radius-md, 0.375rem);
        }

        .selector-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--spacing-sm, 0.5rem);
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

        .component-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs, 0.25rem);
        }

        .component-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm, 0.5rem);
          padding: var(--spacing-sm, 0.5rem);
          border-radius: var(--radius-md, 0.375rem);
          cursor: pointer;
          transition: background-color var(--transition-fast, 150ms ease);
        }

        .component-item:hover {
          background-color: var(--color-muted, #F5F5F4);
        }

        .component-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: var(--spacing-xs, 0.25rem);
        }

        .component-name {
          font-size: var(--font-size-sm, 0.875rem);
          font-weight: var(--font-weight-medium, 500);
          color: var(--color-foreground, #1C1917);
        }

        .linked-count {
          font-size: var(--font-size-xs, 0.75rem);
          color: var(--color-muted-foreground, #78716C);
        }

        .empty-state {
          padding: var(--spacing-md, 1rem);
          text-align: center;
          color: var(--color-muted-foreground, #78716C);
          font-size: var(--font-size-sm, 0.875rem);
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

