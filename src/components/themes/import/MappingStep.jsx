/**
 * @chunk 2.09 - MappingStep
 * 
 * Review and adjust automatic category mappings for imported tokens.
 * Allows users to override auto-detected categories before import.
 */

import { useState, useMemo } from 'react';
import { Search, ChevronDown, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import Button from '../../ui/Button';
import Select from '../../ui/Select';
import TokenPreview from './TokenPreview';

const CATEGORIES = ['color', 'typography', 'spacing', 'shadow', 'radius', 'grid', 'other'];

const CATEGORY_OPTIONS = CATEGORIES.map(c => ({
  value: c,
  label: c.charAt(0).toUpperCase() + c.slice(1)
}));

export default function MappingStep({ data, onUpdate, onNext, onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set(CATEGORIES));

  /**
   * Group tokens by their mapped category
   */
  const tokensByCategory = useMemo(() => {
    const grouped = {};
    CATEGORIES.forEach(cat => grouped[cat] = []);

    data.parsedTokens.forEach(token => {
      const category = data.mappings[token.path] || token.category;
      if (grouped[category]) {
        grouped[category].push(token);
      } else {
        grouped.other.push(token);
      }
    });

    return grouped;
  }, [data.parsedTokens, data.mappings]);

  /**
   * Filter tokens by search query
   */
  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return tokensByCategory;

    const query = searchQuery.toLowerCase();
    const filtered = {};

    Object.entries(tokensByCategory).forEach(([cat, tokens]) => {
      filtered[cat] = tokens.filter(t =>
        t.path.toLowerCase().includes(query) ||
        t.name.toLowerCase().includes(query)
      );
    });

    return filtered;
  }, [tokensByCategory, searchQuery]);

  /**
   * Update a token's category mapping
   */
  const updateMapping = (path, newCategory) => {
    onUpdate({
      mappings: { ...data.mappings, [path]: newCategory }
    });
  };

  /**
   * Toggle category section expand/collapse
   */
  const toggleCategory = (category) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  /**
   * Get category counts for summary
   */
  const categoryCounts = CATEGORIES.map(cat => ({
    category: cat,
    count: tokensByCategory[cat].length
  }));

  const totalTokens = data.parsedTokens.length;
  const otherCount = tokensByCategory.other.length;

  return (
    <div className="mapping-step">
      {/* Header with search and summary */}
      <div className="mapping-header">
        <div className="mapping-search">
          <Search size={16} className="mapping-search__icon" />
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mapping-search__input"
          />
        </div>

        <div className="category-summary">
          {categoryCounts.map(({ category, count }) => (
            count > 0 && (
              <span
                key={category}
                className={cn('category-badge', `category-badge--${category}`)}
              >
                {category}: {count}
              </span>
            )
          ))}
        </div>
      </div>

      {/* Token count info */}
      <div className="mapping-info">
        <span className="mapping-info__total">
          {totalTokens} token{totalTokens !== 1 ? 's' : ''} detected
        </span>
        {searchQuery && (
          <span className="mapping-info__filtered">
            (showing {Object.values(filteredTokens).flat().length} matching "{searchQuery}")
          </span>
        )}
      </div>

      {/* Category sections */}
      <div className="mapping-list">
        {CATEGORIES.map(category => (
          <CategorySection
            key={category}
            category={category}
            tokens={filteredTokens[category]}
            expanded={expandedCategories.has(category)}
            onToggle={() => toggleCategory(category)}
            onUpdateMapping={updateMapping}
          />
        ))}
      </div>

      {/* Warning for "other" tokens */}
      {otherCount > 0 && (
        <div className="other-warning">
          <AlertTriangle size={16} />
          <span>
            {otherCount} token{otherCount !== 1 ? 's' : ''} categorized as "other".
            Consider reassigning them for better organization.
          </span>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="step-actions">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Continue to Review
        </Button>
      </div>
    </div>
  );
}

/**
 * Collapsible category section with tokens
 */
function CategorySection({ category, tokens, expanded, onToggle, onUpdateMapping }) {
  if (tokens.length === 0) return null;

  return (
    <div className={cn('category-section', { 'category-section--expanded': expanded })}>
      <button
        className="category-header"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <ChevronDown
          className={cn('category-header__chevron', { 'category-header__chevron--collapsed': !expanded })}
          size={16}
        />
        <span className={cn('category-header__name', `category-header__name--${category}`)}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </span>
        <span className="category-header__count">
          {tokens.length} token{tokens.length !== 1 ? 's' : ''}
        </span>
      </button>

      {expanded && (
        <div className="token-list">
          {tokens.map(token => (
            <TokenMappingRow
              key={token.path}
              token={token}
              currentCategory={category}
              onUpdateMapping={onUpdateMapping}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Individual token row with category selector
 */
function TokenMappingRow({ token, currentCategory, onUpdateMapping }) {
  return (
    <div className="token-row">
      <div className="token-row__info">
        <span className="token-row__path" title={token.path}>
          {token.path}
        </span>
        <TokenPreview token={token} />
      </div>
      <Select
        value={currentCategory}
        onChange={(newCat) => onUpdateMapping(token.path, newCat)}
        options={CATEGORY_OPTIONS}
        size="sm"
        className="token-row__select"
      />
    </div>
  );
}

