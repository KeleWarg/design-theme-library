/**
 * @chunk 3.09 - TokenLinkingStep
 * 
 * Fourth step of the component creation wizard.
 * Allows users to browse and link design tokens to the component.
 * 
 * Features:
 * - Browse tokens by category (colors, typography, spacing, etc.)
 * - Search tokens by name or CSS variable
 * - Select/deselect tokens to link
 * - Show token previews and CSS variable names
 * - Displays selected tokens as removable pills
 */

import { useState, useMemo, useEffect } from 'react';
import { useThemeContext } from '../../../../contexts/ThemeContext';
import { Input, Select, Button } from '../../../ui';
import { SearchIcon, XIcon, LinkIcon, AlertCircleIcon } from 'lucide-react';
import TokenPreview from '../../../themes/import/TokenPreview';

/**
 * Token category configuration with icons and colors
 */
const TOKEN_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'color', label: 'Colors' },
  { value: 'typography', label: 'Typography' },
  { value: 'spacing', label: 'Spacing' },
  { value: 'shadow', label: 'Shadows' },
  { value: 'radius', label: 'Radius' },
  { value: 'grid', label: 'Grid' },
  { value: 'other', label: 'Other' },
];

/**
 * Get category badge class for styling
 */
function getCategoryClass(category) {
  const categoryMap = {
    color: 'token-category--color',
    typography: 'token-category--typography',
    spacing: 'token-category--spacing',
    shadow: 'token-category--shadow',
    radius: 'token-category--radius',
    grid: 'token-category--grid',
    other: 'token-category--other',
  };
  return categoryMap[category] || 'token-category--other';
}

