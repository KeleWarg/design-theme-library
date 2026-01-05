/**
 * @chunk 3.16 - TokensTab
 * 
 * Tokens tab for component detail page.
 * Allows managing linked design tokens with explicit Save/Cancel pattern.
 * 
 * Features:
 * - Show linked tokens
 * - Auto-detect tokens used in code
 * - Add/remove token links
 * - Search and filter tokens
 * - Explicit Save/Cancel (no auto-save)
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { Input, Select, Checkbox, Button } from '../../ui';
import TokenPreview from '../../themes/import/TokenPreview';
import { SearchIcon, XIcon, AlertCircleIcon, RotateCcw, Save, LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Token category options
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

export default function TokensTab({ component, onSave }) {
  const { tokens, activeTheme } = useThemeContext();
  const [linkedTokens, setLinkedTokens] = useState(component?.linked_tokens || []);
  const originalTokensRef = useRef(component?.linked_tokens || []);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');


  // Reset when component changes
  useEffect(() => {
    const componentTokens = component?.linked_tokens || [];
    setLinkedTokens(componentTokens);
    originalTokensRef.current = JSON.parse(JSON.stringify(componentTokens));
    setHasChanges(false);
  }, [component?.id]);

  // Track changes
  useEffect(() => {
    const hasChangesNow = JSON.stringify(linkedTokens) !== JSON.stringify(originalTokensRef.current);
    setHasChanges(hasChangesNow);
  }, [linkedTokens]);

  // Flatten all tokens from grouped structure
  const allTokens = useMemo(() => {
    if (!tokens) return [];
    return Object.values(tokens).flat();
  }, [tokens]);

  // Detect tokens used in component code
  const usedInCode = useMemo(() => {
    const used = [];
    const code = component?.code || '';
    
    allTokens.forEach(token => {
      if (token.css_variable && code.includes(token.css_variable)) {
        used.push(token.path);
      }
    });
    
    return used;
  }, [component?.code, allTokens]);

  // Find tokens used in code but not linked
  const unlinkedUsed = useMemo(() => {
    return usedInCode.filter(path => !linkedTokens.includes(path));
  }, [usedInCode, linkedTokens]);

  // Filter tokens based on search and category
  const filteredTokens = useMemo(() => {
    let result = allTokens;
    
    if (activeCategory !== 'all') {
      result = result.filter(t => t.category === activeCategory);
    }
    
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

  const toggleToken = (tokenPath) => {
    if (linkedTokens.includes(tokenPath)) {
      setLinkedTokens(linkedTokens.filter(p => p !== tokenPath));
    } else {
      setLinkedTokens([...linkedTokens, tokenPath]);
    }
  };

  const linkAllDetected = () => {
    setLinkedTokens([...new Set([...linkedTokens, ...usedInCode])]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(linkedTokens);
      originalTokensRef.current = JSON.parse(JSON.stringify(linkedTokens));
      setHasChanges(false);
      toast.success('Tokens saved');
    } catch (error) {
      console.error('Failed to save tokens:', error);
      toast.error('Failed to save tokens');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLinkedTokens(JSON.parse(JSON.stringify(originalTokensRef.current)));
    setHasChanges(false);
    toast.info('Changes cancelled');
  };

  // Check if no tokens are available
  const hasNoTokens = !tokens || Object.keys(tokens).every(
    k => !tokens[k] || tokens[k].length === 0
  );

  return (
    <div className="tokens-tab">
      <div className="tokens-tab-header">
        <div className="tokens-tab-header-content">
          <h3 className="tokens-tab-title">Linked Tokens</h3>
          <p className="tokens-tab-description">
            Design tokens used by this component. Link tokens to document dependencies and improve AI code generation.
          </p>
        </div>
        {linkedTokens.length > 0 && (
          <div className="tokens-tab-count">
            <span className="token-count-number">{linkedTokens.length}</span>
            <span className="token-count-label">linked</span>
          </div>
        )}
      </div>

      {/* Warning if no tokens available */}
      {hasNoTokens && (
        <div className="tokens-tab-warning">
          <AlertCircleIcon size={20} />
          <div className="tokens-tab-warning-content">
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

      {/* Warning for unlinked detected tokens */}
      {!hasNoTokens && unlinkedUsed.length > 0 && (
        <div className="tokens-tab-detected-warning">
          <AlertCircleIcon size={16} />
          <span>
            {unlinkedUsed.length} token(s) detected in code but not linked.
          </span>
          <Button 
            size="small" 
            variant="ghost" 
            onClick={linkAllDetected}
          >
            Link All Detected
          </Button>
        </div>
      )}

      {/* Detected tokens section */}
      {!hasNoTokens && usedInCode.length > 0 && (
        <div className="tokens-tab-detected">
          <h4 className="tokens-tab-detected-title">Detected in Code</h4>
          <div className="tokens-tab-detected-pills">
            {usedInCode.map(path => {
              const token = allTokens.find(t => t.path === path);
              const isLinked = linkedTokens.includes(path);
              return (
                <span 
                  key={path} 
                  className={`token-pill ${isLinked ? 'token-pill--linked' : 'token-pill--unlinked'} ${getCategoryClass(token?.category)}`}
                >
                  <span className="token-pill-name">{token?.name || path}</span>
                  {!isLinked && (
                    <button 
                      type="button"
                      className="token-pill-link-btn"
                      onClick={() => toggleToken(path)}
                      title="Link token"
                    >
                      + Link
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Token Browser */}
      {!hasNoTokens && (
        <div className="token-browser">
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
              options={TOKEN_CATEGORIES}
              className="token-browser-filter"
            />
          </div>

          <div className="token-browser-list">
            {filteredTokens.length === 0 ? (
              <div className="token-browser-empty">
                <SearchIcon size={24} />
                <p>No tokens match your search</p>
              </div>
            ) : (
              filteredTokens.map(token => (
                <label key={token.id || token.path} className={`token-list-item ${linkedTokens.includes(token.path) ? 'token-list-item--selected' : ''}`}>
                  <Checkbox
                    checked={linkedTokens.includes(token.path)}
                    onChange={(checked) => {
                      if (checked) {
                        setLinkedTokens([...linkedTokens, token.path]);
                      } else {
                        setLinkedTokens(linkedTokens.filter(p => p !== token.path));
                      }
                    }}
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
              ))
            )}
          </div>

          <div className="token-browser-footer">
            <span className="token-browser-results">
              {filteredTokens.length} of {allTokens.length} tokens
            </span>
          </div>
        </div>
      )}

      {/* Linked Tokens Pills */}
      {linkedTokens.length > 0 && (
        <div className="tokens-tab-linked">
          <div className="tokens-tab-linked-header">
            <div className="tokens-tab-linked-title">
              <LinkIcon size={16} />
              <h4>Linked Tokens</h4>
            </div>
          </div>
          <div className="tokens-tab-linked-pills">
            {linkedTokens.map(path => {
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

      {/* Save/Cancel bar - shown when there are changes */}
      {hasChanges && (
        <div className="tokens-tab-save-bar">
          <div className="tokens-tab-save-hint">
            You have unsaved changes
          </div>
          <div className="tokens-tab-save-buttons">
            <Button 
              variant="secondary" 
              size="small"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <RotateCcw size={14} />
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="small"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save size={14} />
              {isSaving ? 'Saving...' : 'Save Tokens'}
            </Button>
          </div>
        </div>
      )}

      <style>{`
        .tokens-tab {
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: var(--spacing-lg);
        }

        .tokens-tab-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--spacing-md);
        }

        .tokens-tab-header-content {
          flex: 1;
        }

        .tokens-tab-title {
          margin: 0 0 var(--spacing-sm);
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-foreground);
        }

        .tokens-tab-description {
          margin: 0;
          font-size: var(--font-size-base);
          color: var(--color-muted-foreground);
        }

        .tokens-tab-count {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 60px;
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--color-muted);
          border-radius: var(--radius-md);
        }

        .token-count-number {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-foreground);
          line-height: 1;
        }

        .token-count-label {
          font-size: var(--font-size-xs);
          color: var(--color-muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: var(--spacing-xs);
        }

        /* Warning */
        .tokens-tab-warning {
          display: flex;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--color-warning-light, #fef3c7);
          border: 1px solid var(--color-warning, #f59e0b);
          border-radius: var(--radius-lg);
          color: var(--color-warning-foreground, #92400e);
        }

        .tokens-tab-warning-content {
          flex: 1;
        }

        .tokens-tab-warning-content strong {
          display: block;
          margin-bottom: var(--spacing-xs);
          font-weight: var(--font-weight-semibold);
        }

        .tokens-tab-warning-content p {
          margin: 0;
          font-size: var(--font-size-sm);
        }

        /* Detected Warning */
        .tokens-tab-detected-warning {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--color-warning-light, #fef3c7);
          border: 1px solid var(--color-warning, #f59e0b);
          border-radius: var(--radius-md);
          color: var(--color-warning-foreground, #92400e);
          font-size: var(--font-size-sm);
        }

        .tokens-tab-detected-warning span {
          flex: 1;
        }

        /* Detected Section */
        .tokens-tab-detected {
          padding: var(--spacing-md);
          background: var(--color-muted);
          border-radius: var(--radius-lg);
        }

        .tokens-tab-detected-title {
          margin: 0 0 var(--spacing-sm);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-foreground);
        }

        .tokens-tab-detected-pills {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
        }

        /* Token Browser - reuse styles from TokenLinkingStep */
        .token-browser {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--color-background);
        }

        .token-browser-header {
          display: flex;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--color-muted);
          border-bottom: 1px solid var(--color-border);
        }

        .token-browser-search {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
        }

        .token-browser-search-icon {
          position: absolute;
          left: var(--spacing-sm);
          color: var(--color-muted-foreground);
          pointer-events: none;
          z-index: 1;
        }

        .token-browser-search-input {
          flex: 1;
        }

        .token-browser-search-input .form-input {
          padding-left: calc(var(--spacing-md) + var(--spacing-sm) + 16px);
        }

        .token-browser-search-clear {
          position: absolute;
          right: var(--spacing-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          padding: 0;
          background: none;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--color-muted-foreground);
          cursor: pointer;
          z-index: 1;
        }

        .token-browser-search-clear:hover {
          background: var(--color-muted);
          color: var(--color-foreground);
        }

        .token-browser-filter {
          min-width: 180px;
        }

        .token-browser-list {
          max-height: 400px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .token-browser-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-2xl);
          color: var(--color-muted-foreground);
        }

        .token-browser-empty p {
          margin: 0;
          font-size: var(--font-size-sm);
        }

        .token-list-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          border-bottom: 1px solid var(--color-border);
          cursor: pointer;
          transition: background 0.15s;
        }

        .token-list-item:last-child {
          border-bottom: none;
        }

        .token-list-item:hover {
          background: var(--color-muted);
        }

        .token-list-item--selected {
          background: var(--color-primary-light, #eff6ff);
        }

        .token-list-item--selected:hover {
          background: var(--color-primary-light, #dbeafe);
        }

        .token-list-item-preview {
          flex-shrink: 0;
        }

        .token-list-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .token-list-item-name {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-foreground);
        }

        .token-list-item-variable {
          font-family: var(--font-family-mono);
          font-size: var(--font-size-xs);
          color: var(--color-muted-foreground);
          background: var(--color-muted);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
        }

        .token-list-item-category {
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          background: var(--color-muted);
          color: var(--color-muted-foreground);
        }

        .token-browser-footer {
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--color-muted);
          border-top: 1px solid var(--color-border);
          font-size: var(--font-size-xs);
          color: var(--color-muted-foreground);
        }

        .token-browser-results {
          margin: 0;
        }

        /* Token Pills */
        .token-pill {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--color-muted);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          font-size: var(--font-size-sm);
        }

        .token-pill--linked {
          background: var(--color-primary-light, #eff6ff);
          border-color: var(--color-primary, #3b82f6);
        }

        .token-pill--unlinked {
          opacity: 0.7;
        }

        .token-pill-name {
          color: var(--color-foreground);
        }

        .token-pill-link-btn {
          padding: 0 var(--spacing-xs);
          background: var(--color-primary, #3b82f6);
          color: var(--color-primary-foreground, #ffffff);
          border: none;
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          cursor: pointer;
        }

        .token-pill-link-btn:hover {
          opacity: 0.9;
        }

        .token-pill-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          padding: 0;
          background: none;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--color-muted-foreground);
          cursor: pointer;
          transition: all 0.15s;
        }

        .token-pill-remove:hover {
          background: var(--color-background);
          color: var(--color-foreground);
        }

        /* Linked Tokens Section */
        .tokens-tab-linked {
          padding: var(--spacing-md);
          background: var(--color-muted);
          border-radius: var(--radius-lg);
        }

        .tokens-tab-linked-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-sm);
        }

        .tokens-tab-linked-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .tokens-tab-linked-title h4 {
          margin: 0;
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-foreground);
        }

        .tokens-tab-linked-pills {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
        }

        /* Save Bar */
        .tokens-tab-save-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-md);
          padding: var(--spacing-md) var(--spacing-lg);
          background: var(--color-muted);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          margin-top: var(--spacing-md);
        }

        .tokens-tab-save-hint {
          font-size: var(--font-size-sm);
          color: var(--color-muted-foreground);
        }

        .tokens-tab-save-buttons {
          display: flex;
          gap: var(--spacing-sm);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .tokens-tab-header {
            flex-direction: column;
            gap: var(--spacing-md);
          }

          .token-browser-header {
            flex-direction: column;
          }

          .token-list-item {
            flex-wrap: wrap;
          }

          .token-list-item-category {
            order: -1;
            width: 100%;
          }

          .tokens-tab-save-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .tokens-tab-save-buttons {
            width: 100%;
          }

          .tokens-tab-save-buttons button {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
