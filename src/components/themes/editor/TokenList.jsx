/**
 * @chunk 2.14 - TokenList
 * 
 * Scrollable list of tokens within the active category.
 * Provides search, selection, add, and delete functionality.
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Type } from 'lucide-react';
import { Button } from '../../ui';
import TokenListItem from './TokenListItem';
import AddTokenModal from './AddTokenModal';

/**
 * List of tokens in the current category with search and CRUD operations
 * @param {Object} props
 * @param {Array} props.tokens - Tokens to display
 * @param {string} props.category - Current category
 * @param {string} props.themeId - Theme ID for navigation links
 * @param {Object} props.selectedToken - Currently selected token
 * @param {Function} props.onSelectToken - Token selection handler
 * @param {Function} props.onAddToken - Add new token handler
 * @param {Function} props.onDeleteToken - Delete token handler
 */
export default function TokenList({ 
  tokens = [], 
  category,
  themeId,
  selectedToken, 
  onSelectToken,
  onAddToken,
  onDeleteToken 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter tokens based on search query
  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return tokens;
    
    const query = searchQuery.toLowerCase();
    return tokens.filter(token =>
      token.name?.toLowerCase().includes(query) ||
      token.path?.toLowerCase().includes(query) ||
      token.css_variable?.toLowerCase().includes(query)
    );
  }, [tokens, searchQuery]);

  // Handle adding a new token
  const handleAddToken = (tokenData) => {
    onAddToken?.({ ...tokenData, category });
    setShowAddModal(false);
  };

  // Format category name for display
  const categoryLabel = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All';

  return (
    <div className="token-list">
      {/* Header with title and add button */}
      <div className="token-list-header">
        <h3 className="token-list-title">
          {categoryLabel} Tokens
        </h3>
        <div className="token-list-actions">
          {category === 'typography' && themeId && (
            <Link 
              to={`/themes/${themeId}/typography`}
              className="btn btn-ghost btn-sm token-list-link"
              title="Manage typefaces"
            >
              <Type size={14} />
              Manage Fonts
            </Link>
          )}
          <Button 
            size="small" 
            variant="ghost"
            onClick={() => setShowAddModal(true)}
            title="Add token"
            aria-label={`Add ${category} token`}
          >
            <Plus size={16} />
            Add
          </Button>
        </div>
      </div>

      {/* Search input */}
      <div className="token-list-search">
        <div className="token-search-input-wrapper">
          <Search size={16} className="token-search-icon" />
          <input
            type="text"
            className="token-search-input"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search tokens"
          />
          {searchQuery && (
            <button
              className="token-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Token list or empty state */}
      {filteredTokens.length === 0 ? (
        <div className="token-list-empty">
          {searchQuery ? (
            <>
              <p>No tokens match "{searchQuery}"</p>
              <Button 
                size="small" 
                variant="ghost"
                onClick={() => setSearchQuery('')}
              >
                Clear search
              </Button>
            </>
          ) : (
            <>
              <p>No {category} tokens yet.</p>
              <Button 
                size="small" 
                variant="secondary"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={14} />
                Add first token
              </Button>
            </>
          )}
        </div>
      ) : (
        <ul className="token-list-items" role="listbox" aria-label={`${categoryLabel} tokens`}>
          {filteredTokens.map(token => (
            <TokenListItem
              key={token.id}
              token={token}
              isSelected={selectedToken?.id === token.id}
              onSelect={() => onSelectToken?.(token)}
              onDelete={() => onDeleteToken?.(token.id)}
            />
          ))}
        </ul>
      )}

      {/* Results count when searching */}
      {searchQuery && filteredTokens.length > 0 && (
        <div className="token-list-footer">
          <span className="token-list-count">
            {filteredTokens.length} of {tokens.length} tokens
          </span>
        </div>
      )}

      {/* Add Token Modal */}
      <AddTokenModal
        open={showAddModal}
        category={category}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddToken}
      />
    </div>
  );
}