export default function TokenLinkingStep({ data, onUpdate }) {
  const { tokens, activeTheme, isLoading } = useThemeContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');


  // Group tokens by category for the browser
  const tokensByCategory = useMemo(() => {
    if (!tokens) return {};
    return {
      color: tokens.color || [],
      typography: tokens.typography || [],
      spacing: tokens.spacing || [],
      shadow: tokens.shadow || [],
      radius: tokens.radius || [],
      grid: tokens.grid || [],
      other: tokens.other || [],
    };
  }, [tokens]);

  // Flatten all tokens for searching and filtering
  const allTokens = useMemo(() => {
    return Object.values(tokensByCategory).flat();
  }, [tokensByCategory]);

  // Filter tokens based on search and category
  const filteredTokens = useMemo(() => {
    let result = allTokens;

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter(t => t.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(t =>
        t.name?.toLowerCase().includes(q) ||
        t.path?.toLowerCase().includes(q) ||
        t.css_variable?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allTokens, activeCategory, searchQuery]);

  // Get category counts for display
  const categoryCounts = useMemo(() => {
    const counts = { all: allTokens.length };
    Object.entries(tokensByCategory).forEach(([cat, tokens]) => {
      counts[cat] = tokens.length;
    });
    return counts;
  }, [allTokens, tokensByCategory]);

  /**
   * Toggle token selection
   */
  const toggleToken = (tokenPath) => {
    const linked = data.linked_tokens || [];
    if (linked.includes(tokenPath)) {
      onUpdate({ linked_tokens: linked.filter(p => p !== tokenPath) });
    } else {
      onUpdate({ linked_tokens: [...linked, tokenPath] });
    }
  };

  /**
   * Check if a token is selected
   */
  const isTokenSelected = (tokenPath) => {
    return (data.linked_tokens || []).includes(tokenPath);
  };

  /**
   * Clear all selected tokens
   */
  const clearAllTokens = () => {
    onUpdate({ linked_tokens: [] });
  };

  // Check if no tokens are available
  const hasNoTokens = Object.keys(tokensByCategory).every(
    k => tokensByCategory[k].length === 0
  );

  return (
    <div className="token-linking-step">
      <div className="token-linking-step-header">
        <div className="token-linking-step-header-content">
          <h2 className="token-linking-step-title">Link Design Tokens</h2>
          <p className="token-linking-step-description">
            Select tokens that this component uses. This helps AI generate better code
            and documents token dependencies.
          </p>
        </div>
        {(data.linked_tokens?.length || 0) > 0 && (
          <div className="token-linking-step-count">
            <span className="token-count-number">{data.linked_tokens.length}</span>
            <span className="token-count-label">selected</span>
          </div>
        )}
      </div>

      {/* Warning if no tokens available */}
      {hasNoTokens && !isLoading && (
        <div className="token-linking-warning">
          <AlertCircleIcon size={20} />
          <div className="token-linking-warning-content">
            <strong>No tokens available</strong>
            <p>
              {activeTheme 
                ? `The theme "${activeTheme.name}" has no tokens. Import tokens in the Theme Editor first.`
                : 'No theme selected. Select a theme with tokens to link them to this component.'
              }
            </p>
          </div>
        </div>
      )}

      {/* Token Browser */}
      {!hasNoTokens && (
        <div className="token-browser">
          {/* Browser Header with Search and Filter */}
          <div className="token-browser-header">
            <div className="token-browser-search">
              <SearchIcon size={16} className="token-browser-search-icon" />
              <Input
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="token-browser-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="token-browser-search-clear"
                  onClick={() => setSearchQuery('')}
                >
                  <XIcon size={14} />
                </button>
              )}
            </div>
            <Select
              value={activeCategory}
              onChange={(val) => setActiveCategory(val)}
              options={TOKEN_CATEGORIES.map(cat => ({
                ...cat,
                label: `${cat.label} (${categoryCounts[cat.value] || 0})`
              }))}
              className="token-browser-filter"
            />
          </div>

          {/* Token List */}
          <div className="token-browser-list">
            {filteredTokens.length === 0 ? (
              <div className="token-browser-empty">
                <SearchIcon size={24} />
                <p>No tokens match your search</p>
              </div>
            ) : (
              filteredTokens.map(token => (
                <TokenListItem
                  key={token.id || token.path}
                  token={token}
                  isSelected={isTokenSelected(token.path)}
                  onToggle={() => toggleToken(token.path)}
                />
              ))
            )}
          </div>

          {/* Results count */}
          <div className="token-browser-footer">
            <span className="token-browser-results">
              {filteredTokens.length} of {allTokens.length} tokens
            </span>
          </div>
        </div>
      )}

      {/* Selected Tokens Pills */}
      {(data.linked_tokens?.length || 0) > 0 && (
        <div className="token-linking-selected">
          <div className="token-linking-selected-header">
            <div className="token-linking-selected-title">
              <LinkIcon size={16} />
              <h3>Linked Tokens</h3>
            </div>
            <Button
              variant="ghost"
              size="small"
              onClick={clearAllTokens}
              className="token-linking-clear-btn"
            >
              Clear all
            </Button>
          </div>
          <div className="token-linking-pills">
            {data.linked_tokens.map(path => {
              const token = allTokens.find(t => t.path === path);
              return (
                <span 
                  key={path} 
                  className={`token-pill ${getCategoryClass(token?.category)}`}
                >
                  <span className="token-pill-name">{token?.name || path}</span>
                  <button
                    type="button"
                    className="token-pill-remove"
                    onClick={() => toggleToken(path)}
                    title="Remove token"
                  >
                    <XIcon size={12} />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual token item in the browser list
 */
function TokenListItem({ token, isSelected, onToggle }) {
  return (
    <label className={`token-list-item ${isSelected ? 'token-list-item--selected' : ''}`}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="token-list-item-checkbox"
      />
      <div className="token-list-item-preview">
        <TokenPreview token={token} />
      </div>
      <div className="token-list-item-info">
        <span className="token-list-item-name">{token.name}</span>
        <code className="token-list-item-variable">{token.css_variable}</code>
      </div>
      <span className={`token-list-item-category ${getCategoryClass(token.category)}`}>
        {token.category}
      </span>
    </label>
  );
}


