/**
 * @chunk 2.12 - ThemeEditor Layout
 * 
 * Hybrid theme editor layout:
 * - Category sidebar (left)
 * - Token list (center/main)
 * - Modal panel for editing (opens when token selected)
 * - Preview panel (bottom, collapsible)
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useTheme } from '../hooks/useThemes';
import { useThemeContext } from '../contexts';
import { tokenService } from '../services/tokenService';
import { 
  EditorHeader, 
  CategorySidebar, 
  TokenList, 
  TokenEditorPanel,
  EditorSkeleton 
} from '../components/themes/editor';
import { ThemePreview } from '../components/themes/preview';
import '../styles/theme-editor.css';

/**
 * Theme editor page with token management
 * Uses hybrid layout: 2-column browse + modal for editing
 */
export default function ThemeEditorPage() {
  const { id } = useParams();
  const { data: theme, isLoading, error, refetch } = useTheme(id);
  const { refreshTheme } = useThemeContext();
  
  // UI state
  const [activeCategory, setActiveCategory] = useState('color');
  const [selectedToken, setSelectedToken] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Local tokens state for optimistic updates
  const [tokens, setTokens] = useState([]);

  // Sync tokens from theme data
  useEffect(() => {
    if (theme?.tokens) {
      setTokens(theme.tokens);
    }
  }, [theme?.tokens]);

  // Get tokens for active category
  const categoryTokens = tokens.filter(t => t.category === activeCategory);

  /**
   * Update a token's value
   */
  const handleTokenUpdate = useCallback(async (tokenId, updates) => {
    // Store previous state for rollback
    const previousTokens = tokens;
    const previousSelectedToken = selectedToken;

    // Optimistic update
    setTokens(prev => prev.map(t =>
      t.id === tokenId ? { ...t, ...updates } : t
    ));

    // Update selected token if it's being edited
    if (selectedToken?.id === tokenId) {
      setSelectedToken(prev => ({ ...prev, ...updates }));
    }

    setHasChanges(true);

    try {
      await tokenService.updateToken(tokenId, updates);
      // Refresh ThemeContext to update CSS variables across the app
      await refreshTheme();
      toast.success('Token updated');
    } catch (err) {
      console.error('Failed to update token:', err);
      toast.error('Failed to update token');
      // Revert to previous state immediately (no flicker)
      setTokens(previousTokens);
      setSelectedToken(previousSelectedToken);
    }
  }, [tokens, selectedToken, refreshTheme]);

  /**
   * Add a new token
   */
  const handleAddToken = useCallback(async (tokenData) => {
    const newToken = {
      name: `New ${tokenData.category} token`,
      path: `${tokenData.category}/new-token`,
      category: tokenData.category,
      type: tokenData.category,
      value: tokenData.category === 'color' ? { hex: '#000000' } : '',
      css_variable: `--${tokenData.category}-new-token`,
      theme_id: id
    };

    try {
      const created = await tokenService.createToken(id, newToken);
      setTokens(prev => [...prev, created]);
      setSelectedToken(created);
      setHasChanges(true);
      toast.success('Token created');
    } catch (err) {
      console.error('Failed to create token:', err);
      toast.error('Failed to create token');
    }
  }, [id]);

  /**
   * Delete a token
   */
  const handleDeleteToken = useCallback(async (tokenId) => {
    // Store previous state for rollback
    const previousTokens = tokens;
    const previousSelectedToken = selectedToken;

    // Optimistic update
    setTokens(prev => prev.filter(t => t.id !== tokenId));

    if (selectedToken?.id === tokenId) {
      setSelectedToken(null);
    }

    setHasChanges(true);

    try {
      await tokenService.deleteToken(tokenId);
      toast.success('Token deleted');
    } catch (err) {
      console.error('Failed to delete token:', err);
      toast.error('Failed to delete token');
      // Revert to previous state immediately (no flicker)
      setTokens(previousTokens);
      setSelectedToken(previousSelectedToken);
    }
  }, [tokens, selectedToken]);

  /**
   * Select a token for editing
   */
  const handleSelectToken = useCallback((token) => {
    setSelectedToken(token);
  }, []);

  /**
   * Close the mobile editor panel
   */
  const handleCloseEditor = useCallback(() => {
    setSelectedToken(null);
  }, []);

  /**
   * Change active category
   */
  const handleCategoryChange = useCallback((category) => {
    setActiveCategory(category);
    setSelectedToken(null); // Clear selection when changing category
  }, []);

  /**
   * Save all changes
   */
  const handleSave = useCallback(async () => {
    // In this implementation, changes are saved immediately
    // This handler exists for UI feedback and potential batch operations
    setHasChanges(false);
    toast.success('All changes saved');
  }, []);

  // Loading state
  if (isLoading) {
    return <EditorSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="theme-editor">
        <div className="token-editor-empty">
          <div className="token-editor-empty-content">
            <h3>Error loading theme</h3>
            <p>{error.message || 'Failed to load theme data'}</p>
            <button className="btn btn-primary" onClick={refetch}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Theme not found
  if (!theme) {
    return (
      <div className="theme-editor">
        <div className="token-editor-empty">
          <div className="token-editor-empty-content">
            <h3>Theme not found</h3>
            <p>The requested theme could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-editor">
      <EditorHeader 
        theme={theme}
        hasChanges={hasChanges}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(!showPreview)}
        onSave={handleSave}
      />

      <div className="editor-body">
        <CategorySidebar
          tokens={tokens}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        <div className="editor-main editor-main--hybrid">
          <TokenList
            tokens={categoryTokens}
            category={activeCategory}
            themeId={id}
            selectedToken={selectedToken}
            onSelectToken={handleSelectToken}
            onAddToken={handleAddToken}
            onDeleteToken={handleDeleteToken}
          />
        </div>
      </div>

      {/* Token Editor Modal - shown when token is selected */}
      {selectedToken && (
        <>
          <div 
            className="editor-modal-backdrop"
            onClick={handleCloseEditor}
            aria-hidden="true"
          />
          <TokenEditorPanel
            token={selectedToken}
            category={activeCategory}
            themeId={id}
            onUpdate={(updates) => {
              if (selectedToken) {
                handleTokenUpdate(selectedToken.id, updates);
              }
            }}
            onClose={handleCloseEditor}
          />
        </>
      )}

      {showPreview && (
        <ThemePreview theme={{ ...theme, tokens }} />
      )}
    </div>
  );
}
