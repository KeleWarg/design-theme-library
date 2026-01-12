/**
 * @chunk 3.10 - AIGenerationFlow
 * 
 * Token selector component for linking design tokens to AI-generated components.
 * Allows selecting specific tokens to include in the generation prompt.
 */

import { useState, useMemo } from 'react';
import { Button, Input } from '../../ui';
import { 
  Palette, 
  Type, 
  Maximize2, 
  Square, 
  Layers,
  Search,
  Check,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const CATEGORY_ICONS = {
  color: Palette,
  typography: Type,
  spacing: Maximize2,
  radius: Square,
  shadow: Layers,
  grid: Layers,
  other: Layers
};

const CATEGORY_LABELS = {
  color: 'Colors',
  typography: 'Typography',
  spacing: 'Spacing',
  radius: 'Border Radius',
  shadow: 'Shadows',
  grid: 'Grid',
  other: 'Other'
};

/**
 * Token selector component
 * @param {Object} props
 * @param {Array} props.selected - Currently selected token paths (e.g., ["Color/Primary/500", "Spacing/MD"])
 * @param {Function} props.onChange - Selection change handler
 * @param {Object} props.tokens - All tokens grouped by category
 */
export default function TokenSelector({ selected = [], onChange, tokens = {} }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(['color']);

  // Flatten tokens for easier lookup
  const allTokens = useMemo(() => {
    const flat = [];
    Object.entries(tokens).forEach(([category, categoryTokens]) => {
      if (Array.isArray(categoryTokens)) {
        categoryTokens.forEach(token => {
          flat.push({ ...token, category });
        });
      }
    });
    return flat;
  }, [tokens]);

  // Filter tokens by search query
  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return tokens;

    const query = searchQuery.toLowerCase();
    const filtered = {};

    Object.entries(tokens).forEach(([category, categoryTokens]) => {
      if (Array.isArray(categoryTokens)) {
        const matching = categoryTokens.filter(token =>
          token.name?.toLowerCase().includes(query) ||
          token.css_variable?.toLowerCase().includes(query)
        );
        if (matching.length > 0) {
          filtered[category] = matching;
        }
      }
    });

    return filtered;
  }, [tokens, searchQuery]);

  const toggleCategory = (category) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleTokenToggle = (tokenPath) => {
    const isSelected = selected.includes(tokenPath);
    if (isSelected) {
      onChange(selected.filter(path => path !== tokenPath));
    } else {
      onChange([...selected, tokenPath]);
    }
  };

  const handleSelectAll = (category) => {
    const categoryTokens = tokens[category] || [];
    const categoryPaths = categoryTokens.map(t => t.path);
    const allSelected = categoryPaths.every(path => selected.includes(path));

    if (allSelected) {
      onChange(selected.filter(path => !categoryPaths.includes(path)));
    } else {
      onChange([...new Set([...selected, ...categoryPaths])]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  // Get selected tokens info
  const selectedTokens = allTokens.filter(t => selected.includes(t.path));

  return (
    <div className="token-selector">
      <div className="token-selector-header">
        <h3 className="token-selector-title">Link Design Tokens</h3>
        <p className="token-selector-description">
          Select tokens to include in the generation prompt. The AI will use these tokens in the component styling.
        </p>
      </div>

      {/* Search and Clear */}
      <div className="token-selector-toolbar">
        <div className="token-selector-search">
          <Search size={16} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tokens..."
            className="token-selector-search-input"
          />
        </div>
        {selected.length > 0 && (
          <Button variant="ghost" size="small" onClick={handleClearAll}>
            <X size={14} />
            Clear ({selected.length})
          </Button>
        )}
      </div>

      {/* Selected Tokens Preview */}
      {selectedTokens.length > 0 && (
        <div className="token-selector-selected">
          <div className="token-selector-selected-header">
            <span>Selected Tokens ({selectedTokens.length})</span>
          </div>
          <div className="token-selector-selected-list">
            {selectedTokens.map(token => (
              <span key={token.id} className="token-selector-chip">
                <code>{token.css_variable}</code>
                <button
                  type="button"
                  onClick={() => handleTokenToggle(token.path)}
                  className="token-selector-chip-remove"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Token Categories */}
      <div className="token-selector-categories">
        {Object.entries(filteredTokens).map(([category, categoryTokens]) => {
          if (!Array.isArray(categoryTokens) || categoryTokens.length === 0) return null;

          const IconComponent = CATEGORY_ICONS[category] || Layers;
          const isExpanded = expandedCategories.includes(category);
          const categoryPaths = categoryTokens.map(t => t.path);
          const selectedCount = categoryPaths.filter(path => selected.includes(path)).length;
          const allSelected = selectedCount === categoryPaths.length;

          return (
            <div key={category} className="token-selector-category">
              <div
                className="token-selector-category-header"
                role="button"
                tabIndex={0}
                onClick={() => toggleCategory(category)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleCategory(category);
                  }
                }}
              >
                <div className="token-selector-category-left">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <IconComponent size={16} />
                  <span>{CATEGORY_LABELS[category] || category}</span>
                  <span className="token-selector-category-count">
                    {selectedCount > 0 && `${selectedCount}/`}{categoryTokens.length}
                  </span>
                </div>
                <button
                  type="button"
                  className={`token-selector-select-all ${allSelected ? 'token-selector-select-all--active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectAll(category);
                  }}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {isExpanded && (
                <div className="token-selector-category-tokens">
                  {categoryTokens.map(token => {
                    const isSelected = selected.includes(token.path);
                    return (
                      <button
                        key={token.id}
                        type="button"
                        className={`token-selector-token ${isSelected ? 'token-selector-token--selected' : ''}`}
                        onClick={() => handleTokenToggle(token.path)}
                      >
                        <div className="token-selector-token-check">
                          {isSelected && <Check size={12} />}
                        </div>
                        {category === 'color' && (
                          <span
                            className="token-selector-token-color"
                            style={{ backgroundColor: `var(${token.css_variable})` }}
                          />
                        )}
                        <div className="token-selector-token-info">
                          <span className="token-selector-token-name">{token.name}</span>
                          <code className="token-selector-token-var">{token.css_variable}</code>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {Object.keys(filteredTokens).length === 0 && (
          <div className="token-selector-empty">
            <Search size={24} />
            <p>No tokens found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}


